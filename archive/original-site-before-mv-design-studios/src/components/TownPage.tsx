import Link from 'next/link';
import { Town, TownInfo, getBusinessesByTown, towns } from '@/data/directory';
import DirectorySearch from './DirectorySearch';

interface TownPageProps {
  town: TownInfo;
}

export default function TownPage({ town }: TownPageProps) {
  const businesses = getBusinessesByTown(town.slug);
  const otherTowns = towns.filter(t => t.slug !== town.slug);

  return (
    <>
      {/* Page Header */}
      <div className="page-header">
        <div className="container">
          <p className="text-sm text-[var(--color-primary)] font-medium mb-2">
            <Link href="/marthas-vineyard-business-directory" className="hover:underline">
              Martha&apos;s Vineyard Business Directory
            </Link>
          </p>
          <h1 className="page-header__title">
            Martha&apos;s Vineyard Businesses in {town.name}
          </h1>
          <p className="page-header__subtitle">
            {town.description}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="section bg-[var(--color-bg-tertiary)]">
        <div className="container">
          <DirectorySearch businesses={businesses} showTownFilter={false} />
        </div>
      </div>

      {/* Other Towns */}
      <section className="section bg-white">
        <div className="container">
          <h2 className="text-2xl font-bold mb-6 text-center">Explore Other Towns</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {otherTowns.map(t => (
              <Link
                key={t.slug}
                href={`/marthas-vineyard-businesses-${t.slug}`}
                className="bg-[var(--color-bg-tertiary)] rounded-xl p-4 text-center hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold">{t.name}</h3>
              </Link>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/marthas-vineyard-business-directory" className="btn btn--outline">
              View All Businesses
            </Link>
          </div>
        </div>
      </section>

      {/* CTA for local tech services */}
      <section className="cta-section">
        <div className="container">
          <div className="cta-block">
            <h2 className="cta-block__title">
              Need Tech Support in {town.name}?
            </h2>
            <p className="cta-block__text">
              Anything iTech provides on-site tech support, network installation, iPhone repair, and Mac services
              throughout {town.name} and all of Martha&apos;s Vineyard.
            </p>
            <div className="cta-block__actions">
              <a href="tel:508-560-3510" className="btn btn--primary btn--lg">
                Call (508) 560-3510
              </a>
              <Link href="/contact" className="btn btn--outline btn--lg">
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
