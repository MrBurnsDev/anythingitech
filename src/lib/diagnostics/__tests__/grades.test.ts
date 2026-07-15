import { describe, it, expect } from "vitest";
import { bufferbloatGrade } from "../grades";

describe("bufferbloatGrade", () => {
  it("grades a clean link A", () => {
    expect(bufferbloatGrade(0).grade).toBe("A");
    expect(bufferbloatGrade(29).grade).toBe("A");
  });

  it("steps through B/C/D at the thresholds", () => {
    expect(bufferbloatGrade(30).grade).toBe("B");
    expect(bufferbloatGrade(60).grade).toBe("C");
    expect(bufferbloatGrade(100).grade).toBe("D");
  });

  it("grades severe bufferbloat F", () => {
    expect(bufferbloatGrade(200).grade).toBe("F");
    // The real Comcast case from field testing (+3345 ms).
    expect(bufferbloatGrade(3345).grade).toBe("F");
  });

  it("always returns a non-empty label", () => {
    for (const ms of [0, 45, 80, 150, 500]) {
      expect(bufferbloatGrade(ms).label.length).toBeGreaterThan(0);
    }
  });
});
