import { useEffect, useState } from "react";
import { Link, NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { Menu, X, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const nav = [
  { to: "/", label: "Home" },
  { to: "/services", label: "Services" },
  { to: "/services/apple-repair", label: "Apple Repair" },
  { to: "/services/wifi-network", label: "Wi-Fi & Network" },
  { to: "/services/smart-home", label: "Smart Home" },
  { to: "/services/tv-audio", label: "TV & Audio" },
  { to: "/services/business-it", label: "Business IT" },
  { to: "/about", label: "About" },
];

export const Header = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => { setOpen(false); }, [location.pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-background/85 backdrop-blur-xl border-b border-border"
          : "bg-transparent",
      )}
      style={{ transitionTimingFunction: "var(--ease-out-expo)" }}
    >
      <div className="container-editorial flex h-[68px] items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative h-8 w-8 rounded-md bg-primary text-primary-foreground grid place-items-center font-display text-lg leading-none">
            <span className="-mt-0.5">a</span>
            <span className="absolute -right-0.5 -bottom-0.5 h-1.5 w-1.5 rounded-full bg-accent" />
          </div>
          <div className="flex flex-col leading-tight">
            <span className="font-display text-[15px] tracking-tight">Anything Itech</span>
            <span className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground -mt-0.5">Martha's Vineyard</span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {nav.map((item) => (
            <RouterNavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "text-[13px] font-medium transition-colors link-underline",
                  isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )
              }
            >
              {item.label}
            </RouterNavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <a href="tel:+15085603510" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <Phone className="h-4 w-4" />
            <span>(508) 560-3510</span>
          </a>
          <Button asChild variant="default" size="default" className="rounded-full px-5">
            <Link to="/contact">Request a Visit</Link>
          </Button>
        </div>

        <button
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
          className="lg:hidden h-10 w-10 grid place-items-center rounded-md hover:bg-secondary transition-colors"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "lg:hidden overflow-hidden bg-background border-t border-border transition-[max-height] duration-500",
          open ? "max-h-[600px]" : "max-h-0",
        )}
        style={{ transitionTimingFunction: "var(--ease-out-expo)" }}
      >
        <div className="container-editorial py-6 flex flex-col gap-1">
          {nav.map((item) => (
            <RouterNavLink
              key={item.to}
              to={item.to}
              end={item.to === "/"}
              className={({ isActive }) =>
                cn(
                  "py-3 text-base border-b border-border/60 transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground",
                )
              }
            >
              {item.label}
            </RouterNavLink>
          ))}
          <a href="tel:+15085603510" className="mt-4 flex items-center justify-center gap-2 py-3 text-base text-muted-foreground">
            <Phone className="h-4 w-4" />
            <span>(508) 560-3510</span>
          </a>
          <Button asChild className="mt-2 rounded-full">
            <Link to="/contact">Request a Visit</Link>
          </Button>
        </div>
      </div>
    </header>
  );
};
