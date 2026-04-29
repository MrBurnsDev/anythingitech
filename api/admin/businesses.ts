import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://zrrinbeyiuiydalxiwii.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_JWT_SECRET;

interface JWTPayload {
  userId: number;
  username: string;
  role: string;
}

// Verify JWT token
function verifyToken(token: string): JWTPayload | null {
  if (!JWT_SECRET) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// Extract token from request
function getTokenFromRequest(req: VercelRequest): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  const cookies = req.headers.cookie;
  if (cookies) {
    const match = cookies.match(/admin_token=([^;]+)/);
    if (match) return match[1];
  }
  return null;
}

// Authenticate request
function authenticate(req: VercelRequest): JWTPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

// Log audit event
async function logAudit(
  entityType: string,
  entityId: number | null,
  action: string,
  performedBy: string,
  changes?: Record<string, unknown>,
  previousValues?: Record<string, unknown>
) {
  await supabase.from("audit_log").insert({
    entity_type: entityType,
    entity_id: entityId,
    action,
    changes: changes || null,
    previous_values: previousValues || null,
    performed_by: performedBy,
  });
}

// Generate slug from name and town
function generateSlug(name: string, town: string): string {
  return (
    name
      .toLowerCase()
      .replace(/['']/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .substring(0, 80) +
    "-" +
    town
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
  );
}

// Normalize and validate slug
function normalizeSlug(slug: string): string {
  return slug
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "")
    .substring(0, 200);
}

function isValidSlug(slug: string): boolean {
  // Must be non-empty, lowercase alphanumeric with hyphens
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length >= 3 && slug.length <= 200;
}

// Create slug redirect record
async function createSlugRedirect(
  businessId: number,
  oldSlug: string,
  newSlug: string,
  createdBy: string
): Promise<void> {
  // First, check if old slug was itself a redirect target - update the chain
  // This prevents A->B, B->C (instead we want A->C, B->C)
  await supabase
    .from("slug_redirects")
    .update({ new_slug: newSlug })
    .eq("new_slug", oldSlug);

  // Check if this old_slug already exists as a redirect
  const { data: existing } = await supabase
    .from("slug_redirects")
    .select("id")
    .eq("old_slug", oldSlug)
    .single();

  if (existing) {
    // Update existing redirect
    await supabase
      .from("slug_redirects")
      .update({ new_slug: newSlug, created_by: createdBy })
      .eq("old_slug", oldSlug);
  } else {
    // Insert new redirect
    await supabase.from("slug_redirects").insert({
      business_id: businessId,
      old_slug: oldSlug,
      new_slug: newSlug,
      created_by: createdBy,
    });
  }
}

// Sanitize input
function sanitize(value: unknown): string | null {
  if (value === null || value === undefined || value === "") return null;
  return String(value).trim();
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Authenticate
  const user = authenticate(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // GET /api/admin/businesses - List businesses or get single by ID, slug, or external_source_id
    if (req.method === "GET") {
      const { id, slug, external_source_id, action } = req.query;

      // GET /api/admin/businesses?action=activity - Fetch recent activity log
      if (action === "activity") {
        const { limit = "10" } = req.query;
        const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));

        const { data: activities, error: activityError } = await supabase
          .from("audit_log")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(limitNum);

        if (activityError) {
          console.error("Activity fetch error:", activityError);
          // If table doesn't exist, return empty array instead of error
          if (activityError.code === "42P01" || activityError.message?.includes("does not exist")) {
            return res.status(200).json({ activities: [], tableNotFound: true });
          }
          return res.status(500).json({ error: "Failed to fetch activity", details: activityError.message });
        }

        // Enrich with business names and slugs
        const enrichedActivities = await Promise.all(
          (activities || []).map(async (activity) => {
            let businessName = null;
            let businessSlug = null;
            let currentBusinessId = null;

            if (activity.entity_type === "business" && activity.entity_id) {
              const { data: business } = await supabase
                .from("businesses")
                .select("id, business_name, slug")
                .eq("id", activity.entity_id)
                .single();
              if (business) {
                currentBusinessId = business.id;
                businessName = business.business_name;
                businessSlug = business.slug;
              }
            }

            // Format action description
            let description = activity.action.replace(/_/g, " ");
            const changes = activity.changes as Record<string, unknown> | null;
            if (activity.action === "create") {
              description = `Created "${businessName || "business"}"`;
            } else if (activity.action === "update" && businessName) {
              const fields = changes ? Object.keys(changes).slice(0, 3).join(", ") : "";
              description = fields ? `Updated ${fields} for "${businessName}"` : `Updated "${businessName}"`;
            } else if (activity.action === "archive") {
              description = `Archived "${businessName || "business"}"`;
            } else if (activity.action === "login") {
              description = "Admin logged in";
            } else if (activity.action === "export") {
              description = `Exported data`;
            }

            return {
              id: activity.id,
              action: activity.action,
              entityType: activity.entity_type,
              entityId: activity.entity_id,
              currentBusinessId,
              businessName,
              businessSlug,
              description,
              performedBy: activity.performed_by,
              createdAt: activity.created_at,
              changes: activity.changes,
              previousValues: activity.previous_values,
            };
          })
        );

        return res.status(200).json({ activities: enrichedActivities });
      }

      // Get single business by external_source_id (best for cross-system imports)
      if (external_source_id) {
        const { data: business, error } = await supabase
          .from("businesses")
          .select("*")
          .eq("external_source_id", external_source_id as string)
          .eq("is_duplicate", false)
          .single();

        if (error || !business) {
          return res.status(404).json({ error: "Business not found", external_source_id });
        }

        return res.status(200).json({ business });
      }

      // Get single business by slug (preferred - consistent across data sources)
      if (slug) {
        let { data: business, error } = await supabase
          .from("businesses")
          .select("*")
          .eq("slug", slug as string)
          .eq("is_duplicate", false)
          .single();

        // If not found, try to resolve through slug_redirects
        if (error || !business) {
          const { data: redirect } = await supabase
            .from("slug_redirects")
            .select("new_slug, business_id")
            .eq("old_slug", slug as string)
            .single();

          if (redirect) {
            // Look up by the new slug
            const { data: redirectedBusiness } = await supabase
              .from("businesses")
              .select("*")
              .eq("slug", redirect.new_slug)
              .eq("is_duplicate", false)
              .single();

            if (redirectedBusiness) {
              return res.status(200).json({
                business: redirectedBusiness,
                redirectedFrom: slug,
              });
            }
          }

          return res.status(404).json({ error: "Business not found", slug });
        }

        return res.status(200).json({ business });
      }

      // Get single business by ID (legacy - may not match between systems)
      if (id) {
        const { data: business, error } = await supabase
          .from("businesses")
          .select("*")
          .eq("id", parseInt(id as string, 10))
          .eq("is_duplicate", false)
          .single();

        if (error || !business) {
          return res.status(404).json({ error: "Business not found", id });
        }

        return res.status(200).json({ business });
      }

      // List businesses with pagination
      const {
        page = "1",
        limit = "50",
        search,
        town,
        category,
        status,
        needs_review,
        sort = "updated_at",
        order = "desc",
      } = req.query;

      const pageNum = Math.max(1, parseInt(page as string, 10));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit as string, 10)));
      const offset = (pageNum - 1) * limitNum;

      // Build query
      let query = supabase
        .from("businesses")
        .select("*", { count: "exact" })
        .eq("is_duplicate", false);

      if (search) {
        query = query.or(
          `business_name.ilike.%${search}%,slug.ilike.%${search}%,website.ilike.%${search}%,phone.ilike.%${search}%`
        );
      }

      if (town && town !== "all") {
        query = query.eq("town", town);
      }

      if (category && category !== "all") {
        query = query.eq("category", category);
      }

      if (status && status !== "all") {
        if (status === "active") {
          query = query.eq("business_status", "active").eq("needs_manual_review", false);
        } else if (status === "inactive") {
          query = query.neq("business_status", "active");
        } else if (status === "needs_review") {
          query = query.eq("needs_manual_review", true);
        }
      }

      if (needs_review === "true") {
        query = query.eq("needs_manual_review", true);
      } else if (needs_review === "false") {
        query = query.eq("needs_manual_review", false);
      }

      // Sort
      const validSorts = [
        "id",
        "business_name",
        "town",
        "category",
        "business_status",
        "updated_at",
        "created_at",
        "confidence_score",
      ];
      const sortCol = validSorts.includes(sort as string) ? (sort as string) : "updated_at";
      const ascending = order === "asc";

      query = query.order(sortCol, { ascending }).range(offset, offset + limitNum - 1);

      const { data: businesses, count, error } = await query;

      if (error) {
        console.error("Query error:", error);
        return res.status(500).json({ error: "Failed to fetch businesses" });
      }

      return res.status(200).json({
        businesses: businesses || [],
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: count || 0,
          totalPages: Math.ceil((count || 0) / limitNum),
        },
      });
    }

    // POST /api/admin/businesses - Create business
    if (req.method === "POST") {
      const data = req.body;

      if (!data.business_name || !data.town) {
        return res.status(400).json({ error: "Business name and town are required" });
      }

      // Generate slug
      const slug = data.slug || generateSlug(data.business_name, data.town);

      // Check for duplicate slug
      const { data: existing } = await supabase
        .from("businesses")
        .select("id")
        .eq("slug", slug)
        .single();

      if (existing) {
        return res.status(400).json({ error: "A business with this slug already exists" });
      }

      // Generate external_source_id if not provided
      const externalSourceId = data.external_source_id || `supabase:${slug}`;

      const { data: newBusiness, error } = await supabase
        .from("businesses")
        .insert({
          business_name: sanitize(data.business_name),
          slug,
          town: sanitize(data.town),
          category: sanitize(data.category),
          subcategory: sanitize(data.subcategory),
          short_description: sanitize(data.short_description),
          full_address: sanitize(data.full_address),
          street_address: sanitize(data.street_address),
          phone: sanitize(data.phone),
          email: sanitize(data.email),
          website: sanitize(data.website),
          facebook_url: sanitize(data.facebook_url),
          instagram_url: sanitize(data.instagram_url),
          yelp_url: sanitize(data.yelp_url),
          tripadvisor_url: sanitize(data.tripadvisor_url),
          business_status: sanitize(data.business_status) || "active",
          confidence_score: data.confidence_score || 50,
          needs_manual_review: data.needs_manual_review || false,
          review_reason: sanitize(data.review_reason),
          notes: sanitize(data.notes),
          latitude: data.latitude || null,
          longitude: data.longitude || null,
          external_source_id: externalSourceId,
          verification_source: sanitize(data.verification_source) || "manual",
        })
        .select("id")
        .single();

      if (error) {
        console.error("Insert error:", error);
        return res.status(500).json({ error: "Failed to create business" });
      }

      await logAudit("business", newBusiness.id, "create", user.username, data);

      return res.status(201).json({
        success: true,
        id: newBusiness.id,
        slug,
      });
    }

    // PUT /api/admin/businesses - Update business (expects id or slug in body)
    if (req.method === "PUT") {
      const data = req.body;
      const id = data.id;
      const lookupSlug = data.lookup_slug || data.slug; // lookup_slug is the current slug to find the record
      const newSlug = data.new_slug; // new_slug is the desired new slug (if changing)

      if (!id && !lookupSlug) {
        return res.status(400).json({ error: "Business ID or slug required" });
      }

      // Get existing business for audit - prefer slug lookup for consistency
      let query = supabase.from("businesses").select("*");
      if (lookupSlug) {
        query = query.eq("slug", lookupSlug);
      } else {
        query = query.eq("id", id);
      }
      const { data: existing, error: fetchError } = await query.single();

      if (fetchError || !existing) {
        return res.status(404).json({ error: "Business not found" });
      }

      // Handle slug change
      let slugToSave = existing.slug;
      let slugChanged = false;

      if (newSlug !== undefined && newSlug !== null && newSlug !== existing.slug) {
        // Normalize the new slug
        const normalizedSlug = normalizeSlug(newSlug);

        // Validate slug format
        if (!isValidSlug(normalizedSlug)) {
          return res.status(400).json({
            error: "Invalid slug format. Use lowercase letters, numbers, and hyphens only. Minimum 3 characters.",
          });
        }

        // Check for empty slug
        if (!normalizedSlug) {
          return res.status(400).json({ error: "Slug cannot be empty" });
        }

        // Check if new slug already exists for another business
        const { data: duplicateSlug } = await supabase
          .from("businesses")
          .select("id, business_name")
          .eq("slug", normalizedSlug)
          .neq("id", existing.id)
          .single();

        if (duplicateSlug) {
          return res.status(400).json({
            error: `Slug "${normalizedSlug}" is already used by "${duplicateSlug.business_name}"`,
          });
        }

        // Check if new slug exists as an old redirect (would create loop)
        const { data: existingRedirect } = await supabase
          .from("slug_redirects")
          .select("old_slug, new_slug")
          .eq("old_slug", normalizedSlug)
          .single();

        if (existingRedirect) {
          return res.status(400).json({
            error: `Slug "${normalizedSlug}" is an old slug that redirects to "${existingRedirect.new_slug}". Choose a different slug.`,
          });
        }

        slugToSave = normalizedSlug;
        slugChanged = true;
      }

      // Build update object
      const updates: Record<string, unknown> = {};
      const fields = [
        "business_name",
        "town",
        "category",
        "subcategory",
        "short_description",
        "full_address",
        "street_address",
        "phone",
        "email",
        "website",
        "facebook_url",
        "instagram_url",
        "yelp_url",
        "tripadvisor_url",
        "business_status",
        "confidence_score",
        "needs_manual_review",
        "review_reason",
        "notes",
        "latitude",
        "longitude",
        "external_source_id",
        "verification_source",
      ];

      for (const field of fields) {
        if (field in data) {
          if (field === "needs_manual_review") {
            updates[field] = !!data[field];
          } else if (field === "confidence_score" || field === "latitude" || field === "longitude") {
            updates[field] = data[field] ?? null;
          } else {
            updates[field] = sanitize(data[field]);
          }
        }
      }

      // Add slug to updates if changed
      if (slugChanged) {
        updates.slug = slugToSave;
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }

      // Use existing.id (Supabase ID) for the update, not the request id
      const { error: updateError } = await supabase
        .from("businesses")
        .update(updates)
        .eq("id", existing.id);

      if (updateError) {
        console.error("Update error:", updateError);
        return res.status(500).json({ error: "Failed to update business" });
      }

      // Create redirect if slug changed
      if (slugChanged) {
        try {
          await createSlugRedirect(existing.id, existing.slug, slugToSave, user.username);
        } catch (redirectError) {
          console.error("Failed to create redirect:", redirectError);
          // Don't fail the update, just log it
        }
      }

      // Log changes using the actual Supabase ID
      const changes: Record<string, unknown> = {};
      const previousValues: Record<string, unknown> = {};

      // Include slug in tracking
      const allFields = [...fields, "slug"];
      for (const field of allFields) {
        const newValue = field === "slug" ? slugToSave : data[field];
        if (newValue !== undefined && newValue !== existing[field]) {
          changes[field] = newValue;
          previousValues[field] = existing[field];
        }
      }

      if (Object.keys(changes).length > 0) {
        await logAudit("business", existing.id, "update", user.username, changes, previousValues);
      }

      return res.status(200).json({
        success: true,
        slug: slugToSave,
        slugChanged,
        previousSlug: slugChanged ? existing.slug : undefined,
      });
    }

    // DELETE /api/admin/businesses - Soft delete (archive)
    if (req.method === "DELETE") {
      const { id } = req.query;

      if (!id) {
        return res.status(400).json({ error: "Business ID required" });
      }

      const businessId = parseInt(id as string, 10);

      // Get existing for audit
      const { data: existing, error: fetchError } = await supabase
        .from("businesses")
        .select("business_name")
        .eq("id", businessId)
        .single();

      if (fetchError || !existing) {
        return res.status(404).json({ error: "Business not found" });
      }

      // Soft delete by marking as duplicate/archived
      const { error: updateError } = await supabase
        .from("businesses")
        .update({
          is_duplicate: true,
          needs_manual_review: true,
          review_reason: "archived_by_admin",
        })
        .eq("id", businessId);

      if (updateError) {
        console.error("Delete error:", updateError);
        return res.status(500).json({ error: "Failed to archive business" });
      }

      await logAudit("business", businessId, "archive", user.username, {
        business_name: existing.business_name,
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Business API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

