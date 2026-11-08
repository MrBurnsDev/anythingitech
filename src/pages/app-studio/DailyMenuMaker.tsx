import { AppStudioLayout } from "./AppStudioLayout";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  ChefHat,
  ListChecks,
  Printer,
  Share2,
  Smartphone,
  History,
  CloudUpload,
  Lock,
  Download,
  Eye,
  LogIn,
  FolderPlus,
  ClipboardList,
  Megaphone,
  ChevronRight,
  Mail,
  ArrowRight,
  Apple,
  Sun,
  Sheet,
  Database,
  Shield,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useDocumentMeta } from "@/lib/useDocumentMeta";

// =============================================================================
// BRAND (drawn from the Daily Menu Maker logo + screenshot)
// =============================================================================

const CREAM = "#F5EFE0";
const CREAM_LIGHT = "#FBF7EC";
const CREAM_DEEP = "#ECE2C9";
const ORANGE = "#D55A36";
const ORANGE_DARK = "#B8451F";
const SAGE = "#5B7A3E";
const SAGE_DARK = "#3F5A28";
const WOOD = "#B58A55";
const INK = "#2A2520";
const INK_SOFT = "#5C5347";

const BRAND_GRADIENT = `linear-gradient(135deg, ${ORANGE} 0%, ${SAGE} 100%)`;

// =============================================================================
// LOGO
// =============================================================================

function DMMLogo({ size = 56 }: { size?: number }) {
  return (
    <img
      src="/dailymenumaker-logo.png"
      alt="Daily Menu Maker logo"
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        filter: `drop-shadow(0 12px 28px ${ORANGE}33)`,
      }}
    />
  );
}

// =============================================================================
// HERO PHONE MOCKUP — uses real screenshot inside a phone frame
// =============================================================================

function HeroPhoneMock() {
  const prefersReducedMotion = useReducedMotion();

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
            background: "linear-gradient(145deg, #3a2f24 0%, #221a14 50%, #110d09 100%)",
            boxShadow:
              "0 50px 100px -20px rgba(70, 40, 20, 0.4), 0 30px 60px -30px rgba(70, 40, 20, 0.55)",
          }}
        >
          <div className="relative rounded-[2.5rem] overflow-hidden bg-white">
            <div className="relative aspect-[9/19.5] overflow-hidden">
              <img
                src="/dailymenumaker-screenshot.png"
                alt="Daily Menu Maker app showing Today's Menu with selectable products and a Generate Menu button"
                className="w-full h-full object-contain"
              />

              {/* Status bar overlay */}
              <div className="absolute top-0 left-0 right-0 z-30 bg-white">
                <div className="flex items-center justify-between px-6 py-2">
                  <span className="text-sm font-semibold text-black w-12">9:41</span>
                  <div className="w-28 h-8 bg-black rounded-full" />
                  <div className="flex items-center gap-1 w-12 justify-end">
                    <div className="flex items-end gap-[2px]">
                      <div className="w-[3px] h-[4px] bg-black rounded-sm" />
                      <div className="w-[3px] h-[6px] bg-black rounded-sm" />
                      <div className="w-[3px] h-[8px] bg-black rounded-sm" />
                      <div className="w-[3px] h-[10px] bg-black rounded-sm" />
                    </div>
                    <svg className="w-4 h-4 text-black ml-1" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 18c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0-6c3.03 0 5.78 1.23 7.76 3.22l-2.12 2.12C16.2 15.9 14.2 15 12 15s-4.2.9-5.64 2.34l-2.12-2.12C6.22 13.23 8.97 12 12 12zm0-6c4.42 0 8.44 1.79 11.34 4.69l-2.12 2.12C18.78 10.37 15.53 9 12 9s-6.78 1.37-9.22 3.81L.66 10.69C3.56 7.79 7.58 6 12 6z" />
                    </svg>
                    <div className="flex items-center ml-1">
                      <div className="w-6 h-3 rounded-sm border border-black p-[1px]">
                        <div className="w-full h-full bg-black rounded-[1px]" />
                      </div>
                      <div className="w-[2px] h-[5px] bg-black rounded-r-sm -ml-[1px]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/20 rounded-full" />
          </div>
        </div>

        {/* Warm orange glow */}
        <div
          className="absolute -inset-10 -z-10 rounded-full opacity-40 blur-3xl"
          style={{
            background: `radial-gradient(circle, ${ORANGE}80 0%, transparent 70%)`,
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
  icon: typeof ListChecks;
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
      className="group relative rounded-2xl p-7 bg-white border transition-all overflow-hidden"
      style={{
        borderColor: `${WOOD}33`,
        boxShadow: `0 1px 3px ${INK}0F, 0 8px 24px ${INK}0A`,
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: BRAND_GRADIENT }}
      />
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
        style={{
          background: `linear-gradient(135deg, ${ORANGE}1F 0%, ${SAGE}1A 100%)`,
          border: `1px solid ${ORANGE}33`,
        }}
      >
        <Icon size={22} style={{ color: ORANGE }} strokeWidth={2} />
      </div>
      <h3
        className="text-lg font-semibold mb-2 tracking-tight"
        style={{ color: INK }}
      >
        {title}
      </h3>
      <p className="text-[15px] leading-relaxed" style={{ color: INK_SOFT }}>
        {description}
      </p>
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
          background: "linear-gradient(145deg, #3a2f24 0%, #221a14 50%, #110d09 100%)",
          boxShadow: `0 30px 60px -20px ${INK}55`,
        }}
      >
        <div
          className="relative rounded-[1.85rem] overflow-hidden aspect-[9/19.5] flex items-center justify-center"
          style={{
            background: `linear-gradient(160deg, ${CREAM_LIGHT} 0%, ${CREAM} 55%, ${CREAM_DEEP} 100%)`,
          }}
        >
          <div
            className="absolute inset-0 opacity-40"
            style={{
              background: `radial-gradient(circle at 50% 35%, ${ORANGE}26 0%, transparent 60%)`,
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
            <span className="text-sm font-semibold tracking-tight" style={{ color: INK }}>
              {label}
            </span>
            <span className="mt-1 text-[11px]" style={{ color: INK_SOFT }}>
              Preview coming soon
            </span>
          </div>
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-20 h-1 bg-black/20 rounded-full" />
        </div>
      </div>
      <span
        className="mt-4 text-xs font-medium uppercase tracking-wider"
        style={{ color: INK_SOFT }}
      >
        {label}
      </span>
    </motion.div>
  );
}

// =============================================================================
// CONTENT
// =============================================================================

const features = [
  {
    icon: ListChecks,
    title: "One-Tap Daily Menus",
    description:
      "Keep a master list of products with descriptions and prices, then check off what you have today and generate a clean menu in seconds.",
  },
  {
    icon: Printer,
    title: "Polished, Printable Output",
    description:
      "Generated menus look good enough for a storefront — ready to print, hand out, or post on a chalkboard photo.",
  },
  {
    icon: Share2,
    title: "Shareable In a Tap",
    description:
      "Send today's menu to a partner, a chef, a wholesale buyer, or your followers — no design tools required.",
  },
  {
    icon: Sheet,
    title: "Google Drive-Powered",
    description:
      "Your vendor profile, products, and saved menus live in your own Google Drive — fully owned, portable, and easy to export.",
  },
  {
    icon: History,
    title: "Daily Menu History",
    description:
      "Every menu you generate is saved automatically, so you can look back at what you sold on any given Saturday.",
  },
  {
    icon: Smartphone,
    title: "Built for the Morning Rush",
    description:
      "Designed to be fast on a small screen with cold hands at 6 a.m. — large taps, clear text, no clutter.",
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
    title: "Create Your Vendor Workspace",
    description:
      "Daily Menu Maker creates a dedicated folder and spreadsheet inside your Google Drive that holds your products, vendor profile, and saved menus.",
  },
  {
    icon: ClipboardList,
    title: "Add your products once",
    description:
      "Enter your full lineup — names, descriptions, categories, and prices. Reuse them from one market day to the next.",
  },
  {
    icon: Megaphone,
    title: "Generate today's menu",
    description:
      "Check off what you're bringing today, tap Generate Menu, and you're ready to print, share, or post in seconds.",
  },
];

const screenshots = [
  { label: "Today's Menu", icon: Sun },
  { label: "Product List", icon: ClipboardList },
  { label: "Generated Menu", icon: Megaphone },
  { label: "Daily History", icon: History },
  { label: "Settings", icon: ChefHat },
];

const faqs = [
  {
    q: "Who is Daily Menu Maker for?",
    a: "Daily Menu Maker is built for small vendors and producers whose offerings change day to day: farmers market sellers, bakeries, coffee shops, food trucks, chocolatiers, jam makers, soap makers, prepared-food sellers, and small storefronts. If you've ever rewritten the same chalkboard for the tenth Saturday in a row, it was designed with your workflow in mind.",
  },
  {
    q: "Where is my data stored?",
    a: "Your vendor profile, products, and generated menus are stored in a Google Sheets spreadsheet inside your own Google Drive. Daily Menu Maker reads and writes to that spreadsheet on your behalf, but the file lives in your account. We do not maintain a separate database of your business data on our servers.",
  },
  {
    q: "Does Daily Menu Maker work offline?",
    a: "Yes. Daily Menu Maker caches your products and recent menus on-device so you can build today's menu in a parking lot, in a tent without Wi-Fi, or anywhere connectivity is unreliable. Changes you make while offline sync back to your Google Drive the next time you connect.",
  },
  {
    q: "Can I export my data?",
    a: "Always. Because your data lives in a standard Google Sheet, you already have it. You can download it as a .xlsx or .csv file, share it, archive it, or move it to another tool at any time — without contacting us, and without giving up access if you ever stop using the app.",
  },
  {
    q: "What does the generated menu look like?",
    a: "Generated menus are clean, single-page layouts showing your vendor name, today's date, and your selected products grouped by category with prices and short descriptions. They're designed to look polished printed on plain paper, photographed for social media, or sent straight to a customer.",
  },
  {
    q: "Is there an Android version?",
    a: "Daily Menu Maker is launching first on iPhone. An Android version is being evaluated based on user demand. If you're interested in Android support, reach out to MV App Studio and let us know — early signal helps us prioritize.",
  },
  {
    q: "Will there be subscription plans?",
    a: "Pricing is still being finalized. The intent is to keep Daily Menu Maker affordable and straightforward for independent vendors and small producers, with pricing details published before public release. Contact us about early access to learn more.",
  },
];

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function DailyMenuMaker() {
  useDocumentMeta({
    title:
      "Daily Menu Maker | One-Tap Daily Menus for Farmers Market Vendors | MV App Studio",
    description:
      "Daily Menu Maker helps farmers market vendors, bakeries, food trucks, and small producers build, print, and share today's menu in seconds — with all data stored in your own Google Drive.",
    canonical: "https://anythingitechmv.com/services/mv-app-design/dailymenumaker",
    keywords: [
      "daily menu app",
      "farmers market app",
      "menu generator",
      "vendor menu app",
      "bakery menu app",
      "food truck menu app",
      "printable menu maker",
      "Google Drive menu app",
      "menu maker iPhone",
    ],
  });

  return (
    <AppStudioLayout>
      <div style={{ background: CREAM_LIGHT, color: INK }}>
        {/* ===== HERO ===== */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${CREAM_LIGHT} 0%, ${CREAM} 60%, ${CREAM_DEEP} 100%)`,
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.05]"
            style={{
              backgroundImage:
                `linear-gradient(${INK}22 1px, transparent 1px), linear-gradient(90deg, ${INK}22 1px, transparent 1px)`,
              backgroundSize: "56px 56px",
            }}
          />
          <div
            className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full blur-[120px] opacity-30"
            style={{ background: ORANGE }}
          />
          <div
            className="absolute top-40 -right-40 w-[460px] h-[460px] rounded-full blur-[120px] opacity-25"
            style={{ background: SAGE }}
          />

          <div className="container relative section">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              {/* Left content */}
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                {/* Logo + name */}
                <div className="flex items-center gap-4 mb-8">
                  <DMMLogo size={64} />
                  <div>
                    <div
                      className="text-xl font-bold tracking-tight"
                      style={{
                        color: INK,
                        fontFamily: "'Space Grotesk', system-ui, sans-serif",
                      }}
                    >
                      Daily Menu Maker
                    </div>
                    <div className="text-xs" style={{ color: INK_SOFT }}>
                      An MV App Studio product
                    </div>
                  </div>
                </div>

                {/* Eyebrow */}
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border"
                  style={{
                    color: ORANGE_DARK,
                    background: `${ORANGE}1A`,
                    borderColor: `${ORANGE}40`,
                  }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: ORANGE }}
                  />
                  Built for Vendors Who Change the Menu Daily
                </div>

                {/* Headline */}
                <h1
                  className="font-bold tracking-tight mb-6"
                  style={{
                    color: INK,
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    fontSize: "clamp(2.5rem, 5.5vw + 0.5rem, 4rem)",
                    lineHeight: 1.05,
                    letterSpacing: "-0.035em",
                  }}
                >
                  Today's Menu,{" "}
                  <span
                    style={{
                      background: BRAND_GRADIENT,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    In a Few Taps
                  </span>
                </h1>

                {/* Subheadline */}
                <p
                  className="text-lg leading-relaxed mb-8 max-w-xl"
                  style={{ color: INK_SOFT }}
                >
                  Daily Menu Maker helps farmers market vendors, bakers, food trucks,
                  and small producers build, print, and share today's menu in seconds —
                  with all your data stored in your own Google Drive.
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
                    to="/contact"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-colors border"
                    style={{
                      color: INK,
                      borderColor: `${WOOD}66`,
                      background: "white",
                    }}
                  >
                    Contact for Early Access
                    <ArrowRight size={16} />
                  </Link>
                </div>

                {/* Supporting copy */}
                <p
                  className="text-sm max-w-xl leading-relaxed border-l-2 pl-4"
                  style={{ borderColor: SAGE, color: INK_SOFT }}
                >
                  Your products, vendor profile, and saved menus live in a spreadsheet
                  inside your own Google Drive — not on Daily Menu Maker servers. You
                  own the data and can take it with you at any time.
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
        <section
          className="relative section border-t"
          style={{ borderColor: `${WOOD}33`, background: CREAM }}
        >
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none"
            style={{
              backgroundImage:
                `linear-gradient(${INK}22 1px, transparent 1px), linear-gradient(90deg, ${INK}22 1px, transparent 1px)`,
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
                style={{ color: ORANGE_DARK }}
              >
                Features
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.05 }}
                className="text-4xl md:text-5xl font-bold tracking-tight mb-5"
                style={{
                  color: INK,
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                }}
              >
                Everything You Need For Today's Menu
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-lg leading-relaxed"
                style={{ color: INK_SOFT }}
              >
                Daily Menu Maker focuses on the small, daily decision that takes too
                long with chalk and paper — and turns it into a few taps.
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
        <section
          className="relative section border-t"
          style={{ borderColor: `${WOOD}33`, background: CREAM_LIGHT }}
        >
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${ORANGE}22 0%, transparent 60%)`,
            }}
          />
          <div className="container relative">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="rounded-3xl p-8 md:p-14 border relative overflow-hidden bg-white"
                style={{
                  borderColor: `${WOOD}33`,
                  boxShadow: `0 12px 40px ${INK}14`,
                }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-[3px]"
                  style={{ background: BRAND_GRADIENT }}
                />

                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      background: `${SAGE}1F`,
                      border: `1px solid ${SAGE}55`,
                    }}
                  >
                    <Shield size={22} style={{ color: SAGE }} strokeWidth={2.25} />
                  </div>
                  <span
                    className="text-xs font-semibold uppercase tracking-[0.2em]"
                    style={{ color: SAGE_DARK }}
                  >
                    Privacy & Data Ownership
                  </span>
                </div>

                <h2
                  className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
                  style={{
                    color: INK,
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  }}
                >
                  Your Menus Stay Yours
                </h2>

                <div
                  className="space-y-5 text-lg leading-relaxed mb-8 max-w-3xl"
                  style={{ color: INK_SOFT }}
                >
                  <p>
                    Daily Menu Maker takes a different approach than traditional
                    vendor and small-business SaaS tools.
                  </p>
                  <p>
                    Your vendor profile, product list, and every menu you generate are
                    stored in a spreadsheet inside{" "}
                    <span className="font-semibold" style={{ color: INK }}>
                      your own Google Drive
                    </span>{" "}
                    — not on Daily Menu Maker servers and not inside a proprietary
                    database.
                  </p>
                  <p>
                    You own the spreadsheet. You own the data. You can open it, share
                    it, back it up, or export it at any time. If you ever stop using
                    Daily Menu Maker, your products and history stay right where they
                    already are: in your Drive.
                  </p>
                </div>

                <p
                  className="text-sm font-semibold mb-4 uppercase tracking-wider"
                  style={{ color: INK }}
                >
                  What this means for you:
                </p>
                <div className="grid sm:grid-cols-2 gap-3 mb-10">
                  {[
                    { icon: Database, label: "You own your menu database" },
                    { icon: Lock, label: "Private by architecture, not just policy" },
                    { icon: Download, label: "Easy export — it's already a spreadsheet" },
                    { icon: Eye, label: "Transparent storage you can open in Drive" },
                    { icon: Shield, label: "No vendor lock-in" },
                    { icon: CloudUpload, label: "Lives in Google Drive, not a black box" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                      style={{
                        background: CREAM_LIGHT,
                        borderColor: `${WOOD}33`,
                      }}
                    >
                      <item.icon
                        size={18}
                        style={{ color: SAGE_DARK }}
                        strokeWidth={2.25}
                      />
                      <span
                        className="text-[15px] font-medium"
                        style={{ color: INK }}
                      >
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div
                  className="rounded-xl px-5 py-4 border"
                  style={{
                    background: CREAM,
                    borderColor: `${WOOD}33`,
                  }}
                >
                  <p
                    className="text-xs leading-relaxed"
                    style={{ color: INK_SOFT }}
                  >
                    <span className="font-semibold" style={{ color: INK }}>
                      Disclaimer:
                    </span>{" "}
                    Authentication and account management services may be used to
                    provide secure access to the application, but customer business
                    data remains under user control.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===== WHO USES DAILY MENU MAKER ===== */}
        <section
          className="relative section border-t"
          style={{ borderColor: `${WOOD}33`, background: CREAM }}
        >
          <div
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 0% 50%, ${SAGE}22 0%, transparent 60%)`,
            }}
          />
          <div className="container relative">
            <div className="max-w-2xl mb-12">
              <div
                className="text-xs font-semibold uppercase tracking-[0.2em] mb-4"
                style={{ color: ORANGE_DARK }}
              >
                Who Uses Daily Menu Maker?
              </div>
              <h2
                className="text-4xl md:text-5xl font-bold tracking-tight mb-5"
                style={{
                  color: INK,
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                }}
              >
                Built for vendors with a rotating lineup.
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: INK_SOFT }}>
                Daily Menu Maker is designed for small businesses whose offerings change
                every day, every market, or every weekend:
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3">
              {[
                "Farmers Market Vendors",
                "Bakeries",
                "Coffee Shops",
                "Food Trucks",
                "Chocolatiers",
                "Jam & Preserve Makers",
                "Soap & Skincare Makers",
                "Prepared Food Sellers",
                "Small Storefronts",
              ].map((role, i) => (
                <motion.div
                  key={role}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  className="rounded-2xl px-5 py-4 border flex items-center gap-3 bg-white"
                  style={{ borderColor: `${WOOD}33` }}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: BRAND_GRADIENT }}
                  />
                  <span
                    className="text-[15px] font-medium tracking-tight"
                    style={{ color: INK }}
                  >
                    {role}
                  </span>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section
          className="relative section border-t"
          style={{ borderColor: `${WOOD}33`, background: CREAM_LIGHT }}
        >
          <div className="container">
            <div className="max-w-2xl mb-14">
              <div
                className="text-xs font-semibold uppercase tracking-[0.2em] mb-4"
                style={{ color: ORANGE_DARK }}
              >
                How It Works
              </div>
              <h2
                className="text-4xl md:text-5xl font-bold tracking-tight mb-5"
                style={{
                  color: INK,
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                }}
              >
                Set up once. Generate menus every day.
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: INK_SOFT }}>
                Four steps from download to today's menu.
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
                  className="relative rounded-2xl p-6 border bg-white"
                  style={{ borderColor: `${WOOD}33` }}
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
                      background: `${ORANGE}1F`,
                      border: `1px solid ${ORANGE}44`,
                    }}
                  >
                    <step.icon
                      size={20}
                      style={{ color: ORANGE }}
                      strokeWidth={2.25}
                    />
                  </div>
                  <h3
                    className="text-base font-semibold tracking-tight mb-2"
                    style={{ color: INK }}
                  >
                    {step.title}
                  </h3>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: INK_SOFT }}
                  >
                    {step.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== SCREENSHOTS ===== */}
        <section
          className="relative section border-t overflow-hidden"
          style={{ borderColor: `${WOOD}33`, background: CREAM }}
        >
          <div
            className="absolute inset-0 opacity-25 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 100%, ${SAGE}22 0%, transparent 60%)`,
            }}
          />
          <div className="container relative">
            <div className="max-w-2xl mb-14">
              <div
                className="text-xs font-semibold uppercase tracking-[0.2em] mb-4"
                style={{ color: ORANGE_DARK }}
              >
                Inside the App
              </div>
              <h2
                className="text-4xl md:text-5xl font-bold tracking-tight mb-5"
                style={{
                  color: INK,
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                }}
              >
                A focused interface, designed to stay out of the way.
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: INK_SOFT }}>
                Polished screenshots will replace these placeholders as Daily Menu Maker
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
        <section
          className="relative section border-t"
          style={{ borderColor: `${WOOD}33`, background: CREAM_LIGHT }}
        >
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <div
                  className="text-xs font-semibold uppercase tracking-[0.2em] mb-4"
                  style={{ color: ORANGE_DARK }}
                >
                  Frequently Asked Questions
                </div>
                <h2
                  className="text-4xl md:text-5xl font-bold tracking-tight"
                  style={{
                    color: INK,
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  }}
                >
                  Answers, before you ask.
                </h2>
              </div>

              <Accordion type="single" collapsible className="space-y-3">
                {faqs.map((item, i) => (
                  <AccordionItem
                    key={i}
                    value={`item-${i}`}
                    className="rounded-2xl border px-6 bg-white"
                    style={{ borderColor: `${WOOD}33` }}
                  >
                    <AccordionTrigger
                      className="text-left text-base md:text-lg font-semibold hover:no-underline py-5 [&[data-state=open]>svg]:rotate-180"
                      style={{ color: INK }}
                    >
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent
                      className="text-[15px] leading-relaxed pb-5"
                      style={{ color: INK_SOFT }}
                    >
                      {item.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </div>
        </section>

        {/* ===== CONTACT ===== */}
        <section
          className="relative section border-t overflow-hidden"
          style={{ borderColor: `${WOOD}33`, background: CREAM }}
        >
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 50%, ${ORANGE}26 0%, transparent 65%)`,
            }}
          />
          <div className="container relative">
            <div className="max-w-2xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <DMMLogo size={84} />
              </div>
              <h2
                className="text-4xl md:text-5xl font-bold tracking-tight mb-5"
                style={{
                  color: INK,
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                }}
              >
                Questions About Daily Menu Maker?
              </h2>
              <p
                className="text-lg leading-relaxed mb-8"
                style={{ color: INK_SOFT }}
              >
                Daily Menu Maker is being developed by MV App Studio as a privacy-focused
                menu and product management platform for vendors and small producers.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-white shadow-lg"
                  style={{ background: BRAND_GRADIENT }}
                >
                  <Mail size={18} />
                  Contact MV App Studio
                </Link>
                <a
                  href="mailto:louis@mvappstudio.com"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-colors border bg-white"
                  style={{ color: INK, borderColor: `${WOOD}66` }}
                >
                  louis@mvappstudio.com
                </a>
              </div>

              {/* Legal links */}
              <div
                className="mt-12 pt-8 border-t"
                style={{ borderColor: `${WOOD}33` }}
              >
                <p
                  className="text-xs uppercase tracking-[0.2em] mb-4"
                  style={{ color: INK_SOFT }}
                >
                  Daily Menu Maker Legal
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-medium">
                  <Link
                    to="/services/mv-app-design/dailymenumaker/privacy"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border bg-white transition-colors"
                    style={{ color: INK, borderColor: `${WOOD}66` }}
                  >
                    Privacy Policy
                    <ChevronRight size={14} />
                  </Link>
                  <Link
                    to="/services/mv-app-design/dailymenumaker/terms"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border bg-white transition-colors"
                    style={{ color: INK, borderColor: `${WOOD}66` }}
                  >
                    Terms of Service
                    <ChevronRight size={14} />
                  </Link>
                  <Link
                    to="/services/mv-app-design"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg transition-colors"
                    style={{ color: INK_SOFT }}
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
