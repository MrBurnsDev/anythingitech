import type { Metadata } from 'next';
import Link from 'next/link';
import { businesses, towns, getBusinessCountByTown } from '@/data/directory';
import DirectorySearch from '@/components/DirectorySearch';

export const metadata: Metadata = {
  title: "Martha's Vineyard Business Directory | Local Business Map",
  description: "Browse the complete Martha's Vineyard business directory. Find local shops, restaurants, services, and more across all island towns. Your guide to MV businesses.",
  keywords: ["Martha's Vineyard businesses", "MV directory", "Vineyard Haven businesses", "Oak Bluffs shops", "Edgartown restaurants", "island businesses"],
};

export default function DirectoryPage() {
  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <h1 className="page-header__title">Martha&apos;s Vineyard Business Directory</h1>
          <p className="page-header__subtitle">
            Discover local businesses across the island. Browse by town, search by category, and connect with Martha&apos;s Vineyard&apos;s best.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="section bg-[var(--color-bg-tertiary)]">
        <div className="container">
          {/* Town Cards */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">Browse by Town</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {towns.map(town => (
                <Link
                  key={town.slug}
                  href={`/marthas-vineyard-businesses-${town.slug}`}
                  className="bg-white rounded-xl p-4 text-center hover:shadow-md transition-shadow border border-[var(--color-border-light)]"
                >
                  <h3 className="font-semibold mb-1">{town.name}</h3>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {getBusinessCountByTown(town.slug)} businesses
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* Search and Listings */}
          <DirectorySearch businesses={businesses} />
        </div>
      </div>

      {/* CTA for Businesses */}
      <section className="section bg-white">
        <div className="container">
          <div className="bg-gradient-to-br from-[var(--color-bg-tertiary)] to-white rounded-3xl p-8 md:p-12">
            <div className="max-w-2xl">
              <h2 className="text-2xl md:text-3xl font-bold mb-4">
                Need Tech Support for Your Business?
              </h2>
              <p className="text-[var(--color-text-secondary)] mb-6">
                Anything iTech provides professional IT support, network installation, and tech services
                for Martha&apos;s Vineyard businesses. From WiFi setup to computer repair, we&apos;ve got you covered.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/network-services-2" className="btn btn--primary">
                  Network Services
                </Link>
                <Link href="/contact" className="btn btn--outline">
                  Contact Us
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About the Directory */}
      <section className="section bg-[var(--color-bg-tertiary)]">
        <div className="container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">About This Directory</h2>
            <p className="text-[var(--color-text-secondary)] mb-6">
              The Martha&apos;s Vineyard Business Directory is a community resource connecting residents and visitors
              with local businesses across the island. From Vineyard Haven to Aquinnah, discover the shops,
              restaurants, services, and attractions that make Martha&apos;s Vineyard special.
            </p>
            <p className="text-[var(--color-text-secondary)]">
              <strong>Are you a local business?</strong> We&apos;re always looking to add new listings.
              Contact us to be included in our directory.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
