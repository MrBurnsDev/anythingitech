import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { SiteLayout } from "@/components/site/SiteLayout";
import { CTASection } from "@/components/site/CTASection";
import { SEO } from "@/components/SEO";
import {
  ArrowRight, ArrowUpRight, Apple, Wifi, Home as HomeIcon, Music, Tv, Building2,
  Compass, ClipboardCheck, Wrench, LifeBuoy, Quote, MapPin,
} from "lucide-react";

import heroImg from "@/assets/hero-living-room.jpg";
import networkImg from "@/assets/network-rack.jpg";
import appleImg from "@/assets/apple-desk.jpg";
import sonosImg from "@/assets/sonos-shelf.jpg";
import vineyardImg from "@/assets/marthas-vineyard.jpg";
import officeImg from "@/assets/business-office.jpg";

const services = [
  { icon: Building2, title: "Business IT Support", description: "Office networks, workstations, printers, server maintenance, and ongoing IT support.", to: "/services/business-it" },
  { icon: Wifi, title: "Wi-Fi & Network Installation", description: "Ubiquiti enterprise equipment, full-coverage wireless, structured cabling, network troubleshooting.", to: "/services/wifi-network" },
  { icon: HomeIcon, title: "Smart Home Setup", description: "Lighting, climate, locks, cameras, and smart device integration for your home.", to: "/services/smart-home" },
  { icon: Apple, title: "Apple Repair & Support", description: "iPhone screen repair, Mac troubleshooting, system cleanup, data migration, Time Machine backup setup.", to: "/services/apple-repair" },
  { icon: Music, title: "Sonos & Audio", description: "Sonos installation, whole-home audio setup, speaker troubleshooting and configuration.", to: "/services/smart-home" },
  { icon: Tv, title: "TV Mounting & Setup", description: "TV wall mounting, concealed wiring, soundbar setup, streaming device configuration.", to: "/services/tv-audio" },
];

const process = [
  { n: "01", icon: Compass, title: "Assess", body: "We listen, look at your setup, and understand what you need fixed or installed." },
  { n: "02", icon: ClipboardCheck, title: "Recommend", body: "A clear plan with transparent pricing. We recommend what works, not what's most expensive." },
  { n: "03", icon: Wrench, title: "Install / Repair", body: "On-site service, done right the first time. We come to you by appointment." },
  { n: "04", icon: LifeBuoy, title: "Support", body: "We stay available year-round. Call or email when you need help." },
];

const testimonials = [
  { quote: "Discreet, prompt, and meticulous. Our Wi-Fi reaches every room of the house — even the boathouse.", name: "Caroline H.", location: "Edgartown · Homeowner" },
  { quote: "They built our office network from scratch and we haven't had a single hiccup since. A real relief.", name: "Marcus L.", location: "Vineyard Haven · Founder" },
  { quote: "Finally, someone who treats Apple support like the craft it is. Fast, kind, and clearly knowledgeable.", name: "Diana R.", location: "Chilmark · Homeowner" },
];

const Index = () => {
  return (
    <SiteLayout>
      <SEO
        title="Martha's Vineyard IT | Martha's Vineyard Tech Support & Managed IT"
        description="Managed IT, enterprise Wi-Fi, network installation, security, smart home, and Apple support on Martha's Vineyard. Local service since 2008 — formerly Anything iTech MV."
        canonical="https://anythingitechmv.com/"
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "LocalBusiness",
          "@id": "https://anythingitechmv.com/#business",
          name: "Martha's Vineyard IT",
          alternateName: "Anything iTech MV",
          description:
            "Boutique technology services on Martha's Vineyard for homes and businesses — computer repair, Wi-Fi and network design, smart home, security cameras, cybersecurity, and managed IT services.",
          url: "https://anythingitechmv.com/",
          telephone: "+1-508-560-3510",
          foundingDate: "2008",
          image: "https://anythingitechmv.com/og-image.jpg",
          areaServed: [
            { "@type": "Place", name: "Martha's Vineyard, Massachusetts" },
            { "@type": "Place", name: "Cape Cod, Massachusetts" },
            { "@type": "Place", name: "Nantucket, Massachusetts" },
            { "@type": "Place", name: "Elizabeth Islands, Massachusetts" },
          ],
          address: {
            "@type": "PostalAddress",
            addressLocality: "Martha's Vineyard",
            addressRegion: "MA",
            addressCountry: "US",
          },
        }}
      />
      {/* HERO */}
      <section className="relative min-h-[100svh] flex items-end overflow-hidden">
        <img src={heroImg} alt="Modern Martha's Vineyard living room" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute inset-0 grid-overlay-dark opacity-30" />

        <div className="container-editorial relative pb-20 md:pb-28 pt-32 text-primary-foreground">
          <p className="eyebrow text-primary-foreground/70 mb-6 animate-fade-up">
            <span className="text-primary-foreground/70">Martha's Vineyard · Est. on the island</span>
          </p>
          <h1 className="display-xl text-balance max-w-5xl animate-fade-up-delay-1">
            We make your emergency, ours.<br />
            <span className="italic font-normal">Technology service</span> for Martha's Vineyard.
          </h1>
          <p className="mt-7 text-lg md:text-xl text-primary-foreground/80 max-w-2xl leading-relaxed text-pretty animate-fade-up-delay-2">
            Based on Martha's Vineyard, we provide enterprise networking, Managed IT, Apple
            support, and technology services for homes and businesses throughout Martha's
            Vineyard, Cape Cod, Nantucket, and the Elizabeth Islands.
          </p>
          <p className="mt-3 text-lg md:text-xl text-primary-foreground/80 max-w-2xl leading-relaxed text-pretty animate-fade-up-delay-2">
            By appointment.
          </p>
          <div className="mt-10 flex flex-wrap gap-3 animate-fade-up-delay-3">
            <Button asChild size="xl" variant="hero" className="rounded-full">
              <Link to="/contact">Request a Visit <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild size="xl" variant="hero-outline" className="rounded-full">
              <Link to="/services">Explore Services</Link>
            </Button>
          </div>

          {/* Stats strip */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px bg-primary-foreground/15 border border-primary-foreground/15 rounded-xl overflow-hidden backdrop-blur-sm animate-fade-up-delay-3">
            {[
              { k: "Since 2008", v: "On the island" },
              { k: "Thousands", v: "Of devices serviced" },
              { k: "Hundreds", v: "Of networks installed" },
              { k: "(508) 560-3510", v: "By appointment" },
            ].map((s) => (
              <div key={s.v} className="bg-primary/60 px-6 py-7">
                <div className="font-display text-3xl md:text-4xl font-light">{s.k}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-primary-foreground/60">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* INTRO / VALUE */}
      <section className="py-24 md:py-32 border-b border-border">
        <div className="container-editorial grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <p className="eyebrow mb-5">Using technology shouldn't be a struggle</p>
            <h2 className="display-lg text-balance">Local tech support, year-round.</h2>
          </div>
          <div className="lg:col-span-7 lg:col-start-6 self-end">
            <p className="text-lg leading-relaxed text-pretty text-muted-foreground">
              Proactive managed IT, enterprise Wi-Fi and network installation, security systems,
              smart home, and Apple support. A boutique service for homes and businesses alike —
              we come to you, work by appointment, and stay available year-round. No call centers,
              no waiting weeks for off-island service.
            </p>
            <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4 text-sm">
              {["Apple Certified Technician", "By Appointment", "On-Site Service", "Year-Round Availability"].map((t) => (
                <div key={t} className="flex items-center gap-2.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  <span>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES GRID */}
      <section className="py-24 md:py-32 bg-surface">
        <div className="container-editorial">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <p className="eyebrow mb-5">Services</p>
              <h2 className="display-lg text-balance">What we do.</h2>
            </div>
            <Link to="/services" className="link-underline text-sm font-medium inline-flex items-center gap-1.5">
              View all services <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {services.map((s, i) => (
              <Link to={s.to} key={s.title} className="group card-service p-8 flex flex-col min-h-[260px]">
                <div className="flex items-center justify-between mb-10">
                  <div className="h-11 w-11 rounded-md bg-secondary grid place-items-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-500">
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.22em] text-muted-foreground tabular-nums">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="font-display text-2xl mb-2.5">{s.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-[15px]">{s.description}</p>
                <div className="mt-auto pt-6 flex items-center gap-1.5 text-sm font-medium">
                  Learn more
                  <ArrowRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED — RESIDENTIAL + BUSINESS SPLIT */}
      <section className="py-24 md:py-32 border-y border-border">
        <div className="container-editorial">
          <div className="max-w-2xl mb-16">
            <p className="eyebrow mb-5">Who we serve</p>
            <h2 className="display-lg text-balance">Two clienteles. One standard.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-secondary">
              <img src={heroImg} alt="Residential" className="absolute inset-0 h-full w-full object-cover transition-transform [transition-duration:1200ms] group-hover:scale-[1.04]" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/30 to-transparent" />
              <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end text-primary-foreground">
                <p className="eyebrow text-primary-foreground/60 mb-4">
                  <span className="text-primary-foreground/60">For Homeowners</span>
                </p>
                <h3 className="display-md text-balance mb-3">Residential Technology</h3>
                <p className="text-primary-foreground/80 text-pretty leading-relaxed max-w-md mb-6">
                  Discreet, dependable help for the connected home — Wi-Fi that reaches every corner,
                  smart systems that simply work, and Apple support whenever you need it.
                </p>
                <Link to="/services" className="inline-flex items-center gap-2 link-underline text-sm font-medium w-fit">
                  Residential services <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="group relative aspect-[4/5] overflow-hidden rounded-xl bg-secondary">
              <img src={officeImg} alt="Business" className="absolute inset-0 h-full w-full object-cover transition-transform [transition-duration:1200ms] group-hover:scale-[1.04]" loading="lazy" />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/95 via-primary/30 to-transparent" />
              <div className="absolute inset-0 p-8 md:p-10 flex flex-col justify-end text-primary-foreground">
                <p className="eyebrow text-primary-foreground/60 mb-4">
                  <span className="text-primary-foreground/60">For Business</span>
                </p>
                <h3 className="display-md text-balance mb-3">Business IT Support</h3>
                <p className="text-primary-foreground/80 text-pretty leading-relaxed max-w-md mb-6">
                  Networks, workstations, printers, and the proactive IT care your team needs to focus
                  on the work — not the technology.
                </p>
                <Link to="/services/business-it" className="inline-flex items-center gap-2 link-underline text-sm font-medium w-fit">
                  Business services <ArrowUpRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MANAGED IT EXPLAINER */}
      <section className="py-24 md:py-32 border-b border-border">
        <div className="container-editorial grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <p className="eyebrow mb-5">Managed IT, in plain English</p>
            <h2 className="display-lg text-balance">Proactive technology support.</h2>
          </div>
          <div className="lg:col-span-7 lg:col-start-6 self-end">
            <p className="text-lg leading-relaxed text-pretty text-muted-foreground">
              Managed IT is the difference between waiting for something to break and having
              someone quietly making sure it doesn't. For our business clients, that means
              we watch over your computers, keep software and security up to date, back things up,
              and step in — often before anyone notices — when something needs attention. The goal
              isn't more technology. It's less friction: fewer outages, fewer surprise repair
              bills, and the confidence that someone who knows your setup is looking after it
              year-round.
            </p>
            <p className="mt-6 text-[15px] leading-relaxed text-pretty text-muted-foreground/85">
              Managed IT is primarily a service for businesses. For homes across the island, we
              continue to handle Wi-Fi and networking, Apple support, smart home systems, security
              cameras, audio/video, and technology consulting the same way we always have —
              thoughtfully, on-site, by appointment.
            </p>
          </div>
        </div>
      </section>

      {/* PROCESS */}
      <section className="py-24 md:py-32 bg-surface">
        <div className="container-editorial">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
            <div className="lg:col-span-5">
              <p className="eyebrow mb-5">How we work</p>
              <h2 className="display-lg text-balance">How we work.</h2>
            </div>
            <p className="lg:col-span-6 lg:col-start-7 self-end text-muted-foreground leading-relaxed text-pretty text-[17px]">
              Every project — from ongoing Managed IT support and business technology to
              whole-home networking, Apple support, and smart home installations — follows the
              same straightforward process, so you always know what to expect.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden">
            {process.map((p) => (
              <div key={p.n} className="bg-card p-8 lg:p-10 flex flex-col gap-6 min-h-[280px]">
                <div className="flex items-center justify-between">
                  <span className="font-display text-xs tracking-[0.3em] text-muted-foreground tabular-nums">{p.n}</span>
                  <p.icon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-display text-2xl mb-2">{p.title}</h3>
                  <p className="text-muted-foreground leading-relaxed text-[15px]">{p.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 md:py-32 border-y border-border">
        <div className="container-editorial">
          <div className="max-w-2xl mb-16">
            <p className="eyebrow mb-5">What clients say</p>
            <h2 className="display-lg text-balance">Trusted across the island.</h2>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <figure key={t.name} className="relative bg-card border border-border rounded-xl p-9 flex flex-col">
                <Quote className="h-7 w-7 text-accent mb-7" strokeWidth={1.25} />
                <blockquote className="font-display text-xl leading-snug text-balance text-pretty flex-1">
                  "{t.quote}"
                </blockquote>
                <figcaption className="mt-8 pt-6 border-t border-border">
                  <div className="text-sm font-medium">{t.name}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{t.location}</div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* LOCAL POSITIONING */}
      <section className="relative overflow-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-2">
          <div className="relative min-h-[400px] lg:min-h-[640px]">
            <img src={vineyardImg} alt="Martha's Vineyard coast" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
          </div>
          <div className="bg-primary text-primary-foreground p-12 md:p-20 flex flex-col justify-center relative">
            <div className="absolute inset-0 grid-overlay-dark opacity-30 pointer-events-none" />
            <div className="relative">
              <p className="eyebrow text-primary-foreground/60 mb-5">
                <span className="text-primary-foreground/60"><MapPin className="h-3 w-3 inline -mt-0.5 mr-1" />Martha's Vineyard</span>
              </p>
              <h2 className="display-lg text-balance">Local. Year-round.<br /><span className="italic font-normal">Always reachable.</span></h2>
              <p className="mt-7 text-primary-foreground/80 text-lg leading-relaxed max-w-md text-pretty">
                We live and work on the island. From Aquinnah to Edgartown, our service is steady
                through summer crowds and quiet winters alike — without the wait of off-island vendors.
              </p>
              <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-3 text-sm text-primary-foreground/85 max-w-md">
                {["Edgartown", "Vineyard Haven", "Oak Bluffs", "West Tisbury", "Chilmark", "Aquinnah"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="h-1 w-3 bg-accent" /> {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <CTASection />
    </SiteLayout>
  );
};

export default Index;
