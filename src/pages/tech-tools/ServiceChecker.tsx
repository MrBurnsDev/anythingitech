import { useCallback, useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface CheckResult {
  host: string;
  port: number;
  resolvedIp?: string;
  ok?: boolean;
  tls?: boolean;
  open?: boolean;
  ms?: number;
  subject?: string;
  issuer?: string;
  validFrom?: string;
  validTo?: string;
  daysRemaining?: number;
  authorized?: boolean;
  authError?: string;
  protocol?: string | null;
  error?: string;
}

const SERVICES: { label: string; port: number; tls: boolean }[] = [
  { label: "HTTPS / cert (443)", port: 443, tls: true },
  { label: "HTTP (80)", port: 80, tls: false },
  { label: "SMTP (587)", port: 587, tls: false },
  { label: "SMTP TLS (465)", port: 465, tls: false },
  { label: "IMAP (993)", port: 993, tls: false },
  { label: "POP3 (995)", port: 995, tls: false },
  { label: "SSH (22)", port: 22, tls: false },
  { label: "RDP (3389)", port: 3389, tls: false },
];

const ERROR_TEXT: Record<string, string> = {
  invalid_host: "That host doesn't look valid.",
  port_not_allowed: "That port isn't supported.",
  dns_lookup_failed: "Couldn't resolve that hostname.",
  target_not_allowed: "That target resolves to a private/reserved address and can't be checked.",
  rate_limited: "Too many checks — wait a minute and try again.",
  timeout: "Connection timed out (port likely filtered/closed).",
  refused: "Connection refused (port closed).",
  ECONNREFUSED: "Connection refused (port closed).",
  no_certificate: "No TLS certificate was presented.",
};

const ServiceChecker = () => {
  const [host, setHost] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (port: number, tls: boolean) => {
      const h = host.trim();
      if (!h) return;
      setLoading(true);
      setError(null);
      setResult(null);
      try {
        const res = await fetch(
          `/api/tools/net-check?host=${encodeURIComponent(h)}&port=${port}${tls ? "&tls=1" : ""}`,
        );
        const data = (await res.json()) as CheckResult & { error?: string };
        if (!res.ok || data.error) {
          setError(ERROR_TEXT[data.error ?? ""] ?? data.error ?? "Check failed.");
        } else {
          setResult(data);
        }
      } catch {
        setError("Couldn't reach the checker (it only runs on the live site).");
      } finally {
        setLoading(false);
      }
    },
    [host],
  );

  return (
    <SiteLayout>
      <SEO
        title="TLS Certificate & Port Checker | Martha's Vineyard IT"
        description="Check a domain's TLS certificate (issuer, expiry, days remaining) and whether common service ports (SMTP, IMAP, RDP, SSH…) are reachable."
        canonical="https://anythingitechmv.com/tech-tools/service-checker"
      />

      <section className="pt-28 md:pt-32 pb-8 border-b border-border">
        <div className="container-editorial">
          <p className="text-xs text-muted-foreground mb-4">
            <Link to="/tech-tools" className="hover:text-foreground transition-colors">
              Tech Tools
            </Link>
            <span className="mx-2">/</span>
            <span>TLS &amp; Port Checker</span>
          </p>
          <div className="flex items-start gap-4">
            <div className="hidden sm:grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="display-lg">TLS &amp; Port Checker</h1>
              <p className="mt-3 text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Check a domain's TLS certificate (issuer, expiry) or whether a common service port
                is reachable — handy for client mail, remote-desktop, and web servers.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-editorial max-w-2xl space-y-5">
          <div className="space-y-2">
            <Label htmlFor="host">Host or domain</Label>
            <Input
              id="host"
              value={host}
              onChange={(e) => setHost(e.target.value)}
              placeholder="example.com or mail.example.com"
              autoComplete="off"
              spellCheck={false}
              onKeyDown={(e) => e.key === "Enter" && run(443, true)}
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {SERVICES.map((s) => (
                <button
                  key={s.label}
                  onClick={() => run(s.port, s.tls)}
                  disabled={loading || !host.trim()}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-50"
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Checking…
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}

          {result && !loading && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground mb-3">
                  {result.host}:{result.port}
                  {result.resolvedIp && ` · ${result.resolvedIp}`}
                </p>
                {result.tls ? (
                  <TlsResult r={result} />
                ) : (
                  <PortResult r={result} />
                )}
              </CardContent>
            </Card>
          )}

          <p className="text-xs text-muted-foreground">
            Checks run from our server against public hosts only (private/reserved addresses are
            blocked). This tool works on the deployed site.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <tr className="border-b border-border/60 last:border-0">
      <td className="py-2 pr-4 text-muted-foreground whitespace-nowrap align-top">{label}</td>
      <td className="py-2 text-right font-medium break-all">{value}</td>
    </tr>
  );
}

function TlsResult({ r }: { r: CheckResult }) {
  if (r.ok === false) {
    return (
      <p className="flex items-center gap-2 text-sm text-destructive">
        <XCircle className="h-4 w-4" /> {ERROR_TEXT[r.error ?? ""] ?? r.error ?? "No certificate."}
      </p>
    );
  }
  const days = r.daysRemaining ?? 0;
  const daysColor =
    days <= 0 ? "text-destructive" : days < 30 ? "text-amber-600" : "text-emerald-600";
  return (
    <table className="w-full text-sm">
      <tbody>
        <Row
          label="Certificate valid"
          value={
            <span
              className={cn(
                "inline-flex items-center gap-1",
                r.authorized ? "text-emerald-600" : "text-amber-600",
              )}
            >
              {r.authorized ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
              {r.authorized ? "Trusted chain" : r.authError || "Not trusted"}
            </span>
          }
        />
        <Row label="Issuer" value={r.issuer ?? "—"} />
        <Row label="Subject" value={r.subject ?? "—"} />
        <Row label="Valid from" value={r.validFrom ?? "—"} />
        <Row label="Expires" value={r.validTo ?? "—"} />
        <Row
          label="Days remaining"
          value={<span className={cn("tabular-nums font-semibold", daysColor)}>{days}</span>}
        />
        {r.protocol && <Row label="TLS version" value={r.protocol} />}
      </tbody>
    </table>
  );
}

function PortResult({ r }: { r: CheckResult }) {
  return (
    <p
      className={cn(
        "flex items-center gap-2 text-sm font-medium",
        r.open ? "text-emerald-600" : "text-destructive",
      )}
    >
      {r.open ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
      {r.open
        ? `Port ${r.port} is open${typeof r.ms === "number" ? ` (${r.ms} ms)` : ""}`
        : `Port ${r.port} is ${ERROR_TEXT[r.error ?? ""] ?? "closed/filtered"}`}
    </p>
  );
}

export default ServiceChecker;
