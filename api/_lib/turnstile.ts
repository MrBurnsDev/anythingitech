/**
 * Cloudflare Turnstile server-side verification.
 *
 * Returns true if the token is valid for the user's IP. Returns false on any
 * verification failure, network error, or missing config.
 *
 * Set CLOUDFLARE_TURNSTILE_SECRET_KEY in env. The site key is exposed to the
 * browser via VITE_CLOUDFLARE_TURNSTILE_SITE_KEY (safe — site keys are public).
 */

const VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export async function verifyTurnstile(token: string | undefined, ip: string | undefined): Promise<{
  ok: boolean;
  error?: string;
}> {
  const secret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY;
  if (!secret) {
    // Fail-open in dev when no secret is configured; fail-closed in prod.
    if (process.env.NODE_ENV === 'production') {
      return { ok: false, error: 'turnstile_not_configured' };
    }
    return { ok: true };
  }
  if (!token) return { ok: false, error: 'missing_token' };

  try {
    const body = new URLSearchParams();
    body.set('secret', secret);
    body.set('response', token);
    if (ip) body.set('remoteip', ip);

    const res = await fetch(VERIFY_URL, {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body,
    });
    if (!res.ok) return { ok: false, error: 'verify_http_error' };
    const data = await res.json() as { success: boolean; 'error-codes'?: string[] };
    if (!data.success) {
      return { ok: false, error: (data['error-codes'] || []).join(',') || 'verify_failed' };
    }
    return { ok: true };
  } catch (err) {
    return { ok: false, error: 'verify_exception' };
  }
}
