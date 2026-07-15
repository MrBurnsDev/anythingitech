/**
 * Diagnostic endpoint configuration.
 *
 * The engine must never depend on a single third-party service (spec §6). These
 * defaults use Cloudflare's public, CORS-enabled speed infrastructure so the web
 * tool works out of the box; every value is overridable via Vite env vars so
 * self-hosted MV IT endpoints (and, later, M-Lab NDT7) can be dropped in without
 * touching measurement code.
 */

export interface DiagnosticsConfig {
  /** Base host that serves sized download/upload payloads. */
  downloadUrl: string;
  uploadUrl: string;
  /** Small, cache-bustable resource used for latency/jitter/loss probing. */
  latencyProbeUrl: string;
  /** Returns plain-text `key=value` lines incl. `ip=` (Cloudflare trace format). */
  tracePrimaryUrl: string;
  /** IPv6-only host — a successful fetch implies working IPv6. */
  ipv6ProbeUrl: string;
  /** IPv4-only host — a successful fetch implies working IPv4. */
  ipv4ProbeUrl: string;
  /** JSON endpoint returning client IP, ASN, ISP org, geo, colo (Cloudflare meta). */
  metaUrl: string;
}

function env(key: string): string | undefined {
  // import.meta.env is statically replaced by Vite; guard for non-Vite (test) runs.
  try {
    return (import.meta as unknown as { env?: Record<string, string> }).env?.[key];
  } catch {
    return undefined;
  }
}

export const diagnosticsConfig: DiagnosticsConfig = {
  downloadUrl: env("VITE_DIAG_DOWNLOAD_URL") ?? "https://speed.cloudflare.com/__down",
  uploadUrl: env("VITE_DIAG_UPLOAD_URL") ?? "https://speed.cloudflare.com/__up",
  latencyProbeUrl: env("VITE_DIAG_LATENCY_URL") ?? "https://speed.cloudflare.com/__down?bytes=0",
  tracePrimaryUrl: env("VITE_DIAG_TRACE_URL") ?? "https://speed.cloudflare.com/cdn-cgi/trace",
  ipv6ProbeUrl: env("VITE_DIAG_IPV6_URL") ?? "https://ipv6.icanhazip.com",
  ipv4ProbeUrl: env("VITE_DIAG_IPV4_URL") ?? "https://ipv4.icanhazip.com",
  metaUrl: env("VITE_DIAG_META_URL") ?? "https://speed.cloudflare.com/meta",
};

/** Semantic version of the rules library. Stored with every session (spec §7). */
export const RULES_VERSION = "0.1.0";
