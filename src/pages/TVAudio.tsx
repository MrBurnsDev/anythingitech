import { SiteLayout } from "@/components/site/SiteLayout";
import { ServicePageContent } from "@/components/site/ServicePageContent";
import { CTASection } from "@/components/site/CTASection";
import { SEO } from "@/components/SEO";
import heroImg from "@/assets/hero-living-room.jpg";

const TVAudio = () => (
  <SiteLayout>
    <SEO
      title="TV Mounting & Audio Setup | Martha's Vineyard"
      description="TV wall mounting with concealed wiring. Soundbar and home audio setup. Professional installation on Martha's Vineyard."
      canonical="https://anythingitechmv.com/services/tv-audio"
    />
    <ServicePageContent
      eyebrow="TV, Audio & Home Tech"
      title="TV mounting, soundbar setup, and home audio."
      overview="TV wall mounting with concealed wiring. Soundbar and receiver setup. Streaming device configuration. We install and configure your home entertainment system so it works reliably."
      image={heroImg}
      problems={[
        "Wires hanging visibly from a wall-mounted television",
        "Soundbars or receivers that aren't properly tuned",
        "Multiple remotes and inputs no one understands",
        "TVs mounted at the wrong height or angle",
        "Outdoor TVs that struggle with weather and glare",
        "Streaming sticks and inputs that constantly need re-pairing",
        "AV receivers and speakers wired without thought",
        "New construction needing pre-wire planning",
      ]}
      included={[
        "Wall and articulating mount installation",
        "In-wall power and HDMI concealment",
        "Soundbar, receiver, and surround setup",
        "Picture calibration and proper aspect ratios",
        "Apple TV, Roku, and streaming device configuration",
        "Universal or app-based remote programming",
        "Outdoor TV and weather-rated audio installation",
        "Pre-wire consultation for new construction",
        "Tidy, removable cable management",
      ]}
      ideal={[
        "Homeowners installing or upgrading living-room TVs",
        "Owners building media rooms or home theaters",
        "Outdoor patio and pool-area entertainment",
        "Renovations requiring pre-wire planning",
      ]}
      whyUs={[
        { title: "Clean installation", body: "Wires concealed in the wall, level mounting, and proper cable management." },
        { title: "Configured correctly", body: "We set up picture modes, balance speakers, and configure your streaming devices so everything works." },
        { title: "Easy to use", body: "We set up remotes and apps so anyone in the house can turn it on and watch without confusion." },
      ]}
    />
    <CTASection title="Need a TV mounted?" description="Call (508) 560-3510 or request a visit online. Service by appointment." />
  </SiteLayout>
);

export default TVAudio;
