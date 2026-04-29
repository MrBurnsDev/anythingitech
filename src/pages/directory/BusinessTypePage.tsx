import { useParams, Link, Navigate } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SEO } from "@/components/SEO";
import { BusinessList } from "@/components/directory/BusinessList";
import {
  getBusinessTypeBySlug,
  getBusinessesByType,
  getTownsForBusinessType,
  getTownBusinessTypeUrl,
  businessTypes,
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
  Palette,
  Stethoscope,
} from "lucide-react";
import { Button } from "@/components/ui/button";

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

export default function BusinessTypePage() {
  const { slug } = useParams<{ slug: string }>();
  const businessType = getBusinessTypeBySlug(slug || "");

  if (!businessType) {
    return <Navigate to="/marthas-vineyard" replace />;
  }

  const typeBusinesses = getBusinessesByType(businessType.slug);
  const townsWithType = getTownsForBusinessType(businessType.slug);
  // Use icon field from JSON data to lookup the component
  const Icon = typeIcons[businessType.icon] || Building2;

  // Check if this is a business-relevant category for IT services CTA
  // These categories typically have businesses that need tech support
  const showITCTA = [
    "restaurantsand-food-and-beverages",
    "lodging-and-tourism",
    "shopping-and-specialty-retail",
    "beauty-and-wellness",
    "business-and-professional-services",
  ].includes(businessType.slug);

  return (
    <SiteLayout>
      <SEO
        title={`${businessType.pluralName} on Martha's Vineyard`}
        description={businessType.seoDescription}
        canonical={`https://anythingitechmv.com/marthas-vineyard/${businessType.slug}`}
        noEmailIndex
      />
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container-editorial py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/marthas-vineyard" className="hover:text-foreground transition-colors">
              Directory
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
          </div>
          <h1 className="display-xl text-balance mb-6 animate-fade-up">
            {businessType.pluralName} on Martha's Vineyard
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl animate-fade-up-delay-1">
            {businessType.description}
          </p>
          <div className="mt-8 flex items-center gap-2 text-sm animate-fade-up-delay-2">
            <Building2 className="h-4 w-4 text-accent" />
            <span className="font-medium">{typeBusinesses.length}</span>
            <span className="text-muted-foreground">businesses across {townsWithType.length} towns</span>
          </div>
        </div>
      </section>

      {/* Browse by Town */}
      {townsWithType.length > 1 && (
        <section className="py-12 bg-surface border-b border-border">
          <div className="container-editorial">
            <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
              {businessType.pluralName} by Town
            </h2>
            <div className="flex flex-wrap gap-3">
              {townsWithType.map((town) => {
                const count = businessType.byTown[town.slug] || 0;
                return (
                  <Link
                    key={town.slug}
                    to={getTownBusinessTypeUrl(town.slug, businessType.slug)}
                    className="group flex items-center gap-3 px-4 py-2.5 bg-card border border-border rounded-full hover:border-accent hover:bg-accent/5 transition-colors"
                  >
                    <MapPin className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                    <span className="text-sm font-medium">{town.name}</span>
                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                      {count}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* All Businesses */}
      <section className="py-16 md:py-24">
        <div className="container-editorial">
          <div className="mb-12">
            <h2 className="font-display text-2xl mb-2">
              All {businessType.pluralName}
            </h2>
            <p className="text-muted-foreground">
              Browse all {typeBusinesses.length} {businessType.name.toLowerCase()} businesses on Martha's Vineyard
            </p>
          </div>
          <BusinessList businesses={typeBusinesses} showTown={true} />
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
                  <p className="text-sm text-primary-foreground/60 mb-2">For Business Owners</p>
                  <h3 className="font-display text-2xl mb-2">
                    Need technology support for your {businessType.name.toLowerCase()}?
                  </h3>
                  <p className="text-primary-foreground/80 max-w-xl">
                    Anything Itech MV provides Wi-Fi networks, POS system support, and reliable IT services
                    for businesses across Martha's Vineyard.
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

      {/* Other Categories */}
      <section className="py-16 border-t border-border">
        <div className="container-editorial">
          <h2 className="font-display text-xl mb-8">Explore Other Categories</h2>
          <div className="flex flex-wrap gap-3">
            {businessTypes
              .filter((t) => t.slug !== businessType.slug)
              .map((type) => {
                const TypeIcon = typeIcons[type.icon] || Building2;
                return (
                  <Link
                    key={type.slug}
                    to={getBusinessTypeUrl(type.slug)}
                    className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full hover:border-accent transition-colors"
                  >
                    <TypeIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm">{type.pluralName}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </Link>
                );
              })}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
