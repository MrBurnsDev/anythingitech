import { useCallback, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, Play, Square } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { diagnosticsConfig } from "@/lib/diagnostics";
import { computeLatencyStats, sparklinePath, type LatencySample } from "@/lib/tools/latency";

const MAX_SAMPLES = 120;
const INTERVAL_MS = 700;
const PROBE_TIMEOUT_MS = 4000;
const CHART_W = 600;
const CHART_H = 160;

async function probe(url: string, outer: AbortSignal): Promise<number | null> {
  const c = new AbortController();
  const timer = setTimeout(() => c.abort(), PROBE_TIMEOUT_MS);
  const onAbort = () => c.abort();
  outer.addEventListener("abort", onAbort);
  const start = typeof performance !== "undefined" ? performance.now() : Date.now();
  try {
    const res = await fetch(`${url}${url.includes("?") ? "&" : "?"}_cb=${start}`, {
      cache: "no-store",
      signal: c.signal,
    });
    await res.arrayBuffer();
    const now = typeof performance !== "undefined" ? performance.now() : Date.now();
    return res.ok ? Math.round((now - start) * 10) / 10 : null;
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
    outer.removeEventListener("abort", onAbort);
  }
}

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

const LatencyMonitor = () => {
  const [samples, setSamples] = useState<LatencySample[]>([]);
  const [running, setRunning] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const stats = useMemo(() => computeLatencyStats(samples), [samples]);

  const start = useCallback(async () => {
    setSamples([]);
    setRunning(true);
    const controller = new AbortController();
    abortRef.current = controller;
    let t = 0;
    while (!controller.signal.aborted) {
      const rtt = await probe(diagnosticsConfig.latencyProbeUrl, controller.signal);
      if (controller.signal.aborted) break;
      setSamples((prev) => [...prev, { t: t++, rtt }].slice(-MAX_SAMPLES));
      await sleep(INTERVAL_MS);
    }
    setRunning(false);
  }, []);

  const stop = useCallback(() => abortRef.current?.abort(), []);

  // Chart: line over successful RTTs, with red ticks marking dropped probes.
  const successValues = samples.filter((s) => s.rtt !== null).map((s) => s.rtt as number);
  const chartMax = Math.max(50, (stats.max ?? 0) * 1.15);
  const linePath = sparklinePath(successValues, CHART_W, CHART_H, chartMax);
  const drops = samples
    .map((s, i) => ({ s, i }))
    .filter(({ s }) => s.rtt === null)
    .map(({ i }) => (samples.length > 1 ? (i / (samples.length - 1)) * CHART_W : CHART_W / 2));

  return (
    <SiteLayout>
      <SEO
        title="Latency Monitor (Ping Plot) | Martha's Vineyard IT"
        description="Watch your connection's latency and jitter live over time to catch intermittent spikes and drops a single speed test misses. Runs in your browser."
        canonical="https://anythingitechmv.com/tech-tools/latency-monitor"
      />

      <section className="pt-28 md:pt-32 pb-8 border-b border-border">
        <div className="container-editorial">
          <p className="text-xs text-muted-foreground mb-4">
            <Link to="/tech-tools" className="hover:text-foreground transition-colors">
              Tech Tools
            </Link>
            <span className="mx-2">/</span>
            <span>Latency Monitor</span>
          </p>
          <div className="flex items-start gap-4">
            <div className="hidden sm:grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h1 className="display-lg">Latency Monitor</h1>
              <p className="mt-3 text-lg text-muted-foreground max-w-2xl leading-relaxed">
                A live latency &amp; jitter plot over time — leave it running to catch the
                intermittent spikes and drops a one-shot speed test never sees.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-editorial max-w-3xl space-y-5">
          <div>
            {running ? (
              <Button size="lg" variant="destructive" className="rounded-full" onClick={stop}>
                <Square className="h-4 w-4" /> Stop
              </Button>
            ) : (
              <Button size="lg" className="rounded-full" onClick={start}>
                <Play className="h-4 w-4" /> {samples.length ? "Restart" : "Start monitoring"}
              </Button>
            )}
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            <Stat label="Current" value={fmt(stats.current)} unit="ms" />
            <Stat label="Avg" value={fmt(stats.avg)} unit="ms" />
            <Stat label="Min" value={fmt(stats.min)} unit="ms" />
            <Stat label="Max" value={fmt(stats.max)} unit="ms" />
            <Stat label="Jitter" value={fmt(stats.jitter)} unit="ms" />
            <Stat label="Loss" value={`${stats.lossPct}`} unit="%" />
          </div>

          <Card>
            <CardContent className="pt-6">
              {samples.length === 0 ? (
                <div className="grid h-40 place-items-center text-sm text-muted-foreground">
                  Press start to begin plotting latency.
                </div>
              ) : (
                <svg
                  viewBox={`0 0 ${CHART_W} ${CHART_H}`}
                  className="w-full h-40"
                  preserveAspectRatio="none"
                  role="img"
                  aria-label="Latency over time"
                >
                  {/* baseline */}
                  <line x1="0" y1={CHART_H - 1} x2={CHART_W} y2={CHART_H - 1} className="stroke-border" strokeWidth="1" />
                  {linePath && (
                    <path d={linePath} fill="none" className="stroke-primary" strokeWidth="2" vectorEffect="non-scaling-stroke" />
                  )}
                  {drops.map((x, i) => (
                    <line
                      key={i}
                      x1={x}
                      y1={CHART_H - 12}
                      x2={x}
                      y2={CHART_H}
                      className="stroke-destructive"
                      strokeWidth="2"
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                </svg>
              )}
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                <span>{samples.length} samples · scale 0–{Math.round(chartMax)} ms</span>
                <span className="text-destructive">| = dropped probe</span>
              </div>
            </CardContent>
          </Card>

          <p className="text-xs text-muted-foreground">
            Measures HTTP round-trip to a nearby test endpoint (not raw ICMP ping). Runs in your
            browser; nothing is stored.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
};

function fmt(n: number | null): string {
  return n === null ? "—" : `${n}`;
}

function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
  return (
    <div className="rounded-md bg-secondary/50 p-2.5 text-center">
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-lg font-semibold tabular-nums leading-tight">
        {value}
        {value !== "—" && <span className="text-xs font-normal text-muted-foreground"> {unit}</span>}
      </p>
    </div>
  );
}

export default LatencyMonitor;
