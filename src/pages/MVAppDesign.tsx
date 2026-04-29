import { SiteLayout } from "@/components/site/SiteLayout";
import { CTASection } from "@/components/site/CTASection";
import { SEO } from "@/components/SEO";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Check, Code, Server, Users, Wrench, Building2, CalendarCheck, LayoutDashboard, Database } from "lucide-react";

const whatWeBuild = [
  "Scheduling and job management systems",
  "Service dispatch and technician tracking",
  "Customer portals and communication tools",
  "Inventory and equipment tracking",
  "Maintenance and service logs",
  "Business dashboards and reporting tools",
  "Reservation and booking systems",
  "Custom internal workflow tools",
];

const support = [
  "System setup and deployment",
  "Staff training",
  "Ongoing support and troubleshooting",
  "Software updates and improvements",
  "Security and data protection",
  "Long-term maintenance",
];

const whoThisIsFor = [
  "Contractors and service companies",
  "Property managers",
  "Hospitality and lodging businesses",
  "Retail stores",
  "Maintenance and landscaping companies",
  "Professional service firms",
  "Local organizations and nonprofits",
];

const benefits = [
  "Reduce manual work",
  "Improve communication",
  "Track jobs and tasks more easily",
  "Keep records organized",
  "Serve customers more efficiently",
  "Scale operations without losing control",
];

const integrations = [
  "QuickBooks",
  "Square",
  "Scheduling software",
  "Email and text notifications",
  "Internal databases",
  "Cloud storage",
  "Mobile devices and tablets",
];

const MVAppDesign = () => (
  <SiteLayout>
    <SEO
      title="MV App Design | Custom Software for Martha's Vineyard Businesses"
      description="Custom app development and business software for Martha's Vineyard. Scheduling systems, job management, customer portals, and automation tools built for island businesses."
      canonical="https://anythingitech.vercel.app/services/mv-app-design"
    />

    {/* Hero */}
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden">
      <div className="absolute inset-0 grid-overlay opacity-60 pointer-events-none" />
      <div className="container-editorial relative">
        <p className="eyebrow mb-6">MV App Design</p>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <h1 className="lg:col-span-8 display-xl text-balance animate-fade-up">
            Custom software built for how your business actually operates.
          </h1>
          <p className="lg:col-span-4 text-base text-muted-foreground leading-relaxed animate-fade-up-delay-1">
            We design and build practical applications that simplify operations for Martha's Vineyard businesses.
          </p>
        </div>
      </div>
    </section>

    {/* Intro */}
    <section className="py-24 md:py-32">
      <div className="container-editorial">
        <div className="max-w-3xl mx-auto space-y-6 text-[17px] leading-relaxed text-pretty">
          <p className="text-muted-foreground">
            Many Martha's Vineyard businesses rely on spreadsheets, paper schedules, text messages, and
            disconnected systems to manage daily operations. That works—until the business grows, the
            team expands, or communication becomes difficult to track.
          </p>
          <p className="text-muted-foreground">
            We design and build custom applications that simplify how your business runs. These systems
            are built specifically for your workflow, your staff, and your customers—not generic templates
            or complicated enterprise software.
          </p>
          <p className="font-medium">
            Our goal is simple: make your operations easier to manage, more organized, and more reliable.
          </p>
        </div>
      </div>
    </section>

    {/* What We Build */}
    <section className="py-24 md:py-32 bg-surface border-y border-border">
      <div className="container-editorial">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <p className="eyebrow mb-5">What We Build</p>
            <h2 className="display-md text-balance">Practical software tools for real businesses.</h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Every system is designed around your actual day-to-day operations.
            </p>
          </div>
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-border rounded-xl overflow-hidden">
              {whatWeBuild.map((item, i) => {
                const icons = [CalendarCheck, Server, Users, Database, Wrench, LayoutDashboard, CalendarCheck, Code];
                const Icon = icons[i % icons.length];
                return (
                  <div key={item} className="bg-card p-6 flex items-start gap-4">
                    <div className="mt-0.5 h-8 w-8 rounded-lg bg-accent/10 grid place-items-center shrink-0">
                      <Icon className="h-4 w-4 text-accent" strokeWidth={2} />
                    </div>
                    <p className="text-[15px] leading-relaxed">{item}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>

    {/* Local Support */}
    <section className="py-24 md:py-32">
      <div className="container-editorial grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5 lg:sticky lg:top-28 self-start">
          <p className="eyebrow mb-5">Designed Locally. Supported Locally.</p>
          <h2 className="display-md text-balance">We stay involved after launch.</h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            Unlike large software companies, we are based on Martha's Vineyard year-round. We understand
            how seasonal demand, staffing changes, and island logistics affect your business.
          </p>
          <p className="mt-4 text-muted-foreground leading-relaxed">
            When we build an application, we stay involved.
          </p>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <p className="font-medium mb-6">We provide:</p>
          <ul className="space-y-4">
            {support.map((item) => (
              <li key={item} className="flex items-start gap-4 text-[15px] leading-relaxed">
                <div className="mt-1 h-5 w-5 rounded-full bg-accent/10 grid place-items-center shrink-0">
                  <Check className="h-3 w-3 text-accent" strokeWidth={3} />
                </div>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <p className="mt-8 text-muted-foreground text-[15px] leading-relaxed border-l-2 border-accent pl-5">
            You are never left managing the system on your own.
          </p>
        </div>
      </div>
    </section>

    {/* Who This Is For */}
    <section className="py-24 md:py-32 bg-surface border-y border-border">
      <div className="container-editorial">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <p className="eyebrow mb-5">Who This Is For</p>
            <h2 className="display-md text-balance mb-8">Businesses that rely on coordination.</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              If your business relies on scheduling, coordination, communication, or tracking work,
              a custom system can save time and reduce errors.
            </p>
            <ul className="space-y-4">
              {whoThisIsFor.map((item) => (
                <li key={item} className="flex items-start gap-3 text-[15px] leading-relaxed">
                  <Building2 className="h-4 w-4 text-accent mt-1 shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-5">Why Build a Custom App?</p>
            <h2 className="display-md text-balance mb-8">A system that fits your business.</h2>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Many businesses try to piece together multiple tools that do not work well together.
              Over time, this creates confusion, duplicate work, and missed information.
            </p>
            <p className="font-medium mb-4">A custom application allows your business to:</p>
            <ul className="space-y-3">
              {benefits.map((item) => (
                <li key={item} className="flex items-center gap-3 text-[15px]">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>

    {/* Integrations */}
    <section className="py-24 md:py-32">
      <div className="container-editorial">
        <div className="max-w-2xl mb-14">
          <p className="eyebrow mb-5">Connected to Your Existing Technology</p>
          <h2 className="display-md text-balance">Works with what you already use.</h2>
          <p className="mt-5 text-muted-foreground leading-relaxed">
            We can integrate custom applications with the systems you already use.
            We focus on reliability and simplicity—not unnecessary complexity.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          {integrations.map((item) => (
            <span key={item} className="px-4 py-2 bg-secondary rounded-full text-sm">
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>

    {/* Local Development */}
    <section className="py-24 md:py-32 bg-surface border-y border-border">
      <div className="container-editorial">
        <div className="max-w-3xl mx-auto">
          <p className="eyebrow mb-5 text-center">Local Development with Real Support</p>
          <h2 className="display-md text-balance text-center mb-8">
            Part of the Anything iTech MV ecosystem.
          </h2>
          <p className="text-muted-foreground leading-relaxed text-center mb-8">
            MV App Design is part of the same technology ecosystem as Anything iTech MV. That means
            the people who build your software are the same people who can support your computers,
            network, and devices.
          </p>
          <p className="text-muted-foreground leading-relaxed text-center mb-8">
            Instead of working with a remote development company, you have a local partner who can:
          </p>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
            {[
              "Visit your business",
              "Troubleshoot in person",
              "Train your staff",
              "Maintain your system",
              "Update as you grow",
            ].map((item) => (
              <div key={item} className="p-4 bg-card rounded-xl">
                <p className="text-sm">{item}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-4">
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/services/business-it">Business IT Support <ArrowRight className="h-4 w-4" /></Link>
            </Button>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/services/wifi-network">Wi-Fi Network Services <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </div>
      </div>
    </section>

    {/* Getting Started */}
    <section className="py-24 md:py-32">
      <div className="container-editorial">
        <div className="max-w-2xl mx-auto text-center">
          <p className="eyebrow mb-5">Getting Started</p>
          <h2 className="display-md text-balance mb-6">Most projects begin with a conversation.</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            We will help you determine:
          </p>
          <ul className="space-y-2 text-muted-foreground mb-8">
            <li>Whether a custom app makes sense</li>
            <li>What the system should do</li>
            <li>How long development will take</li>
            <li>What ongoing support will look like</li>
          </ul>
          <p className="font-medium">
            No pressure and no technical jargon—just a practical plan.
          </p>
        </div>
      </div>
    </section>

    {/* CTA */}
    <CTASection
      title="Need a system that fits your business?"
      description="Contact us to discuss your workflow and explore whether a custom application could simplify your operations."
      buttonText="Start a Project"
      buttonLink="/contact"
    />
  </SiteLayout>
);

export default MVAppDesign;
