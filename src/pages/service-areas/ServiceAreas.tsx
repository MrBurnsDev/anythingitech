import { Link } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SEO } from "@/components/SEO";
import { ChevronRight, ArrowRight } from "lucide-react";

const canonical = "https://anythingitechmv.com/service-areas";

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://anythingitechmv.com/" },
    { "@type": "ListItem", position: 2, name: "Areas We Serve", item: canonical },
  ],
};

const webPageLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": canonical,
  url: canonical,
  name: "Areas We Serve",
  description:
    "Based on Martha's Vineyard, we're available for technology projects throughout Cape Cod, Nantucket, and the Elizabeth Islands.",
  isPartOf: { "@type": "WebSite", url: "https://anythingitechmv.com" },
  about: { "@type": "Thing", name: "Martha's Vineyard IT service areas" },
  provider: { "@id": "https://anythingitechmv.com/#business" },
};

const areas = [
  {
    name: "Martha's Vineyard",
    body: "Every town on the island. Most of our day-to-day work.",
  },
  {
    name: "Chappaquiddick",
    body: "Coordinated the same way as any Edgartown-side project, with a short ferry hop factored into scheduling.",
  },
  {
    name: "Cape Cod",
    body: "Available for planned projects throughout the Cape, including networking, Wi-Fi, Managed IT, security cameras, Apple support, and other technology work. Off-island visits are scheduled in advance rather than handled as same-day service calls.",
  },
  {
    name: "Nantucket",
    body: "Available for planned projects that can be coordinated around ferry travel. Remote consultation and project planning allow us to arrive prepared with the equipment needed for the work.",
  },
  {
    name: "Elizabeth Islands, including Cuttyhunk",
    body: "Available for projects where ferry or private-boat access can be coordinated. These projects require additional planning, but geography alone does not rule them out.",
  },
];

const steps = [
  {
    title: "Phone or video call.",
    body: "A short conversation to understand what you need. If the project is straightforward, this is often enough to give you a rough sense of scope.",
  },
  {
    title: "FaceTime walkthrough of the space.",
    body: "For installations, camera work, or anything involving physical layout, we do a video walkthrough of the property. This lets us plan the project without a separate scouting trip.",
  },
  {
    title: "Written proposal.",
    body: "Scope, hardware, and timing — in writing, so there are no surprises. You review it, ask questions, and decide whether to proceed.",
  },
  {
    title: "Travel and on-site installation.",
    body: "Once approved, we handle ordering, schedule the visit, travel to the site, and complete the work.",
  },
  {
    title: "Ongoing remote support.",
    // NOTE: this step deliberately links out to Managed IT — the one contextual
    // internal link in the workflow section, per the approved outline.
    body: "Many clients stay on after the install for Managed IT — proactive monitoring, updates, and support so the network keeps working long after we leave.",
    managedItLink: true,
  },
];

const faqs: { q: string; a: string }[] = [
  {
    q: "Do you travel to Cape Cod?",
    a: "Yes. We are available for planned projects throughout Cape Cod. Because we are based on Martha's Vineyard, Cape Cod visits are scheduled in advance and are generally best suited to defined projects such as network installations, Wi-Fi upgrades, camera systems, Apple support, or Managed IT onboarding.",
  },
  {
    q: "Do you work on Nantucket?",
    a: "Yes. We are available for planned projects on Nantucket. Work typically begins with a phone or video consultation, followed by a written proposal and a coordinated on-site visit when physical installation is required.",
  },
  {
    q: "Can you install Wi-Fi on Cuttyhunk?",
    a: "Yes. We can consider Wi-Fi, networking, camera, and technology projects on Cuttyhunk. The project would begin with a phone or FaceTime walkthrough so we can understand the property, determine the equipment required, and work through boat transportation and scheduling before anything is approved.",
  },
  {
    q: "Do I need to arrange transportation?",
    a: "For Cape Cod and Nantucket, we generally handle our own transportation. Elizabeth Islands projects may require coordination with the client for ferry, private-boat, or equipment access. Those logistics will be discussed and included in the proposal before the project moves forward.",
  },
  {
    q: "Can you provide remote support after installation?",
    a: "Yes. Ongoing remote support and Managed IT are often the more valuable part of a relationship — proactive monitoring, security updates, and someone to call when something isn't working.",
  },
  {
    q: "What if I'm not sure whether you're in my service area?",
    a: "Reach out. We're happy to have a short conversation and give you an honest answer about whether the project makes sense for us. We'd rather tell you honestly than have you assume we can't help.",
  },
];

const relatedServices = [
  { to: "/services/business-it", label: "Managed IT & Business IT" },
  { to: "/services/wifi-network", label: "Enterprise Wi-Fi & Networking" },
  { to: "/services/smart-home", label: "Security Cameras & Smart Home" },
  { to: "/services/apple-repair", label: "Apple Repair & Support" },
  { to: "/contact", label: "Get in touch" },
];

export default function ServiceAreas() {
  return (
    <SiteLayout>
      <SEO
        title="Areas We Serve | Martha's Vineyard IT"
        description="Based on Martha's Vineyard, we're available for technology projects throughout Cape Cod, Nantucket, and the Elizabeth Islands. Learn how off-island projects work and whether we're the right fit for yours."
        canonical={canonical}
        jsonLd={[breadcrumbLd, webPageLd]}
      />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-surface">
        <div className="container-editorial py-3">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">Areas We Serve</span>
          </nav>
        </div>
      </div>

      {/* Page header */}
      <section className="border-b border-border">
        <div className="container-editorial py-12 md:py-16">
          <p className="eyebrow mb-5">Service Area</p>
          <h1 className="display-lg text-balance mb-4 max-w-3xl">Areas We Serve</h1>
        </div>
      </section>

      {/* Where we're based */}
      <section className="border-b border-border">
        <div className="container-editorial py-12 md:py-16 max-w-3xl">
          <h2 className="font-display text-2xl md:text-3xl mb-6">Where we're based</h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Martha's Vineyard IT is headquartered on Martha's Vineyard. We've been operating from
            the island since 2008, and it's where the majority of our work happens — homes and
            businesses across all six towns, from single-visit repairs to ongoing Managed IT
            relationships that have run for years.
          </p>
        </div>
      </section>

      {/* Where we're available for projects */}
      <section className="border-b border-border bg-surface">
        <div className="container-editorial py-12 md:py-16">
          <h2 className="font-display text-2xl md:text-3xl mb-6 max-w-3xl">
            Where we're available for projects
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl mb-8">
            Martha's Vineyard is our home base, and we are also available for planned projects
            throughout Cape Cod, Nantucket, Chappaquiddick, and the Elizabeth Islands. If you're
            in a nearby community that isn't listed below, it's worth reaching out — the answer is
            often yes.
          </p>
          <ul className="space-y-6 max-w-3xl">
            {areas.map((area) => (
              <li key={area.name} className="border-l-2 border-accent/40 pl-5">
                <div className="font-medium mb-1.5">{area.name}</div>
                <p className="text-muted-foreground leading-relaxed">{area.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* How off-island projects work */}
      <section className="border-b border-border">
        <div className="container-editorial py-12 md:py-16 max-w-3xl">
          <h2 className="font-display text-2xl md:text-3xl mb-6">How off-island projects work</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            Off-island projects generally follow the same process. Knowing the steps ahead of time
            is often the biggest source of uncertainty for people considering us for a project
            outside Martha's Vineyard, so here's the honest version.
          </p>
          <ol className="space-y-6">
            {steps.map((step, i) => (
              <li key={step.title} className="flex gap-4">
                <span className="font-display text-xs tracking-[0.3em] text-muted-foreground tabular-nums pt-1.5 w-6 flex-shrink-0">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className="font-medium mb-1.5">{step.title}</div>
                  <p className="text-muted-foreground leading-relaxed">
                    {step.managedItLink ? (
                      <>
                        Many clients stay on after the install for{" "}
                        <Link to="/services/business-it" className="link-underline text-foreground">
                          Managed IT
                        </Link>{" "}
                        — proactive monitoring, updates, and support so the network keeps working
                        long after we leave.
                      </>
                    ) : (
                      step.body
                    )}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <p className="mt-8 text-muted-foreground leading-relaxed">
            Some projects don't need a site visit at all. Software configuration, remote
            troubleshooting, and Managed IT support are often handled entirely without travel.
            When that's the case, we'll say so.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-b border-border bg-surface">
        <div className="container-editorial py-12 md:py-16 max-w-3xl">
          <h2 className="font-display text-2xl md:text-3xl mb-6">Frequently asked questions</h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-8">
            These are some of the questions we're most often asked by customers considering an
            off-island project.
          </p>
          <div className="space-y-8">
            {faqs.map((faq) => (
              <div key={faq.q}>
                <p className="font-medium mb-2">{faq.q}</p>
                <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-b border-border">
        <div className="container-editorial py-12 md:py-16 max-w-3xl">
          <h2 className="font-display text-2xl md:text-3xl mb-4">
            Not sure whether your project falls within our service area?
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed mb-6">
            Reach out. We're always happy to have a conversation and let you know what's possible.
          </p>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 text-[15px] font-medium link-underline text-foreground"
          >
            Get in touch <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* How We Can Help */}
      <section>
        <div className="container-editorial py-12 md:py-16">
          <h2 className="font-display text-2xl md:text-3xl mb-6 max-w-3xl">How We Can Help</h2>
          <ul className="flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
            {relatedServices.map((s) => (
              <li key={s.to}>
                <Link to={s.to} className="link-underline text-foreground hover:text-foreground">
                  {s.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </SiteLayout>
  );
}
