import { SiteLayout } from "@/components/site/SiteLayout";
import { ServicePageContent } from "@/components/site/ServicePageContent";
import { CTASection } from "@/components/site/CTASection";
import appleImg from "@/assets/apple-desk.jpg";

const AppleRepair = () => (
  <SiteLayout>
    <ServicePageContent
      eyebrow="Apple Repair & Support"
      title="iPhone and Mac repair. Fast, local service."
      overview="15-minute iPhone screen repairs. Mac troubleshooting and repair. Logic board coordination, system cleanup, data migration, backup setup, and iCloud configuration. No waiting weeks for an off-island Genius Bar appointment. Service by appointment."
      image={appleImg}
      problems={[
        "Cracked or broken iPhone screen",
        "Mac running slowly or freezing",
        "Power port or charging issues",
        "Camera or speaker not working",
        "Liquid damage to phone or laptop",
        "Boot loop or startup problems",
        "iCloud, Apple ID, or Family Sharing confusion",
        "Need to migrate to a new Mac or iPhone",
      ]}
      included={[
        "iPhone screen repair (often 15 minutes)",
        "Power port and charging port replacement",
        "Camera and speaker repair",
        "Liquid damage assessment and repair",
        "Mac and PC repair and troubleshooting",
        "Logic board replacement coordination",
        "macOS and Windows system cleanup",
        "Time Machine and external drive backup setup",
        "Data migration to new devices",
        "iCloud, Apple ID, and Family Sharing setup",
        "Remote support via TeamViewer when appropriate",
      ]}
      ideal={[
        "Anyone with a broken iPhone screen or device issue",
        "Mac users experiencing slowdowns or problems",
        "Families needing iCloud and sharing set up",
        "Professionals relying on Apple devices for work",
      ]}
      whyUs={[
        { title: "ACMT Certified since 2012", body: "Apple Certified Macintosh Technician with years of hands-on experience with iPhones, Macs, and iPads." },
        { title: "Fast, local service", body: "No mailing devices off-island. We come to you or you drop off. iPhone screens often repaired in 15 minutes." },
        { title: "Honest recommendations", body: "Sometimes the right answer is a repair. Sometimes it's a new device. We'll tell you the truth either way." },
      ]}
    />
    <CTASection title="Need a repair?" description="Call (508) 560-3510 or request a visit online. Service by appointment." />
  </SiteLayout>
);

export default AppleRepair;
