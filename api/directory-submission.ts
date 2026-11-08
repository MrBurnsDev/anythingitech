/**
 * Business-directory submission intake with invisible spam protection.
 *
 * Mirrors the contact-form hardening (api/contact.ts). Order of checks:
 *   1. Honeypot field empty        -> silent success (bot can't learn)
 *   2. Time-on-page >= 4 seconds   -> silent success
 *   3. Cloudflare Turnstile token verified server-side
 *   4. Server-side validation (lengths, email, URL, town/category allowlists)
 *   5. Rate limits, scoped to source='directory_submission' (independent of
 *      the contact form's quota)
 *   6. Send email to admin (ALL fields HTML-escaped) + log "sent"
 *
 * Workflow is UNCHANGED: email-only, manual admin review. Nothing is written to
 * the public database — a submission can never auto-publish a listing.
 *
 * Required env (same as contact): RESEND_API_KEY, SUPABASE_URL,
 * SUPABASE_SERVICE_ROLE_KEY, CLOUDFLARE_TURNSTILE_SECRET_KEY, CONTACT_IP_HASH_SALT
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';
import { verifyTurnstile } from './_lib/turnstile.js';
import {
  validateDirectorySubmission,
  type CleanDirectory,
} from './_lib/directory-submission-validation.js';
import {
  checkRateLimits,
  recordAttempt,
  hashIp,
  clientIp,
  FORM_SOURCES,
} from './_lib/contact-rate-limit.js';

const SOURCE = FORM_SOURCES.directorySubmission;
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
    await recordAttempt({ source: SOURCE, ipHash, email: null, outcome: 'spam_blocked', reason: 'honeypot' });
    return res.status(200).json(SUCCESS_RESPONSE); // silent success for bots
  }

  // ---- 2. Time-to-submit ---------------------------------------------------
  const elapsed = Date.now() - formLoadAt;
  if (!formLoadAt || elapsed < MIN_TIME_ON_PAGE_MS) {
    await recordAttempt({ source: SOURCE, ipHash, email: null, outcome: 'spam_blocked', reason: 'too_fast' });
    return res.status(200).json(SUCCESS_RESPONSE); // silent success for bots
  }

  // ---- 3. Turnstile --------------------------------------------------------
  // verifyTurnstile rejects missing / invalid / expired / already-redeemed
  // tokens (Turnstile tokens are single-use, ~300s TTL).
  const turn = await verifyTurnstile(turnstile, clientIp(req));
  if (!turn.ok) {
    await recordAttempt({ source: SOURCE, ipHash, email: null, outcome: 'turnstile_failed', reason: turn.error });
    return res.status(400).json({ error: 'turnstile_failed' });
  }

  // ---- 4. Validation -------------------------------------------------------
  const v = validateDirectorySubmission(body);
  if (!v.ok) {
    const errs = 'errors' in v ? v.errors : [];
    await recordAttempt({
      source: SOURCE,
      ipHash,
      email: typeof body.contact_email === 'string' ? body.contact_email.toLowerCase() : null,
      outcome: 'validation_failed',
      reason: errs.slice(0, 3).join(','),
    });
    return res.status(400).json({ error: 'validation_failed' });
  }
  const clean = v.clean;

  // ---- 5. Rate limits (scoped to this form's source) -----------------------
  const rl = await checkRateLimits({ source: SOURCE, ipHash, email: clean.contact_email });
  if (!rl.ok) {
    const reason = 'reason' in rl ? rl.reason : undefined;
    await recordAttempt({ source: SOURCE, ipHash, email: clean.contact_email, outcome: 'rate_limited', reason });
    return res.status(429).json({ error: 'rate_limited' });
  }

  // ---- 6. Send (manual-review workflow; no DB write) -----------------------
  try {
    const { error } = await resend.emails.send({
      from: "Martha's Vineyard IT <directory@anythingitechmv.com>",
      to: 'louis@anythingitechmv.com',
      replyTo: clean.contact_email,
      subject: `Directory Submission: ${clean.business_name} (${clean.town})`,
      html: renderHtml(clean),
      text: renderText(clean),
    });

    if (error) {
      console.error('Resend error (directory submission):', error);
      await recordAttempt({ source: SOURCE, ipHash, email: clean.contact_email, outcome: 'validation_failed', reason: 'email_send_failed' });
      return res.status(500).json({ error: 'send_failed' });
    }

    await recordAttempt({ source: SOURCE, ipHash, email: clean.contact_email, outcome: 'sent' });
    return res.status(200).json(SUCCESS_RESPONSE);
  } catch (err) {
    console.error('Server error (directory submission):', err);
    return res.status(500).json({ error: 'internal_error' });
  }
}

// ----------------------------------------------------------------------------
// Email bodies — EVERY user-controlled value is HTML-escaped (incl. attributes
// and the mailto: link) before interpolation.
// ----------------------------------------------------------------------------

/** HTML-escape text content. */
function esc(s: string): string {
  return s.replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]!));
}

/**
 * Escape a value for use inside an href attribute. We encode the same HTML
 * metacharacters AND percent-encode characters that could break out of the
 * attribute or inject a new URL scheme (quotes, whitespace, control chars).
 * contact_email has already passed EMAIL_RE so this is defence-in-depth.
 */
function escAttr(s: string): string {
  return encodeURI(s).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]!));
}

function row(label: string, value: string): string {
  return `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd; font-weight: bold; width: 150px;">${esc(label)}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${value}</td>
    </tr>`;
}

function renderHtml(c: CleanDirectory): string {
  const na = 'Not provided';
  const emailCell = c.email ? esc(c.email) : na;
  const websiteCell = c.website
    ? `<a href="${escAttr(c.website)}">${esc(c.website)}</a>`
    : na;
  const contactEmailCell = `<a href="mailto:${escAttr(c.contact_email)}">${esc(c.contact_email)}</a>`;

  return `
    <h2>New Directory Submission</h2>
    <p>A new business has been submitted for review.</p>

    <h3>Business Information</h3>
    <table style="border-collapse: collapse; width: 100%;">
      ${row('Business Name', esc(c.business_name))}
      ${row('Town', esc(c.town))}
      ${row('Category', esc(c.category))}
      ${row('Address', c.address ? esc(c.address) : na)}
      ${row('Phone', c.phone ? esc(c.phone) : na)}
      ${row('Email', emailCell)}
      ${row('Website', websiteCell)}
    </table>

    <h3>Description</h3>
    <p style="background: #f5f5f5; padding: 12px; border-radius: 4px;">${c.description ? esc(c.description).replace(/\n/g, '<br>') : 'No description provided'}</p>

    <h3>Submitter Information</h3>
    <table style="border-collapse: collapse; width: 100%;">
      ${row('Contact Name', esc(c.contact_name))}
      ${row('Contact Email', contactEmailCell)}
      ${row('Confirms Ownership', c.confirms_ownership ? 'Yes' : 'No')}
    </table>

    ${c.notes ? `
    <h3>Additional Notes</h3>
    <p style="background: #f5f5f5; padding: 12px; border-radius: 4px;">${esc(c.notes).replace(/\n/g, '<br>')}</p>
    ` : ''}

    <hr style="margin: 24px 0; border: none; border-top: 1px solid #ddd;">
    <p style="color: #666; font-size: 12px;">
      This submission was received from the Martha's Vineyard IT business directory.<br>
      To add this business to the database, manually insert it into <code>data/mv_registry.db</code>
      and run <code>npm run export-directory</code>.
    </p>
  `;
}

function renderText(c: CleanDirectory): string {
  const na = 'Not provided';
  return [
    'New Directory Submission',
    '',
    'Business Information:',
    `- Business Name: ${c.business_name}`,
    `- Town: ${c.town}`,
    `- Category: ${c.category}`,
    `- Address: ${c.address || na}`,
    `- Phone: ${c.phone || na}`,
    `- Email: ${c.email || na}`,
    `- Website: ${c.website || na}`,
    '',
    'Description:',
    c.description || 'No description provided',
    '',
    'Submitter Information:',
    `- Contact Name: ${c.contact_name}`,
    `- Contact Email: ${c.contact_email}`,
    `- Confirms Ownership: ${c.confirms_ownership ? 'Yes' : 'No'}`,
    '',
    c.notes ? `Additional Notes:\n${c.notes}` : '',
    '---',
    'This submission was received from the Martha\'s Vineyard IT business directory.',
    'To add this business to the database, manually insert it into data/mv_registry.db',
    'and run npm run export-directory.',
  ].join('\n');
}
