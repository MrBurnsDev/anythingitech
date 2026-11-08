import { AppStudioLayout } from "./AppStudioLayout";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import {
  Shield,
  ShieldCheck,
  Lock,
  KeyRound,
  Globe,
  Server,
  Radar,
  ScanSearch,
  Network,
  EyeOff,
  Fingerprint,
  Cpu,
  ChevronRight,
  Mail,
  ArrowRight,
  Monitor,
  Wifi,
  ShieldAlert,
  Activity,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useDocumentMeta } from "@/lib/useDocumentMeta";

// =============================================================================
// BRAND — drawn from the Node Guardian app theme (NodeTheme.swift)
// =============================================================================

const PINK = "#FFBDFF";
const GOLD = "#FAB000";
const CREAM = "#FBE9E1";
const PURPLE = "#9B4DCA";

const BG = "#000000";
const BG_2 = "#0A0A0A";
const BG_3 = "#141414";
const BG_ELEVATED = "#1A1A1A";

const TEXT = "#FBE9E1";
const TEXT_SOFT = "#A8938B";
const TEXT_DIM = "#8A8078";

const SUCCESS = "#4ADE80";

const BRAND_GRADIENT = `linear-gradient(135deg, ${PINK} 0%, ${GOLD} 100%)`;

// =============================================================================
// LOGO
// =============================================================================

function NodeGuardianLogo({ size = 56 }: { size?: number }) {
  return (
    <img
      src="/nodeguardian-logo.png"
      alt="Node Guardian logo"
      width={size}
      height={size}
      style={{
        width: size,
        height: size,
        objectFit: "contain",
        filter: `drop-shadow(0 12px 28px ${PINK}44)`,
      }}
    />
  );
}

// =============================================================================
// HERO — macOS window mockup (desktop app, not iPhone)
// =============================================================================

function HeroWindowMock() {
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
          className="relative w-[340px] md:w-[440px] rounded-2xl overflow-hidden border"
          style={{
            background: BG_2,
            borderColor: `${PINK}22`,
            boxShadow:
              "0 50px 100px -20px rgba(0,0,0,0.7), 0 30px 60px -30px rgba(155,77,202,0.35)",
          }}
        >
          {/* macOS title bar */}
          <div
            className="flex items-center gap-2 px-4 py-3 border-b"
            style={{ background: BG_3, borderColor: `${PINK}14` }}
          >
            <span className="w-3 h-3 rounded-full" style={{ background: "#FF5F57" }} />
            <span className="w-3 h-3 rounded-full" style={{ background: "#FEBC2E" }} />
            <span className="w-3 h-3 rounded-full" style={{ background: "#28C840" }} />
            <span
              className="ml-3 text-xs font-medium tracking-tight"
              style={{ color: TEXT_DIM }}
            >
              Node Guardian
            </span>
          </div>

          {/* Window body — no screenshot asset exists for Node Guardian (it was
              absent in the source repo too), so the styled placeholder is shown
              directly. Removing the <img> avoids a 404/console error while
              keeping the exact visual. */}
          <div className="relative aspect-[16/11]">
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-4"
              style={{
                background: `radial-gradient(ellipse at 50% 30%, ${PURPLE}33 0%, ${BG_2} 70%)`,
              }}
            >
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center"
                style={{ background: BRAND_GRADIENT }}
              >
                <ShieldCheck size={30} className="text-black" strokeWidth={2.25} />
              </div>
              <div className="text-center">
                <div
                  className="text-sm font-semibold tracking-tight"
                  style={{ color: TEXT }}
                >
                  Protected
                </div>
                <div className="text-[11px] mt-0.5" style={{ color: TEXT_DIM }}>
                  Preview coming soon
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pink / gold glow */}
        <div
          className="absolute -inset-12 -z-10 rounded-full opacity-40 blur-3xl"
          style={{
            background: `radial-gradient(circle, ${PINK}66 0%, ${GOLD}22 40%, transparent 70%)`,
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
      className="group relative rounded-2xl p-7 border transition-all overflow-hidden"
      style={{
        background: BG_2,
        borderColor: `${PINK}1A`,
        boxShadow: `0 1px 3px #00000055, 0 8px 24px #00000033`,
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
        style={{ background: BRAND_GRADIENT }}
      />
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-5"
        style={{
          background: `linear-gradient(135deg, ${PINK}1F 0%, ${GOLD}14 100%)`,
          border: `1px solid ${PINK}33`,
        }}
      >
        <Icon size={22} style={{ color: PINK }} strokeWidth={2} />
      </div>
      <h3 className="text-lg font-semibold mb-2 tracking-tight" style={{ color: TEXT }}>
        {title}
      </h3>
      <p className="text-[15px] leading-relaxed" style={{ color: TEXT_SOFT }}>
        {description}
      </p>
    </motion.div>
  );
}

// =============================================================================
// SCREENSHOT FRAME (placeholder — macOS window shaped)
// =============================================================================

interface ScreenshotFrameProps {
  label: string;
  icon: typeof Shield;
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
        className="relative w-[260px] rounded-xl overflow-hidden border"
        style={{
          background: BG_2,
          borderColor: `${PINK}22`,
          boxShadow: `0 30px 60px -20px #000000aa`,
        }}
      >
        <div
          className="flex items-center gap-1.5 px-3 py-2 border-b"
          style={{ background: BG_3, borderColor: `${PINK}14` }}
        >
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#FF5F57" }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#FEBC2E" }} />
          <span className="w-2.5 h-2.5 rounded-full" style={{ background: "#28C840" }} />
        </div>
        <div
          className="relative aspect-[16/11] flex items-center justify-center"
          style={{
            background: `radial-gradient(ellipse at 50% 35%, ${PURPLE}2A 0%, ${BG_2} 65%)`,
          }}
        >
          <div className="flex flex-col items-center text-center px-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: BRAND_GRADIENT }}
            >
              <Icon size={26} className="text-black" strokeWidth={2.25} />
            </div>
            <span className="text-sm font-semibold tracking-tight" style={{ color: TEXT }}>
              {label}
            </span>
            <span className="mt-1 text-[11px]" style={{ color: TEXT_DIM }}>
              Preview coming soon
            </span>
          </div>
        </div>
      </div>
      <span
        className="mt-4 text-xs font-medium uppercase tracking-wider"
        style={{ color: TEXT_DIM }}
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
    icon: Globe,
    title: "Built-In WireGuard VPN",
    description:
      "A fast, modern WireGuard tunnel routes your traffic through an encrypted connection — with a real kill switch that blocks traffic if the tunnel ever drops, so you never leak.",
  },
  {
    icon: KeyRound,
    title: "Per-Device Encryption Keys",
    description:
      "Every install generates its own unique key that never leaves your Mac's Keychain. Your identity on the network is yours alone — no shared credentials.",
  },
  {
    icon: EyeOff,
    title: "DNS Leak Protection",
    description:
      "All DNS queries are forced through the encrypted tunnel, so your browsing lookups can't leak to your ISP or a snooping network.",
  },
  {
    icon: ScanSearch,
    title: "Threat & Malware Scanning",
    description:
      "Scan your Mac for malicious files and known threats, with clear remediation and a quarantine center to isolate anything suspicious.",
  },
  {
    icon: Radar,
    title: "Real-Time Protection",
    description:
      "Continuous monitoring watches the file system, network, and remote-control surfaces for suspicious activity and flags it as it happens.",
  },
  {
    icon: Cpu,
    title: "Total Protection Toolkit",
    description:
      "Beyond the VPN: app uninstaller, privacy cleanup, port-forwarding visibility, and a security score that shows exactly where you stand.",
  },
];

const steps = [
  {
    icon: Monitor,
    title: "Install on your Mac",
    description:
      "Download Node Guardian, grant the permissions it needs, and the first-run wizard walks you through getting protected in minutes.",
  },
  {
    icon: Fingerprint,
    title: "Your device gets its own key",
    description:
      "On first use, Node Guardian generates a unique encryption key stored securely in your Mac's Keychain — no accounts, no shared secrets.",
  },
  {
    icon: Wifi,
    title: "Connect the VPN",
    description:
      "One click brings up the WireGuard tunnel. The kill switch and DNS leak protection engage automatically so your traffic stays private.",
  },
  {
    icon: Activity,
    title: "Stay monitored",
    description:
      "Real-time protection keeps watching in the background, and your security score tells you at a glance how protected you are.",
  },
];

const screenshots = [
  { label: "Dashboard", icon: ShieldCheck },
  { label: "VPN", icon: Globe },
  { label: "Threat Scan", icon: ScanSearch },
  { label: "Security Score", icon: Activity },
  { label: "Settings", icon: Lock },
];

const faqs = [
  {
    q: "What is Node Guardian?",
    a: "Node Guardian is an all-in-one macOS security app that combines a built-in WireGuard VPN with real-time threat protection and a suite of privacy and system tools. It's designed to keep your Mac's traffic encrypted and your system clean, without needing to stitch together several separate apps.",
  },
  {
    q: "How does the VPN protect me?",
    a: "Node Guardian uses the WireGuard protocol to route your traffic through an encrypted tunnel. It includes a real kill switch enforced at the operating-system level — if the tunnel ever drops, your traffic is blocked rather than leaking onto the open network. DNS queries are also forced through the tunnel to prevent DNS leaks.",
  },
  {
    q: "Are my encryption keys shared with anyone?",
    a: "No. Each install of Node Guardian generates its own unique WireGuard keypair the first time it's used. The private key is stored in your Mac's Keychain and never leaves your device. Only your public key is registered so the VPN server can accept your connection — the part that identifies you on the network is yours alone.",
  },
  {
    q: "Does Node Guardian run on Windows or iPhone?",
    a: "Node Guardian is built for macOS. It uses macOS system extensions and native security frameworks to provide protection that's tightly integrated with the operating system. Support for other platforms is being evaluated based on demand — reach out to MV App Studio if you'd like to see it.",
  },
  {
    q: "Will it slow down my Mac?",
    a: "Node Guardian is built to be lightweight. The VPN uses WireGuard, which is known for being fast and efficient, and real-time protection is designed to run quietly in the background. The included performance tools can also help you keep your Mac running smoothly.",
  },
  {
    q: "How much does Node Guardian cost?",
    a: "Pricing is still being finalized ahead of public release. The goal is to keep Node Guardian straightforward and fairly priced for everyday Mac users who want strong protection without complexity. Contact MV App Studio about early access to learn more.",
  },
];

// =============================================================================
// MAIN PAGE
// =============================================================================

export default function NodeGuardian() {
  useDocumentMeta({
    title:
      "Node Guardian | All-in-One macOS Security & VPN | MV App Studio",
    description:
      "Node Guardian is an all-in-one macOS security app — a built-in WireGuard VPN with a real kill switch, per-device encryption keys, DNS leak protection, and real-time threat scanning.",
    canonical: "https://anythingitechmv.com/services/mv-app-design/nodeguardian",
    keywords: [
      "mac vpn app",
      "macOS security app",
      "wireguard vpn mac",
      "mac antivirus",
      "mac malware protection",
      "vpn kill switch",
      "dns leak protection",
      "mac privacy app",
      "Node Guardian",
    ],
  });

  return (
    <AppStudioLayout>
      <div style={{ background: BG, color: TEXT }}>
        {/* ===== HERO ===== */}
        <section className="relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${BG} 0%, ${BG_2} 60%, ${BG} 100%)`,
            }}
          />
          <div
            className="absolute inset-0 opacity-[0.06]"
            style={{
              backgroundImage:
                `linear-gradient(${PINK}22 1px, transparent 1px), linear-gradient(90deg, ${PINK}22 1px, transparent 1px)`,
              backgroundSize: "56px 56px",
            }}
          />
          <div
            className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full blur-[120px] opacity-25"
            style={{ background: PINK }}
          />
          <div
            className="absolute top-40 -right-40 w-[460px] h-[460px] rounded-full blur-[120px] opacity-20"
            style={{ background: PURPLE }}
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
                  <NodeGuardianLogo size={64} />
                  <div>
                    <div
                      className="text-xl font-bold tracking-tight"
                      style={{
                        color: TEXT,
                        fontFamily: "'Space Grotesk', system-ui, sans-serif",
                      }}
                    >
                      Node Guardian
                    </div>
                    <div className="text-xs" style={{ color: TEXT_DIM }}>
                      An MV App Studio product
                    </div>
                  </div>
                </div>

                {/* Eyebrow */}
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6 border"
                  style={{
                    color: GOLD,
                    background: `${GOLD}14`,
                    borderColor: `${GOLD}40`,
                  }}
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD }} />
                  All-in-One Security for Your Mac
                </div>

                {/* Headline */}
                <h1
                  className="font-bold tracking-tight mb-6"
                  style={{
                    color: TEXT,
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                    fontSize: "clamp(2.5rem, 5.5vw + 0.5rem, 4rem)",
                    lineHeight: 1.05,
                    letterSpacing: "-0.035em",
                  }}
                >
                  Your Mac,{" "}
                  <span
                    style={{
                      background: BRAND_GRADIENT,
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                      backgroundClip: "text",
                    }}
                  >
                    Fully Guarded
                  </span>
                </h1>

                {/* Subheadline */}
                <p
                  className="text-lg leading-relaxed mb-8 max-w-xl"
                  style={{ color: TEXT_SOFT }}
                >
                  Node Guardian pairs a built-in WireGuard VPN — with a real kill switch
                  and per-device encryption keys — with real-time threat scanning and a
                  full privacy toolkit, all in one native macOS app.
                </p>

                {/* CTAs */}
                <div className="flex flex-col sm:flex-row gap-3 mb-8">
                  <button
                    type="button"
                    disabled
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-black shadow-lg cursor-default"
                    style={{ background: BRAND_GRADIENT }}
                  >
                    <Monitor size={18} />
                    Coming Soon on macOS
                  </button>
                  <Link
                    to="/start-project"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-colors border"
                    style={{
                      color: TEXT,
                      borderColor: `${PINK}44`,
                      background: BG_ELEVATED,
                    }}
                  >
                    Contact for Early Access
                    <ArrowRight size={16} />
                  </Link>
                </div>

                {/* Supporting copy */}
                <p
                  className="text-sm max-w-xl leading-relaxed border-l-2 pl-4"
                  style={{ borderColor: PINK, color: TEXT_SOFT }}
                >
                  Your VPN encryption key is generated on your Mac and stored in the
                  Keychain — it never leaves your device and isn't shared with anyone.
                </p>
              </motion.div>

              {/* Right window mock */}
              <div className="flex justify-center lg:justify-end">
                <HeroWindowMock />
              </div>
            </div>
          </div>
        </section>

        {/* ===== FEATURES ===== */}
        <section
          className="relative section border-t"
          style={{ borderColor: `${PINK}1A`, background: BG_2 }}
        >
          <div
            className="absolute inset-0 opacity-[0.05] pointer-events-none"
            style={{
              backgroundImage:
                `linear-gradient(${PINK}22 1px, transparent 1px), linear-gradient(90deg, ${PINK}22 1px, transparent 1px)`,
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
                style={{ color: GOLD }}
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
                  color: TEXT,
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                }}
              >
                Protection, Privacy, and Peace of Mind
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="text-lg leading-relaxed"
                style={{ color: TEXT_SOFT }}
              >
                Node Guardian brings together the security tools you'd normally juggle
                across several apps — into one focused, native experience for macOS.
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

        {/* ===== PRIVACY / SECURITY ARCHITECTURE ===== */}
        <section
          className="relative section border-t"
          style={{ borderColor: `${PINK}1A`, background: BG }}
        >
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 0%, ${PURPLE}26 0%, transparent 60%)`,
            }}
          />
          <div className="container relative">
            <div className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="rounded-3xl p-8 md:p-14 border relative overflow-hidden"
                style={{
                  background: BG_2,
                  borderColor: `${PINK}1A`,
                  boxShadow: `0 12px 40px #000000aa`,
                }}
              >
                <div
                  className="absolute inset-x-0 top-0 h-[3px]"
                  style={{ background: BRAND_GRADIENT }}
                />

                <div className="flex items-center gap-3 mb-6">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: `${PINK}1F`, border: `1px solid ${PINK}55` }}
                  >
                    <Lock size={22} style={{ color: PINK }} strokeWidth={2.25} />
                  </div>
                  <span
                    className="text-xs font-semibold uppercase tracking-[0.2em]"
                    style={{ color: GOLD }}
                  >
                    Privacy & Security Architecture
                  </span>
                </div>

                <h2
                  className="text-4xl md:text-5xl font-bold tracking-tight mb-6"
                  style={{
                    color: TEXT,
                    fontFamily: "'Space Grotesk', system-ui, sans-serif",
                  }}
                >
                  Private by Design
                </h2>

                <div
                  className="space-y-5 text-lg leading-relaxed mb-8 max-w-3xl"
                  style={{ color: TEXT_SOFT }}
                >
                  <p>
                    Node Guardian is built so that the parts of your security that should
                    stay on your Mac, stay on your Mac.
                  </p>
                  <p>
                    Your VPN encryption key is generated on your device and stored in the{" "}
                    <span className="font-semibold" style={{ color: TEXT }}>
                      macOS Keychain
                    </span>
                    . The private key never leaves your Mac — only your public key is
                    registered so the VPN server can accept your connection.
                  </p>
                  <p>
                    The VPN kill switch is enforced at the operating-system level, so if
                    the encrypted tunnel drops, your traffic is blocked rather than
                    leaking onto an untrusted network. It fails closed, not open — the way
                    a security product should.
                  </p>
                </div>

                <p
                  className="text-sm font-semibold mb-4 uppercase tracking-wider"
                  style={{ color: TEXT }}
                >
                  What this means for you:
                </p>
                <div className="grid sm:grid-cols-2 gap-3 mb-10">
                  {[
                    { icon: KeyRound, label: "Unique per-device encryption keys" },
                    { icon: Lock, label: "Private key never leaves your Keychain" },
                    { icon: ShieldAlert, label: "Kill switch fails closed, not open" },
                    { icon: EyeOff, label: "DNS forced through the tunnel" },
                    { icon: Network, label: "No shared credentials between users" },
                    { icon: Server, label: "WireGuard — fast, modern encryption" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                      style={{ background: BG_3, borderColor: `${PINK}1A` }}
                    >
                      <item.icon size={18} style={{ color: SUCCESS }} strokeWidth={2.25} />
                      <span className="text-[15px] font-medium" style={{ color: TEXT }}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>

                <div
                  className="rounded-xl px-5 py-4 border"
                  style={{ background: BG_3, borderColor: `${PINK}1A` }}
                >
                  <p className="text-xs leading-relaxed" style={{ color: TEXT_DIM }}>
                    <span className="font-semibold" style={{ color: TEXT }}>
                      Note:
                    </span>{" "}
                    Node Guardian is being actively developed. Features and availability
                    are described as currently planned and may evolve before public
                    release.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ===== WHO IS IT FOR ===== */}
        <section
          className="relative section border-t"
          style={{ borderColor: `${PINK}1A`, background: BG_2 }}
        >
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 0% 50%, ${PINK}1A 0%, transparent 60%)`,
            }}
          />
          <div className="container relative">
            <div className="max-w-2xl mb-12">
              <div
                className="text-xs font-semibold uppercase tracking-[0.2em] mb-4"
                style={{ color: GOLD }}
              >
                Who Is Node Guardian For?
              </div>
              <h2
                className="text-4xl md:text-5xl font-bold tracking-tight mb-5"
                style={{
                  color: TEXT,
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                }}
              >
                For anyone who wants their Mac actually protected.
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: TEXT_SOFT }}>
                Node Guardian is built for Mac users who want strong, understandable
                security without stitching together a pile of separate tools:
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                "Privacy-Conscious Users",
                "Remote Workers",
                "Frequent Travelers",
                "Public Wi-Fi Users",
                "Freelancers & Creators",
                "Small Business Owners",
                "Students",
                "Anyone on Untrusted Networks",
                "Everyday Mac Users",
              ].map((role, i) => (
                <motion.div
                  key={role}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: i * 0.04 }}
                  className="rounded-2xl px-5 py-4 border flex items-center gap-3"
                  style={{ background: BG_3, borderColor: `${PINK}1A` }}
                >
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: BRAND_GRADIENT }}
                  />
                  <span
                    className="text-[15px] font-medium tracking-tight"
                    style={{ color: TEXT }}
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
          style={{ borderColor: `${PINK}1A`, background: BG }}
        >
          <div className="container">
            <div className="max-w-2xl mb-14">
              <div
                className="text-xs font-semibold uppercase tracking-[0.2em] mb-4"
                style={{ color: GOLD }}
              >
                How It Works
              </div>
              <h2
                className="text-4xl md:text-5xl font-bold tracking-tight mb-5"
                style={{
                  color: TEXT,
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                }}
              >
                Protected in minutes, guarded from then on.
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: TEXT_SOFT }}>
                Four steps from install to a fully guarded Mac.
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
                  className="relative rounded-2xl p-6 border"
                  style={{ background: BG_2, borderColor: `${PINK}1A` }}
                >
                  <div
                    className="absolute -top-3 -left-3 w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm text-black shadow-lg"
                    style={{ background: BRAND_GRADIENT }}
                  >
                    {i + 1}
                  </div>
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 mt-2"
                    style={{ background: `${PINK}1F`, border: `1px solid ${PINK}44` }}
                  >
                    <step.icon size={20} style={{ color: PINK }} strokeWidth={2.25} />
                  </div>
                  <h3
                    className="text-base font-semibold tracking-tight mb-2"
                    style={{ color: TEXT }}
                  >
                    {step.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: TEXT_SOFT }}>
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
          style={{ borderColor: `${PINK}1A`, background: BG_2 }}
        >
          <div
            className="absolute inset-0 opacity-30 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 100%, ${PURPLE}26 0%, transparent 60%)`,
            }}
          />
          <div className="container relative">
            <div className="max-w-2xl mb-14">
              <div
                className="text-xs font-semibold uppercase tracking-[0.2em] mb-4"
                style={{ color: GOLD }}
              >
                Inside the App
              </div>
              <h2
                className="text-4xl md:text-5xl font-bold tracking-tight mb-5"
                style={{
                  color: TEXT,
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                }}
              >
                A clear, native macOS interface.
              </h2>
              <p className="text-lg leading-relaxed" style={{ color: TEXT_SOFT }}>
                Polished screenshots will replace these placeholders as Node Guardian
                approaches public release.
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-8 md:gap-10">
              {screenshots.map((s, i) => (
                <ScreenshotFrame key={s.label} label={s.label} icon={s.icon} delay={i * 0.06} />
              ))}
            </div>
          </div>
        </section>

        {/* ===== FAQ ===== */}
        <section
          className="relative section border-t"
          style={{ borderColor: `${PINK}1A`, background: BG }}
        >
          <div className="container">
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-12">
                <div
                  className="text-xs font-semibold uppercase tracking-[0.2em] mb-4"
                  style={{ color: GOLD }}
                >
                  Frequently Asked Questions
                </div>
                <h2
                  className="text-4xl md:text-5xl font-bold tracking-tight"
                  style={{
                    color: TEXT,
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
                    className="rounded-2xl border px-6"
                    style={{ background: BG_2, borderColor: `${PINK}1A` }}
                  >
                    <AccordionTrigger
                      className="text-left text-base md:text-lg font-semibold hover:no-underline py-5 [&[data-state=open]>svg]:rotate-180"
                      style={{ color: TEXT }}
                    >
                      {item.q}
                    </AccordionTrigger>
                    <AccordionContent
                      className="text-[15px] leading-relaxed pb-5"
                      style={{ color: TEXT_SOFT }}
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
          style={{ borderColor: `${PINK}1A`, background: BG_2 }}
        >
          <div
            className="absolute inset-0 opacity-50 pointer-events-none"
            style={{
              background: `radial-gradient(ellipse at 50% 50%, ${PURPLE}2A 0%, transparent 65%)`,
            }}
          />
          <div className="container relative">
            <div className="max-w-2xl mx-auto text-center">
              <div className="flex justify-center mb-6">
                <NodeGuardianLogo size={84} />
              </div>
              <h2
                className="text-4xl md:text-5xl font-bold tracking-tight mb-5"
                style={{
                  color: TEXT,
                  fontFamily: "'Space Grotesk', system-ui, sans-serif",
                }}
              >
                Questions About Node Guardian?
              </h2>
              <p className="text-lg leading-relaxed mb-8" style={{ color: TEXT_SOFT }}>
                Node Guardian is being developed by MV App Studio as an all-in-one,
                privacy-focused security app for macOS.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  to="/start-project"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold text-black shadow-lg"
                  style={{ background: BRAND_GRADIENT }}
                >
                  <Mail size={18} />
                  Contact MV App Studio
                </Link>
                <a
                  href="mailto:louis@mvappstudio.com"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl font-semibold transition-colors border"
                  style={{ color: TEXT, borderColor: `${PINK}44`, background: BG_ELEVATED }}
                >
                  louis@mvappstudio.com
                </a>
              </div>

              {/* Legal links */}
              <div className="mt-12 pt-8 border-t" style={{ borderColor: `${PINK}1A` }}>
                <p
                  className="text-xs uppercase tracking-[0.2em] mb-4"
                  style={{ color: TEXT_DIM }}
                >
                  Node Guardian Legal
                </p>
                <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-medium">
                  <Link
                    to="/services/mv-app-design/nodeguardian/privacy"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border transition-colors"
                    style={{ color: TEXT, borderColor: `${PINK}44`, background: BG_ELEVATED }}
                  >
                    Privacy Policy
                    <ChevronRight size={14} />
                  </Link>
                  <Link
                    to="/services/mv-app-design/nodeguardian/terms"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border transition-colors"
                    style={{ color: TEXT, borderColor: `${PINK}44`, background: BG_ELEVATED }}
                  >
                    Terms of Service
                    <ChevronRight size={14} />
                  </Link>
                  <Link
                    to="/services/mv-app-design"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg transition-colors"
                    style={{ color: TEXT_DIM }}
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
