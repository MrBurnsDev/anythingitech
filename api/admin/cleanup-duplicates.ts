import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";

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

/**
 * POST /api/admin/cleanup-duplicates
 *
 * Finds and removes duplicate businesses, keeping the one with the lower ID.
 * Creates redirects from old slugs to the canonical slug.
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
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

  try {
    // Find duplicates by business_name + town
    const { data: allBusinesses, error: fetchError } = await supabase
      .from("businesses")
      .select("id, business_name, slug, town, business_status")
      .eq("business_status", "active")
      .order("id");

    if (fetchError) {
      return res.status(500).json({ error: "Failed to fetch businesses", details: fetchError });
    }

    // Group by normalized name + town
    const groups = new Map<string, typeof allBusinesses>();

    for (const b of allBusinesses || []) {
      const key = `${b.business_name?.toLowerCase().trim()}|${b.town?.toLowerCase().trim()}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(b);
    }

    const duplicates: Array<{
      kept: { id: number; slug: string; name: string };
      removed: Array<{ id: number; slug: string }>;
    }> = [];

    const redirectsCreated: Array<{ old_slug: string; new_slug: string }> = [];
    const errors: string[] = [];

    // Process each group with duplicates
    for (const [key, businesses] of groups) {
      if (businesses.length <= 1) continue;

      // Sort by ID, keep the lowest
      businesses.sort((a, b) => a.id - b.id);
      const keep = businesses[0];
      const toRemove = businesses.slice(1);

      duplicates.push({
        kept: { id: keep.id, slug: keep.slug, name: keep.business_name },
        removed: toRemove.map(b => ({ id: b.id, slug: b.slug })),
      });

      // Create redirects and mark as duplicate
      for (const dup of toRemove) {
        // Create redirect from old slug to canonical slug
        if (dup.slug && dup.slug !== keep.slug) {
          const { error: redirectError } = await supabase
            .from("slug_redirects")
            .upsert({
              old_slug: dup.slug,
              new_slug: keep.slug,
              business_id: keep.id,
              created_at: new Date().toISOString(),
            }, { onConflict: "old_slug" });

          if (redirectError) {
            errors.push(`Redirect for ${dup.slug}: ${redirectError.message}`);
          } else {
            redirectsCreated.push({ old_slug: dup.slug, new_slug: keep.slug });
          }
        }

        // Mark duplicate as inactive
        const { error: updateError } = await supabase
          .from("businesses")
          .update({
            is_duplicate: true,
            business_status: "duplicate",
            notes: `Duplicate of ID ${keep.id} (${keep.slug})`,
          })
          .eq("id", dup.id);

        if (updateError) {
          errors.push(`Mark duplicate ${dup.id}: ${updateError.message}`);
        }
      }
    }

    return res.status(200).json({
      success: true,
      summary: {
        duplicateGroupsFound: duplicates.length,
        businessesMarkedDuplicate: duplicates.reduce((sum, d) => sum + d.removed.length, 0),
        redirectsCreated: redirectsCreated.length,
        errors: errors.length,
      },
      duplicates,
      redirectsCreated,
      errors,
    });
  } catch (error) {
    console.error("Cleanup error:", error);
    return res.status(500).json({ error: "Cleanup failed", details: String(error) });
  }
}
