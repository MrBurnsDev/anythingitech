import { Check } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface ServicePageProps {
  eyebrow: string;
  title: string;
  overview: string;
  problems: string[];
  included: string[];
  ideal: string[];
  whyUs: { title: string; body: string }[];
  image: string;
}

export const ServicePageContent = ({
  eyebrow, title, overview, problems, included, ideal, whyUs, image,
}: ServicePageProps) => {
  return (
    <>
      {/* Header */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden">
        <div className="absolute inset-0 grid-overlay opacity-60 pointer-events-none" />
        <div className="container-editorial relative">
          <p className="eyebrow mb-6">{eyebrow}</p>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
            <h1 className="lg:col-span-8 display-xl text-balance animate-fade-up">{title}</h1>
            <p className="lg:col-span-4 text-base text-muted-foreground leading-relaxed animate-fade-up-delay-1">
              {overview}
            </p>
          </div>
        </div>
      </section>

      {/* Image */}
      <section className="relative">
        <div className="container-editorial">
          <div className="aspect-[21/9] w-full overflow-hidden rounded-xl bg-secondary">
            <img src={image} alt={title} className="h-full w-full object-cover" loading="lazy" />
          </div>
        </div>
      </section>

      {/* Problems + Included */}
      <section className="py-24 md:py-32">
        <div className="container-editorial grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5 lg:sticky lg:top-28 self-start">
            <p className="eyebrow mb-5">Common needs</p>
            <h2 className="display-md text-balance">Problems we solve.</h2>
            <p className="mt-5 text-muted-foreground leading-relaxed">
              Whether it's a single device or a complete network installation, we handle it.
              On-site service by appointment across Martha's Vineyard.
            </p>
          </div>
          <ul className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-x-8">
            {problems.map((p, i) => (
              <li key={p} className="py-5 border-b border-border flex items-start gap-3 text-[15px]">
                <span className="text-muted-foreground tabular-nums text-xs mt-1 w-6">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* What's included */}
      <section className="py-24 md:py-32 bg-surface border-y border-border">
        <div className="container-editorial">
          <div className="max-w-2xl mb-14">
            <p className="eyebrow mb-5">What's included</p>
            <h2 className="display-md text-balance">Every engagement, end to end.</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px bg-border rounded-xl overflow-hidden">
            {included.map((item) => (
              <div key={item} className="bg-card p-7 flex items-start gap-3">
                <div className="mt-1 h-5 w-5 rounded-full bg-accent/10 grid place-items-center shrink-0">
                  <Check className="h-3 w-3 text-accent" strokeWidth={3} />
                </div>
                <p className="text-[15px] leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ideal client + Why us */}
      <section className="py-24 md:py-32">
        <div className="container-editorial grid grid-cols-1 lg:grid-cols-2 gap-16">
          <div>
            <p className="eyebrow mb-5">Ideal client</p>
            <h3 className="display-md text-balance mb-8">Who this is for.</h3>
            <ul className="space-y-4">
              {ideal.map((i) => (
                <li key={i} className="flex items-start gap-3 text-[15px] leading-relaxed">
                  <span className="mt-2.5 h-1 w-4 bg-accent shrink-0" />
                  <span>{i}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow mb-5">Why Anything Itech MV</p>
            <h3 className="display-md text-balance mb-8">A different standard of service.</h3>
            <div className="space-y-7">
              {whyUs.map((w) => (
                <div key={w.title} className="border-l-2 border-accent pl-5">
                  <h4 className="font-display text-xl mb-1.5">{w.title}</h4>
                  <p className="text-muted-foreground leading-relaxed text-[15px]">{w.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mini CTA */}
      <section className="py-24 border-t border-border bg-surface">
        <div className="container-editorial flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h3 className="display-md text-balance">Ready to discuss your project?</h3>
            <p className="mt-3 text-muted-foreground">Year-round availability across Martha's Vineyard.</p>
          </div>
          <Button asChild size="lg" className="rounded-full self-start md:self-auto px-7">
            <Link to="/contact">Request a Visit <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>
      </section>
    </>
  );
};
