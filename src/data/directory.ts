// Martha's Vineyard Business Directory Data
// This data structure is designed to be easily replaced with data from OpenClaw pipeline

export interface Business {
  id: string;
  slug: string;
  name: string;
  category: string;
  town: Town;
  address?: string;
  phone?: string;
  website?: string;
  description?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export type Town =
  | 'vineyard-haven'
  | 'oak-bluffs'
  | 'edgartown'
  | 'west-tisbury'
  | 'chilmark'
  | 'aquinnah';

export interface TownInfo {
  slug: Town;
  name: string;
  displayName: string;
  description: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

export const towns: TownInfo[] = [
  {
    slug: 'vineyard-haven',
    name: 'Vineyard Haven',
    displayName: 'Vineyard Haven (Tisbury)',
    description: "Vineyard Haven, officially known as Tisbury, is the commercial hub of Martha's Vineyard. Home to the main ferry terminal, it offers a vibrant mix of local shops, restaurants, and essential services. The town maintains a year-round community atmosphere with businesses serving both residents and visitors.",
    coordinates: { lat: 41.4535, lng: -70.5986 },
  },
  {
    slug: 'oak-bluffs',
    name: 'Oak Bluffs',
    displayName: 'Oak Bluffs',
    description: "Oak Bluffs is known for its colorful Victorian cottages, the iconic Flying Horses Carousel, and lively summer atmosphere. Circuit Avenue serves as the main commercial district, offering restaurants, shops, and entertainment. The town has a rich history as a Methodist camp meeting ground.",
    coordinates: { lat: 41.4549, lng: -70.5620 },
  },
  {
    slug: 'edgartown',
    name: 'Edgartown',
    displayName: 'Edgartown',
    description: "Edgartown is the island's historic county seat, featuring elegant whaling captain homes, upscale boutiques, and fine dining establishments. Main Street showcases the town's maritime heritage with beautifully preserved architecture. It's also the gateway to Chappaquiddick Island.",
    coordinates: { lat: 41.3884, lng: -70.5131 },
  },
  {
    slug: 'west-tisbury',
    name: 'West Tisbury',
    displayName: 'West Tisbury',
    description: "West Tisbury represents the rural heart of Martha's Vineyard, home to farms, artists, and the beloved Farmers' Market. Alley's General Store has served the community since 1858. The town offers a peaceful contrast to the busier down-island villages.",
    coordinates: { lat: 41.3819, lng: -70.6744 },
  },
  {
    slug: 'chilmark',
    name: 'Chilmark',
    displayName: 'Chilmark',
    description: "Chilmark is a quiet, scenic up-island town known for its rolling hills, stone walls, and fishing village of Menemsha. The town maintains strict building codes to preserve its rural character. Menemsha Harbor is famous for fresh seafood and stunning sunsets.",
    coordinates: { lat: 41.3528, lng: -70.7428 },
  },
  {
    slug: 'aquinnah',
    name: 'Aquinnah',
    displayName: 'Aquinnah (Gay Head)',
    description: "Aquinnah, formerly known as Gay Head, is home to the Wampanoag Tribe of Gay Head (Aquinnah). The town features the famous clay cliffs, a historic lighthouse, and pristine beaches. It's the smallest and westernmost town on the island.",
    coordinates: { lat: 41.3306, lng: -70.8361 },
  },
];

export const categories = [
  'Restaurant',
  'Retail',
  'Professional Services',
  'Health & Wellness',
  'Lodging',
  'Recreation',
  'Arts & Culture',
  'Automotive',
  'Home Services',
  'Technology',
  'Real Estate',
  'Financial Services',
  'Education',
  'Food & Beverage',
  'Marine Services',
];

// Sample businesses - to be replaced with OpenClaw data
export const businesses: Business[] = [
  // Vineyard Haven
  {
    id: '1',
    slug: 'bunch-of-grapes-bookstore',
    name: 'Bunch of Grapes Bookstore',
    category: 'Retail',
    town: 'vineyard-haven',
    address: '35 Main Street, Vineyard Haven',
    phone: '(508) 693-2291',
    website: 'https://www.bunchofgrapes.com',
    description: 'Independent bookstore serving Martha\'s Vineyard since 1964. Features local authors, bestsellers, and children\'s books.',
    coordinates: { lat: 41.4537, lng: -70.5988 },
  },
  {
    id: '2',
    slug: 'black-dog-tavern',
    name: 'The Black Dog Tavern',
    category: 'Restaurant',
    town: 'vineyard-haven',
    address: '20 Beach Street Extension, Vineyard Haven',
    phone: '(508) 693-9223',
    website: 'https://www.theblackdog.com',
    description: 'Iconic Martha\'s Vineyard restaurant and bakery, famous for its waterfront location and Black Dog merchandise.',
    coordinates: { lat: 41.4531, lng: -70.6012 },
  },
  {
    id: '3',
    slug: 'vineyard-haven-public-library',
    name: 'Vineyard Haven Public Library',
    category: 'Education',
    town: 'vineyard-haven',
    address: '200 Main Street, Vineyard Haven',
    description: 'Community library serving Tisbury with books, programs, and resources for all ages.',
    coordinates: { lat: 41.4541, lng: -70.5970 },
  },
  // Oak Bluffs
  {
    id: '4',
    slug: 'flying-horses-carousel',
    name: 'Flying Horses Carousel',
    category: 'Recreation',
    town: 'oak-bluffs',
    address: '15 Lake Avenue, Oak Bluffs',
    phone: '(508) 693-9481',
    description: 'The oldest operating platform carousel in America, a National Historic Landmark since 1884.',
    coordinates: { lat: 41.4549, lng: -70.5589 },
  },
  {
    id: '5',
    slug: 'back-door-donuts',
    name: 'Back Door Donuts',
    category: 'Food & Beverage',
    town: 'oak-bluffs',
    address: '5 Post Office Square, Oak Bluffs',
    phone: '(508) 693-3688',
    description: 'Famous late-night donut spot serving fresh, warm apple fritters and other treats.',
    coordinates: { lat: 41.4551, lng: -70.5605 },
  },
  {
    id: '6',
    slug: 'offshore-ale',
    name: 'Offshore Ale Company',
    category: 'Restaurant',
    town: 'oak-bluffs',
    address: '30 Kennebec Avenue, Oak Bluffs',
    phone: '(508) 693-2626',
    website: 'https://www.offshoreale.com',
    description: 'Martha\'s Vineyard\'s only brewpub, offering craft beers brewed on-site and American fare.',
    coordinates: { lat: 41.4553, lng: -70.5621 },
  },
  // Edgartown
  {
    id: '7',
    slug: 'atria-restaurant',
    name: 'Atria',
    category: 'Restaurant',
    town: 'edgartown',
    address: '137 Main Street, Edgartown',
    phone: '(508) 627-5850',
    website: 'https://www.atriarestaurant.com',
    description: 'Upscale American cuisine in a restored captain\'s house, known for innovative dishes and excellent wine list.',
    coordinates: { lat: 41.3890, lng: -70.5128 },
  },
  {
    id: '8',
    slug: 'edgartown-books',
    name: 'Edgartown Books',
    category: 'Retail',
    town: 'edgartown',
    address: '44 Main Street, Edgartown',
    phone: '(508) 627-8463',
    description: 'Independent bookstore in the heart of Edgartown, featuring local interest titles and bestsellers.',
    coordinates: { lat: 41.3888, lng: -70.5133 },
  },
  {
    id: '9',
    slug: 'harbor-view-hotel',
    name: 'Harbor View Hotel',
    category: 'Lodging',
    town: 'edgartown',
    address: '131 North Water Street, Edgartown',
    phone: '(508) 627-7000',
    website: 'https://www.harbor-view.com',
    description: 'Historic waterfront hotel offering luxury accommodations with views of Edgartown Harbor.',
    coordinates: { lat: 41.3916, lng: -70.5095 },
  },
  // West Tisbury
  {
    id: '10',
    slug: 'alleys-general-store',
    name: "Alley's General Store",
    category: 'Retail',
    town: 'west-tisbury',
    address: '1045 State Road, West Tisbury',
    phone: '(508) 693-0088',
    description: 'Historic general store established in 1858, a beloved community gathering place.',
    coordinates: { lat: 41.3821, lng: -70.6742 },
  },
  {
    id: '11',
    slug: 'west-tisbury-farmers-market',
    name: 'West Tisbury Farmers Market',
    category: 'Food & Beverage',
    town: 'west-tisbury',
    address: 'Old Agricultural Hall, West Tisbury',
    description: 'Seasonal farmers market featuring local produce, crafts, and prepared foods every Saturday and Wednesday.',
    coordinates: { lat: 41.3815, lng: -70.6738 },
  },
  // Chilmark
  {
    id: '12',
    slug: 'menemsha-fish-market',
    name: 'Menemsha Fish Market',
    category: 'Food & Beverage',
    town: 'chilmark',
    address: 'Basin Road, Menemsha',
    phone: '(508) 645-2282',
    description: 'Fresh local seafood directly from Menemsha Harbor fishing boats.',
    coordinates: { lat: 41.3542, lng: -70.7671 },
  },
  {
    id: '13',
    slug: 'the-galley',
    name: 'The Galley',
    category: 'Restaurant',
    town: 'chilmark',
    address: 'Menemsha Harbor, Chilmark',
    phone: '(508) 645-9819',
    description: 'Casual waterfront dining in Menemsha, famous for fresh seafood and sunset views.',
    coordinates: { lat: 41.3545, lng: -70.7668 },
  },
  // Aquinnah
  {
    id: '14',
    slug: 'aquinnah-cliffs',
    name: 'Aquinnah Cliffs Overlook',
    category: 'Recreation',
    town: 'aquinnah',
    address: 'Aquinnah Circle, Aquinnah',
    description: 'Scenic overlook of the famous clay cliffs, a sacred site for the Wampanoag people.',
    coordinates: { lat: 41.3475, lng: -70.8362 },
  },
  {
    id: '15',
    slug: 'aquinnah-shop',
    name: 'Aquinnah Shop',
    category: 'Retail',
    town: 'aquinnah',
    address: '27 Aquinnah Circle, Aquinnah',
    phone: '(508) 645-3867',
    description: 'Native American crafts, souvenirs, and refreshments near the Gay Head Lighthouse.',
    coordinates: { lat: 41.3478, lng: -70.8358 },
  },
];

// Helper functions
export function getBusinessesByTown(townSlug: Town): Business[] {
  return businesses.filter(b => b.town === townSlug);
}

export function getBusinessesByCategory(category: string): Business[] {
  return businesses.filter(b => b.category === category);
}

export function getBusinessBySlug(slug: string): Business | undefined {
  return businesses.find(b => b.slug === slug);
}

export function getTownBySlug(slug: Town): TownInfo | undefined {
  return towns.find(t => t.slug === slug);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function getBusinessCountByTown(townSlug: Town): number {
  return businesses.filter(b => b.town === townSlug).length;
}

export function getAllCategories(): string[] {
  const uniqueCategories = new Set(businesses.map(b => b.category));
  return Array.from(uniqueCategories).sort();
}
