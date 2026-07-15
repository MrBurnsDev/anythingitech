/**
 * Google Sheets save adapter (Sheets API + Google sign-in), mirroring the
 * ClientsDesk pattern of appending rows to spreadsheets in Google Drive.
 *
 * Split into two layers:
 *   - Pure row builders (`buildSessionRow`, `buildFindingRows`) — no browser
 *     APIs, unit tested, portable.
 *   - Browser client (`saveAssessmentToSheets`) — loads Google Identity
 *     Services, requests an access token for the Sheets scope, and appends
 *     rows via the REST API.
 *
 * Auth model: client-side OAuth via GIS token client. The user clicks the save
 * action, Google shows a sign-in/consent popup, and we receive a short-lived
 * access token used only to append rows. No refresh token, no server, no
 * secrets in the bundle (the client ID is public by design).
 */

import { googleSheetsConfig, type GoogleSheetsConfig } from "./config";
import type { AssessmentResult, MetricSnapshot, MetricValue } from "./types";

// ---------------------------------------------------------------------------
// Pure row builders
// ---------------------------------------------------------------------------

export type Cell = string | number;

export const SESSIONS_HEADER: string[] = [
  "Session ID",
  "Saved At (ISO)",
  "Label",
  "Headline",
  "Rules Version",
  "Download (Mbps)",
  "Upload (Mbps)",
  "Latency idle (ms)",
  "Latency loaded (ms)",
  "Jitter (ms)",
  "Packet loss (%)",
  "DNS (ms)",
  "IPv4",
  "IPv6",
  "HTTPS reachable",
  "Captive portal",
  "Public IP",
  "Expected download",
  "Expected upload",
  "Expected link",
  "Top finding",
  "Top confidence",
  "Findings count",
];

export const FINDINGS_HEADER: string[] = [
  "Session ID",
  "Saved At (ISO)",
  "Label",
  "Finding",
  "Category",
  "Severity",
  "Confidence",
  "Score",
  "Evidence",
  "Contradictions",
  "Next tests",
];

/** Sheet-friendly cell: numbers pass through, booleans → Yes/No, missing → "". */
function cell(v: MetricValue | undefined): Cell {
  if (v === undefined || v === null) return "";
  if (typeof v === "boolean") return v ? "Yes" : "No";
  return v;
}

function snap(s: MetricSnapshot, key: keyof MetricSnapshot): Cell {
  return cell(s[key]);
}

/** One summary row per assessment for the Sessions spreadsheet. */
export function buildSessionRow(
  result: AssessmentResult,
  label: string,
  sessionId: string,
): Cell[] {
  const s = result.snapshot;
  const top = result.findings[0];
  return [
    sessionId,
    new Date(result.completedAt).toISOString(),
    label,
    result.headline,
    result.rulesVersion,
    snap(s, "download_mbps"),
    snap(s, "upload_mbps"),
    snap(s, "latency_unloaded_ms"),
    snap(s, "latency_loaded_down_ms"),
    snap(s, "jitter_ms"),
    snap(s, "packet_loss_pct"),
    snap(s, "dns_lookup_ms"),
    snap(s, "ipv4_available"),
    snap(s, "ipv6_available"),
    snap(s, "https_reachable"),
    snap(s, "captive_portal_suspected"),
    snap(s, "public_ip"),
    snap(s, "expected_download_mbps"),
    snap(s, "expected_upload_mbps"),
    snap(s, "expected_link_mbps"),
    top ? top.title : "",
    top ? top.confidence : "",
    result.findings.length,
  ];
}

/** One row per finding for the Findings spreadsheet (linked by Session ID). */
export function buildFindingRows(
  result: AssessmentResult,
  label: string,
  sessionId: string,
): Cell[][] {
  const iso = new Date(result.completedAt).toISOString();
  return result.findings.map((f) => [
    sessionId,
    iso,
    label,
    f.title,
    f.category,
    f.severity,
    f.confidence,
    f.confidenceScore,
    f.evidence.join("; "),
    f.contradictions.join("; "),
    f.nextTests.join("; "),
  ]);
}

// ---------------------------------------------------------------------------
// Browser client (Google Identity Services + Sheets REST API)
// ---------------------------------------------------------------------------

const GIS_SRC = "https://accounts.google.com/gsi/client";
const SHEETS_SCOPE = "https://www.googleapis.com/auth/spreadsheets";

interface TokenResponse {
  access_token?: string;
  expires_in?: number;
  error?: string;
}
interface TokenClient {
  requestAccessToken: (opts?: { prompt?: string }) => void;
}
interface GoogleGlobal {
  accounts: {
    oauth2: {
      initTokenClient: (cfg: {
        client_id: string;
        scope: string;
        callback: (resp: TokenResponse) => void;
      }) => TokenClient;
    };
  };
}
declare global {
  interface Window {
    google?: GoogleGlobal;
  }
}

/** True when enough env config exists to attempt a save. */
export function googleSheetsConfigured(cfg: GoogleSheetsConfig = googleSheetsConfig): boolean {
  return Boolean(cfg.clientId && cfg.sessionsSpreadsheetId && cfg.findingsSpreadsheetId);
}

let gisPromise: Promise<void> | null = null;
function loadGis(): Promise<void> {
  if (typeof window !== "undefined" && window.google?.accounts?.oauth2) return Promise.resolve();
  if (gisPromise) return gisPromise;
  gisPromise = new Promise((resolve, reject) => {
    if (typeof document === "undefined") {
      reject(new Error("Google sign-in is only available in the browser."));
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${GIS_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("Failed to load Google sign-in.")));
      return;
    }
    const script = document.createElement("script");
    script.src = GIS_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google sign-in."));
    document.head.appendChild(script);
  });
  return gisPromise;
}

let tokenClient: TokenClient | null = null;
let accessToken: string | null = null;
let tokenExpiresAt = 0;

async function ensureAccessToken(cfg: GoogleSheetsConfig): Promise<string> {
  if (accessToken && Date.now() < tokenExpiresAt - 60_000) return accessToken;
  await loadGis();
  const google = window.google;
  if (!google) throw new Error("Google sign-in unavailable.");

  return new Promise<string>((resolve, reject) => {
    tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: cfg.clientId,
      scope: SHEETS_SCOPE,
      callback: (resp) => {
        if (resp.error || !resp.access_token) {
          reject(new Error(resp.error ?? "Google sign-in was cancelled."));
          return;
        }
        accessToken = resp.access_token;
        tokenExpiresAt = Date.now() + (resp.expires_in ?? 3600) * 1000;
        resolve(accessToken);
      },
    });
    // Empty prompt reuses an existing grant silently when possible.
    tokenClient.requestAccessToken({ prompt: accessToken ? "" : "consent" });
  });
}

async function appendRows(
  spreadsheetId: string,
  sheet: string,
  rows: Cell[][],
  token: string,
): Promise<void> {
  const range = encodeURIComponent(`${sheet}!A1`);
  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(spreadsheetId)}` +
    `/values/${range}:append?valueInputOption=USER_ENTERED&insertDataOption=INSERT_ROWS`;
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ values: rows }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Sheets append failed (${res.status}). ${detail.slice(0, 200)}`);
  }
}

function newSessionId(): string {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  } catch {
    /* fall through */
  }
  return `s_${Date.now()}_${Math.round(Math.random() * 1e9)}`;
}

/**
 * Append one assessment to both spreadsheets. Prompts for Google sign-in on
 * first use. Throws on cancellation or API error so the UI can surface it.
 */
export async function saveAssessmentToSheets(
  result: AssessmentResult,
  label: string,
  cfg: GoogleSheetsConfig = googleSheetsConfig,
): Promise<{ sessionId: string }> {
  if (!googleSheetsConfigured(cfg)) {
    throw new Error("Google Sheets is not configured.");
  }
  const token = await ensureAccessToken(cfg);
  const sessionId = newSessionId();

  await appendRows(
    cfg.sessionsSpreadsheetId,
    cfg.sessionsSheet,
    [buildSessionRow(result, label, sessionId)],
    token,
  );

  const findingRows = buildFindingRows(result, label, sessionId);
  if (findingRows.length > 0) {
    await appendRows(cfg.findingsSpreadsheetId, cfg.findingsSheet, findingRows, token);
  }

  return { sessionId };
}
