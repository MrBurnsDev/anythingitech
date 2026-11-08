import { AppStudioLayout } from "./AppStudioLayout";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { useDocumentMeta } from "@/lib/useDocumentMeta";
import {
  Shield,
  KeyRound,
  FileText,
  Sheet,
  WifiOff,
  Search,
  Briefcase,
  Lock,
  Database,
  Download,
  Eye,
  LogIn,
  FolderPlus,
  Users,
  Smartphone,
  ChevronRight,
  Mail,
  ArrowRight,
  Apple,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// =============================================================================
// BRAND
// =============================================================================

const BRAND_BLUE = "#1F8FE0";
const BRAND_BLUE_DARK = "#0B5FB8";
const BRAND_GREEN = "#5DBA47";
const BRAND_GRADIENT = `linear-gradient(135deg, ${BRAND_BLUE} 0%, ${BRAND_GREEN} 100%)`;

// =============================================================================
// LOGO
// =============================================================================

function ClientsDeskLogo({ size = 48 }: { size?: number }) {
  return (
    <img
      src="/clientsdesk-logo.png"
      alt="ClientsDesk logo"
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        filter: `drop-shadow(0 8px 20px ${BRAND_BLUE}55)`,
      }}
    />
  );
}

function ClientsDeskWordmark({ height = 44 }: { height?: number }) {
  return (
    <img
      src="/clientsdesk-wordmark.png"
      alt="ClientsDesk"
      style={{
        height,
        width: "auto",
        objectFit: "contain",
        filter: `drop-shadow(0 8px 24px ${BRAND_BLUE}55)`,
      }}
    />
  );
}

// =============================================================================
// HERO PHONE MOCKUP — Client list preview
// =============================================================================

function HeroPhoneMock() {
  const prefersReducedMotion = useReducedMotion();

  const clients = [
    { name: "Harborview Realty", tag: "Active", note: "Office network, 12 devices" },
    { name: "Edgartown Marina", tag: "Active", note: "Wi-Fi mesh, Synology NAS" },
    { name: "Vineyard Legal Group", tag: "Active", note: "Microsoft 365, security" },
    { name: "Coastal Construction", tag: "Active", note: "Mobile devices, MDM" },
    { name: "Island Hospitality Co.", tag: "Active", note: "POS, guest Wi-Fi" },
  ];

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <motion.div
        animate={prefersReducedMotion ? {} : { y: [0, -8, 0] }}
        transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
      >
        <div
          className="relative w-[280px] md:w-[320px] rounded-[3rem] p-[8px]"
          style={{
            background: "linear-gradient(145deg, #2a2a3e 0%, #1a1a2e 50%, #0f0f1a 100%)",
            boxShadow:
              "0 50px 100px -20px rgba(0, 0, 0, 0.55), 0 30px 60px -30px rgba(0, 0, 0, 0.65)",
          }}
        >
          <div className="relative rounded-[2.5rem] overflow-hidden bg-[#0B1220]">
            <div className="relative aspect-[9/19.5] overflow-hidden">
              {/* Status bar */}
              <div className="absolute top-0 left-0 right-0 z-30">
                <div className="flex items-center justify-between px-6 py-2">
                  <span className="text-sm font-semibold text-white w-12">9:41</span>
                  <div className="w-28 h-8 bg-black rounded-full" />
                  <div className="flex items-center gap-1 w-12 justify-end">
                    <div className="flex items-end gap-[2px]">
                      <div className="w-[3px] h-[4px] bg-white rounded-sm" />
                      <div className="w-[3px] h-[6px] bg-white rounded-sm" />
                      <div className="w-[3px] h-[8px] bg-white rounded-sm" />
                      <div className="w-[3px] h-[10px] bg-white rounded-sm" />
                    </div>
                    <svg className="w-4 h-4 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 18c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0-6c3.03 0 5.78 1.23 7.76 3.22l-2.12 2.12C16.2 15.9 14.2 15 12 15s-4.2.9-5.64 2.34l-2.12-2.12C6.22 13.23 8.97 12 12 12zm0-6c4.42 0 8.44 1.79 11.34 4.69l-2.12 2.12C18.78 10.37 15.53 9 12 9s-6.78 1.37-9.22 3.81L.66 10.69C3.56 7.79 7.58 6 12 6z" />
                    </svg>
                    <div className="flex items-center ml-1">
                      <div className="w-6 h-3 rounded-sm border border-white p-[1px]">
                        <div className="w-full h-full bg-white rounded-[1px]" />
                      </div>
                      <div className="w-[2px] h-[5px] bg-white rounded-r-sm -ml-[1px]" />
                    </div>
                  </div>
                </div>
              </div>

              {/* App content */}
              <div className="pt-14 px-5 pb-6 h-full overflow-hidden">
                {/* App header */}
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <div className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">
                      Clients
                    </div>
                    <h2 className="text-white text-2xl font-bold leading-tight tracking-tight">
                      All Clients
                    </h2>
                  </div>
                  <div
                    className="w-9 h-9 rounded-full flex items-center justify-center"
                    style={{ background: BRAND_GRADIENT }}
                  >
                    <Search size={16} className="text-white" strokeWidth={2.5} />
                  </div>
                </div>

                {/* Search bar */}
                <div className="mb-5 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                  <Search size={14} className="text-slate-500" />
                  <span className="text-[12px] text-slate-500">Search clients, notes, credentials</span>
                </div>

                {/* Client list */}
                <div className="space-y-2.5">
                  {clients.map((c, i) => (
                    <div
                      key={i}
                      className="rounded-2xl p-3 bg-white/[0.04] border border-white/[0.06]"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-[13px] font-semibold tracking-tight">
                          {c.name}
                        </span>
                        <span
                          className="text-[9px] font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            background: `${BRAND_GREEN}1F`,
                            color: BRAND_GREEN,
                          }}
                        >
                          {c.tag}
                        </span>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-snug">{c.note}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom tab bar */}
              <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-3 bg-gradient-to-t from-[#0B1220] via-[#0B1220]/95 to-transparent">
                <div className="flex items-center justify-around">
                  {[
                    { icon: Users, label: "Clients", active: true },
                    { icon: KeyRound, label: "Vault" },
                    { icon: FileText, label: "Notes" },
                    { icon: Search, label: "Search" },
                  ].map((t, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <t.icon
                        size={18}
                        style={{ color: t.active ? BRAND_GREEN : "#64748b" }}
                        strokeWidth={2.25}
                      />
                      <span
                        className="text-[9px] font-medium"
                        style={{ color: t.active ? BRAND_GREEN : "#64748b" }}
                      >
                        {t.label}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Home indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full" />
          </div>
        </div>

        {/* Glow */}
        <div
          className="absolute -inset-10 -z-10 rounded-full opacity-40 blur-3xl"
          style={{
            background: `radial-gradient(circle, ${BRAND_BLUE}80 0%, transparent 70%)`,
          }}
        />
      </motion.div>
    </motion.div>
  );
}

// =============================================================================
// FEATURE CARD
// =============================================================================

interface FeatureCardProps {
  icon: typeof Shield;
  title: string;
  description: string;
  delay?: number;
}

function FeatureCard({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className="group relative rounded-2xl p-7 bg-white/[0.03] border border-white/10 hover:border-white/20 transition-all overflow-hidden"
    >
      <div
        className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: BRAND_GRADIENT }}
      />
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
        style={{
          background: `linear-gradient(135deg, ${BRAND_BLUE}26 0%, ${BRAND_GREEN}1F 100%)`,
          border: `1px solid ${BRAND_BLUE}33`,
        }}
      >
        <Icon size={22} style={{ color: BRAND_GREEN }} strokeWidth={2} />
      </div>
      <h3 className="text-white text-lg font-semibold mb-2 tracking-tight">{title}</h3>
      <p className="text-slate-400 text-[15px] leading-relaxed">{description}</p>
    </motion.div>
  );
}

// =============================================================================
// SCREENSHOT FRAME (placeholder)
// =============================================================================

interface ScreenshotFrameProps {
  label: string;
  icon: typeof LogIn;
  delay?: number;
}

function ScreenshotFrame({ label, icon: Icon, delay = 0 }: ScreenshotFrameProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center"
    >
      <div
        className="relative w-[220px] rounded-[2.25rem] p-[6px]"
        style={{
          background: "linear-gradient(145deg, #2a2a3e 0%, #1a1a2e 50%, #0f0f1a 100%)",
          boxShadow: "0 30px 60px -20px rgba(0,0,0,0.55)",
        }}
      >
        <div
          className="relative rounded-[1.85rem] overflow-hidden aspect-[9/19.5] flex items-center justify-center"
          style={{
            background:
              "linear-gradient(160deg, #0B1220 0%, #0F1A2E 55%, #0B1220 100%)",
          }}
        >
          {/* Brand gradient ring */}
          <div
            className="absolute inset-0 opacity-30"
            style={{
              background: `radial-gradient(circle at 50% 35%, ${BRAND_BLUE}66 0%, transparent 60%)`,
            }}
          />
          <div className="absolute top-3 left-1/2 -translate-x-1/2 w-16 h-4 bg-black rounded-full" />
          <div className="relative flex flex-col items-center text-center px-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: BRAND_GRADIENT }}
            >
              <Icon size={26} className="text-white" strokeWidth={2.25} />
            </div>
            <span className="text-white text-sm font-semibold tracking-tight">{label}</span>
            <span className="mt-1 text-[11px] text-slate-400">Preview coming soon</span>
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-white/20 rounded-full" />
        </div>
      </div>
      <span className="mt-4 text-xs font-medium uppercase tracking-wider text-slate-500">
        {label}
      </span>
    </motion.div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

const features = [
  {
    icon: Users,
    title: "Client Records & Service History",
    description:
      "Keep every client's details, contacts, projects, and work history in one organized, searchable place.",
  },
  {
    icon: FileText,
    title: "Notes & Invoice Reminders",
    description:
      "Capture meeting notes, follow-ups, and invoice reminders so nothing important slips through the cracks.",
  },
  {
    icon: KeyRound,
    title: "Secure Credential Management",
    description:
      "Store logins, gate codes, account numbers, and other sensitive client details safely alongside the records they belong to.",
  },
  {
    icon: Sheet,
    title: "Google Drive-Powered Database",
    description:
      "Your CRM database lives as a spreadsheet in your own Google Drive — fully owned, portable, and easy to export.",
  },
  {
    icon: WifiOff,
    title: "Offline Access & Sync",
    description:
      "Access client information on the road or at a job site, then sync changes automatically when you're back online.",
  },
  {
    icon: Search,
    title: "Quick Search",
    description:
      "Find any client, note, credential, or invoice reminder in seconds with fast full-text search.",
  },
];

const steps = [
  {
    icon: LogIn,
    title: "Sign in with Google",
    description:
      "Use your existing Google account for secure, familiar authentication — no new passwords to manage.",
  },
  {
    icon: FolderPlus,
    title: "Create Your CRM Database",
    description:
      "ClientsDesk creates a dedicated folder and spreadsheet inside your Google Drive that serves as your private CRM database. You can also reconnect an existing database later from Settings.",
  },
  {
    icon: Users,
    title: "Manage clients, notes, and records",
    description:
      "Add clients, log work, store credentials, set invoice reminders, and capture detailed notes in a fast, focused interface.",
  },
  {
    icon: Smartphone,
    title: "Access your information anywhere",
    description:
      "On-site, in the office, or off the grid — your client information is available when you need it most.",
  },
];

const screenshots = [
  { label: "Login Screen", icon: LogIn },
  { label: "Client List", icon: Users },
  { label: "Client Detail", icon: Briefcase },
  { label: "Credentials", icon: KeyRound },
  { label: "Notes", icon: FileText },
];

const faqs = [
  {
    q: "Who is ClientsDesk for?",
    a: "ClientsDesk is designed for any professional or business that manages clients, projects, service records, credentials, notes, or recurring relationships. That includes property managers, realtors, contractors, consultants, service businesses, insurance professionals, IT professionals, small business owners, and field technicians — anyone who needs a focused, private CRM they actually own.",
  },
  {
    q: "Where is my data stored?",
    a: "Your client information — names, notes, credentials, service records, and business details — is stored in a Google Sheets spreadsheet inside your own Google Drive. ClientsDesk reads and writes to that spreadsheet on your behalf, but the file lives in your account. We do not maintain a separate database of your client data on our servers.",
  },
  {
    q: "Does ClientsDesk work offline?",
    a: "Yes. ClientsDesk caches your client list, notes, and credentials on-device so you can look up important information at a job site, on the road, in a building basement, or anywhere connectivity is unreliable. Changes you make while offline sync back to your Google Drive the next time you connect.",
  },
  {
    q: "Can I export my data?",
    a: "Always. Because your data lives in a standard Google Sheet, you already have it. You can download it as a .xlsx or .csv file, share it, archive it, or move it to another tool at any time — without contacting us, and without giving up access if you ever stop using the app.",
  },
  {
    q: "Is there an Android version?",
    a: "ClientsDesk is launching first on iPhone. An Android version is being evaluated based on user demand. If you're interested in Android support, reach out to MV App Studio and let us know — early signal helps us prioritize.",
  },
  {
    q: "Will there be subscription plans?",
    a: "Pricing is still being finalized. The intent is to keep ClientsDesk affordable and straightforward for independent professionals and small teams, with pricing details published before public release. Contact us about early access to learn more.",
  },
];

export default function ClientsDesk() {
  useDocumentMeta({
    title: "ClientsDesk | A Private CRM That Lives In Your Google Drive | MV App Studio",
    description:
      "ClientsDesk is a privacy-first client management platform for professionals, consultants, and service businesses. Manage clients, notes, credentials, and invoice reminders with your data stored in your own Google Drive.",
    canonical: "https://anythingitechmv.com/services/mv-app-design/clientsdesk",
    keywords: [
      "client management app",
      "private CRM",
      "Google Drive CRM",
      "Google Sheets CRM",
      "user-owned CRM",
      "CRM for consultants",
      "CRM for contractors",
      "CRM for property managers",
      "CRM for realtors",
      "CRM for service businesses",
      "offline client management",
    ],
  });

  return (
    <AppStudioLayout>
      <div className="bg-[#06080F] text-white">
        {/* ===== HERO ===== */}
        <section className="relative overflow-hidden">
          {/* Background layers */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, #06080F 0%, #0A1020 50%, #06080F 100%)",
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />
          <div
            className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full blur-[120px] opacity-30"
            style={{ background: BRAND_BLUE }}
          />
          <div
            className="absolute top-40 -right-40 w-[460px] h-[460px] rounded-full blur-[120px] opacity-25"
            style={{ background: BRAND_GREEN }}
          />

          <div className="container relative section">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left content */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Wordmark */}
                <div className="mb-8">
                  <ClientsDeskWordmark height={56} />
                  <div className="mt-2 text-xs text-slate-400">
                    An MV App Studio product
                  </div>
                </div>

                {/* Eyebrow */}
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border"
                  style={{
                    color: BRAND_GREEN,
                    background: `${BRAND_GREEN}14`,
                    borderColor: `${BRAND_GREEN}33`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: BRAND_GREEN }}
                  />
                  A Private CRM In Your Google Drive
                </div>

                {/* Headline */}
                <h1
                  className="font-bold tracking-tight mb-6 text-white"
                  style={{
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    fontSize: "clamp(2.5rem, 5.5vw + 0.5rem, 4rem)",
                    lineHeight: 1.05,
                    letterSpacing: "-0.035em",
                  }}
                >
                  Client Management{" "}
                  <span
                    style={{
                      background: BRAND_GRADIENT,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    That You Own
                  </span>
                </h1>

                {/* Subheadline */}
                <p className="text-slate-300 text-lg leading-relaxed mb-8 max-w-xl">
                  Manage clients, notes, credentials, invoice reminders, and service
                  history from a modern mobile app while keeping your data stored in
                  your own Google Drive.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white shadow-lg cursor-default"
                    style={{ background: BRAND_GRADIENT }}
                  >
                    <Apple size={18} />
                    Coming Soon on iPhone
                  </button>
                  <Link
                    to="/start-project"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                  >
                    Contact for Early Access
                    <ArrowRight size={16} />
                  </Link>
                </div>

                {/* Supporting copy */}
                <p className="text-sm text-slate-400 max-w-xl leading-relaxed border-l-2 pl-4"
                   style={{ borderColor: BRAND_GREEN }}>
                  Unlike traditional CRM platforms, ClientsDesk stores your CRM database
                  in your own Google Drive. You own the spreadsheet, you own the data,
                  and you can take it with you at any time.
                </p>
              </motion.div>

              {/* Right phone */}
              <div className="flex justify-center lg:justify-end">
                <HeroPhoneMock />
              </div>
            </div>
          </div>
        </section>

        {/* ===== FEATURES ===== */}
        <section className="relative section border-t border-white/5">
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.4) 1px, transparent 1px)",
              backgroundSize: "64px 64px",
            }}
          />
          <div className="container relative">
            <div className="max-w-2xl mb-14">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="text-xs font-semibold uppercase tracking-[0.2em] mb-4"
                style={{ color: BRAND_GREEN }}
              >
                Features
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="text-white text-4xl md:text-5xl font-bold tracking-tight mb-5"
                style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
              >
                Everything You Need To Manage Clients
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-slate-400 text-lg leading-relaxed"
              >
                ClientsDesk focuses on the information real client work actually depends
                on — without forcing you to learn a heavyweight CRM.
              </motion.p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map((f, i) => (
                <FeatureCard
                  key={f.title}
                  icon={f.icon}
                  title={f.title}
                  description={f.description}
                  delay={i * 0.05}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ===== PRIVACY / DATA OWNERSHIP ===== */}
        <section className="relative section border-t border-white/5">
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${BRAND_BLUE}33 0%, transparent 60%)`,
            }}
          />
          <div className="container relative">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="rounded-3xl p-8 md:p-14 border border-white/10 relative overflow-hidden"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.015) 100%)",
                }}
              >
                {/* Top accent bar */}
                <div
                  className="absolute inset-x-0 top-0 h-[3px]"
                  style={{ background: BRAND_GRADIENT }}
                />

                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background: `${BRAND_GREEN}1F`,
                      border: `1px solid ${BRAND_GREEN}44`,
                    }}
                  >
                    <Shield size={22} style={{ color: BRAND_GREEN }} strokeWidth={2.25} />
                  </div>
                  <span
                    className="text-xs font-semibold uppercase tracking-[0.2em]"
                    style={{ color: BRAND_GREEN }}
                  >
                    Privacy & Data Ownership
                  </span>
                </div>

                <h2
                  className="text-white text-4xl md:text-5xl font-bold tracking-tight mb-6"
                  style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                >
                  Your Data Stays Yours
                </h2>

                <div className="space-y-5 text-slate-300 text-lg leading-relaxed mb-8 max-w-3xl">
                  <p>
                    ClientsDesk takes a different approach than traditional CRM platforms.
                  </p>
                  <p>
                    Your clients, notes, credentials, invoice reminders, and service
                    records are stored in a spreadsheet inside{" "}
                    <span className="text-white font-semibold">your own Google Drive</span>{" "}
                    — not on ClientsDesk servers and not inside a proprietary CRM database.
                  </p>
                  <p>
                    You own the spreadsheet. You own the data. You can open it, share it,
                    back it up, or export it at any time. If you ever stop using
                    ClientsDesk, your records stay right where they already are: in your
                    Drive.
                  </p>
                </div>

                <p className="text-sm font-semibold text-slate-200 mb-4 uppercase tracking-wider">
                  What this means for you:
                </p>
                <div className="grid sm:grid-cols-2 gap-3 mb-10">
                  {[
                    { icon: Database, label: "You own your CRM database" },
                    { icon: Lock, label: "Private by architecture, not just policy" },
                    { icon: Download, label: "Easy export — it's already a spreadsheet" },
                    { icon: Eye, label: "Transparent storage you can open in Drive" },
                    { icon: Shield, label: "No CRM vendor lock-in" },
                    { icon: Sheet, label: "Lives in Google Drive, not a black box" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.04] border border-white/10"
                    >
                      <item.icon size={18} style={{ color: BRAND_GREEN }} strokeWidth={2.25} />
                      <span className="text-white text-[15px] font-medium">{item.label}</span>
                    </div>
                  ))}
                </div>

                {/* Disclaimer */}
                <div className="rounded-xl px-5 py-4 bg-white/[0.03] border border-white/10">
                  <p className="text-xs text-slate-400 leading-relaxed">
                    <span className="font-semibold text-slate-300">Disclaimer:</span>{" "}
                    Authentication and account management services may be used to provide
                    secure access to the application, but customer business data remains
                    under user control.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===== WHO USES CLIENTSDESK ===== */}
        <section className="relative section border-t border-white/5">
          <div
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 0% 50%, ${BRAND_GREEN}26 0%, transparent 60%)`,
            }}
          />
          <div className="container relative">
            <div className="max-w-2xl mb-12">
              <div
                className="text-xs font-semibold uppercase tracking-[0.2em] mb-4"
                style={{ color: BRAND_GREEN }}
              >
                Who Uses ClientsDesk?
              </div>
              <h2
                className="text-white text-4xl md:text-5xl font-bold tracking-tight mb-5"
                style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
              >
                Built for anyone who manages clients.
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                ClientsDesk is designed for professionals who manage relationships and
                client information every day — across many industries:
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
              {[
                "Property Managers",
                "Realtors",
                "Contractors",
                "Consultants",
                "Service Businesses",
                "Insurance Professionals",
                "IT Professionals",
                "Small Business Owners",
                "Field Technicians",
              ].map((role, i) => (
                <motion.div
                  key={role}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  className="rounded-2xl px-5 py-4 bg-white/[0.03] border border-white/10 flex items-center gap-3"
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: BRAND_GRADIENT }}
                  />
                  <span className="text-white text-[15px] font-medium tracking-tight">
                    {role}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className="relative section border-t border-white/5">
          <div className="container">
            <div className="max-w-2xl mb-14">
              <div
                className="text-xs font-semibold uppercase tracking-[0.2em] mb-4"
                style={{ color: BRAND_GREEN }}
              >
                How It Works
              </div>
              <h2
                className="text-white text-4xl md:text-5xl font-bold tracking-tight mb-5"
                style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
              >
                Set up in minutes.
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Four steps from download to managing your first client.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
              {steps.map((step, i) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  className="relative rounded-2xl p-6 bg-white/[0.03] border border-white/10"
                >
                  <div
                    className="absolute -top-3 -left-3 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-white shadow-lg"
                    style={{ background: BRAND_GRADIENT }}
                  >
                    {i + 1}
                  </div>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 mt-2"
                    style={{
                      background: `${BRAND_BLUE}26`,
                      border: `1px solid ${BRAND_BLUE}44`,
                    }}
                  >
                    <step.icon size={20} style={{ color: BRAND_GREEN }} strokeWidth={2.25} />
                  </div>
                  <h3 className="text-white text-base font-semibold tracking-tight mb-2">
                    {step.title}
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== SCREENSHOTS ===== */}
        <section className="relative section border-t border-white/5 overflow-hidden">
          <div
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 100%, ${BRAND_GREEN}33 0%, transparent 60%)`,
            }}
          />
          <div className="container relative">
            <div className="max-w-2xl mb-14">
              <div
                className="text-xs font-semibold uppercase tracking-[0.2em] mb-4"
                style={{ color: BRAND_GREEN }}
              >
                Inside the App
              </div>
              <h2
                className="text-white text-4xl md:text-5xl font-bold tracking-tight mb-5"
                style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
              >
                A focused interface, designed to stay out of the way.
              </h2>
              <p className="text-slate-400 text-lg leading-relaxed">
                Polished screenshots will replace these placeholders as ClientsDesk
                approaches public release on the App Store.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-8 md:gap-10">
              {screenshots.map((s, i) => (
                <ScreenshotFrame
                  key={s.label}
                  label={s.label}
                  icon={s.icon}
                  delay={i * 0.06}
                />
              ))}
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section className="relative section border-t border-white/5">
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <div
                  className="text-xs font-semibold uppercase tracking-[0.2em] mb-4"
                  style={{ color: BRAND_GREEN }}
                >
                  Frequently Asked Questions
                </div>
                <h2
                  className="text-white text-4xl md:text-5xl font-bold tracking-tight"
                  style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
                >
                  Answers, before you ask.
                </h2>
              </div>

              <Accordion type="single" collapsible className="space-y-3">
                {faqs.map((item, i) => (
                  <AccordionItem
                    key={i}
                    value={`item-${i}`}
                    className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 [&[data-state=open]]:border-white/20"
                  >
                    <AccordionTrigger className="text-left text-white text-base md:text-lg font-semibold hover:no-underline py-5 [&[data-state=open]>svg]:rotate-180">
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-300 text-[15px] leading-relaxed pb-5">
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* ===== CONTACT ===== */}
        <section className="relative section border-t border-white/5 overflow-hidden">
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 50%, ${BRAND_BLUE}40 0%, transparent 65%)`,
            }}
          />
          <div className="container relative">
            <div className="max-w-2xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <ClientsDeskLogo size={72} />
              </div>
              <h2
                className="text-white text-4xl md:text-5xl font-bold tracking-tight mb-5"
                style={{ fontFamily: "'Space Grotesk', system-ui, sans-serif" }}
              >
                Questions About ClientsDesk?
              </h2>
              <p className="text-slate-300 text-lg leading-relaxed mb-8">
                ClientsDesk is being developed by MV App Studio as a privacy-focused
                client management platform for professionals and service businesses.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/start-project"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white shadow-lg"
                  style={{ background: BRAND_GRADIENT }}
                >
                  <Mail size={18} />
                  Contact MV App Studio
                </Link>
                <a
                  href="mailto:louis@mvappstudio.com"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white border border-white/15 bg-white/[0.04] hover:bg-white/[0.08] transition-colors"
                >
                  louis@mvappstudio.com
                </a>
              </div>

              {/* Legal links */}
              <div className="mt-12 pt-8 border-t border-white/10">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-500 mb-4">
                  ClientsDesk Legal
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-medium">
                  <Link
                    to="/services/mv-app-design/clientsdesk/privacy"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08] hover:border-white/25 transition-colors"
                  >
                    Privacy Policy
                    <ChevronRight size={14} />
                  </Link>
                  <Link
                    to="/services/mv-app-design/clientsdesk/terms"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08] hover:border-white/25 transition-colors"
                  >
                    Terms of Service
                    <ChevronRight size={14} />
                  </Link>
                  <Link
                    to="/services/mv-app-design"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg text-slate-300 hover:text-white transition-colors"
                  >
                    Island Built Apps
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </AppStudioLayout>
  );
}
