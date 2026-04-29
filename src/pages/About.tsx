import { SiteLayout } from "@/components/site/SiteLayout";
import { CTASection } from "@/components/site/CTASection";
import vineyardImg from "@/assets/marthas-vineyard.jpg";
import { Award, Compass, Heart, Users } from "lucide-react";

const values = [
  { icon: Heart, title: "Care", body: "We treat every home and business with the respect we'd want for our own." },
  { icon: Award, title: "Craft", body: "Clean cabling, level mounts, and tuned systems — the details matter." },
  { icon: Compass, title: "Clarity", body: "Plain language, transparent pricing, no jargon, no surprises." },
  { icon: Users, title: "Community", body: "We live here. Our reputation is the same year-round, summer or off-season." },
];

const services = [
  "Apple and PC repair and support",
  "iPhone screen repair",
  "Wi-Fi network installation and troubleshooting",
  "Smart home setup and configuration",
  "TV mounting and audio/video installation",
  "Small business IT support and maintenance",
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

    {/* Our Story */}
    <section className="py-24 md:py-32">
      <div className="container-editorial grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5">
          <div className="aspect-[4/5] rounded-xl overflow-hidden bg-secondary sticky top-28">
            <img src={vineyardImg} alt="Martha's Vineyard" className="h-full w-full object-cover" loading="lazy" />
          </div>
        </div>
        <div className="lg:col-span-6 lg:col-start-7 space-y-6 text-[17px] leading-relaxed text-pretty">
          <p className="eyebrow">Our Story</p>
          <h2 className="display-lg text-balance">From after-school repairs to full-service tech support.</h2>
          <p className="text-muted-foreground">
            Anything iTech Martha's Vineyard began in 2008, originally as Anything Apple Martha's Vineyard,
            when Louis Hall first began his teaching career on the Island. At the time, teaching salaries
            were modest, so Louis put his technical skills to work after school hours and on weekends,
            helping friends, family, and neighbors with their computers and technology.
          </p>
          <p className="text-muted-foreground">
            As word spread and trust grew within the community, demand for reliable, local technology
            support increased. Those early clients became the foundation of the business, and their
            continued support remains at the heart of everything we do today.
          </p>
          <p className="text-muted-foreground">
            In 2012, Louis earned his Apple Certified Macintosh Technician (ACMT) certification, one
            of the highest levels of technical certification in the Apple ecosystem. This formal
            training strengthened the company's ability to deliver professional, dependable service
            to both residential and business clients.
          </p>
          <p className="text-muted-foreground">
            In 2017, the business transitioned from Anything Apple Martha's Vineyard to Anything iTech
            Martha's Vineyard. While the name changed, the mission stayed the same: provide honest,
            responsive, local technology support for the Vineyard community.
          </p>
        </div>
      </div>
    </section>

    {/* How Technology Has Changed */}
    <section className="py-24 md:py-32 bg-surface border-y border-border">
      <div className="container-editorial">
        <div className="max-w-3xl mx-auto space-y-6 text-[17px] leading-relaxed text-pretty">
          <p className="eyebrow">How Technology Has Changed</p>
          <h2 className="display-lg text-balance">Evolving with the times.</h2>
          <p className="text-muted-foreground">
            When the business first started, the technology landscape looked very different. There were
            no iPhones, no iPads, and no Apple Watches. Most service calls involved repairing desktop
            computers, replacing hard drives, fixing printers, managing home networks, and troubleshooting
            software issues.
          </p>
          <p className="text-muted-foreground">
            Over time, technology evolved, and so did the needs of our clients. Smartphones, wireless
            networks, smart home devices, and streaming systems became essential parts of daily life.
            At the same time, modern devices became more complex and less serviceable than earlier models.
          </p>
          <p className="text-muted-foreground">
            We have worked continuously to stay current with new technologies while maintaining the
            same hands-on, practical approach that defined the business from the beginning.
          </p>
        </div>
      </div>
    </section>

    {/* Values */}
    <section className="py-24 md:py-32">
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

    {/* Today */}
    <section className="py-24 md:py-32 bg-surface border-y border-border">
      <div className="container-editorial">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-5">Today</p>
            <h2 className="display-lg text-balance">Serving all six towns on Martha's Vineyard.</h2>
          </div>
          <div className="lg:col-span-6 lg:col-start-7 space-y-6 text-[17px] leading-relaxed text-pretty">
            <p className="text-muted-foreground">
              Today, Anything iTech Martha's Vineyard provides technology support and repair services
              for homeowners and businesses across all six towns on Martha's Vineyard.
            </p>
            <p className="text-muted-foreground font-medium">Our services include:</p>
            <ul className="space-y-2 text-muted-foreground">
              {services.map((service) => (
                <li key={service} className="flex items-start gap-2">
                  <span className="text-accent mt-1.5">•</span>
                  {service}
                </li>
              ))}
            </ul>
            <p className="text-muted-foreground">
              We are a local, appointment-based service. This allows us to provide focused, reliable
              support while minimizing downtime for our clients.
            </p>
            <p className="text-muted-foreground font-medium">
              Service is by appointment only. Please call or text to schedule a time.
            </p>
          </div>
        </div>
      </div>
    </section>

    <CTASection title="We'd love to meet you." description="Whether it's a quick repair or a long-term partnership, every relationship begins with a conversation." />
  </SiteLayout>
);

export default About;
