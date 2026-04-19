import type { Metadata } from 'next';
import CTASection from '@/components/CTASection';

export const metadata: Metadata = {
  title: 'Happy Clients',
  description: "Anything iTech Martha's Vineyard has been working with business clients since 2008. See our featured business partners on the island.",
  keywords: ["Anything iTech clients", "Martha's Vineyard businesses", "Apple support clients", "business IT support"],
};

const clients = [
  { name: 'Beach Plum Inn', description: 'Luxury inn and restaurant' },
  { name: 'Homeport Restaurant', description: 'Fine dining establishment' },
  { name: 'Menemsha Inn', description: 'Waterfront accommodations' },
  { name: 'Hayes Design Studio', description: 'Creative design services' },
  { name: 'Enchanted Chocolates', description: 'Artisan chocolatier' },
  { name: 'New Moon Magick', description: 'Specialty retail' },
  { name: "Maggie's Salon", description: 'Hair and beauty services' },
  { name: 'Slip 77', description: 'Marine services' },
  { name: 'KG Events and Design', description: 'Event planning and design' },
  { name: 'Mueller Plumbing', description: 'Professional plumbing services' },
  { name: 'Atlantic Pools MV', description: 'Pool services and maintenance' },
  { name: 'Hurd Publishing', description: 'Publishing and media' },
];

export default function HappyClientsPage() {
  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1 className="page-header__title">Happy Clients</h1>
          <p className="page-header__subtitle">
            Our business partners on Martha&apos;s Vineyard
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="content-area">
        <div className="container max-w-4xl">
          <p className="text-center text-lg mb-12">
            Anything iTech Martha&apos;s Vineyard has been working with business clients since 2008
            and we couldn&apos;t ask for better ones. Our dedicated clients are the heart of our business.
            We wouldn&apos;t be here today without them!
          </p>

          {/* Client Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {clients.map((client) => (
              <div
                key={client.name}
                className="bg-[var(--color-bg-tertiary)] rounded-2xl p-6 text-center hover:shadow-lg transition-shadow"
              >
                <h3 className="text-lg font-semibold mb-2">{client.name}</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">{client.description}</p>
              </div>
            ))}
          </div>

          <hr className="my-8 border-[var(--color-border-light)]" />

          <div className="bg-[var(--color-bg-tertiary)] rounded-2xl p-8 my-12 text-center">
            <h3 className="text-xl mb-4">Join Our Happy Clients</h3>
            <p className="mb-6">
              Ready to experience the difference? Our services are by appointment only.
            </p>
            <p className="mb-4">Contact us to schedule:</p>
            <a href="tel:508-560-3510" className="text-4xl font-bold text-[var(--color-primary)] hover:underline">
              (508) 560-3510
            </a>
            <p className="mt-6">
              ...or drop us an{' '}
              <a href="mailto:louis@anythingitechmv.com" className="font-semibold">
                e-Mail
              </a>{' '}
              to get started!
            </p>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <CTASection />
    </>
  );
}
