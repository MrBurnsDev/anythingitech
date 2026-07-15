/**
 * Deterministic diagnostic rules engine (spec Module F + §14 confidence model).
 *
 * Framework-agnostic and pure — safe to unit test and to share with iOS/backend.
 * The engine takes a normalized MetricSnapshot and returns interpreted Findings.
 * It never presents a symptom as a proven cause: confidence is scored from
 * corroborating evidence and capped by how direct that evidence is.
 */

import type {
  AssessmentContext,
  Condition,
  ConfidenceLevel,
  Finding,
  Measurement,
  MetricKey,
  MetricSnapshot,
  MetricValue,
  Rule,
} from "./types";

// ---------------------------------------------------------------------------
// Confidence scoring
// ---------------------------------------------------------------------------

const CONFIDENCE_ORDER: ConfidenceLevel[] = [
  "inconclusive",
  "possible",
  "likely",
  "highly_likely",
  "confirmed",
];

const BASE_SCORE: Record<ConfidenceLevel, number> = {
  inconclusive: 20,
  possible: 40,
  likely: 60,
  highly_likely: 78,
  confirmed: 95,
};

const SUPPORTING_BONUS = 10;
const CONTRADICTING_PENALTY = 25;

function scoreToLevel(score: number): ConfidenceLevel {
  if (score >= 90) return "confirmed";
  if (score >= 70) return "highly_likely";
  if (score >= 50) return "likely";
  if (score >= 30) return "possible";
  return "inconclusive";
}

function capLevel(level: ConfidenceLevel, max: ConfidenceLevel): ConfidenceLevel {
  return CONFIDENCE_ORDER.indexOf(level) > CONFIDENCE_ORDER.indexOf(max) ? max : level;
}

// ---------------------------------------------------------------------------
// Condition evaluation
// ---------------------------------------------------------------------------

function asNumber(v: MetricValue | undefined): number | undefined {
  return typeof v === "number" && Number.isFinite(v) ? v : undefined;
}

/**
 * Evaluate a single condition. Returns false (never throws) when the referenced
 * metric is missing or the wrong type — a missing measurement can't satisfy a
 * gate, which is exactly the "missing measurements lower confidence" behaviour.
 */
export function evaluateCondition(cond: Condition, snapshot: MetricSnapshot): boolean {
  const raw = snapshot[cond.metric];

  switch (cond.operator) {
    case "exists":
      return raw !== undefined && raw !== null;
    case "isTrue":
      return raw === true;
    case "isFalse":
      return raw === false;
    default:
      break;
  }

  const n = asNumber(raw);
  if (n === undefined) return false;

  switch (cond.operator) {
    case "gt":
      return typeof cond.value === "number" && n > cond.value;
    case "gte":
      return typeof cond.value === "number" && n >= cond.value;
    case "lt":
      return typeof cond.value === "number" && n < cond.value;
    case "lte":
      return typeof cond.value === "number" && n <= cond.value;
    case "eq":
      return typeof cond.value === "number" && n === cond.value;
    case "neq":
      return typeof cond.value === "number" && n !== cond.value;
    case "between":
      return (
        Array.isArray(cond.value) && n >= cond.value[0] && n <= cond.value[1]
      );
    default:
      return false;
  }
}

function describeCondition(cond: Condition, snapshot: MetricSnapshot): string {
  const raw = snapshot[cond.metric];
  const label = cond.metric.replace(/_/g, " ");
  const val =
    typeof raw === "number" ? Number(raw.toFixed(1)) : String(raw);
  return `${label}: ${val}`;
}

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

/** Evaluate one rule against a snapshot; returns a Finding or null if it doesn't fire. */
export function evaluateRule(rule: Rule, snapshot: MetricSnapshot): Finding | null {
  const gatesPass = rule.conditions.every((c) => evaluateCondition(c, snapshot));
  if (!gatesPass) return null;

  let score = BASE_SCORE[rule.baseConfidence];
  const evidence = rule.conditions.map((c) => describeCondition(c, snapshot));
  const contradictions: string[] = [];

  for (const c of rule.supporting ?? []) {
    if (evaluateCondition(c, snapshot)) {
      score += SUPPORTING_BONUS;
      evidence.push(describeCondition(c, snapshot));
    }
  }
  for (const c of rule.contradicting ?? []) {
    if (evaluateCondition(c, snapshot)) {
      score -= CONTRADICTING_PENALTY;
      contradictions.push(describeCondition(c, snapshot));
    }
  }

  score = Math.max(0, Math.min(100, score));
  const confidence = capLevel(scoreToLevel(score), rule.maxConfidence);

  return {
    ruleId: rule.id,
    ruleVersion: rule.version,
    title: rule.title,
    category: rule.category,
    severity: rule.severity,
    confidence,
    confidenceScore: score,
    // Multiple conditions can describe the same metric fact — show each once.
    evidence: [...new Set(evidence)],
    contradictions: [...new Set(contradictions)],
    clientExplanation: rule.clientExplanation,
    technicianExplanation: rule.technicianExplanation,
    nextTests: rule.nextTests,
    workaround: rule.workaround,
    remediation: rule.remediation,
  };
}

const SEVERITY_ORDER: Record<Finding["severity"], number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
  info: 4,
};

/** Run the full rule library, most severe / most confident first. */
export function runRules(snapshot: MetricSnapshot, rules: Rule[] = RULE_LIBRARY): Finding[] {
  const findings = rules
    .map((r) => evaluateRule(r, snapshot))
    .filter((f): f is Finding => f !== null);

  findings.sort((a, b) => {
    if (SEVERITY_ORDER[a.severity] !== SEVERITY_ORDER[b.severity]) {
      return SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
    }
    return b.confidenceScore - a.confidenceScore;
  });

  return findings;
}

// ---------------------------------------------------------------------------
// Snapshot construction (raw measurements + context → normalized + derived)
// ---------------------------------------------------------------------------

/**
 * Fold raw measurements and technician context into the flat snapshot the
 * engine reasons over, computing derived metrics (deltas and ratios) that
 * several rules depend on.
 */
export function buildSnapshot(
  measurements: Measurement[],
  context: AssessmentContext = {},
): MetricSnapshot {
  const snap: MetricSnapshot = {};
  for (const m of measurements) {
    // Only surface a value the engine can trust; failed measurements stay absent.
    if (m.success && m.value !== null && m.value !== undefined) {
      snap[m.key] = m.value;
    }
  }

  if (context.expectedDownloadMbps !== undefined)
    snap.expected_download_mbps = context.expectedDownloadMbps;
  if (context.expectedUploadMbps !== undefined)
    snap.expected_upload_mbps = context.expectedUploadMbps;
  if (context.expectedLinkMbps !== undefined)
    snap.expected_link_mbps = context.expectedLinkMbps;

  const get = (k: MetricKey) => asNumber(snap[k]);

  const unloaded = get("latency_unloaded_ms");
  const loaded = get("latency_loaded_down_ms");
  if (unloaded !== undefined && loaded !== undefined) {
    snap.loaded_latency_increase_ms = Math.max(0, loaded - unloaded);
  }

  const dl = get("download_mbps");
  const ul = get("upload_mbps");
  const expDl = get("expected_download_mbps");
  const expUl = get("expected_upload_mbps");
  if (dl !== undefined && expDl !== undefined && expDl > 0) {
    snap.download_pct_of_expected = (dl / expDl) * 100;
  }
  if (ul !== undefined && expUl !== undefined && expUl > 0) {
    snap.upload_pct_of_expected = (ul / expUl) * 100;
  }
  if (dl !== undefined && ul !== undefined && ul > 0) {
    snap.download_upload_ratio = dl / ul;
  }

  return snap;
}

/** Plain-language one-liner for the top of the client report. */
export function summarize(findings: Finding[]): string {
  if (findings.length === 0) {
    return "No problems detected — the connection is performing within expected ranges.";
  }
  const top = findings[0];
  const label: Record<Finding["confidence"], string> = {
    confirmed: "Confirmed",
    highly_likely: "Very likely",
    likely: "Likely",
    possible: "Possible",
    inconclusive: "Inconclusive",
  };
  return `${label[top.confidence]}: ${top.title.toLowerCase()}.`;
}

// ---------------------------------------------------------------------------
// Initial rule library (spec §18 sprint + §13 categories)
// ---------------------------------------------------------------------------

export const RULE_LIBRARY: Rule[] = [
  {
    id: "internet_unreachable",
    version: 1,
    title: "Internet appears unreachable",
    category: "internet",
    severity: "critical",
    conditions: [{ metric: "https_reachable", operator: "isFalse" }],
    supporting: [
      { metric: "download_mbps", operator: "eq", value: 0 },
      { metric: "dns_lookup_ms", operator: "eq", value: 0 },
    ],
    baseConfidence: "highly_likely",
    maxConfidence: "highly_likely",
    clientExplanation:
      "Your device is connected to the local network, but it could not reach the internet during the test.",
    technicianExplanation:
      "HTTPS reachability probe failed. Isolate local vs. WAN: confirm the device has an IP and can reach the gateway, then test the gateway's own internet connectivity. A failed captive-portal check or DNS failure would narrow this further.",
    nextTests: [
      "Confirm the device has a valid IP address and default gateway",
      "Ping the gateway from a device that supports ICMP",
      "Test the ISP gateway/modem's own internet status lights or admin page",
      "Try a second device on the same network to rule out a device-specific fault",
    ],
    workaround: "Reboot the ISP gateway/modem, then the local router, then retest.",
    remediation: "If the gateway itself has no internet, escalate to the ISP.",
  },
  {
    id: "captive_portal_suspected",
    version: 1,
    title: "Captive portal / sign-in page suspected",
    category: "internet",
    severity: "high",
    conditions: [{ metric: "captive_portal_suspected", operator: "isTrue" }],
    baseConfidence: "likely",
    maxConfidence: "highly_likely",
    clientExplanation:
      "This network looks like it is redirecting to a sign-in or agreement page before it allows internet access.",
    technicianExplanation:
      "A known-good endpoint returned redirected/unexpected content, the classic captive-portal signature. Traffic is being intercepted before it reaches the internet.",
    nextTests: [
      "Open a browser to a plain HTTP site and complete any sign-in page",
      "Confirm whether this is a guest network with a portal",
      "Retest after authenticating to the portal",
    ],
    workaround: "Complete the network's sign-in page, then retest.",
  },
  {
    id: "dns_slow_or_failing",
    version: 1,
    title: "DNS resolution is slow or failing",
    category: "dns",
    severity: "high",
    conditions: [{ metric: "dns_lookup_ms", operator: "gte", value: 300 }],
    supporting: [{ metric: "dns_lookup_ms", operator: "gte", value: 800 }],
    contradicting: [{ metric: "download_mbps", operator: "gte", value: 100 }],
    baseConfidence: "likely",
    maxConfidence: "highly_likely",
    clientExplanation:
      "Websites may load slowly or intermittently because the step that turns website names into addresses is taking too long.",
    technicianExplanation:
      "Measured DNS lookup time is high. Compare resolution against a public resolver (1.1.1.1 / 8.8.8.8) vs. the gateway's resolver, and test hostname vs. direct-IP reachability to confirm DNS is the constraint rather than the path.",
    nextTests: [
      "Compare hostname lookup vs. direct-IP connectivity",
      "Switch the client to 1.1.1.1 or 8.8.8.8 and retest",
      "Check whether the gateway is acting as a slow DNS proxy",
    ],
    workaround: "Set the device or router DNS to a fast public resolver (1.1.1.1).",
    remediation: "Replace or bypass a failing DNS proxy on the local gateway.",
  },
  {
    id: "high_loaded_latency",
    version: 1,
    title: "High latency under load (bufferbloat)",
    category: "internet",
    severity: "medium",
    conditions: [{ metric: "loaded_latency_increase_ms", operator: "gte", value: 100 }],
    supporting: [
      { metric: "loaded_latency_increase_ms", operator: "gte", value: 300 },
      { metric: "jitter_ms", operator: "gte", value: 30 },
    ],
    baseConfidence: "likely",
    maxConfidence: "highly_likely",
    clientExplanation:
      "Downloads and uploads are fast, but the connection becomes laggy while it is busy — this is what hurts video calls and gaming.",
    technicianExplanation:
      "Latency rises sharply under download load (bufferbloat). Confirm on the gateway/router; enable Smart Queue Management (SQM/fq_codel) or set QoS bandwidth limits slightly below the provisioned rate.",
    nextTests: [
      "Repeat unloaded vs. loaded latency to confirm the delta is consistent",
      "Check whether the router supports SQM / fq_codel",
      "Test on wired to rule out Wi-Fi contention",
    ],
    remediation: "Enable SQM/QoS on the router to tame the upstream/downstream buffer.",
  },
  {
    id: "high_packet_loss",
    version: 1,
    title: "Elevated packet loss",
    category: "internet",
    severity: "high",
    conditions: [{ metric: "packet_loss_pct", operator: "gte", value: 2 }],
    supporting: [
      { metric: "packet_loss_pct", operator: "gte", value: 5 },
      { metric: "jitter_ms", operator: "gte", value: 30 },
    ],
    baseConfidence: "likely",
    maxConfidence: "highly_likely",
    clientExplanation:
      "Some data is being lost in transit, which causes stalls, buffering, and dropped calls even when speeds look fine.",
    technicianExplanation:
      "Repeated probes failed above the noise threshold. Loss localizes the fault: test wired vs. Wi-Fi, near vs. far from the AP, and LAN vs. internet to separate cabling, wireless, and WAN causes.",
    nextTests: [
      "Compare packet loss on wired vs. Wi-Fi",
      "Test close to the access point vs. the problem location",
      "Test a local (LAN) target vs. an internet target",
      "Inspect cabling and terminations if wired loss persists",
    ],
  },
  {
    id: "provisioning_mismatch",
    version: 1,
    title: "Speed well below the provisioned plan",
    category: "internet",
    severity: "medium",
    conditions: [{ metric: "download_pct_of_expected", operator: "lt", value: 50 }],
    supporting: [
      { metric: "download_pct_of_expected", operator: "lt", value: 25 },
      { metric: "upload_pct_of_expected", operator: "lt", value: 50 },
    ],
    // Bufferbloat/loss point at congestion, not a provisioning shortfall.
    contradicting: [
      { metric: "packet_loss_pct", operator: "gte", value: 2 },
      { metric: "loaded_latency_increase_ms", operator: "gte", value: 100 },
    ],
    baseConfidence: "possible",
    maxConfidence: "likely",
    clientExplanation:
      "Measured speed is much lower than the plan you are paying for.",
    technicianExplanation:
      "Throughput is under half the technician-entered expected rate with no strong congestion signal. Rule out the test path and local bottlenecks (Wi-Fi, a 100 Mbps link, an old device) before attributing this to ISP provisioning.",
    nextTests: [
      "Retest wired, directly at the gateway, to remove Wi-Fi and LAN variables",
      "Confirm the client NIC/link is not capped at 100 Mbps",
      "Run a second test server/endpoint to rule out test-path bias",
      "Check the ISP portal for the actual provisioned rate",
    ],
    remediation: "If wired-at-gateway still underperforms, escalate provisioning to the ISP.",
  },
  {
    id: "wired_fast_ethernet_ceiling",
    version: 1,
    title: "Possible 100 Mbps Ethernet ceiling",
    category: "ethernet",
    severity: "medium",
    conditions: [
      { metric: "download_mbps", operator: "between", value: [80, 98] },
      { metric: "expected_link_mbps", operator: "gte", value: 1000 },
    ],
    supporting: [{ metric: "upload_mbps", operator: "between", value: [80, 98] }],
    baseConfidence: "likely",
    maxConfidence: "highly_likely",
    clientExplanation:
      "The wired connection looks like it is stuck at an older 100 Mbps speed even though the equipment should support 1000 Mbps.",
    technicianExplanation:
      "Throughput is pinned in the classic Fast-Ethernet band (~90–95 Mbps) while the link is expected to negotiate 1 Gbps — often one bad pair, a poor termination, or a 100 Mbps patch cable. Confirm the port's negotiated rate directly.",
    nextTests: [
      "Replace the patch cables at both ends and retest",
      "Check the switch/port negotiated link rate",
      "Run an 8-conductor cable test for an open/shorted pair",
      "Re-terminate both ends if the tester flags a fault",
    ],
    remediation: "Re-terminate or replace the run; verify the port renegotiates at 1 Gbps.",
  },
  {
    id: "highly_asymmetric_link",
    version: 1,
    title: "Highly asymmetric upload",
    category: "internet",
    severity: "info",
    conditions: [
      { metric: "download_upload_ratio", operator: "gte", value: 10 },
      { metric: "upload_mbps", operator: "lt", value: 10 },
    ],
    baseConfidence: "possible",
    maxConfidence: "possible",
    clientExplanation:
      "Downloads are much faster than uploads. This is normal for many cable plans, but a low upload can affect video calls and cloud backups.",
    technicianExplanation:
      "Download/upload ratio is very high with a low absolute upload. Usually expected for the plan tier — note it, and only flag if the client's workload (video calls, backups, hosting) is upload-sensitive.",
    nextTests: [
      "Confirm the plan's rated upload speed",
      "Discuss whether the client's usage is upload-sensitive",
    ],
  },
];
