import { Link } from "react-router-dom";
import mvItLogo from "@/assets/mv-it-logo.png";

const cols = [
  {
    title: "Services",
    links: [
      { to: "/services/apple-repair", label: "Apple Repair & Support" },
      { to: "/services/wifi-network", label: "Wi-Fi & Network Installation" },
      { to: "/services/smart-home", label: "Smart Home & Sonos" },
      { to: "/services/tv-audio", label: "TV, Audio & Home Tech" },
      { to: "/services/business-it", label: "Business IT Support" },
    ],
  },
  {
    title: "Company",
    links: [
      { to: "/about", label: "About" },
      { to: "/services", label: "All Services" },
      { to: "/tech-tips", label: "Tech Tips" },
      { to: "/anything-itech-mv", label: "Formerly Anything iTech MV" },
      { to: "/contact", label: "Contact" },
    ],
  },
  {
    title: "Island Directory",
    links: [
      { to: "/marthas-vineyard", label: "Business Directory" },
      { to: "/marthas-vineyard/vineyard-haven", label: "Vineyard Haven" },
      { to: "/marthas-vineyard/edgartown", label: "Edgartown" },
      { to: "/marthas-vineyard/oak-bluffs", label: "Oak Bluffs" },
      { to: "/marthas-vineyard/submit", label: "Submit a Business" },
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
            <Link
              to="/"
              aria-label="Martha's Vineyard IT — Home"
              className="inline-block rounded-md bg-white px-3.5 py-2.5"
            >
              <img
                src={mvItLogo}
                alt="Martha's Vineyard IT"
                width={1257}
                height={168}
                className="h-8 w-auto"
              />
            </Link>
            <p className="mt-6 text-[15px] leading-relaxed text-primary-foreground/70 max-w-sm">
              Martha's Vineyard IT provides Managed IT services, business technology support,
              enterprise Wi-Fi and networking, Apple expertise, smart home integration, security
              cameras, and technology consulting for homes and businesses across Martha's Vineyard.
              Serving Martha's Vineyard since 2008.
            </p>
            <div className="mt-8 space-y-1.5 text-sm text-primary-foreground/70">
              <p>Martha's Vineyard, MA</p>
              <p>By appointment · Year-round service</p>
              <p>
                <a href="tel:+15085603510" className="text-primary-foreground hover:underline">(508) 560-3510</a>
                <span className="mx-2">·</span>
                <Link to="/contact" className="text-primary-foreground hover:underline">Request a visit</Link>
              </p>
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
          <p>© {new Date().getFullYear()} Martha's Vineyard IT. All rights reserved.</p>
          <p>Crafted on the island. Serving year-round.</p>
        </div>
      </div>
    </footer>
  );
};
