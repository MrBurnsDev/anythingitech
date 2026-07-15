/**
 * Browser measurement adapter (spec §2 "Web app capabilities").
 *
 * This is the ONLY platform-specific layer in the diagnostics package: it turns
 * what a browser can actually observe into the portable `Measurement` shape the
 * engine consumes. It knows nothing about rules or UI. Each function degrades
 * gracefully — a blocked/failed probe returns `success: false` rather than
 * throwing, so a partial assessment still yields whatever could be measured.
 *
 * Honest limitations (surfaced to the user, per spec §2): a browser cannot scan
 * the subnet, read Wi-Fi RSSI/BSSID, inspect Ethernet negotiation, or run raw
 * ICMP ping/traceroute. Latency here is HTTP round-trip; packet loss is a
 * request-failure approximation; DNS timing is derived from Resource Timing.
 */

import { diagnosticsConfig, type DiagnosticsConfig } from "./config";
import type { Measurement, MetricKey } from "./types";

function now(): number {
  return typeof performance !== "undefined" ? performance.now() : Date.now();
}

function stamp(): number {
  return Date.now();
}

function make(
  key: MetricKey,
  value: Measurement["value"],
  success: boolean,
  extra: Partial<Measurement> = {},
): Measurement {
  return { key, value, success, startedAt: stamp(), ...extra };
}

/** Append a cache-buster so probes are never served from cache. */
function bust(url: string): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}_cb=${stamp()}_${Math.round(now() * 1000)}`;
}

async function fetchWithTimeout(
  url: string,
  opts: RequestInit & { timeoutMs: number },
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs);
  try {
    return await fetch(url, { ...opts, signal: controller.signal, cache: "no-store" });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Unloaded latency + jitter + packet-loss approximation.
 * Fires `samples` small requests serially; latency = median RTT, jitter = mean
 * absolute successive difference, loss = failed / total.
 */
export async function measureLatencyJitterLoss(
  cfg: DiagnosticsConfig = diagnosticsConfig,
  samples = 12,
  timeoutMs = 4000,
): Promise<Measurement[]> {
  const rtts: number[] = [];
  let failures = 0;

  for (let i = 0; i < samples; i++) {
    const start = now();
    try {
      const res = await fetchWithTimeout(bust(cfg.latencyProbeUrl), {
        method: "GET",
        timeoutMs,
      });
      // Drain the (tiny) body so timing reflects a completed transfer.
      await res.arrayBuffer();
      if (res.ok) rtts.push(now() - start);
      else failures++;
    } catch {
      failures++;
    }
  }

  const startedAt = stamp();
  const out: Measurement[] = [];

  if (rtts.length > 0) {
    const sorted = [...rtts].sort((a, b) => a - b);
    const median = sorted[Math.floor(sorted.length / 2)];
    out.push(make("latency_unloaded_ms", round(median), true, { unit: "ms", startedAt }));

    if (rtts.length > 1) {
      let sumDiff = 0;
      for (let i = 1; i < rtts.length; i++) sumDiff += Math.abs(rtts[i] - rtts[i - 1]);
      out.push(
        make("jitter_ms", round(sumDiff / (rtts.length - 1)), true, {
          unit: "ms",
          startedAt,
        }),
      );
    }
  } else {
    out.push(make("latency_unloaded_ms", null, false, { errorCode: "all_probes_failed" }));
  }

  out.push(
    make("packet_loss_pct", round((failures / samples) * 100), true, {
      unit: "%",
      startedAt,
      metadata: { failures, samples },
    }),
  );

  return out;
}

/**
 * Download throughput. Streams a sized payload and divides bytes by wall time.
 * Also captures loaded latency by firing latency probes during the transfer.
 */
export interface ThroughputOptions {
  /** Concurrent connections. A single stream can't fill a fast, high-RTT link. */
  streams?: number;
  /** Ignore this initial period so TCP slow-start isn't measured. */
  warmupMs?: number;
  /** Steady-state measurement window after warm-up. */
  measureMs?: number;
  /** Hard cap on bytes moved, to protect metered/cellular plans. */
  maxBytes?: number;
  /** Bytes requested/sent per stream iteration. */
  chunkBytes?: number;
}

const DOWNLOAD_DEFAULTS: Required<ThroughputOptions> = {
  // More streams + a longer steady-state window to saturate fast, high-RTT
  // links that a handful of connections leave half-empty.
  streams: 10,
  warmupMs: 1500,
  measureMs: 5000,
  // Runaway backstop only — high enough that the time window governs a normal
  // test on anything up to ~gigabit, so the cap never truncates the sample.
  maxBytes: 2_000_000_000,
  chunkBytes: 26_000_000,
};

const UPLOAD_DEFAULTS: Required<ThroughputOptions> = {
  streams: 4,
  warmupMs: 1000,
  measureMs: 4000,
  // Runaway backstop only (see download note).
  maxBytes: 1_000_000_000,
  // Small chunks so even a slow cellular uplink completes several within the
  // window (a large chunk on a slow link finishes after warm-up → false "—").
  chunkBytes: 512_000,
};

/** Mbps from a byte count over a duration in milliseconds. */
export function throughputMbps(bytes: number, ms: number): number {
  return ms > 0 ? (bytes * 8) / (ms / 1000) / 1_000_000 : 0;
}

/** How much data the throughput tests may use, chosen by the technician. */
export type DataMode = "unlimited" | "metered";

/**
 * Test intensity per connection type. `unlimited` (Wi-Fi) uses the full
 * defaults for best accuracy; `metered` (cellular) shortens the window and
 * hard-caps bytes so a run costs little paid data — trading some precision on
 * fast links for a much smaller footprint.
 */
export const DATA_PROFILES: Record<
  DataMode,
  { download: ThroughputOptions; upload: ThroughputOptions }
> = {
  unlimited: { download: {}, upload: {} },
  metered: {
    download: { streams: 4, warmupMs: 700, measureMs: 2200, maxBytes: 80_000_000 },
    upload: { streams: 3, warmupMs: 600, measureMs: 2600, maxBytes: 40_000_000 },
  },
};

/**
 * Parallel-stream download throughput with a warm-up.
 *
 * A single fetch can't saturate a fast, high-latency link (bandwidth-delay
 * product), so it reads far below tools like Ookla that open many connections.
 * We run N concurrent streams, discard the slow-start ramp (warm-up), and
 * measure aggregate bytes over a steady-state window — while probing latency
 * under that load so bufferbloat actually surfaces.
 */
export async function measureDownload(
  cfg: DiagnosticsConfig = diagnosticsConfig,
  options: ThroughputOptions = {},
): Promise<Measurement[]> {
  const { streams, warmupMs, measureMs, maxBytes, chunkBytes } = {
    ...DOWNLOAD_DEFAULTS,
    ...options,
  };
  const url = `${cfg.downloadUrl}${cfg.downloadUrl.includes("?") ? "&" : "?"}bytes=${chunkBytes}`;
  const controller = new AbortController();
  let totalBytes = 0;
  let windowBytes = 0;
  let measuring = false;

  const worker = async () => {
    try {
      while (!controller.signal.aborted && totalBytes < maxBytes) {
        const res = await fetch(bust(url), { cache: "no-store", signal: controller.signal });
        if (!res.ok || !res.body) break;
        const reader = res.body.getReader();
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          if (value) {
            totalBytes += value.byteLength;
            if (measuring) windowBytes += value.byteLength;
          }
          if (controller.signal.aborted || totalBytes >= maxBytes) {
            await reader.cancel().catch(() => undefined);
            break;
          }
        }
      }
    } catch {
      /* aborted or per-stream network error — other streams continue */
    }
  };

  const loadedProbe = sampleLoadedLatency(cfg, controller.signal, warmupMs);
  const workers = Array.from({ length: streams }, () => worker());

  // Warm-up (discard slow-start); we judge success from the window, not here.
  await sleep(warmupMs);

  const windowStart = now();
  measuring = true;
  while (now() - windowStart < measureMs && totalBytes < maxBytes && !controller.signal.aborted) {
    await sleep(100);
  }
  measuring = false;
  const windowMs = now() - windowStart;
  controller.abort();
  await Promise.allSettled(workers);
  const loaded = await loadedProbe;

  if (windowBytes === 0) {
    return [make("download_mbps", null, false, { errorCode: "no_data" }), ...loaded];
  }
  return [
    make("download_mbps", round(throughputMbps(windowBytes, windowMs)), true, {
      unit: "Mbps",
      target: url,
      durationMs: Math.round(windowMs),
      metadata: { streams, windowBytes, totalBytes },
    }),
    ...loaded,
  ];
}

/** Latency probes issued while streams saturate the link → loaded latency. */
async function sampleLoadedLatency(
  cfg: DiagnosticsConfig,
  signal: AbortSignal,
  warmupMs: number,
): Promise<Measurement[]> {
  const rtts: number[] = [];
  await sleep(warmupMs); // sample only once the link is under load
  while (!signal.aborted) {
    const start = now();
    try {
      const res = await fetch(bust(cfg.latencyProbeUrl), { cache: "no-store", signal });
      await res.arrayBuffer();
      if (res.ok) rtts.push(now() - start);
    } catch {
      /* ignore individual failures / abort */
    }
    if (signal.aborted) break;
    await sleep(200);
  }
  if (rtts.length === 0) return [];
  const sorted = [...rtts].sort((a, b) => a - b);
  return [
    make("latency_loaded_down_ms", round(sorted[Math.floor(sorted.length / 2)]), true, {
      unit: "ms",
    }),
  ];
}

/**
 * Parallel-stream upload throughput with a warm-up. Same rationale as download:
 * one POST under-measures a fast link, and that low reading was tripping a
 * false "asymmetric upload" finding.
 */
export async function measureUpload(
  cfg: DiagnosticsConfig = diagnosticsConfig,
  options: ThroughputOptions = {},
): Promise<Measurement[]> {
  const { streams, warmupMs, measureMs, maxBytes, chunkBytes } = {
    ...UPLOAD_DEFAULTS,
    ...options,
  };
  const payload = new Uint8Array(chunkBytes);
  // Non-compressible-ish content so intermediaries can't deflate our timing away.
  for (let i = 0; i < chunkBytes; i += 4096) payload[i] = (i * 31) & 0xff;

  const controller = new AbortController();
  let totalBytes = 0;
  let windowBytes = 0;
  let measuring = false;

  const worker = async () => {
    try {
      while (!controller.signal.aborted && totalBytes < maxBytes) {
        const res = await fetch(bust(cfg.uploadUrl), {
          method: "POST",
          body: payload,
          headers: { "Content-Type": "application/octet-stream" },
          cache: "no-store",
          signal: controller.signal,
        });
        await res.arrayBuffer().catch(() => undefined);
        if (!res.ok) break;
        totalBytes += chunkBytes;
        if (measuring) windowBytes += chunkBytes;
      }
    } catch {
      /* aborted or per-stream network error */
    }
  };

  const workers = Array.from({ length: streams }, () => worker());

  // Warm-up (discard slow-start); success is judged from the window below, not
  // here — a slow uplink may not finish its first chunk within the warm-up.
  await sleep(warmupMs);

  const windowStart = now();
  measuring = true;
  while (now() - windowStart < measureMs && totalBytes < maxBytes && !controller.signal.aborted) {
    await sleep(100);
  }
  measuring = false;
  const windowMs = now() - windowStart;
  controller.abort();
  await Promise.allSettled(workers);

  if (windowBytes === 0) {
    return [make("upload_mbps", null, false, { errorCode: "no_data" })];
  }
  return [
    make("upload_mbps", round(throughputMbps(windowBytes, windowMs)), true, {
      unit: "Mbps",
      target: cfg.uploadUrl,
      durationMs: Math.round(windowMs),
      metadata: { streams, windowBytes },
    }),
  ];
}

/**
 * HTTPS reachability, public IP, and a captive-portal heuristic.
 * The trace endpoint returns `key=value` lines; if it redirects or returns
 * unexpected content, we flag a possible captive portal.
 */
export async function measureReachabilityAndIp(
  cfg: DiagnosticsConfig = diagnosticsConfig,
  timeoutMs = 6000,
): Promise<Measurement[]> {
  const out: Measurement[] = [];
  try {
    const res = await fetchWithTimeout(bust(cfg.tracePrimaryUrl), {
      method: "GET",
      timeoutMs,
    });
    const text = await res.text();
    const looksLikeTrace = /(^|\n)ip=/.test(text);
    out.push(make("https_reachable", res.ok && looksLikeTrace, res.ok));
    // Redirected or non-trace body on a 2xx = classic captive-portal signature.
    out.push(make("captive_portal_suspected", res.ok && !looksLikeTrace, true));
    if (looksLikeTrace) {
      const ip = /(?:^|\n)ip=([^\n]+)/.exec(text)?.[1]?.trim();
      if (ip) out.push(make("public_ip", ip, true, { metadata: { source: "trace" } }));
    }
  } catch (e) {
    out.push(
      make("https_reachable", false, false, {
        errorCode: e instanceof Error ? e.name : "unreachable",
      }),
    );
  }
  return out;
}

/** DNS timing via Resource Timing (domainLookupEnd − domainLookupStart). */
export async function measureDnsTiming(
  cfg: DiagnosticsConfig = diagnosticsConfig,
  timeoutMs = 6000,
): Promise<Measurement[]> {
  // Use a fresh cross-origin URL so the browser performs a real lookup.
  const url = bust(cfg.ipv4ProbeUrl);
  try {
    await fetchWithTimeout(url, { method: "GET", timeoutMs, mode: "cors" }).catch(
      () => undefined,
    );
    const entries = (typeof performance !== "undefined" &&
      performance.getEntriesByName?.(url)) as PerformanceResourceTiming[] | undefined;
    const entry = entries?.[0];
    if (entry && entry.domainLookupEnd > 0 && entry.domainLookupStart >= 0) {
      const dns = entry.domainLookupEnd - entry.domainLookupStart;
      return [make("dns_lookup_ms", round(dns), true, { unit: "ms" })];
    }
    return [make("dns_lookup_ms", null, false, { errorCode: "timing_unavailable" })];
  } catch {
    return [make("dns_lookup_ms", null, false, { errorCode: "dns_probe_failed" })];
  }
}

/**
 * IPv4/IPv6 availability — a successful fetch to a version-locked host. These
 * hosts echo the client's public address in the body, so we also capture the
 * actual IPv4/IPv6 address for the technician's network readout.
 */
export async function measureIpVersions(
  cfg: DiagnosticsConfig = diagnosticsConfig,
  timeoutMs = 5000,
): Promise<Measurement[]> {
  const probe = async (
    url: string,
    availKey: MetricKey,
    ipKey: MetricKey,
  ): Promise<Measurement[]> => {
    try {
      const res = await fetchWithTimeout(bust(url), { method: "GET", timeoutMs });
      const text = (await res.text().catch(() => "")).trim();
      const out: Measurement[] = [make(availKey, res.ok, true)];
      // Guard against an error page sneaking into the address field.
      if (res.ok && text && text.length < 60 && !/\s/.test(text)) {
        out.push(make(ipKey, text, true));
      }
      return out;
    } catch {
      // A failure here is genuinely "not available", not a measurement error.
      return [make(availKey, false, true)];
    }
  };
  const [v4, v6] = await Promise.all([
    probe(cfg.ipv4ProbeUrl, "ipv4_available", "public_ipv4"),
    probe(cfg.ipv6ProbeUrl, "ipv6_available", "public_ipv6"),
  ]);
  return [...v4, ...v6];
}

/**
 * Public-side network identity (spec: give the technician an ipconfig-style
 * readout of what a browser *can* see). Cloudflare's meta endpoint returns the
 * client IP, ASN, ISP org, geo, and edge colo in one CORS-friendly call.
 *
 * Note: local IP, gateway, subnet, and MAC are NOT obtainable from a browser —
 * those require the native app.
 */
export async function measureNetworkInfo(
  cfg: DiagnosticsConfig = diagnosticsConfig,
  timeoutMs = 6000,
): Promise<Measurement[]> {
  try {
    const res = await fetchWithTimeout(bust(cfg.metaUrl), { method: "GET", timeoutMs });
    if (!res.ok) return [];
    const j = (await res.json()) as Record<string, unknown>;
    const out: Measurement[] = [];
    const push = (key: MetricKey, v: unknown) => {
      if (v !== undefined && v !== null && v !== "") out.push(make(key, String(v), true));
    };
    push("public_ip", j.clientIp);
    push("isp", j.asOrganization);
    if (typeof j.asn === "number" || typeof j.asn === "string") push("asn", `AS${j.asn}`);
    const geo = [j.city, j.region, j.country].filter(Boolean).join(", ");
    if (geo) push("geo", geo);
    push("edge", j.colo);
    push("http_protocol", j.httpProtocol);
    return out;
  } catch {
    return [];
  }
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
