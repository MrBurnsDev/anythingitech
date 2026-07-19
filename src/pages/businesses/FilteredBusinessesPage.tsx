import { useMemo } from "react";
import { Link } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SEO } from "@/components/SEO";
import { BusinessList } from "@/components/directory/BusinessList";
import { useBusinesses } from "@/hooks/useBusinesses";
import type { Business, MembershipSource } from "@/data/directory";
import { ChevronRight } from "lucide-react";

/**
 * Filter definition for the SEO-targeted landing pages at /businesses/*.
 *
 * Each filter is a (a) test function over the Business model, (b) page metadata
 * (title, description, intro copy), and (c) canonical URL. Adding a new filter
 * is a single entry in `FILTERS` — the route, sitemap, and page all derive
 * from this map.
 *
 * IMPORTANT: SEO copy uses neutral wording. We say "Listed in …", never
 * "Certified by" or "Endorsed by". See spec doc for the full language rules.
 */
export interface FilterConfig {
  slug: string;
  title: string;
  h1: string;
  metaDescription: string;
  intro: string;
  match: (b: Business) => boolean;
  emptyMessage: string;
  // SEO body content describing what this filter means.
  about: string;
  /** Optional expanded editorial copy. Rendered as sequential <p> elements
   *  under an "About this directory" H2, below the intro/about lines. */
  bodyParagraphs?: string[];
  /** Optional FAQ entries. Rendered as visible <details>/<summary>
   *  disclosures under an H2, and emitted as FAQPage JSON-LD. */
  faqs?: Array<{ q: string; a: string }>;
  /** Optional related-service links. Rendered as an inline list under an H2. */
  relatedServices?: Array<{ to: string; label: string }>;
  /** When true, apply `noindex, follow` while the filtered result count is
   *  zero. Once results exist, the page returns to a normal indexable state
   *  automatically. Canonical URL is unaffected. */
  noindexWhileEmpty?: boolean;
  /** Optional replacement empty-state message. Rendered in place of the
   *  default zero-result explanation when `filtered.length === 0`. */
  emptyStateBody?: string;
}

const url = (slug: string) => `https://anythingitechmv.com/businesses/${slug}`;

const hasMembership = (b: Business, source: MembershipSource): boolean =>
  Boolean(b.memberships?.[source]?.listed);

export const FILTERS: Record<string, FilterConfig> = {
  verified: {
    slug: "verified",
    title: "Verified Local Businesses on Martha's Vineyard",
    h1: "Verified Local Businesses",
    metaDescription:
      "Martha's Vineyard businesses that appear in at least one established island directory — the Chamber of Commerce, Vineyard Gazette, or Go Martha's Vineyard. A source-matching designation, not an endorsement.",
    intro:
      "These businesses appear in at least one established Martha's Vineyard directory. Directory presence is a useful local-trust signal — not an endorsement, certification, or guarantee of service.",
    about:
      "We mark a business as Verified Local when it appears in the Chamber of Commerce member directory, the Vineyard Gazette business directory, or Go Martha's Vineyard. Directories are observed from the most recent crawl; inclusion can change year to year.",
    bodyParagraphs: [
      "\"Verified Local\" on this website is a specific, narrow designation. It means we found a matching entry for the business in at least one of three established Martha's Vineyard directories: the Chamber of Commerce member directory, the Vineyard Gazette business directory, or Go Martha's Vineyard. It is not a quality certification, an endorsement, a guarantee of current operating status, or a statement about a business's service, ethics, or reliability.",
      "The value of a source-matching designation is different from an endorsement. Independent directories maintained by the Chamber, the local paper of record, and an island tourism site are useful precisely because their inclusion criteria are their own — not ours. A business appearing across multiple of these sources over time is a mild trust signal for local visitors trying to distinguish an established island operation from a directory-scraper listing.",
      "This list is refreshed periodically from the most recent crawl of each source. If you're a business owner and believe your entry is missing or incorrect, the fastest fix is with the source directory itself — the Chamber, the Gazette, or Go MV — because we mirror what they publish.",
    ],
    faqs: [
      {
        q: "What does \"Verified Local\" mean on this website?",
        a: "It means the business was found in at least one of three established Martha's Vineyard directories at the time of our most recent crawl: the Chamber of Commerce member directory, the Vineyard Gazette business directory, or Go Martha's Vineyard. It is a source-matching designation, not a quality certification or endorsement.",
      },
      {
        q: "Is this a quality certification or endorsement?",
        a: "No. Verified Local is a source-matching designation only. It does not certify the quality of any business's product or service, and it is not an endorsement by Martha's Vineyard IT or by the source directories.",
      },
      {
        q: "Does verified mean the business is currently operating?",
        a: "Not necessarily. Directory listings can lag reality by weeks or months. A verified entry means the business appeared in the directory at the time of our last crawl of that source. For current operating status, contact the business directly.",
      },
      {
        q: "How is a business added or removed from this list?",
        a: "We mirror the source directories. The fastest way to update an entry is to work with the source directly — the Chamber of Commerce, the Vineyard Gazette, or Go MV — because our list refreshes from their published data.",
      },
      {
        q: "Do you provide IT services to businesses listed here?",
        a: "We provide technology services to businesses across Martha's Vineyard, including organizations that may appear in these directories. A business's appearance here does not necessarily mean it is a Martha's Vineyard IT client. Directory listings and our client relationships are independent.",
      },
    ],
    relatedServices: [
      { to: "/services/business-it", label: "Business IT & Managed IT" },
      { to: "/services/wifi-network", label: "Wi-Fi & Network Installation" },
      { to: "/services/apple-repair", label: "Apple Repair & Support" },
      { to: "/services/smart-home", label: "Smart Home & Security" },
      { to: "/marthas-vineyard", label: "Island Business Directory" },
    ],
    match: (b) => Boolean(b.verifiedLocalBusiness),
    emptyMessage: "No verified businesses match this filter yet.",
  },
  "chamber-listed": {
    slug: "chamber-listed",
    title: "Chamber of Commerce Businesses on Martha's Vineyard",
    h1: "Listed in the MV Chamber of Commerce Directory",
    metaDescription:
      "Martha's Vineyard Chamber of Commerce member businesses. Chamber membership is a signal of active engagement in the island's business community, not a guarantee of service.",
    intro:
      "These businesses are listed in the Martha's Vineyard Chamber of Commerce member directory.",
    about:
      "Chamber membership is renewed annually. A listing today doesn't guarantee a listing next year. Source: business.mvy.com/memberdirectory.",
    bodyParagraphs: [
      "The Martha's Vineyard Chamber of Commerce is a membership organization for businesses operating on the island. Members pay annual dues and typically use the Chamber for networking, marketing, and access to island-wide programs. A Chamber listing tells you a business is invested enough in its island presence to pay the annual fee and keep its directory entry current.",
      "For a visitor or new resident looking for local businesses, that annual-renewal step is meaningful in a way a passive listing isn't. It doesn't verify quality or current operating status — the Chamber does not vouch for its members' products or services — but it does tend to filter for actively-operating businesses that see themselves as part of the local commercial community.",
      "For business owners, a Chamber listing is also a useful proxy for the kind of firm that tends to invest in reliable technology: predictable Wi-Fi, working payment systems, backups that actually run, and a plan for when something goes down mid-season. Those aren't Chamber requirements — they're just what running a serious island business tends to look like.",
    ],
    faqs: [
      {
        q: "What is the Martha's Vineyard Chamber of Commerce?",
        a: "It's a membership organization for businesses operating on Martha's Vineyard. Members pay annual dues and appear in a public member directory at business.mvy.com. The Chamber is independent of Martha's Vineyard IT.",
      },
      {
        q: "Is a Chamber listing a proof of quality or endorsement?",
        a: "No. Chamber membership signals that a business chose to join the Chamber and pay annual dues. It is not a quality certification, and the Chamber does not endorse specific products or services.",
      },
      {
        q: "Does a Chamber listing mean the business is a current member today?",
        a: "This page reflects the most recent crawl of the Chamber directory, not a live feed. Memberships lapse and renew year-to-year; for a business's current standing, check business.mvy.com directly.",
      },
      {
        q: "Do you support small businesses on the island?",
        a: "Yes. Martha's Vineyard IT provides Managed IT, business technology support, enterprise Wi-Fi, networking, Apple support, security cameras, and technology consulting to small and mid-sized businesses across the island.",
      },
      {
        q: "Can you monitor our office computers remotely?",
        a: "Yes. Our Managed IT service includes proactive monitoring, remote support, software and security updates, and backup verification for business computers. We combine this with on-island, in-person visits when hands-on work is needed.",
      },
      {
        q: "Do you provide IT services to businesses listed here?",
        a: "We provide technology services to businesses across Martha's Vineyard, including organizations that may appear in these directories. A business's appearance here does not necessarily mean it is a Martha's Vineyard IT client. Directory listings and our client relationships are independent.",
      },
    ],
    relatedServices: [
      { to: "/services/business-it", label: "Managed IT & Business IT" },
      { to: "/services/wifi-network", label: "Enterprise Wi-Fi & Networking" },
      { to: "/services/apple-repair", label: "Apple Support" },
      { to: "/services/smart-home", label: "Security Cameras" },
      { to: "/contact", label: "Talk to Martha's Vineyard IT" },
    ],
    match: (b) => hasMembership(b, "chamber"),
    emptyMessage: "No Chamber-listed businesses found.",
  },
  "gazette-listed": {
    slug: "gazette-listed",
    title: "Vineyard Gazette Directory Businesses — Martha's Vineyard",
    h1: "Listed in the Vineyard Gazette Business Directory",
    metaDescription:
      "Martha's Vineyard businesses listed in the Vineyard Gazette business directory. Organized by town and category, sourced from the island's paper of record.",
    intro:
      "These businesses are listed in the Vineyard Gazette business directory.",
    about:
      "The Vineyard Gazette directory groups island businesses by town and category. Source: vineyardgazette.com/business-directory.",
    bodyParagraphs: [
      "The Vineyard Gazette is Martha's Vineyard's paper of record — in continuous publication since 1846 — and its business directory is one of the broadest catalogs of island businesses in existence. Entries are organized by town (Edgartown, Vineyard Haven, Oak Bluffs, West Tisbury, Chilmark, Aquinnah) and by category, which makes it a useful starting point for visitors and residents trying to find something specific to a corner of the island.",
      "Because the Gazette directory is broad rather than gated, its scope includes restaurants, lodging, retail, professional services, trades, arts and culture, and everything in between. That breadth is exactly what makes it useful for browsing — and also what makes appearance in the Gazette directory a relatively low-signal fact on its own. A more useful trust indicator is when a business appears in the Gazette directory and one or more of the other island sources on the Verified Local list.",
      "For businesses across all six towns, the technology needs are more consistent than they might seem: reliable Wi-Fi for staff and guests, a working point-of-sale, security cameras where they make sense, and a plan for what happens when something breaks in July. Martha's Vineyard IT works with businesses across every category represented in the Gazette directory, from small retail to inns to professional offices.",
    ],
    faqs: [
      {
        q: "What is the Vineyard Gazette business directory?",
        a: "It's a public business directory hosted by the Vineyard Gazette at vineyardgazette.com/business-directory, organized by town and category. The Gazette is the island's paper of record and its directory is one of the broadest catalogs of Martha's Vineyard businesses.",
      },
      {
        q: "How is the directory organized?",
        a: "By town (Edgartown, Vineyard Haven, Oak Bluffs, West Tisbury, Chilmark, Aquinnah) and by category (restaurants, lodging, retail, professional services, trades, and more). Most businesses appear under a single town-category combination.",
      },
      {
        q: "Does inclusion in the Gazette directory mean the business is vetted or endorsed?",
        a: "No. The Gazette directory is a broad public catalog, not a curated or vetted list. Appearance is a listing, not a certification or endorsement of a business's product or service.",
      },
      {
        q: "Do you work with businesses across the island?",
        a: "Yes. Martha's Vineyard IT provides technology services to businesses in every town on the island — Edgartown, Vineyard Haven, Oak Bluffs, West Tisbury, Chilmark, and Aquinnah — across categories including restaurants, lodging, retail, professional services, and more.",
      },
      {
        q: "Can you improve an existing network?",
        a: "Yes. Whether the current setup is a single ISP-supplied router or an older business-grade system, we assess what's there, identify the bottlenecks, and recommend the smallest change that fixes the actual problem. Sometimes that's a re-config; sometimes it's targeted new equipment; sometimes it's a full network installation.",
      },
      {
        q: "Do you provide IT services to businesses listed here?",
        a: "We provide technology services to businesses across Martha's Vineyard, including organizations that may appear in these directories. A business's appearance here does not necessarily mean it is a Martha's Vineyard IT client. Directory listings and our client relationships are independent.",
      },
    ],
    relatedServices: [
      { to: "/services/wifi-network", label: "Enterprise Wi-Fi & Networking" },
      { to: "/services/business-it", label: "Managed IT & Business IT" },
      { to: "/services/apple-repair", label: "Apple Support" },
      { to: "/services/smart-home", label: "Security Cameras" },
      { to: "/services/tv-audio", label: "TV & Audio" },
      { to: "/marthas-vineyard", label: "Full Business Directory" },
    ],
    match: (b) => hasMembership(b, "gazette"),
    emptyMessage: "No Gazette-listed businesses found.",
  },
  "gomv-listed": {
    slug: "gomv-listed",
    title: "Tourism Businesses on Martha's Vineyard — Go MV Directory",
    h1: "Listed in the Go Martha's Vineyard Directory",
    metaDescription:
      "Martha's Vineyard businesses listed in the Go Martha's Vineyard tourism directory — inns, restaurants, retail, and activities catering to island visitors.",
    intro:
      "These businesses are listed in the Go Martha's Vineyard tourism directory.",
    about:
      "Go Martha's Vineyard is a tourism-focused directory. Listings reflect each business's current presence on gomarthasvineyard.com.",
    bodyParagraphs: [
      "Go Martha's Vineyard is a tourism-focused directory oriented toward island visitors. Its listings tend to skew hospitality: inns and small hotels, restaurants, specialty retail, seasonal activities, tours, and other businesses that see meaningful summer traffic. That makes Go MV a useful starting point for anyone trying to reach the visitor-facing side of the island's economy.",
      "For a business owner, appearing in Go MV signals investment in reaching seasonal customers. It's not a certification and it doesn't verify current operating status — for that, contact the business directly — but it's a reasonable proxy for firms that treat their island presence as an ongoing commercial concern rather than a passive listing.",
      "Visitor-facing island businesses tend to share a specific set of technology needs, most of which get sharper in July and August: dependable guest Wi-Fi across a property, a network that keeps the point-of-sale online during a rush, security cameras on entrances and cash areas, an audio setup that behaves, and someone reachable when a piece of it stops working on a Saturday night. Martha's Vineyard IT works with tourism and hospitality businesses on all of that, both as one-off installations and as ongoing Managed IT.",
    ],
    faqs: [
      {
        q: "What is Go Martha's Vineyard?",
        a: "It's a tourism-focused directory of Martha's Vineyard businesses at gomarthasvineyard.com. Listings tend to be visitor-facing — inns, restaurants, retail, and activities — and are aimed at people planning trips to the island.",
      },
      {
        q: "Is a Go MV listing an endorsement or quality certification?",
        a: "No. Appearing in the Go MV directory is a listing, not a certification. It does not verify current operating status, quality of service, or any specific business practice.",
      },
      {
        q: "Do you install guest Wi-Fi for inns and vacation properties?",
        a: "Yes. Guest-network setup with proper separation from the property's own systems, coverage across every room and outdoor area, and simple, secure onboarding for guests is one of the most common installations we do. See our Wi-Fi & Network Installation page for details.",
      },
      {
        q: "Can you support seasonal point-of-sale and payment systems?",
        a: "Yes. We support the networking, connectivity, and reliability side of POS and payment systems — the wired and wireless infrastructure that keeps a POS online during a summer rush. We do not directly resell any specific POS brand, but we work with whatever hardware and software you've chosen.",
      },
      {
        q: "Do you handle security cameras for inns, vacation rentals, and restaurants?",
        a: "Yes. We install and support security-camera systems appropriate for hospitality and small-business use — entrance coverage, back-of-house monitoring, and remote-view access for owners. We size the system to the property; we do not push enterprise-scale hardware where it isn't needed.",
      },
      {
        q: "Are you available for on-site support during the summer season?",
        a: "Yes. Martha's Vineyard IT is based on the island year-round, so on-site response times don't depend on a ferry schedule. Summer season is our busiest period; the honest answer is that same-day availability tightens in July and August, and businesses on a Managed IT arrangement are prioritized.",
      },
      {
        q: "Do you provide IT services to businesses listed here?",
        a: "We provide technology services to businesses across Martha's Vineyard, including organizations that may appear in these directories. A business's appearance here does not necessarily mean it is a Martha's Vineyard IT client. Directory listings and our client relationships are independent.",
      },
    ],
    relatedServices: [
      { to: "/services/wifi-network", label: "Guest Wi-Fi & Networking" },
      { to: "/services/smart-home", label: "Security Cameras" },
      { to: "/services/business-it", label: "Managed IT for Hospitality" },
      { to: "/services/tv-audio", label: "TV & Audio Systems" },
      { to: "/services/apple-repair", label: "Apple Support" },
      { to: "/contact", label: "On-Island Technology Support" },
    ],
    match: (b) => hasMembership(b, "gomv"),
    emptyMessage: "No Go MV listed businesses found.",
  },
  "black-owned": {
    slug: "black-owned",
    title: "Black-Owned Businesses on Martha's Vineyard — BlackOwnedMV",
    h1: "Listed in BlackOwnedMV",
    metaDescription:
      "Black-owned businesses on Martha's Vineyard, mirrored from BlackOwnedMV — the island's Black-owned business directory published by an independent organization.",
    intro:
      "These businesses are listed in the BlackOwnedMV directory, the island's directory of Black-owned businesses on Martha's Vineyard.",
    about:
      "BlackOwnedMV publishes an annual directory issue. We mirror their official list and link to blackownedmv.com for each entry. If you operate a Black-owned MV business that should be listed, please contact BlackOwnedMV directly.",
    bodyParagraphs: [
      "BlackOwnedMV is an independent organization that publishes and maintains a directory of Black-owned businesses operating on Martha's Vineyard. The list is published annually and is the source of record for this page — we mirror what BlackOwnedMV publishes rather than making inclusion or exclusion decisions ourselves.",
      "The purpose of the directory is representation and visibility for Black-owned businesses across the island. Directory inclusion is determined by BlackOwnedMV, not by Martha's Vineyard IT. Appearing on this page reflects the most recent BlackOwnedMV data we've mirrored; it is not a certification, an endorsement, or a statement about current operating status.",
      "If you own a Black-owned Martha's Vineyard business and would like to be listed, the right first step is to contact BlackOwnedMV directly at blackownedmv.com. Because we mirror their published list, corrections and additions flow through the source and appear here on the next update.",
    ],
    faqs: [
      {
        q: "What is BlackOwnedMV?",
        a: "BlackOwnedMV is an independent organization that publishes an annual directory of Black-owned businesses operating on Martha's Vineyard. Their directory lives at blackownedmv.com and is the source of the listings mirrored on this page.",
      },
      {
        q: "How is a business added to the BlackOwnedMV directory?",
        a: "Inclusion is determined by BlackOwnedMV, not by Martha's Vineyard IT. If you own a Black-owned MV business and would like to be listed, contact BlackOwnedMV directly at blackownedmv.com. We mirror what they publish, so listings appear here on the next update.",
      },
      {
        q: "Is a BlackOwnedMV listing a quality certification or endorsement?",
        a: "No. The directory is a representation-and-visibility catalog maintained by an independent organization. A listing is not a certification and does not endorse any specific product or service.",
      },
      {
        q: "Does inclusion here mean the business is currently operating?",
        a: "Not necessarily. This page mirrors the most recent BlackOwnedMV data, which is refreshed periodically. For a business's current operating status, contact the business directly.",
      },
      {
        q: "Do you provide IT services to businesses listed here?",
        a: "We provide technology services to businesses across Martha's Vineyard, including organizations that may appear in these directories. A business's appearance here does not necessarily mean it is a Martha's Vineyard IT client. Directory listings and our client relationships are independent.",
      },
    ],
    relatedServices: [
      { to: "/services/business-it", label: "Managed IT & Business IT" },
      { to: "/services/wifi-network", label: "Wi-Fi & Networking" },
      { to: "/services/apple-repair", label: "Apple Support" },
      { to: "/marthas-vineyard", label: "Island Business Directory" },
      { to: "/contact", label: "Contact Martha's Vineyard IT" },
    ],
    noindexWhileEmpty: true,
    emptyStateBody:
      "The BlackOwnedMV listings shown on this page are currently being updated from the source directory at blackownedmv.com. If you're looking for a specific Black-owned Martha's Vineyard business, we recommend visiting BlackOwnedMV directly, or checking back here as the mirror is refreshed. This page is temporarily marked \"noindex\" while its records are being refreshed so search engines don't send visitors to a page that can't yet answer their question.",
    match: (b) => hasMembership(b, "blackOwned"),
    emptyMessage: "No Black-owned businesses are currently listed in our mirror.",
  },
};

interface FilteredBusinessesPageProps {
  filter: FilterConfig;
}

export default function FilteredBusinessesPage({ filter }: FilteredBusinessesPageProps) {
  const { businesses, isLoading } = useBusinesses({});

  const filtered = useMemo(
    () => businesses.filter(filter.match),
    [businesses, filter]
  );

  const canonical = url(filter.slug);

  // Apply `noindex, follow` only when the page cannot deliver on its promise
  // (an empty directory landing whose title advertises a business list).
  // Once results exist, this returns to the normal indexable state.
  // Canonical URL is unaffected. See spec: black-owned page while data is nil.
  const noIndex = Boolean(
    filter.noindexWhileEmpty && !isLoading && filtered.length === 0
  );

  const collectionPageLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": canonical,
    url: canonical,
    name: filter.h1,
    description: filter.metaDescription,
    isPartOf: { "@type": "WebSite", url: "https://anythingitechmv.com" },
    about: {
      "@type": "Thing",
      name: "Martha's Vineyard businesses",
    },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: filtered.length,
      itemListElement: filtered.slice(0, 100).map((b, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `https://anythingitechmv.com/marthas-vineyard/${b.townSlug}/${b.businessType}/${b.slug}`,
        name: b.name,
      })),
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: "https://anythingitechmv.com/",
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Directory",
        item: "https://anythingitechmv.com/marthas-vineyard",
      },
      {
        "@type": "ListItem",
        position: 3,
        name: filter.h1,
        item: canonical,
      },
    ],
  };

  const jsonLd: Array<Record<string, unknown>> = [collectionPageLd, breadcrumbLd];

  if (filter.faqs && filter.faqs.length > 0) {
    jsonLd.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: filter.faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    });
  }

  const showEmptyState = !isLoading && filtered.length === 0;

  return (
    <SiteLayout>
      <SEO
        title={filter.title}
        description={filter.metaDescription}
        canonical={canonical}
        noIndex={noIndex}
        jsonLd={jsonLd}
      />

      {/* Breadcrumb */}
      <div className="border-b border-border bg-surface">
        <div className="container-editorial py-3">
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link to="/marthas-vineyard" className="hover:text-foreground transition-colors">Directory</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground">{filter.h1}</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <section className="border-b border-border">
        <div className="container-editorial py-12 md:py-16">
          <h1 className="display-lg text-balance mb-4 max-w-3xl">{filter.h1}</h1>
          <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">{filter.intro}</p>
          <p className="mt-4 text-sm text-muted-foreground max-w-2xl">{filter.about}</p>
          {!isLoading && (
            <p className="mt-6 text-sm">
              <span className="font-medium">{filtered.length}</span> {filtered.length === 1 ? "business" : "businesses"} listed.
            </p>
          )}
        </div>
      </section>

      {/* About this directory (expanded body copy) */}
      {filter.bodyParagraphs && filter.bodyParagraphs.length > 0 && (
        <section className="border-b border-border">
          <div className="container-editorial py-12 md:py-16">
            <h2 className="font-display text-2xl md:text-3xl mb-6 max-w-3xl">About this directory</h2>
            <div className="space-y-4 max-w-2xl text-muted-foreground leading-relaxed">
              {filter.bodyParagraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Listing */}
      <section className="py-12 md:py-16">
        <div className="container-editorial">
          {isLoading ? (
            <div className="animate-pulse text-muted-foreground">Loading businesses…</div>
          ) : showEmptyState && filter.emptyStateBody ? (
            <div className="max-w-2xl">
              <p className="text-muted-foreground leading-relaxed">{filter.emptyStateBody}</p>
            </div>
          ) : (
            <BusinessList
              businesses={filtered}
              showTown
              searchable
              emptyMessage={filter.emptyMessage}
            />
          )}
        </div>
      </section>

      {/* FAQ */}
      {filter.faqs && filter.faqs.length > 0 && (
        <section className="border-t border-border bg-surface">
          <div className="container-editorial py-12 md:py-16">
            <h2 className="font-display text-2xl md:text-3xl mb-8 max-w-3xl">Frequently asked questions</h2>
            <div className="space-y-3 max-w-3xl">
              {filter.faqs.map((f, i) => (
                <details
                  key={i}
                  className="group border border-border rounded-md bg-card"
                >
                  <summary className="cursor-pointer list-none flex items-start justify-between gap-4 px-5 py-4 text-[15px] font-medium">
                    <span>{f.q}</span>
                    <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0 transition-transform group-open:rotate-90" />
                  </summary>
                  <div className="px-5 pb-5 text-[15px] text-muted-foreground leading-relaxed">
                    {f.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Related services */}
      {filter.relatedServices && filter.relatedServices.length > 0 && (
        <section className="border-t border-border">
          <div className="container-editorial py-12 md:py-16">
            <h2 className="font-display text-2xl md:text-3xl mb-6 max-w-3xl">Related services</h2>
            <ul className="flex flex-wrap gap-x-6 gap-y-3 text-[15px]">
              {filter.relatedServices.map((s) => (
                <li key={s.to}>
                  <Link to={s.to} className="link-underline text-foreground hover:text-foreground">
                    {s.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}
    </SiteLayout>
  );
}
