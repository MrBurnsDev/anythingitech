/**
 * Shared CORS handling for admin (authenticated) API endpoints.
 *
 * The admin UI is served from the same origin as the API, so these endpoints do
 * not need permissive cross-origin access. The previous implementation set
 * `Access-Control-Allow-Origin: req.headers.origin || "*"` together with
 * `Access-Control-Allow-Credentials: true` — reflecting ANY origin while
 * allowing credentials. This replaces that with an explicit allowlist:
 *
 *   - Allow-Origin is set ONLY when the request's Origin is in the allowlist.
 *   - Allow-Credentials: true is sent ONLY alongside an allowed, specific
 *     origin (never with "*", which browsers reject anyway with credentials).
 *   - Disallowed / missing origins get no Allow-Origin header, so a browser
 *     blocks the cross-origin read.
 *
 * CORS is NOT authentication. Every admin endpoint still verifies the JWT
 * server-side on every request, and the admin cookie is HttpOnly + SameSite=
 * Strict. This change is defense-in-depth, not a replacement for either.
 *
 * Returns true if the request was a preflight (OPTIONS) that has been answered
 * and the caller should return immediately.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

/** Same-origin production host(s) + local dev. Extend here if a new admin
 *  origin is ever legitimately needed. */
const ALLOWED_ORIGINS = new Set<string>([
  'https://anythingitechmv.com',
  'https://www.anythingitechmv.com',
  'http://localhost:5173',
  'http://localhost:3000',
]);

export function applyAdminCors(
  req: VercelRequest,
  res: VercelResponse,
  methods = 'GET,POST,OPTIONS',
): boolean {
  const origin = req.headers.origin;

  res.setHeader('Vary', 'Origin');
  if (typeof origin === 'string' && ALLOWED_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
  }
  // No Allow-Origin header is emitted for disallowed/missing origins → the
  // browser blocks the cross-origin response. Same-origin requests are
  // unaffected (they don't rely on CORS).
  res.setHeader('Access-Control-Allow-Methods', methods);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  return false;
}
