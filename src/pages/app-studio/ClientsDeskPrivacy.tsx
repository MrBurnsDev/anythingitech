import { AppStudioLayout } from "./AppStudioLayout";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, ChevronRight } from "lucide-react";
import { useDocumentMeta } from "@/lib/useDocumentMeta";

const BRAND_BLUE = "#1F8FE0";
const BRAND_GREEN = "#5DBA47";
const BRAND_GRADIENT = `linear-gradient(135deg, ${BRAND_BLUE} 0%, ${BRAND_GREEN} 100%)`;

const EFFECTIVE_DATE = "June 5, 2026";

interface SectionProps {
  id: string;
  title: string;
  children: React.ReactNode;
}

function Section({ id, title, children }: SectionProps) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2
        className="text-white text-2xl md:text-3xl font-bold tracking-tight mb-4"
        style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
      >
        {title}
      </h2>
      <div className="space-y-4 text-slate-300 text-[16px] leading-relaxed">{children}</div>
    </section>
  );
}

const toc = [
  { id: "overview", label: "Overview" },
  { id: "information-we-collect", label: "Information We Collect" },
  { id: "google-authentication", label: "Google Authentication" },
  { id: "google-sheets-integration", label: "Google Sheets Integration" },
  { id: "data-ownership", label: "Data Ownership" },
  { id: "how-we-use-information", label: "How We Use Information" },
  { id: "data-sharing", label: "Data Sharing & Disclosure" },
  { id: "data-security", label: "Data Security" },
  { id: "data-retention", label: "Data Retention" },
  { id: "user-responsibilities", label: "User Responsibilities" },
  { id: "your-rights", label: "Your Rights" },
  { id: "childrens-privacy", label: "Children's Privacy" },
  { id: "changes", label: "Changes to This Policy" },
  { id: "contact", label: "Contact Information" },
];

export default function ClientsDeskPrivacy() {
  useDocumentMeta({
    title: "Privacy Policy | ClientsDesk | MV App Studio",
    description:
      "ClientsDesk Privacy Policy. Learn how ClientsDesk handles Google authentication, Google Sheets integration, data ownership, and user responsibilities for IT professionals.",
    canonical: "https://anythingitechmv.com/services/mv-app-design/clientsdesk/privacy",
  });

  return (
    <AppStudioLayout>
      <div className="bg-[#06080F] text-white">
        {/* Header */}
        <section className="relative overflow-hidden border-b border-white/5">
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, #06080F 0%, #0A1020 100%)",
            }}
          />
          <div
            className="absolute -top-40 -left-40 w-[420px] h-[420px] rounded-full blur-[120px] opacity-25"
            style={{ background: BRAND_BLUE }}
          />
          <div className="container relative section-tight">
            <Link
              to="/services/mv-app-design/clientsdesk"
              className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors mb-8"
            >
              <ArrowLeft size={16} />
              Back to ClientsDesk
            </Link>
            <Link to="/services/mv-app-design/clientsdesk" className="inline-block mb-6">
              <img
                src="/clientsdesk-wordmark.png"
                alt="ClientsDesk"
                style={{
                  height: 40,
                  width: "auto",
                  objectFit: "contain",
                  filter: `drop-shadow(0 6px 20px ${BRAND_BLUE}55)`,
                }}
              />
            </Link>
            <h1
              className="text-white font-bold tracking-tight mb-4"
              style={{
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontSize: "clamp(2.25rem, 4.5vw + 0.5rem, 3.5rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
              }}
            >
              Privacy Policy
            </h1>
            <p className="text-slate-400 text-base">
              Effective Date: {EFFECTIVE_DATE}
            </p>
          </div>
        </section>

        <section className="section-tight">
          <div className="container">
            <div className="grid lg:grid-cols-[240px_minmax(0,1fr)] gap-10 lg:gap-16">
              {/* Table of contents */}
              <aside className="hidden lg:block">
                <div className="sticky top-24">
                  <div
                    className="text-xs font-semibold uppercase tracking-[0.18em] mb-4"
                    style={{ color: BRAND_GREEN }}
                  >
                    Contents
                  </div>
                  <nav className="space-y-1.5">
                    {toc.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className="block text-sm text-slate-400 hover:text-white transition-colors py-1"
                      >
                        {item.label}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>

              {/* Main content */}
              <article className="space-y-12 max-w-3xl">
                <Section id="overview" title="1. Overview">
                  <p>
                    ClientsDesk is a client management application developed and operated
                    by MV App Studio ("we," "us," or "our"). This Privacy Policy describes
                    how ClientsDesk collects, uses, stores, and protects information when
                    you use the ClientsDesk mobile application and any related services
                    (collectively, the "Service").
                  </p>
                  <p>
                    ClientsDesk is designed for IT professionals, managed service
                    providers, consultants, and technology service businesses. A core
                    principle of the Service is that your business data — including client
                    information, credentials, notes, and service records — remains stored
                    in your own Google account, not on ClientsDesk-operated databases.
                  </p>
                  <p>
                    By using ClientsDesk, you agree to the practices described in this
                    Privacy Policy.
                  </p>
                </Section>

                <Section id="information-we-collect" title="2. Information We Collect">
                  <p>
                    ClientsDesk collects only the information needed to authenticate you,
                    operate the application, and provide support. Specifically:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <span className="text-white font-medium">Account identifiers.</span>{" "}
                      Your Google account email address and basic profile information (name,
                      profile photo) supplied by Google during sign-in.
                    </li>
                    <li>
                      <span className="text-white font-medium">Authorization tokens.</span>{" "}
                      OAuth access and refresh tokens issued by Google so the app can read
                      and write to the specific Google Sheet you choose to use with
                      ClientsDesk.
                    </li>
                    <li>
                      <span className="text-white font-medium">Device and diagnostic data.</span>{" "}
                      Anonymous crash reports, performance metrics, and operating system
                      version, used to diagnose problems and improve stability.
                    </li>
                    <li>
                      <span className="text-white font-medium">Support communications.</span>{" "}
                      Information you voluntarily provide when you contact us by email or
                      through MV App Studio's contact form.
                    </li>
                  </ul>
                  <p>
                    The actual contents of your client records — names, credentials, notes,
                    service history — are{" "}
                    <span className="text-white font-medium">
                      not transmitted to or stored on ClientsDesk servers
                    </span>
                    . They are written directly to the Google Sheet in your own Google
                    Drive.
                  </p>
                </Section>

                <Section id="google-authentication" title="3. Google Authentication">
                  <p>
                    ClientsDesk uses Google Sign-In (OAuth 2.0) to authenticate users.
                    When you sign in:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Google verifies your identity and returns a secure token to the
                      ClientsDesk application.
                    </li>
                    <li>
                      ClientsDesk never sees or stores your Google password.
                    </li>
                    <li>
                      You may revoke ClientsDesk's access at any time from your Google
                      Account permissions page at{" "}
                      <a
                        href="https://myaccount.google.com/permissions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-white"
                        style={{ color: BRAND_GREEN }}
                      >
                        myaccount.google.com/permissions
                      </a>
                      .
                    </li>
                  </ul>
                  <p>
                    The OAuth scopes ClientsDesk requests are limited to what is required
                    to (a) identify you for sign-in and (b) read and write the specific
                    Google Sheet you designate for ClientsDesk use. ClientsDesk does not
                    request broad access to your Google Drive or other Google services.
                  </p>
                </Section>

                <Section id="google-sheets-integration" title="4. Google Sheets Integration">
                  <p>
                    ClientsDesk stores your client records, credentials, notes, and
                    service history in a Google Sheets spreadsheet inside your own Google
                    Drive. You can either let ClientsDesk create a new spreadsheet for you
                    on first launch or connect to an existing one.
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      The spreadsheet is owned by you. ClientsDesk does not claim
                      ownership of any file in your Drive.
                    </li>
                    <li>
                      ClientsDesk reads from and writes to the connected sheet on your
                      device. Data is transmitted directly between your device and Google's
                      servers using encrypted connections (HTTPS/TLS).
                    </li>
                    <li>
                      A cached, on-device copy of your data is maintained so the app can
                      function while offline. This cache lives only on your device.
                    </li>
                    <li>
                      If you delete the spreadsheet from your Drive, ClientsDesk loses
                      access to that data. The spreadsheet's lifecycle is fully under your
                      control.
                    </li>
                  </ul>
                </Section>

                <Section id="data-ownership" title="5. Data Ownership">
                  <p>
                    You own the business data you enter into ClientsDesk. That data is
                    stored in your Google account as a standard Google Sheet that you can
                    open in any web browser, download, share, archive, or migrate without
                    involving ClientsDesk or MV App Studio.
                  </p>
                  <p>
                    MV App Studio does not claim a license to your client records, will
                    not sell or share them with third parties, and does not use them to
                    train any model or service.
                  </p>
                </Section>

                <Section id="how-we-use-information" title="6. How We Use Information">
                  <p>The limited information we do collect is used to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Authenticate you and maintain your session.</li>
                    <li>Connect the application to your designated Google Sheet.</li>
                    <li>
                      Diagnose crashes, improve performance, and fix bugs using anonymous
                      diagnostic data.
                    </li>
                    <li>Respond to support inquiries you initiate.</li>
                    <li>Communicate important service updates such as security notices.</li>
                  </ul>
                  <p>
                    We do not use your information to deliver third-party advertising, and
                    we do not sell personal information.
                  </p>
                </Section>

                <Section id="data-sharing" title="7. Data Sharing & Disclosure">
                  <p>
                    We share information only in the narrow circumstances listed below:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <span className="text-white font-medium">Google.</span> Authentication
                      and Google Sheets requests are processed by Google's services so the
                      app can sign you in and read or write your spreadsheet.
                    </li>
                    <li>
                      <span className="text-white font-medium">Service providers.</span>{" "}
                      Limited diagnostic and crash reporting providers may receive anonymous
                      device data to help us maintain the app. These providers are
                      contractually limited in how they may use that data.
                    </li>
                    <li>
                      <span className="text-white font-medium">Legal requirements.</span>{" "}
                      We may disclose information if required by law, subpoena, or to
                      protect the safety, rights, or property of MV App Studio, our users,
                      or the public.
                    </li>
                  </ul>
                  <p>
                    We do not sell, rent, or trade personal information for marketing
                    purposes.
                  </p>
                </Section>

                <Section id="data-security" title="8. Data Security">
                  <p>
                    ClientsDesk uses encrypted connections (HTTPS/TLS) for all network
                    traffic between the app, Google's services, and any MV App Studio
                    systems. Authentication tokens are stored using the secure storage
                    facilities provided by iOS (Keychain).
                  </p>
                  <p>
                    Because client business data lives in your Google account, its
                    security also depends on the configuration of your Google account. We
                    strongly encourage you to enable two-factor authentication on the
                    Google account you use with ClientsDesk and to follow IT security best
                    practices appropriate for the sensitivity of the credentials you store.
                  </p>
                  <p>
                    No system can be guaranteed to be fully secure. If we become aware of
                    a security incident that materially affects users, we will notify
                    affected users as required by applicable law.
                  </p>
                </Section>

                <Section id="data-retention" title="9. Data Retention">
                  <p>
                    Your business data is retained for as long as you keep the connected
                    Google Sheet in your Drive. Deleting the spreadsheet, or revoking
                    ClientsDesk's access from your Google account, removes ClientsDesk's
                    ability to read or write to it.
                  </p>
                  <p>
                    Account identifiers and tokens stored on-device are removed when you
                    sign out of the app or uninstall it.
                  </p>
                  <p>
                    Anonymous diagnostic and crash data is retained only as long as
                    necessary to investigate and resolve issues, after which it is
                    discarded or further aggregated.
                  </p>
                </Section>

                <Section id="user-responsibilities" title="10. User Responsibilities">
                  <p>
                    Because you own and control your underlying business data, you are
                    responsible for:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Keeping your Google account secure, including using a strong password
                      and enabling two-factor authentication.
                    </li>
                    <li>
                      Ensuring you have authority to store any third-party credentials or
                      client information that you choose to enter into the app.
                    </li>
                    <li>
                      Complying with any contractual, regulatory, or professional
                      obligations applicable to your handling of client data (including
                      industry-specific requirements your business may be subject to).
                    </li>
                    <li>
                      Managing access to the connected Google Sheet, including who you
                      share it with from your Drive.
                    </li>
                    <li>
                      Maintaining backups of your spreadsheet if continuity is critical to
                      your business.
                    </li>
                  </ul>
                </Section>

                <Section id="your-rights" title="11. Your Rights">
                  <p>You have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Access the data ClientsDesk has stored about your account by
                      contacting us.
                    </li>
                    <li>
                      Export all of your client records at any time — the Google Sheet
                      itself is the export.
                    </li>
                    <li>
                      Revoke ClientsDesk's access to your Google account at any time
                      through Google Account permissions.
                    </li>
                    <li>
                      Request deletion of any account-level information held by MV App
                      Studio by contacting us at the email address below.
                    </li>
                  </ul>
                  <p>
                    Depending on your jurisdiction, additional rights may apply (for
                    example, under the General Data Protection Regulation in the EU/UK or
                    under the California Consumer Privacy Act). We will honor verified
                    requests as required by applicable law.
                  </p>
                </Section>

                <Section id="childrens-privacy" title="12. Children's Privacy">
                  <p>
                    ClientsDesk is a professional business application not directed to
                    children. We do not knowingly collect personal information from
                    children under the age of 13. If you believe a child has provided us
                    with personal information, please contact us so we can remove it.
                  </p>
                </Section>

                <Section id="changes" title="13. Changes to This Policy">
                  <p>
                    We may update this Privacy Policy from time to time to reflect changes
                    to the Service, legal requirements, or operational practices. When we
                    make material changes, we will update the effective date at the top of
                    this page and, where appropriate, notify users in-app or by email.
                  </p>
                  <p>
                    Continued use of ClientsDesk after changes take effect constitutes
                    acceptance of the updated policy.
                  </p>
                </Section>

                <Section id="contact" title="14. Contact Information">
                  <p>
                    Questions about this Privacy Policy or about how ClientsDesk handles
                    your information can be directed to MV App Studio:
                  </p>
                  <div
                    className="rounded-2xl p-6 border border-white/10 mt-2"
                    style={{
                      background: "rgba(255,255,255,0.03)",
                    }}
                  >
                    <p className="text-white font-semibold mb-2">MV App Studio</p>
                    <p className="text-slate-400 text-sm mb-3">Martha's Vineyard, Massachusetts, USA</p>
                    <a
                      href="mailto:louis@mvappstudio.com"
                      className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                      style={{ color: BRAND_GREEN }}
                    >
                      <Mail size={16} />
                      louis@mvappstudio.com
                    </a>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 pt-4">
                    <Link
                      to="/start-project"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-white shadow-lg"
                      style={{ background: BRAND_GRADIENT }}
                    >
                      Contact MV App Studio
                    </Link>
                    <Link
                      to="/services/mv-app-design/clientsdesk/terms"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-white border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                    >
                      View Terms of Service
                      <ChevronRight size={16} />
                    </Link>
                  </div>
                </Section>
              </article>
            </div>
          </div>
        </section>
      </div>
    </AppStudioLayout>
  );
}
