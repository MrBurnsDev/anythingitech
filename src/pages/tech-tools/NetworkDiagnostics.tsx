import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  Gauge,
  Info,
  Loader2,
  Minus,
  Play,
  Printer,
  Save,
  Square,
  Target,
  Trash2,
  XCircle,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { NodeLogo } from "@/components/NodeLogo";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import {
  compareSnapshots,
  deleteSession,
  listSessions,
  runAssessment,
  saveSession,
  summarizeComparison,
  STEP_SEQUENCE,
  type AssessmentContext,
  type AssessmentResult,
  type ConfidenceLevel,
  type Finding,
  type Measurement,
  type MetricDelta,
  type Severity,
  type StepId,
  type StepProgress,
  type StoredSession,
} from "@/lib/diagnostics";

/**
 * Public name for the toolset. Kept as a single constant so it can be rebranded
 * (or driven by the branding config in the product spec §17) without touching
 * the rest of the page.
 */
const TOOL_NAME = "Node Network Navigator";
const TOOL_TAGLINE = "Network health diagnostics";

type Audience = "technician" | "client";
type RunState = "idle" | "running" | "done" | "error";

const CONFIDENCE_LABEL: Record<ConfidenceLevel, string> = {
  confirmed: "Confirmed",
  highly_likely: "Very likely",
  likely: "Likely",
  possible: "Possible",
  inconclusive: "Inconclusive",
};

const SEVERITY_META: Record<Severity, { label: string; dot: string; text: string }> = {
  critical: { label: "Critical", dot: "bg-destructive", text: "text-destructive" },
  high: { label: "High", dot: "bg-destructive/80", text: "text-destructive" },
  medium: { label: "Medium", dot: "bg-amber-500", text: "text-amber-600" },
  low: { label: "Low", dot: "bg-sky-500", text: "text-sky-600" },
  info: { label: "Info", dot: "bg-muted-foreground", text: "text-muted-foreground" },
};

// Friendly labels + units for the raw-measurement table (technician view).
const METRIC_LABEL: Record<string, { label: string; unit?: string }> = {
  download_mbps: { label: "Download", unit: "Mbps" },
  upload_mbps: { label: "Upload", unit: "Mbps" },
  latency_unloaded_ms: { label: "Latency (idle)", unit: "ms" },
  latency_loaded_down_ms: { label: "Latency (under load)", unit: "ms" },
  jitter_ms: { label: "Jitter", unit: "ms" },
  packet_loss_pct: { label: "Packet loss", unit: "%" },
  dns_lookup_ms: { label: "DNS lookup", unit: "ms" },
  https_reachable: { label: "Internet reachable" },
  captive_portal_suspected: { label: "Captive portal" },
  ipv4_available: { label: "IPv4" },
  ipv6_available: { label: "IPv6" },
  public_ip: { label: "Public IP" },
};

function formatValue(m: Measurement): string {
  if (!m.success || m.value === null || m.value === undefined) return "—";
  if (typeof m.value === "boolean") return m.value ? "Yes" : "No";
  const meta = METRIC_LABEL[m.key];
  if (typeof m.value === "number") return `${m.value}${meta?.unit ? ` ${meta.unit}` : ""}`;
  return String(m.value);
}

// Some failures are expected browser limitations, not errors — present them
// as a quiet "not available" rather than an alarming red error code.
const BENIGN_ERRORS = new Set(["timing_unavailable"]);
const ERROR_LABEL: Record<string, string> = {
  timing_unavailable: "not available",
  no_data: "no response",
  unreachable: "unreachable",
  AbortError: "cancelled",
};

const NetworkDiagnostics = () => {
  const [audience, setAudience] = useState<Audience>("technician");
  const [runState, setRunState] = useState<RunState>("idle");
  const [progress, setProgress] = useState<StepProgress | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showContext, setShowContext] = useState(false);
  const [context, setContext] = useState<AssessmentContext>({});
  const [label, setLabel] = useState("");
  const [history, setHistory] = useState<StoredSession[]>([]);
  const [baselineId, setBaselineId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    setHistory(listSessions());
  }, []);

  const numeric = (v: string): number | undefined => {
    const n = Number(v);
    return v.trim() !== "" && Number.isFinite(n) && n >= 0 ? n : undefined;
  };

  const handleSave = useCallback(() => {
    if (!result) return;
    saveSession(result, label);
    setSaved(true);
    setHistory(listSessions());
  }, [result, label]);

  const handleDelete = useCallback(
    (id: string) => {
      deleteSession(id);
      setBaselineId((cur) => (cur === id ? null : cur));
      setHistory(listSessions());
    },
    [],
  );

  const baseline = useMemo(
    () => history.find((s) => s.id === baselineId) ?? null,
    [history, baselineId],
  );

  const comparison = useMemo<MetricDelta[] | null>(
    () => (result && baseline ? compareSnapshots(result.snapshot, baseline.result.snapshot) : null),
    [result, baseline],
  );

  const start = useCallback(async () => {
    setRunState("running");
    setResult(null);
    setError(null);
    setProgress(null);
    setSaved(false);
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await runAssessment({
        context,
        signal: controller.signal,
        onProgress: (p) => setProgress(p),
      });
      setResult(res);
      setRunState("done");
    } catch (e) {
      if (e instanceof DOMException && e.name === "AbortError") {
        setRunState("idle");
        setProgress(null);
        return;
      }
      setError(e instanceof Error ? e.message : "The assessment could not be completed.");
      setRunState("error");
    } finally {
      abortRef.current = null;
    }
  }, [context]);

  const cancel = useCallback(() => abortRef.current?.abort(), []);

  const completedSteps = useMemo<Set<StepId>>(() => {
    if (!progress) return new Set();
    const done = new Set<StepId>();
    for (const s of STEP_SEQUENCE) {
      if (s.id === progress.id) {
        if (progress.status === "done") done.add(s.id);
        break;
      }
      done.add(s.id);
    }
    return done;
  }, [progress]);

  return (
    <SiteLayout>
      <SEO
        title={`${TOOL_NAME} — Network Diagnostics | Anything Itech MV`}
        description="Run a one-tap network health assessment right in your browser: speed, latency, jitter, packet loss, DNS, and IPv4/IPv6 — with an interpreted diagnosis, not just numbers."
        canonical="https://anythingitechmv.com/tech-tools/network-diagnostics"
      />

      <section className="pt-28 md:pt-32 pb-10 border-b border-border print:hidden">
        <div className="container-editorial">
          <p className="text-xs text-muted-foreground mb-4">
            <Link to="/tech-tools" className="hover:text-foreground transition-colors">
              Tech Tools
            </Link>
            <span className="mx-2">/</span>
            <span>Network Diagnostics</span>
          </p>
          <div className="flex items-start gap-4">
            <div className="hidden sm:grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <NodeLogo className="h-7 w-7" />
            </div>
            <div>
              <h1 className="display-lg">
                {TOOL_NAME}
                <span className="ml-3 align-middle text-base font-normal text-muted-foreground">
                  {TOOL_TAGLINE}
                </span>
              </h1>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl leading-relaxed">
                One tap runs an ordered series of tests, then tells you what the numbers
                <em> mean</em> — which layer is most likely at fault and what to test next.
                It doesn't just report a speed.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-editorial grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Control column */}
          <div className="lg:col-span-4 space-y-4 print:hidden">
            <Card>
              <CardContent className="pt-6 space-y-4">
                {runState !== "running" ? (
                  <Button size="lg" className="w-full rounded-full" onClick={start}>
                    <Play className="h-4 w-4" />
                    {result ? "Run again" : "Run assessment"}
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    variant="destructive"
                    className="w-full rounded-full"
                    onClick={cancel}
                  >
                    <Square className="h-4 w-4" />
                    Cancel
                  </Button>
                )}

                {/* Technician context (optional) */}
                <button
                  type="button"
                  className="flex w-full items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setShowContext((s) => !s)}
                  aria-expanded={showContext}
                >
                  <span>Technician context (optional)</span>
                  <ChevronDown
                    className={cn("h-4 w-4 transition-transform", showContext && "rotate-180")}
                  />
                </button>

                {showContext && (
                  <div className="space-y-3 pt-1">
                    <p className="text-xs text-muted-foreground">
                      Entering the expected plan and link speed unlocks provisioning and
                      100&nbsp;Mbps-ceiling findings.
                    </p>
                    <div className="space-y-1.5">
                      <Label htmlFor="site-label" className="text-xs">
                        Site / room label
                      </Label>
                      <Input
                        id="site-label"
                        type="text"
                        placeholder="e.g. Smith — living room"
                        value={label}
                        onChange={(e) => setLabel(e.target.value)}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="exp-down" className="text-xs">
                        Expected download (Mbps)
                      </Label>
                      <Input
                        id="exp-down"
                        type="number"
                        min={0}
                        inputMode="numeric"
                        placeholder="e.g. 300"
                        onChange={(e) =>
                          setContext((c) => ({ ...c, expectedDownloadMbps: numeric(e.target.value) }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="exp-up" className="text-xs">
                        Expected upload (Mbps)
                      </Label>
                      <Input
                        id="exp-up"
                        type="number"
                        min={0}
                        inputMode="numeric"
                        placeholder="e.g. 20"
                        onChange={(e) =>
                          setContext((c) => ({ ...c, expectedUploadMbps: numeric(e.target.value) }))
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="exp-link" className="text-xs">
                        Expected wired link (Mbps)
                      </Label>
                      <Input
                        id="exp-link"
                        type="number"
                        min={0}
                        inputMode="numeric"
                        placeholder="e.g. 1000"
                        onChange={(e) =>
                          setContext((c) => ({ ...c, expectedLinkMbps: numeric(e.target.value) }))
                        }
                      />
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Progress */}
            {(runState === "running" || result) && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Test sequence</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2.5">
                  {STEP_SEQUENCE.map((step) => {
                    const isDone = completedSteps.has(step.id) || runState === "done";
                    const isActive =
                      runState === "running" &&
                      progress?.id === step.id &&
                      progress.status === "running";
                    return (
                      <div key={step.id} className="flex items-center gap-2.5 text-sm">
                        {isDone ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        ) : isActive ? (
                          <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />
                        ) : (
                          <span className="h-4 w-4 rounded-full border border-border shrink-0" />
                        )}
                        <span
                          className={cn(
                            isActive ? "text-foreground" : isDone ? "text-foreground" : "text-muted-foreground",
                          )}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            )}

            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle className="text-sm">Runs in your browser</AlertTitle>
              <AlertDescription className="text-xs">
                Throughput tests run several parallel streams and can move ~150–400&nbsp;MB on a
                fast connection — prefer Wi-Fi or an unmetered plan. A browser can't read Wi-Fi
                signal, scan the LAN, or ping the gateway directly; those live in the native app.
              </AlertDescription>
            </Alert>

            <HistoryPanel
              sessions={history}
              baselineId={baselineId}
              onBaseline={(id) => setBaselineId((cur) => (cur === id ? null : id))}
              onDelete={handleDelete}
            />
          </div>

          {/* Results column */}
          <div className="lg:col-span-8 space-y-6">
            {runState === "idle" && !result && <IdleState />}

            {error && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Assessment failed</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {result && (
              <>
                {/* Branded header shown only on the printed / PDF report. */}
                <div className="hidden print:block mb-6 print-avoid-break">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary text-primary-foreground print-exact">
                      <NodeLogo className="h-6 w-6" />
                    </div>
                    <div>
                      <p className="font-semibold leading-tight">
                        Node Network Navigator — Network Diagnostics Report
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Anything iTech MV · anythingitechmv.com · (508) 560-3510
                      </p>
                    </div>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {label ? `${label} · ` : ""}
                    {new Date(result.completedAt).toLocaleString()}
                  </p>
                </div>

                <ResultsHeader
                  result={result}
                  audience={audience}
                  onAudience={setAudience}
                  onSave={handleSave}
                  saved={saved}
                />

                {comparison && baseline && (
                  <ComparisonCard deltas={comparison} baselineLabel={baseline.label} />
                )}

                {result.findings.length === 0 ? (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <AlertTitle>No problems detected</AlertTitle>
                    <AlertDescription>
                      Every measurement landed within expected ranges. If the client still
                      reports trouble, capture context (time of day, specific app, one device
                      vs. all) and compare against a baseline.
                    </AlertDescription>
                  </Alert>
                ) : (
                  <div className="space-y-4">
                    {result.findings.map((f) => (
                      <FindingCard key={f.ruleId} finding={f} audience={audience} />
                    ))}
                  </div>
                )}

                {audience === "technician" && <MeasurementsTable measurements={result.measurements} />}
              </>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

function IdleState() {
  return (
    <Card className="border-dashed">
      <CardContent className="py-16 text-center">
        <div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-full bg-secondary">
          <Gauge className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-lg font-medium">Ready to test</p>
        <p className="mt-2 text-sm text-muted-foreground max-w-md mx-auto">
          Press <span className="font-medium text-foreground">Run assessment</span> to measure
          reachability, DNS, latency, jitter, loss, and throughput — then read the interpreted
          diagnosis here.
        </p>
      </CardContent>
    </Card>
  );
}

function ResultsHeader({
  result,
  audience,
  onAudience,
  onSave,
  saved,
}: {
  result: AssessmentResult;
  audience: Audience;
  onAudience: (a: Audience) => void;
  onSave: () => void;
  saved: boolean;
}) {
  const snap = result.snapshot;
  const stat = (key: string): string => {
    const v = snap[key as keyof typeof snap];
    if (v === undefined || v === null) return "—";
    if (typeof v === "boolean") return v ? "Yes" : "No";
    const unit = METRIC_LABEL[key]?.unit;
    return `${v}${unit ? ` ${unit}` : ""}`;
  };
  return (
    <Card className="print-avoid-break">
      <CardContent className="pt-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow mb-2">Diagnosis</p>
            <p className="text-xl font-semibold text-balance">{result.headline}</p>
          </div>
          <div className="flex items-center gap-2 print:hidden">
            <div className="inline-flex rounded-full border border-border p-0.5 text-xs">
              {(["technician", "client"] as Audience[]).map((a) => (
                <button
                  key={a}
                  onClick={() => onAudience(a)}
                  className={cn(
                    "rounded-full px-3 py-1 capitalize transition-colors",
                    audience === a
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {a}
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full"
              onClick={onSave}
              disabled={saved}
            >
              {saved ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Save className="h-4 w-4" />}
              {saved ? "Saved" : "Save"}
            </Button>
            <Button variant="outline" size="sm" className="rounded-full" onClick={() => window.print()}>
              <Printer className="h-4 w-4" />
              Report
            </Button>
          </div>
        </div>

        <Separator className="my-5" />

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat label="Download" value={stat("download_mbps")} />
          <Stat label="Upload" value={stat("upload_mbps")} />
          <Stat label="Latency" value={stat("latency_unloaded_ms")} />
          <Stat label="Loss" value={stat("packet_loss_pct")} />
        </div>
      </CardContent>
    </Card>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums">{value}</p>
    </div>
  );
}

function FindingCard({ finding, audience }: { finding: Finding; audience: Audience }) {
  const sev = SEVERITY_META[finding.severity];
  return (
    <Card className="print-avoid-break">
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("h-2.5 w-2.5 rounded-full", sev.dot)} aria-hidden />
          <CardTitle className="text-lg">{finding.title}</CardTitle>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="outline" className={cn("border-current", sev.text)}>
              {sev.label}
            </Badge>
            <Badge variant="secondary">{CONFIDENCE_LABEL[finding.confidence]}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-relaxed">
          {audience === "client" ? finding.clientExplanation : finding.technicianExplanation}
        </p>

        {audience === "technician" && finding.evidence.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
              Evidence
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {finding.evidence.map((e, i) => (
                <li
                  key={i}
                  className="rounded-md bg-secondary px-2 py-0.5 text-xs text-secondary-foreground tabular-nums"
                >
                  {e}
                </li>
              ))}
            </ul>
          </div>
        )}

        {audience === "technician" && finding.contradictions.length > 0 && (
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
              Contradicting evidence
            </p>
            <ul className="flex flex-wrap gap-1.5">
              {finding.contradictions.map((e, i) => (
                <li
                  key={i}
                  className="rounded-md border border-dashed border-border px-2 py-0.5 text-xs text-muted-foreground tabular-nums"
                >
                  {e}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
            {audience === "client" ? "Recommended repairs" : "Next tests"}
          </p>
          <ol className="space-y-1.5">
            {finding.nextTests.map((t, i) => (
              <li key={i} className="flex gap-2.5 text-sm">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-secondary text-xs font-medium tabular-nums">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{t}</span>
              </li>
            ))}
          </ol>
        </div>

        {(finding.workaround || finding.remediation) && (
          <div className="grid gap-2 sm:grid-cols-2 pt-1">
            {finding.workaround && (
              <div className="rounded-md bg-secondary/60 p-3">
                <p className="text-xs font-semibold text-muted-foreground">Immediate workaround</p>
                <p className="mt-1 text-sm leading-relaxed">{finding.workaround}</p>
              </div>
            )}
            {finding.remediation && (
              <div className="rounded-md bg-secondary/60 p-3">
                <p className="text-xs font-semibold text-muted-foreground">Permanent fix</p>
                <p className="mt-1 text-sm leading-relaxed">{finding.remediation}</p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function MeasurementsTable({ measurements }: { measurements: Measurement[] }) {
  // De-dupe by key, keeping the last (loaded-latency etc. are appended once).
  const byKey = new Map<string, Measurement>();
  for (const m of measurements) byKey.set(m.key, m);
  const rows = [...byKey.values()];
  return (
    <Card className="print-avoid-break">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Raw measurements</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <tbody>
              {rows.map((m) => {
                const meta = METRIC_LABEL[m.key];
                return (
                  <tr key={m.key} className="border-b border-border/60 last:border-0">
                    <td className="py-2 pr-4 text-muted-foreground">{meta?.label ?? m.key}</td>
                    <td className="py-2 text-right font-medium tabular-nums">
                      {m.success ? (
                        formatValue(m)
                      ) : BENIGN_ERRORS.has(m.errorCode ?? "") ? (
                        <span className="text-muted-foreground font-normal">
                          {ERROR_LABEL[m.errorCode ?? ""] ?? "not available"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <XCircle className="h-3.5 w-3.5" />
                          {ERROR_LABEL[m.errorCode ?? ""] ?? m.errorCode ?? "n/a"}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

function formatWhen(ts: number): string {
  const d = new Date(ts);
  return `${d.toLocaleDateString([], { month: "short", day: "numeric" })}, ${d.toLocaleTimeString(
    [],
    { hour: "2-digit", minute: "2-digit" },
  )}`;
}

function HistoryPanel({
  sessions,
  baselineId,
  onBaseline,
  onDelete,
}: {
  sessions: StoredSession[];
  baselineId: string | null;
  onBaseline: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  if (sessions.length === 0) return null;
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Saved sessions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs text-muted-foreground">
          Set one as a baseline, then run again to compare before vs. after. Stored on this
          device only.
        </p>
        {sessions.map((s) => {
          const isBaseline = s.id === baselineId;
          const dl = s.result.snapshot.download_mbps;
          const loss = s.result.snapshot.packet_loss_pct;
          return (
            <div
              key={s.id}
              className={cn(
                "rounded-md border p-2.5 text-sm transition-colors",
                isBaseline ? "border-primary bg-primary/5" : "border-border",
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">{s.label}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatWhen(s.savedAt)}
                    {typeof dl === "number" && ` · ${dl} Mbps`}
                    {typeof loss === "number" && ` · ${loss}% loss`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    title={isBaseline ? "Unset baseline" : "Set as baseline"}
                    aria-pressed={isBaseline}
                    onClick={() => onBaseline(s.id)}
                    className={cn(
                      "grid h-7 w-7 place-items-center rounded-md transition-colors",
                      isBaseline
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-secondary text-muted-foreground",
                    )}
                  >
                    <Target className="h-3.5 w-3.5" />
                  </button>
                  <button
                    title="Delete session"
                    onClick={() => onDelete(s.id)}
                    className="grid h-7 w-7 place-items-center rounded-md text-muted-foreground hover:bg-secondary hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function ComparisonCard({ deltas, baselineLabel }: { deltas: MetricDelta[]; baselineLabel: string }) {
  const rows = deltas.filter((d) => d.direction !== "na");
  return (
    <Card className="border-primary/30 print-avoid-break">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Compared to baseline</CardTitle>
        <p className="text-sm text-muted-foreground">
          vs. <span className="font-medium text-foreground">{baselineLabel}</span> —{" "}
          {summarizeComparison(deltas)}
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted-foreground">
                <th className="pb-2 text-left font-medium">Metric</th>
                <th className="pb-2 text-right font-medium">Baseline</th>
                <th className="pb-2 text-right font-medium">Now</th>
                <th className="pb-2 text-right font-medium">Change</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((d) => {
                const color =
                  d.quality === "better"
                    ? "text-emerald-600"
                    : d.quality === "worse"
                      ? "text-destructive"
                      : "text-muted-foreground";
                const Icon =
                  d.direction === "up" ? ArrowUp : d.direction === "down" ? ArrowDown : Minus;
                return (
                  <tr key={d.key} className="border-t border-border/60">
                    <td className="py-2 pr-4 text-muted-foreground">{d.label}</td>
                    <td className="py-2 text-right tabular-nums">
                      {d.baseline}
                      {d.unit ? ` ${d.unit}` : ""}
                    </td>
                    <td className="py-2 text-right font-medium tabular-nums">
                      {d.current}
                      {d.unit ? ` ${d.unit}` : ""}
                    </td>
                    <td className={cn("py-2 text-right tabular-nums", color)}>
                      <span className="inline-flex items-center justify-end gap-1">
                        <Icon className="h-3.5 w-3.5" />
                        {d.deltaPct === undefined
                          ? "—"
                          : `${d.deltaPct > 0 ? "+" : ""}${Math.round(d.deltaPct)}%`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

export default NetworkDiagnostics;
