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

async function logAudit(
  entityType: string,
  entityId: number | null,
  action: string,
  performedBy: string,
  changes?: Record<string, unknown>
) {
  await supabase.from("audit_log").insert({
    entity_type: entityType,
    entity_id: entityId,
    action,
    changes: changes || null,
    performed_by: performedBy,
  });
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

  try {
    // Get all active, non-duplicate businesses
    const { data: businesses, error } = await supabase
      .from("businesses")
      .select("*")
      .eq("is_duplicate", false)
      .eq("business_status", "active")
      .eq("needs_manual_review", false)
      .order("business_name", { ascending: true });

    if (error) {
      console.error("Export query error:", error);
      return res.status(500).json({ error: "Failed to fetch businesses" });
    }

    // Compute town stats
    const townCounts: Record<string, number> = {};
    businesses?.forEach((b) => {
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
    businesses?.forEach((b) => {
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

    // Log the export
    await logAudit("system", null, "export", user.username, {
      businessCount: businesses?.length || 0,
      townCount: towns.length,
      categoryCount: businessTypes.length,
    });

    // Return the data (in production, you'd write to files or a CDN)
    return res.status(200).json({
      success: true,
      exported: {
        businesses: businesses?.length || 0,
        towns: towns.length,
        categories: businessTypes.length,
      },
      data: {
        businesses: businesses?.map((b) => ({
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
        })),
        towns,
        businessTypes,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Export error:", error);
    return res.status(500).json({ error: "Export failed" });
  }
}
