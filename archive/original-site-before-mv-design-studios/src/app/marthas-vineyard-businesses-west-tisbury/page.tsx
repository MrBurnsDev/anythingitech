import type { Metadata } from 'next';
import { getTownBySlug } from '@/data/directory';
import TownPage from '@/components/TownPage';

const town = getTownBySlug('west-tisbury')!;

export const metadata: Metadata = {
  title: `Martha's Vineyard Businesses in West Tisbury`,
  description: `Discover local businesses in West Tisbury, Martha's Vineyard. Browse farms, artisan shops, and services in the island's rural heart.`,
  keywords: ["West Tisbury businesses", "Alley's General Store", "Martha's Vineyard directory", "West Tisbury farms", "farmers market"],
};

export default function WestTisburyPage() {
  return <TownPage town={town} />;
}
