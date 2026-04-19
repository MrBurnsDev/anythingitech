import { SiteLayout } from "@/components/site/SiteLayout";
import { PageHeader } from "@/components/site/PageHeader";
import { CTASection } from "@/components/site/CTASection";
import { Link } from "react-router-dom";
import { ArrowUpRight, Apple, Wifi, Home, Music, Tv, Building2, Printer, MonitorSmartphone, ShieldCheck } from "lucide-react";
import appleImg from "@/assets/apple-desk.jpg";

const all = [
  { icon: Apple, title: "Apple Repair & Support", description: "Mac troubleshooting, screen and battery service, macOS optimization, data migrations, and proactive device care.", to: "/apple-repair" },
  { icon: Wifi, title: "Wi-Fi & Network Installation", description: "Designed wireless networks, mesh and access-point systems, structured cabling, and business-grade reliability.", to: "/wifi-network" },
  { icon: Home, title: "Smart Home Setup", description: "Lighting, climate, shades, locks, cameras, and unified control — quietly integrated into your home.", to: "/smart-home" },
  { icon: Music, title: "Sonos & Whole-Home Audio", description: "Sonos installation, troubleshooting, and architectural audio that disappears into the room.", to: "/smart-home" },
  { icon: Tv, title: "TV Mounting & Media", description: "Concealed wiring, perfectly level mounts, soundbars, AV receivers, and fully calibrated picture.", to: "/tv-audio" },
  { icon: Building2, title: "Business IT Support", description: "Networks, workstations, printers, file sharing, and ongoing managed IT for island businesses.", to: "/business-it" },
  { icon: Printer, title: "Printer & Device Setup", description: "Wireless printers, scanners, peripherals — set up properly and connected reliably to every device.", to: "/services" },
  { icon: MonitorSmartphone, title: "Home Office Optimization", description: "Beautiful, productive home offices with reliable Wi-Fi, video conferencing, and Apple ecosystem tuning.", to: "/services" },
  { icon: ShieldCheck, title: "General IT & On-Site Help", description: "On-call island technician for the small things and the urgent things, from passwords to outages.", to: "/services" },
];

const Services = () => {
  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Services"
        title="Comprehensive technology service, considered in every detail."
        description="Residential and business technology — from a single device to a fully integrated home or office. One trusted local team, available year-round."
        image={appleImg}
      />

      <section className="py-24 md:py-32">
        <div className="container-editorial">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {all.map((s, i) => (
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
                  Learn more <ArrowUpRight className="h-4 w-4 transition-transform duration-500 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTASection title="Not sure which services you need?" description="We're happy to walk through your home or business and recommend the right approach. No obligation." />
    </SiteLayout>
  );
};

export default Services;
