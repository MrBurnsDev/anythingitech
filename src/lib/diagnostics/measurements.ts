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
export async function measureDownload(
  cfg: DiagnosticsConfig = diagnosticsConfig,
  bytes = 25_000_000,
  timeoutMs = 20_000,
): Promise<Measurement[]> {
  const url = `${cfg.downloadUrl}${cfg.downloadUrl.includes("?") ? "&" : "?"}bytes=${bytes}`;
  const start = now();

  // Fire loaded-latency probes concurrently with the download.
  const loadedProbe = probeLoadedLatency(cfg, timeoutMs);

  try {
    const res = await fetchWithTimeout(bust(url), { method: "GET", timeoutMs });
    if (!res.ok || !res.body) {
      const loaded = await loadedProbe;
      return [
        make("download_mbps", null, false, { errorCode: `http_${res.status}` }),
        ...loaded,
      ];
    }
    const reader = res.body.getReader();
    let received = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (value) received += value.byteLength;
    }
    const seconds = (now() - start) / 1000;
    const mbps = seconds > 0 ? (received * 8) / seconds / 1_000_000 : 0;
    const loaded = await loadedProbe;
    return [
      make("download_mbps", round(mbps), true, {
        unit: "Mbps",
        target: url,
        durationMs: Math.round(seconds * 1000),
        metadata: { bytes: received },
      }),
      ...loaded,
    ];
  } catch (e) {
    const loaded = await loadedProbe;
    return [
      make("download_mbps", null, false, {
        errorCode: e instanceof Error ? e.name : "download_failed",
      }),
      ...loaded,
    ];
  }
}

/** Latency probes issued while a download is in flight → loaded latency. */
async function probeLoadedLatency(
  cfg: DiagnosticsConfig,
  timeoutMs: number,
): Promise<Measurement[]> {
  const rtts: number[] = [];
  const deadline = now() + Math.min(timeoutMs, 8000);
  // Small delay so the download ramps up before we sample.
  await sleep(500);
  while (now() < deadline && rtts.length < 6) {
    const start = now();
    try {
      const res = await fetchWithTimeout(bust(cfg.latencyProbeUrl), {
        method: "GET",
        timeoutMs: 4000,
      });
      await res.arrayBuffer();
      if (res.ok) rtts.push(now() - start);
    } catch {
      /* ignore individual failures under load */
    }
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

/** Upload throughput. POSTs a random payload and divides by wall time. */
export async function measureUpload(
  cfg: DiagnosticsConfig = diagnosticsConfig,
  bytes = 10_000_000,
  timeoutMs = 20_000,
): Promise<Measurement[]> {
  const payload = new Uint8Array(bytes);
  // Non-compressible-ish content so intermediaries can't deflate our timing away.
  for (let i = 0; i < bytes; i += 4096) payload[i] = (i * 31) & 0xff;

  const start = now();
  try {
    const res = await fetchWithTimeout(bust(cfg.uploadUrl), {
      method: "POST",
      body: payload,
      headers: { "Content-Type": "application/octet-stream" },
      timeoutMs,
    });
    await res.arrayBuffer().catch(() => undefined);
    if (!res.ok) {
      return [make("upload_mbps", null, false, { errorCode: `http_${res.status}` })];
    }
    const seconds = (now() - start) / 1000;
    const mbps = seconds > 0 ? (bytes * 8) / seconds / 1_000_000 : 0;
    return [
      make("upload_mbps", round(mbps), true, {
        unit: "Mbps",
        target: cfg.uploadUrl,
        durationMs: Math.round(seconds * 1000),
        metadata: { bytes },
      }),
    ];
  } catch (e) {
    return [
      make("upload_mbps", null, false, {
        errorCode: e instanceof Error ? e.name : "upload_failed",
      }),
    ];
  }
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

/** IPv4/IPv6 availability — a successful fetch to a version-locked host. */
export async function measureIpVersions(
  cfg: DiagnosticsConfig = diagnosticsConfig,
  timeoutMs = 5000,
): Promise<Measurement[]> {
  const probe = async (url: string, key: MetricKey): Promise<Measurement> => {
    try {
      const res = await fetchWithTimeout(bust(url), { method: "GET", timeoutMs });
      await res.text().catch(() => undefined);
      return make(key, res.ok, true);
    } catch {
      // A failure here is genuinely "not available", not a measurement error.
      return make(key, false, true);
    }
  };
  return Promise.all([
    probe(cfg.ipv4ProbeUrl, "ipv4_available"),
    probe(cfg.ipv6ProbeUrl, "ipv6_available"),
  ]);
}

function round(n: number): number {
  return Math.round(n * 10) / 10;
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}
