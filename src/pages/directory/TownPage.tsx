import { useParams, Link, Navigate } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SEO } from "@/components/SEO";
import { BusinessList } from "@/components/directory/BusinessList";
import {
  getTownBySlug,
  getBusinessTypesForTown,
  getTownBusinessTypeUrl,
  businessTypes,
} from "@/data/directory";
import { useBusinesses } from "@/hooks/useBusinesses";
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
  Palette,
  Stethoscope,
} from "lucide-react";

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

export default function TownPage() {
  // Route passes 'slug' param from DirectorySlugResolver
  const { slug } = useParams<{ slug: string }>();
  const town = getTownBySlug(slug || "");

  // Fetch businesses from Supabase API
  const { businesses: townBusinesses, isLoading } = useBusinesses({ town: slug });
  const availableTypes = getBusinessTypesForTown(slug || "");

  if (!town) {
    return <Navigate to="/marthas-vineyard" replace />;
  }

  if (isLoading) {
    return (
      <SiteLayout>
        <div className="container-editorial py-24 text-center">
          <div className="animate-pulse text-muted-foreground">Loading businesses...</div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <SEO
        title={`Businesses in ${town.name}, Martha's Vineyard`}
        description={`${town.description} Browse ${townBusinesses.length} local businesses in ${town.name}.`}
        canonical={`https://anythingitechmv.com/marthas-vineyard/${town.slug}`}
      />
      {/* Breadcrumb */}
      <div className="border-b border-border">
        <div className="container-editorial py-4">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link to="/marthas-vineyard" className="hover:text-foreground transition-colors">
              Directory
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground">{town.name}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="relative pt-16 pb-12 md:pt-20 md:pb-16 overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-overlay opacity-60 pointer-events-none" />
        <div className="container-editorial relative">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
            <MapPin className="h-4 w-4 text-accent" />
            <span className="capitalize">{town.region.replace("-", " ")}</span>
          </div>
          <h1 className="display-xl text-balance mb-6 animate-fade-up">
            Businesses in {town.name}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl animate-fade-up-delay-1">
            {town.description}
          </p>
          <div className="mt-8 flex items-center gap-2 text-sm animate-fade-up-delay-2">
            <Building2 className="h-4 w-4 text-accent" />
            <span className="font-medium">{townBusinesses.length}</span>
            <span className="text-muted-foreground">businesses listed</span>
          </div>
        </div>
      </section>

      {/* Business Types in This Town */}
      {availableTypes.length > 1 && (
        <section className="py-12 bg-surface border-b border-border">
          <div className="container-editorial">
            <h2 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-6">
              Browse by Category in {town.name}
            </h2>
            <div className="flex flex-wrap gap-3">
              {availableTypes.map((type) => {
                const Icon = typeIcons[type.icon] || Building2;
                const count = type.byTown[town.slug] || 0;
                return (
                  <Link
                    key={type.slug}
                    to={getTownBusinessTypeUrl(town.slug, type.slug)}
                    className="group flex items-center gap-3 px-4 py-2.5 bg-card border border-border rounded-full hover:border-accent hover:bg-accent/5 transition-colors"
                  >
                    <Icon className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
                    <span className="text-sm font-medium">{type.pluralName}</span>
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
            <h2 className="font-display text-2xl mb-2">All Businesses</h2>
            <p className="text-muted-foreground">
              Browse all {townBusinesses.length} businesses in {town.name}
            </p>
          </div>
          <BusinessList businesses={townBusinesses} showTown={false} />
        </div>
      </section>

      {/* Other Towns */}
      <section className="py-16 border-t border-border bg-surface">
        <div className="container-editorial">
          <h2 className="font-display text-xl mb-8">Explore Other Towns</h2>
          <div className="flex flex-wrap gap-3">
            {["vineyard-haven", "edgartown", "oak-bluffs", "west-tisbury", "chilmark", "aquinnah"]
              .filter((slug) => slug !== town.slug)
              .map((slug) => {
                const otherTown = getTownBySlug(slug);
                if (!otherTown) return null;
                return (
                  <Link
                    key={slug}
                    to={`/marthas-vineyard/${slug}`}
                    className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-full hover:border-accent transition-colors"
                  >
                    <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-sm">{otherTown.name}</span>
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
