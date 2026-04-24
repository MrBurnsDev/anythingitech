import { useParams, Link, Navigate } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SEO } from "@/components/SEO";
import { BusinessList } from "@/components/directory/BusinessList";
import {
  getTownBySlug,
  getBusinessTypeBySlug,
  getBusinessesByTownAndType,
  getBusinessTypesForTown,
  getTownBusinessTypeUrl,
  getTownUrl,
  getBusinessTypeUrl,
} from "@/data/directory";
import {
  MapPin,
  ArrowRight,
  ChevronRight,
  Building2,
  Utensils,
  Bed,
  ShoppingBag,
  HeartPulse,
  Hammer,
  Briefcase,
  Landmark,
  Wifi,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const typeIcons: Record<string, React.ElementType> = {
  restaurants: Utensils,
  lodging: Bed,
  shopping: ShoppingBag,
  "health-wellness": HeartPulse,
  contractors: Hammer,
  "professional-services": Briefcase,
  community: Landmark,
};

export default function TownBusinessTypePage() {
  const { townSlug, typeSlug } = useParams<{ townSlug: string; typeSlug: string }>();
  const town = getTownBySlug(townSlug || "");
  const businessType = getBusinessTypeBySlug(typeSlug || "");

  if (!town || !businessType) {
    return <Navigate to="/marthas-vineyard" replace />;
  }

  const filteredBusinesses = getBusinessesByTownAndType(town.slug, businessType.slug);
  const otherTypesInTown = getBusinessTypesForTown(town.slug).filter(t => t.slug !== businessType.slug);
  const Icon = typeIcons[businessType.slug] || Building2;

  // If no businesses in this combination, redirect
  if (filteredBusinesses.length === 0) {
    return <Navigate to={getTownUrl(town.slug)} replace />;
  }

  // Check if this is a business-relevant category for IT services CTA
  const showITCTA = ["restaurants", "lodging", "shopping", "health-wellness", "professional-services"].includes(businessType.slug);

  return (
    <SiteLayout>
      <SEO
        title={`${businessType.pluralName} in ${town.name}, Martha's Vineyard`}
        description={`Find ${businessType.name.toLowerCase()} businesses in ${town.name}. ${businessType.shortDescription} serving the Martha's Vineyard community.`}
        canonical={`https://anythingitechmv.com/marthas-vineyard/${town.slug}/${businessType.slug}`}
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
            <span className="text-foreground">{businessType.pluralName}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="relative pt-16 pb-12 md:pt-20 md:pb-16 overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-overlay opacity-60 pointer-events-none" />
        <div className="container-editorial relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-accent/10 grid place-items-center">
              <Icon className="h-6 w-6 text-accent" />
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              {town.name}
            </div>
          </div>
          <h1 className="display-xl text-balance mb-6 animate-fade-up">
            {businessType.pluralName} in {town.name}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl animate-fade-up-delay-1">
            {businessType.shortDescription} serving {town.name} and the surrounding Martha's Vineyard community.
          </p>
          <div className="mt-8 flex items-center gap-2 text-sm animate-fade-up-delay-2">
            <Building2 className="h-4 w-4 text-accent" />
            <span className="font-medium">{filteredBusinesses.length}</span>
            <span className="text-muted-foreground">
              {filteredBusinesses.length === 1 ? "business" : "businesses"} listed
            </span>
          </div>
        </div>
      </section>

      {/* Business List */}
      <section className="py-16 md:py-24">
        <div className="container-editorial">
          <BusinessList businesses={filteredBusinesses} showTown={false} searchable={filteredBusinesses.length > 6} />
        </div>
      </section>

      {/* IT Services CTA */}
      {showITCTA && (
        <section className="py-16 border-t border-border bg-surface">
          <div className="container-editorial">
            <div className="bg-primary text-primary-foreground rounded-xl p-8 md:p-12 relative overflow-hidden">
              <div className="absolute inset-0 grid-overlay-dark opacity-30 pointer-events-none" />
              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div>
                  <p className="text-sm text-primary-foreground/60 mb-2">For {town.name} Businesses</p>
                  <h3 className="font-display text-2xl mb-2">
                    Need technology support?
                  </h3>
                  <p className="text-primary-foreground/80 max-w-xl">
                    Anything Itech MV provides professional Wi-Fi, network, and IT services
                    for businesses in {town.name} and across Martha's Vineyard.
                  </p>
                </div>
                <Button asChild size="lg" variant="secondary" className="rounded-full shrink-0">
                  <Link to="/services/business-it">
                    <Wifi className="h-4 w-4 mr-2" />
                    Business IT Services
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Other Categories in This Town */}
      {otherTypesInTown.length > 0 && (
        <section className="py-16 border-t border-border">
          <div className="container-editorial">
            <h2 className="font-display text-xl mb-8">
              More in {town.name}
            </h2>
            <div className="flex flex-wrap gap-3">
              {otherTypesInTown.map((type) => {
                const TypeIcon = typeIcons[type.slug] || Building2;
                const count = type.byTown[town.slug] || 0;
                return (
                  <Link
                    key={type.slug}
                    to={getTownBusinessTypeUrl(town.slug, type.slug)}
                    className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full hover:border-accent transition-colors"
                  >
                    <TypeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm">{type.pluralName}</span>
                    <span className="text-xs text-muted-foreground">({count})</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Cross Links */}
      <section className="py-12 border-t border-border bg-surface">
        <div className="container-editorial flex flex-wrap items-center justify-between gap-4">
          <Link
            to={getTownUrl(town.slug)}
            className="flex items-center gap-2 text-sm hover:text-accent transition-colors"
          >
            <MapPin className="h-4 w-4" />
            All businesses in {town.name}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            to={getBusinessTypeUrl(businessType.slug)}
            className="flex items-center gap-2 text-sm hover:text-accent transition-colors"
          >
            <Icon className="h-4 w-4" />
            All {businessType.pluralName} on the island
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </SiteLayout>
  );
}
