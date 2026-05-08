// Directory data - fetches live from Supabase via API
// Falls back to static JSON for SSG/build time

import townsData from '../../data/exports/towns.json';
import businessTypesData from '../../data/exports/business-types.json';

export interface Business {
  id: number;
  name: string;
  slug: string;
  category: string;
  businessType: string;
  description: string | null;
  town: string;
  townSlug: string;
  address: string | null;
  phone: string | null;
  // email: REMOVED from public API for privacy protection
  // Only available in admin endpoints (/api/admin/businesses)
  website: string | null;
  hours: string | null;
  seasonal: string | null;
  coordinates: { lat: number; lng: number } | null;
  status: string;
  confidence: number;
  social: {
    facebook: string | null;
    instagram: string | null;
    yelp: string | null;
    tripadvisor: string | null;
  };
}

export interface Town {
  slug: string;
  name: string;
  region: string;
  description: string;
  businessCount: number;
  businessTypes: Record<string, number>;
  categories: string[];
}

export interface BusinessType {
  slug: string;
  name: string;
  pluralName: string;
  icon: string;
  description: string;
  shortDescription: string;
  seoDescription: string;
  businessCount: number;
  byTown: Record<string, number>;
}

// Cache for businesses fetched from API
let businessesCache: Business[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 60000; // 1 minute cache

// Fetch businesses from API
export async function fetchBusinesses(): Promise<Business[]> {
  // Return cache if valid
  if (businessesCache && Date.now() - cacheTimestamp < CACHE_TTL) {
    return businessesCache;
  }

  try {
    const response = await fetch('/api/directory/businesses');
    if (!response.ok) throw new Error('Failed to fetch');
    const data = await response.json();
    businessesCache = data.businesses;
    cacheTimestamp = Date.now();
    return businessesCache || [];
  } catch {
    // Fallback to static JSON if API fails
    const staticData = await import('../../data/exports/businesses.json');
    return staticData.default as Business[];
  }
}

// Synchronous access for initial render (from cache or empty)
export function getBusinessesSync(): Business[] {
  return businessesCache || [];
}

// Clear cache (call after admin edits)
export function clearBusinessCache(): void {
  businessesCache = null;
  cacheTimestamp = 0;
}

// For backwards compatibility - will be empty until fetchBusinesses is called
export let businesses: Business[] = [];

// Initialize from static JSON for SSR/initial load, then refresh from API
import('../../data/exports/businesses.json').then(data => {
  businesses = data.default as Business[];
  businessesCache = businesses;
  cacheTimestamp = Date.now();
});

export const towns: Town[] = townsData as Town[];
export const businessTypes: BusinessType[] = businessTypesData as BusinessType[];

// Legacy → modern category slug normalization. Lightweight transitional layer:
// the source of truth is the business data itself. As records are corrected
// to use modern slugs, this map's effect on each business naturally fades.
// Mirrors LEGACY_CATEGORY_REMAP in scripts/generate-sitemap.cjs.
const LEGACY_CATEGORY_REMAP: Record<string, string> = {
  'lodging': 'lodging-and-tourism',
  'lodging-tourism': 'lodging-and-tourism',
  'shopping-retail': 'shopping-and-specialty-retail',
  'shopping-specialty-retail': 'shopping-and-specialty-retail',
  'health-wellness': 'medical-services-and-providers',
  'professional-services': 'business-and-professional-services',
  'business-professional-services': 'business-and-professional-services',
  'community': 'family-community-government',
  'automotive': 'automotive-and-marine',
  'automotive-marine': 'automotive-and-marine',
  'arts-entertainment': 'arts-and-entertainment',
  'beauty-wellness': 'beauty-and-wellness',
  'building-construction': 'building-and-construction',
  'medical-services-providers': 'medical-services-and-providers',
  'banking-finance-insurance': 'banking-finance-and-insurance',
  'real-estate-rentals': 'real-estate-and-rentals',
  'sports-recreation': 'sports-and-recreation',
  'transportation-utilities': 'transportation-and-utilities',
  'wedding-event-services': 'wedding-and-event-services',
  'home-services-trades': 'home-services-and-trades',
  'house-garden-pets': 'house-garden-and-pets',
  'restaurant': 'restaurants-food-beverages',
  'restaurants': 'restaurants-food-beverages',
};

/**
 * Resolve any (possibly legacy) businessType slug to its canonical modern slug.
 * Returns the input unchanged if no mapping exists. Returns null only for
 * non-string inputs.
 */
export function normalizeCategorySlug(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return LEGACY_CATEGORY_REMAP[slug] || slug;
}

// Helper functions
export function getBusinessBySlug(slug: string): Business | undefined {
  return businesses.find(b => b.slug === slug);
}

export function getBusinessesByTown(townSlug: string): Business[] {
  return businesses.filter(b => b.townSlug === townSlug);
}

export function getBusinessesByType(typeSlug: string): Business[] {
  return businesses.filter(b => b.businessType === typeSlug);
}

export function getBusinessesByTownAndType(townSlug: string, typeSlug: string): Business[] {
  return businesses.filter(b => b.townSlug === townSlug && b.businessType === typeSlug);
}

export function getTownBySlug(slug: string): Town | undefined {
  return towns.find(t => t.slug === slug);
}

export function getBusinessTypeBySlug(slug: string): BusinessType | undefined {
  return businessTypes.find(c => c.slug === slug);
}

export function searchBusinesses(query: string): Business[] {
  const lower = query.toLowerCase();
  return businesses.filter(b =>
    b.name.toLowerCase().includes(lower) ||
    b.category.toLowerCase().includes(lower) ||
    b.town.toLowerCase().includes(lower) ||
    (b.description && b.description.toLowerCase().includes(lower))
  );
}

// Featured businesses - high confidence with descriptions
export function getFeaturedBusinesses(limit = 6): Business[] {
  return businesses
    .filter(b => b.description && b.confidence >= 0.7)
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, limit);
}

// Get business types that have businesses in a specific town
export function getBusinessTypesForTown(townSlug: string): BusinessType[] {
  return businessTypes.filter(type => type.byTown[townSlug] && type.byTown[townSlug] > 0);
}

// Get towns that have businesses of a specific type
export function getTownsForBusinessType(typeSlug: string): Town[] {
  const type = getBusinessTypeBySlug(typeSlug);
  if (!type) return [];
  return towns.filter(town => type.byTown[town.slug] && type.byTown[town.slug] > 0);
}

// Generate URL paths. Always emit modern slugs — legacy categories are
// normalized so the URL we link to matches the canonical we'd render.
export function getBusinessUrl(business: Business): string {
  const type = normalizeCategorySlug(business.businessType) || business.businessType;
  return `/marthas-vineyard/${business.townSlug}/${type}/${business.slug}`;
}

export function getTownUrl(townSlug: string): string {
  return `/marthas-vineyard/${townSlug}`;
}

export function getBusinessTypeUrl(typeSlug: string): string {
  return `/marthas-vineyard/${normalizeCategorySlug(typeSlug) || typeSlug}`;
}

export function getTownBusinessTypeUrl(townSlug: string, typeSlug: string): string {
  return `/marthas-vineyard/${townSlug}/${normalizeCategorySlug(typeSlug) || typeSlug}`;
}
