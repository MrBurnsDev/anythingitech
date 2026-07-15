import { describe, it, expect } from "vitest";
import { compareSnapshots, summarizeComparison } from "../compare";
import type { MetricSnapshot } from "../types";

describe("compareSnapshots", () => {
  it("marks higher throughput as better", () => {
    const cur: MetricSnapshot = { download_mbps: 300 };
    const base: MetricSnapshot = { download_mbps: 100 };
    const d = compareSnapshots(cur, base).find((x) => x.key === "download_mbps")!;
    expect(d.direction).toBe("up");
    expect(d.quality).toBe("better");
    expect(d.deltaPct).toBeCloseTo(200);
    expect(d.significant).toBe(true);
  });

  it("marks higher latency as worse (polarity aware)", () => {
    const d = compareSnapshots({ latency_unloaded_ms: 80 }, { latency_unloaded_ms: 20 }).find(
      (x) => x.key === "latency_unloaded_ms",
    )!;
    expect(d.direction).toBe("up");
    expect(d.quality).toBe("worse");
  });

  it("marks lower packet loss as better", () => {
    const d = compareSnapshots({ packet_loss_pct: 0 }, { packet_loss_pct: 8 }).find(
      (x) => x.key === "packet_loss_pct",
    )!;
    expect(d.direction).toBe("down");
    expect(d.quality).toBe("better");
  });

  it("treats sub-threshold change as neutral / flat", () => {
    const d = compareSnapshots({ download_mbps: 102 }, { download_mbps: 100 }).find(
      (x) => x.key === "download_mbps",
    )!;
    expect(d.significant).toBe(false);
    expect(d.direction).toBe("flat");
    expect(d.quality).toBe("neutral");
  });

  it("reports na when a metric is missing from one side", () => {
    const d = compareSnapshots({ download_mbps: 100 }, {}).find((x) => x.key === "download_mbps")!;
    expect(d.direction).toBe("na");
    expect(d.quality).toBe("unknown");
  });

  it("omits metrics absent from both snapshots", () => {
    const deltas = compareSnapshots({ download_mbps: 100 }, { download_mbps: 90 });
    expect(deltas.some((d) => d.key === "jitter_ms")).toBe(false);
  });

  it("handles a zero baseline without dividing by zero", () => {
    const d = compareSnapshots({ packet_loss_pct: 5 }, { packet_loss_pct: 0 }).find(
      (x) => x.key === "packet_loss_pct",
    )!;
    expect(d.deltaPct).toBeUndefined();
    expect(d.significant).toBe(true); // non-zero change from zero is significant
    expect(d.quality).toBe("worse");
  });
});

describe("summarizeComparison", () => {
  it("summarizes a clean improvement", () => {
    const deltas = compareSnapshots(
      { download_mbps: 300, packet_loss_pct: 0 },
      { download_mbps: 100, packet_loss_pct: 6 },
    );
    expect(summarizeComparison(deltas)).toMatch(/improved on 2 metrics/i);
  });

  it("summarizes a mixed result", () => {
    const deltas = compareSnapshots(
      { download_mbps: 300, latency_unloaded_ms: 90 },
      { download_mbps: 100, latency_unloaded_ms: 20 },
    );
    expect(summarizeComparison(deltas)).toMatch(/1 metric improved, 1 regressed/i);
  });

  it("summarizes no material change", () => {
    const deltas = compareSnapshots({ download_mbps: 101 }, { download_mbps: 100 });
    expect(summarizeComparison(deltas)).toMatch(/no material change/i);
  });
});
