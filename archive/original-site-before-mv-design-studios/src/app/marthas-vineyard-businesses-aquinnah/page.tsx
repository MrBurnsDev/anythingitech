import type { Metadata } from 'next';
import { getTownBySlug } from '@/data/directory';
import TownPage from '@/components/TownPage';

const town = getTownBySlug('aquinnah')!;

export const metadata: Metadata = {
  title: `Martha's Vineyard Businesses in Aquinnah`,
  description: `Discover local businesses in Aquinnah (Gay Head), Martha's Vineyard. Browse shops near the famous cliffs and lighthouse in this Wampanoag community.`,
  keywords: ["Aquinnah businesses", "Gay Head shops", "Martha's Vineyard directory", "Aquinnah cliffs", "Wampanoag crafts"],
};

export default function AquinnahPage() {
  return <TownPage town={town} />;
}
