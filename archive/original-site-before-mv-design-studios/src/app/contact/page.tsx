import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: "Contact Anything iTech Martha's Vineyard for iPhone repair, Mac service, and network solutions. Call (508) 560-3510 or email us. Serving all MV towns.",
  keywords: ["contact Anything iTech", "Martha's Vineyard tech support", "Apple repair contact", "tech support phone number"],
};

export default function ContactPage() {
  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1 className="page-header__title">Contact Us</h1>
          <p className="page-header__subtitle">
            Get in touch for all your Apple and tech support needs
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-area">
        <div className="container max-w-4xl">

          <h3 className="text-xl md:text-2xl text-center mb-8">
            Anything iTech Martha&apos;s Vineyard is there for all of your Apple based Residential and Business needs!
          </h3>

          <h3 className="text-center mb-8">
            Our services are by APPOINTMENT ONLY, so please first call to schedule a time with us!
          </h3>

          <h3 className="text-center mb-12">
            We are an Island raised Company and are proud to offer services to all of the towns on Martha&apos;s Vineyard. We offer house calls to Oak Bluffs, Vineyard Haven/Tisbury, Edgartown, West Tisbury, Menemsha, Chilmark, and Aquinnah.
          </h3>

          {/* Contact Cards */}
          <div className="grid md:grid-cols-2 gap-8 my-12">
            {/* Phone Card */}
            <div className="bg-[var(--color-bg-tertiary)] rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Text or Call Us</h3>
              <a href="tel:508-560-3510" className="text-3xl font-bold text-[var(--color-primary)] hover:underline">
                (508) 560-3510
              </a>
              <p className="text-[var(--color-text-secondary)] mt-4">
                Available for appointments
              </p>
            </div>

            {/* Email Card */}
            <div className="bg-[var(--color-bg-tertiary)] rounded-2xl p-8 text-center">
              <div className="w-16 h-16 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-6">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="white">
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Email Us</h3>
              <a href="mailto:louis@anythingitechmv.com" className="text-xl font-bold text-[var(--color-primary)] hover:underline">
                louis@anythingitechmv.com
              </a>
              <p className="text-[var(--color-text-secondary)] mt-4">
                We&apos;ll respond as soon as possible
              </p>
            </div>
          </div>

          {/* Location Info */}
          <div className="bg-white border border-[var(--color-border-light)] rounded-2xl p-8 my-12">
            <h3 className="text-xl font-semibold mb-6 text-center">Service Area</h3>
            <p className="text-center text-[var(--color-text-secondary)] mb-6">
              We provide on-site service to all towns on Martha&apos;s Vineyard:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-3">
                <Link href="/marthas-vineyard-businesses-vineyard-haven" className="font-medium hover:text-[var(--color-primary)]">
                  Vineyard Haven
                </Link>
              </div>
              <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-3">
                <Link href="/marthas-vineyard-businesses-oak-bluffs" className="font-medium hover:text-[var(--color-primary)]">
                  Oak Bluffs
                </Link>
              </div>
              <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-3">
                <Link href="/marthas-vineyard-businesses-edgartown" className="font-medium hover:text-[var(--color-primary)]">
                  Edgartown
                </Link>
              </div>
              <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-3">
                <Link href="/marthas-vineyard-businesses-west-tisbury" className="font-medium hover:text-[var(--color-primary)]">
                  West Tisbury
                </Link>
              </div>
              <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-3">
                <Link href="/marthas-vineyard-businesses-chilmark" className="font-medium hover:text-[var(--color-primary)]">
                  Chilmark
                </Link>
              </div>
              <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-3">
                <span className="font-medium">Menemsha</span>
              </div>
              <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-3">
                <Link href="/marthas-vineyard-businesses-aquinnah" className="font-medium hover:text-[var(--color-primary)]">
                  Aquinnah
                </Link>
              </div>
              <div className="bg-[var(--color-bg-tertiary)] rounded-lg p-3">
                <span className="font-medium">Tisbury</span>
              </div>
            </div>
          </div>

          {/* Owner Info */}
          <div className="text-center my-12">
            <h3 className="text-xl font-semibold mb-4">Anything iTech Martha&apos;s Vineyard</h3>
            <p className="text-[var(--color-text-secondary)]">
              <strong>Louis Hall</strong> - Owner and Operator
            </p>
            <p className="text-[var(--color-text-secondary)]">
              Vineyard Haven, MA 02568
            </p>
            <div className="flex justify-center gap-4 mt-6">
              <a
                href="https://www.facebook.com/AnythingiTechMV/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-text-tertiary)] hover:text-[var(--color-primary)] transition-colors"
              >
                Contact Us on Facebook!
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* CTA Section - Different style for contact page */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-block">
            <h2 className="cta-block__title">Ready to Schedule?</h2>
            <p className="cta-block__text">
              Our services are by appointment only. Give us a call or text to book your appointment today!
            </p>
            <div className="cta-block__actions">
              <a href="tel:508-560-3510" className="btn btn--primary btn--lg">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="mr-2">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                (508) 560-3510
              </a>
              <a href="mailto:louis@anythingitechmv.com" className="btn btn--outline btn--lg">
                Send an Email
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
