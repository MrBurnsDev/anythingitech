import type { VercelRequest, VercelResponse } from "@vercel/node";
import jwt from "jsonwebtoken";
import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

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
  return null;
}

function authenticate(req: VercelRequest): JWTPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

function normalizeWebsiteToHttps(url: string | null): string | null {
  if (!url) return null;
  let normalized = url.trim();
  normalized = normalized.replace(/^http:\/\//, "https://");
  normalized = normalized.replace(/\/+$/, "");
  if (!normalized.startsWith("https://")) {
    normalized = "https://" + normalized;
  }
  return normalized;
}

function extractZipFromAddress(address: string | null): string | null {
  if (!address) return null;
  const match = address.match(/MA\s*(\d{5})/);
  return match ? match[1] : null;
}

/**
 * POST /api/admin/apply-gazette-updates
 *
 * Applies safe updates from Gazette import.
 * Requires admin authentication.
 *
 * Body: { updates: Array<{ id, updates, changes }> }
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Authorization,Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Authenticate
  const user = authenticate(req);
  if (!user || user.role !== "admin") {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { updates } = req.body as { updates: Array<{ id: number; updates: Record<string, unknown>; changes: string[] }> };

  if (!updates || !Array.isArray(updates)) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  const results = {
    success: 0,
    failed: 0,
    errors: [] as string[],
  };

  // Apply each update
  for (const update of updates) {
    const { error } = await supabase
      .from("businesses")
      .update(update.updates)
      .eq("id", update.id);

    if (error) {
      results.failed++;
      results.errors.push(`ID ${update.id}: ${error.message}`);
    } else {
      results.success++;
    }
  }

  // Log audit
  await supabase.from("audit_log").insert({
    entity_type: "business",
    entity_id: null,
    action: "gazette_safe_updates",
    changes: { total: updates.length, success: results.success, failed: results.failed },
    performed_by: user.username,
  });

  return res.status(200).json({
    message: `Applied ${results.success} updates, ${results.failed} failed`,
    ...results,
  });
}
