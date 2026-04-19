import type { Metadata } from 'next';
import CTASection from '@/components/CTASection';

export const metadata: Metadata = {
  title: 'About Us',
  description: "Learn about Anything iTech Martha's Vineyard. Founded in 2008, we're your trusted Apple specialist on the island. ACMT certified, 15+ years experience.",
  keywords: ["About Anything iTech", "Louis Hall", "Apple certified", "Martha's Vineyard tech support", "ACMT certified"],
};

export default function AboutPage() {
  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1 className="page-header__title">About Us</h1>
          <p className="page-header__subtitle">
            Your trusted Apple specialist on Martha&apos;s Vineyard since 2008
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-area">
        <div className="container max-w-4xl">

          <h2 className="text-center">Our name and how we started</h2>

          <p>
            Anything iTech Martha&apos;s Vineyard began in 2008, as Anything Apple Martha&apos;s Vineyard, when Louis first began his teaching career. Unfortunately, the salary at the beginning of a teaching career was quite low, so he put his computer skills to the test working fiendishly after hours and on the weekends for friends and family. Over time his connection to the community grew and demand for his services grew as well. Our dedicated clients are the heart of our business. We wouldn&apos;t be here today without them!
          </p>

          <p>
            In 2012 Louis took his ACMT and became an Apple Certified Macintosh Technician, which is the highest level of certification that one can achieve in the Apple world.
          </p>

          <p>
            In 2017, Apple took down the Anything Apple Facebook page without any warning and forced the name change from Anything Apple Martha&apos;s Vineyard to Anything iTech Martha&apos;s Vineyard. It wasn&apos;t fun, but worked out .... ok. We are happy to be back up and running under the new name without any fear of reprisals from Apple.
          </p>

          <hr className="my-8 border-[var(--color-border-light)]" />

          <h2 className="text-center">What we used to do and what we do now</h2>

          <p>
            When we first started out, the world of computing was very different from what it is today. The idea behind &ldquo;Anything&rdquo; was that we truly serviced &ldquo;anything&rdquo; that Apple created. There were no iPhones, no Apple Watches, no iPads. Our work focused primarily on client issues ranging from managing printers and networks to replacing hard drives and solving software issues. We often repaired iPods and replaced MacBook and MacBook Pro screens as well. Ten years ago we saw much more liquid damage in laptops than we do today, primarily because, we believe, people used their laptops more.
          </p>

          <p>
            As time passed and the advent of the iPhone and iPad occurred we began to see a change in the balance of what we were servicing for clients from computers to iPhones. Over time, Apple has created products that are less and less serviceable. Unfortunately, it seems to be part of their business model, but we have worked hard to learn the nuances of the new technologies that they have produced and look forward to continuing to keep our hands on all of the new tech as it comes out!
          </p>

          <hr className="my-8 border-[var(--color-border-light)]" />

          <h2 className="text-center">Anything iTech Martha&apos;s Vineyard today</h2>

          <p>
            Today, we offer repair and support for Apple products to residential and business clients on the island of Martha&apos;s Vineyard. Anything iTech Martha&apos;s Vineyard specializes in Apple iPhone glass repair and provides full service, support and maintenance solutions for Mac and PC computers for the home and office.
          </p>

          {/* Credentials */}
          <div className="grid md:grid-cols-3 gap-6 my-12">
            <div className="bg-[var(--color-bg-tertiary)] rounded-2xl p-6 text-center">
              <div className="text-4xl font-bold text-[var(--color-primary)] mb-2">2008</div>
              <p className="text-[var(--color-text-secondary)]">Founded</p>
            </div>
            <div className="bg-[var(--color-bg-tertiary)] rounded-2xl p-6 text-center">
              <div className="text-4xl font-bold text-[var(--color-primary)] mb-2">ACMT</div>
              <p className="text-[var(--color-text-secondary)]">Apple Certified</p>
            </div>
            <div className="bg-[var(--color-bg-tertiary)] rounded-2xl p-6 text-center">
              <div className="text-4xl font-bold text-[var(--color-primary)] mb-2">15+</div>
              <p className="text-[var(--color-text-secondary)]">Years Experience</p>
            </div>
          </div>

          <div className="bg-[var(--color-bg-tertiary)] rounded-2xl p-8 my-12 text-center">
            <h3 className="text-xl mb-4">Our services are by APPOINTMENT ONLY</h3>
            <p className="mb-6">Please first call to schedule a time with us!</p>
            <p className="mb-4">Using your iPhone or Apple computer you can send us a text at:</p>
            <a href="tel:508-560-3510" className="text-4xl font-bold text-[var(--color-primary)] hover:underline">
              (508) 560-3510
            </a>
            <p className="mt-6">
              ...or drop us an{' '}
              <a href="mailto:louis@anythingitechmv.com" className="font-semibold">
                e-Mail
              </a>{' '}
              for information on how to get it looking and working as good as new!
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <CTASection />
    </>
  );
}
