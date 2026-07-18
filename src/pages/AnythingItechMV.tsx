import { SiteLayout } from "@/components/site/SiteLayout";
import { CTASection } from "@/components/site/CTASection";
import { SEO } from "@/components/SEO";
import { ShieldCheck, Activity, Wrench, CalendarClock, HardDrive, Lock } from "lucide-react";

const managed = [
  { icon: Activity, title: "Proactive monitoring", body: "We keep an eye on your systems continuously, so small issues are caught before they become downtime." },
  { icon: Wrench, title: "Preventative maintenance", body: "Regular tune-ups and health checks keep computers, networks, and devices running the way they should." },
  { icon: HardDrive, title: "Updates & device health", body: "Operating system and software updates, plus device-health monitoring, handled quietly in the background." },
  { icon: Lock, title: "Cybersecurity & antivirus", body: "Antivirus management, security updates, and sensible protections that keep your data and network safe." },
  { icon: ShieldCheck, title: "Business continuity", body: "Backups and recovery planning so a failure or mishap never means losing what matters." },
  { icon: CalendarClock, title: "Long-term planning", body: "Thoughtful, year-round guidance so your technology keeps pace with how you actually live and work." },
];

const AnythingItechMV = () => (
  <SiteLayout>
    <SEO
      title="Anything iTech MV is now Martha's Vineyard IT"
      description="Anything iTech MV has grown into Martha's Vineyard IT — the same local team, now offering managed IT, networking, cybersecurity, enterprise Wi-Fi, security cameras, and technology consulting alongside the computer repair we've always done."
      canonical="https://anythingitechmv.com/anything-itech-mv"
    />

    {/* Hero */}
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden border-b border-border">
      <div className="absolute inset-0 grid-overlay opacity-60 pointer-events-none" />
      <div className="container-editorial relative">
        <p className="eyebrow mb-6">A new name for the same trusted team</p>
        <h1 className="display-xl text-balance max-w-4xl animate-fade-up">
          Anything iTech MV is now
          <br />
          <span className="italic font-normal">Martha's Vineyard IT.</span>
        </h1>
        <p className="mt-7 text-lg text-muted-foreground max-w-2xl leading-relaxed text-pretty animate-fade-up-delay-1">
          Same people. Same values. Same commitment to exceptional local service — under a name
          that better reflects everything we do today.
        </p>
      </div>
    </section>

    {/* The story */}
    <section className="py-24 md:py-32">
      <div className="container-editorial grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-4">
          <p className="eyebrow mb-5">Why the change</p>
          <h2 className="display-lg text-balance">The work grew. The name grew with it.</h2>
        </div>
        <div className="lg:col-span-7 lg:col-start-6 space-y-6 text-[17px] leading-relaxed text-pretty text-muted-foreground">
          <p>
            For many years, we've proudly served Martha's Vineyard businesses, year-round residents,
            and seasonal homeowners — first as Anything Apple, then as Anything iTech MV. Along the
            way, we became known as the local team you could call when technology got in the way.
          </p>
          <p>
            Over time, that work naturally expanded well beyond computer repair. Today we design and
            install networks and enterprise Wi-Fi, set up security cameras and structured cabling,
            handle cybersecurity, provide technology consulting, and — increasingly — manage and
            maintain technology for our clients year-round through managed IT services.
          </p>
          <p>
            The name <strong className="text-foreground font-medium">Martha's Vineyard IT</strong>{" "}
            simply reflects that broader mission. It's the natural next step for a business that has
            been growing alongside the Island for well over a decade.
          </p>
        </div>
      </div>
    </section>

    {/* What managed IT means */}
    <section className="py-24 md:py-32 bg-surface border-y border-border">
      <div className="container-editorial">
        <div className="max-w-3xl mb-16">
          <p className="eyebrow mb-5">In plain English</p>
          <h2 className="display-lg text-balance">What "Managed IT" actually means.</h2>
          <p className="mt-6 text-[17px] leading-relaxed text-pretty text-muted-foreground">
            Rather than simply fixing technology after something breaks, we now help clients
            proactively manage and maintain it. Instead of waiting for the call, we watch over your
            systems, keep them healthy and secure, and plan ahead — so problems are prevented, not
            just repaired.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden">
          {managed.map((m) => (
            <div key={m.title} className="bg-card p-8 min-h-[220px] flex flex-col gap-5">
              <m.icon className="h-6 w-6 text-accent" strokeWidth={1.5} />
              <div>
                <h3 className="font-display text-xl mb-2">{m.title}</h3>
                <p className="text-muted-foreground text-[15px] leading-relaxed">{m.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Who it's for */}
    <section className="py-24 md:py-32">
      <div className="container-editorial grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-xl border border-border bg-card p-9 md:p-10">
          <p className="eyebrow mb-4">For businesses</p>
          <h3 className="display-md text-balance mb-4">Less downtime. More peace of mind.</h3>
          <p className="text-muted-foreground leading-relaxed text-pretty">
            Managed IT keeps your team working. Continuous monitoring, preventative maintenance, and
            security mean fewer interruptions, faster help when you need it, and technology that
            supports the business instead of getting in its way.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-9 md:p-10">
          <p className="eyebrow mb-4">For homeowners</p>
          <h3 className="display-md text-balance mb-4">Confidence, year-round.</h3>
          <p className="text-muted-foreground leading-relaxed text-pretty">
            For year-round and seasonal homes alike, ongoing management means your Wi-Fi, smart
            home, and devices are looked after even when you're away — so everything simply works
            when you walk in the door.
          </p>
        </div>
      </div>
    </section>

    {/* Reassurance */}
    <section className="py-24 md:py-32 bg-surface border-t border-border">
      <div className="container-editorial">
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <p className="eyebrow justify-center">The same company you've trusted</p>
          <h2 className="display-lg text-balance">Only the name has changed.</h2>
          <p className="text-[17px] leading-relaxed text-pretty text-muted-foreground">
            The people, the values, and the commitment to personal, local, white-glove service are
            exactly the same. Whether you've called us for a cracked iPhone screen or a whole-home
            network, you'll reach the same team — now as Martha's Vineyard IT.
          </p>
        </div>
      </div>
    </section>

    <CTASection
      title="Same team. New name."
      description="Have a question about the change, or a project in mind? We'd love to hear from you."
    />
  </SiteLayout>
);

export default AnythingItechMV;
