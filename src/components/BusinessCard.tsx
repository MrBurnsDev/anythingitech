import Link from 'next/link';
import { Business, getTownBySlug } from '@/data/directory';

interface BusinessCardProps {
  business: Business;
  showTown?: boolean;
}

export default function BusinessCard({ business, showTown = true }: BusinessCardProps) {
  const town = getTownBySlug(business.town);

  return (
    <div className="bg-white rounded-xl border border-[var(--color-border-light)] p-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-lg">{business.name}</h3>
        <span className="text-xs bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)] px-2 py-1 rounded-full">
          {business.category}
        </span>
      </div>

      {showTown && town && (
        <p className="text-sm text-[var(--color-primary)] mb-2">
          <Link href={`/marthas-vineyard-businesses-${business.town}`} className="hover:underline">
            {town.name}
          </Link>
        </p>
      )}

      {business.address && (
        <p className="text-sm text-[var(--color-text-secondary)] mb-2">
          {business.address}
        </p>
      )}

      {business.description && (
        <p className="text-sm text-[var(--color-text-secondary)] mb-4 line-clamp-2">
          {business.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2">
        {business.phone && (
          <a
            href={`tel:${business.phone.replace(/[^0-9]/g, '')}`}
            className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
            </svg>
            {business.phone}
          </a>
        )}
        {business.website && (
          <a
            href={business.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[var(--color-primary)] hover:underline flex items-center gap-1"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            Website
          </a>
        )}
      </div>
    </div>
  );
}
