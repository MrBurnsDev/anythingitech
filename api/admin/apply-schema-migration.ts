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
 * POST /api/admin/apply-schema-migration
 *
 * Applies schema migrations for external_source_id and verification_source columns.
 * Then populates external_source_id for all existing records.
 *
 * Request body: { action: "add-columns" | "populate" | "both" }
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
  if (!user || user.role !== "admin") {
    return res.status(401).json({ error: "Unauthorized - admin access required" });
  }

  if (!SUPABASE_SERVICE_KEY) {
    return res.status(500).json({ error: "Server not configured - missing SUPABASE_SERVICE_ROLE_KEY" });
  }

  const action = req.body?.action || "both";
  const results: {
    action: string;
    addColumns?: { success: boolean; error?: string };
    populate?: { success: boolean; updated: number; errors: string[] };
    verification?: { totalRecords: number; withExternalId: number; withVerificationSource: number };
  } = { action };

  try {
    // Step 1: Add columns if they don't exist
    if (action === "add-columns" || action === "both") {
      try {
        // Try to add external_source_id column
        const { error: extError } = await supabase.rpc('exec_sql', {
          sql: `
            DO $$
            BEGIN
              IF NOT EXISTS (
                SELECT 1 FROM information_schema.columns
                WHERE table_name = 'businesses' AND column_name = 'external_source_id'
              ) THEN
                ALTER TABLE businesses ADD COLUMN external_source_id TEXT;
              END IF;
            END $$;
          `
        });

        // If RPC doesn't exist, try direct approach via a dummy select
        if (extError) {
          // Check if column exists by trying to select it
          const { error: checkError } = await supabase
            .from("businesses")
            .select("external_source_id")
            .limit(1);

          if (checkError && checkError.message.includes("column")) {
            // Column doesn't exist - we need to add it via Supabase Dashboard
            results.addColumns = {
              success: false,
              error: "Column external_source_id does not exist. Please run this SQL in Supabase Dashboard:\n\nALTER TABLE businesses ADD COLUMN IF NOT EXISTS external_source_id TEXT;\nALTER TABLE businesses ADD COLUMN IF NOT EXISTS verification_source TEXT DEFAULT 'manual';\nCREATE UNIQUE INDEX IF NOT EXISTS idx_businesses_external_source_id ON businesses(external_source_id) WHERE external_source_id IS NOT NULL;"
            };
          } else {
            results.addColumns = { success: true };
          }
        } else {
          results.addColumns = { success: true };
        }
      } catch (e) {
        results.addColumns = { success: false, error: String(e) };
      }
    }

    // Step 2: Populate external_source_id for records that don't have it
    if (action === "populate" || action === "both") {
      // First check if the column exists
      const { data: testData, error: testError } = await supabase
        .from("businesses")
        .select("id, slug, external_source_id")
        .limit(1);

      if (testError && testError.message.includes("external_source_id")) {
        results.populate = {
          success: false,
          updated: 0,
          errors: ["Column external_source_id does not exist. Run add-columns first."]
        };
      } else {
        // Fetch all businesses
        const { data: businesses, error: fetchError } = await supabase
          .from("businesses")
          .select("id, slug, external_source_id, verification_source")
          .order("id");

        if (fetchError) {
          results.populate = {
            success: false,
            updated: 0,
            errors: [fetchError.message]
          };
        } else {
          let updated = 0;
          const errors: string[] = [];

          // Update records that don't have external_source_id
          for (const biz of businesses || []) {
            if (!biz.external_source_id && biz.slug) {
              const externalSourceId = `supabase:${biz.slug}`;

              const { error: updateError } = await supabase
                .from("businesses")
                .update({
                  external_source_id: externalSourceId,
                  verification_source: biz.verification_source || 'legacy'
                })
                .eq("id", biz.id);

              if (updateError) {
                errors.push(`ID ${biz.id}: ${updateError.message}`);
              } else {
                updated++;
              }
            }
          }

          results.populate = {
            success: errors.length === 0,
            updated,
            errors
          };
        }
      }
    }

    // Step 3: Verify the migration
    const { data: verifyData, error: verifyError } = await supabase
      .from("businesses")
      .select("id, external_source_id, verification_source");

    if (!verifyError && verifyData) {
      results.verification = {
        totalRecords: verifyData.length,
        withExternalId: verifyData.filter(b => b.external_source_id).length,
        withVerificationSource: verifyData.filter(b => b.verification_source).length
      };
    }

    return res.status(200).json({
      success: true,
      results
    });
  } catch (error) {
    console.error("Migration error:", error);
    return res.status(500).json({
      error: "Migration failed",
      details: String(error)
    });
  }
}
