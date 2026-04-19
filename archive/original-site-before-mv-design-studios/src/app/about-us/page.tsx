import type { Metadata } from 'next';
import CTASection from '@/components/CTASection';

export const metadata: Metadata = {
  title: 'About Us',
  description: "Learn about Anything iTech Martha's Vineyard. Founded in 2008, we're your trusted Apple specialist on the island. ACMT certified, 15+ years experience.",
  keywords: ["About Anything iTech", "Louis Hall", "Apple certified", "Martha's Vineyard tech support", "ACMT certified"],
};

export default function AboutPage() {
  return (
    <div className="content-wrapper">
      {/* Page Header */}
      <div className="postwrap">
        <div className="hentry">
          <div className="copy">
            <div className="textcontent text-center">
              <h1 style={{ fontSize: '32px', fontWeight: 'normal', marginBottom: '12px' }}>About Us</h1>
              <p style={{ color: '#888' }}>
                Your trusted Apple specialist on Martha&apos;s Vineyard since 2008
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="postwrap">
        <div className="hentry">
          <div className="copy">
            <div className="textcontent">
              <h2 style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'normal', marginBottom: '20px' }}>
                Our name and how we started
              </h2>

              <p style={{ marginBottom: '16px', lineHeight: '1.7' }}>
                Anything iTech Martha&apos;s Vineyard began in 2008, as Anything Apple Martha&apos;s Vineyard, when Louis first began his teaching career. Unfortunately, the salary at the beginning of a teaching career was quite low, so he put his computer skills to the test working fiendishly after hours and on the weekends for friends and family. Over time his connection to the community grew and demand for his services grew as well. Our dedicated clients are the heart of our business. We wouldn&apos;t be here today without them!
              </p>

              <p style={{ marginBottom: '16px', lineHeight: '1.7' }}>
                In 2012 Louis took his ACMT and became an Apple Certified Macintosh Technician, which is the highest level of certification that one can achieve in the Apple world.
              </p>

              <p style={{ marginBottom: '16px', lineHeight: '1.7' }}>
                In 2017, Apple took down the Anything Apple Facebook page without any warning and forced the name change from Anything Apple Martha&apos;s Vineyard to Anything iTech Martha&apos;s Vineyard. It wasn&apos;t fun, but worked out .... ok. We are happy to be back up and running under the new name without any fear of reprisals from Apple.
              </p>

              <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '30px 0' }} />

              <h2 style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'normal', marginBottom: '20px' }}>
                What we used to do and what we do now
              </h2>

              <p style={{ marginBottom: '16px', lineHeight: '1.7' }}>
                When we first started out, the world of computing was very different from what it is today. The idea behind &ldquo;Anything&rdquo; was that we truly serviced &ldquo;anything&rdquo; that Apple created. There were no iPhones, no Apple Watches, no iPads. Our work focused primarily on client issues ranging from managing printers and networks to replacing hard drives and solving software issues. We often repaired iPods and replaced MacBook and MacBook Pro screens as well. Ten years ago we saw much more liquid damage in laptops than we do today, primarily because, we believe, people used their laptops more.
              </p>

              <p style={{ marginBottom: '16px', lineHeight: '1.7' }}>
                As time passed and the advent of the iPhone and iPad occurred we began to see a change in the balance of what we were servicing for clients from computers to iPhones. Over time, Apple has created products that are less and less serviceable. Unfortunately, it seems to be part of their business model, but we have worked hard to learn the nuances of the new technologies that they have produced and look forward to continuing to keep our hands on all of the new tech as it comes out!
              </p>

              <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '30px 0' }} />

              <h2 style={{ textAlign: 'center', fontSize: '24px', fontWeight: 'normal', marginBottom: '20px' }}>
                Anything iTech Martha&apos;s Vineyard today
              </h2>

              <p style={{ marginBottom: '16px', lineHeight: '1.7' }}>
                Today, we offer repair and support for Apple products to residential and business clients on the island of Martha&apos;s Vineyard. Anything iTech Martha&apos;s Vineyard specializes in Apple iPhone glass repair and provides full service, support and maintenance solutions for Mac and PC computers for the home and office.
              </p>

              <hr style={{ border: 'none', borderTop: '1px solid #ddd', margin: '30px 0' }} />

              <div style={{ textAlign: 'center', padding: '20px 0' }}>
                <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Our services are by APPOINTMENT ONLY</h3>
                <p style={{ marginBottom: '12px' }}>Please first call to schedule a time with us!</p>
                <p style={{ marginBottom: '12px' }}>Using your iPhone or Apple computer you can send us a text at:</p>
                <p>
                  <a href="tel:508-560-3510" style={{ fontSize: '28px', fontWeight: 'bold', color: '#0088CC' }}>
                    (508) 560-3510
                  </a>
                </p>
                <p style={{ marginTop: '16px' }}>
                  ...or drop us an{' '}
                  <a href="mailto:louis@anythingitechmv.com" style={{ fontWeight: 'bold' }}>
                    e-Mail
                  </a>{' '}
                  for information on how to get it looking and working as good as new!
                </p>
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
