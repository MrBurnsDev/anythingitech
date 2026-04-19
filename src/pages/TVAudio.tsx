import { SiteLayout } from "@/components/site/SiteLayout";
import { ServicePageContent } from "@/components/site/ServicePageContent";
import { CTASection } from "@/components/site/CTASection";
import heroImg from "@/assets/hero-living-room.jpg";

const TVAudio = () => (
  <SiteLayout>
    <ServicePageContent
      eyebrow="TV, Audio & Home Tech"
      title="TV and audio installations that look — and sound — flawless."
      overview="From a single bedroom television to a multi-room media system, we install with the care you'd expect from a fine carpenter. Concealed wiring, perfectly level mounts, and audio that fills the room without dominating it."
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
        { title: "Architectural-quality install", body: "We treat wires like trim — hidden, intentional, and in line with the design of the room." },
        { title: "Calibrated picture and sound", body: "We don't just hang the TV. We tune the picture mode, balance the speakers, and verify it actually sounds right." },
        { title: "One simple way to use it", body: "We program controls so anyone in the house — guests included — can turn it on and watch without instruction." },
      ]}
    />
    <CTASection title="Planning a media install?" description="Ideal to involve us during renovations — but we work beautifully with finished spaces too." />
  </SiteLayout>
);

export default TVAudio;
