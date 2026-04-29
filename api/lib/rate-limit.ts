/**
 * Simple rate limiting for Vercel serverless functions
 * Uses in-memory storage with sliding window algorithm
 *
 * For production with high traffic, consider upgrading to:
 * - Vercel KV (Redis-compatible)
 * - Upstash Redis
 * - Edge Config
 */

import type { VercelRequest, VercelResponse } from "@vercel/node";

interface RateLimitConfig {
  // Maximum requests per window
  maxRequests: number;
  // Window size in seconds
  windowSec: number;
  // Custom identifier function (defaults to IP)
  identifier?: (req: VercelRequest) => string;
}

// In-memory store for rate limiting
// Note: This resets on cold starts in serverless, but provides
// basic protection against rapid-fire scraping within a warm instance
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// Clean up old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of requestCounts.entries()) {
    if (now > value.resetTime) {
      requestCounts.delete(key);
    }
  }
}, 60000); // Clean every minute

/**
 * Get client IP address from Vercel request
 */
function getClientIP(req: VercelRequest): string {
  // Vercel provides the real IP in x-forwarded-for
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string") {
    return forwarded.split(",")[0].trim();
  }
  if (Array.isArray(forwarded)) {
    return forwarded[0];
  }
  // Fallback
  return req.headers["x-real-ip"] as string || "unknown";
}

/**
 * Rate limit middleware for API routes
 * Returns true if the request should be blocked
 */
export function rateLimit(
  req: VercelRequest,
  res: VercelResponse,
  config: RateLimitConfig
): boolean {
  const { maxRequests, windowSec, identifier } = config;

  // Get identifier (IP by default)
  const id = identifier ? identifier(req) : getClientIP(req);
  const key = `ratelimit:${id}`;
  const now = Date.now();
  const windowMs = windowSec * 1000;

  // Get or create rate limit entry
  let entry = requestCounts.get(key);

  if (!entry || now > entry.resetTime) {
    // New window
    entry = { count: 1, resetTime: now + windowMs };
    requestCounts.set(key, entry);
  } else {
    // Increment count in current window
    entry.count++;
  }

  // Calculate remaining requests
  const remaining = Math.max(0, maxRequests - entry.count);
  const resetSeconds = Math.ceil((entry.resetTime - now) / 1000);

  // Set rate limit headers
  res.setHeader("X-RateLimit-Limit", maxRequests.toString());
  res.setHeader("X-RateLimit-Remaining", remaining.toString());
  res.setHeader("X-RateLimit-Reset", resetSeconds.toString());

  // Check if over limit
  if (entry.count > maxRequests) {
    res.setHeader("Retry-After", resetSeconds.toString());
    res.status(429).json({
      error: "Too many requests",
      message: `Rate limit exceeded. Please try again in ${resetSeconds} seconds.`,
      retryAfter: resetSeconds,
    });
    return true; // Request blocked
  }

  return false; // Request allowed
}

/**
 * Default rate limit configuration for public directory API
 * 100 requests per minute per IP
 */
export const PUBLIC_API_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 100,
  windowSec: 60,
};

/**
 * Stricter rate limit for search endpoints
 * 30 requests per minute per IP
 */
export const SEARCH_RATE_LIMIT: RateLimitConfig = {
  maxRequests: 30,
  windowSec: 60,
};
