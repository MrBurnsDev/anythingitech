import { Link } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import {
  towns,
  businessTypes,
  businesses,
  getTownUrl,
  getBusinessTypeUrl,
} from "@/data/directory";
import { BusinessCard } from "@/components/directory/BusinessCard";
import { useFeaturedBusinesses } from "@/hooks/useBusinesses";
import {
  MapPin,
  ArrowRight,
  ArrowUpRight,
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

export default function DirectoryIndex() {
  const { businesses: featuredBusinesses, isLoading: featuredLoading } = useFeaturedBusinesses(6);
  const downIslandTowns = towns.filter((t) => t.region === "down-island");
  const upIslandTowns = towns.filter((t) => t.region === "up-island");

  return (
    <SiteLayout>
      <SEO
        title="Martha's Vineyard Business Directory"
        description="Discover local businesses across all six towns of Martha's Vineyard. Find restaurants, lodging, shopping, contractors, and services throughout the island."
        canonical="https://anythingitechmv.com/marthas-vineyard"
        noEmailIndex
      />
      {/* Hero */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-overlay opacity-60 pointer-events-none" />
        <div className="container-editorial relative">
          <p className="eyebrow mb-6">Martha's Vineyard</p>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            <h1 className="lg:col-span-8 display-xl text-balance animate-fade-up">
              Island Business Directory
            </h1>
            <p className="lg:col-span-4 text-base text-muted-foreground leading-relaxed animate-fade-up-delay-1">
              Discover local businesses across all six towns of Martha's Vineyard.
              From restaurants to contractors, find trusted services throughout the island.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap gap-8 text-sm animate-fade-up-delay-2">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-accent" />
              <span className="font-medium">{businesses.length}</span>
              <span className="text-muted-foreground">Businesses</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-accent" />
              <span className="font-medium">6</span>
              <span className="text-muted-foreground">Towns</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-medium">{businessTypes.length}</span>
              <span className="text-muted-foreground">Categories</span>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Town */}
      <section className="py-24 md:py-32 bg-surface">
        <div className="container-editorial">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="max-w-2xl">
              <p className="eyebrow mb-5">By Location</p>
              <h2 className="display-lg text-balance">Browse by Town</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Explore businesses in each of Martha's Vineyard's six distinct towns,
                from the bustling ferry ports down-island to the quiet beauty up-island.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Down-Island */}
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Down-Island
              </h3>
              <div className="space-y-3">
                {downIslandTowns.map((town) => (
                  <Link
                    key={town.slug}
                    to={getTownUrl(town.slug)}
                    className="group flex items-center justify-between p-5 bg-card border border-border rounded-xl hover:shadow-[var(--shadow-card)] transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-secondary grid place-items-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-display text-lg">{town.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {town.businessCount} businesses
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </div>

            {/* Up-Island */}
            <div>
              <h3 className="text-xs uppercase tracking-[0.2em] text-muted-foreground mb-4">
                Up-Island
              </h3>
              <div className="space-y-3">
                {upIslandTowns.map((town) => (
                  <Link
                    key={town.slug}
                    to={getTownUrl(town.slug)}
                    className="group flex items-center justify-between p-5 bg-card border border-border rounded-xl hover:shadow-[var(--shadow-card)] transition-all duration-300"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-secondary grid place-items-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-display text-lg">{town.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {town.businessCount} businesses
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Browse by Category */}
      <section className="py-24 md:py-32 border-b border-border">
        <div className="container-editorial">
          <div className="max-w-2xl mb-16">
            <p className="eyebrow mb-5">By Category</p>
            <h2 className="display-lg text-balance">Browse by Business Type</h2>
            <p className="mt-4 text-muted-foreground leading-relaxed">
              Find what you need across the island, organized by service category.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {businessTypes.map((type) => {
              const Icon = typeIcons[type.icon] || Building2;
              return (
                <Link
                  key={type.slug}
                  to={getBusinessTypeUrl(type.slug)}
                  className="group card-service p-6 flex flex-col"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-10 w-10 rounded-lg bg-secondary grid place-items-center group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {type.businessCount}
                    </span>
                  </div>
                  <h3 className="font-display text-lg mb-1">{type.pluralName}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {type.shortDescription}
                  </p>
                  <div className="mt-4 pt-4 border-t border-border flex items-center gap-1.5 text-sm font-medium">
                    Browse
                    <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Businesses */}
      {(featuredBusinesses.length > 0 || featuredLoading) && (
        <section className="py-24 md:py-32 bg-surface">
          <div className="container-editorial">
            <div className="max-w-2xl mb-16">
              <p className="eyebrow mb-5">Featured</p>
              <h2 className="display-lg text-balance">Notable Island Businesses</h2>
              <p className="mt-4 text-muted-foreground leading-relaxed">
                Well-established businesses serving the Martha's Vineyard community.
              </p>
            </div>

            {featuredLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-card border border-border rounded-xl p-6 animate-pulse">
                    <div className="h-6 bg-secondary rounded w-3/4 mb-3" />
                    <div className="h-4 bg-secondary rounded w-1/2 mb-2" />
                    <div className="h-4 bg-secondary rounded w-2/3" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {featuredBusinesses.map((business) => (
                  <BusinessCard key={business.id} business={business} />
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {/* IT Services CTA */}
      <section className="py-24 md:py-32 border-t border-border">
        <div className="container-editorial">
          <div className="bg-primary text-primary-foreground rounded-xl p-10 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 grid-overlay-dark opacity-30 pointer-events-none" />
            <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div>
                <p className="eyebrow text-primary-foreground/60 mb-4">
                  <span className="text-primary-foreground/60">For Island Businesses</span>
                </p>
                <h2 className="display-md text-balance mb-4">
                  Need technology help for your business?
                </h2>
                <p className="text-primary-foreground/80 leading-relaxed max-w-lg">
                  Anything Itech MV provides professional IT support, Wi-Fi networks,
                  and technology services for businesses across Martha's Vineyard.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 lg:justify-end">
                <Button asChild size="lg" variant="secondary" className="rounded-full">
                  <Link to="/services/business-it">
                    <Wifi className="h-4 w-4 mr-2" />
                    Business IT Services
                  </Link>
                </Button>
                <Button asChild size="lg" variant="ghost" className="rounded-full text-primary-foreground hover:text-primary-foreground hover:bg-primary-foreground/10">
                  <Link to="/contact">
                    Contact Us <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Submit Business CTA */}
      <section className="py-16 border-t border-border">
        <div className="container-editorial text-center">
          <p className="text-muted-foreground mb-4">
            Own a business on Martha's Vineyard?
          </p>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/marthas-vineyard/submit">
              Submit Your Business <ArrowRight className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        </div>
      </section>
    </SiteLayout>
  );
}
