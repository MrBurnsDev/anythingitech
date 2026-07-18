import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Network } from "lucide-react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { computeSubnet } from "@/lib/tools/subnet";

const EXAMPLES = ["192.168.1.0/24", "10.0.0.0/8", "172.16.5.20/20", "192.168.1.10 255.255.255.0"];

const SubnetCalculator = () => {
  const [input, setInput] = useState("192.168.1.0/24");
  const result = useMemo(() => computeSubnet(input), [input]);
  const error = "error" in result ? result.error : null;

  const rows: [string, string][] = "error" in result
    ? []
    : [
        ["Network address", result.networkAddress],
        ["CIDR", result.cidr],
        ["Netmask", result.netmask],
        ["Wildcard", result.wildcard],
        ["Broadcast address", result.broadcastAddress],
        ["First usable host", result.firstHost],
        ["Last usable host", result.lastHost],
        ["Usable hosts", result.usableHosts.toLocaleString()],
        ["Total addresses", result.totalAddresses.toLocaleString()],
        ["IP class", result.ipClass],
      ];

  return (
    <SiteLayout>
      <SEO
        title="Subnet / CIDR Calculator | Martha's Vineyard IT"
        description="Free IPv4 subnet calculator: enter an IP and CIDR or mask to get the network, broadcast, usable host range, and count. Runs entirely in your browser."
        canonical="https://anythingitechmv.com/tech-tools/subnet-calculator"
      />

      <section className="pt-28 md:pt-32 pb-8 border-b border-border">
        <div className="container-editorial">
          <p className="text-xs text-muted-foreground mb-4">
            <Link to="/tech-tools" className="hover:text-foreground transition-colors">
              Tech Tools
            </Link>
            <span className="mx-2">/</span>
            <span>Subnet Calculator</span>
          </p>
          <div className="flex items-start gap-4">
            <div className="hidden sm:grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Network className="h-6 w-6" />
            </div>
            <div>
              <h1 className="display-lg">Subnet / CIDR Calculator</h1>
              <p className="mt-3 text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Enter an IPv4 address with a CIDR prefix or subnet mask to get the network,
                broadcast, and usable host range.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-editorial max-w-2xl space-y-5">
          <div className="space-y-2">
            <Label htmlFor="cidr">IP address + prefix or mask</Label>
            <Input
              id="cidr"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="192.168.1.0/24"
              autoComplete="off"
              spellCheck={false}
              className="font-mono text-base"
            />
            <div className="flex flex-wrap gap-2 pt-1">
              {EXAMPLES.map((ex) => (
                <button
                  key={ex}
                  onClick={() => setInput(ex)}
                  className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors font-mono"
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : (
            "error" in result ? null : (
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">Results</CardTitle>
                    <Badge variant={result.isPrivate ? "secondary" : "outline"}>
                      {result.isPrivate ? "Private range" : "Public range"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <tbody>
                        {rows.map(([label, value]) => (
                          <tr key={label} className="border-b border-border/60 last:border-0">
                            <td className="py-2 pr-4 text-muted-foreground whitespace-nowrap">
                              {label}
                            </td>
                            <td className="py-2 text-right font-medium font-mono tabular-nums break-all">
                              {value}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )
          )}

          <p className="text-xs text-muted-foreground">
            IPv4 only. Runs entirely in your browser — nothing is sent anywhere.
          </p>
        </div>
      </section>
    </SiteLayout>
  );
};

export default SubnetCalculator;
