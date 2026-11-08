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
  { id: "agreement", label: "Agreement to Terms" },
  { id: "service-description", label: "Description of Service" },
  { id: "accounts", label: "Accounts & Eligibility" },
  { id: "google-services", label: "Use of Google Services" },
  { id: "user-data", label: "User Data & Content" },
  { id: "acceptable-use", label: "Acceptable Use" },
  { id: "fees", label: "Fees & Subscriptions" },
  { id: "intellectual-property", label: "Intellectual Property" },
  { id: "third-party", label: "Third-Party Services" },
  { id: "disclaimers", label: "Disclaimers" },
  { id: "liability", label: "Limitation of Liability" },
  { id: "indemnification", label: "Indemnification" },
  { id: "termination", label: "Termination" },
  { id: "changes", label: "Changes to Terms" },
  { id: "governing-law", label: "Governing Law" },
  { id: "contact", label: "Contact" },
];

export default function ClientsDeskTerms() {
  useDocumentMeta({
    title: "Terms of Service | ClientsDesk | MV App Studio",
    description:
      "ClientsDesk Terms of Service. The agreement governing your use of the ClientsDesk application by MV App Studio, including acceptable use, data ownership, and Google services.",
    canonical: "https://anythingitechmv.com/services/mv-app-design/clientsdesk/terms",
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
            className="absolute -top-40 -right-40 w-[420px] h-[420px] rounded-full blur-[120px] opacity-25"
            style={{ background: BRAND_GREEN }}
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
              Terms of Service
            </h1>
            <p className="text-slate-400 text-base">Effective Date: {EFFECTIVE_DATE}</p>
          </div>
        </section>

        <section className="section-tight">
          <div className="container">
            <div className="grid lg:grid-cols-[240px_minmax(0,1fr)] gap-10 lg:gap-16">
              {/* TOC */}
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

              <article className="space-y-12 max-w-3xl">
                <Section id="agreement" title="1. Agreement to Terms">
                  <p>
                    These Terms of Service ("Terms") govern your access to and use of the
                    ClientsDesk application and any related services (collectively, the
                    "Service") provided by MV App Studio ("MV App Studio," "we," "us," or
                    "our"). By downloading, installing, accessing, or using the Service,
                    you agree to be bound by these Terms and by the ClientsDesk{" "}
                    <Link
                      to="/services/mv-app-design/clientsdesk/privacy"
                      className="underline hover:text-white"
                      style={{ color: BRAND_GREEN }}
                    >
                      Privacy Policy
                    </Link>
                    .
                  </p>
                  <p>
                    If you do not agree to these Terms, do not download, install, or use
                    ClientsDesk.
                  </p>
                </Section>

                <Section id="service-description" title="2. Description of Service">
                  <p>
                    ClientsDesk is a client management application designed for IT
                    professionals, managed service providers, consultants, and similar
                    technology service businesses. The Service allows you to organize
                    client records, credentials, service history, and notes, with that
                    data stored in a Google Sheets spreadsheet held in your own Google
                    Drive.
                  </p>
                  <p>
                    Features, functionality, and supported platforms may evolve over
                    time. We may add, change, or remove features at our discretion.
                  </p>
                </Section>

                <Section id="accounts" title="3. Accounts & Eligibility">
                  <p>
                    To use ClientsDesk you must:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Be at least 18 years old, or the age of legal majority in your jurisdiction.</li>
                    <li>Have a valid Google account.</li>
                    <li>
                      Agree to authenticate to the Service using Google Sign-In and to
                      grant the OAuth permissions required for the Service to function.
                    </li>
                    <li>
                      Provide accurate information when interacting with us, including
                      when requesting support or early access.
                    </li>
                  </ul>
                  <p>
                    You are responsible for all activity that occurs under your account
                    and for keeping your Google account credentials secure.
                  </p>
                </Section>

                <Section id="google-services" title="4. Use of Google Services">
                  <p>
                    ClientsDesk uses Google services (Google Sign-In and the Google Sheets
                    API) to authenticate users and to read and write the spreadsheet you
                    designate as your ClientsDesk data file.
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Your use of Google services through ClientsDesk is also subject to
                      Google's applicable terms, including the{" "}
                      <a
                        href="https://policies.google.com/terms"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-white"
                        style={{ color: BRAND_GREEN }}
                      >
                        Google Terms of Service
                      </a>{" "}
                      and{" "}
                      <a
                        href="https://policies.google.com/privacy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-white"
                        style={{ color: BRAND_GREEN }}
                      >
                        Google Privacy Policy
                      </a>
                      .
                    </li>
                    <li>
                      ClientsDesk's use and transfer of information received from Google
                      APIs adheres to the{" "}
                      <a
                        href="https://developers.google.com/terms/api-services-user-data-policy"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-white"
                        style={{ color: BRAND_GREEN }}
                      >
                        Google API Services User Data Policy
                      </a>
                      , including the Limited Use requirements.
                    </li>
                    <li>
                      You may revoke ClientsDesk's access to your Google account at any
                      time via{" "}
                      <a
                        href="https://myaccount.google.com/permissions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline hover:text-white"
                        style={{ color: BRAND_GREEN }}
                      >
                        Google Account permissions
                      </a>
                      .
                    </li>
                  </ul>
                </Section>

                <Section id="user-data" title="5. User Data & Content">
                  <p>
                    You own the client information, credentials, notes, and other content
                    you enter into ClientsDesk ("User Content"). User Content is stored in
                    a Google Sheets file in your own Google Drive, not on MV App Studio
                    servers.
                  </p>
                  <p>
                    By using the Service, you grant MV App Studio a limited, revocable
                    license to access your designated Google Sheet solely to provide the
                    Service to you. We do not claim ownership of User Content, will not
                    sell it, and will not use it to train any model.
                  </p>
                  <p>
                    You are solely responsible for User Content, including ensuring that
                    you have the right and authority to store any credentials or third-party
                    information you enter into the Service, and for complying with any
                    contractual, regulatory, or professional obligations that apply to
                    your handling of that information.
                  </p>
                </Section>

                <Section id="acceptable-use" title="6. Acceptable Use">
                  <p>You agree not to use the Service to:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      Violate any applicable law, regulation, or third-party right.
                    </li>
                    <li>
                      Store, share, or transmit content that is unlawful, harassing,
                      defamatory, or that infringes intellectual property rights.
                    </li>
                    <li>
                      Attempt to gain unauthorized access to the Service, other users'
                      accounts, MV App Studio systems, or any Google account that you do
                      not own or have authorization to access.
                    </li>
                    <li>
                      Reverse engineer, decompile, or disassemble the Service except to
                      the extent expressly permitted by applicable law.
                    </li>
                    <li>
                      Use the Service to develop a competing product, or to scrape or
                      bulk-extract data from MV App Studio systems.
                    </li>
                    <li>
                      Interfere with or disrupt the integrity or performance of the
                      Service.
                    </li>
                  </ul>
                </Section>

                <Section id="fees" title="7. Fees & Subscriptions">
                  <p>
                    ClientsDesk may be offered as a free application, as a paid
                    application, or with optional paid features, plans, or subscriptions.
                    Pricing and plan details, if any, will be disclosed in-app or on the
                    App Store listing prior to purchase.
                  </p>
                  <p>
                    Paid subscriptions purchased through the Apple App Store are managed
                    through your Apple ID account and are subject to Apple's payment and
                    refund policies. Cancellation must be performed through your Apple ID
                    subscription settings.
                  </p>
                  <p>
                    We reserve the right to change pricing or introduce paid features in
                    the future. Existing subscribers will receive notice of material
                    pricing changes consistent with applicable App Store rules.
                  </p>
                </Section>

                <Section id="intellectual-property" title="8. Intellectual Property">
                  <p>
                    The Service, including its software, design, branding, and
                    documentation, is owned by MV App Studio and is protected by
                    intellectual property laws. These Terms do not transfer any ownership
                    rights in the Service to you.
                  </p>
                  <p>
                    Subject to your compliance with these Terms, MV App Studio grants you
                    a limited, non-exclusive, non-transferable, revocable license to
                    install and use ClientsDesk on devices you own or control, solely for
                    your internal business purposes.
                  </p>
                </Section>

                <Section id="third-party" title="9. Third-Party Services">
                  <p>
                    The Service relies on third-party platforms and services, including
                    Apple's App Store, Google authentication, and the Google Sheets API.
                    Your use of those third-party services is governed by their own terms
                    and privacy policies, which take precedence over these Terms with
                    respect to those services.
                  </p>
                  <p>
                    MV App Studio is not responsible for the availability, accuracy, or
                    practices of any third-party service.
                  </p>
                </Section>

                <Section id="disclaimers" title="10. Disclaimers">
                  <p>
                    THE SERVICE IS PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS. TO THE
                    FULLEST EXTENT PERMITTED BY LAW, MV APP STUDIO DISCLAIMS ALL
                    WARRANTIES, EXPRESS OR IMPLIED, INCLUDING IMPLIED WARRANTIES OF
                    MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
                    NON-INFRINGEMENT.
                  </p>
                  <p>
                    MV App Studio does not warrant that the Service will be uninterrupted,
                    error-free, or completely secure, or that any data stored in your
                    Google account will remain accessible if you alter or remove that
                    data. You are responsible for maintaining backups of any data that is
                    critical to your business.
                  </p>
                </Section>

                <Section id="liability" title="11. Limitation of Liability">
                  <p>
                    TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, MV APP STUDIO AND
                    ITS OWNERS, EMPLOYEES, AND AGENTS WILL NOT BE LIABLE FOR ANY
                    INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR
                    ANY LOSS OF PROFITS, REVENUE, DATA, GOODWILL, OR BUSINESS
                    OPPORTUNITIES ARISING OUT OF OR RELATING TO THE SERVICE.
                  </p>
                  <p>
                    In no event will MV App Studio's aggregate liability for any claim
                    arising from or relating to the Service exceed the greater of (a)
                    one hundred U.S. dollars (US$100) or (b) the amounts paid by you to
                    MV App Studio for the Service in the twelve months preceding the
                    event giving rise to the claim.
                  </p>
                </Section>

                <Section id="indemnification" title="12. Indemnification">
                  <p>
                    You agree to defend, indemnify, and hold harmless MV App Studio and
                    its owners, employees, and agents from any claims, damages,
                    liabilities, and expenses (including reasonable attorneys' fees)
                    arising out of or related to (a) your use of the Service, (b) your
                    User Content, (c) your violation of these Terms, or (d) your
                    violation of any law or third-party right.
                  </p>
                </Section>

                <Section id="termination" title="13. Termination">
                  <p>
                    You may stop using the Service at any time by signing out, uninstalling
                    the app, and revoking ClientsDesk's access from your Google account
                    permissions.
                  </p>
                  <p>
                    MV App Studio may suspend or terminate your access to the Service if
                    you violate these Terms, if required by law, or if continued provision
                    of the Service becomes impractical. Upon termination, the licenses
                    granted to you under these Terms end, but your User Content stored in
                    your own Google account remains yours.
                  </p>
                </Section>

                <Section id="changes" title="14. Changes to Terms">
                  <p>
                    We may revise these Terms from time to time. When we make material
                    changes, we will update the effective date above and, where
                    appropriate, notify users in-app or by email. Continued use of the
                    Service after revisions take effect constitutes acceptance of the
                    revised Terms.
                  </p>
                </Section>

                <Section id="governing-law" title="15. Governing Law">
                  <p>
                    These Terms are governed by the laws of the Commonwealth of
                    Massachusetts, United States, without regard to its conflict-of-law
                    provisions. Any dispute arising out of or relating to these Terms or
                    the Service will be brought exclusively in the state or federal courts
                    located in Massachusetts, and you consent to personal jurisdiction in
                    those courts.
                  </p>
                </Section>

                <Section id="contact" title="16. Contact">
                  <p>
                    Questions about these Terms can be directed to MV App Studio:
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
                      to="/services/mv-app-design/clientsdesk/privacy"
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-semibold text-white border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                    >
                      View Privacy Policy
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
