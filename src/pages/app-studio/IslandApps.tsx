import { AppStudioLayout } from "./AppStudioLayout";
import { motion, useReducedMotion } from "framer-motion";
import { Ship, Clock, Calendar, Wind, CloudRain, AlertTriangle, Navigation, Radio, Flower2, Bike, ArrowRight, KeyRound, FileText, Search, Users, ShieldCheck } from "lucide-react";
import { useRef, useEffect } from "react";
import { useDocumentMeta } from "@/lib/useDocumentMeta";

// =============================================================================
// TABLET MOCK - IsTheFerryRunning Scrolling UI
// =============================================================================

function FerryTabletMock() {
  const prefersReducedMotion = useReducedMotion();

  const scrollingCards = [
    { title: "Today's Outlook", icon: Clock, status: "Moderate Risk", statusColor: "amber", desc: "Some delays expected due to wind conditions" },
    { title: "Weather Factors", icon: Wind, status: "23 mph NNW", statusColor: "slate", desc: "Gusts to 33 mph • Choppy seas" },
    { title: "Route History", icon: Navigation, status: "3 cancellations", statusColor: "red", desc: "In the past 7 days on this route" },
    { title: "Operator Status", icon: Radio, status: "Normal Ops", statusColor: "green", desc: "Steamship Authority operating on schedule" },
    { title: "Travel Advisories", icon: AlertTriangle, status: "None Active", statusColor: "green", desc: "No current weather advisories" },
    // Duplicate for seamless loop
    { title: "Today's Outlook", icon: Clock, status: "Moderate Risk", statusColor: "amber", desc: "Some delays expected due to wind conditions" },
    { title: "Weather Factors", icon: Wind, status: "23 mph NNW", statusColor: "slate", desc: "Gusts to 33 mph • Choppy seas" },
  ];

  const statusColors: Record<string, string> = {
    amber: "bg-amber-100 text-amber-700",
    green: "bg-emerald-100 text-emerald-700",
    red: "bg-red-100 text-red-700",
    slate: "bg-slate-100 text-slate-600",
  };

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      <motion.div
        animate={prefersReducedMotion ? {} : { y: [0, -8, 0] }}
        transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
      >
        <div
          className="relative w-[340px] md:w-[400px] rounded-[1.5rem] p-[6px]"
          style={{
            background: "linear-gradient(145deg, #3a3a4e 0%, #2a2a3e 50%, #1a1a2e 100%)",
            boxShadow: "0 50px 100px -20px rgba(0, 0, 0, 0.3), 0 30px 60px -30px rgba(0, 0, 0, 0.4)",
          }}
        >
          <div className="relative rounded-[1.25rem] overflow-hidden bg-white">
            {/* Camera notch */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 w-2 h-2 bg-slate-300 rounded-full" />

            <div className="relative aspect-[4/3] overflow-hidden">
              {/* App header */}
              <div className="bg-white border-b border-slate-100 px-5 pt-6 pb-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                    <Ship size={20} className="text-white" />
                  </div>
                  <div>
                    <h2 className="text-slate-900 text-lg font-bold leading-tight">Is the Ferry Running Today?</h2>
                    <p className="text-slate-500 text-xs">Check delay and cancellation likelihoods before you travel.</p>
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 italic">Not official schedules. Just better expectations.</p>
              </div>

              {/* Scrolling content area */}
              <div className="relative h-[calc(100%-120px)] overflow-hidden bg-slate-50">
                <div className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-slate-50 to-transparent z-10" />
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-slate-50 to-transparent z-10" />

                <motion.div
                  className="px-4 py-3 space-y-3"
                  animate={prefersReducedMotion ? {} : { y: [0, -280] }}
                  transition={{ y: { duration: 20, repeat: Infinity, ease: "linear" } }}
                >
                  {scrollingCards.map((card, i) => (
                    <div key={i} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <card.icon size={16} className="text-slate-400" />
                          <span className="text-slate-800 font-semibold text-sm">{card.title}</span>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[card.statusColor]}`}>
                          {card.status}
                        </span>
                      </div>
                      <p className="text-slate-500 text-xs">{card.desc}</p>
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </div>
        </div>

        {/* Glow effect */}
        <div
          className="absolute -inset-8 -z-10 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(175 60% 45% / 0.5) 0%, transparent 70%)" }}
        />
      </motion.div>
    </motion.div>
  );
}

// =============================================================================
// PHONE MOCK - BloomHub Video Demo
// =============================================================================

function BloomHubPhoneMock() {
  const prefersReducedMotion = useReducedMotion();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Auto-play and loop the video
    if (videoRef.current) {
      videoRef.current.play().catch(() => {
        // Autoplay might be blocked, that's ok
      });
    }
  }, []);

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      <motion.div
        animate={prefersReducedMotion ? {} : { y: [0, -8, 0] }}
        transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
      >
        <div
          className="relative w-[280px] md:w-[320px] rounded-[3rem] p-[8px]"
          style={{
            background: "linear-gradient(145deg, #2a2a3e 0%, #1a1a2e 50%, #0f0f1a 100%)",
            boxShadow: "0 50px 100px -20px rgba(0, 0, 0, 0.4), 0 30px 60px -30px rgba(0, 0, 0, 0.5)",
          }}
        >
          <div className="relative rounded-[2.5rem] overflow-hidden bg-black">
            {/* Video content */}
            <div className="relative aspect-[9/19.5] overflow-hidden bg-black">
              {/* Compatibility fix (minimum necessary): the source shipped a
                  single HEVC/H.265 MP4, which does not play in Chrome/Firefox.
                  Same clip, same frame — served as web-safe WebM + H.264 with a
                  poster. Original HEVC kept last as a Safari-preferred source. */}
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                poster="/bloomhub-poster.jpg"
                autoPlay
                loop
                muted
                playsInline
              >
                <source src="/bloomhub-demo.webm" type="video/webm" />
                <source src="/bloomhub-demo-h264.mp4" type="video/mp4" />
                <source src="/bloomhub-demo.mp4" type="video/mp4; codecs=hvc1" />
              </video>

              {/* Status bar overlay to cover recording indicator */}
              <div className="absolute top-0 left-0 right-0 z-30 bg-white">
                <div className="flex items-center justify-between px-6 py-2">
                  {/* Time */}
                  <span className="text-sm font-semibold text-black w-12">9:41</span>

                  {/* Dynamic Island */}
                  <div className="w-28 h-8 bg-black rounded-full" />

                  {/* Status icons */}
                  <div className="flex items-center gap-1 w-12 justify-end">
                    {/* Signal bars */}
                    <div className="flex items-end gap-[2px]">
                      <div className="w-[3px] h-[4px] bg-black rounded-sm" />
                      <div className="w-[3px] h-[6px] bg-black rounded-sm" />
                      <div className="w-[3px] h-[8px] bg-black rounded-sm" />
                      <div className="w-[3px] h-[10px] bg-black rounded-sm" />
                    </div>
                    {/* WiFi */}
                    <svg className="w-4 h-4 text-black ml-1" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 18c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0-6c3.03 0 5.78 1.23 7.76 3.22l-2.12 2.12C16.2 15.9 14.2 15 12 15s-4.2.9-5.64 2.34l-2.12-2.12C6.22 13.23 8.97 12 12 12zm0-6c4.42 0 8.44 1.79 11.34 4.69l-2.12 2.12C18.78 10.37 15.53 9 12 9s-6.78 1.37-9.22 3.81L.66 10.69C3.56 7.79 7.58 6 12 6z"/>
                    </svg>
                    {/* Battery */}
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

            {/* Home indicator */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full" />
          </div>
        </div>

        {/* Glow effect - pink/purple for BloomHub */}
        <div
          className="absolute -inset-8 -z-10 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(330 70% 50% / 0.5) 0%, transparent 70%)" }}
        />
      </motion.div>
    </motion.div>
  );
}

// =============================================================================
// IMAC MOCK - ClassMap Static Image
// =============================================================================

function ClassMapiMacMock() {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className="relative"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      <motion.div
        animate={prefersReducedMotion ? {} : { y: [0, -8, 0] }}
        transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
      >
        {/* iMac Frame */}
        <div
          className="relative w-[340px] md:w-[420px]"
        >
          {/* Screen bezel */}
          <div
            className="relative rounded-[1rem] p-[8px] md:p-[10px]"
            style={{
              background: "linear-gradient(145deg, #2a2a2e 0%, #1a1a1e 50%, #0f0f12 100%)",
              boxShadow: "0 50px 100px -20px rgba(0, 0, 0, 0.4), 0 30px 60px -30px rgba(0, 0, 0, 0.5)",
            }}
          >
            {/* Screen */}
            <div className="relative rounded-[0.5rem] overflow-hidden bg-slate-900">
              {/* Camera */}
              <div className="absolute top-[6px] left-1/2 -translate-x-1/2 z-30 w-2 h-2 bg-slate-700 rounded-full" />

              {/* Screen content - ClassMap image */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src="/classmap-screenshot.png"
                  alt="ClassMap application showing a school floor plan with room occupancy visualization"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          </div>

          {/* Stand neck */}
          <div className="flex justify-center">
            <div
              className="w-[60px] md:w-[80px] h-[40px] md:h-[50px]"
              style={{
                background: "linear-gradient(180deg, #1a1a1e 0%, #2a2a2e 50%, #1a1a1e 100%)",
              }}
            />
          </div>

          {/* Stand base */}
          <div className="flex justify-center -mt-1">
            <div
              className="w-[100px] md:w-[140px] h-[8px] md:h-[10px] rounded-t-sm"
              style={{
                background: "linear-gradient(180deg, #2a2a2e 0%, #1a1a1e 100%)",
              }}
            />
          </div>
        </div>

        {/* Glow effect - blue/indigo for ClassMap */}
        <div
          className="absolute -inset-8 -z-10 rounded-full opacity-20 blur-3xl"
          style={{ background: "radial-gradient(circle, hsl(220 70% 50% / 0.5) 0%, transparent 70%)" }}
        />
      </motion.div>
    </motion.div>
  );
}

// =============================================================================
// PHONE MOCK - ClientsDesk dark client list UI
// =============================================================================

function ClientsDeskPhoneMock() {
  const prefersReducedMotion = useReducedMotion();

  const CD_BLUE = "#1F8FE0";
  const CD_GREEN = "#5DBA47";
  const CD_GRADIENT = `linear-gradient(135deg, ${CD_BLUE} 0%, ${CD_GREEN} 100%)`;

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
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay: 0.3 }}
    >
      <motion.div
        animate={prefersReducedMotion ? {} : { y: [0, -8, 0] }}
        transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
      >
        <div
          className="relative w-[280px] md:w-[320px] rounded-[3rem] p-[8px]"
          style={{
            background: "linear-gradient(145deg, #2a2a3e 0%, #1a1a2e 50%, #0f0f1a 100%)",
            boxShadow: "0 50px 100px -20px rgba(0, 0, 0, 0.4), 0 30px 60px -30px rgba(0, 0, 0, 0.5)",
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
                    style={{ background: CD_GRADIENT }}
                  >
                    <Search size={16} className="text-white" strokeWidth={2.5} />
                  </div>
                </div>

                <div className="mb-5 px-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 flex items-center gap-2">
                  <Search size={14} className="text-slate-500" />
                  <span className="text-[12px] text-slate-500">
                    Search clients, notes, credentials
                  </span>
                </div>

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
                            background: `${CD_GREEN}1F`,
                            color: CD_GREEN,
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
                        style={{ color: t.active ? CD_GREEN : "#64748b" }}
                        strokeWidth={2.25}
                      />
                      <span
                        className="text-[9px] font-medium"
                        style={{ color: t.active ? CD_GREEN : "#64748b" }}
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

        {/* Glow - ClientsDesk blue/green */}
        <div
          className="absolute -inset-8 -z-10 rounded-full opacity-25 blur-3xl"
          style={{
            background: `radial-gradient(circle, ${CD_BLUE}cc 0%, transparent 70%)`,
          }}
        />
      </motion.div>
    </motion.div>
  );
}

// =============================================================================
// MAIN PAGE
// =============================================================================

const IslandApps = () => {
  useDocumentMeta({
    title: "App Design Studio | Martha's Vineyard IT",
    description:
      "Applications designed and built by Martha's Vineyard IT — from a ferry-forecasting utility and school scheduling to native iOS and macOS apps.",
    canonical: "https://anythingitechmv.com/services/mv-app-design",
  });
  return (
    <AppStudioLayout>
      {/* Hero Section */}
      <section className="section bg-gradient-subtle">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="type-display text-foreground mb-6">
                Apps Built on MV
              </h1>
              <p className="type-body-lg text-muted-foreground mb-8 max-w-lg">
                Applications designed to solve real-world problems - starting on Martha's Vineyard and extending wherever they're needed.
              </p>
            </motion.div>

            {/* Right - Tablet mock */}
            <div className="flex justify-center lg:justify-end">
              <FerryTabletMock />
            </div>
          </div>
        </div>
      </section>

      {/* Featured App Section */}
      <section className="section">
        <div className="container max-w-3xl">
          {/* App header */}
          <motion.div
            className="mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                <Ship size={24} className="text-white" />
              </div>
              <div>
                <a href="https://www.istheferryrunning.com/" target="_blank" rel="noopener noreferrer" className="type-headline text-foreground hover:text-[hsl(var(--primary))] transition-colors">IsTheFerryRunning.com</a>
                <p className="text-sm text-muted-foreground">Live island utility • Public-facing • Used daily</p>
              </div>
            </div>
          </motion.div>

          {/* Content sections */}
          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="type-title text-foreground mb-4">The Problem</h3>
              <p className="type-body">
                Ferry schedules on Martha's Vineyard are technically published, but they don't tell you what you actually need to know: whether your boat is likely to run. Weather, wind, and operational issues cause delays and cancellations that catch travelers off guard. The official sources update reactively. By the time you know, you're already at the dock.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="type-title text-foreground mb-4">The Solution</h3>
              <p className="type-body">
                IsTheFerryRunning.com aggregates weather data, historical cancellation patterns, and operator status into a single view. It doesn't replace the official schedule—it gives context. Users can see wind conditions, recent route performance, and a plain-language risk assessment before planning their day.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="type-title text-foreground mb-4">Who It Helps</h3>
              <p className="type-body">
                Year-round residents checking morning commutes. Contractors scheduling off-island pickups. Visitors trying to make a flight. Property managers coordinating cleaners. Anyone whose day depends on whether that boat actually leaves.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="type-title text-foreground mb-4">Why This Matters</h3>
              <p className="type-body">
                This is the kind of software we believe in: small, focused, and genuinely useful. It doesn't try to be everything. It solves one problem well. We built it because we needed it, and we operate it because others do too.
              </p>
            </motion.div>

            {/* Visit App Website CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="pt-4"
            >
              <a
                href="https://www.istheferryrunning.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="app-studio-cta"
              >
                <span className="font-medium">Visit App Website</span>
                <ArrowRight size={18} />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* BloomHub Section */}
      <section className="section">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Phone mock */}
            <div className="flex justify-center lg:justify-start order-2 lg:order-1">
              <BloomHubPhoneMock />
            </div>

            {/* Right content */}
            <div className="order-1 lg:order-2">
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                    <Flower2 size={24} className="text-white" />
                  </div>
                  <div>
                    <a href="https://www.bloomhub.us/" target="_blank" rel="noopener noreferrer" className="type-headline text-foreground hover:text-[hsl(var(--primary))] transition-colors">BloomHub</a>
                    <p className="text-sm text-muted-foreground">Plant marketplace • Peer-to-peer • National reach</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* BloomHub Details */}
      <section className="section-tight">
        <div className="container max-w-3xl">
          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="type-title text-foreground mb-4">The Problem</h3>
              <p className="type-body">
                A huge number of growers sell plants through Facebook groups and Instagram because there's no better option. While those platforms work at a basic level, they weren't designed for commerce. Payments happen in private messages. Inventory is tracked manually. Scams are common. There are no seller tools, no analytics, no structured reviews, and very little accountability when something goes wrong.
              </p>
              <p className="type-body mt-4">
                For growers, selling online often means taking on risk, extra admin work, and a lack of protection. For buyers, it means trusting strangers with no real way to assess reliability.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="type-title text-foreground mb-4">The Solution</h3>
              <p className="type-body">
                BloomHub is a marketplace built specifically for growers and gardeners. It centralizes the tools needed to sell plant materials such as tubers, seeds, cuttings, and bare roots in one place.
              </p>
              <p className="type-body mt-4">
                Growers can list products, manage inventory, track sales, and ship orders through a dedicated seller dashboard. Buyers can browse available plants, purchase securely, and participate in a two-way review system that builds accountability and trust on both sides.
              </p>
              <p className="type-body mt-4">
                Payments are handled through Stripe, providing buyer and seller protections that simply don't exist in social media transactions.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="type-title text-foreground mb-4">Who It's For</h3>
              <div className="type-body">
                <p className="mb-4">BloomHub is designed for:</p>
                <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                  <li>Small and independent growers who want to sell without building and maintaining their own website</li>
                  <li>Gardeners looking to buy directly from real growers</li>
                  <li>Communities where trust, reputation, and transparency matter</li>
                  <li>Sellers who want real tools instead of spreadsheets and DMs</li>
                </ul>
                <p className="mt-4">It lowers the barrier to selling while raising the standard for how transactions are handled.</p>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="type-title text-foreground mb-4">Why It Was Built</h3>
              <p className="type-body">
                BloomHub started as a solution to a real problem observed over years of watching growers struggle with existing platforms. It was built by listening closely to growers, iterating alongside early users, and focusing on trust, usability, and community rather than scale for scale's sake.
              </p>
              <p className="type-body mt-4">
                It's now a fully functioning MVP, actively used by early growers and buyers, and continues to evolve based on direct feedback from the people it's built for.
              </p>
              <p className="type-body mt-4">
                Like many projects at MV App Studio, BloomHub exists because the problem was real, persistent, and worth solving.
              </p>
            </motion.div>

            {/* Visit App Website CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="pt-4"
            >
              <a
                href="https://www.bloomhub.us/"
                target="_blank"
                rel="noopener noreferrer"
                className="app-studio-cta"
              >
                <span className="font-medium">Visit App Website</span>
                <ArrowRight size={18} />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* ClassMap Section */}
      <section className="section">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left content */}
            <div>
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-100 to-teal-100 flex items-center justify-center p-2">
                    <img
                      src="/classmap-logo.png"
                      alt="ClassMap logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <a href="https://classmap.co" target="_blank" rel="noopener noreferrer" className="type-headline text-foreground hover:text-[hsl(var(--primary))] transition-colors">ClassMap</a>
                    <p className="text-sm text-muted-foreground">School scheduling • Visual mapping • K-12 administration</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right - iMac mock */}
            <div className="flex justify-center lg:justify-end">
              <ClassMapiMacMock />
            </div>
          </div>
        </div>
      </section>

      {/* ClassMap Details */}
      <section className="section-tight">
        <div className="container max-w-3xl">
          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="type-title text-foreground mb-4">The Problem</h3>
              <p className="type-body">
                School administrators waste time cross-referencing spreadsheets to answer simple questions like "Where is Mr. Johnson right now?" Guidance counselors are interrupted dozens of times per day. Room conflicts often go unnoticed until two classes arrive at the same door.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="type-title text-foreground mb-4">The Solution</h3>
              <p className="type-body">
                ClassMap overlays schedule data directly onto school floor plan images, showing real-time room occupancy at a glance. Staff can instantly see which rooms are in use, locate any teacher, and identify scheduling conflicts before they become problems.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="type-title text-foreground mb-4">Who It Helps</h3>
              <p className="type-body">
                K-12 administrators, guidance counselors, and school staff who need to quickly understand building usage without digging through schedules. Anyone who has ever been asked "Where is this teacher?" or "Is that room available?" and had to check multiple sources to answer.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="type-title text-foreground mb-4">Why It Was Built</h3>
              <p className="type-body">
                ClassMap bridges the gap between abstract schedule data and physical building layouts. It transforms school schedules into interactive, visual building maps - turning information that already exists into something immediately useful.
              </p>
            </motion.div>

            {/* Visit App Website CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="pt-4"
            >
              <a
                href="https://classmap.co"
                target="_blank"
                rel="noopener noreferrer"
                className="app-studio-cta"
              >
                <span className="font-medium">Visit App Website</span>
                <ArrowRight size={18} />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Cycling Hub Section */}
      <section className="section">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Phone mock with app screenshot */}
            <div className="flex justify-center lg:justify-start order-2 lg:order-1">
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
                >
                  <div
                    className="relative w-[280px] md:w-[320px] rounded-[3rem] p-[8px]"
                    style={{
                      background: "linear-gradient(145deg, #2a2a3e 0%, #1a1a2e 50%, #0f0f1a 100%)",
                      boxShadow: "0 50px 100px -20px rgba(0, 0, 0, 0.4), 0 30px 60px -30px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    <div className="relative rounded-[2.5rem] overflow-hidden bg-white">
                      <div className="relative aspect-[9/19.5] overflow-hidden">
                        <img
                          src="/cyclinghub-screenshot.png"
                          alt="Cycling Hub app showing group rides and local events in Martha's Vineyard"
                          className="w-full h-full object-contain"
                        />

                        {/* Status bar overlay */}
                        <div className="absolute top-0 left-0 right-0 z-30 bg-white">
                          <div className="flex items-center justify-between px-6 py-2">
                            {/* Time */}
                            <span className="text-sm font-semibold text-black w-12">9:41</span>

                            {/* Dynamic Island */}
                            <div className="w-28 h-8 bg-black rounded-full" />

                            {/* Status icons */}
                            <div className="flex items-center gap-1 w-12 justify-end">
                              {/* Signal bars */}
                              <div className="flex items-end gap-[2px]">
                                <div className="w-[3px] h-[4px] bg-black rounded-sm" />
                                <div className="w-[3px] h-[6px] bg-black rounded-sm" />
                                <div className="w-[3px] h-[8px] bg-black rounded-sm" />
                                <div className="w-[3px] h-[10px] bg-black rounded-sm" />
                              </div>
                              {/* WiFi */}
                              <svg className="w-4 h-4 text-black ml-1" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 18c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0-6c3.03 0 5.78 1.23 7.76 3.22l-2.12 2.12C16.2 15.9 14.2 15 12 15s-4.2.9-5.64 2.34l-2.12-2.12C6.22 13.23 8.97 12 12 12zm0-6c4.42 0 8.44 1.79 11.34 4.69l-2.12 2.12C18.78 10.37 15.53 9 12 9s-6.78 1.37-9.22 3.81L.66 10.69C3.56 7.79 7.58 6 12 6z"/>
                              </svg>
                              {/* Battery */}
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
                      {/* Home indicator */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/20 rounded-full" />
                    </div>
                  </div>

                  {/* Glow effect - red for Cycling Hub */}
                  <div
                    className="absolute -inset-8 -z-10 rounded-full opacity-20 blur-3xl"
                    style={{ background: "radial-gradient(circle, hsl(0 80% 50% / 0.5) 0%, transparent 70%)" }}
                  />
                </motion.div>
              </motion.div>
            </div>

            {/* Right content */}
            <div className="order-1 lg:order-2">
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden">
                    <img
                      src="/cyclinghub-logo.png"
                      alt="Cycling Hub logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <a href="https://www.cyclinghub.app" target="_blank" rel="noopener noreferrer" className="type-headline text-foreground hover:text-[hsl(var(--primary))] transition-colors">Cycling Hub</a>
                    <p className="text-sm text-muted-foreground">Ride organization • Community building • Cyclist networking</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Cycling Hub Details */}
      <section className="section-tight">
        <div className="container max-w-3xl">
          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="type-title text-foreground mb-4">The Problem</h3>
              <p className="type-body">
                Group rides are scattered across text threads, Strava clubs, Facebook posts, and word of mouth. New riders struggle to find local groups. Ride leaders have no reliable way to know who is actually showing up. Traveling cyclists arrive somewhere new and have no clear way to discover active clubs or meet other riders.
              </p>
              <p className="type-body mt-4">
                There is no central, structured system for organizing real-world cycling communities.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="type-title text-foreground mb-4">The Solution</h3>
              <p className="type-body">
                Cycling Hub centralizes local ride organization into one clean platform. Ride leaders can post events, track attendance, and manage details in advance. Riders can discover clubs near them, RSVP to rides, and receive notifications when new events are posted in their area.
              </p>
              <p className="type-body mt-4">
                Strava integration allows riders to verify their cycling identity, building trust and transparency within the community - while keeping personal activity data private unless they choose to share it.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="type-title text-foreground mb-4">Who It Helps</h3>
              <p className="type-body">
                Cycling clubs, local bike shops, ride leaders, and everyday cyclists who want a better way to organize and participate in group rides.
              </p>
              <p className="type-body mt-4">
                It also helps traveling riders who want to connect with local cycling communities wherever they go - without relying on fragmented social media posts or insider knowledge.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="type-title text-foreground mb-4">Why It Was Built</h3>
              <p className="type-body">
                Cycling Hub was built to strengthen local cycling communities. It transforms disconnected ride planning into a streamlined, discoverable system that makes it easier to get people out riding together.
              </p>
              <p className="type-body mt-4">
                The goal is simple: increase participation, improve organization, and help cyclists connect - locally and beyond.
              </p>
            </motion.div>

            {/* App Store CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="pt-4"
            >
              <a
                href="https://apps.apple.com/us/app/cycling-hub-ride-together/id6771776151"
                target="_blank"
                rel="noopener noreferrer"
                className="app-studio-cta"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <span className="font-medium">Download on the App Store</span>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Node Player Section */}
      <section className="section">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left content */}
            <div>
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-black flex items-center justify-center p-1">
                    <img
                      src="/nodeplayer-logo.png"
                      alt="Node Player logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <a href="https://www.nodeplayer.app/" target="_blank" rel="noopener noreferrer" className="type-headline text-foreground hover:text-[hsl(var(--primary))] transition-colors">Node Player</a>
                    <p className="text-sm text-muted-foreground">Media streaming • Personal control • Cross-device</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right - Phone mock with app screenshot */}
            <div className="flex justify-center lg:justify-end">
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
                >
                  <div
                    className="relative w-[280px] md:w-[320px] rounded-[3rem] p-[8px]"
                    style={{
                      background: "linear-gradient(145deg, #2a2a3e 0%, #1a1a2e 50%, #0f0f1a 100%)",
                      boxShadow: "0 50px 100px -20px rgba(0, 0, 0, 0.4), 0 30px 60px -30px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    <div className="relative rounded-[2.5rem] overflow-hidden bg-black">
                      <div className="relative aspect-[9/19.5] overflow-hidden">
                        <img
                          src="/nodeplayer-screenshot.png"
                          alt="Node Player app showing home screen with media navigation"
                          className="w-full h-full object-contain"
                        />

                        {/* Status bar overlay */}
                        <div className="absolute top-0 left-0 right-0 z-30 bg-black">
                          <div className="flex items-center justify-between px-6 py-2">
                            {/* Time */}
                            <span className="text-sm font-semibold text-white w-12">9:41</span>

                            {/* Dynamic Island */}
                            <div className="w-28 h-8 bg-black rounded-full" />

                            {/* Status icons */}
                            <div className="flex items-center gap-1 w-12 justify-end">
                              {/* Signal bars */}
                              <div className="flex items-end gap-[2px]">
                                <div className="w-[3px] h-[4px] bg-white rounded-sm" />
                                <div className="w-[3px] h-[6px] bg-white rounded-sm" />
                                <div className="w-[3px] h-[8px] bg-white rounded-sm" />
                                <div className="w-[3px] h-[10px] bg-white rounded-sm" />
                              </div>
                              {/* WiFi */}
                              <svg className="w-4 h-4 text-white ml-1" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 18c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0-6c3.03 0 5.78 1.23 7.76 3.22l-2.12 2.12C16.2 15.9 14.2 15 12 15s-4.2.9-5.64 2.34l-2.12-2.12C6.22 13.23 8.97 12 12 12zm0-6c4.42 0 8.44 1.79 11.34 4.69l-2.12 2.12C18.78 10.37 15.53 9 12 9s-6.78 1.37-9.22 3.81L.66 10.69C3.56 7.79 7.58 6 12 6z"/>
                              </svg>
                              {/* Battery */}
                              <div className="flex items-center ml-1">
                                <div className="w-6 h-3 rounded-sm border border-white p-[1px]">
                                  <div className="w-full h-full bg-white rounded-[1px]" />
                                </div>
                                <div className="w-[2px] h-[5px] bg-white rounded-r-sm -ml-[1px]" />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      {/* Home indicator */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/30 rounded-full" />
                    </div>
                  </div>

                  {/* Glow effect - pink for Node Player */}
                  <div
                    className="absolute -inset-8 -z-10 rounded-full opacity-20 blur-3xl"
                    style={{ background: "radial-gradient(circle, hsl(320 80% 65% / 0.5) 0%, transparent 70%)" }}
                  />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Node Player Details */}
      <section className="section-tight">
        <div className="container max-w-3xl">
          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="type-title text-foreground mb-4">The Problem</h3>
              <p className="type-body">
                Streaming media from personal servers has traditionally required clunky interfaces, complicated setup processes, and apps that prioritize features over usability. Users who want control over their own content libraries are often stuck with outdated tools or forced to rely on platforms that don't put them in charge.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="type-title text-foreground mb-4">The Solution</h3>
              <p className="type-body">
                Node Player is a powerful media player designed to give users full control over their streaming experience. Connect your own media sources, organize your content, and enjoy reliable playback across devices with a clean, modern interface.
              </p>
              <p className="type-body mt-4">
                Built with performance and simplicity in mind, Node Player focuses on delivering a fast, flexible streaming solution while keeping the user in control of their media.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="type-title text-foreground mb-4">Who It Helps</h3>
              <p className="type-body">
                Users who run their own media servers and want a polished client experience. Cord-cutters who manage personal content libraries. Anyone who values privacy, ownership, and control over their streaming setup without sacrificing a modern, intuitive interface.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="type-title text-foreground mb-4">Why It Was Built</h3>
              <p className="type-body">
                Node Player was built because existing solutions either look outdated, are overly complicated, or lack the polish expected from a modern iOS app. The goal was simple: create a media player that respects the user's intelligence, works reliably, and looks as good as it performs.
              </p>
            </motion.div>

            {/* App Store CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="pt-4"
            >
              <a
                href="https://apps.apple.com/us/app/node-player/id6761611004"
                target="_blank"
                rel="noopener noreferrer"
                className="app-studio-cta"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                <span className="font-medium">Download on the App Store</span>
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* ClientsDesk Section */}
      <section className="section">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left - Phone mock with ClientsDesk UI */}
            <div className="flex justify-center lg:justify-start order-2 lg:order-1">
              <ClientsDeskPhoneMock />
            </div>

            {/* Right content */}
            <div className="order-1 lg:order-2">
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden flex items-center justify-center bg-white">
                    <img
                      src="/clientsdesk-logo.png"
                      alt="ClientsDesk logo"
                      className="w-full h-full object-contain p-1"
                    />
                  </div>
                  <div>
                    <a
                      href="/services/mv-app-design/clientsdesk"
                      className="type-headline text-foreground hover:text-[hsl(var(--primary))] transition-colors"
                    >
                      ClientsDesk
                    </a>
                    <p className="text-sm text-muted-foreground">
                      A Private CRM That Lives In Your Google Drive
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ClientsDesk Details */}
      <section className="section-tight">
        <div className="container max-w-3xl">
          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <p className="type-body font-medium text-foreground">
                Your CRM. Your Data. Your Google Drive.
              </p>
              <p className="type-body mt-4">
                Manage clients, notes, credentials, invoice reminders, and service history from a modern mobile app while maintaining ownership of your database. ClientsDesk helps professionals across many industries keep client information organized — without handing it over to a CRM vendor.
              </p>
              <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-4">
                <li>Client records and service history</li>
                <li>Secure credential management</li>
                <li>Notes and invoice reminders</li>
                <li>Google Drive / spreadsheet-powered database</li>
                <li>Offline access and sync</li>
                <li>User-owned data, not server-hosted CRM storage</li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="type-title text-foreground mb-4">The Problem</h3>
              <p className="type-body">
                Professionals who manage clients — property managers, realtors, contractors, consultants, service businesses, and many others — often keep notes, credentials, service records, and invoice reminders scattered across spreadsheets, notes apps, password managers, and memory. Traditional CRMs are often too generic, too expensive, or store sensitive client data on third-party servers.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="type-title text-foreground mb-4">The Solution</h3>
              <p className="type-body">
                ClientsDesk gives any client-based business a focused, private CRM built around the way real client work actually happens. Client records, notes, credentials, and invoice reminders are organized in one mobile app while the underlying CRM database lives in the user's own Google Drive — not on a vendor's servers.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="type-title text-foreground mb-4">Who It Helps</h3>
              <p className="type-body">
                Property managers, realtors, contractors, consultants, service businesses, small business owners, IT professionals, and anyone running a client-based business that needs fast access to client records, notes, credentials, and service history.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="type-title text-foreground mb-4">Why It Was Built</h3>
              <p className="type-body">
                ClientsDesk was built to solve a real workflow problem: keeping client information organized, portable, private, and accessible in the field. The goal is to give professionals and service businesses a simple CRM they can actually use — without surrendering ownership of their data to a vendor.
              </p>
            </motion.div>

            {/* View ClientsDesk CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="pt-4"
            >
              <a
                href="/services/mv-app-design/clientsdesk"
                className="app-studio-cta"
              >
                <span className="font-medium">View App Details</span>
                <ArrowRight size={18} />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="container">
        <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      {/* Daily Menu Maker Section */}
      <section className="section">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left content */}
            <div>
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-[#F5EFE0] flex items-center justify-center">
                    <img
                      src="/dailymenumaker-logo.png"
                      alt="Daily Menu Maker logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <a
                      href="/services/mv-app-design/dailymenumaker"
                      className="type-headline text-foreground hover:text-[hsl(var(--primary))] transition-colors"
                    >
                      Daily Menu Maker
                    </a>
                    <p className="text-sm text-muted-foreground">
                      Daily menu management • Farmers markets • Small vendors
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right - Phone mock with app screenshot */}
            <div className="flex justify-center lg:justify-end">
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
                >
                  <div
                    className="relative w-[280px] md:w-[320px] rounded-[3rem] p-[8px]"
                    style={{
                      background: "linear-gradient(145deg, #2a2a3e 0%, #1a1a2e 50%, #0f0f1a 100%)",
                      boxShadow: "0 50px 100px -20px rgba(0, 0, 0, 0.4), 0 30px 60px -30px rgba(0, 0, 0, 0.5)",
                    }}
                  >
                    <div className="relative rounded-[2.5rem] overflow-hidden bg-white">
                      <div className="relative aspect-[9/19.5] overflow-hidden">
                        <img
                          src="/dailymenumaker-screenshot.png"
                          alt="Daily Menu Maker app showing today's menu with selectable products and Generate Menu button"
                          className="w-full h-full object-contain"
                          loading="lazy"
                        />

                        {/* Status bar overlay (covers screenshot's own status bar with 9:41) */}
                        <div className="absolute top-0 left-0 right-0 z-30 bg-white">
                          <div className="flex items-center justify-between px-6 py-2">
                            {/* Time */}
                            <span className="text-sm font-semibold text-black w-12">9:41</span>

                            {/* Dynamic Island */}
                            <div className="w-28 h-8 bg-black rounded-full" />

                            {/* Status icons */}
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
                      {/* Home indicator */}
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-black/20 rounded-full" />
                    </div>
                  </div>

                  {/* Glow effect - warm orange for Daily Menu Maker */}
                  <div
                    className="absolute -inset-8 -z-10 rounded-full opacity-25 blur-3xl"
                    style={{
                      background: "radial-gradient(circle, hsl(18 80% 55% / 0.5) 0%, transparent 70%)",
                    }}
                  />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Daily Menu Maker Details */}
      <section className="section-tight">
        <div className="container max-w-3xl">
          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="type-title text-foreground mb-4">The Problem</h3>
              <p className="type-body">
                Farmers market vendors, bakers, makers, and small food producers change what they bring to market every single day. Today's lineup depends on what was baked overnight, what's in season, what sold out last weekend, or what came out of the kitchen this morning. Writing a fresh chalkboard, printing a one-off menu, or telling every customer the same list of substitutions takes time vendors don't have on a busy market morning.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="type-title text-foreground mb-4">The Solution</h3>
              <p className="type-body">
                Daily Menu Maker turns the daily menu into a few taps. Vendors keep a master list of products with descriptions and prices, then check off what's available today and tap one button to generate a clean, printable, shareable menu. The result looks polished enough for a storefront and saves automatically to the vendor's own Google account.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="type-title text-foreground mb-4">Who It Helps</h3>
              <p className="type-body">
                Farmers market vendors, bakeries, coffee shops, food trucks, chocolatiers, jam makers, soap makers, prepared food sellers, and any small business with a rotating daily offering. Anyone who has ever rewritten the same chalkboard for the tenth Saturday in a row.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="type-title text-foreground mb-4">Why It Was Built</h3>
              <p className="type-body">
                Daily Menu Maker was built to remove a small but persistent piece of friction from the mornings of small vendors. It is a focused tool for a specific job: pick today's offerings, generate a clean menu, and get back to running the booth.
              </p>
            </motion.div>

            {/* View Daily Menu Maker CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="pt-4"
            >
              <a
                href="/services/mv-app-design/dailymenumaker"
                className="app-studio-cta"
              >
                <span className="font-medium">View App Details</span>
                <ArrowRight size={18} />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Node Guardian Section */}
      <section className="section">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left content */}
            <div>
              <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-black flex items-center justify-center">
                    <img
                      src="/nodeguardian-logo.png"
                      alt="Node Guardian logo"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div>
                    <a
                      href="/services/mv-app-design/nodeguardian"
                      className="type-headline text-foreground hover:text-[hsl(var(--primary))] transition-colors"
                    >
                      Node Guardian
                    </a>
                    <p className="text-sm text-muted-foreground">
                      macOS security • Built-in VPN • Privacy toolkit
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Right - macOS window mock (desktop app) */}
            <div className="flex justify-center lg:justify-end">
              <motion.div
                className="relative"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ y: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
                >
                  <div
                    className="relative w-[340px] md:w-[420px] rounded-2xl overflow-hidden border"
                    style={{
                      background: "#0A0A0A",
                      borderColor: "rgba(255, 189, 255, 0.14)",
                      boxShadow: "0 50px 100px -20px rgba(0, 0, 0, 0.7), 0 30px 60px -30px rgba(155, 77, 202, 0.35)",
                    }}
                  >
                    {/* macOS title bar */}
                    <div
                      className="flex items-center gap-2 px-4 py-3 border-b"
                      style={{ background: "#141414", borderColor: "rgba(255, 189, 255, 0.08)" }}
                    >
                      <span className="w-3 h-3 rounded-full" style={{ background: "#FF5F57" }} />
                      <span className="w-3 h-3 rounded-full" style={{ background: "#FEBC2E" }} />
                      <span className="w-3 h-3 rounded-full" style={{ background: "#28C840" }} />
                      <span className="ml-3 text-xs font-medium tracking-tight" style={{ color: "#8A8078" }}>
                        Node Guardian
                      </span>
                    </div>

                    {/* Window body — no screenshot asset exists for Node Guardian
                        (it was absent in the source repo too), so the original
                        placeholder is shown directly. Removing the <img> avoids a
                        404/console error while keeping the exact visual. */}
                    <div className="relative aspect-[16/11]">
                      <div
                        className="absolute inset-0 flex flex-col items-center justify-center gap-4"
                        style={{
                          background: "radial-gradient(ellipse at 50% 30%, rgba(155, 77, 202, 0.2) 0%, #0A0A0A 70%)",
                        }}
                      >
                        <div
                          className="w-16 h-16 rounded-2xl flex items-center justify-center"
                          style={{ background: "linear-gradient(135deg, #FFBDFF 0%, #FAB000 100%)" }}
                        >
                          <ShieldCheck size={30} className="text-black" strokeWidth={2.25} />
                        </div>
                        <div className="text-center">
                          <div className="text-sm font-semibold tracking-tight" style={{ color: "#FBE9E1" }}>
                            Protected
                          </div>
                          <div className="text-[11px] mt-0.5" style={{ color: "#8A8078" }}>
                            Preview coming soon
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Glow - pink/gold for Node Guardian */}
                  <div
                    className="absolute -inset-8 -z-10 rounded-full opacity-30 blur-3xl"
                    style={{
                      background: "radial-gradient(circle, rgba(255, 189, 255, 0.4) 0%, rgba(250, 176, 0, 0.15) 40%, transparent 70%)",
                    }}
                  />
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Node Guardian Details */}
      <section className="section-tight">
        <div className="container max-w-3xl">
          <div className="space-y-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="type-title text-foreground mb-4">The Problem</h3>
              <p className="type-body">
                Staying secure on a Mac usually means stitching together several apps: a VPN from one vendor, a malware scanner from another, and a grab-bag of privacy and cleanup utilities on top. Worse, many consumer VPNs quietly share one connection identity across all their users and ship without a working kill switch — so when the tunnel drops, your real traffic leaks without you ever knowing.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="type-title text-foreground mb-4">The Solution</h3>
              <p className="type-body">
                Node Guardian brings it all into one native macOS app. A built-in WireGuard VPN gives each install its own unique encryption key — generated on your Mac and never shared — with a real kill switch that blocks traffic if the tunnel drops and DNS leak protection that forces lookups through the tunnel. Alongside the VPN, it adds threat and malware scanning, quarantine, real-time monitoring, and a clear security score, so you can see exactly how protected you are.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="type-title text-foreground mb-4">Who It Helps</h3>
              <p className="type-body">
                Privacy-conscious Mac users, remote workers, frequent travelers, and anyone who regularly connects over public or untrusted Wi-Fi. Node Guardian is for people who want strong, understandable protection without becoming their own security team.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h3 className="type-title text-foreground mb-4">Why It Was Built</h3>
              <p className="type-body">
                Node Guardian was built because good Mac security shouldn't require assembling a toolkit or trusting a VPN that fails open. The goal was a single, honest app that keeps your traffic encrypted, your keys your own, and your Mac clean — with security that fails closed, the way it should.
              </p>
            </motion.div>

            {/* View Node Guardian CTA */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="pt-4"
            >
              <a
                href="/services/mv-app-design/nodeguardian"
                className="app-studio-cta"
              >
                <span className="font-medium">View App Details</span>
                <ArrowRight size={18} />
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="section-tight bg-gradient-subtle border-t border-border">
        <div className="container text-center">
          <p className="type-body max-w-xl mx-auto">
            Interested in how we approach building software? See examples of the systems we create for local businesses.
          </p>
          <motion.a
            href="/what-we-build"
            className="inline-flex items-center gap-2 mt-6 text-[hsl(var(--primary))] font-medium hover:underline"
            whileHover={{ x: 4 }}
          >
            View What We Build →
          </motion.a>
        </div>
      </section>
    </AppStudioLayout>
  );
};

export default IslandApps;
