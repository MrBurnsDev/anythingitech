import Link from 'next/link';

interface CTASectionProps {
  title?: string;
  text?: string;
  showPhone?: boolean;
}

export default function CTASection({
  title = "Ready to Get Started?",
  text = "Whether you need iPhone repair, Mac service, or network setup, we're here to help. Contact us today for fast, professional service on Martha's Vineyard.",
  showPhone = true,
}: CTASectionProps) {
  return (
    <section className="cta-section">
      <div className="container">
        <div className="cta-block">
          <h2 className="cta-block__title">{title}</h2>
          <p className="cta-block__text">{text}</p>

          {showPhone && (
            <div className="phone-number mb-8">
              <a href="tel:508-560-3510">(508) 560-3510</a>
            </div>
          )}

          <div className="cta-block__actions">
            <a href="tel:508-560-3510" className="btn btn--primary btn--lg">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              Call Now
            </a>
            <Link href="/contact" className="btn btn--outline btn--lg">
              Send a Message
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
