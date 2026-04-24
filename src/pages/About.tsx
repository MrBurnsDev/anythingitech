import { SiteLayout } from "@/components/site/SiteLayout";
import { CTASection } from "@/components/site/CTASection";
import vineyardImg from "@/assets/marthas-vineyard.jpg";
import sonosImg from "@/assets/sonos-shelf.jpg";
import { Award, Compass, Heart, Users } from "lucide-react";

const values = [
  { icon: Heart, title: "Care", body: "We treat every home and business with the respect we'd want for our own." },
  { icon: Award, title: "Craft", body: "Clean cabling, level mounts, and tuned systems — the details matter." },
  { icon: Compass, title: "Clarity", body: "Plain language, transparent pricing, no jargon, no surprises." },
  { icon: Users, title: "Community", body: "We live here. Our reputation is the same year-round, summer or off-season." },
];

const About = () => (
  <SiteLayout>
    {/* Hero */}
    <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden border-b border-border">
      <div className="absolute inset-0 grid-overlay opacity-60 pointer-events-none" />
      <div className="container-editorial relative">
        <p className="eyebrow mb-6">About</p>
        <h1 className="display-xl text-balance max-w-4xl animate-fade-up">
          Local tech support<br />
          <span className="italic font-normal">since 2008.</span>
        </h1>
      </div>
    </section>

    {/* Story */}
    <section className="py-24 md:py-32">
      <div className="container-editorial grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5">
          <div className="aspect-[4/5] rounded-xl overflow-hidden bg-secondary sticky top-28">
            <img src={vineyardImg} alt="Martha's Vineyard" className="h-full w-full object-cover" loading="lazy" />
          </div>
        </div>
        <div className="lg:col-span-6 lg:col-start-7 space-y-6 text-[17px] leading-relaxed text-pretty">
          <p className="eyebrow">Our story</p>
          <h2 className="display-lg text-balance">Martha's Vineyard technology service since 2008.</h2>
          <p className="text-muted-foreground">
            Anything Itech MV was started in 2008 by Louis Hall, after 7 years doing in-home
            Apple support and repair for a national company. Louis earned his Apple Certified
            Macintosh Technician (ACMT) certification in 2012 and has serviced corporate clients
            with over 200 iOS devices.
          </p>
          <p className="text-muted-foreground">
            What started as "Anything Apple" expanded to "Anything Itech MV" in 2017 to cover
            all technology services — including Wi-Fi network installation, smart home setup,
            TV mounting, and business IT support across Martha's Vineyard.
          </p>
          <p className="text-muted-foreground">
            Today we serve homeowners and businesses across all six island towns, year-round.
            Service is by appointment. Call (508) 560-3510 or email louis@anythingitechmv.com.
          </p>
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="py-24 md:py-32 bg-surface border-y border-border">
      <div className="container-editorial">
        <div className="max-w-2xl mb-16">
          <p className="eyebrow mb-5">Our values</p>
          <h2 className="display-lg text-balance">Four principles. Every project.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden">
          {values.map((v) => (
            <div key={v.title} className="bg-card p-9 min-h-[240px] flex flex-col gap-5">
              <v.icon className="h-6 w-6 text-accent" strokeWidth={1.5} />
              <div>
                <h3 className="font-display text-xl mb-2">{v.title}</h3>
                <p className="text-muted-foreground text-[15px] leading-relaxed">{v.body}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Numbers */}
    <section className="py-24 md:py-32">
      <div className="container-editorial grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
        <div className="lg:col-span-5">
          <p className="eyebrow mb-5">By the numbers</p>
          <h2 className="display-lg text-balance">Trusted across the island.</h2>
        </div>
        <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-4 gap-px bg-border rounded-xl overflow-hidden">
          {[
            { k: "Since 2008", v: "On the island" },
            { k: "1,400+", v: "Devices" },
            { k: "350+", v: "Networks" },
            { k: "98%", v: "Repeat clients" },
          ].map((s) => (
            <div key={s.v} className="bg-card p-7">
              <div className="font-display text-3xl md:text-4xl font-light">{s.k}</div>
              <div className="mt-1.5 text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{s.v}</div>
            </div>
          ))}
        </div>
      </div>
    </section>

    <CTASection title="We'd love to meet you." description="Whether it's a quick repair or a long-term partnership, every relationship begins with a conversation." />
  </SiteLayout>
);

export default About;
