import Link from 'next/link';
import Image from 'next/image';

const services = [
  { name: 'iPhone Repair', href: '/iphone-repair' },
  { name: 'Mac Repair', href: '/mac-repair-services' },
  { name: 'Network Services', href: '/network-services-2' },
];

const company = [
  { name: 'About Us', href: '/about-us' },
  { name: 'Contact', href: '/contact' },
  { name: 'MV Business Directory', href: '/marthas-vineyard-business-directory' },
];

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <div className="footer-grid">
        {/* Brand Column */}
        <div className="footer-brand">
          <Link href="/">
            <Image
              src="/images/AnythingiTech-banner-small.png"
              alt="Anything iTech Martha's Vineyard"
              width={180}
              height={54}
              className="footer-brand__logo"
            />
          </Link>
          <p className="footer-brand__tagline">
            Your trusted Apple specialist on Martha&apos;s Vineyard. Professional iPhone repair, Mac service, and network solutions.
          </p>
        </div>

        {/* Services Column */}
        <div className="footer-column">
          <h3>Services</h3>
          <ul className="footer-links">
            {services.map((item) => (
              <li key={item.name}>
                <Link href={item.href}>{item.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company Column */}
        <div className="footer-column">
          <h3>Company</h3>
          <ul className="footer-links">
            {company.map((item) => (
              <li key={item.name}>
                <Link href={item.href}>{item.name}</Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact Column */}
        <div className="footer-column">
          <h3>Contact</h3>
          <ul className="footer-links">
            <li>
              <a href="tel:508-560-3510">(508) 560-3510</a>
            </li>
            <li>
              <a href="mailto:louis@anythingitechmv.com">Email Us</a>
            </li>
            <li>Martha&apos;s Vineyard, MA</li>
          </ul>

          {/* Social Links */}
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <a
              href="https://www.facebook.com/AnythingiTechMV/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
            >
              <Image src="/images/iphone/facebook.png" alt="Facebook" width={30} height={30} />
            </a>
            <a
              href="https://www.linkedin.com/in/louis-hall-78969244/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
            >
              <Image src="/images/iphone/linkedin.png" alt="LinkedIn" width={30} height={30} />
            </a>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="footer-bottom">
        <p className="footer-copyright">
          &copy; {currentYear} Anything iTech Martha&apos;s Vineyard. All rights reserved.
        </p>
        <p className="footer-copyright">
          Serving Martha&apos;s Vineyard with premium Apple services.
        </p>
      </div>
    </footer>
  );
}
