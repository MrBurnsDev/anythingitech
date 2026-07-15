/**
 * Project SignalPath — shared diagnostic types.
 *
 * This module is deliberately framework-agnostic and dependency-free: no React,
 * no browser globals, no Node APIs. It is the portable core that the web app,
 * a future native iOS app, and the backend rules engine can all share. Keep it
 * that way — platform-specific measurement code lives in the adapter layer
 * (e.g. `measurements.ts`), never here.
 */

/** Confidence levels, per the product spec §14. Ordered least → most certain. */
export type ConfidenceLevel =
  | "inconclusive"
  | "possible"
  | "likely"
  | "highly_likely"
  | "confirmed";

/** Severity of a finding — drives sort order and colour in reports. */
export type Severity = "info" | "low" | "medium" | "high" | "critical";

/** Which network layer a finding implicates. Mirrors the rule categories §13. */
export type FindingCategory =
  | "internet"
  | "gateway"
  | "ethernet"
  | "wifi"
  | "dns"
  | "device";

/**
 * Normalized metric keys the rules engine reasons over. A given platform fills
 * in whatever it can measure; missing keys are simply `undefined` and rules
 * that depend on them will not fire. Derived keys (ratios, deltas) are computed
 * by `buildSnapshot`.
 */
export type MetricKey =
  // Raw measurements
  | "download_mbps"
  | "upload_mbps"
  | "latency_unloaded_ms"
  | "latency_loaded_down_ms"
  | "jitter_ms"
  | "packet_loss_pct"
  | "dns_lookup_ms"
  | "https_reachable"
  | "captive_portal_suspected"
  | "ipv4_available"
  | "ipv6_available"
  | "public_ip"
  // Technician-entered context
  | "expected_download_mbps"
  | "expected_upload_mbps"
  | "expected_link_mbps"
  // Derived (computed in buildSnapshot)
  | "loaded_latency_increase_ms"
  | "download_pct_of_expected"
  | "upload_pct_of_expected"
  | "download_upload_ratio";

export type MetricValue = number | boolean | string | null;

/** The flat view of the world the rules engine evaluates against. */
export type MetricSnapshot = Partial<Record<MetricKey, MetricValue>>;

/** A single raw measurement result, stored verbatim on the session. */
export interface Measurement {
  key: MetricKey;
  value: MetricValue;
  unit?: string;
  /** Whether the measurement itself completed (not whether the value is "good"). */
  success: boolean;
  target?: string;
  startedAt: number; // epoch ms
  durationMs?: number;
  errorCode?: string;
  metadata?: Record<string, unknown>;
}

/** Technician-supplied context that can't be measured from a browser. */
export interface AssessmentContext {
  expectedDownloadMbps?: number;
  expectedUploadMbps?: number;
  /** Negotiated/expected wired link rate in Mbps (e.g. 1000 for gigabit). */
  expectedLinkMbps?: number;
  notes?: string;
}

// ---------------------------------------------------------------------------
// Rules engine
// ---------------------------------------------------------------------------

export type Operator =
  | "gt"
  | "gte"
  | "lt"
  | "lte"
  | "eq"
  | "neq"
  | "between"
  | "exists"
  | "isTrue"
  | "isFalse";

export interface Condition {
  metric: MetricKey;
  operator: Operator;
  /** number for scalar ops, [min,max] for `between`, omitted for existence/boolean ops. */
  value?: number | [number, number];
}

/**
 * A deterministic diagnostic rule. `conditions` are hard gates — every one must
 * pass for the rule to fire. `supporting`/`contradicting` never gate firing;
 * they only raise or lower the confidence score (§14).
 */
export interface Rule {
  id: string;
  version: number;
  title: string;
  category: FindingCategory;
  severity: Severity;
  /** All must be satisfied for the finding to be produced. */
  conditions: Condition[];
  /** Each satisfied condition raises confidence. */
  supporting?: Condition[];
  /** Each satisfied condition lowers confidence. */
  contradicting?: Condition[];
  /** Starting confidence before supporting/contradicting adjustments. */
  baseConfidence: ConfidenceLevel;
  /**
   * Confidence is capped here unless direct evidence is present. Browser
   * measurements are indirect, so most web rules cap at "highly_likely".
   * Only rules with genuinely direct evidence set this to "confirmed".
   */
  maxConfidence: ConfidenceLevel;
  clientExplanation: string;
  technicianExplanation: string;
  /** Ordered next tests the technician should run. */
  nextTests: string[];
  workaround?: string;
  remediation?: string;
}

export interface Finding {
  ruleId: string;
  ruleVersion: number;
  title: string;
  category: FindingCategory;
  severity: Severity;
  confidence: ConfidenceLevel;
  /** 0–100 raw score behind the confidence label, for debugging/telemetry. */
  confidenceScore: number;
  /** Human-readable metric facts that satisfied the rule. */
  evidence: string[];
  /** Human-readable contradicting facts, if any (kept — never hidden). */
  contradictions: string[];
  clientExplanation: string;
  technicianExplanation: string;
  nextTests: string[];
  workaround?: string;
  remediation?: string;
}

export interface AssessmentResult {
  rulesVersion: string;
  startedAt: number;
  completedAt: number;
  context: AssessmentContext;
  measurements: Measurement[];
  snapshot: MetricSnapshot;
  findings: Finding[];
  /** One-line plain-language headline for the client report. */
  headline: string;
}
