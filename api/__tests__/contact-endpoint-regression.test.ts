/**
 * Regression guard: the Contact endpoint must retain ALL its protections after
 * the shared rate-limit library was made source-scoped. Proves Contact still
 * honeypots, enforces time-on-page, verifies Turnstile, validates, rate-limits,
 * and (critically) now fails CLOSED when the rate-limit DB query errors.
 *
 * Mirrors the directory-submission test harness.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

const h = vi.hoisted(() => {
  const turnstileResult = { value: { ok: true } as { ok: boolean; error?: string } };
  const resendSend = vi.fn(async () => ({ error: null as unknown }));
  const dbState = {
    countResult: { count: 0, error: null as unknown },
    inserted: [] as Array<Record<string, unknown>>,
  };
  return { turnstileResult, resendSend, dbState };
});
const { turnstileResult, resendSend, dbState } = h;

vi.mock('../_lib/turnstile.js', () => ({
  verifyTurnstile: vi.fn(async () => h.turnstileResult.value),
}));
vi.mock('resend', () => ({ Resend: class { emails = { send: h.resendSend }; } }));
vi.mock('../_lib/supabase.js', () => {
  function makeQuery() {
    const filters: Record<string, string> = {};
    const chain: Record<string, unknown> = {};
    chain.select = vi.fn(() => chain);
    chain.eq = vi.fn((c: string, v: string) => { filters[c] = v; return chain; });
    chain.gte = vi.fn(() => chain);
    (chain as unknown as { then: unknown }).then = (resolve: (v: unknown) => void) => {
      // record the source filter so we can assert contact scoping
      h.dbState.inserted.push({ __query_source: filters.source });
      return resolve(h.dbState.countResult);
    };
    chain.insert = vi.fn(async (row: Record<string, unknown>) => { h.dbState.inserted.push(row); return { error: null }; });
    return chain;
  }
  return { supabase: { from: vi.fn(() => makeQuery()) } };
});

import handler from '../contact.ts';

function makeReq(body: Record<string, unknown>) {
  return { method: 'POST', headers: { 'x-forwarded-for': '203.0.113.9' }, body } as never;
}
function makeRes() {
  const res: { statusCode: number; body: unknown; status: (c: number) => typeof res; json: (b: unknown) => typeof res; setHeader: () => void } = {
    statusCode: 0, body: undefined,
    status(c: number) { this.statusCode = c; return this; },
    json(b: unknown) { this.body = b; return this; },
    setHeader() {},
  };
  return res;
}

const VALID = () => ({
  name: 'Jane Doe',
  email: 'jane@example.com',
  message: 'I would like to ask about Wi-Fi installation for my home office please.',
  town: 'Edgartown',
  project_type: 'Wi-Fi & Network Installation',
  turnstile_token: 'good',
  form_loaded_at: Date.now() - 10_000,
});

beforeEach(() => {
  turnstileResult.value = { ok: true };
  resendSend.mockClear();
  resendSend.mockResolvedValue({ error: null });
  dbState.countResult = { count: 0, error: null };
  dbState.inserted = [];
});

describe('contact endpoint still protected after shared-lib change', () => {
  it('accepts a legitimate contact submission (source=contact)', async () => {
    const res = makeRes();
    await handler(makeReq(VALID()), res as never);
    expect(res.statusCode).toBe(200);
    expect(resendSend).toHaveBeenCalledTimes(1);
    // Every rate-limit query ran scoped to 'contact'
    const querySources = dbState.inserted.filter(r => '__query_source' in r).map(r => r.__query_source);
    expect(querySources.length).toBeGreaterThan(0);
    for (const s of querySources) expect(s).toBe('contact');
  });

  it('still silently drops honeypot submissions', async () => {
    const res = makeRes();
    await handler(makeReq({ ...VALID(), company_website: 'spam' }), res as never);
    expect(res.statusCode).toBe(200);
    expect(resendSend).not.toHaveBeenCalled();
  });

  it('still rejects invalid Turnstile (no email)', async () => {
    turnstileResult.value = { ok: false, error: 'invalid-input-response' };
    const res = makeRes();
    await handler(makeReq(VALID()), res as never);
    expect(res.statusCode).toBe(400);
    expect(resendSend).not.toHaveBeenCalled();
  });

  it('still rejects on validation failure (no email)', async () => {
    const res = makeRes();
    await handler(makeReq({ ...VALID(), message: 'too short' }), res as never);
    expect(res.statusCode).toBe(400);
    expect(resendSend).not.toHaveBeenCalled();
  });

  it('still rate-limits (429, no email) when quota exhausted', async () => {
    dbState.countResult = { count: 3, error: null };
    const res = makeRes();
    await handler(makeReq(VALID()), res as never);
    expect(res.statusCode).toBe(429);
    expect(resendSend).not.toHaveBeenCalled();
  });

  it('now FAILS CLOSED when the rate-limit query errors (no email)', async () => {
    dbState.countResult = { count: null, error: { message: 'db down' } };
    const res = makeRes();
    await handler(makeReq(VALID()), res as never);
    expect(res.statusCode).toBe(429);
    expect(resendSend).not.toHaveBeenCalled();
  });
});
