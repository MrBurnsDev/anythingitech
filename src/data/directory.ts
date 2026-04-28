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
  email: string | null;
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

// Generate URL paths
export function getBusinessUrl(business: Business): string {
  return `/marthas-vineyard/${business.townSlug}/${business.businessType}/${business.slug}`;
}

export function getTownUrl(townSlug: string): string {
  return `/marthas-vineyard/${townSlug}`;
}

export function getBusinessTypeUrl(typeSlug: string): string {
  return `/marthas-vineyard/${typeSlug}`;
}

export function getTownBusinessTypeUrl(townSlug: string, typeSlug: string): string {
  return `/marthas-vineyard/${townSlug}/${typeSlug}`;
}
