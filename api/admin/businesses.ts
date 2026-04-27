import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
import { supabase, Business } from "../lib/supabase";

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
    // GET /api/admin/businesses - List businesses or get single by ID
    if (req.method === "GET") {
      const { id } = req.query;

      // Get single business by ID
      if (id) {
        const { data: business, error } = await supabase
          .from("businesses")
          .select("*")
          .eq("id", parseInt(id as string, 10))
          .eq("is_duplicate", false)
          .single();

        if (error || !business) {
          return res.status(404).json({ error: "Business not found" });
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

    // PUT /api/admin/businesses - Update business (expects id in body)
    if (req.method === "PUT") {
      const data = req.body;
      const id = data.id;

      if (!id) {
        return res.status(400).json({ error: "Business ID required" });
      }

      // Get existing business for audit
      const { data: existing, error: fetchError } = await supabase
        .from("businesses")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError || !existing) {
        return res.status(404).json({ error: "Business not found" });
      }

      // Build update object
      const updates: Record<string, unknown> = {};
      const fields = [
        "business_name",
        "slug",
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

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }

      const { error: updateError } = await supabase
        .from("businesses")
        .update(updates)
        .eq("id", id);

      if (updateError) {
        console.error("Update error:", updateError);
        return res.status(500).json({ error: "Failed to update business" });
      }

      // Log changes
      const changes: Record<string, unknown> = {};
      const previousValues: Record<string, unknown> = {};
      for (const field of fields) {
        if (field in data && data[field] !== existing[field]) {
          changes[field] = data[field];
          previousValues[field] = existing[field];
        }
      }

      if (Object.keys(changes).length > 0) {
        await logAudit("business", id, "update", user.username, changes, previousValues);
      }

      return res.status(200).json({ success: true });
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
