/**
 * Video-call / VoIP readiness grading — pure, unit-tested.
 * Combines real WebRTC facts (UDP reachability, NAT type) with jitter and
 * packet loss into a plain Good / Fair / Poor verdict for calls.
 */

export type ReadinessGrade = "Good" | "Fair" | "Poor";
export type FactorStatus = "good" | "warn" | "bad";

export interface VoipInput {
  /** UDP egress works (STUN produced a server-reflexive candidate). */
  udpWorks: boolean;
  /** true = symmetric NAT, false = cone/friendly, null = unknown. */
  symmetricNat: boolean | null;
  jitterMs: number | null;
  lossPct: number | null;
}

export interface VoipFactor {
  label: string;
  status: FactorStatus;
  detail: string;
}

export interface VoipResult {
  grade: ReadinessGrade;
  headline: string;
  factors: VoipFactor[];
}

const r1 = (n: number) => Math.round(n * 10) / 10;

export function videoCallGrade(input: VoipInput): VoipResult {
  const factors: VoipFactor[] = [];

  // UDP reachability — the single biggest factor for real-time media.
  if (input.udpWorks) {
    factors.push({
      label: "UDP connectivity",
      status: "good",
      detail: "UDP works — a direct media path is available.",
    });
  } else {
    factors.push({
      label: "UDP connectivity",
      status: "bad",
      detail: "UDP appears blocked — calls fall back to slower TCP relays, which adds lag.",
    });
  }

  // NAT type.
  if (input.symmetricNat === true) {
    factors.push({
      label: "NAT type",
      status: "warn",
      detail: "Symmetric NAT — peer-to-peer often needs a relay (TURN), adding latency.",
    });
  } else if (input.symmetricNat === false) {
    factors.push({
      label: "NAT type",
      status: "good",
      detail: "Cone NAT — friendly to direct peer connections.",
    });
  } else {
    factors.push({
      label: "NAT type",
      status: "warn",
      detail: "Could not determine NAT type.",
    });
  }

  // Jitter.
  if (input.jitterMs === null) {
    factors.push({ label: "Jitter", status: "warn", detail: "Not measured." });
  } else if (input.jitterMs >= 40) {
    factors.push({
      label: "Jitter",
      status: "bad",
      detail: `${r1(input.jitterMs)} ms — high; expect choppy audio/video.`,
    });
  } else if (input.jitterMs >= 20) {
    factors.push({
      label: "Jitter",
      status: "warn",
      detail: `${r1(input.jitterMs)} ms — borderline.`,
    });
  } else {
    factors.push({ label: "Jitter", status: "good", detail: `${r1(input.jitterMs)} ms — smooth.` });
  }

  // Packet loss.
  if (input.lossPct === null) {
    factors.push({ label: "Packet loss", status: "warn", detail: "Not measured." });
  } else if (input.lossPct >= 3) {
    factors.push({
      label: "Packet loss",
      status: "bad",
      detail: `${r1(input.lossPct)}% — high; audio will drop out.`,
    });
  } else if (input.lossPct >= 1) {
    factors.push({
      label: "Packet loss",
      status: "warn",
      detail: `${r1(input.lossPct)}% — some loss; occasional glitches.`,
    });
  } else {
    factors.push({ label: "Packet loss", status: "good", detail: `${r1(input.lossPct)}% — clean.` });
  }

  // Grade derives directly from the factor statuses: any hard failure → Poor,
  // any caution (incl. things we couldn't measure) → Fair, else Good.
  const grade: ReadinessGrade = factors.some((f) => f.status === "bad")
    ? "Poor"
    : factors.some((f) => f.status === "warn")
      ? "Fair"
      : "Good";
  const headline =
    grade === "Good"
      ? "Ready for video calls"
      : grade === "Fair"
        ? "Usable, with some risk of glitches"
        : "Likely to struggle on calls";

  return { grade, headline, factors };
}
