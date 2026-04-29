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

/**
 * GET /api/admin/activity
 *
 * Returns recent activity from audit_log table
 * Query params:
 *   - limit: number of entries (default 10, max 50)
 *   - entity_type: filter by type (business, system, etc.)
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Authenticate
  const user = authenticate(req);
  if (!user) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const { limit = "10", entity_type } = req.query;
    const limitNum = Math.min(50, Math.max(1, parseInt(limit as string, 10)));

    // Build query
    let query = supabase
      .from("audit_log")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limitNum);

    if (entity_type && entity_type !== "all") {
      query = query.eq("entity_type", entity_type);
    }

    const { data: activities, error } = await query;

    if (error) {
      console.error("Activity fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch activity" });
    }

    // Enrich with business names where applicable
    const enrichedActivities = await Promise.all(
      (activities || []).map(async (activity) => {
        let businessName = null;

        if (activity.entity_type === "business" && activity.entity_id) {
          const { data: business } = await supabase
            .from("businesses")
            .select("business_name, slug")
            .eq("id", activity.entity_id)
            .single();

          if (business) {
            businessName = business.business_name;
          }
        }

        // Format the action for display
        let description = formatAction(activity.action, activity.changes, businessName);

        return {
          id: activity.id,
          action: activity.action,
          entityType: activity.entity_type,
          entityId: activity.entity_id,
          businessName,
          description,
          performedBy: activity.performed_by,
          createdAt: activity.created_at,
          changes: activity.changes,
        };
      })
    );

    return res.status(200).json({ activities: enrichedActivities });
  } catch (error) {
    console.error("Activity API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

function formatAction(action: string, changes: Record<string, unknown> | null, businessName: string | null): string {
  const name = businessName || "Unknown business";

  switch (action) {
    case "create":
      return `Created "${name}"`;
    case "update":
      if (changes) {
        const fields = Object.keys(changes).slice(0, 3);
        if (fields.length > 0) {
          return `Updated ${fields.join(", ")} for "${name}"`;
        }
      }
      return `Updated "${name}"`;
    case "archive":
      return `Archived "${name}"`;
    case "login":
      return "Admin logged in";
    case "export":
      return `Exported ${changes?.businesses || "data"}`;
    case "gazette_safe_updates":
      return `Applied ${changes?.success || 0} Gazette updates`;
    case "sync":
      return `Synced ${changes?.total || 0} businesses`;
    case "cleanup":
      return `Cleaned up ${changes?.removed || 0} duplicates`;
    default:
      return action.replace(/_/g, " ");
  }
}
