/**
 * Shared, source-scoped rate limiting + attempt logging for public forms.
 *
 * Backed by Supabase (`contact_form_attempts` table). Every attempt and every
 * rate-limit query is scoped by `source` so each form has INDEPENDENT quotas —
 * a contact submission never consumes a directory submission's budget and vice
 * versa. We never store raw IPs; only sha256(ip + secret).
 *
 * (Filename is historical — this module is now shared by any form that reuses
 * the attempts table. Add new sources to FORM_SOURCES and to the DB CHECK
 * constraint in migration 2026-11-08-form-attempts-source.sql.)
 *
 * Default limits (per source):
 *   - Max 3 "sent" per IP per hour
 *   - Max 1 "sent" per email per 10 minutes
 * A caller may override either limit via the `limits` argument.
 */

import { createHash } from 'node:crypto';
import { supabase } from './supabase.js';

/** Known form identifiers. Keep in sync with the DB CHECK constraint. */
export const FORM_SOURCES = {
  contact: 'contact',
  directorySubmission: 'directory_submission',
} as const;

export type FormSource = (typeof FORM_SOURCES)[keyof typeof FORM_SOURCES];

const DEFAULT_IP_PER_HOUR_LIMIT      = 3;
const DEFAULT_EMAIL_PER_10_MIN_LIMIT = 1;

export function hashIp(ip: string): string {
  const salt = process.env.CONTACT_IP_HASH_SALT || 'aitechmv-fallback-salt';
  return createHash('sha256').update(`${salt}::${ip}`).digest('hex');
}

export type RateLimitOutcome =
  | { ok: true }
  | { ok: false; reason: 'ip_hourly_limit' | 'email_burst_limit' | 'rate_check_unavailable' };

export async function checkRateLimits(args: {
  ipHash: string;
  email: string;
  /** Which form's quota to check. Defaults to 'contact' for back-compat. */
  source?: FormSource;
  /** Optional per-call overrides of the default limits. */
  limits?: { ipPerHour?: number; emailPer10Min?: number };
}): Promise<RateLimitOutcome> {
  const source = args.source ?? FORM_SOURCES.contact;
  const ipPerHour     = args.limits?.ipPerHour     ?? DEFAULT_IP_PER_HOUR_LIMIT;
  const emailPer10Min = args.limits?.emailPer10Min ?? DEFAULT_EMAIL_PER_10_MIN_LIMIT;

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const tenMinAgo  = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  try {
    // IP: count "sent" outcomes in last hour FOR THIS SOURCE (don't punish them
    // for prior blocks, and don't count other forms' submissions).
    const ipRes = await supabase
      .from('contact_form_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('source', source)
      .eq('ip_hash', args.ipHash)
      .eq('outcome', 'sent')
      .gte('created_at', oneHourAgo);

    // FAIL CLOSED: if the count query errored (DB down, missing `source`
    // column, permissions), we cannot prove the caller is under the limit, so
    // we must reject rather than let the submission through unthrottled.
    if (ipRes.error) {
      console.error('rate-limit ip query failed — failing closed', ipRes.error);
      return { ok: false, reason: 'rate_check_unavailable' };
    }
    if ((ipRes.count ?? 0) >= ipPerHour) {
      return { ok: false, reason: 'ip_hourly_limit' };
    }

    // Email: any successful "sent" in last 10 min FOR THIS SOURCE.
    const emailRes = await supabase
      .from('contact_form_attempts')
      .select('id', { count: 'exact', head: true })
      .eq('source', source)
      .eq('email', args.email)
      .eq('outcome', 'sent')
      .gte('created_at', tenMinAgo);

    if (emailRes.error) {
      console.error('rate-limit email query failed — failing closed', emailRes.error);
      return { ok: false, reason: 'rate_check_unavailable' };
    }
    if ((emailRes.count ?? 0) >= emailPer10Min) {
      return { ok: false, reason: 'email_burst_limit' };
    }

    return { ok: true };
  } catch (err) {
    // Network/exception path (e.g. Supabase unreachable) — fail closed.
    console.error('rate-limit check threw — failing closed', err);
    return { ok: false, reason: 'rate_check_unavailable' };
  }
}

export async function recordAttempt(args: {
  ipHash: string;
  email: string | null;
  outcome: 'sent' | 'rate_limited' | 'spam_blocked' | 'validation_failed' | 'turnstile_failed';
  /** Which form this attempt belongs to. Defaults to 'contact' for back-compat. */
  source?: FormSource;
  reason?: string;
  spamScore?: number;
}): Promise<void> {
  const source = args.source ?? FORM_SOURCES.contact;
  // Best-effort write — never block the user response if logging fails
  try {
    await supabase.from('contact_form_attempts').insert({
      source,
      ip_hash:    args.ipHash,
      email:      args.email,
      outcome:    args.outcome,
      reason:     args.reason ?? null,
      spam_score: args.spamScore ?? null,
    });
  } catch (err) {
    console.error('contact_form_attempts insert failed (non-fatal)', err);
  }
}

export function clientIp(req: { headers: Record<string, string | string[] | undefined> }): string {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string') return xff.split(',')[0].trim();
  if (Array.isArray(xff)) return xff[0].split(',')[0].trim();
  const real = req.headers['x-real-ip'];
  if (typeof real === 'string') return real;
  return '0.0.0.0';
}
