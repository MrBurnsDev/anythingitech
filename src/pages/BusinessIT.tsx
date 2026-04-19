import { SiteLayout } from "@/components/site/SiteLayout";
import { ServicePageContent } from "@/components/site/ServicePageContent";
import { CTASection } from "@/components/site/CTASection";
import officeImg from "@/assets/business-office.jpg";

const BusinessIT = () => (
  <SiteLayout>
    <ServicePageContent
      eyebrow="Business IT Support"
      title="Steady, professional IT for the businesses of Martha's Vineyard."
      overview="From boutique inns to professional offices and creative studios, we provide the technology backbone island businesses depend on. Networks, workstations, printers, and ongoing support — handled by people who pick up the phone."
      image={officeImg}
      problems={[
        "Office Wi-Fi that struggles during the busy season",
        "Printers and copiers that constantly need attention",
        "New employee onboarding and computer setup",
        "Shared file storage and Dropbox/Google Drive chaos",
        "Point-of-sale and payment device issues",
        "Slow, aging Macs and PCs that hurt productivity",
        "Email, calendar, and Microsoft 365 / Google Workspace headaches",
        "No clear plan for backups or business continuity",
      ]}
      included={[
        "Initial business technology audit",
        "Business-grade Wi-Fi and wired network design",
        "Workstation procurement, setup, and imaging",
        "Microsoft 365 and Google Workspace administration",
        "Shared file systems and cloud storage organization",
        "Printer, scanner, and POS device support",
        "Backup systems and disaster recovery planning",
        "On-call and scheduled monthly support visits",
        "Plain-English documentation for your team",
      ]}
      ideal={[
        "Inns, restaurants, and hospitality businesses",
        "Professional offices: legal, real estate, finance",
        "Creative studios, galleries, and shops",
        "Any island business without an in-house IT team",
      ]}
      whyUs={[
        { title: "Local, year-round availability", body: "Your IT support is on the island — not on hold. Same-day response during the busy season is the norm." },
        { title: "Apple and Windows fluent", body: "Mixed environments, mixed devices, no problem. We support whatever your team actually uses." },
        { title: "Quiet, proactive care", body: "We monitor the things that matter and fix small problems before they become outages or lost revenue." },
      ]}
    />
    <CTASection title="Let's audit your business technology." description="A free, no-obligation walkthrough to identify quick wins and long-term improvements." />
  </SiteLayout>
);

export default BusinessIT;
