import Link from 'next/link';
import HeroSlider from '@/components/HeroSlider';
import CTASection from '@/components/CTASection';

const trustBadges = [
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
    text: 'Certified Technicians',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    text: 'Same-Day Service',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M12 2L2 7l10 5 10-5-10-5z"/>
        <path d="M2 17l10 5 10-5"/>
        <path d="M2 12l10 5 10-5"/>
      </svg>
    ),
    text: '15+ Years Experience',
  },
  {
    icon: (
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    text: "Martha's Vineyard Local",
  },
];

export default function HomePage() {
  return (
    <div className="content-wrapper">
      {/* Hero Slider */}
      <HeroSlider />

      {/* Trust Badges */}
      <section className="trust-badges">
        {trustBadges.map((badge, index) => (
          <div key={index} className="trust-badge">
            <div className="trust-badge__icon">{badge.icon}</div>
            <span className="trust-badge__text">{badge.text}</span>
          </div>
        ))}
      </section>

      {/* Intro Section */}
      <div className="postwrap">
        <div className="hentry">
          <div className="copy">
            <div className="textcontent text-center">
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '16px' }}>
                &ldquo;We make your Emergency, Ours.&rdquo;
              </h2>
              <p style={{ fontSize: '14px', maxWidth: '600px', margin: '0 auto' }}>
                Using technology shouldn&apos;t be a struggle! Let us help you maximize your efficiency and take command of your digital life.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Services Overview */}
      <div className="postwrap">
        <div className="hentry">
          <div className="copy">
            <div className="textcontent">
              <h2 style={{ textAlign: 'center', marginBottom: '24px' }}>Our Services</h2>
              <p style={{ textAlign: 'center', marginBottom: '32px' }}>
                Full service, support and maintenance solutions for all your Apple and PC needs.
              </p>

              <div className="services-grid">
                <div className="service-card">
                  <h3 className="service-card__title">Device Repairs</h3>
                  <ul className="service-list">
                    <li>Apple iPhone Glass Repairs</li>
                    <li>Mac and PC Laptop Screen Replacements</li>
                    <li>Keyboard Replacements</li>
                    <li>Memory Upgrades</li>
                    <li>Hard Drive Installations</li>
                  </ul>
                </div>

                <div className="service-card">
                  <h3 className="service-card__title">Support Services</h3>
                  <ul className="service-list">
                    <li>Hard Drive Data Backups</li>
                    <li>Mac OS Upgrades</li>
                    <li>Wireless Network Support</li>
                    <li>Network Security</li>
                    <li>Virus &amp; Malware Removal</li>
                  </ul>
                </div>

                <div className="service-card">
                  <h3 className="service-card__title">Setup &amp; Training</h3>
                  <ul className="service-list">
                    <li>Mac and PC Setup / Installation</li>
                    <li>Mac and PC Training / Tutoring</li>
                    <li>Remote Screen Sharing</li>
                    <li>Telephone Tech Support</li>
                  </ul>
                </div>
              </div>

              <p style={{ textAlign: 'center', marginTop: '32px', fontWeight: 'bold' }}>
                Although we provide services for anything Apple or PC, our specialty is Home Network Installation!
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* MV Business Directory Promo */}
      <div className="postwrap">
        <div className="hentry">
          <div className="copy">
            <div className="textcontent">
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
                <div>
                  <span style={{ color: '#b82286', fontWeight: 'bold', fontSize: '12px' }}>NEW</span>
                  <h2 style={{ marginTop: '8px', marginBottom: '16px' }}>
                    Martha&apos;s Vineyard Business Directory
                  </h2>
                  <p>
                    Discover local businesses across the Vineyard. Browse by town, search by category,
                    and connect with the island&apos;s best shops, restaurants, and services.
                  </p>
                  <Link href="/marthas-vineyard-business-directory" className="btn btn--primary">
                    Explore the Directory
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" style={{ marginLeft: '6px' }}>
                      <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
                    </svg>
                  </Link>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', textAlign: 'center' }}>
                  <div style={{ background: '#f5f5f5', borderRadius: '8px', padding: '16px' }}>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#0088CC', margin: 0 }}>6</p>
                    <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Towns</p>
                  </div>
                  <div style={{ background: '#f5f5f5', borderRadius: '8px', padding: '16px' }}>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#0088CC', margin: 0 }}>100+</p>
                    <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Businesses</p>
                  </div>
                  <div style={{ background: '#f5f5f5', borderRadius: '8px', padding: '16px' }}>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#0088CC', margin: 0 }}>20+</p>
                    <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>Categories</p>
                  </div>
                  <div style={{ background: '#f5f5f5', borderRadius: '8px', padding: '16px' }}>
                    <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#0088CC', margin: 0 }}>Free</p>
                    <p style={{ fontSize: '12px', color: '#888', margin: 0 }}>To Browse</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <CTASection />
    </div>
  );
}
