import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(process.cwd(), "data", "mv_registry.db");
const EXPORTS_PATH = path.join(process.cwd(), "data", "exports");
const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_JWT_SECRET;

interface JWTPayload {
  userId: number;
  username: string;
  role: string;
}

interface Business {
  id: number;
  business_name: string;
  slug: string;
  town: string;
  category: string;
  subcategory: string | null;
  short_description: string | null;
  full_address: string | null;
  street_address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  facebook_url: string | null;
  instagram_url: string | null;
  yelp_url: string | null;
  tripadvisor_url: string | null;
  business_status: string;
  latitude: number | null;
  longitude: number | null;
}

function verifyToken(token: string): JWTPayload | null {
  if (!JWT_SECRET) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

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

function authenticate(req: VercelRequest): JWTPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

function logAudit(
  db: Database.Database,
  entityType: string,
  entityId: number | null,
  action: string,
  performedBy: string,
  changes?: Record<string, unknown>
) {
  db.prepare(`
    INSERT INTO audit_log (entity_type, entity_id, action, changes, performed_by)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    entityType,
    entityId,
    action,
    changes ? JSON.stringify(changes) : null,
    performedBy
  );
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Authenticate
  const user = authenticate(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const db = new Database(DB_PATH, { readonly: true });

  try {
    // Get all active, non-duplicate businesses
    const businesses = db
      .prepare(
        `
        SELECT
          id, business_name, slug, town, category, subcategory,
          short_description, full_address, street_address,
          phone, email, website,
          facebook_url, instagram_url, yelp_url, tripadvisor_url,
          business_status, latitude, longitude
        FROM businesses
        WHERE is_duplicate = 0
          AND business_status = 'active'
          AND (needs_manual_review IS NULL OR needs_manual_review = 0)
        ORDER BY business_name ASC
      `
      )
      .all() as Business[];

    // Format for public export
    const publicBusinesses = businesses.map((b) => ({
      id: b.id,
      name: b.business_name,
      slug: b.slug,
      town: b.town,
      category: b.category,
      subcategory: b.subcategory || undefined,
      description: b.short_description || undefined,
      address: b.full_address || b.street_address || undefined,
      phone: b.phone || undefined,
      email: b.email || undefined,
      website: b.website || undefined,
      social: {
        facebook: b.facebook_url || undefined,
        instagram: b.instagram_url || undefined,
        yelp: b.yelp_url || undefined,
        tripadvisor: b.tripadvisor_url || undefined,
      },
      coordinates:
        b.latitude && b.longitude
          ? { lat: b.latitude, lng: b.longitude }
          : undefined,
    }));

    // Remove empty social objects
    publicBusinesses.forEach((b) => {
      if (
        !b.social.facebook &&
        !b.social.instagram &&
        !b.social.yelp &&
        !b.social.tripadvisor
      ) {
        delete (b as Record<string, unknown>).social;
      }
    });

    // Compute town stats
    const townCounts: Record<string, number> = {};
    businesses.forEach((b) => {
      townCounts[b.town] = (townCounts[b.town] || 0) + 1;
    });

    const towns = [
      { name: "Edgartown", slug: "edgartown", region: "down-island" },
      { name: "Oak Bluffs", slug: "oak-bluffs", region: "down-island" },
      { name: "Tisbury", slug: "tisbury", region: "down-island" },
      { name: "West Tisbury", slug: "west-tisbury", region: "up-island" },
      { name: "Chilmark", slug: "chilmark", region: "up-island" },
      { name: "Aquinnah", slug: "aquinnah", region: "up-island" },
    ].map((t) => ({
      ...t,
      businessCount: townCounts[t.name] || 0,
    }));

    // Compute category stats
    const categoryCounts: Record<string, number> = {};
    businesses.forEach((b) => {
      categoryCounts[b.category] = (categoryCounts[b.category] || 0) + 1;
    });

    const categorySlugMap: Record<string, string> = {
      "Restaurants, Food & Beverages": "restaurants",
      "Lodging & Tourism": "lodging",
      "Shopping & Specialty Retail": "shopping",
      "Beauty & Wellness": "health-wellness",
      "Building & Construction": "contractors",
      "Business & Professional Services": "professional-services",
      "Family, Community & Government": "community",
    };

    const businessTypes = Object.entries(categoryCounts)
      .map(([name, count]) => ({
        name,
        slug: categorySlugMap[name] || name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        pluralName: name,
        shortDescription: `${name} on Martha's Vineyard`,
        businessCount: count,
      }))
      .sort((a, b) => b.businessCount - a.businessCount);

    // Ensure exports directory exists
    if (!fs.existsSync(EXPORTS_PATH)) {
      fs.mkdirSync(EXPORTS_PATH, { recursive: true });
    }

    // Write files
    fs.writeFileSync(
      path.join(EXPORTS_PATH, "businesses.json"),
      JSON.stringify(publicBusinesses, null, 2)
    );

    fs.writeFileSync(
      path.join(EXPORTS_PATH, "towns.json"),
      JSON.stringify(towns, null, 2)
    );

    fs.writeFileSync(
      path.join(EXPORTS_PATH, "business-types.json"),
      JSON.stringify(businessTypes, null, 2)
    );

    // Log the export
    logAudit(db, "system", null, "export", user.username, {
      businessCount: businesses.length,
      townCount: towns.length,
      categoryCount: businessTypes.length,
    });

    return res.status(200).json({
      success: true,
      exported: {
        businesses: businesses.length,
        towns: towns.length,
        categories: businessTypes.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Export error:", error);
    return res.status(500).json({ error: "Export failed" });
  } finally {
    db.close();
  }
}
