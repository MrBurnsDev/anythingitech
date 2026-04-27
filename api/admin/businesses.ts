import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "mv_registry.db");
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
function logAudit(
  db: Database.Database,
  entityType: string,
  entityId: number | null,
  action: string,
  performedBy: string,
  changes?: Record<string, unknown>,
  previousValues?: Record<string, unknown>
) {
  db.prepare(`
    INSERT INTO audit_log (entity_type, entity_id, action, changes, previous_values, performed_by)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(
    entityType,
    entityId,
    action,
    changes ? JSON.stringify(changes) : null,
    previousValues ? JSON.stringify(previousValues) : null,
    performedBy
  );
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

  const db = new Database(DB_PATH, { readonly: false });

  try {
    // GET /api/admin/businesses - List businesses or get single by ID
    if (req.method === "GET") {
      const { id } = req.query;

      // Get single business by ID
      if (id) {
        const business = db
          .prepare(
            `SELECT * FROM businesses WHERE id = ? AND is_duplicate = 0`
          )
          .get(parseInt(id as string, 10));

        if (!business) {
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

      // Build WHERE clause
      const conditions: string[] = ["is_duplicate = 0"];
      const params: (string | number)[] = [];

      if (search) {
        conditions.push(
          "(business_name LIKE ? OR slug LIKE ? OR website LIKE ? OR phone LIKE ?)"
        );
        const searchPattern = `%${search}%`;
        params.push(searchPattern, searchPattern, searchPattern, searchPattern);
      }

      if (town && town !== "all") {
        conditions.push("town = ?");
        params.push(town as string);
      }

      if (category && category !== "all") {
        conditions.push("category = ?");
        params.push(category as string);
      }

      if (status && status !== "all") {
        if (status === "active") {
          conditions.push("business_status = 'active'");
          conditions.push("(needs_manual_review IS NULL OR needs_manual_review = 0)");
        } else if (status === "inactive") {
          conditions.push("business_status != 'active'");
        } else if (status === "needs_review") {
          conditions.push("needs_manual_review = 1");
        }
      }

      if (needs_review === "true") {
        conditions.push("needs_manual_review = 1");
      } else if (needs_review === "false") {
        conditions.push("(needs_manual_review IS NULL OR needs_manual_review = 0)");
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      // Validate sort column
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
      const sortCol = validSorts.includes(sort as string) ? sort : "updated_at";
      const sortOrder = order === "asc" ? "ASC" : "DESC";

      // Get total count
      const countResult = db
        .prepare(`SELECT COUNT(*) as count FROM businesses ${whereClause}`)
        .get(...params) as { count: number };

      // Get businesses
      const businesses = db
        .prepare(
          `
          SELECT
            id, business_name, slug, town, category, subcategory,
            short_description, full_address, phone, email, website,
            business_status, confidence_score, needs_manual_review, review_reason,
            notes, created_at, updated_at,
            facebook_url, instagram_url, yelp_url, tripadvisor_url,
            latitude, longitude
          FROM businesses
          ${whereClause}
          ORDER BY ${sortCol} ${sortOrder}
          LIMIT ? OFFSET ?
        `
        )
        .all(...params, limitNum, offset);

      return res.status(200).json({
        businesses,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: countResult.count,
          totalPages: Math.ceil(countResult.count / limitNum),
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
      const existing = db
        .prepare("SELECT id FROM businesses WHERE slug = ?")
        .get(slug);
      if (existing) {
        return res.status(400).json({ error: "A business with this slug already exists" });
      }

      const result = db.prepare(`
        INSERT INTO businesses (
          business_name, slug, town, category, subcategory,
          short_description, full_address, street_address,
          phone, email, website,
          facebook_url, instagram_url, yelp_url, tripadvisor_url,
          business_status, confidence_score, needs_manual_review, review_reason,
          notes, latitude, longitude,
          created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(
        sanitize(data.business_name),
        slug,
        sanitize(data.town),
        sanitize(data.category),
        sanitize(data.subcategory),
        sanitize(data.short_description),
        sanitize(data.full_address),
        sanitize(data.street_address),
        sanitize(data.phone),
        sanitize(data.email),
        sanitize(data.website),
        sanitize(data.facebook_url),
        sanitize(data.instagram_url),
        sanitize(data.yelp_url),
        sanitize(data.tripadvisor_url),
        sanitize(data.business_status) || "active",
        data.confidence_score || 50,
        data.needs_manual_review ? 1 : 0,
        sanitize(data.review_reason),
        sanitize(data.notes),
        data.latitude || null,
        data.longitude || null
      );

      logAudit(db, "business", result.lastInsertRowid as number, "create", user.username, data);

      return res.status(201).json({
        success: true,
        id: result.lastInsertRowid,
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
      const existing = db
        .prepare("SELECT * FROM businesses WHERE id = ?")
        .get(id) as Record<string, unknown> | undefined;

      if (!existing) {
        return res.status(404).json({ error: "Business not found" });
      }

      // Build update query
      const updates: string[] = [];
      const values: (string | number | null)[] = [];

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
          updates.push(`${field} = ?`);
          if (field === "needs_manual_review") {
            values.push(data[field] ? 1 : 0);
          } else if (field === "confidence_score" || field === "latitude" || field === "longitude") {
            values.push(data[field] ?? null);
          } else {
            values.push(sanitize(data[field]));
          }
        }
      }

      if (updates.length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }

      updates.push("updated_at = CURRENT_TIMESTAMP");
      values.push(id);

      db.prepare(`UPDATE businesses SET ${updates.join(", ")} WHERE id = ?`).run(
        ...values
      );

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
        logAudit(db, "business", id, "update", user.username, changes, previousValues);
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
      const existing = db
        .prepare("SELECT business_name FROM businesses WHERE id = ?")
        .get(businessId) as { business_name: string } | undefined;

      if (!existing) {
        return res.status(404).json({ error: "Business not found" });
      }

      // Soft delete by marking as duplicate/archived
      db.prepare(`
        UPDATE businesses
        SET is_duplicate = 1,
            needs_manual_review = 1,
            review_reason = 'archived_by_admin',
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(businessId);

      logAudit(db, "business", businessId, "archive", user.username, {
        business_name: existing.business_name,
      });

      return res.status(200).json({ success: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Business API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  } finally {
    db.close();
  }
}
