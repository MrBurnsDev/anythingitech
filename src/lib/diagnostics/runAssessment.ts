/**
 * Assessment orchestrator (spec Module A — "One-Tap Network Assessment").
 *
 * Runs the ordered browser measurement sequence, reports progress step-by-step,
 * then folds the raw measurements + technician context through the rules engine
 * into an interpreted `AssessmentResult`. Cancellable via AbortSignal.
 */

import { diagnosticsConfig, RULES_VERSION, type DiagnosticsConfig } from "./config";
import {
  measureDnsTiming,
  measureDownload,
  measureIpVersions,
  measureLatencyJitterLoss,
  measureReachabilityAndIp,
  measureUpload,
} from "./measurements";
import { buildSnapshot, runRules, summarize } from "./rules";
import type { AssessmentContext, AssessmentResult, Measurement } from "./types";

export type StepId =
  | "reachability"
  | "ip_versions"
  | "dns"
  | "latency"
  | "download"
  | "upload"
  | "interpret";

export interface StepProgress {
  id: StepId;
  label: string;
  /** 0 = first step. Total steps = STEP_SEQUENCE.length. */
  index: number;
  total: number;
  status: "running" | "done";
  measurements?: Measurement[];
}

export const STEP_SEQUENCE: { id: StepId; label: string }[] = [
  { id: "reachability", label: "Checking internet reachability" },
  { id: "ip_versions", label: "Testing IPv4 and IPv6" },
  { id: "dns", label: "Measuring DNS resolution" },
  { id: "latency", label: "Measuring latency, jitter, and loss" },
  { id: "download", label: "Testing download speed and loaded latency" },
  { id: "upload", label: "Testing upload speed" },
  { id: "interpret", label: "Interpreting results" },
];

export interface RunOptions {
  context?: AssessmentContext;
  config?: DiagnosticsConfig;
  signal?: AbortSignal;
  onProgress?: (p: StepProgress) => void;
}

function aborted(signal?: AbortSignal) {
  if (signal?.aborted) throw new DOMException("Assessment cancelled", "AbortError");
}

/** Run the full one-tap assessment. */
export async function runAssessment(opts: RunOptions = {}): Promise<AssessmentResult> {
  const { context = {}, config = diagnosticsConfig, signal, onProgress } = opts;
  const startedAt = Date.now();
  const measurements: Measurement[] = [];
  const total = STEP_SEQUENCE.length;

  const runStep = async (
    index: number,
    fn: () => Promise<Measurement[]>,
  ): Promise<void> => {
    aborted(signal);
    const step = STEP_SEQUENCE[index];
    onProgress?.({ ...step, index, total, status: "running" });
    const result = await fn();
    measurements.push(...result);
    onProgress?.({ ...step, index, total, status: "done", measurements: result });
  };

  await runStep(0, () => measureReachabilityAndIp(config));
  await runStep(1, () => measureIpVersions(config));
  await runStep(2, () => measureDnsTiming(config));
  await runStep(3, () => measureLatencyJitterLoss(config));
  await runStep(4, () => measureDownload(config));
  await runStep(5, () => measureUpload(config));

  aborted(signal);
  const interpret = STEP_SEQUENCE[6];
  onProgress?.({ ...interpret, index: 6, total, status: "running" });

  const snapshot = buildSnapshot(measurements, context);
  const findings = runRules(snapshot);
  const headline = summarize(findings);

  onProgress?.({ ...interpret, index: 6, total, status: "done" });

  return {
    rulesVersion: RULES_VERSION,
    startedAt,
    completedAt: Date.now(),
    context,
    measurements,
    snapshot,
    findings,
    headline,
  };
}
