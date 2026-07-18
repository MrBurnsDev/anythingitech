import { Link } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SEO } from "@/components/SEO";
import techTips from "@/data/tech-tips.json";
import { CalendarDays, ArrowRight, Lightbulb } from "lucide-react";

export default function TechTipsIndex() {
  return (
    <SiteLayout>
      <SEO
        title="Tech Tips - Martha's Vineyard IT"
        description="Technology tips, guides, and insights from Louis Hall at Martha's Vineyard IT. Learn about networking, Mac repair, iPhone tips, and more."
        canonical="https://anythingitechmv.com/tech-tips"
      />

      {/* Hero */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-overlay opacity-60 pointer-events-none" />
        <div className="container-editorial relative">
          <p className="eyebrow mb-6">Blog</p>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            <h1 className="lg:col-span-8 display-xl text-balance animate-fade-up">
              Tech Tips
            </h1>
            <p className="lg:col-span-4 text-base text-muted-foreground leading-relaxed animate-fade-up-delay-1">
              Technology insights, guides, and tips from Louis Hall at Martha's Vineyard IT.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-12 flex flex-wrap gap-8 text-sm animate-fade-up-delay-2">
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-accent" />
              <span className="font-medium">{techTips.length}</span>
              <span className="text-muted-foreground">Articles</span>
            </div>
          </div>
        </div>
      </section>

      {/* Articles List */}
      <section className="py-16 md:py-24">
        <div className="container-editorial">
          <div className="space-y-8">
            {techTips.map((tip, index) => (
              <Link
                key={tip.id}
                to={`/tech-tips/${tip.slug}`}
                className="group block bg-card border border-border rounded-xl hover:shadow-[var(--shadow-card)] transition-all duration-300 overflow-hidden"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex flex-col md:flex-row">
                  {tip.image && (
                    <div className="md:w-72 lg:w-80 shrink-0">
                      <img
                        src={tip.image}
                        alt={tip.title}
                        className="w-full h-48 md:h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex-1 p-6 md:p-8">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <CalendarDays className="h-4 w-4" />
                        {new Date(tip.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <h2 className="font-display text-xl md:text-2xl mb-3 group-hover:text-accent transition-colors">
                      {tip.title}
                    </h2>
                    <p className="text-muted-foreground line-clamp-2 mb-4">
                      {tip.excerpt}
                    </p>
                    {tip.tags && tip.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {tip.tags.slice(0, 3).map((tag: string) => (
                          <span
                            key={tag}
                            className="px-2 py-0.5 text-xs font-medium bg-accent/10 text-accent rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                        {tip.tags.length > 3 && (
                          <span className="px-2 py-0.5 text-xs text-muted-foreground">
                            +{tip.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm font-medium">
                      Read more
                      <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
