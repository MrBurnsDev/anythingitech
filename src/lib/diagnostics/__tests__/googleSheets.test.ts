import { describe, it, expect } from "vitest";
import {
  buildSessionRow,
  buildFindingRows,
  SESSIONS_HEADER,
  FINDINGS_HEADER,
  googleSheetsConfigured,
} from "../googleSheets";
import type { AssessmentResult, Finding } from "../types";

const finding: Finding = {
  ruleId: "high_packet_loss",
  ruleVersion: 1,
  title: "Elevated packet loss",
  category: "internet",
  severity: "high",
  confidence: "highly_likely",
  confidenceScore: 88,
  evidence: ["packet loss pct: 8", "jitter ms: 40"],
  contradictions: [],
  clientExplanation: "c",
  technicianExplanation: "t",
  nextTests: ["Compare wired vs Wi-Fi", "Test near AP"],
};

const result: AssessmentResult = {
  rulesVersion: "0.1.0",
  startedAt: 0,
  completedAt: Date.UTC(2026, 6, 15, 12, 0, 0),
  context: {},
  measurements: [],
  snapshot: {
    download_mbps: 94,
    upload_mbps: 88,
    packet_loss_pct: 8,
    https_reachable: true,
    ipv6_available: false,
    public_ip: "203.0.113.7",
  },
  findings: [finding],
  headline: "Very likely: elevated packet loss.",
};

describe("buildSessionRow", () => {
  const row = buildSessionRow(result, "Smith — living room", "sess-1");

  it("has one cell per Sessions header column", () => {
    expect(row).toHaveLength(SESSIONS_HEADER.length);
  });

  it("places identity + summary fields correctly", () => {
    expect(row[0]).toBe("sess-1");
    expect(row[1]).toBe("2026-07-15T12:00:00.000Z");
    expect(row[2]).toBe("Smith — living room");
    expect(row[3]).toBe("Very likely: elevated packet loss.");
    expect(row[4]).toBe("0.1.0");
  });

  it("renders booleans as Yes/No and missing metrics as empty", () => {
    expect(row[14]).toBe("Yes"); // https_reachable = true
    expect(row[13]).toBe("No"); // ipv6_available = false
    expect(row[7]).toBe(""); // latency_unloaded_ms missing
  });

  it("includes the public IP and top-finding summary", () => {
    expect(row).toContain("203.0.113.7");
    expect(row[20]).toBe("Elevated packet loss");
    expect(row[21]).toBe("highly_likely");
    expect(row[22]).toBe(1);
  });
});

describe("buildFindingRows", () => {
  const rows = buildFindingRows(result, "Smith — living room", "sess-1");

  it("emits one row per finding, each matching the header width", () => {
    expect(rows).toHaveLength(1);
    expect(rows[0]).toHaveLength(FINDINGS_HEADER.length);
  });

  it("links to the session and joins list fields", () => {
    expect(rows[0][0]).toBe("sess-1");
    expect(rows[0][3]).toBe("Elevated packet loss");
    expect(rows[0][8]).toBe("packet loss pct: 8; jitter ms: 40");
    expect(rows[0][10]).toBe("Compare wired vs Wi-Fi; Test near AP");
  });

  it("returns an empty array when there are no findings", () => {
    expect(buildFindingRows({ ...result, findings: [] }, "x", "s")).toHaveLength(0);
  });
});

describe("googleSheetsConfigured", () => {
  const base = {
    clientId: "",
    sessionsSpreadsheetId: "",
    findingsSpreadsheetId: "",
    sessionsSheet: "Sessions",
    findingsSheet: "Findings",
  };

  it("is false until all three ids are present", () => {
    expect(googleSheetsConfigured(base)).toBe(false);
    expect(googleSheetsConfigured({ ...base, clientId: "x" })).toBe(false);
    expect(
      googleSheetsConfigured({ ...base, clientId: "x", sessionsSpreadsheetId: "y" }),
    ).toBe(false);
  });

  it("is true once client id + both spreadsheet ids are set", () => {
    expect(
      googleSheetsConfigured({
        ...base,
        clientId: "x",
        sessionsSpreadsheetId: "y",
        findingsSpreadsheetId: "z",
      }),
    ).toBe(true);
  });
});
