import type { Metadata } from 'next';
import Image from 'next/image';
import CTASection from '@/components/CTASection';

export const metadata: Metadata = {
  title: 'Mac Repair & Services',
  description: "Professional Mac repair and services on Martha's Vineyard. MacBook Pro, iMac, Mac Mini repairs. Screen replacement, logic board repair, data backup. Call (508) 560-3510.",
  keywords: ["Mac repair Martha's Vineyard", "MacBook repair", "Apple computer repair", "Mac screen replacement", "iMac repair"],
};

export default function MacRepairPage() {
  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1 className="page-header__title">Mac Repair & Services</h1>
          <p className="page-header__subtitle">
            Expert Apple computer repair and support on Martha&apos;s Vineyard
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-area">
        <div className="container max-w-4xl">
          <Image
            src="/images/services_mac_small.jpg"
            alt="Mac Repair Services"
            width={880}
            height={348}
            className="w-full rounded-2xl mb-8"
          />

          <h3 className="text-xl md:text-2xl text-center mb-8">
            At Anything iTech Martha&apos;s Vineyard we specialize in Apple and iPhone repair and support services and specifically pride ourselves in quick turnaround of your precious computer!
          </h3>

          <ul>
            <li>Mac and PC Repair and Troubleshooting</li>
            <li>New Mac and PC Setup and Installation of new operating Systems</li>
            <li>iPhone Screen Repair</li>
            <li>Motherboard (Logic Board) Replacement</li>
            <li>System Security Testing</li>
            <li>Anti-Virus Installation / Removal</li>
            <li>Off-site Tech Support</li>
            <li>Cloud integration</li>
          </ul>

          <hr className="my-8 border-[var(--color-border-light)]" />

          <h2>Maintenance Services</h2>
          <p>
            Anything iTech Martha&apos;s Vineyard repairs and services Mac and PC computers, offers maintenance for wireless networks and establishing backups of your Apple or PC. We are confident technicians and help to keep your data running well and safe!
          </p>

          <hr className="my-8 border-[var(--color-border-light)]" />

          <h2>Online Repair and Support Services</h2>
          <p>
            We offer off site and online support where we can walk you through software installations, networking problems, just about anything as long as you have an internet connection!
          </p>

          <hr className="my-8 border-[var(--color-border-light)]" />

          <h2>Hardware Upgrades and Repairs</h2>
          <ul>
            <li>RAM upgrades</li>
            <li>Hard Drive replacement</li>
            <li>Component repair</li>
            <li>Screen and LCD replacement</li>
            <li>Speaker replacement</li>
          </ul>

          <hr className="my-8 border-[var(--color-border-light)]" />

          <h2>Data Backup</h2>
          <p>
            Have you ever gone to turn on your computer and found everything gone? Is a lack of Computer Maintenance ruining your day?
          </p>
          <p>
            Don&apos;t wait until you have lost everything! Data loss is preventable and can be sidestepped with a few simple actions.
          </p>

          <h4 className="mt-6 mb-4">A few Data Backup Services we offer:</h4>
          <ul>
            <li>Automatic off-site backup</li>
            <li>Setup Apple Time Machine</li>
            <li>Create External Hard Drive Backup</li>
          </ul>

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
