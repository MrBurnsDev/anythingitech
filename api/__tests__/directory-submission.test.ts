/**
 * End-to-end-ish tests for the directory-submission endpoint with mocked
 * Turnstile, Supabase, and Resend. Exercises the real handler logic.
 *
 * Covers: legitimate submission, honeypot, too-fast, missing/invalid/expired/
 * reused Turnstile, validation failures, HTML injection, rate-limit exhaustion,
 * rate-check DB error (fail-closed), and Resend failure. Also proves that no
 * email is sent on any rejected path, and that quotas are source-scoped.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// All shared mock state lives in a hoisted block so the (hoisted) vi.mock
// factories below can close over it without a TDZ error.
const h = vi.hoisted(() => {
  const turnstileResult = { value: { ok: true } as { ok: boolean; error?: string } };
  const resendSend = vi.fn(async () => ({ error: null as unknown }));
  const dbState = {
    countResult: { count: 0, error: null as unknown },
    insertResult: { error: null as unknown },
    inserted: [] as Array<Record<string, unknown>>,
  };
  return { turnstileResult, resendSend, dbState };
});
const { turnstileResult, resendSend, dbState } = h;

vi.mock('../_lib/turnstile.js', () => ({
  verifyTurnstile: vi.fn(async () => h.turnstileResult.value),
}));

vi.mock('resend', () => ({
  Resend: class {
    emails = { send: h.resendSend };
  },
}));

// Supabase: controllable chainable query-builder. `countResult` drives the
// rate-limit count queries; `insertResult` drives recordAttempt.
vi.mock('../_lib/supabase.js', () => {
  function makeQuery() {
    const chain: Record<string, unknown> = {};
    const ret = () => chain;
    chain.select = vi.fn(ret);
    chain.eq = vi.fn(ret);
    chain.gte = vi.fn(ret);
    // Awaitable: resolves to the current count result.
    (chain as unknown as { then: unknown }).then = (resolve: (v: unknown) => void) =>
      resolve(h.dbState.countResult);
    chain.insert = vi.fn(async (row: Record<string, unknown>) => {
      h.dbState.inserted.push(row);
      return h.dbState.insertResult;
    });
    return chain;
  }
  return { supabase: { from: vi.fn(() => makeQuery()) } };
});

// ---- Handler under test (imported AFTER mocks) -----------------------------
import handler from '../directory-submission.ts';

// Minimal req/res doubles.
function makeReq(body: Record<string, unknown>, headers: Record<string, string> = {}) {
  return { method: 'POST', headers: { 'x-forwarded-for': '203.0.113.5', ...headers }, body } as never;
}
function makeRes() {
  const res: {
    statusCode: number; body: unknown;
    status: (c: number) => typeof res; json: (b: unknown) => typeof res; setHeader: () => void;
  } = {
    statusCode: 0, body: undefined,
    status(c: number) { this.statusCode = c; return this; },
    json(b: unknown) { this.body = b; return this; },
    setHeader() {},
  };
  return res;
}

const VALID = () => ({
  business_name: 'Island Coffee Roasters',
  town: 'Edgartown',
  category: 'Restaurants, Food & Beverages',
  contact_name: 'Jane Doe',
  contact_email: 'jane@example.com',
  description: 'Fresh roasted island coffee.',
  website: 'https://islandcoffee.com',
  confirms_ownership: 'yes',
  turnstile_token: 'good-token',
  form_loaded_at: Date.now() - 10_000, // 10s ago -> passes "too fast" check
});

beforeEach(() => {
  turnstileResult.value = { ok: true };
  resendSend.mockClear();
  resendSend.mockResolvedValue({ error: null });
  dbState.countResult = { count: 0, error: null };
  dbState.insertResult = { error: null };
  dbState.inserted = [];
});

describe('directory-submission endpoint', () => {
  it('accepts a legitimate submission and sends exactly one email', async () => {
    const res = makeRes();
    await handler(makeReq(VALID()), res as never);
    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({ success: true });
    expect(resendSend).toHaveBeenCalledTimes(1);
    // recorded as sent, scoped to directory_submission
    const sent = dbState.inserted.find(r => r.outcome === 'sent');
    expect(sent?.source).toBe('directory_submission');
  });

  it('rejects wrong HTTP method', async () => {
    const res = makeRes();
    const req = makeReq(VALID()); (req as { method: string }).method = 'GET';
    await handler(req, res as never);
    expect(res.statusCode).toBe(405);
    expect(resendSend).not.toHaveBeenCalled();
  });

  // ---- Turnstile ----
  it('rejects missing Turnstile token (no email)', async () => {
    turnstileResult.value = { ok: false, error: 'missing_token' };
    const res = makeRes();
    const body = VALID(); delete (body as Record<string, unknown>).turnstile_token;
    await handler(makeReq(body), res as never);
    expect(res.statusCode).toBe(400);
    expect(res.body).toEqual({ error: 'turnstile_failed' });
    expect(resendSend).not.toHaveBeenCalled();
  });

  it('rejects invalid/expired/reused Turnstile token (no email)', async () => {
    // Cloudflare siteverify returns these error codes for expired/duplicate.
    for (const err of ['invalid-input-response', 'timeout-or-duplicate']) {
      turnstileResult.value = { ok: false, error: err };
      resendSend.mockClear();
      const res = makeRes();
      await handler(makeReq(VALID()), res as never);
      expect(res.statusCode).toBe(400);
      expect(resendSend).not.toHaveBeenCalled();
    }
  });

  // ---- Bot heuristics ----
  it('silently drops honeypot-filled submissions (no email, 200)', async () => {
    const res = makeRes();
    await handler(makeReq({ ...VALID(), company_website: 'http://spam.example' }), res as never);
    expect(res.statusCode).toBe(200);
    expect(resendSend).not.toHaveBeenCalled();
    expect(dbState.inserted.some(r => r.reason === 'honeypot')).toBe(true);
  });

  it('silently drops too-fast submissions (no email, 200)', async () => {
    const res = makeRes();
    await handler(makeReq({ ...VALID(), form_loaded_at: Date.now() - 500 }), res as never);
    expect(res.statusCode).toBe(200);
    expect(resendSend).not.toHaveBeenCalled();
    expect(dbState.inserted.some(r => r.reason === 'too_fast')).toBe(true);
  });

  // ---- Validation / malformed ----
  it('rejects malformed payloads (no email)', async () => {
    const bad = [
      { ...VALID(), business_name: '' },
      { ...VALID(), town: 'Nantucket' },
      { ...VALID(), category: 'Nonsense' },
      { ...VALID(), contact_email: 'notanemail' },
      { ...VALID(), website: 'javascript:alert(1)' },
      { ...VALID(), business_name: 'x'.repeat(500) },
    ];
    for (const body of bad) {
      resendSend.mockClear();
      const res = makeRes();
      await handler(makeReq(body), res as never);
      expect(res.statusCode).toBe(400);
      expect(res.body).toEqual({ error: 'validation_failed' });
      expect(resendSend).not.toHaveBeenCalled();
    }
  });

  it('HTML-escapes injected fields in the notification email', async () => {
    const res = makeRes();
    await handler(makeReq({
      ...VALID(),
      business_name: "<script>alert('xss')</script>",
      description: "<img src=x onerror='alert(1)'>",
    }), res as never);
    expect(res.statusCode).toBe(200);
    expect(resendSend).toHaveBeenCalledTimes(1);
    const arg = resendSend.mock.calls[0][0] as { html: string };
    // The injected markup must be inert escaped text, never live HTML tags.
    expect(arg.html).not.toContain('<script>alert');
    expect(arg.html).toContain('&lt;script&gt;');
    // No live <img ... onerror> tag: the opening '<' must be escaped, so there
    // is no tag for the onerror handler to attach to (the string "onerror="
    // may survive as harmless escaped text, which is fine).
    expect(arg.html).not.toContain('<img');
    expect(arg.html).toContain('&lt;img');
  });

  // ---- Rate limiting ----
  it('rejects when IP rate limit is exhausted (429, no email)', async () => {
    dbState.countResult = { count: 3, error: null }; // >= IP limit
    const res = makeRes();
    await handler(makeReq(VALID()), res as never);
    expect(res.statusCode).toBe(429);
    expect(res.body).toEqual({ error: 'rate_limited' });
    expect(resendSend).not.toHaveBeenCalled();
  });

  // ---- FAIL CLOSED on DB error (the critical one) ----
  it('FAILS CLOSED when the rate-limit query errors (no email)', async () => {
    dbState.countResult = { count: null, error: { message: 'column "source" does not exist' } };
    const res = makeRes();
    await handler(makeReq(VALID()), res as never);
    expect(res.statusCode).toBe(429);
    expect(resendSend).not.toHaveBeenCalled();
  });

  it('FAILS CLOSED when Supabase throws (no email)', async () => {
    // Make .from throw to simulate total unavailability.
    const mod = await import('../_lib/supabase.js');
    (mod.supabase.from as unknown as { mockImplementationOnce: (f: () => never) => void })
      .mockImplementationOnce(() => { throw new Error('ECONNREFUSED'); });
    const res = makeRes();
    await handler(makeReq(VALID()), res as never);
    expect(res.statusCode).toBe(429);
    expect(resendSend).not.toHaveBeenCalled();
  });

  // ---- Resend failure ----
  it('returns send_failed when Resend errors (passed all checks)', async () => {
    resendSend.mockResolvedValueOnce({ error: { message: 'resend down' } });
    const res = makeRes();
    await handler(makeReq(VALID()), res as never);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'send_failed' });
  });
});
