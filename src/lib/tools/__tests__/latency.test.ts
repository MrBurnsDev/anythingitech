import { describe, it, expect } from "vitest";
import { computeLatencyStats, sparklinePath, type LatencySample } from "../latency";

const s = (rtts: (number | null)[]): LatencySample[] => rtts.map((rtt, t) => ({ t, rtt }));

describe("computeLatencyStats", () => {
  it("computes min/avg/max/current", () => {
    const st = computeLatencyStats(s([10, 20, 30]));
    expect(st.min).toBe(10);
    expect(st.max).toBe(30);
    expect(st.avg).toBe(20);
    expect(st.current).toBe(30);
    expect(st.lossPct).toBe(0);
  });

  it("computes jitter as mean absolute successive difference", () => {
    // diffs: |20-10|=10, |30-20|=10 → jitter 10
    expect(computeLatencyStats(s([10, 20, 30])).jitter).toBe(10);
  });

  it("counts nulls as packet loss and excludes them from stats", () => {
    const st = computeLatencyStats(s([10, null, 30, null]));
    expect(st.count).toBe(4);
    expect(st.successCount).toBe(2);
    expect(st.lossPct).toBe(50);
    expect(st.min).toBe(10);
    expect(st.max).toBe(30);
  });

  it("current reflects the last sample even if it failed", () => {
    expect(computeLatencyStats(s([10, 20, null])).current).toBeNull();
  });

  it("handles all-failed and empty series without NaN", () => {
    const allFail = computeLatencyStats(s([null, null]));
    expect(allFail.avg).toBeNull();
    expect(allFail.lossPct).toBe(100);
    const empty = computeLatencyStats([]);
    expect(empty.count).toBe(0);
    expect(empty.lossPct).toBe(0);
  });
});

describe("sparklinePath", () => {
  it("returns empty for no values", () => {
    expect(sparklinePath([], 100, 40)).toBe("");
  });

  it("starts with M and maps the max value to the top (y=0)", () => {
    const path = sparklinePath([0, 100], 100, 40, 100);
    expect(path.startsWith("M")).toBe(true);
    // second point (value 100) → y = 40 - (100/100)*40 = 0
    expect(path).toContain("L100.0,0.0");
  });

  it("clamps values above maxValue", () => {
    const path = sparklinePath([500], 100, 40, 100);
    // single point centered, clamped to top
    expect(path).toContain("0.0");
  });
});
