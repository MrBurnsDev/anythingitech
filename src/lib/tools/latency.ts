/**
 * Latency-monitor helpers — pure stats and chart-path math, unit-tested.
 * The live probing (browser fetch loop) lives in the page component.
 */

export interface LatencySample {
  /** Sequence index / timestamp-ish; monotonic. */
  t: number;
  /** Round-trip ms, or null for a failed/timed-out probe. */
  rtt: number | null;
}

export interface LatencyStats {
  count: number;
  successCount: number;
  current: number | null;
  min: number | null;
  avg: number | null;
  max: number | null;
  jitter: number | null;
  lossPct: number;
}

export function computeLatencyStats(samples: LatencySample[]): LatencyStats {
  const count = samples.length;
  const rtts = samples.filter((s): s is LatencySample & { rtt: number } => s.rtt !== null).map((s) => s.rtt);
  const successCount = rtts.length;
  const lossPct = count > 0 ? ((count - successCount) / count) * 100 : 0;

  if (rtts.length === 0) {
    return { count, successCount, current: null, min: null, avg: null, max: null, jitter: null, lossPct };
  }

  const min = Math.min(...rtts);
  const max = Math.max(...rtts);
  const avg = rtts.reduce((a, b) => a + b, 0) / rtts.length;

  let jitter = 0;
  if (rtts.length > 1) {
    let sum = 0;
    for (let i = 1; i < rtts.length; i++) sum += Math.abs(rtts[i] - rtts[i - 1]);
    jitter = sum / (rtts.length - 1);
  }

  const current = samples[samples.length - 1]?.rtt ?? null;
  const round = (n: number) => Math.round(n * 10) / 10;
  return {
    count,
    successCount,
    current,
    min: round(min),
    avg: round(avg),
    max: round(max),
    jitter: round(jitter),
    lossPct: round(lossPct),
  };
}

/**
 * Build an SVG polyline path for a series of values scaled into a w×h box.
 * Values are clamped to `maxValue` (defaults to the series max, min 1).
 */
export function sparklinePath(
  values: number[],
  width: number,
  height: number,
  maxValue?: number,
): string {
  if (values.length === 0) return "";
  const max = maxValue ?? Math.max(...values, 1);
  const stepX = values.length > 1 ? width / (values.length - 1) : 0;
  return values
    .map((v, i) => {
      const x = values.length > 1 ? i * stepX : width / 2;
      const y = height - (Math.min(Math.max(v, 0), max) / max) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}
