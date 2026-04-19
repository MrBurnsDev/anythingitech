import type { Metadata } from 'next';
import { getTownBySlug } from '@/data/directory';
import TownPage from '@/components/TownPage';

const town = getTownBySlug('chilmark')!;

export const metadata: Metadata = {
  title: `Martha's Vineyard Businesses in Chilmark`,
  description: `Discover local businesses in Chilmark, Martha's Vineyard. Browse Menemsha Harbor seafood, shops, and services in this scenic up-island town.`,
  keywords: ["Chilmark businesses", "Menemsha shops", "Martha's Vineyard directory", "Menemsha restaurants", "Chilmark services"],
};

export default function ChilmarkPage() {
  return <TownPage town={town} />;
}
