import { describe, it, expect } from "vitest";
import {
  buildSnapshot,
  evaluateCondition,
  evaluateRule,
  runRules,
  summarize,
  RULE_LIBRARY,
} from "../rules";
import type { Measurement, MetricSnapshot, Rule } from "../types";

const rule = (id: string) => {
  const r = RULE_LIBRARY.find((x) => x.id === id);
  if (!r) throw new Error(`rule ${id} not found`);
  return r;
};

function m(key: Measurement["key"], value: Measurement["value"], success = true): Measurement {
  return { key, value, success, startedAt: 0 };
}

describe("evaluateCondition", () => {
  const snap: MetricSnapshot = {
    download_mbps: 90,
    https_reachable: false,
    ipv6_available: true,
  };

  it("handles scalar operators", () => {
    expect(evaluateCondition({ metric: "download_mbps", operator: "gte", value: 90 }, snap)).toBe(true);
    expect(evaluateCondition({ metric: "download_mbps", operator: "gt", value: 90 }, snap)).toBe(false);
    expect(evaluateCondition({ metric: "download_mbps", operator: "lt", value: 100 }, snap)).toBe(true);
    expect(evaluateCondition({ metric: "download_mbps", operator: "between", value: [80, 98] }, snap)).toBe(true);
    expect(evaluateCondition({ metric: "download_mbps", operator: "between", value: [10, 50] }, snap)).toBe(false);
  });

  it("handles boolean and existence operators", () => {
    expect(evaluateCondition({ metric: "https_reachable", operator: "isFalse" }, snap)).toBe(true);
    expect(evaluateCondition({ metric: "ipv6_available", operator: "isTrue" }, snap)).toBe(true);
    expect(evaluateCondition({ metric: "download_mbps", operator: "exists" }, snap)).toBe(true);
    expect(evaluateCondition({ metric: "upload_mbps", operator: "exists" }, snap)).toBe(false);
  });

  it("returns false for a missing metric rather than throwing", () => {
    expect(evaluateCondition({ metric: "jitter_ms", operator: "gt", value: 5 }, snap)).toBe(false);
  });

  it("treats a boolean metric as non-numeric for scalar ops", () => {
    expect(evaluateCondition({ metric: "https_reachable", operator: "gt", value: 0 }, snap)).toBe(false);
  });
});

describe("buildSnapshot", () => {
  it("drops failed measurements", () => {
    const snap = buildSnapshot([m("download_mbps", null, false), m("upload_mbps", 20)]);
    expect(snap.download_mbps).toBeUndefined();
    expect(snap.upload_mbps).toBe(20);
  });

  it("computes derived metrics", () => {
    const snap = buildSnapshot(
      [
        m("download_mbps", 45),
        m("upload_mbps", 5),
        m("latency_unloaded_ms", 20),
        m("latency_loaded_down_ms", 220),
      ],
      { expectedDownloadMbps: 300, expectedLinkMbps: 1000 },
    );
    expect(snap.loaded_latency_increase_ms).toBe(200);
    expect(snap.download_pct_of_expected).toBeCloseTo(15);
    expect(snap.download_upload_ratio).toBeCloseTo(9);
    expect(snap.expected_link_mbps).toBe(1000);
  });

  it("never emits a negative loaded-latency increase", () => {
    const snap = buildSnapshot([
      m("latency_unloaded_ms", 50),
      m("latency_loaded_down_ms", 40),
    ]);
    expect(snap.loaded_latency_increase_ms).toBe(0);
  });
});

describe("evaluateRule — gating and confidence", () => {
  it("does not fire when a hard gate is unmet", () => {
    expect(evaluateRule(rule("high_packet_loss"), { packet_loss_pct: 1 })).toBeNull();
  });

  it("fires and raises confidence with supporting evidence", () => {
    const weak = evaluateRule(rule("high_packet_loss"), { packet_loss_pct: 2 });
    const strong = evaluateRule(rule("high_packet_loss"), { packet_loss_pct: 8, jitter_ms: 40 });
    expect(weak).not.toBeNull();
    expect(strong).not.toBeNull();
    expect(strong!.confidenceScore).toBeGreaterThan(weak!.confidenceScore);
  });

  it("lowers confidence when contradicting evidence is present", () => {
    const clean = evaluateRule(rule("provisioning_mismatch"), {
      download_pct_of_expected: 20,
    });
    const contradicted = evaluateRule(rule("provisioning_mismatch"), {
      download_pct_of_expected: 20,
      packet_loss_pct: 6,
      loaded_latency_increase_ms: 250,
    });
    expect(clean!.confidenceScore).toBeGreaterThan(contradicted!.confidenceScore);
    expect(contradicted!.contradictions.length).toBeGreaterThan(0);
  });

  it("caps confidence at the rule's maxConfidence (indirect web evidence)", () => {
    // Pile on supporting evidence; internet_unreachable caps at highly_likely.
    const f = evaluateRule(rule("internet_unreachable"), {
      https_reachable: false,
      download_mbps: 0,
      dns_lookup_ms: 0,
    });
    expect(f!.confidence).toBe("highly_likely");
    expect(f!.confidence).not.toBe("confirmed");
  });

  it("keeps the info-level asymmetry rule at 'possible' and never higher", () => {
    const f = evaluateRule(rule("highly_asymmetric_link"), {
      download_upload_ratio: 40,
      upload_mbps: 3,
    });
    expect(f!.confidence).toBe("possible");
  });
});

describe("wired_fast_ethernet_ceiling — the flagship example", () => {
  it("fires in the Fast-Ethernet band with a gigabit expectation", () => {
    const snap = buildSnapshot([m("download_mbps", 94), m("upload_mbps", 92)], {
      expectedLinkMbps: 1000,
    });
    const f = evaluateRule(rule("wired_fast_ethernet_ceiling"), snap);
    expect(f).not.toBeNull();
    expect(f!.confidence).toBe("highly_likely"); // base likely + supporting upload
    expect(f!.nextTests[0]).toMatch(/patch cable/i);
  });

  it("does not fire at true gigabit speeds", () => {
    const snap = buildSnapshot([m("download_mbps", 640)], { expectedLinkMbps: 1000 });
    expect(evaluateRule(rule("wired_fast_ethernet_ceiling"), snap)).toBeNull();
  });

  it("does not fire without a gigabit expectation entered", () => {
    const snap = buildSnapshot([m("download_mbps", 94)]);
    expect(evaluateRule(rule("wired_fast_ethernet_ceiling"), snap)).toBeNull();
  });
});

describe("runRules — ordering and summary", () => {
  it("sorts most-severe first", () => {
    const snap = buildSnapshot(
      [
        m("https_reachable", false), // critical
        m("packet_loss_pct", 6), // high
        m("dns_lookup_ms", 500), // high
      ],
    );
    const findings = runRules(snap);
    expect(findings[0].severity).toBe("critical");
    expect(findings.length).toBeGreaterThanOrEqual(2);
  });

  it("returns a clean bill of health when nothing fires", () => {
    const snap = buildSnapshot([
      m("https_reachable", true),
      m("download_mbps", 400),
      m("upload_mbps", 40),
      m("packet_loss_pct", 0),
      m("dns_lookup_ms", 20),
      m("latency_unloaded_ms", 15),
      m("latency_loaded_down_ms", 25),
    ]);
    const findings = runRules(snap);
    expect(findings).toHaveLength(0);
    expect(summarize(findings)).toMatch(/no problems detected/i);
  });

  it("summary headlines the top finding with a confidence word", () => {
    const findings = runRules(buildSnapshot([m("https_reachable", false)]));
    expect(summarize(findings)).toMatch(/very likely/i);
  });
});

describe("rule library integrity", () => {
  it("every rule has unique id, non-empty guidance, and a sane confidence cap", () => {
    const ids = new Set<string>();
    const order = ["inconclusive", "possible", "likely", "highly_likely", "confirmed"];
    for (const r of RULE_LIBRARY as Rule[]) {
      expect(ids.has(r.id), `duplicate id ${r.id}`).toBe(false);
      ids.add(r.id);
      expect(r.conditions.length).toBeGreaterThan(0);
      expect(r.clientExplanation.length).toBeGreaterThan(0);
      expect(r.technicianExplanation.length).toBeGreaterThan(0);
      expect(r.nextTests.length).toBeGreaterThan(0);
      expect(order.indexOf(r.maxConfidence)).toBeGreaterThanOrEqual(order.indexOf(r.baseConfidence));
    }
  });
});
