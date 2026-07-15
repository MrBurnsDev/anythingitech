/**
 * Human-friendly grading of measurements — turns raw numbers into an at-a-glance
 * letter a client immediately understands. Pure and framework-agnostic.
 */

export type Grade = "A" | "B" | "C" | "D" | "F";

export interface GradeResult {
  grade: Grade;
  /** Short plain-language label for the grade. */
  label: string;
}

/**
 * Bufferbloat grade from the latency increase under load (loaded − idle), in ms.
 * Thresholds follow the common DSLReports/Waveform convention: a well-managed
 * link adds only a few ms under load; hundreds of ms wrecks calls and gaming.
 */
export function bufferbloatGrade(loadedIncreaseMs: number): GradeResult {
  if (loadedIncreaseMs < 30) return { grade: "A", label: "Excellent — no bufferbloat" };
  if (loadedIncreaseMs < 60) return { grade: "B", label: "Good" };
  if (loadedIncreaseMs < 100) return { grade: "C", label: "Fair" };
  if (loadedIncreaseMs < 200) return { grade: "D", label: "Poor — calls will suffer" };
  return { grade: "F", label: "Severe — unusable under load" };
}
