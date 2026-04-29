import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowUpRight } from "lucide-react";

export const CTASection = ({
  title = "Need help with your technology?",
  description = "Call (508) 560-3510 or request a visit online. Service by appointment.",
}: {
  title?: string;
  description?: string;
}) => {
  return (
    <section className="relative bg-primary text-primary-foreground overflow-hidden">
      <div className="absolute inset-0 grid-overlay-dark opacity-40 pointer-events-none" />
      <div
        className="absolute -right-32 -top-32 h-[500px] w-[500px] rounded-full opacity-30 blur-3xl"
        style={{ background: "radial-gradient(circle, hsl(var(--accent) / 0.5), transparent 70%)" }}
      />
      <div className="container-editorial relative py-24 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-end">
          <div className="lg:col-span-8">
            <p className="eyebrow mb-6 text-primary-foreground/60">
              <span className="text-primary-foreground/60">Get in touch</span>
            </p>
            <h2 className="display-lg text-balance">{title}</h2>
            <p className="mt-6 text-lg text-primary-foreground/70 max-w-xl text-pretty leading-relaxed">
              {description}
            </p>
          </div>
          <div className="lg:col-span-4 flex flex-col gap-3 lg:items-end">
            <Button asChild size="xl" variant="hero-outline" className="rounded-full w-full lg:w-auto">
              <Link to="/contact">
                Contact Us <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
            <a href="tel:+15085603510" className="text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors link-underline">
              (508) 560-3510
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};
