import { useCallback, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Gauge,
  Info,
  Loader2,
  Play,
  Printer,
  Square,
  XCircle,
} from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
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
  runAssessment,
  STEP_SEQUENCE,
  type AssessmentContext,
  type AssessmentResult,
  type ConfidenceLevel,
  type Finding,
  type Measurement,
  type Severity,
  type StepId,
  type StepProgress,
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

const NetworkDiagnostics = () => {
  const [audience, setAudience] = useState<Audience>("technician");
  const [runState, setRunState] = useState<RunState>("idle");
  const [progress, setProgress] = useState<StepProgress | null>(null);
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showContext, setShowContext] = useState(false);
  const [context, setContext] = useState<AssessmentContext>({});
  const abortRef = useRef<AbortController | null>(null);

  const numeric = (v: string): number | undefined => {
    const n = Number(v);
    return v.trim() !== "" && Number.isFinite(n) && n >= 0 ? n : undefined;
  };

  const start = useCallback(async () => {
    setRunState("running");
    setResult(null);
    setError(null);
    setProgress(null);
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

      <section className="pt-28 md:pt-32 pb-10 border-b border-border">
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
              <Activity className="h-6 w-6" />
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
          <div className="lg:col-span-4 space-y-4">
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
                Throughput tests transfer real data (tens of MB) — avoid on a metered plan.
                A browser can't read Wi-Fi signal, scan the LAN, or ping the gateway directly;
                those live in the native app.
              </AlertDescription>
            </Alert>
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
                <ResultsHeader
                  result={result}
                  audience={audience}
                  onAudience={setAudience}
                />

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
}: {
  result: AssessmentResult;
  audience: Audience;
  onAudience: (a: Audience) => void;
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
    <Card>
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
    <Card>
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
    <Card>
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
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <XCircle className="h-3.5 w-3.5" />
                          {m.errorCode ?? "n/a"}
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

export default NetworkDiagnostics;
