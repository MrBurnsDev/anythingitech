/**
 * Regression tests for the admin CORS allowlist (api/_lib/cors.ts).
 * Verifies that allowed origins are reflected with credentials, disallowed /
 * missing origins get NO Access-Control-Allow-Origin (so the browser blocks
 * cross-origin reads), and preflight is answered.
 */
import { describe, it, expect } from 'vitest';
import { applyAdminCors } from '../_lib/cors.ts';

function makeReqRes(method: string, origin?: string) {
  const headers: Record<string, string> = {};
  const req = { method, headers: origin ? { origin } : {} } as never;
  const res = {
    _headers: headers as Record<string, string>,
    statusCode: 0,
    ended: false,
    setHeader(k: string, v: string) { headers[k] = v; },
    getHeader(k: string) { return headers[k]; },
    status(c: number) { this.statusCode = c; return this; },
    end() { this.ended = true; return this; },
  };
  return { req, res };
}

describe('applyAdminCors', () => {
  it('reflects an allowed origin WITH credentials', () => {
    const { req, res } = makeReqRes('POST', 'https://anythingitechmv.com');
    const isPreflight = applyAdminCors(req, res as never, 'POST,OPTIONS');
    expect(isPreflight).toBe(false);
    expect(res._headers['Access-Control-Allow-Origin']).toBe('https://anythingitechmv.com');
    expect(res._headers['Access-Control-Allow-Credentials']).toBe('true');
    expect(res._headers['Vary']).toBe('Origin');
  });

  it('allows the localhost dev origin', () => {
    const { req, res } = makeReqRes('GET', 'http://localhost:5173');
    applyAdminCors(req, res as never);
    expect(res._headers['Access-Control-Allow-Origin']).toBe('http://localhost:5173');
  });

  it('does NOT set Allow-Origin for a disallowed origin (no permissive CORS)', () => {
    const { req, res } = makeReqRes('POST', 'https://evil.example.com');
    applyAdminCors(req, res as never);
    expect(res._headers['Access-Control-Allow-Origin']).toBeUndefined();
    expect(res._headers['Access-Control-Allow-Credentials']).toBeUndefined();
  });

  it('does NOT set Allow-Origin when Origin header is missing', () => {
    const { req, res } = makeReqRes('POST');
    applyAdminCors(req, res as never);
    expect(res._headers['Access-Control-Allow-Origin']).toBeUndefined();
  });

  it('never emits a wildcard Allow-Origin', () => {
    for (const origin of ['https://evil.example.com', undefined, 'null']) {
      const { req, res } = makeReqRes('POST', origin as string | undefined);
      applyAdminCors(req, res as never);
      expect(res._headers['Access-Control-Allow-Origin']).not.toBe('*');
    }
  });

  it('answers preflight OPTIONS with 204 and returns true', () => {
    const { req, res } = makeReqRes('OPTIONS', 'https://anythingitechmv.com');
    const isPreflight = applyAdminCors(req, res as never, 'POST,OPTIONS');
    expect(isPreflight).toBe(true);
    expect(res.statusCode).toBe(204);
    expect(res.ended).toBe(true);
  });

  it('preflight from a disallowed origin still answers but without Allow-Origin', () => {
    const { req, res } = makeReqRes('OPTIONS', 'https://evil.example.com');
    const isPreflight = applyAdminCors(req, res as never, 'POST,OPTIONS');
    expect(isPreflight).toBe(true);
    expect(res._headers['Access-Control-Allow-Origin']).toBeUndefined();
  });
});
