import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
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
  iat?: number;
  exp?: number;
}

// Verify JWT token and return payload
export function verifyToken(token: string): JWTPayload | null {
  if (!JWT_SECRET) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

// Extract token from Authorization header or cookie
function getTokenFromRequest(req: VercelRequest): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  const cookies = req.headers.cookie;
  if (cookies) {
    const match = cookies.match(/admin_token=([^;]+)/);
    if (match) {
      return match[1];
    }
  }

  return null;
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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (!JWT_SECRET) {
    return res.status(500).json({ error: "Server configuration error" });
  }

  try {
    // POST /api/admin/auth - Login
    if (req.method === "POST") {
      const { username, password, action } = req.body;

      // Handle logout
      if (action === "logout") {
        const token = getTokenFromRequest(req);
        if (token) {
          const payload = verifyToken(token);
          if (payload) {
            await logAudit("user", payload.userId, "logout", payload.username);
          }
        }

        res.setHeader(
          "Set-Cookie",
          "admin_token=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0"
        );
        return res.status(200).json({ success: true });
      }

      // Handle login
      if (!username || !password) {
        console.log("Login attempt - missing credentials:", { username: !!username, password: !!password });
        return res.status(400).json({ error: "Username and password required" });
      }

      console.log("Login attempt for user:", username);

      // Find user
      const { data: user, error } = await supabase
        .from("admin_users")
        .select("*")
        .eq("username", username)
        .eq("is_active", true)
        .single();

      console.log("User query result:", { found: !!user, error: error?.message });

      if (error || !user) {
        await logAudit("user", null, "login_failed", username, {
          reason: "user_not_found",
        });
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check password
      console.log("Checking password for user:", user.username);
      console.log("Hash preview:", user.password_hash?.substring(0, 20));
      const valid = await bcrypt.compare(password, user.password_hash);
      console.log("Password valid:", valid);

      if (!valid) {
        await logAudit("user", user.id, "login_failed", username, {
          reason: "invalid_password",
        });
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Generate JWT
      const token = jwt.sign(
        {
          userId: user.id,
          username: user.username,
          role: user.role,
        },
        JWT_SECRET,
        { expiresIn: "24h" }
      );

      // Update last login
      await supabase
        .from("admin_users")
        .update({ last_login_at: new Date().toISOString() })
        .eq("id", user.id);

      // Log successful login
      await logAudit("user", user.id, "login", username);

      // Set cookie
      res.setHeader(
        "Set-Cookie",
        `admin_token=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=86400`
      );

      return res.status(200).json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.display_name,
          role: user.role,
        },
        token,
      });
    }

    // GET /api/admin/auth - Verify session
    if (req.method === "GET") {
      const token = getTokenFromRequest(req);

      if (!token) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const payload = verifyToken(token);
      if (!payload) {
        return res.status(401).json({ error: "Invalid or expired token" });
      }

      // Get user info
      const { data: user, error } = await supabase
        .from("admin_users")
        .select("id, username, display_name, email, role")
        .eq("id", payload.userId)
        .eq("is_active", true)
        .single();

      if (error || !user) {
        return res.status(401).json({ error: "User not found" });
      }

      return res.status(200).json({
        authenticated: true,
        user: {
          id: user.id,
          username: user.username,
          displayName: user.display_name,
          email: user.email,
          role: user.role,
        },
      });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
