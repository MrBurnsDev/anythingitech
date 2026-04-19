'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';

const navigation = [
  { name: 'Home', href: '/', isHome: true },
  {
    name: 'Services',
    href: '#',
    children: [
      { name: 'iPhone Repair', href: '/iphone-repair' },
      { name: 'Mac Repair', href: '/mac-repair-services' },
      { name: 'Network Services', href: '/network-services-2' },
    ]
  },
  { name: 'The Team', href: '/about-us' },
  { name: 'Remote Support', href: '/mac-repair-services' },
  { name: 'Tech Tips', href: '/network-services-2' },
  { name: 'Contact', href: '/contact' },
];

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  return (
    <header className="site-header">
      {/* Top Bar with Logo */}
      <div className="header-top">
        <div className="header-top__inner">
          {/* Logo */}
          <Link href="/" className="site-logo">
            <Image
              src="/images/AnythingiTech-banner-800-600.png"
              alt="Anything iTech Martha's Vineyard - Repair and support services for Apple products"
              width={800}
              height={200}
              className="site-logo__image"
              priority
            />
          </Link>

          {/* Social Icons */}
          <div className="header-icons">
            <a
              href="https://maps.google.com/?q=Marthas+Vineyard+MA"
              target="_blank"
              rel="noopener noreferrer"
              className="header-icon"
              aria-label="Find us on map"
            >
              <Image src="/images/iphone/map.png" alt="Map" width={50} height={50} />
            </a>
            <a
              href="mailto:info@anythingitechmv.com"
              className="header-icon"
              aria-label="Email us"
            >
              <Image src="/images/iphone/mail.png" alt="Email" width={50} height={50} />
            </a>
            <a
              href="https://www.linkedin.com/in/louis-hall-78969244/"
              target="_blank"
              rel="noopener noreferrer"
              className="header-icon"
              aria-label="LinkedIn"
            >
              <Image src="/images/iphone/linkedin.png" alt="LinkedIn" width={50} height={50} />
            </a>
            <a
              href="https://www.facebook.com/AnythingiTechMV/"
              target="_blank"
              rel="noopener noreferrer"
              className="header-icon"
              aria-label="Facebook"
            >
              <Image src="/images/iphone/facebook.png" alt="Facebook" width={50} height={50} />
            </a>
          </div>
        </div>
      </div>

      {/* Navigation Bar */}
      <nav className="site-nav">
        <div className="site-nav__inner">
          {/* Desktop Navigation */}
          <ul className="nav-menu">
            {navigation.map((item) => (
              <li
                key={item.name}
                className={`nav-menu__item ${item.children ? 'has-dropdown' : ''}`}
                onMouseEnter={() => item.children && setOpenDropdown(item.name)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                {item.isHome ? (
                  <Link href={item.href} className="nav-menu__link nav-menu__link--home">
                    <span className="sr-only">Home</span>
                  </Link>
                ) : item.children ? (
                  <>
                    <span className="nav-menu__link nav-menu__link--dropdown">
                      {item.name}
                      <svg className="dropdown-arrow" width="10" height="6" viewBox="0 0 10 6" fill="currentColor">
                        <path d="M5 6L0 0h10L5 6z"/>
                      </svg>
                    </span>
                    <ul className={`nav-dropdown ${openDropdown === item.name ? 'is-open' : ''}`}>
                      {item.children.map((child) => (
                        <li key={child.name} className="nav-dropdown__item">
                          <Link href={child.href} className="nav-dropdown__link">
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <Link href={item.href} className="nav-menu__link">
                    {item.name}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          {/* Search */}
          <div className="nav-search">
            <input
              type="search"
              placeholder="Search"
              className="nav-search__input"
            />
          </div>

          {/* Mobile Menu Toggle */}
          <button
            className="mobile-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle Menu"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {mobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-nav">
          {navigation.map((item) => (
            item.children ? (
              <div key={item.name} className="mobile-nav__group">
                <span className="mobile-nav__label">{item.name}</span>
                {item.children.map((child) => (
                  <Link
                    key={child.name}
                    href={child.href}
                    className="mobile-nav__link mobile-nav__link--sub"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {child.name}
                  </Link>
                ))}
              </div>
            ) : (
              <Link
                key={item.name}
                href={item.href}
                className="mobile-nav__link"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            )
          ))}
          <div className="mobile-nav__contact">
            <a href="tel:508-560-3510" className="btn btn--primary">
              Call (508) 560-3510
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
