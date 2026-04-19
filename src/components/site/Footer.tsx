import { Link } from "react-router-dom";

const cols = [
  {
    title: "Services",
    links: [
      { to: "/apple-repair", label: "Apple Repair & Support" },
      { to: "/wifi-network", label: "Wi-Fi & Network Installation" },
      { to: "/smart-home", label: "Smart Home & Sonos" },
      { to: "/tv-audio", label: "TV, Audio & Home Tech" },
      { to: "/business-it", label: "Business IT Support" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/services", label: "All Services" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Service Area",
    links: [
      { to: "#", label: "Edgartown" },
      { to: "#", label: "Vineyard Haven" },
      { to: "#", label: "Oak Bluffs" },
      { to: "#", label: "Chilmark & Aquinnah" },
      { to: "#", label: "West Tisbury" },
    ],
  },
];

export const Footer = () => {
  return (
    <footer className="relative bg-primary text-primary-foreground">
      <div className="absolute inset-0 grid-overlay-dark opacity-40 pointer-events-none" />
      <div className="container-editorial relative py-20">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2.5">
              <div className="relative h-9 w-9 rounded-md bg-primary-foreground text-primary grid place-items-center font-display text-xl leading-none">
                <span className="-mt-0.5">a</span>
                <span className="absolute -right-0.5 -bottom-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
              </div>
              <div className="flex flex-col leading-tight">
                <span className="font-display text-base">Anything Itech</span>
                <span className="text-[10px] uppercase tracking-[0.25em] text-primary-foreground/60 -mt-0.5">Martha's Vineyard</span>
              </div>
            </div>
            <p className="mt-6 text-[15px] leading-relaxed text-primary-foreground/70 max-w-sm">
              White-glove technology service for the homes and businesses of Martha's Vineyard.
              Apple expertise, designed networks, and quietly reliable support.
            </p>
            <div className="mt-8 space-y-1.5 text-sm text-primary-foreground/70">
              <p>Martha's Vineyard, MA</p>
              <p>By appointment · Year-round service</p>
              <p className="text-primary-foreground">louis@anythingitechmv.com</p>
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.title} className="lg:col-span-2 lg:col-start-auto first:lg:col-start-6">
              <h4 className="text-[11px] uppercase tracking-[0.22em] text-primary-foreground/50 mb-5 font-sans font-medium">
                {col.title}
              </h4>
              <ul className="space-y-3">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      to={l.to}
                      className="text-sm text-primary-foreground/85 hover:text-primary-foreground transition-colors"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="hairline mt-16 bg-primary-foreground/10" />
        <div className="mt-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs text-primary-foreground/50">
          <p>© {new Date().getFullYear()} Anything Itech MV. All rights reserved.</p>
          <p>Crafted on the island. Serving year-round.</p>
        </div>
      </div>
    </footer>
  );
};
