import { SiteLayout } from "@/components/site/SiteLayout";
import { ServicePageContent } from "@/components/site/ServicePageContent";
import { CTASection } from "@/components/site/CTASection";
import { SEO } from "@/components/SEO";
import networkImg from "@/assets/network-rack.jpg";

const WifiNetwork = () => (
  <SiteLayout>
    <SEO
      title="Wi-Fi & Network Installation | Martha's Vineyard"
      description="Professional Wi-Fi network installation using Ubiquiti enterprise-grade equipment. Full coverage for homes and businesses on Martha's Vineyard."
      canonical="https://anythingitechmv.com/services/wifi-network"
    />
    <ServicePageContent
      eyebrow="Wi-Fi & Network Installation"
      title="Wi-Fi network installation and troubleshooting."
      overview="Full-coverage wireless networks using Ubiquiti enterprise-grade equipment. We install, configure, and maintain networks for homes and businesses across Martha's Vineyard. Server maintenance, printer setup, and gaming networks included."
      image={networkImg}
      problems={[
        "Wi-Fi dead zones in upstairs bedrooms or guest houses",
        "Slow speeds when many devices are connected",
        "Unreliable streaming on smart TVs and Sonos",
        "Coverage that doesn't reach the patio, pool, or boathouse",
        "Constant disconnections during video calls",
        "Old consumer routers struggling with modern demands",
        "No structured cabling for offices or media rooms",
        "Guest networks needed for rentals or visitors",
      ]}
      included={[
        "On-site Wi-Fi survey and signal mapping",
        "Ubiquiti enterprise equipment installation",
        "Mesh and access-point systems for full coverage",
        "Structured Ethernet cabling and wall plates",
        "Business server maintenance and setup",
        "Printer and scanner network configuration",
        "Guest network setup for rentals and visitors",
        "Gaming network optimization",
        "Network troubleshooting and ongoing support",
      ]}
      ideal={[
        "Larger homes with multiple stories or out-buildings",
        "Vacation rentals needing reliable guest Wi-Fi",
        "Home offices with serious bandwidth demands",
        "Businesses requiring secure, multi-user networks",
      ]}
      whyUs={[
        { title: "Ubiquiti enterprise equipment", body: "We use Ubiquiti enterprise-grade equipment — the same hardware used by professional network installers worldwide." },
        { title: "Full coverage, properly installed", body: "Every network is planned with a site survey and installed for complete coverage, including guest houses and outdoor areas." },
        { title: "Ongoing support", body: "We troubleshoot network issues, maintain business servers, and provide ongoing support when you need it." },
      ]}
    />
    <CTASection title="Need a network installed or fixed?" description="Call (508) 560-3510 or request a visit online. Service by appointment." />
  </SiteLayout>
);

export default WifiNetwork;
