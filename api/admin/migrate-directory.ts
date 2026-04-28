import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://zrrinbeyiuiydalxiwii.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_JWT_SECRET;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

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
  return null;
}

function normalizeForMatch(str: string | null): string {
  if (!str) return "";
  return str
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]/g, "")
    .trim();
}

interface PublicBusiness {
  id: number;
  name: string;
  slug: string;
  category: string;
  businessType: string;
  subcategory?: string;
  description?: string;
  town: string;
  townSlug: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  coordinates?: { lat: number; lng: number };
  confidence?: number;
  social?: {
    facebook?: string;
    instagram?: string;
    yelp?: string;
    tripadvisor?: string;
  };
}

interface SupabaseBusiness {
  id: number;
  business_name: string;
  slug: string;
  town: string;
  [key: string]: unknown;
}

/**
 * POST /api/admin/migrate-directory
 *
 * Syncs the public directory JSON to Supabase.
 * This establishes Supabase as the single source of truth.
 *
 * Requires admin authentication.
 * Request body: { businesses: PublicBusiness[] }
 */
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
  const token = getTokenFromRequest(req);
  if (!token) {
    return res.status(401).json({ error: "Unauthorized - no token" });
  }
  const user = verifyToken(token);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized - invalid token" });
  }

  // Check service key
  if (!SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: "Server not configured - missing SUPABASE_SERVICE_ROLE_KEY" });
  }

  let businesses: PublicBusiness[] = [];

  // Check if businesses were provided in request body
  if (req.body?.businesses && Array.isArray(req.body.businesses)) {
    businesses = req.body.businesses;
  } else {
    // Read from server filesystem
    try {
      const jsonPath = path.join(process.cwd(), "data", "exports", "businesses.json");
      const jsonContent = fs.readFileSync(jsonPath, "utf-8");
      businesses = JSON.parse(jsonContent);
    } catch (fileError) {
      return res.status(500).json({
        error: "Could not load businesses.json from server",
        details: String(fileError)
      });
    }
  }

  if (!businesses || businesses.length === 0) {
    return res.status(400).json({ error: "No businesses to migrate" });
  }

  const stats = {
    input: businesses.length,
    updated: 0,
    inserted: 0,
    errors: [] as { name: string; error: string }[],
  };

  try {
    // Get existing Supabase records
    const { data: existing, error: fetchError } = await supabase
      .from("businesses")
      .select("id, business_name, slug, town")
      .order("id");

    if (fetchError) {
      return res.status(500).json({ error: "Failed to fetch existing businesses", details: fetchError });
    }

    // Build lookup maps
    const bySlug = new Map<string, SupabaseBusiness>();
    const byNameTown = new Map<string, SupabaseBusiness>();

    for (const b of existing || []) {
      if (b.slug) {
        bySlug.set(b.slug.toLowerCase(), b as SupabaseBusiness);
      }
      const key = `${normalizeForMatch(b.business_name)}|${normalizeForMatch(b.town)}`;
      byNameTown.set(key, b as SupabaseBusiness);
    }

    // Process each public business
    for (const pub of businesses) {
      // Find existing record
      let match = bySlug.get(pub.slug?.toLowerCase());
      if (!match) {
        const key = `${normalizeForMatch(pub.name)}|${normalizeForMatch(pub.town)}`;
        match = byNameTown.get(key);
      }

      const record = {
        business_name: pub.name,
        slug: pub.slug,
        town: pub.town,
        category: pub.category,
        subcategory: pub.subcategory || null,
        short_description: pub.description || null,
        full_address: pub.address || null,
        phone: pub.phone || null,
        email: pub.email || null,
        website: pub.website || null,
        latitude: pub.coordinates?.lat || null,
        longitude: pub.coordinates?.lng || null,
        facebook_url: pub.social?.facebook || null,
        instagram_url: pub.social?.instagram || null,
        yelp_url: pub.social?.yelp || null,
        tripadvisor_url: pub.social?.tripadvisor || null,
        business_status: "active",
        is_duplicate: false,
        needs_manual_review: false,
        confidence_score: pub.confidence || 70,
      };

      if (match) {
        // Update
        const { error } = await supabase
          .from("businesses")
          .update(record)
          .eq("id", match.id);

        if (error) {
          stats.errors.push({ name: pub.name, error: error.message });
        } else {
          stats.updated++;
        }
      } else {
        // Insert
        const { error } = await supabase.from("businesses").insert(record);

        if (error) {
          stats.errors.push({ name: pub.name, error: error.message });
        } else {
          stats.inserted++;
        }
      }
    }

    // Verify test cases
    const testSlugs = [
      "la-choza-vineyard-haven",
      "the-black-dog-tavern-company-vineyard-haven",
      "catboat-coffee-co-vineyard-haven",
      "artcliff-diner-vineyard-haven",
      "mocha-motts-vineyard-haven",
      "bunch-of-grapes-bookstore-vineyard-haven",
    ];

    const verification: { slug: string; found: boolean; id?: number }[] = [];
    for (const slug of testSlugs) {
      const { data } = await supabase
        .from("businesses")
        .select("id, business_name")
        .eq("slug", slug)
        .single();

      verification.push({
        slug,
        found: !!data,
        id: data?.id,
      });
    }

    // Get final count
    const { count } = await supabase
      .from("businesses")
      .select("*", { count: "exact", head: true })
      .eq("is_duplicate", false)
      .eq("business_status", "active");

    return res.status(200).json({
      success: true,
      stats: {
        ...stats,
        finalCount: count,
      },
      verification,
    });
  } catch (error) {
    console.error("Migration error:", error);
    return res.status(500).json({ error: "Migration failed", details: String(error) });
  }
}
