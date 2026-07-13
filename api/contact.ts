/**
 * Contact-form intake with invisible spam protection.
 *
 * Order of checks (each returns generic success to avoid leaking signal):
 *   1. Honeypot field empty
 *   2. Time-on-page >= 4 seconds
 *   3. Cloudflare Turnstile token verified
 *   4. Server-side validation (name, email, message, town, project_type, phone)
 *   5. Rate limits (IP per hour, email per 10 min)
 *   6. Spam score < 60
 *   7. Send email + log "sent"
 *
 * Bot-detected paths (1, 2, 6) return HTTP 200 with the same success payload
 * as the real path so bots cannot learn they were blocked.
 *
 * Required env:
 *   RESEND_API_KEY
 *   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
 *   CLOUDFLARE_TURNSTILE_SECRET_KEY
 *   CONTACT_IP_HASH_SALT      (any random string; used for IP hashing only)
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { verifyTurnstile } from './lib/turnstile.js';
import { validateContact, spamScore, type CleanContact } from './lib/contact-validation.js';
import { checkRateLimits, recordAttempt, hashIp, clientIp } from './lib/contact-rate-limit.js';

const SUCCESS_RESPONSE = { success: true };
const MIN_TIME_ON_PAGE_MS = 4000;

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const ipHash = hashIp(clientIp(req));
  const body = req.body || {};
  const honeypot   = typeof body.company_website === 'string' ? body.company_website.trim() : '';
  const formLoadAt = typeof body.form_loaded_at === 'number' ? body.form_loaded_at : 0;
  const turnstile  = typeof body.turnstile_token === 'string' ? body.turnstile_token : '';

  // ---- 1. Honeypot ---------------------------------------------------------
  if (honeypot.length > 0) {
    await recordAttempt({ ipHash, email: null, outcome: 'spam_blocked', reason: 'honeypot' });
    return res.status(200).json(SUCCESS_RESPONSE); // silent success for bots
  }

  // ---- 2. Time-to-submit ---------------------------------------------------
  const elapsed = Date.now() - formLoadAt;
  if (!formLoadAt || elapsed < MIN_TIME_ON_PAGE_MS) {
    await recordAttempt({ ipHash, email: null, outcome: 'spam_blocked', reason: 'too_fast' });
    return res.status(200).json(SUCCESS_RESPONSE); // silent success for bots
  }

  // ---- 3. Turnstile --------------------------------------------------------
  const turn = await verifyTurnstile(turnstile, clientIp(req));
  if (!turn.ok) {
    await recordAttempt({ ipHash, email: null, outcome: 'turnstile_failed', reason: turn.error });
    return res.status(400).json({ error: 'turnstile_failed' });
  }

  // ---- 4. Validation -------------------------------------------------------
  const v = validateContact(body);
  if (!v.ok) {
    // Use 'errors' in v guard for portable narrowing across TS/Vercel builds
    const errs = 'errors' in v ? v.errors : [];
    await recordAttempt({
      ipHash,
      email: typeof body.email === 'string' ? body.email.toLowerCase() : null,
      outcome: 'validation_failed',
      reason: errs.slice(0, 3).join(','),
    });
    return res.status(400).json({ error: 'validation_failed' });
  }
  const clean = v.clean;

  // ---- 5. Rate limits ------------------------------------------------------
  const rl = await checkRateLimits({ ipHash, email: clean.email });
  if (!rl.ok) {
    const reason = 'reason' in rl ? rl.reason : undefined;
    await recordAttempt({ ipHash, email: clean.email, outcome: 'rate_limited', reason });
    // Real-but-rate-limited users get a real message
    return res.status(429).json({ error: 'rate_limited' });
  }

  // ---- 6. Spam score -------------------------------------------------------
  const score = spamScore({
    clean,
    honeypotFilled: false,
    tooFast: false,
    townInvalid: false,
  });
  if (score.score >= 60) {
    await recordAttempt({
      ipHash,
      email: clean.email,
      outcome: 'spam_blocked',
      reason: score.reasons.join(','),
      spamScore: score.score,
    });
    return res.status(200).json(SUCCESS_RESPONSE); // silent success
  }

  // ---- 7. Send -------------------------------------------------------------
  try {
    const { error } = await resend.emails.send({
      from: 'Anything Itech MV <contact@anythingitechmv.com>',
      to: 'louis@anythingitechmv.com',
      replyTo: clean.email,
      subject: `New Inquiry from ${clean.name} - ${clean.project_type}`,
      html: renderHtml(clean, score.score),
      text: renderText(clean, score.score),
    });

    if (error) {
      console.error('Resend error:', error);
      await recordAttempt({ ipHash, email: clean.email, outcome: 'validation_failed', reason: 'email_send_failed' });
      return res.status(500).json({ error: 'send_failed' });
    }

    await recordAttempt({ ipHash, email: clean.email, outcome: 'sent', spamScore: score.score });
    return res.status(200).json(SUCCESS_RESPONSE);
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'internal_error' });
  }
}

// ----------------------------------------------------------------------------
// Email bodies
// ----------------------------------------------------------------------------

function renderHtml(c: CleanContact, score: number) {
  const esc = (s: string) =>
    s.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]!));
  return `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${esc(c.name)}</p>
    <p><strong>Email:</strong> ${esc(c.email)}</p>
    <p><strong>Phone:</strong> ${c.phone ? esc(c.phone) : 'Not provided'}</p>
    <p><strong>Town:</strong> ${c.town ? esc(c.town) : 'Not provided'}</p>
    <p><strong>Project Type:</strong> ${esc(c.project_type)}</p>
    <h3>Message:</h3>
    <p>${esc(c.message).replace(/\n/g, '<br>')}</p>
    <hr>
    <p style="color:#666;font-size:12px;">
      Submitted via anythingitechmv.com contact form. Spam score: ${score}/100.
    </p>
  `;
}

function renderText(c: CleanContact, score: number) {
  return [
    'New Contact Form Submission',
    '',
    `Name: ${c.name}`,
    `Email: ${c.email}`,
    `Phone: ${c.phone || 'Not provided'}`,
    `Town: ${c.town || 'Not provided'}`,
    `Project Type: ${c.project_type}`,
    '',
    'Message:',
    c.message,
    '',
    '---',
    `Submitted via anythingitechmv.com contact form. Spam score: ${score}/100.`,
  ].join('\n');
}
