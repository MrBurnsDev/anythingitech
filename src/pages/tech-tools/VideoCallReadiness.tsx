import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { Video, Play, Loader2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { measureLatencyJitterLoss } from "@/lib/diagnostics";
import { probeNat } from "@/lib/tools/natProbe";
import { videoCallGrade, type VoipResult, type FactorStatus } from "@/lib/tools/voip";

type RunState = "idle" | "running" | "done";

const GRADE_TONE: Record<string, string> = {
  Good: "bg-emerald-500",
  Fair: "bg-amber-500",
  Poor: "bg-destructive",
};

const STATUS_ICON: Record<FactorStatus, typeof CheckCircle2> = {
  good: CheckCircle2,
  warn: AlertTriangle,
  bad: XCircle,
};

const STATUS_COLOR: Record<FactorStatus, string> = {
  good: "text-emerald-500",
  warn: "text-amber-500",
  bad: "text-destructive",
};

const VideoCallReadiness = () => {
  const [state, setState] = useState<RunState>("idle");
  const [result, setResult] = useState<VoipResult | null>(null);

  const run = useCallback(async () => {
    setState("running");
    setResult(null);
    const [nat, latency] = await Promise.all([probeNat(), measureLatencyJitterLoss()]);
    const jitter = latency.find((m) => m.key === "jitter_ms" && m.success)?.value;
    const loss = latency.find((m) => m.key === "packet_loss_pct" && m.success)?.value;
    setResult(
      videoCallGrade({
        udpWorks: nat.udpWorks,
        symmetricNat: nat.symmetricNat,
        jitterMs: typeof jitter === "number" ? jitter : null,
        lossPct: typeof loss === "number" ? loss : null,
      }),
    );
    setState("done");
  }, []);

  return (
    <SiteLayout>
      <SEO
        title="Video Call Readiness Test | Anything Itech MV"
        description="Check whether your connection is ready for Zoom, Teams, and FaceTime: UDP reachability, NAT type, jitter, and packet loss — with a plain Good/Fair/Poor verdict."
        canonical="https://anythingitechmv.com/tech-tools/video-call-readiness"
      />

      <section className="pt-28 md:pt-32 pb-8 border-b border-border">
        <div className="container-editorial">
          <p className="text-xs text-muted-foreground mb-4">
            <Link to="/tech-tools" className="hover:text-foreground transition-colors">
              Tech Tools
            </Link>
            <span className="mx-2">/</span>
            <span>Video Call Readiness</span>
          </p>
          <div className="flex items-start gap-4">
            <div className="hidden sm:grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Video className="h-6 w-6" />
            </div>
            <div>
              <h1 className="display-lg">Video Call Readiness</h1>
              <p className="mt-3 text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Will Zoom, Teams, or FaceTime hold up? Checks UDP reachability and NAT type over
                WebRTC, plus live jitter and packet loss.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-editorial max-w-2xl space-y-5">
          <Button
            size="lg"
            className="rounded-full"
            onClick={run}
            disabled={state === "running"}
          >
            {state === "running" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {state === "running" ? "Testing…" : result ? "Test again" : "Run readiness test"}
          </Button>

          {result && (
            <Card>
              <CardContent className="pt-6 space-y-5">
                <div className="flex items-center gap-4">
                  <span
                    className={cn(
                      "grid h-14 w-14 shrink-0 place-items-center rounded-lg text-sm font-bold uppercase text-white text-center leading-none",
                      GRADE_TONE[result.grade],
                    )}
                  >
                    {result.grade}
                  </span>
                  <div>
                    <p className="eyebrow mb-1">Verdict</p>
                    <p className="text-xl font-semibold">{result.headline}</p>
                  </div>
                </div>

                <div className="space-y-2.5">
                  {result.factors.map((f) => {
                    const Icon = STATUS_ICON[f.status];
                    return (
                      <div key={f.label} className="flex items-start gap-3">
                        <Icon className={cn("h-4 w-4 mt-0.5 shrink-0", STATUS_COLOR[f.status])} />
                        <div>
                          <p className="text-sm font-medium">{f.label}</p>
                          <p className="text-sm text-muted-foreground">{f.detail}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {state === "idle" && !result && (
            <Card className="border-dashed">
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                Run the test to check UDP, NAT type, jitter, and loss.
              </CardContent>
            </Card>
          )}

          <p className="text-xs text-muted-foreground">
            NAT/UDP checks use public STUN servers via WebRTC; jitter and loss are HTTP-probe
            approximations. Runs in your browser — nothing is stored.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
};

export default VideoCallReadiness;
