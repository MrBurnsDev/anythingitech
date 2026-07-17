import { describe, it, expect } from "vitest";
import { videoCallGrade } from "../voip";

describe("videoCallGrade", () => {
  it("grades a clean connection Good", () => {
    const r = videoCallGrade({ udpWorks: true, symmetricNat: false, jitterMs: 8, lossPct: 0 });
    expect(r.grade).toBe("Good");
    expect(r.headline).toMatch(/ready/i);
    expect(r.factors.every((f) => f.status === "good")).toBe(true);
  });

  it("grades blocked UDP Poor regardless of the rest", () => {
    const r = videoCallGrade({ udpWorks: false, symmetricNat: false, jitterMs: 5, lossPct: 0 });
    expect(r.grade).toBe("Poor");
    expect(r.factors.find((f) => f.label === "UDP connectivity")?.status).toBe("bad");
  });

  it("high jitter or loss forces Poor", () => {
    expect(videoCallGrade({ udpWorks: true, symmetricNat: false, jitterMs: 55, lossPct: 0 }).grade).toBe("Poor");
    expect(videoCallGrade({ udpWorks: true, symmetricNat: false, jitterMs: 5, lossPct: 4 }).grade).toBe("Poor");
  });

  it("symmetric NAT or borderline jitter yields Fair", () => {
    expect(videoCallGrade({ udpWorks: true, symmetricNat: true, jitterMs: 5, lossPct: 0 }).grade).toBe("Fair");
    expect(videoCallGrade({ udpWorks: true, symmetricNat: false, jitterMs: 25, lossPct: 0 }).grade).toBe("Fair");
    expect(videoCallGrade({ udpWorks: true, symmetricNat: false, jitterMs: 5, lossPct: 1.5 }).grade).toBe("Fair");
  });

  it("marks unknown metrics as warnings, not failures", () => {
    const r = videoCallGrade({ udpWorks: true, symmetricNat: null, jitterMs: null, lossPct: null });
    expect(r.grade).toBe("Fair"); // warnings but nothing outright bad
    expect(r.factors.filter((f) => f.status === "warn").length).toBeGreaterThanOrEqual(3);
  });

  it("always returns one factor per dimension", () => {
    const r = videoCallGrade({ udpWorks: true, symmetricNat: false, jitterMs: 10, lossPct: 0 });
    expect(r.factors.map((f) => f.label)).toEqual([
      "UDP connectivity",
      "NAT type",
      "Jitter",
      "Packet loss",
    ]);
  });
});
