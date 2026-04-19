import { useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, MapPin, Clock, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";

// Formspree form ID - set in Vercel environment variables as VITE_FORMSPREE_ID
const FORMSPREE_ID = import.meta.env.VITE_FORMSPREE_ID || "xwpovvdj";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        toast.success("Thanks — we'll be in touch within one business day.");
        form.reset();
      } else {
        toast.error("Something went wrong. Please try again or email us directly.");
      }
    } catch {
      toast.error("Something went wrong. Please try again or email us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      {/* Header */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-overlay opacity-60 pointer-events-none" />
        <div className="container-editorial relative">
          <p className="eyebrow mb-6">Contact</p>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            <h1 className="lg:col-span-8 display-xl text-balance animate-fade-up">
              Let's plan your project.
            </h1>
            <p className="lg:col-span-4 text-base text-muted-foreground leading-relaxed animate-fade-up-delay-1">
              Tell us about your home or business. We'll respond within one business day with a
              clear path forward — no obligation.
            </p>
          </div>
        </div>
      </section>

      {/* Form + info */}
      <section className="py-24 md:py-32">
        <div className="container-editorial grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Form */}
          <form onSubmit={onSubmit} className="lg:col-span-7 bg-card border border-border rounded-xl p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Full Name</Label>
                <Input id="name" name="name" required className="h-12 rounded-md bg-background" placeholder="Jane Smith" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Email</Label>
                <Input id="email" name="email" type="email" required className="h-12 rounded-md bg-background" placeholder="jane@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Phone</Label>
                <Input id="phone" name="phone" className="h-12 rounded-md bg-background" placeholder="(508) 555 0123" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="town" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Town</Label>
                <Input id="town" name="town" className="h-12 rounded-md bg-background" placeholder="Edgartown" />
              </div>
            </div>

            <div className="space-y-2 mt-6">
              <Label htmlFor="type" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Project Type</Label>
              <select id="type" name="project_type" className="h-12 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option>Apple Repair & Support</option>
                <option>Wi-Fi & Network Installation</option>
                <option>Smart Home & Sonos</option>
                <option>TV, Audio & Home Tech</option>
                <option>Business IT Support</option>
                <option>Something else / not sure</option>
              </select>
            </div>

            <div className="space-y-2 mt-6">
              <Label htmlFor="message" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Tell us about your project</Label>
              <Textarea id="message" name="message" rows={6} className="rounded-md bg-background resize-none" placeholder="A few sentences about what you'd like help with..." />
            </div>

            <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <p className="text-xs text-muted-foreground">We respond within one business day.</p>
              <Button type="submit" size="lg" className="rounded-full px-7" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    Send Inquiry <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </form>

          {/* Info */}
          <aside className="lg:col-span-5 space-y-8">
            <div className="bg-primary text-primary-foreground rounded-xl p-9 relative overflow-hidden">
              <div className="absolute inset-0 grid-overlay-dark opacity-30 pointer-events-none" />
              <div className="relative">
                <p className="eyebrow text-primary-foreground/60 mb-4">
                  <span className="text-primary-foreground/60">Direct</span>
                </p>
                <h3 className="font-display text-2xl mb-6">Prefer to reach us directly?</h3>
                <ul className="space-y-5">
                  <li className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-accent mt-0.5 shrink-0" strokeWidth={1.5} />
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-primary-foreground/50 mb-1">Email</div>
                      <a href="mailto:louis@anythingitechmv.com" className="text-[15px] link-underline">louis@anythingitechmv.com</a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-accent mt-0.5 shrink-0" strokeWidth={1.5} />
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-primary-foreground/50 mb-1">Service Area</div>
                      <p className="text-[15px]">All of Martha's Vineyard, year-round</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-accent mt-0.5 shrink-0" strokeWidth={1.5} />
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-primary-foreground/50 mb-1">Hours</div>
                      <p className="text-[15px]">By appointment · Mon–Sat</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="border border-border rounded-xl p-9">
              <p className="eyebrow mb-4">Service Towns</p>
              <ul className="grid grid-cols-2 gap-y-2.5 text-sm">
                {["Edgartown", "Vineyard Haven", "Oak Bluffs", "West Tisbury", "Chilmark", "Aquinnah"].map((t) => (
                  <li key={t} className="flex items-center gap-2">
                    <span className="h-1 w-3 bg-accent" /> {t}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </div>
      </section>
    </SiteLayout>
  );
};

export default Contact;
