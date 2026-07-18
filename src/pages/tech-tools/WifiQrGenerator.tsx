import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { QrCode, Download } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SEO } from "@/components/SEO";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildWifiPayload, type WifiSecurity } from "@/lib/tools/wifi";

const SECURITY: { value: WifiSecurity; label: string }[] = [
  { value: "WPA", label: "WPA/WPA2/WPA3" },
  { value: "WEP", label: "WEP" },
  { value: "nopass", label: "Open (none)" },
];

const WifiQrGenerator = () => {
  const [ssid, setSsid] = useState("");
  const [password, setPassword] = useState("");
  const [security, setSecurity] = useState<WifiSecurity>("WPA");
  const [hidden, setHidden] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const payload = useMemo(
    () => buildWifiPayload({ ssid, password, security, hidden }),
    [ssid, password, security, hidden],
  );
  const ready = ssid.trim().length > 0;

  const download = () => {
    const url = canvasRef.current?.toDataURL("image/png");
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = `wifi-${ssid.replace(/[^a-z0-9]+/gi, "-").toLowerCase() || "network"}.png`;
    a.click();
  };

  return (
    <SiteLayout>
      <SEO
        title="Wi-Fi QR Code Generator | Martha's Vineyard IT"
        description="Generate a scan-to-join Wi-Fi QR code for guest networks. Enter the network name and password — the code is created in your browser and never uploaded."
        canonical="https://anythingitechmv.com/tech-tools/wifi-qr"
      />

      <section className="pt-28 md:pt-32 pb-8 border-b border-border">
        <div className="container-editorial">
          <p className="text-xs text-muted-foreground mb-4">
            <Link to="/tech-tools" className="hover:text-foreground transition-colors">
              Tech Tools
            </Link>
            <span className="mx-2">/</span>
            <span>Wi-Fi QR Code</span>
          </p>
          <div className="flex items-start gap-4">
            <div className="hidden sm:grid h-12 w-12 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground">
              <QrCode className="h-6 w-6" />
            </div>
            <div>
              <h1 className="display-lg">Wi-Fi QR Code Generator</h1>
              <p className="mt-3 text-lg text-muted-foreground max-w-2xl leading-relaxed">
                Make a scan-to-join code for a guest or client network. Point a phone camera at it
                to connect — no typing the password.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-10">
        <div className="container-editorial grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl">
          {/* Form */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="ssid">Network name (SSID)</Label>
              <Input
                id="ssid"
                value={ssid}
                onChange={(e) => setSsid(e.target.value)}
                placeholder="Guest-WiFi"
                autoComplete="off"
                spellCheck={false}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm">Security</Label>
              <div className="grid grid-cols-3 gap-1 rounded-full border border-border p-0.5 text-xs">
                {SECURITY.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setSecurity(s.value)}
                    className={cn(
                      "rounded-full px-2 py-1.5 transition-colors",
                      security === s.value
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {security !== "nopass" && (
              <div className="space-y-2">
                <Label htmlFor="pw">Password</Label>
                <Input
                  id="pw"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="network password"
                  autoComplete="off"
                  spellCheck={false}
                />
              </div>
            )}

            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={hidden}
                onChange={(e) => setHidden(e.target.checked)}
                className="h-4 w-4 rounded border-border"
              />
              Hidden network (SSID not broadcast)
            </label>

            <p className="text-xs text-muted-foreground pt-1">
              Everything is generated on your device — the network name and password are never sent
              anywhere.
            </p>
          </div>

          {/* QR preview */}
          <div>
            <Card>
              <CardContent className="pt-6 flex flex-col items-center gap-4">
                <div className="rounded-lg bg-white p-4">
                  {ready ? (
                    <QRCodeCanvas
                      ref={canvasRef}
                      value={payload}
                      size={220}
                      level="M"
                      marginSize={2}
                    />
                  ) : (
                    <div className="grid h-[220px] w-[220px] place-items-center text-center text-sm text-muted-foreground">
                      Enter a network name to generate the code
                    </div>
                  )}
                </div>
                <Button
                  variant="outline"
                  className="rounded-full"
                  onClick={download}
                  disabled={!ready}
                >
                  <Download className="h-4 w-4" />
                  Download PNG
                </Button>
                {ready && (
                  <p className="w-full break-all text-center text-[11px] text-muted-foreground font-mono">
                    {payload}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
};

export default WifiQrGenerator;
