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
};

/** Semantic version of the rules library. Stored with every session (spec §7). */
export const RULES_VERSION = "0.1.0";

/**
 * Google Sheets save target (Sheets API + Google sign-in), mirroring the
 * ClientsDesk approach: one spreadsheet for session summaries, one for
 * individual findings. All values come from env so no secrets are committed;
 * the OAuth client ID is public by design. When unset, the "Save to Google
 * Sheets" action is hidden and the tool still works fully offline.
 */
export interface GoogleSheetsConfig {
  clientId: string;
  sessionsSpreadsheetId: string;
  findingsSpreadsheetId: string;
  sessionsSheet: string;
  findingsSheet: string;
}

export const googleSheetsConfig: GoogleSheetsConfig = {
  clientId: env("VITE_GOOGLE_CLIENT_ID") ?? "",
  sessionsSpreadsheetId: env("VITE_SHEETS_SESSIONS_ID") ?? "",
  findingsSpreadsheetId: env("VITE_SHEETS_FINDINGS_ID") ?? "",
  sessionsSheet: env("VITE_SHEETS_SESSIONS_TAB") ?? "Sessions",
  findingsSheet: env("VITE_SHEETS_FINDINGS_TAB") ?? "Findings",
};
