import type { Metadata } from 'next';
import { getTownBySlug } from '@/data/directory';
import TownPage from '@/components/TownPage';

const town = getTownBySlug('edgartown')!;

export const metadata: Metadata = {
  title: `Martha's Vineyard Businesses in Edgartown`,
  description: `Discover local businesses in Edgartown, Martha's Vineyard. Browse upscale boutiques, fine dining, and services in this historic whaling captain town.`,
  keywords: ["Edgartown businesses", "Edgartown Main Street", "Martha's Vineyard directory", "Edgartown restaurants", "Edgartown shops"],
};

export default function EdgartownPage() {
  return <TownPage town={town} />;
}
