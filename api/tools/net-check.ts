/**
 * net-check — TLS certificate inspection + TCP port reachability.
 *
 * GET /api/tools/net-check?host=example.com&port=443&tls=1
 *   tls=1 (or port 443) → TLS handshake: issuer, expiry, days remaining, valid.
 *   otherwise           → TCP connect: open/closed + connect time.
 *
 * Security: only allow-listed service ports; the target is resolved and any
 * private/reserved address is rejected (SSRF guard); every socket is time-
 * bounded; a small in-memory per-IP rate limit throttles bursts.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import * as net from 'node:net';
import * as tls from 'node:tls';
import * as dns from 'node:dns/promises';
import {
  isAllowedPort,
  isPrivateOrReservedIp,
  isValidHostname,
  isValidPort,
} from '../_lib/net-check-validation.js';

const TIMEOUT_MS = 6000;
const RATE_LIMIT = 20; // requests per window per IP
const WINDOW_MS = 60_000;

// Best-effort per-instance rate limit (resets on cold start).
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now > rec.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  rec.count++;
  return rec.count > RATE_LIMIT;
}

interface TlsInfo {
  ok: boolean;
  tls: true;
  subject?: string;
  issuer?: string;
  validFrom?: string;
  validTo?: string;
  daysRemaining?: number;
  altNames?: string;
  authorized?: boolean;
  authError?: string;
  protocol?: string | null;
  error?: string;
}

function checkTls(servername: string, port: number, target: string): Promise<TlsInfo> {
  return new Promise((resolve) => {
    let settled = false;
    const done = (v: TlsInfo) => {
      if (settled) return;
      settled = true;
      resolve(v);
    };
    const socket = tls.connect(
      { host: target, port, servername, rejectUnauthorized: false, timeout: TIMEOUT_MS },
      () => {
        const cert = socket.getPeerCertificate();
        const authorized = socket.authorized;
        const authError = socket.authorizationError
          ? String(socket.authorizationError)
          : undefined;
        const protocol = socket.getProtocol();
        socket.end();
        if (!cert || !cert.valid_to) {
          done({ ok: false, tls: true, error: 'no_certificate' });
          return;
        }
        const validTo = new Date(cert.valid_to).getTime();
        const daysRemaining = Math.floor((validTo - Date.now()) / 86_400_000);
        const flat = (v: string | string[] | undefined): string | undefined =>
          Array.isArray(v) ? v.join(', ') : v;
        done({
          ok: true,
          tls: true,
          subject: flat(cert.subject?.CN),
          issuer: flat(cert.issuer?.O) || flat(cert.issuer?.CN),
          validFrom: cert.valid_from,
          validTo: cert.valid_to,
          daysRemaining,
          altNames: cert.subjectaltname,
          authorized,
          authError,
          protocol,
        });
      },
    );
    socket.on('error', (e: NodeJS.ErrnoException) =>
      done({ ok: false, tls: true, error: e.code || 'tls_error' }),
    );
    socket.on('timeout', () => {
      socket.destroy();
      done({ ok: false, tls: true, error: 'timeout' });
    });
  });
}

interface PortInfo {
  ok: true;
  open: boolean;
  ms?: number;
  error?: string;
}

function checkPort(target: string, port: number): Promise<PortInfo> {
  return new Promise((resolve) => {
    let settled = false;
    const done = (v: PortInfo) => {
      if (settled) return;
      settled = true;
      resolve(v);
    };
    const start = Date.now();
    const socket = net.connect({ host: target, port });
    socket.setTimeout(TIMEOUT_MS);
    socket.on('connect', () => {
      const ms = Date.now() - start;
      socket.destroy();
      done({ ok: true, open: true, ms });
    });
    socket.on('timeout', () => {
      socket.destroy();
      done({ ok: true, open: false, error: 'timeout' });
    });
    socket.on('error', (e: NodeJS.ErrnoException) =>
      done({ ok: true, open: false, error: e.code || 'refused' }),
    );
  });
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'method_not_allowed' });
  }

  const ip =
    (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
    req.socket?.remoteAddress ||
    'unknown';
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'rate_limited' });
  }

  const host = String(req.query.host ?? '').trim().toLowerCase();
  const wantTls = req.query.tls === '1' || req.query.tls === 'true';
  const port = Number(req.query.port ?? (wantTls ? 443 : 0)) || (wantTls ? 443 : 0);

  if (!isValidHostname(host)) return res.status(400).json({ error: 'invalid_host' });
  if (!isValidPort(port) || !isAllowedPort(port)) {
    return res.status(400).json({ error: 'port_not_allowed' });
  }

  let addresses: { address: string }[];
  try {
    addresses = await dns.lookup(host, { all: true });
  } catch {
    return res.status(400).json({ error: 'dns_lookup_failed' });
  }
  if (addresses.length === 0 || addresses.some((a) => isPrivateOrReservedIp(a.address))) {
    return res.status(400).json({ error: 'target_not_allowed' });
  }
  const target = addresses[0].address;

  try {
    const result = wantTls || port === 443
      ? await checkTls(host, port, target)
      : await checkPort(target, port);
    return res.status(200).json({ host, port, resolvedIp: target, ...result });
  } catch {
    return res.status(200).json({ host, port, ok: false, error: 'check_failed' });
  }
}
