/**
 * Baseline comparison (spec §15 "Current result versus site baseline", §19
 * before-and-after). Pure and framework-agnostic — safe to unit test and share.
 *
 * Given two snapshots it reports, per metric, the direction of change and
 * whether that change is *better* or *worse* for the client — accounting for
 * metric polarity (more throughput is good; more latency/loss is bad).
 */

import type { MetricKey, MetricSnapshot, MetricValue } from "./types";

export type Direction = "up" | "down" | "flat" | "na";
export type Quality = "better" | "worse" | "neutral" | "unknown";

export interface MetricDelta {
  key: MetricKey;
  label: string;
  unit?: string;
  current?: number;
  baseline?: number;
  /** Relative change vs baseline, in percent (undefined if not computable). */
  deltaPct?: number;
  direction: Direction;
  quality: Quality;
  /** True when the change is large enough to be worth surfacing. */
  significant: boolean;
}

/** Metrics we compare, in report order, with polarity + display metadata. */
const COMPARED: {
  key: MetricKey;
  label: string;
  unit?: string;
  higherIsBetter: boolean;
}[] = [
  { key: "download_mbps", label: "Download", unit: "Mbps", higherIsBetter: true },
  { key: "upload_mbps", label: "Upload", unit: "Mbps", higherIsBetter: true },
  { key: "latency_unloaded_ms", label: "Latency (idle)", unit: "ms", higherIsBetter: false },
  { key: "latency_loaded_down_ms", label: "Latency (loaded)", unit: "ms", higherIsBetter: false },
  { key: "jitter_ms", label: "Jitter", unit: "ms", higherIsBetter: false },
  { key: "packet_loss_pct", label: "Packet loss", unit: "%", higherIsBetter: false },
  { key: "dns_lookup_ms", label: "DNS lookup", unit: "ms", higherIsBetter: false },
];

/** Changes smaller than this (relative) are treated as noise → neutral/flat. */
const SIGNIFICANCE_THRESHOLD_PCT = 5;

function num(v: MetricValue | undefined): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

/**
 * Compare a current snapshot against a baseline. Only metrics present in at
 * least one snapshot are returned; a metric missing from one side yields a
 * delta with `direction: "na"`.
 */
export function compareSnapshots(
  current: MetricSnapshot,
  baseline: MetricSnapshot,
): MetricDelta[] {
  const out: MetricDelta[] = [];

  for (const m of COMPARED) {
    const cur = num(current[m.key]);
    const base = num(baseline[m.key]);
    if (cur === undefined && base === undefined) continue;

    if (cur === undefined || base === undefined) {
      out.push({
        key: m.key,
        label: m.label,
        unit: m.unit,
        current: cur,
        baseline: base,
        direction: "na",
        quality: "unknown",
        significant: false,
      });
      continue;
    }

    const diff = cur - base;
    const deltaPct = base !== 0 ? (diff / Math.abs(base)) * 100 : undefined;
    const significant =
      deltaPct === undefined ? diff !== 0 : Math.abs(deltaPct) >= SIGNIFICANCE_THRESHOLD_PCT;

    let direction: Direction = "flat";
    if (significant) direction = diff > 0 ? "up" : diff < 0 ? "down" : "flat";

    let quality: Quality = "neutral";
    if (significant && diff !== 0) {
      const improved = m.higherIsBetter ? diff > 0 : diff < 0;
      quality = improved ? "better" : "worse";
    }

    out.push({
      key: m.key,
      label: m.label,
      unit: m.unit,
      current: cur,
      baseline: base,
      deltaPct,
      direction,
      quality,
      significant,
    });
  }

  return out;
}

/** One-line summary of a comparison for the report header. */
export function summarizeComparison(deltas: MetricDelta[]): string {
  const better = deltas.filter((d) => d.quality === "better").length;
  const worse = deltas.filter((d) => d.quality === "worse").length;
  if (better === 0 && worse === 0) return "No material change from the baseline.";
  if (worse === 0) return `Improved on ${better} metric${better === 1 ? "" : "s"} vs. baseline.`;
  if (better === 0) return `Regressed on ${worse} metric${worse === 1 ? "" : "s"} vs. baseline.`;
  return `${better} metric${better === 1 ? "" : "s"} improved, ${worse} regressed vs. baseline.`;
}
