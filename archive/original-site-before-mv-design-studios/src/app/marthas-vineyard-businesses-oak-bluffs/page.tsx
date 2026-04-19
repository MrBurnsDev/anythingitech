import type { Metadata } from 'next';
import { getTownBySlug } from '@/data/directory';
import TownPage from '@/components/TownPage';

const town = getTownBySlug('oak-bluffs')!;

export const metadata: Metadata = {
  title: `Martha's Vineyard Businesses in Oak Bluffs`,
  description: `Discover local businesses in Oak Bluffs, Martha's Vineyard. Browse Circuit Avenue shops, restaurants, and attractions in this vibrant summer destination.`,
  keywords: ["Oak Bluffs businesses", "Circuit Avenue shops", "Martha's Vineyard directory", "OB restaurants", "Oak Bluffs attractions"],
};

export default function OakBluffsPage() {
  return <TownPage town={town} />;
}
