import { AppStudioLayout } from "./AppStudioLayout";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, ChevronRight } from "lucide-react";
import { useDocumentMeta } from "@/lib/useDocumentMeta";

const CREAM = "#F5EFE0";
const CREAM_LIGHT = "#FBF7EC";
const ORANGE = "#D55A36";
const ORANGE_DARK = "#B8451F";
const SAGE = "#5B7A3E";
const SAGE_DARK = "#3F5A28";
const WOOD = "#B58A55";
const INK = "#2A2520";
const INK_SOFT = "#5C5347";
const BRAND_GRADIENT = `linear-gradient(135deg, ${ORANGE} 0%, ${SAGE} 100%)`;

const EFFECTIVE_DATE = "June 21, 2026";

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
        style={{
          color: INK,
          fontFamily: "'Space Grotesk', system-ui, sans-serif",
        }}
      >
        {title}
      </h2>
      <div
        className="space-y-4 text-[16px] leading-relaxed"
        style={{ color: INK_SOFT }}
      >
        {children}
      </div>
    </section>
  );
}

const toc = [
  { id: "overview", label: "Overview" },
  { id: "information-we-collect", label: "Information We Collect" },
  { id: "google-authentication", label: "Google Authentication" },
  { id: "google-drive-integration", label: "Google Drive Integration" },
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

export default function DailyMenuMakerPrivacy() {
  useDocumentMeta({
    title: "Privacy Policy | Daily Menu Maker | MV App Studio",
    description:
      "Daily Menu Maker Privacy Policy. Learn how Daily Menu Maker handles Google authentication, Google Drive integration, data ownership, and user responsibilities for vendors and small producers.",
    canonical:
      "https://anythingitechmv.com/services/mv-app-design/dailymenumaker/privacy",
  });

  return (
    <AppStudioLayout>
      <div style={{ background: CREAM_LIGHT, color: INK }}>
        {/* Header */}
        <section
          className="relative overflow-hidden border-b"
          style={{ borderColor: `${WOOD}33` }}
        >
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${CREAM_LIGHT} 0%, ${CREAM} 100%)`,
            }}
          />
          <div
            className="absolute -top-40 -left-40 w-[420px] h-[420px] rounded-full blur-[120px] opacity-25"
            style={{ background: ORANGE }}
          />
          <div className="container relative section-tight">
            <Link
              to="/services/mv-app-design/dailymenumaker"
              className="inline-flex items-center gap-2 text-sm transition-colors mb-8"
              style={{ color: INK_SOFT }}
            >
              <ArrowLeft size={16} />
              Back to Daily Menu Maker
            </Link>
            <Link
              to="/services/mv-app-design/dailymenumaker"
              className="inline-flex items-center gap-3 mb-6"
            >
              <img
                src="/dailymenumaker-logo.png"
                alt="Daily Menu Maker logo"
                style={{
                  height: 48,
                  width: 48,
                  objectFit: "contain",
                  filter: `drop-shadow(0 6px 18px ${ORANGE}33)`,
                }}
              />
              <span
                className="text-lg font-bold tracking-tight"
                style={{
                  color: INK,
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                }}
              >
                Daily Menu Maker
              </span>
            </Link>
            <h1
              className="font-bold tracking-tight mb-4"
              style={{
                color: INK,
                fontFamily: "'Space Grotesk', system-ui, sans-serif",
                fontSize: "clamp(2.25rem, 4.5vw + 0.5rem, 3.5rem)",
                lineHeight: 1.05,
                letterSpacing: "-0.03em",
              }}
            >
              Privacy Policy
            </h1>
            <p className="text-base" style={{ color: INK_SOFT }}>
              Effective Date: {EFFECTIVE_DATE}
            </p>
          </div>
        </section>

        <section className="section-tight">
          <div className="container">
            <div className="grid lg:grid-cols-[240px_minmax(0,1fr)] gap-10 lg:gap-16">
              <aside className="hidden lg:block">
                <div className="sticky top-24">
                  <div
                    className="text-xs font-semibold uppercase tracking-[0.18em] mb-4"
                    style={{ color: ORANGE_DARK }}
                  >
                    Contents
                  </div>
                  <nav className="space-y-1.5">
                    {toc.map((item) => (
                      <a
                        key={item.id}
                        href={`#${item.id}`}
                        className="block text-sm transition-colors py-1 hover:opacity-100"
                        style={{ color: INK_SOFT }}
                      >
                        {item.label}
                      </a>
                    ))}
                  </nav>
                </div>
              </aside>

              <article className="space-y-12 max-w-3xl">
                <Section id="overview" title="1. Overview">
                  <p>
                    Daily Menu Maker is a vendor menu management application developed
                    and operated by MV App Studio ("we," "us," or "our"). This Privacy
                    Policy describes how Daily Menu Maker collects, uses, stores, and
                    protects information when you use the Daily Menu Maker mobile
                    application and any related services (collectively, the "Service").
                  </p>
                  <p>
                    Daily Menu Maker is designed for farmers market vendors, bakeries,
                    coffee shops, food trucks, makers, and other small producers whose
                    daily offerings change. A core principle of the Service is that your
                    business data — your vendor profile, your product list, and the
                    menus you generate — remains stored in your own Google account, not
                    on Daily Menu Maker-operated databases.
                  </p>
                  <p>
                    By using Daily Menu Maker, you agree to the practices described in
                    this Privacy Policy.
                  </p>
                </Section>

                <Section id="information-we-collect" title="2. Information We Collect">
                  <p>
                    Daily Menu Maker collects only the information needed to authenticate
                    you, operate the application, and provide support. Specifically:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <span className="font-medium" style={{ color: INK }}>
                        Account identifiers.
                      </span>{" "}
                      Your Google account email address and basic profile information
                      (name, profile photo) supplied by Google during sign-in.
                    </li>
                    <li>
                      <span className="font-medium" style={{ color: INK }}>
                        Authorization tokens.
                      </span>{" "}
                      OAuth access and refresh tokens issued by Google so the app can
                      read and write to the specific Google Drive folder and spreadsheet
                      you use with Daily Menu Maker.
                    </li>
                    <li>
                      <span className="font-medium" style={{ color: INK }}>
                        Device and diagnostic data.
                      </span>{" "}
                      Anonymous crash reports, performance metrics, and operating system
                      version, used to diagnose problems and improve stability.
                    </li>
                    <li>
                      <span className="font-medium" style={{ color: INK }}>
                        Support communications.
                      </span>{" "}
                      Information you voluntarily provide when you contact us by email
                      or through MV App Studio's contact form.
                    </li>
                  </ul>
                  <p>
                    The actual contents of your vendor data — your products, descriptions,
                    prices, generated menus, and vendor profile — are{" "}
                    <span className="font-medium" style={{ color: INK }}>
                      not transmitted to or stored on Daily Menu Maker servers
                    </span>
                    . They are written directly to the Google Drive folder and
                    spreadsheet in your own Google account.
                  </p>
                </Section>

                <Section id="google-authentication" title="3. Google Authentication">
                  <p>
                    Daily Menu Maker uses Google Sign-In (OAuth 2.0) to authenticate
                    users. When you sign in:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Google verifies your identity and returns a secure token to the
                      Daily Menu Maker application.
                    </li>
                    <li>
                      Daily Menu Maker never sees or stores your Google password.
                    </li>
                    <li>
                      You may revoke Daily Menu Maker's access at any time from your
                      Google Account permissions page at{" "}
                      <a
                        href="https://myaccount.google.com/permissions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline"
                        style={{ color: SAGE_DARK }}
                      >
                        myaccount.google.com/permissions
                      </a>
                      .
                    </li>
                  </ul>
                  <p>
                    The OAuth scopes Daily Menu Maker requests are limited to what is
                    required to (a) identify you for sign-in and (b) read and write the
                    specific Google Drive folder and spreadsheet you designate for Daily
                    Menu Maker use. Daily Menu Maker does not request broad access to
                    your Google Drive or other Google services.
                  </p>
                </Section>

                <Section id="google-drive-integration" title="4. Google Drive Integration">
                  <p>
                    Daily Menu Maker stores your vendor profile, product list, and
                    generated menus in a Google Sheets spreadsheet inside a dedicated
                    folder in your own Google Drive. The folder and spreadsheet can be
                    created automatically by Daily Menu Maker on first launch, or you
                    can reconnect an existing Daily Menu Maker database later from
                    Settings.
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      The folder and spreadsheet are owned by you. Daily Menu Maker does
                      not claim ownership of any file in your Drive.
                    </li>
                    <li>
                      Daily Menu Maker reads from and writes to the connected files on
                      your device. Data is transmitted directly between your device and
                      Google's servers using encrypted connections (HTTPS/TLS).
                    </li>
                    <li>
                      A cached, on-device copy of your data is maintained so the app can
                      function while offline. This cache lives only on your device.
                    </li>
                    <li>
                      If you delete the folder or spreadsheet from your Drive, Daily
                      Menu Maker loses access to that data. The lifecycle of those
                      files is fully under your control.
                    </li>
                  </ul>
                </Section>

                <Section id="data-ownership" title="5. Data Ownership">
                  <p>
                    You own the business data you enter into Daily Menu Maker. That data
                    is stored in your Google account as standard Google Drive files that
                    you can open in any web browser, download, share, archive, or
                    migrate without involving Daily Menu Maker or MV App Studio.
                  </p>
                  <p>
                    MV App Studio does not claim a license to your vendor data, will not
                    sell or share it with third parties, and does not use it to train
                    any model or service.
                  </p>
                </Section>

                <Section id="how-we-use-information" title="6. How We Use Information">
                  <p>The limited information we do collect is used to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Authenticate you and maintain your session.</li>
                    <li>
                      Connect the application to your designated Google Drive folder
                      and spreadsheet.
                    </li>
                    <li>
                      Diagnose crashes, improve performance, and fix bugs using
                      anonymous diagnostic data.
                    </li>
                    <li>Respond to support inquiries you initiate.</li>
                    <li>
                      Communicate important service updates such as security notices.
                    </li>
                  </ul>
                  <p>
                    We do not use your information to deliver third-party advertising,
                    and we do not sell personal information.
                  </p>
                </Section>

                <Section id="data-sharing" title="7. Data Sharing & Disclosure">
                  <p>
                    We share information only in the narrow circumstances listed below:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <span className="font-medium" style={{ color: INK }}>
                        Google.
                      </span>{" "}
                      Authentication and Google Drive requests are processed by Google's
                      services so the app can sign you in and read or write your
                      vendor data.
                    </li>
                    <li>
                      <span className="font-medium" style={{ color: INK }}>
                        Service providers.
                      </span>{" "}
                      Limited diagnostic and crash reporting providers may receive
                      anonymous device data to help us maintain the app. These providers
                      are contractually limited in how they may use that data.
                    </li>
                    <li>
                      <span className="font-medium" style={{ color: INK }}>
                        Legal requirements.
                      </span>{" "}
                      We may disclose information if required by law, subpoena, or to
                      protect the safety, rights, or property of MV App Studio, our
                      users, or the public.
                    </li>
                  </ul>
                  <p>
                    We do not sell, rent, or trade personal information for marketing
                    purposes.
                  </p>
                </Section>

                <Section id="data-security" title="8. Data Security">
                  <p>
                    Daily Menu Maker uses encrypted connections (HTTPS/TLS) for all
                    network traffic between the app, Google's services, and any MV App
                    Studio systems. Authentication tokens are stored using the secure
                    storage facilities provided by iOS (Keychain).
                  </p>
                  <p>
                    Because vendor data lives in your Google account, its security also
                    depends on the configuration of your Google account. We strongly
                    encourage you to enable two-factor authentication on the Google
                    account you use with Daily Menu Maker.
                  </p>
                  <p>
                    No system can be guaranteed to be fully secure. If we become aware
                    of a security incident that materially affects users, we will notify
                    affected users as required by applicable law.
                  </p>
                </Section>

                <Section id="data-retention" title="9. Data Retention">
                  <p>
                    Your business data is retained for as long as you keep the connected
                    Daily Menu Maker folder and spreadsheet in your Drive. Deleting
                    those files, or revoking Daily Menu Maker's access from your Google
                    account, removes Daily Menu Maker's ability to read or write to
                    them.
                  </p>
                  <p>
                    Account identifiers and tokens stored on-device are removed when
                    you sign out of the app or uninstall it.
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
                      Keeping your Google account secure, including using a strong
                      password and enabling two-factor authentication.
                    </li>
                    <li>
                      Ensuring the accuracy of product names, descriptions, prices, and
                      other information you publish in generated menus.
                    </li>
                    <li>
                      Complying with any contractual, regulatory, or professional
                      obligations applicable to your handling of business data,
                      pricing, ingredients, or allergen information.
                    </li>
                    <li>
                      Managing access to the connected Drive folder and spreadsheet,
                      including who you share them with from your Drive.
                    </li>
                    <li>
                      Maintaining backups of your data if continuity is critical to your
                      business.
                    </li>
                  </ul>
                </Section>

                <Section id="your-rights" title="11. Your Rights">
                  <p>You have the right to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Access the data Daily Menu Maker has stored about your account by
                      contacting us.
                    </li>
                    <li>
                      Export all of your vendor data at any time — the Google Drive
                      folder and spreadsheet are the export.
                    </li>
                    <li>
                      Revoke Daily Menu Maker's access to your Google account at any
                      time through Google Account permissions.
                    </li>
                    <li>
                      Request deletion of any account-level information held by MV App
                      Studio by contacting us at the email address below.
                    </li>
                  </ul>
                  <p>
                    Depending on your jurisdiction, additional rights may apply (for
                    example, under the General Data Protection Regulation in the EU/UK
                    or under the California Consumer Privacy Act). We will honor
                    verified requests as required by applicable law.
                  </p>
                </Section>

                <Section id="childrens-privacy" title="12. Children's Privacy">
                  <p>
                    Daily Menu Maker is a professional business application not directed
                    to children. We do not knowingly collect personal information from
                    children under the age of 13. If you believe a child has provided us
                    with personal information, please contact us so we can remove it.
                  </p>
                </Section>

                <Section id="changes" title="13. Changes to This Policy">
                  <p>
                    We may update this Privacy Policy from time to time to reflect
                    changes to the Service, legal requirements, or operational
                    practices. When we make material changes, we will update the
                    effective date at the top of this page and, where appropriate,
                    notify users in-app or by email.
                  </p>
                  <p>
                    Continued use of Daily Menu Maker after changes take effect
                    constitutes acceptance of the updated policy.
                  </p>
                </Section>

                <Section id="contact" title="14. Contact Information">
                  <p>
                    Questions about this Privacy Policy or about how Daily Menu Maker
                    handles your information can be directed to MV App Studio:
                  </p>
                  <div
                    className="rounded-2xl p-6 border mt-2 bg-white"
                    style={{ borderColor: `${WOOD}33` }}
                  >
                    <p
                      className="font-semibold mb-2"
                      style={{ color: INK }}
                    >
                      MV App Studio
                    </p>
                    <p className="text-sm mb-3" style={{ color: INK_SOFT }}>
                      Martha's Vineyard, Massachusetts, USA
                    </p>
                    <a
                      href="mailto:louis@mvappstudio.com"
                      className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                      style={{ color: SAGE_DARK }}
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
                      to="/services/mv-app-design/dailymenumaker/terms"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold border bg-white transition-colors"
                      style={{ color: INK, borderColor: `${WOOD}66` }}
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
