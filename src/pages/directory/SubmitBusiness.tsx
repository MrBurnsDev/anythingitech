import { useState } from "react";
import { Link } from "react-router-dom";
import { SiteLayout } from "@/components/site/SiteLayout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronRight,
  Building2,
  CheckCircle2,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";
import { businessTypes } from "@/data/directory";

const TOWNS = [
  "Vineyard Haven",
  "Edgartown",
  "Oak Bluffs",
  "West Tisbury",
  "Chilmark",
  "Aquinnah",
];

export default function SubmitBusiness() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());

    // Add checkbox value
    data.confirms_ownership = formData.get("confirms_ownership") ? "yes" : "no";

    try {
      const response = await fetch("/api/directory-submission", {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        setIsSubmitted(true);
        form.reset();
      } else {
        toast.error("Something went wrong. Please try again or contact us directly.");
      }
    } catch {
      toast.error("Something went wrong. Please try again or contact us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <SiteLayout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="container-editorial max-w-xl text-center py-24">
            <div className="h-16 w-16 rounded-full bg-accent/10 grid place-items-center mx-auto mb-8">
              <CheckCircle2 className="h-8 w-8 text-accent" />
            </div>
            <h1 className="display-md mb-4">Submission Received</h1>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Thank you for submitting your business. Our team will review your
              submission and may reach out if we need additional information.
              Approved listings typically appear within 5-7 business days.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild variant="outline" className="rounded-full">
                <Link to="/marthas-vineyard">
                  Browse Directory
                </Link>
              </Button>
              <Button
                variant="ghost"
                className="rounded-full"
                onClick={() => setIsSubmitted(false)}
              >
                Submit Another Business
              </Button>
            </div>
          </div>
        </div>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <SEO
        title="Submit Your Business - Martha's Vineyard Directory"
        description="Add your Martha's Vineyard business to our local directory. Free listing for island businesses. Submissions are reviewed before publication."
        canonical="https://anythingitechmv.com/marthas-vineyard/submit"
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
            <span className="text-foreground">Submit Your Business</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <section className="relative pt-16 pb-12 md:pt-20 md:pb-16 overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-overlay opacity-60 pointer-events-none" />
        <div className="container-editorial relative">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-12 w-12 rounded-xl bg-accent/10 grid place-items-center">
              <Building2 className="h-6 w-6 text-accent" />
            </div>
          </div>
          <h1 className="display-lg text-balance mb-6 animate-fade-up">
            Submit Your Business
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl animate-fade-up-delay-1">
            Add your Martha's Vineyard business to our local directory.
            Submissions are reviewed before publication to ensure quality and accuracy.
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="py-16 md:py-24">
        <div className="container-editorial">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            {/* Form */}
            <form onSubmit={onSubmit} className="lg:col-span-7 space-y-8">
              {/* Business Information */}
              <div className="space-y-6">
                <h2 className="font-display text-xl border-b border-border pb-4">
                  Business Information
                </h2>

                <div className="space-y-2">
                  <Label htmlFor="business_name" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Business Name *
                  </Label>
                  <Input
                    id="business_name"
                    name="business_name"
                    required
                    className="h-12 rounded-md bg-background"
                    placeholder="Your Business Name"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="town" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Town *
                    </Label>
                    <select
                      id="town"
                      name="town"
                      required
                      className="h-12 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">Select a town</option>
                      {TOWNS.map((town) => (
                        <option key={town} value={town}>
                          {town}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Business Category *
                    </Label>
                    <select
                      id="category"
                      name="category"
                      required
                      className="h-12 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">Select a category</option>
                      {businessTypes.map((type) => (
                        <option key={type.slug} value={type.name}>
                          {type.pluralName}
                        </option>
                      ))}
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Street Address
                  </Label>
                  <Input
                    id="address"
                    name="address"
                    className="h-12 rounded-md bg-background"
                    placeholder="123 Main Street"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Business Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    rows={4}
                    className="rounded-md bg-background resize-none"
                    placeholder="A brief description of your business (1-2 sentences)"
                  />
                  <p className="text-xs text-muted-foreground">
                    Keep it concise. We may edit for clarity and consistency.
                  </p>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-6">
                <h2 className="font-display text-xl border-b border-border pb-4">
                  Contact Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Business Phone
                    </Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      className="h-12 rounded-md bg-background"
                      placeholder="(508) 555-0123"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Business Email
                    </Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      className="h-12 rounded-md bg-background"
                      placeholder="info@yourbusiness.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="website" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Website
                  </Label>
                  <Input
                    id="website"
                    name="website"
                    type="url"
                    className="h-12 rounded-md bg-background"
                    placeholder="https://www.yourbusiness.com"
                  />
                </div>
              </div>

              {/* Your Information */}
              <div className="space-y-6">
                <h2 className="font-display text-xl border-b border-border pb-4">
                  Your Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="contact_name" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Your Name *
                    </Label>
                    <Input
                      id="contact_name"
                      name="contact_name"
                      required
                      className="h-12 rounded-md bg-background"
                      placeholder="Your full name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contact_email" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                      Your Email *
                    </Label>
                    <Input
                      id="contact_email"
                      name="contact_email"
                      type="email"
                      required
                      className="h-12 rounded-md bg-background"
                      placeholder="your@email.com"
                    />
                    <p className="text-xs text-muted-foreground">
                      We'll use this to contact you about your submission.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Additional Notes
                  </Label>
                  <Textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    className="rounded-md bg-background resize-none"
                    placeholder="Anything else you'd like us to know about your business"
                  />
                </div>

                <div className="flex items-start gap-3 pt-4">
                  <Checkbox id="confirms_ownership" name="confirms_ownership" />
                  <Label
                    htmlFor="confirms_ownership"
                    className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
                  >
                    I confirm that I am the owner or an authorized representative
                    of this business.
                  </Label>
                </div>
              </div>

              {/* Submit */}
              <div className="pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <p className="text-xs text-muted-foreground">
                  Submissions are reviewed before publication.
                </p>
                <Button
                  type="submit"
                  size="lg"
                  className="rounded-full px-8"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      Submitting...
                    </>
                  ) : (
                    <>
                      Submit Business
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </form>

            {/* Sidebar */}
            <aside className="lg:col-span-5 space-y-8">
              <div className="bg-surface border border-border rounded-xl p-8">
                <h3 className="font-display text-lg mb-4">How It Works</h3>
                <ol className="space-y-4">
                  <li className="flex gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-medium text-accent">
                      1
                    </span>
                    <div>
                      <div className="font-medium text-sm">Submit your business</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Fill out the form with accurate business information.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-medium text-accent">
                      2
                    </span>
                    <div>
                      <div className="font-medium text-sm">We review your submission</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Our team verifies and may enrich your listing details.
                      </p>
                    </div>
                  </li>
                  <li className="flex gap-4">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-xs font-medium text-accent">
                      3
                    </span>
                    <div>
                      <div className="font-medium text-sm">Your listing goes live</div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Approved listings appear in the directory within 5-7 days.
                      </p>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="bg-card border border-border rounded-xl p-8">
                <h3 className="font-display text-lg mb-4">Guidelines</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 shrink-0" />
                    Only businesses physically located on or serving Martha's Vineyard
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 shrink-0" />
                    Submissions are reviewed for accuracy and quality
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 shrink-0" />
                    We may edit descriptions for clarity and consistency
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 shrink-0" />
                    Inclusion is not guaranteed
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent mt-2 shrink-0" />
                    Listings are free of charge
                  </li>
                </ul>
              </div>

              <div className="text-sm text-muted-foreground">
                <p>
                  Questions?{" "}
                  <Link to="/contact" className="text-foreground hover:text-accent transition-colors underline">
                    Contact us
                  </Link>
                </p>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}
