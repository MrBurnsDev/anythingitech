import { AppStudioLayout } from "./AppStudioLayout";
import { Link } from "react-router-dom";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { useDocumentMeta } from "@/lib/useDocumentMeta";

const PINK = "#FFBDFF";
const GOLD = "#FAB000";
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
  { id: "acceptance", label: "Acceptance of Terms" },
  { id: "description", label: "Description of Service" },
  { id: "license", label: "License" },
  { id: "acceptable-use", label: "Acceptable Use" },
  { id: "vpn-use", label: "VPN Use" },
  { id: "no-warranty", label: "Disclaimer of Warranties" },
  { id: "limitation", label: "Limitation of Liability" },
  { id: "termination", label: "Termination" },
  { id: "changes", label: "Changes to These Terms" },
  { id: "contact", label: "Contact Information" },
];

export default function NodeGuardianTerms() {
  useDocumentMeta({
    title: "Terms of Service | Node Guardian | MV App Studio",
    description:
      "Node Guardian Terms of Service. The terms governing your use of the Node Guardian macOS security app and its built-in VPN.",
    canonical: "https://anythingitechmv.com/services/mv-app-design/nodeguardian/terms",
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
              Terms of Service
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
                <Section id="acceptance" title="1. Acceptance of Terms">
                  <p>
                    These Terms of Service ("Terms") govern your use of Node Guardian, a macOS security
                    application developed and operated by MV App Studio ("we," "us," or "our"). By downloading,
                    installing, or using Node Guardian (the "Service"), you agree to be bound by these Terms. If
                    you do not agree, do not use the Service.
                  </p>
                </Section>

                <Section id="description" title="2. Description of Service">
                  <p>
                    Node Guardian provides security and privacy tools for macOS, including a built-in WireGuard
                    VPN, threat and malware scanning, quarantine, a security score, and a set of privacy and
                    system utilities. Features are provided on an ongoing-development basis and may change.
                  </p>
                </Section>

                <Section id="license" title="3. License">
                  <p>
                    Subject to these Terms, we grant you a personal, non-exclusive, non-transferable, revocable
                    license to install and use Node Guardian on Mac computers you own or control, for your own
                    lawful use.
                  </p>
                </Section>

                <Section id="acceptable-use" title="4. Acceptable Use">
                  <p>You agree not to:</p>
                  <p>• Use the Service for any unlawful purpose or in violation of any applicable law;</p>
                  <p>• Attempt to reverse engineer, tamper with, or circumvent the security of the Service except to the extent permitted by law;</p>
                  <p>• Use the VPN to harm, harass, or infringe the rights of others, or to conceal unlawful activity;</p>
                  <p>• Interfere with or disrupt the integrity or performance of the Service or its infrastructure.</p>
                </Section>

                <Section id="vpn-use" title="5. VPN Use">
                  <p>
                    The built-in VPN is provided to help protect your privacy and secure your connection. You are
                    responsible for your own use of the VPN and for complying with the laws of your jurisdiction.
                    The VPN is not a tool for evading lawful obligations, and we may suspend access that is used
                    to abuse the Service or its infrastructure.
                  </p>
                </Section>

                <Section id="no-warranty" title="6. Disclaimer of Warranties">
                  <p>
                    The Service is provided "as is" and "as available" without warranties of any kind, whether
                    express or implied, including but not limited to warranties of merchantability, fitness for a
                    particular purpose, and non-infringement. No security software can guarantee complete
                    protection against all threats.
                  </p>
                </Section>

                <Section id="limitation" title="7. Limitation of Liability">
                  <p>
                    To the maximum extent permitted by law, MV App Studio shall not be liable for any indirect,
                    incidental, special, consequential, or punitive damages, or any loss of data, arising out of
                    or related to your use of, or inability to use, the Service.
                  </p>
                </Section>

                <Section id="termination" title="8. Termination">
                  <p>
                    You may stop using Node Guardian at any time by uninstalling it. We may suspend or terminate
                    access to the Service, including the VPN, if you violate these Terms or to protect the Service
                    and its users.
                  </p>
                </Section>

                <Section id="changes" title="9. Changes to These Terms">
                  <p>
                    We may update these Terms from time to time. Material changes will be reflected by updating
                    the effective date above and, where appropriate, through in-app or website notice. Continued
                    use of the Service after changes take effect constitutes acceptance of the updated Terms.
                  </p>
                </Section>

                <Section id="contact" title="10. Contact Information">
                  <p>
                    Questions about these Terms can be directed to MV App Studio at{" "}
                    <a href="mailto:louis@mvappstudio.com" className="font-semibold underline" style={{ color: PINK }}>
                      louis@mvappstudio.com
                    </a>
                    .
                  </p>
                </Section>

                {/* Footer nav */}
                <div className="pt-8 border-t flex flex-wrap gap-3" style={{ borderColor: `${PINK}1A` }}>
                  <Link
                    to="/services/mv-app-design/nodeguardian/privacy"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border text-sm font-medium"
                    style={{ color: TEXT, borderColor: `${PINK}44`, background: BG_ELEVATED }}
                  >
                    Privacy Policy
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
