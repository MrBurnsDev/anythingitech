import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import CTASection from '@/components/CTASection';

export const metadata: Metadata = {
  title: 'iPhone Repair Services',
  description: "Professional iPhone screen repair and services on Martha's Vineyard. Same-day service, certified technicians. Screen replacement, battery, charging port repairs. Call (508) 560-3510.",
  keywords: ["iPhone repair Martha's Vineyard", "iPhone screen repair", "iPhone battery replacement", "cracked iPhone screen", "Apple repair"],
};

export default function IPhoneRepairPage() {
  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1 className="page-header__title">iPhone Repair Services</h1>
          <p className="page-header__subtitle">
            Professional iPhone repair with same-day service on Martha&apos;s Vineyard
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-area">
        <div className="container max-w-4xl">
          <Image
            src="/images/services_iphone-small.jpg"
            alt="iPhone Repair Services"
            width={880}
            height={300}
            className="w-full rounded-2xl mb-8"
          />

          <h3 className="text-xl md:text-2xl text-center mb-8">
            Do you have a cracked iPhone screen? We offer 15-minute iPhone screen replacement and repair and our services are by appointment only so there is very little waiting.
          </h3>

          <p>
            Did you drop your phone while strolling down the beautiful streets of{' '}
            <Link href="https://edgartown-ma.us" target="_blank" rel="noopener noreferrer" className="font-semibold">
              Edgartown
            </Link>{' '}
            or did your child fumble your iPhone while taking pictures of{' '}
            <Link href="http://mvpreservation.org/properties/flying-horses-carousel/" target="_blank" rel="noopener noreferrer" className="font-semibold">
              The Flying Horses Carousel
            </Link>{' '}
            in{' '}
            <Link href="https://www.oakbluffsma.gov" target="_blank" rel="noopener noreferrer" className="font-semibold">
              Oak Bluffs
            </Link>
            ? If so, we understand how important your iPhone is to you and are also well aware of time constraints while you are on vacation or if you juggle many jobs!
          </p>

          <p>
            We specialize in iPhone Glass repair and pride ourselves in speedy service. We repair screens in less time than it takes to get through from{' '}
            <Link href="https://www.tisburyma.gov" target="_blank" rel="noopener noreferrer" className="font-semibold">
              Vineyard Haven
            </Link>{' '}
            to{' '}
            <Link href="http://www.aquinnah-ma.gov" target="_blank" rel="noopener noreferrer" className="font-semibold">
              Aquinnah
            </Link>
            ! Your phone will be shiny and new again within an hour! Generally, our turnaround time is within 15 minutes!
          </p>

          <h2>iPhone Repair Services</h2>

          <ul>
            <li>Screen replacement</li>
            <li>Power port replacement</li>
            <li>FaceTime (Front) and rear camera replacement</li>
            <li>Speaker replacement</li>
            <li>Liquid damage assessment and component level repair</li>
            <li>Software repair</li>
            <li>Boot loop repair</li>
            <li>iCloud setup and integration</li>
          </ul>

          <p>
            Our iPhone repair prices are competitive and often save you money compared to Apple! The following links will give you an idea of the current iPhone repair prices.
          </p>

          <p>
            <Link href="https://support.apple.com/iphone/repair/screen-damage" target="_blank" rel="noopener noreferrer">
              Apple iPhone screen repair cost
            </Link>
          </p>

          <p>
            <Link href="https://support.apple.com/iphone/repair/battery-power" target="_blank" rel="noopener noreferrer">
              Apple iPhone battery repair cost
            </Link>
          </p>

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
