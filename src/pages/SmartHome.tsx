import { SiteLayout } from "@/components/site/SiteLayout";
import { ServicePageContent } from "@/components/site/ServicePageContent";
import { CTASection } from "@/components/site/CTASection";
import sonosImg from "@/assets/sonos-shelf.jpg";

const SmartHome = () => (
  <SiteLayout>
    <ServicePageContent
      eyebrow="Smart Home & Sonos"
      title="A smart home that feels effortless — never complicated."
      overview="The best smart home is one you barely notice. We design, install, and quietly maintain integrated systems for lighting, audio, climate, and access — all controlled simply, from one app or a single tap."
      image={sonosImg}
      problems={[
        "Sonos speakers dropping out or refusing to group",
        "Smart bulbs and switches that won't stay connected",
        "Multiple apps for lighting, music, climate, and locks",
        "HomeKit, Alexa, or Google setup that never quite worked",
        "Security cameras with poor app reliability",
        "Smart thermostats fighting with HVAC schedules",
        "New homeowners inheriting unfamiliar smart systems",
        "Wanting a calm, premium audio experience throughout the home",
      ]}
      included={[
        "Sonos design, installation, and troubleshooting",
        "Architectural in-ceiling and in-wall audio",
        "Smart lighting design with Lutron or Caseta",
        "Smart locks, cameras, and access systems",
        "Apple HomeKit and Home app organization",
        "Smart thermostats and climate scheduling",
        "Single-app control and scenes ('Goodnight', 'Morning')",
        "Family training and clear documentation",
        "Ongoing support for additions and changes",
      ]}
      ideal={[
        "Homeowners who appreciate Sonos and quality sound",
        "Owners of new construction or renovations",
        "Buyers of homes with existing smart systems",
        "Anyone tired of juggling four different apps",
      ]}
      whyUs={[
        { title: "Restraint over gadgetry", body: "We recommend the fewest, most reliable products to do the job — never an excess of devices for their own sake." },
        { title: "Sonos and audio specialists", body: "Years of dedicated Sonos work means we know how to design, deploy, and quietly fix any wireless audio system." },
        { title: "One source of support", body: "When something acts up, you call one number. We diagnose across the entire ecosystem so you don't have to." },
      ]}
    />
    <CTASection title="Plan your smart home, calmly." description="From a single Sonos zone to a fully integrated home — we'd love to help." />
  </SiteLayout>
);

export default SmartHome;
