import type { Metadata } from 'next';
import { getTownBySlug } from '@/data/directory';
import TownPage from '@/components/TownPage';

const town = getTownBySlug('vineyard-haven')!;

export const metadata: Metadata = {
  title: `Martha's Vineyard Businesses in Vineyard Haven`,
  description: `Discover local businesses in Vineyard Haven (Tisbury), Martha's Vineyard. Browse shops, restaurants, and services in the island's commercial hub.`,
  keywords: ["Vineyard Haven businesses", "Tisbury shops", "Martha's Vineyard directory", "VH restaurants", "Vineyard Haven services"],
};

export default function VineyardHavenPage() {
  return <TownPage town={town} />;
}
