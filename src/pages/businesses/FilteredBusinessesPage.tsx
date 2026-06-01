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
      "Browse Martha's Vineyard businesses that appear in established island directories — the Chamber of Commerce, Vineyard Gazette, or Go Martha's Vineyard.",
    intro:
      "These businesses appear in at least one established Martha's Vineyard directory. Directory presence is a useful local-trust signal — not an endorsement, certification, or guarantee of service.",
    about:
      "We mark a business as Verified Local when it appears in the Chamber of Commerce member directory, the Vineyard Gazette business directory, or Go Martha's Vineyard. Directories are observed from the most recent crawl; inclusion can change year to year.",
    match: (b) => Boolean(b.verifiedLocalBusiness),
    emptyMessage: "No verified businesses match this filter yet.",
  },
  "chamber-listed": {
    slug: "chamber-listed",
    title: "Chamber-Listed Businesses on Martha's Vineyard",
    h1: "Listed in the MV Chamber of Commerce Directory",
    metaDescription:
      "Martha's Vineyard businesses listed in the Martha's Vineyard Chamber of Commerce member directory.",
    intro:
      "These businesses are listed in the Martha's Vineyard Chamber of Commerce member directory.",
    about:
      "Chamber membership is renewed annually. A listing today doesn't guarantee a listing next year. Source: business.mvy.com/memberdirectory.",
    match: (b) => hasMembership(b, "chamber"),
    emptyMessage: "No Chamber-listed businesses found.",
  },
  "gazette-listed": {
    slug: "gazette-listed",
    title: "Vineyard-Gazette-Listed Businesses on Martha's Vineyard",
    h1: "Listed in the Vineyard Gazette Business Directory",
    metaDescription:
      "Martha's Vineyard businesses listed in the Vineyard Gazette business directory.",
    intro:
      "These businesses are listed in the Vineyard Gazette business directory.",
    about:
      "The Vineyard Gazette directory groups island businesses by town and category. Source: vineyardgazette.com/business-directory.",
    match: (b) => hasMembership(b, "gazette"),
    emptyMessage: "No Gazette-listed businesses found.",
  },
  "gomv-listed": {
    slug: "gomv-listed",
    title: "Go-Martha's-Vineyard-Listed Businesses",
    h1: "Listed in the Go Martha's Vineyard Directory",
    metaDescription:
      "Martha's Vineyard businesses listed in the Go Martha's Vineyard tourism directory.",
    intro:
      "These businesses are listed in the Go Martha's Vineyard tourism directory.",
    about:
      "Go Martha's Vineyard is a tourism-focused directory. Listings reflect each business's current presence on gomarthasvineyard.com.",
    match: (b) => hasMembership(b, "gomv"),
    emptyMessage: "No Go MV listed businesses found.",
  },
  "black-owned": {
    slug: "black-owned",
    title: "Black-Owned Businesses on Martha's Vineyard",
    h1: "Listed in BlackOwnedMV",
    metaDescription:
      "Black-owned businesses on Martha's Vineyard, as listed by BlackOwnedMV — the island's Black-owned business directory.",
    intro:
      "These businesses are listed in the BlackOwnedMV directory, the island's directory of Black-owned businesses on Martha's Vineyard.",
    about:
      "BlackOwnedMV publishes an annual directory issue. We mirror their official list and link to blackownedmv.com for each entry. If you operate a Black-owned MV business that should be listed, please contact BlackOwnedMV directly.",
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

  const jsonLd = {
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

  return (
    <SiteLayout>
      <SEO
        title={filter.title}
        description={filter.metaDescription}
        canonical={canonical}
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

      {/* Listing */}
      <section className="py-12 md:py-16">
        <div className="container-editorial">
          {isLoading ? (
            <div className="animate-pulse text-muted-foreground">Loading businesses…</div>
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
    </SiteLayout>
  );
}
