/**
 * Regression tests: admin error responses must not leak internal details.
 *
 * Drives the real auth.ts login flow with a mocked Supabase client, and forces
 * the handler to reach the ACTUAL database-error / exception branch (not an
 * unrelated missing-config guard). Asserts the client response carries a
 * generic message only, while the real error is logged server-side.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Env must exist BEFORE auth.ts loads (it reads JWT_SECRET / SUPABASE keys at
// module scope). A hoisted block runs before the vi.mock factories and the
// dynamic import below, so the config guards are satisfied and the handler
// proceeds into the real login → DB path.
const h = vi.hoisted(() => {
  process.env.JWT_SECRET = 'test-jwt-secret';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-key';
  process.env.SUPABASE_URL = 'https://example.supabase.co';
  return {
    mode: { value: 'throw' as 'throw' | 'db_error' | 'ok' },
  };
});

// Mock Supabase so the login lookup hits a controllable error path.
vi.mock('@supabase/supabase-js', () => {
  const INTERNAL = 'SECRET-INTERNAL pg: relation "admin_users" connect 10.0.0.1:5432';
  return {
    createClient: () => ({
      from: () => {
        const q: Record<string, unknown> = {};
        q.select = () => q;
        q.eq = () => q;
        q.single = async () => {
          if (h.mode.value === 'throw') throw new Error(INTERNAL);
          if (h.mode.value === 'db_error') return { data: null, error: { message: INTERNAL, code: '42P01' } };
          return { data: null, error: null }; // ok: user-not-found path
        };
        q.update = () => q;
        q.insert = async () => ({ error: null });
        return q;
      },
    }),
  };
});

// Import AFTER mocks + env are set.
const authHandler = (await import('../admin/auth.ts')).default;

function makeRes() {
  const headers: Record<string, string> = {};
  const res = {
    statusCode: 0, body: undefined as unknown, _headers: headers, ended: false,
    setHeader(k: string, v: string) { headers[k] = v; },
    status(c: number) { this.statusCode = c; return this; },
    json(b: unknown) { this.body = b; return this; },
    end() { this.ended = true; return this; },
  };
  return res;
}
const loginReq = () => ({
  method: 'POST',
  headers: { origin: 'https://anythingitechmv.com' },
  body: { username: 'admin', password: 'whatever' },
} as never);

function assertNoLeak(body: unknown) {
  const s = JSON.stringify(body);
  expect(s).not.toContain('SECRET-INTERNAL');
  expect(s).not.toContain('pg:');
  expect(s).not.toContain('10.0.0.1');
  expect(s).not.toContain('details');
  expect(s).not.toContain('42P01');
  expect(s).not.toMatch(/at .*\(.*:\d+:\d+\)/); // no stack frames
}

beforeEach(() => { h.mode.value = 'throw'; vi.clearAllMocks(); });

describe('admin auth error hygiene (reaches the real DB/exception branch)', () => {
  it('logs the internal error server-side but returns a GENERIC 500 (exception branch)', async () => {
    h.mode.value = 'throw';
    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = makeRes();
    await authHandler(loginReq(), res as never);

    // Reached the catch branch (not a config guard): generic 500, no leak.
    expect(res.statusCode).toBe(500);
    expect((res.body as { error: string }).error).toBe('Internal server error');
    assertNoLeak(res.body);

    // The real internal detail WAS logged server-side.
    const loggedInternally = errSpy.mock.calls.some(c =>
      c.some(a => String((a as Error)?.message ?? a).includes('SECRET-INTERNAL')));
    expect(loggedInternally).toBe(true);
    errSpy.mockRestore();
  });

  it('does not leak the Supabase error object on a returned DB error', async () => {
    h.mode.value = 'db_error';
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const res = makeRes();
    await authHandler(loginReq(), res as never);
    // Whatever status it returns, the body must not carry the DB internals.
    assertNoLeak(res.body);
    vi.restoreAllMocks();
  });

  it('answers preflight from allowed origin with 204 (no body processing)', async () => {
    const res = makeRes();
    await authHandler({ method: 'OPTIONS', headers: { origin: 'https://anythingitechmv.com' }, body: {} } as never, res as never);
    expect(res.statusCode).toBe(204);
  });
});
