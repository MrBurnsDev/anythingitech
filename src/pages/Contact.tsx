import { useEffect, useRef, useState } from "react";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { MapPin, Clock, ArrowRight, Loader2, Phone, MessageSquare } from "lucide-react";
import { toast } from "sonner";

// Cloudflare Turnstile site key — public by design (safe to ship to browser).
// Set VITE_CLOUDFLARE_TURNSTILE_SITE_KEY in .env / Vercel env.
const TURNSTILE_SITE_KEY = import.meta.env.VITE_CLOUDFLARE_TURNSTILE_SITE_KEY as string | undefined;

const TOWNS = [
  "Aquinnah",
  "Chilmark",
  "Edgartown",
  "Oak Bluffs",
  "Vineyard Haven",
  "West Tisbury",
  "Other / Not sure",
] as const;

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        opts: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
          size?: "normal" | "compact" | "invisible" | "flexible";
          appearance?: "always" | "execute" | "interaction-only";
        }
      ) => string;
      reset: (widgetId?: string) => void;
    };
  }
}

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const formLoadedAtRef = useRef<number>(Date.now());
  const turnstileTokenRef = useRef<string>("");
  const turnstileWidgetRef = useRef<string>("");
  const turnstileContainerRef = useRef<HTMLDivElement>(null);

  // Mount Turnstile in managed mode. Renders an unobtrusive widget that
  // self-resolves for most users; only shows a challenge when Cloudflare
  // detects suspicious behavior.
  useEffect(() => {
    formLoadedAtRef.current = Date.now();
    if (!TURNSTILE_SITE_KEY) return;

    const SCRIPT_ID = "cf-turnstile-script";
    const renderWidget = () => {
      if (!window.turnstile || !turnstileContainerRef.current) return;
      // Avoid double-render in StrictMode
      if (turnstileWidgetRef.current) return;
      turnstileWidgetRef.current = window.turnstile.render(turnstileContainerRef.current, {
        sitekey: TURNSTILE_SITE_KEY,
        size: "flexible",
        appearance: "interaction-only",
        callback: (token: string) => { turnstileTokenRef.current = token; },
        "expired-callback": () => { turnstileTokenRef.current = ""; },
        "error-callback": () => { turnstileTokenRef.current = ""; },
      });
    };

    if (window.turnstile) {
      renderWidget();
      return;
    }
    if (!document.getElementById(SCRIPT_ID)) {
      const s = document.createElement("script");
      s.id = SCRIPT_ID;
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
      s.async = true;
      s.defer = true;
      s.onload = renderWidget;
      document.head.appendChild(s);
    }
  }, []);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    // Build payload + spam-protection signals
    const data: Record<string, unknown> = Object.fromEntries(formData.entries());
    data.form_loaded_at = formLoadedAtRef.current;
    data.turnstile_token = turnstileTokenRef.current;

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        toast.success("Thanks — we'll be in touch within one business day.");
        form.reset();
        // Reset Turnstile so user can submit again
        turnstileTokenRef.current = "";
        if (window.turnstile && turnstileWidgetRef.current) {
          window.turnstile.reset(turnstileWidgetRef.current);
        }
      } else if (response.status === 429) {
        toast.error("You've sent a few messages recently — please wait a bit before sending another.");
      } else if (response.status === 400) {
        // Generic — covers turnstile_failed and validation_failed
        toast.error("Please try submitting again, or call (508) 560-3510.");
      } else {
        toast.error("Something went wrong. Please try again or call (508) 560-3510.");
      }
    } catch {
      toast.error("Something went wrong. Please try again or call (508) 560-3510.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SiteLayout>
      <SEO
        title="Contact | Anything IT Tech Martha's Vineyard"
        description="Contact Anything IT Tech for tech support on Martha's Vineyard. Call (508) 560-3510 or schedule an appointment."
        canonical="https://anythingitechmv.com/contact"
      />
      {/* Header */}
      <section className="relative pt-32 pb-16 md:pt-40 md:pb-20 overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-overlay opacity-60 pointer-events-none" />
        <div className="container-editorial relative">
          <p className="eyebrow mb-6">Contact</p>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-end">
            <h1 className="lg:col-span-8 display-xl text-balance animate-fade-up">
              Get in touch.
            </h1>
            <p className="lg:col-span-4 text-base text-muted-foreground leading-relaxed animate-fade-up-delay-1">
              Call (508) 560-3510 or send us a message. Service by appointment.
              We'll respond within one business day.
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
                <select
                  id="town"
                  name="town"
                  defaultValue=""
                  className="h-12 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="">Select a town</option>
                  {TOWNS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
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
                <option>3D Printing & Custom Fabrication</option>
                <option>Something else / not sure</option>
              </select>
            </div>

            <div className="space-y-2 mt-6">
              <Label htmlFor="message" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Tell us about your project</Label>
              <Textarea id="message" name="message" rows={6} className="rounded-md bg-background resize-none" placeholder="A few sentences about what you'd like help with..." />
            </div>

            {/*
              Honeypot field. Visually hidden, hidden from assistive tech, and
              flagged to autofill systems as off. Real users will never touch
              this; bots that auto-fill every input will, and the server will
              silently drop their submission.
            */}
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                left: "-10000px",
                top: "auto",
                width: "1px",
                height: "1px",
                overflow: "hidden",
              }}
            >
              <label htmlFor="company_website">Company website (leave blank)</label>
              <input
                id="company_website"
                name="company_website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* Cloudflare Turnstile — managed mode. Renders compactly; only
                shows interaction when Cloudflare detects suspicious behavior. */}
            {TURNSTILE_SITE_KEY && (
              <div ref={turnstileContainerRef} className="mt-6" />
            )}

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
                <h3 className="font-display text-2xl mb-6">Contact us directly</h3>
                <ul className="space-y-5">
                  <li className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-accent mt-0.5 shrink-0" strokeWidth={1.5} />
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-primary-foreground/50 mb-1">Phone</div>
                      <a href="tel:+15085603510" className="text-[15px] link-underline">(508) 560-3510</a>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 text-accent mt-0.5 shrink-0" strokeWidth={1.5} />
                    <div>
                      <div className="text-xs uppercase tracking-[0.18em] text-primary-foreground/50 mb-1">Message</div>
                      <p className="text-[15px]">Use the form to request a visit</p>
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
