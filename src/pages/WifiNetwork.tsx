import { SiteLayout } from "@/components/site/SiteLayout";
import { ServicePageContent } from "@/components/site/ServicePageContent";
import { CTASection } from "@/components/site/CTASection";
import networkImg from "@/assets/network-rack.jpg";

const WifiNetwork = () => (
  <SiteLayout>
    <ServicePageContent
      eyebrow="Wi-Fi & Network Installation"
      title="Networks designed to disappear — and never let you down."
      overview="Whether you need full coverage in a sprawling shingled estate or rock-solid reliability in a busy office, we design and install networks engineered for the way you actually live and work."
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
        "Custom network design and equipment recommendation",
        "Premium Ubiquiti, Eero Pro, or business-grade gear",
        "Mesh and access-point systems for full coverage",
        "Structured Ethernet cabling and wall plates",
        "Secure guest networks and IoT segmentation",
        "Concealed installation and clean cable management",
        "Cloud-managed monitoring and ongoing support",
        "Documentation of your network for future reference",
      ]}
      ideal={[
        "Larger homes with multiple stories or out-buildings",
        "Vacation rentals needing reliable guest Wi-Fi",
        "Home offices with serious bandwidth demands",
        "Businesses requiring secure, multi-user networks",
      ]}
      whyUs={[
        { title: "Designed, not improvised", body: "Every network we install is planned with a survey, a diagram, and intention — not a router from the hardware store." },
        { title: "Premium equipment, properly managed", body: "We standardize on a small set of business-grade systems we trust, monitor remotely, and update proactively." },
        { title: "Cabling that's hidden, but accessible", body: "Clean conduit, labeled lines, and rack work that other technicians can actually maintain in the future." },
      ]}
    />
    <CTASection title="Coverage problems? Let's solve them properly." description="A site visit is the fastest way to a Wi-Fi network you stop thinking about." />
  </SiteLayout>
);

export default WifiNetwork;
