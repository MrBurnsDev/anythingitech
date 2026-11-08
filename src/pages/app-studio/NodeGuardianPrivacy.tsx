import { AppStudioLayout } from "./AppStudioLayout";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useDocumentMeta } from "@/lib/useDocumentMeta";

const PINK = "#FFBDFF";
const GOLD = "#FAB000";
const PURPLE = "#9B4DCA";
const BG = "#000000";
const BG_2 = "#0A0A0A";
const BG_ELEVATED = "#1A1A1A";
const TEXT = "#FBE9E1";
const TEXT_SOFT = "#A8938B";
const TEXT_DIM = "#8A8078";

const EFFECTIVE_DATE = "July 6, 2026";

interface SectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2
        className="text-2xl md:text-3xl font-bold tracking-tight mb-4"
        style={{ color: TEXT, fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
      >
        {title}
      </h2>
      <div className="space-y-4 text-[16px] leading-relaxed" style={{ color: TEXT_SOFT }}>
        {children}
      </div>
    </section>
  );
}

const toc = [
  { id: "overview", label: "Overview" },
  { id: "information-we-collect", label: "Information We Collect" },
  { id: "on-device-data", label: "On-Device Data" },
  { id: "vpn-keys", label: "VPN Encryption Keys" },
  { id: "vpn-traffic", label: "VPN Traffic & Logging" },
  { id: "how-we-use-information", label: "How We Use Information" },
  { id: "data-sharing", label: "Data Sharing & Disclosure" },
  { id: "data-security", label: "Data Security" },
  { id: "data-retention", label: "Data Retention" },
  { id: "your-rights", label: "Your Rights" },
  { id: "childrens-privacy", label: "Children's Privacy" },
  { id: "changes", label: "Changes to This Policy" },
  { id: "contact", label: "Contact Information" },
];

export default function NodeGuardianPrivacy() {
  useDocumentMeta({
    title: "Privacy Policy | Node Guardian | MV App Studio",
    description:
      "Node Guardian Privacy Policy. Learn how Node Guardian handles on-device data, per-device VPN encryption keys, VPN traffic, and your rights on macOS.",
    canonical: "https://anythingitechmv.com/services/mv-app-design/nodeguardian/privacy",
  });

  return (
    <AppStudioLayout>
      <div style={{ background: BG, color: TEXT }}>
        {/* Header */}
        <section className="relative overflow-hidden border-b" style={{ borderColor: `${PINK}1A` }}>
          <div
            className="absolute inset-0"
            style={{ background: `linear-gradient(180deg, ${BG} 0%, ${BG_2} 100%)` }}
          />
          <div
            className="absolute -top-40 -left-40 w-[420px] h-[420px] rounded-full blur-[120px] opacity-20"
            style={{ background: PINK }}
          />
          <div className="container relative section-tight">
            <Link
              to="/services/mv-app-design/nodeguardian"
              className="inline-flex items-center gap-2 text-sm transition-colors mb-8"
              style={{ color: TEXT_SOFT }}
            >
              <ArrowLeft size={16} />
              Back to Node Guardian
            </Link>
            <Link to="/services/mv-app-design/nodeguardian" className="inline-flex items-center gap-3 mb-6">
              <img
                src="/nodeguardian-logo.png"
                alt="Node Guardian logo"
                style={{ height: 48, width: 48, objectFit: "contain", filter: `drop-shadow(0 6px 18px ${PINK}44)` }}
              />
              <span
                className="text-lg font-bold tracking-tight"
                style={{ color: TEXT, fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
              >
                Node Guardian
              </span>
            </Link>
            <h1
              className="font-bold tracking-tight mb-4"
              style={{
                color: TEXT,
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontSize: "clamp(2.25rem, 4.5vw + 0.5rem, 3.5rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
              }}
            >
              Privacy Policy
            </h1>
            <p className="text-base" style={{ color: TEXT_SOFT }}>
              Effective Date: {EFFECTIVE_DATE}
            </p>
          </div>
        </section>

        <section className="section-tight">
          <div className="container">
            <div className="grid lg:grid-cols-[240px_minmax(0,1fr)] gap-10 lg:gap-16">
              <aside className="hidden lg:block">
                <div className="sticky top-24">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] mb-4" style={{ color: GOLD }}>
                    Contents
                  </div>
                  <nav className="space-y-1.5">
                    {toc.map((item) => (
                      <a key={item.id} href={`#${item.id}`} className="block text-sm transition-colors py-1" style={{ color: TEXT_SOFT }}>
                        {item.label}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>

              <article className="space-y-12 max-w-3xl">
                <Section id="overview" title="1. Overview">
                  <p>
                    Node Guardian is a macOS security application developed and operated by MV App Studio
                    ("we," "us," or "our"). This Privacy Policy describes how Node Guardian collects, uses,
                    stores, and protects information when you use the Node Guardian application and any related
                    services (collectively, the "Service").
                  </p>
                  <p>
                    Node Guardian is designed to protect your Mac through a built-in WireGuard VPN, threat and
                    malware scanning, and a set of privacy and system tools. A core principle of the Service is
                    that sensitive material — including your VPN private key and your local scan results —
                    stays on your device.
                  </p>
                  <p>By using Node Guardian, you agree to the practices described in this Privacy Policy.</p>
                </Section>

                <Section id="information-we-collect" title="2. Information We Collect">
                  <p>
                    Node Guardian is designed to minimize the information it collects. Depending on the features
                    you use, this may include:
                  </p>
                  <p>
                    <span className="font-semibold" style={{ color: TEXT }}>VPN registration data.</span>{" "}
                    To connect to the VPN, your device's WireGuard <em>public</em> key is sent to our registration
                    service so the VPN server can accept your connection and assign you a private tunnel address.
                    Your <em>private</em> key is never transmitted.
                  </p>
                  <p>
                    <span className="font-semibold" style={{ color: TEXT }}>Diagnostic and support information.</span>{" "}
                    If you contact us for support, we collect the information you choose to provide.
                  </p>
                </Section>

                <Section id="on-device-data" title="3. On-Device Data">
                  <p>
                    Node Guardian's protection features — threat scans, quarantine, security score, privacy
                    cleanup, and system tools — operate locally on your Mac. Scan results, detected items, and
                    your settings are stored on your device and are not uploaded to us as part of normal operation.
                  </p>
                </Section>

                <Section id="vpn-keys" title="4. VPN Encryption Keys">
                  <p>
                    Each installation of Node Guardian generates its own unique WireGuard keypair the first time
                    the VPN is used. The private key is stored in the macOS Keychain and never leaves your device.
                    Only the corresponding public key is registered with our service so the VPN server can accept
                    your connection. Keys are not shared between users.
                  </p>
                </Section>

                <Section id="vpn-traffic" title="5. VPN Traffic & Logging">
                  <p>
                    The VPN routes your network traffic through an encrypted WireGuard tunnel. Node Guardian is
                    designed to protect your privacy while connected; we do not seek to inspect the contents of
                    your encrypted traffic. Operational logging on VPN infrastructure, where present, is limited
                    to what is reasonably necessary to run and secure the service.
                  </p>
                </Section>

                <Section id="how-we-use-information" title="6. How We Use Information">
                  <p>We use the limited information we collect to:</p>
                  <p>• Register your device with the VPN and assign it a tunnel address;</p>
                  <p>• Operate, maintain, and secure the Service;</p>
                  <p>• Respond to your support requests;</p>
                  <p>• Improve the reliability and security of Node Guardian.</p>
                </Section>

                <Section id="data-sharing" title="7. Data Sharing & Disclosure">
                  <p>
                    We do not sell your personal information. We may share limited information with service
                    providers who help us operate the Service (for example, infrastructure and hosting providers)
                    under obligations of confidentiality, or where required by law.
                  </p>
                </Section>

                <Section id="data-security" title="8. Data Security">
                  <p>
                    Node Guardian uses platform security features including the macOS Keychain for key storage and
                    WireGuard for encrypted connections. While no system can be guaranteed perfectly secure, we
                    design the Service to keep sensitive material on your device and to fail closed rather than
                    expose your traffic.
                  </p>
                </Section>

                <Section id="data-retention" title="9. Data Retention">
                  <p>
                    VPN registration records are retained for as long as needed to provide your VPN connection.
                    On-device data remains on your device under your control and can be removed by clearing the
                    app's data or uninstalling Node Guardian.
                  </p>
                </Section>

                <Section id="your-rights" title="10. Your Rights">
                  <p>
                    You may request information about the limited data associated with your device's VPN
                    registration, and request its deletion, by contacting us. Because most of Node Guardian's data
                    stays on your Mac, you already control it directly.
                  </p>
                </Section>

                <Section id="childrens-privacy" title="11. Children's Privacy">
                  <p>
                    Node Guardian is not directed to children under 13, and we do not knowingly collect personal
                    information from children.
                  </p>
                </Section>

                <Section id="changes" title="12. Changes to This Policy">
                  <p>
                    We may update this Privacy Policy from time to time. Material changes will be reflected by
                    updating the effective date above and, where appropriate, through in-app or website notice.
                  </p>
                </Section>

                <Section id="contact" title="13. Contact Information">
                  <p>
                    Questions about this Privacy Policy can be directed to MV App Studio at{" "}
                    <a href="mailto:louis@mvappstudio.com" className="font-semibold underline" style={{ color: PINK }}>
                      louis@mvappstudio.com
                    </a>
                    .
                  </p>
                </Section>

                {/* Footer nav */}
                <div className="pt-8 border-t flex flex-wrap gap-3" style={{ borderColor: `${PINK}1A` }}>
                  <Link
                    to="/services/mv-app-design/nodeguardian/terms"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium"
                    style={{ color: TEXT, borderColor: `${PINK}44`, background: BG_ELEVATED }}
                  >
                    Terms of Service
                    <ChevronRight size={14} />
                  </Link>
                  <Link
                    to="/services/mv-app-design/nodeguardian"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium"
                    style={{ color: TEXT_DIM }}
                  >
                    Back to Node Guardian
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </article>
            </div>
          </div>
        </section>
      </div>
    </AppStudioLayout>
  );
}
