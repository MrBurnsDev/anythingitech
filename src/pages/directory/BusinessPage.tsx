import { useState, useEffect } from "react";
import { useParams, Link, Navigate, useNavigate } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SEO } from "@/components/SEO";
import {
  getTownBySlug,
  getBusinessTypeBySlug,
  getTownUrl,
  getBusinessTypeUrl,
  getTownBusinessTypeUrl,
  normalizeCategorySlug,
} from "@/data/directory";
import { useBusiness, useBusinesses } from "@/hooks/useBusinesses";
import { BusinessCard } from "@/components/directory/BusinessCard";
import { AdminControls } from "@/components/directory/AdminControls";
import { useAdminAuth } from "@/contexts/AdminAuthContext";
import {
  MapPin,
  Phone,
  Globe,
  Clock,
  ChevronRight,
  ExternalLink,
  Building2,
  Utensils,
  Bed,
  ShoppingBag,
  HeartPulse,
  Hammer,
  Briefcase,
  Landmark,
  Wifi,
  ArrowUpRight,
  Palette,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";

// One-off WP-migration slug shapes not covered by the central LEGACY_CATEGORY_REMAP
const SLUG_REDIRECTS: Record<string, string> = {
  "restaurantsand-food-and-beverages": "restaurants-food-beverages",
  "familyand-community-and-government": "family-community-government",
};

// Map icon names from JSON to Lucide components
const typeIcons: Record<string, React.ElementType> = {
  utensils: Utensils,
  bed: Bed,
  "shopping-bag": ShoppingBag,
  "heart-pulse": HeartPulse,
  hammer: Hammer,
  briefcase: Briefcase,
  landmark: Landmark,
  palette: Palette,
  stethoscope: Stethoscope,
};

export default function BusinessPage() {
  const { townSlug, typeSlug, businessSlug } = useParams<{
    townSlug: string;
    typeSlug: string;
    businessSlug: string;
  }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAdminAuth();
  const [editOpen, setEditOpen] = useState(false);
  const [isCheckingRedirect, setIsCheckingRedirect] = useState(false);

  // Check if typeSlug needs redirect to canonical version (one-off WP shapes)
  const redirectTypeSlug = typeSlug ? SLUG_REDIRECTS[typeSlug] : undefined;
  if (redirectTypeSlug && townSlug && businessSlug) {
    return <Navigate to={`/marthas-vineyard/${townSlug}/${redirectTypeSlug}/${businessSlug}`} replace />;
  }
  // Legacy category short-form (server 308 should win; SPA fallback)
  const normalizedTypeSlug = typeSlug ? normalizeCategorySlug(typeSlug) : undefined;
  if (normalizedTypeSlug && normalizedTypeSlug !== typeSlug && townSlug && businessSlug) {
    return <Navigate to={`/marthas-vineyard/${townSlug}/${normalizedTypeSlug}/${businessSlug}`} replace />;
  }

  // Fetch business from Supabase API
  const { business, isLoading: businessLoading, error: businessError, refetch } = useBusiness(businessSlug);
  const town = getTownBySlug(townSlug || "");
  const businessType = getBusinessTypeBySlug(typeSlug || "");

  // Fetch related businesses
  const { businesses: relatedBusinessesAll } = useBusinesses({
    town: townSlug,
    type: typeSlug,
  });
  const relatedBusinesses = relatedBusinessesAll
    .filter((b) => b.slug !== businessSlug)
    .slice(0, 3);

  // Check for slug redirects if business not found
  useEffect(() => {
    // Only check redirect after loading is complete and we have no business
    if (businessLoading || business || !businessSlug) {
      return;
    }

    // Avoid duplicate redirect checks
    if (isCheckingRedirect) {
      return;
    }

    setIsCheckingRedirect(true);

    fetch(`/api/directory/resolve-slug?slug=${encodeURIComponent(businessSlug)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.redirect && data.newSlug) {
          // Get the correct town/type from the redirect target if available
          const targetTown = data.business?.town
            ? data.business.town.toLowerCase().replace(/\s+/g, '-')
            : townSlug;
          const targetType = typeSlug; // Keep same category

          // Redirect to the new URL
          const newUrl = `/marthas-vineyard/${targetTown}/${targetType}/${data.newSlug}`;
          navigate(newUrl, { replace: true });
        } else if (data.found && data.slug !== businessSlug) {
          // The slug exists but user hit an old URL - shouldn't happen, but handle it
          navigate(`/marthas-vineyard/${townSlug}/${typeSlug}/${data.slug}`, { replace: true });
        }
      })
      .catch((err) => {
        console.error("Slug resolution failed:", err);
      })
      .finally(() => {
        setIsCheckingRedirect(false);
      });
  }, [business, businessLoading, businessSlug, townSlug, typeSlug, navigate, isCheckingRedirect]);

  // Show loading state
  if (businessLoading || isCheckingRedirect) {
    return (
      <SiteLayout>
        <div className="container-editorial py-24 text-center">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </SiteLayout>
    );
  }

  if (!business || !town || !businessType) {
    return <Navigate to="/marthas-vineyard" replace />;
  }

  const Icon = typeIcons[businessType.icon] || Building2;

  // Check if this business type is relevant for IT services CTA
  const showITCTA = [
    "restaurantsand-food-and-beverages",
    "lodging-and-tourism",
    "shopping-and-specialty-retail",
    "beauty-and-wellness",
    "business-and-professional-services",
  ].includes(businessType.slug);

  const seoDescription = business.description
    ? `${business.description} Located in ${town.name}, Martha's Vineyard.`
    : `${business.name} - ${businessType.name.toLowerCase()} in ${town.name}, Martha's Vineyard.`;

  // Always emit modern category slug in canonical/breadcrumb/JSON-LD,
  // regardless of which form the URL was reached on.
  const canonicalType = normalizeCategorySlug(businessType.slug) || businessType.slug;
  const canonicalUrl = `https://anythingitechmv.com/marthas-vineyard/${town.slug}/${canonicalType}/${business.slug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "@id": canonicalUrl,
      name: business.name,
      description: seoDescription,
      url: canonicalUrl,
      ...(business.phone ? { telephone: business.phone } : {}),
      ...(business.website ? { sameAs: [business.website] } : {}),
      ...(business.address ? {
        address: {
          "@type": "PostalAddress",
          streetAddress: business.address,
          addressLocality: town.name,
          addressRegion: "MA",
          addressCountry: "US",
        }
      } : {}),
      ...(business.coordinates ? {
        geo: {
          "@type": "GeoCoordinates",
          latitude: business.coordinates.lat,
          longitude: business.coordinates.lng,
        }
      } : {}),
      areaServed: { "@type": "Place", name: "Martha's Vineyard" },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Directory", item: "https://anythingitechmv.com/marthas-vineyard" },
        { "@type": "ListItem", position: 2, name: town.name, item: `https://anythingitechmv.com/marthas-vineyard/${town.slug}` },
        { "@type": "ListItem", position: 3, name: businessType.pluralName, item: `https://anythingitechmv.com/marthas-vineyard/${town.slug}/${canonicalType}` },
        { "@type": "ListItem", position: 4, name: business.name, item: canonicalUrl },
      ],
    },
  ];

  return (
    <SiteLayout>
      <SEO
        title={`${business.name} - ${town.name}, Martha's Vineyard`}
        description={seoDescription}
        canonical={canonicalUrl}
        noEmailIndex
        jsonLd={jsonLd}
      />
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container-editorial py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
            <Link to="/marthas-vineyard" className="hover:text-foreground transition-colors">
              Directory
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link to={getTownUrl(town.slug)} className="hover:text-foreground transition-colors">
              {town.name}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              to={getTownBusinessTypeUrl(town.slug, businessType.slug)}
              className="hover:text-foreground transition-colors"
            >
              {businessType.pluralName}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground truncate max-w-[200px]">{business.name}</span>
          </nav>
        </div>
      </div>

      {/* Business Header */}
      <section className="relative pt-16 pb-12 md:pt-20 md:pb-16 overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-overlay opacity-60 pointer-events-none" />
        <div className="container-editorial relative">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Main Info */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-accent/10 grid place-items-center">
                  <Icon className="h-6 w-6 text-accent" />
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
                    {business.category}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    {business.town}
                  </span>
                </div>
              </div>

              <div className="flex items-start justify-between gap-4">
                <h1 className="display-lg text-balance mb-6 animate-fade-up">
                  {business.name}
                </h1>
                {/* Admin Edit Button */}
                {isAuthenticated && (
                  <AdminControls business={business} variant="button" />
                )}
              </div>

              {business.description && (
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl animate-fade-up-delay-1">
                  {business.description}
                </p>
              )}

              {business.seasonal && (
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-accent" />
                  <span className="capitalize">{business.seasonal}</span>
                </div>
              )}
            </div>

            {/* Contact Card */}
            <div className="lg:col-span-1">
              <div className="bg-card border border-border rounded-xl p-6 space-y-5">
                <h2 className="font-display text-lg">Contact Information</h2>

                {business.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1">
                        Address
                      </div>
                      <p className="text-sm">{business.address}</p>
                    </div>
                  </div>
                )}

                {business.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-1">
                        Phone
                      </div>
                      <a
                        href={`tel:${business.phone.replace(/\D/g, "")}`}
                        className="text-sm hover:text-accent transition-colors"
                      >
                        {business.phone}
                      </a>
                    </div>
                  </div>
                )}

                {/* Email removed for privacy protection - only visible in admin dashboard */}

                {business.website && (
                  <div className="pt-4 border-t border-border">
                    <Button asChild className="w-full rounded-full" variant="default">
                      <a
                        href={business.website}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Globe className="h-4 w-4 mr-2" />
                        Visit Website
                        <ExternalLink className="h-3.5 w-3.5 ml-2" />
                      </a>
                    </Button>
                  </div>
                )}

                {/* Social Links */}
                {(business.social.facebook ||
                  business.social.instagram ||
                  business.social.yelp ||
                  business.social.tripadvisor) && (
                  <div className="pt-4 border-t border-border">
                    <div className="text-xs uppercase tracking-[0.15em] text-muted-foreground mb-3">
                      Find Online
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {business.social.facebook && (
                        <a
                          href={business.social.facebook}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-3 py-1.5 bg-secondary rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          Facebook
                        </a>
                      )}
                      {business.social.instagram && (
                        <a
                          href={business.social.instagram}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-3 py-1.5 bg-secondary rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          Instagram
                        </a>
                      )}
                      {business.social.yelp && (
                        <a
                          href={business.social.yelp}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-3 py-1.5 bg-secondary rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          Yelp
                        </a>
                      )}
                      {business.social.tripadvisor && (
                        <a
                          href={business.social.tripadvisor}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs px-3 py-1.5 bg-secondary rounded-full hover:bg-accent hover:text-accent-foreground transition-colors"
                        >
                          TripAdvisor
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IT Services CTA for business owners */}
      {showITCTA && (
        <section className="py-12 bg-surface border-b border-border">
          <div className="container-editorial">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 bg-card border border-border rounded-xl">
              <div className="flex items-start gap-4">
                <div className="h-10 w-10 rounded-lg bg-accent/10 grid place-items-center shrink-0">
                  <Wifi className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h3 className="font-display text-lg mb-1">
                    Business technology support on Martha's Vineyard
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Wi-Fi networks, POS systems, and IT support for island businesses.
                  </p>
                </div>
              </div>
              <Button asChild variant="outline" className="rounded-full shrink-0">
                <Link to="/services/business-it">
                  Learn More <ArrowUpRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Related Businesses */}
      {relatedBusinesses.length > 0 && (
        <section className="py-16 md:py-24">
          <div className="container-editorial">
            <div className="flex items-end justify-between gap-4 mb-12">
              <div>
                <h2 className="font-display text-2xl mb-2">
                  More {businessType.pluralName} in {town.name}
                </h2>
                <p className="text-muted-foreground">
                  Other {businessType.name.toLowerCase()} businesses nearby
                </p>
              </div>
              <Link
                to={getTownBusinessTypeUrl(town.slug, businessType.slug)}
                className="text-sm link-underline shrink-0"
              >
                View all
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {relatedBusinesses.map((b) => (
                <BusinessCard key={b.id} business={b} showTown={false} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Navigation Links */}
      <section className="py-12 border-t border-border bg-surface">
        <div className="container-editorial flex flex-wrap items-center justify-between gap-4 text-sm">
          <Link
            to={getTownBusinessTypeUrl(town.slug, businessType.slug)}
            className="flex items-center gap-2 hover:text-accent transition-colors"
          >
            <Icon className="h-4 w-4" />
            All {businessType.pluralName} in {town.name}
          </Link>
          <Link
            to={getTownUrl(town.slug)}
            className="flex items-center gap-2 hover:text-accent transition-colors"
          >
            <MapPin className="h-4 w-4" />
            All businesses in {town.name}
          </Link>
          <Link
            to={getBusinessTypeUrl(businessType.slug)}
            className="flex items-center gap-2 hover:text-accent transition-colors"
          >
            All {businessType.pluralName} on Martha's Vineyard
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
