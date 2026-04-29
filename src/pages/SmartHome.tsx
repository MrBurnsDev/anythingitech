import { SiteLayout } from "@/components/site/SiteLayout";
import { ServicePageContent } from "@/components/site/ServicePageContent";
import { CTASection } from "@/components/site/CTASection";
import sonosImg from "@/assets/sonos-shelf.jpg";

const SmartHome = () => (
  <SiteLayout>
    <ServicePageContent
      eyebrow="Smart Home & Sonos"
      title="A smart home that feels effortless — never complicated."
      overview="Smart home setup and integration — lighting, audio, climate, locks, and cameras. We install, configure, and maintain your smart devices so they work reliably. Sonos installation and troubleshooting included."
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
        { title: "Practical recommendations", body: "We recommend reliable products that work well together — not the most expensive or complicated options." },
        { title: "Sonos specialists", body: "Years of Sonos installation and troubleshooting experience. We set up whole-home audio that actually works." },
        { title: "One call for support", body: "When something stops working, call us. We troubleshoot across your entire system." },
      ]}
    />
    <CTASection title="Need smart home help?" description="Call (508) 560-3510 or request a visit online. Service by appointment." />
  </SiteLayout>
);

export default SmartHome;
