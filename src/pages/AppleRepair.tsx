import { SiteLayout } from "@/components/site/SiteLayout";
import { ServicePageContent } from "@/components/site/ServicePageContent";
import { CTASection } from "@/components/site/CTASection";
import appleImg from "@/assets/apple-desk.jpg";

const AppleRepair = () => (
  <SiteLayout>
    <ServicePageContent
      eyebrow="Apple Repair & Support"
      title="Quietly expert care for every Mac, iPhone, and iPad."
      overview="From a single Mac tune-up to a household of devices, we provide thoughtful Apple service rooted in years of hands-on experience. No call centers, no waiting weeks for a Genius Bar appointment off-island."
      image={appleImg}
      problems={[
        "Mac running slowly or unexpectedly quitting",
        "macOS updates that won't complete",
        "Battery, screen, or keyboard hardware issues",
        "iCloud, Apple ID, and family sharing confusion",
        "Migrating to a new Mac or iPhone",
        "Time Machine and backup setup",
        "Photos and Music library cleanup",
        "Email, Calendar, and Contacts sync issues",
      ]}
      included={[
        "Free initial diagnostic conversation",
        "On-site or pickup service across the island",
        "Hardware repair coordination with Apple",
        "macOS optimization and tuning",
        "Secure data migration to new devices",
        "Backup setup with Time Machine and cloud",
        "Apple ID, iCloud, and Family Sharing setup",
        "Software cleanup and ongoing maintenance",
        "Patient, plain-language guidance",
      ]}
      ideal={[
        "Homeowners with one or many Apple devices",
        "Families needing iCloud and sharing organized",
        "Professionals relying on a Mac for daily work",
        "Anyone who values calm, knowledgeable help",
      ]}
      whyUs={[
        { title: "Apple-first expertise", body: "We work with Macs and iOS devices every single day. We know the quirks, the workarounds, and the right way." },
        { title: "Local, on-island service", body: "No mailing devices off-island. We come to you — or you drop off — and you get your device back quickly." },
        { title: "Honest recommendations", body: "Sometimes the right answer is a tune-up. Sometimes it's a new device. We'll tell you the truth either way." },
      ]}
    />
    <CTASection title="Need Apple help today?" description="Same-week appointments are typically available across Martha's Vineyard." />
  </SiteLayout>
);

export default AppleRepair;
