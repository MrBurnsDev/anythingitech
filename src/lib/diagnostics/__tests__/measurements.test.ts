import { describe, it, expect } from "vitest";
import { throughputMbps } from "../measurements";

describe("throughputMbps", () => {
  it("converts bytes over milliseconds to Mbps", () => {
    // 12.5 MB in 1 s = 100 Mbps (12.5e6 bytes * 8 bits / 1s / 1e6)
    expect(throughputMbps(12_500_000, 1000)).toBeCloseTo(100);
  });

  it("scales with the measurement window", () => {
    // Same bytes over half the time = double the rate.
    expect(throughputMbps(12_500_000, 500)).toBeCloseTo(200);
  });

  it("aggregates parallel-stream bytes correctly", () => {
    // 6 streams × 50 MB each in 4 s = 300 MB in 4 s = 600 Mbps.
    expect(throughputMbps(6 * 50_000_000, 4000)).toBeCloseTo(600);
  });

  it("returns 0 for a non-positive window instead of Infinity/NaN", () => {
    expect(throughputMbps(1_000_000, 0)).toBe(0);
    expect(throughputMbps(1_000_000, -100)).toBe(0);
  });
});
