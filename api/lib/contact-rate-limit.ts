/**
 * Rate limits for the contact form.
 *
 *   - Max 3 submissions per IP per hour
 *   - Max 1 submission per email per 10 minutes
 *
 * Backed by Supabase (`contact_form_attempts` table). We never store raw IPs;
 * only sha256(ip + secret). The audit trail also records blocked attempts so
 * patterns are visible in the data.
 */

import { createHash } from 'node:crypto';
import { supabase } from './supabase.js';

const IP_PER_HOUR_LIMIT       = 3;
const EMAIL_PER_10_MIN_LIMIT  = 1;

export function hashIp(ip: string): string {
  const salt = process.env.CONTACT_IP_HASH_SALT || 'aitechmv-fallback-salt';
  return createHash('sha256').update(`${salt}::${ip}`).digest('hex');
}

export type RateLimitOutcome =
  | { ok: true }
  | { ok: false; reason: 'ip_hourly_limit' | 'email_burst_limit' };

export async function checkRateLimits(args: {
  ipHash: string;
  email: string;
}): Promise<RateLimitOutcome> {
  const oneHourAgo  = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const tenMinAgo   = new Date(Date.now() - 10 * 60 * 1000).toISOString();

  // IP: count "sent" outcomes in last hour (don't punish them for prior blocks)
  const { count: ipCount } = await supabase
    .from('contact_form_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('ip_hash', args.ipHash)
    .eq('outcome', 'sent')
    .gte('created_at', oneHourAgo);

  if ((ipCount ?? 0) >= IP_PER_HOUR_LIMIT) {
    return { ok: false, reason: 'ip_hourly_limit' };
  }

  // Email: any successful sent in last 10 min
  const { count: emailCount } = await supabase
    .from('contact_form_attempts')
    .select('id', { count: 'exact', head: true })
    .eq('email', args.email)
    .eq('outcome', 'sent')
    .gte('created_at', tenMinAgo);

  if ((emailCount ?? 0) >= EMAIL_PER_10_MIN_LIMIT) {
    return { ok: false, reason: 'email_burst_limit' };
  }

  return { ok: true };
}

export async function recordAttempt(args: {
  ipHash: string;
  email: string | null;
  outcome: 'sent' | 'rate_limited' | 'spam_blocked' | 'validation_failed' | 'turnstile_failed';
  reason?: string;
  spamScore?: number;
}): Promise<void> {
  // Best-effort write — never block the user response if logging fails
  try {
    await supabase.from('contact_form_attempts').insert({
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
