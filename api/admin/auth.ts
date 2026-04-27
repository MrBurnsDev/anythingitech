import type { VercelRequest, VercelResponse } from "@vercel/node";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import Database from "better-sqlite3";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "mv_registry.db");
const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_JWT_SECRET;

if (!JWT_SECRET) {
  console.error("Warning: JWT_SECRET not set in environment variables");
}

interface AdminUser {
  id: number;
  username: string;
  password_hash: string;
  display_name: string;
  email: string;
  role: string;
  is_active: number;
}

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
  // Check Authorization header
  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // Check cookie
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

  const db = new Database(DB_PATH, { readonly: false });

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
            logAudit(db, "user", payload.userId, "logout", payload.username);
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
        return res.status(400).json({ error: "Username and password required" });
      }

      // Find user
      const user = db
        .prepare("SELECT * FROM admin_users WHERE username = ? AND is_active = 1")
        .get(username) as AdminUser | undefined;

      if (!user) {
        // Log failed attempt
        logAudit(db, "user", null, "login_failed", username, {
          reason: "user_not_found",
        });
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check password
      const valid = await bcrypt.compare(password, user.password_hash);
      if (!valid) {
        logAudit(db, "user", user.id, "login_failed", username, {
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
      db.prepare(
        "UPDATE admin_users SET last_login_at = CURRENT_TIMESTAMP WHERE id = ?"
      ).run(user.id);

      // Log successful login
      logAudit(db, "user", user.id, "login", username);

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
      const user = db
        .prepare("SELECT id, username, display_name, email, role FROM admin_users WHERE id = ? AND is_active = 1")
        .get(payload.userId) as Omit<AdminUser, "password_hash" | "is_active"> | undefined;

      if (!user) {
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
  } finally {
    db.close();
  }
}
