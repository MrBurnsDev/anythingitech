import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import CTASection from '@/components/CTASection';

export const metadata: Metadata = {
  title: 'Network Services',
  description: "Professional network installation and Wi-Fi setup on Martha's Vineyard. Ubiquiti enterprise-level products for homes and businesses. Call (508) 560-3510.",
  keywords: ["network services Martha's Vineyard", "WiFi installation", "wireless network setup", "Ubiquiti installation", "home network"],
};

export default function NetworkServicesPage() {
  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1 className="page-header__title">Network Services</h1>
          <p className="page-header__subtitle">
            Professional wireless and wired network solutions for Martha&apos;s Vineyard
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-area">
        <div className="container max-w-4xl">
          <Image
            src="/images/services_network-small.jpeg"
            alt="Network Services"
            width={880}
            height={300}
            className="w-full rounded-2xl mb-8"
          />

          <h3 className="text-xl md:text-2xl text-center mb-8">
            Wireless and wired networking is everywhere! With the huge demand for networks in the home and office we specialize in installing incredibly robust enterprise level products created by our friends at{' '}
            <Link href="https://www.ui.com" target="_blank" rel="noopener noreferrer" className="text-[var(--color-primary)] font-semibold">
              Ubiquiti
            </Link>{' '}
            for our Business and Residential Customers
          </h3>

          <h2>We also offer the following Network Services</h2>

          <ul>
            <li>Internet and WiFi Installation and Setup</li>
            <li>Apple iCloud Integration and Setup</li>
            <li>Business Server Installation and Maintenance</li>
            <li>Setup Wireless Networks for Home and Office</li>
            <li>Setup High Speed Wired Networks</li>
            <li>Improve Network Security</li>
            <li>Improve Gaming Networks</li>
            <li>Repair Router Issues</li>
            <li>Wireless and Airplay Enabled Printers</li>
          </ul>

          {/* Specialty Areas */}
          <div className="grid md:grid-cols-2 gap-8 my-12">
            <div className="bg-[var(--color-bg-tertiary)] rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Home Networks</h3>
              <p className="text-[var(--color-text-secondary)]">
                Whether you need whole-home WiFi coverage, smart home device integration, or a network that can handle multiple streaming devices, we design and install solutions that work perfectly for your lifestyle.
              </p>
            </div>
            <div className="bg-[var(--color-bg-tertiary)] rounded-2xl p-6">
              <h3 className="text-lg font-semibold mb-4">Business Networks</h3>
              <p className="text-[var(--color-text-secondary)]">
                From small offices to large commercial properties, we provide enterprise-grade networking solutions that ensure reliability, security, and performance for your business operations.
              </p>
            </div>
          </div>

          {/* Featured: Luxury Properties */}
          <div className="bg-gradient-to-br from-[var(--color-primary)] to-[#0059B3] rounded-2xl p-8 text-white my-12">
            <h3 className="text-2xl font-bold mb-4">Luxury Home Network Installations</h3>
            <p className="opacity-90 mb-4">
              High-end homes on Martha&apos;s Vineyard require networks that can support smart home systems, security cameras, whole-home audio, and more. We specialize in designing future-proof wireless networks for luxury properties.
            </p>
            <Link href="/contact" className="inline-flex items-center text-white font-semibold hover:underline">
              Learn more about our luxury installations
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="ml-2">
                <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/>
              </svg>
            </Link>
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
