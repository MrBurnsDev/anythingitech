/**
 * Utility functions for MV Business Registry
 * Name normalization, URL extraction, confidence scoring
 */

// Common TLDs to detect URL-style names
const TLDS = ['com', 'net', 'org', 'biz', 'info', 'co', 'io', 'us', 'site', 'squarespace'];

// Words that indicate URL-style names when combined with TLDs
const URL_INDICATORS = ['www', 'http', 'https', 'facebook', 'instagram', 'yelp', 'tripadvisor'];

/**
 * Detect if a business name is actually a URL or URL-derived
 */
export function isUrlStyleName(name: string): boolean {
  if (!name) return false;
  const lower = name.toLowerCase().trim();

  // Obvious URL patterns
  if (lower.startsWith('http://') || lower.startsWith('https://') || lower.startsWith('www.')) {
    return true;
  }

  // Check for TLD at end without spaces (e.g., "19primesteak.com")
  for (const tld of TLDS) {
    if (lower.endsWith(`.${tld}`) || lower.endsWith(`.${tld}/`)) {
      return true;
    }
  }

  // Check for URL indicators
  for (const indicator of URL_INDICATORS) {
    if (lower.includes(indicator + '.')) {
      return true;
    }
  }

  // Check if name looks like a domain (no spaces, has a dot)
  if (!name.includes(' ') && name.includes('.') && name.length > 5) {
    const parts = name.split('.');
    if (parts.length >= 2 && TLDS.includes(parts[parts.length - 1].toLowerCase().replace('/', ''))) {
      return true;
    }
  }

  return false;
}

/**
 * Extract potential business name from a URL-style name
 * e.g., "19Primesteak.Com" -> "19 Prime Steak"
 * e.g., "menemshagallery.com" -> "Menemsha Gallery"
 */
export function extractNameFromUrl(urlName: string): string | null {
  if (!urlName) return null;

  let name = urlName.trim();

  // Remove protocol
  name = name.replace(/^https?:\/\//i, '');

  // Remove www
  name = name.replace(/^www\./i, '');

  // Remove path after domain
  name = name.replace(/\/.*$/, '');

  // Remove TLD and trailing slash
  for (const tld of TLDS) {
    const regex = new RegExp(`\\.${tld}\\/?$`, 'i');
    name = name.replace(regex, '');
  }

  // Remove common suffixes like 'mv', 'mvy', etc.
  name = name.replace(/[-_]?(mv|mvy|vineyard|martha|marthas)$/i, '');

  // Split camelCase into words (e.g., "PrimeSteak" -> "Prime Steak")
  name = name.replace(/([a-z])([A-Z])/g, '$1 $2');

  // Split on numbers followed by letters (e.g., "19Prime" -> "19 Prime")
  name = name.replace(/(\d)([A-Za-z])/g, '$1 $2');

  // Split on letters followed by numbers (optional, for things like "cafe42")
  name = name.replace(/([A-Za-z])(\d)/g, '$1 $2');

  // Try to split compound words that are all lowercase
  // Common patterns: 'backdog' -> 'back dog', 'seadog' -> 'sea dog'
  // This is a heuristic approach - split on common word boundaries
  const commonPrefixes = ['the', 'sea', 'black', 'blue', 'red', 'white', 'back', 'front', 'old', 'new', 'big', 'little', 'good', 'bad', 'fat', 'home', 'town', 'port', 'beach', 'island', 'ocean', 'bay', 'oak', 'west', 'east', 'north', 'south', 'sun', 'moon', 'star', 'fish', 'raw', 'prime', 'art', 'coffee', 'lobster', 'oyster', 'clam'];
  const commonSuffixes = ['bar', 'grill', 'cafe', 'coffee', 'diner', 'inn', 'hotel', 'house', 'shop', 'store', 'gallery', 'studio', 'kitchen', 'tavern', 'pub', 'bistro', 'market', 'bakery', 'donuts', 'pizza', 'fish', 'shack', 'shanty', 'hunter', 'port', 'love'];

  // MV-specific place names that should be split out
  const mvPlaces = ['menemsha', 'edgartown', 'vineyard', 'tisbury', 'chilmark', 'aquinnah', 'oak', 'bluffs', 'haven'];

  // All splittable terms
  const allPrefixes = [...commonPrefixes, ...mvPlaces];
  const allSuffixes = [...commonSuffixes, 'gallery', 'meat', 'shanty', 'seafood'];

  // Only try word splitting if name is all lowercase and has no spaces
  if (name === name.toLowerCase() && !name.includes(' ') && name.length > 6) {
    let bestSplit = name;
    let maxParts = 1;

    // Try splitting at each position and see if we get recognizable words
    for (let i = 2; i < name.length - 2; i++) {
      const left = name.slice(0, i);
      const right = name.slice(i);

      const leftMatch = allPrefixes.includes(left) || allSuffixes.includes(left);
      const rightMatch = allPrefixes.includes(right) || allSuffixes.includes(right);

      if (leftMatch && rightMatch) {
        // Both parts are recognized words - great split
        bestSplit = left + ' ' + right;
        maxParts = 3; // Prioritize two recognized words
        break;
      } else if (leftMatch && right.length >= 3) {
        // Left part is recognized, right part is unknown but reasonable
        if (maxParts < 2) {
          bestSplit = left + ' ' + right;
          maxParts = 2;
        }
      } else if (rightMatch && left.length >= 3) {
        // Right part is recognized, left part is unknown but reasonable
        if (maxParts < 2) {
          bestSplit = left + ' ' + right;
          maxParts = 2;
        }
      }
    }

    name = bestSplit;
  }

  // Replace hyphens and underscores with spaces
  name = name.replace(/[-_]+/g, ' ');

  // Clean up multiple spaces
  name = name.replace(/\s+/g, ' ').trim();

  // Title case
  name = titleCase(name);

  // Validate: must have at least 2 characters and not look like garbage
  if (name.length < 2) return null;
  if (name.length > 50) return null;

  return name;
}

/**
 * Title case a string, handling special cases
 */
export function titleCase(str: string): string {
  if (!str) return '';

  const lowerWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'by'];
  const upperWords = ['LLC', 'INC', 'PC', 'PA', 'PLLC', 'DDS', 'MD', 'DMD', 'MV', 'IT', 'TV', 'USA', 'MVC', 'II', 'III', 'IV'];

  return str.split(' ').map((word, index) => {
    const lower = word.toLowerCase();
    const upper = word.toUpperCase();

    // Check for preserved uppercase words
    if (upperWords.includes(upper)) return upper;

    // First word always capitalized
    if (index === 0) return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();

    // Lowercase words
    if (lowerWords.includes(lower)) return lower;

    // Normal title case
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}

/**
 * Fix common name formatting issues
 * - "Martha'S Vineyard" -> "Martha's Vineyard"
 * - "Oak bluffs" -> "Oak Bluffs"
 * - Remove trailing location info
 */
export function cleanBusinessName(name: string): string {
  if (!name) return '';

  let cleaned = name.trim();

  // Fix possessive apostrophe capitalization (Martha'S -> Martha's)
  cleaned = cleaned.replace(/'S\b/g, "'s");
  cleaned = cleaned.replace(/'T\b/g, "'t");

  // Remove common location suffixes
  cleaned = cleaned.replace(/\s*[-–—]\s*(vineyard haven|oak bluffs|edgartown|west tisbury|chilmark|aquinnah|martha'?s?\s+vineyard|mv|ma).*$/i, '');

  // Remove location in parentheses
  cleaned = cleaned.replace(/\s*\([^)]*vineyard[^)]*\)$/i, '');
  cleaned = cleaned.replace(/\s*\([^)]*(oak bluffs|edgartown|tisbury|chilmark|aquinnah)[^)]*\)$/i, '');

  // Clean whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  // Apply title case
  cleaned = titleCase(cleaned);

  return cleaned;
}

/**
 * Normalize a name for comparison/deduplication
 */
export function normalizeForComparison(name: string): string {
  if (!name) return '';

  let normalized = name.toLowerCase();

  // Remove special characters
  normalized = normalized.replace(/[^\w\s]/g, ' ');

  // Remove noise words
  const noiseWords = ['the', 'a', 'an', 'and', 'of', 'in', 'on', 'at', 'llc', 'inc', 'corp', 'co', 'marthas', 'vineyard', 'mv'];
  const words = normalized.split(/\s+/).filter(w => !noiseWords.includes(w));

  return words.join(' ').trim();
}

/**
 * Extract domain from a URL
 */
export function extractDomain(url: string): string | null {
  if (!url) return null;

  try {
    // Add protocol if missing
    let fullUrl = url;
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = 'https://' + fullUrl;
    }

    const parsed = new URL(fullUrl);
    let domain = parsed.hostname.toLowerCase();

    // Remove www
    if (domain.startsWith('www.')) {
      domain = domain.slice(4);
    }

    return domain || null;
  } catch {
    return null;
  }
}

/**
 * Normalize phone number to (XXX) XXX-XXXX format
 */
export function normalizePhone(phone: string): string | null {
  if (!phone) return null;

  // Extract digits only
  const digits = phone.replace(/\D/g, '');

  // Remove leading 1 for US numbers
  const normalized = digits.length === 11 && digits.startsWith('1')
    ? digits.slice(1)
    : digits;

  // Must be 10 digits
  if (normalized.length !== 10) return null;

  return `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`;
}

/**
 * Generate a URL-safe slug
 */
export function generateSlug(name: string, town?: string): string {
  if (!name) return '';

  let slug = name.toLowerCase();

  // Normalize unicode
  slug = slug.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');

  // Replace special chars with hyphens
  slug = slug.replace(/[^\w\s-]/g, '');
  slug = slug.replace(/[\s_]+/g, '-');

  // Remove multiple hyphens
  slug = slug.replace(/-+/g, '-');

  // Remove leading/trailing hyphens
  slug = slug.replace(/^-+|-+$/g, '');

  // Add town if provided
  if (town) {
    const townSlug = town.toLowerCase().replace(/\s+/g, '-');
    slug = `${slug}-${townSlug}`;
  }

  return slug;
}

/**
 * Categorize a business based on name and description
 */
export function categorizeByKeywords(name: string, description?: string): { category: string; subcategory?: string } {
  const text = `${name} ${description || ''}`.toLowerCase();

  // Food & Drink
  if (/\b(restaurant|dining|eatery|grill|bistro|trattoria|steakhouse|sushi|pizzeria)\b/.test(text)) {
    return { category: 'Restaurant' };
  }
  if (/\b(cafe|coffee|espresso|roaster)\b/.test(text)) {
    return { category: 'Cafe' };
  }
  if (/\b(bakery|bake|pastry|bread|donut|bagel)\b/.test(text)) {
    return { category: 'Bakery' };
  }
  if (/\b(bar|pub|tavern|brewery|taproom|wine bar)\b/.test(text)) {
    return { category: 'Bar' };
  }

  // Hospitality
  if (/\b(inn|bed and breakfast|b&b|b & b)\b/.test(text)) {
    return { category: 'Inn' };
  }
  if (/\b(hotel|suites|resort|lodge)\b/.test(text)) {
    return { category: 'Hotel' };
  }
  if (/\b(rental|vacation|vrbo|airbnb)\b/.test(text)) {
    return { category: 'Vacation Rental' };
  }

  // Retail
  if (/\b(gallery|galleries|art gallery)\b/.test(text)) {
    return { category: 'Gallery' };
  }
  if (/\b(boutique|clothing|apparel|fashion)\b/.test(text)) {
    return { category: 'Boutique' };
  }
  if (/\b(shop|store|retail|gifts|market)\b/.test(text)) {
    return { category: 'Retail' };
  }

  // Services
  if (/\b(real estate|realty|realtor)\b/.test(text)) {
    return { category: 'Real Estate' };
  }
  if (/\b(property manag|rental manag)\b/.test(text)) {
    return { category: 'Property Management' };
  }
  if (/\b(contractor|construction|building|builder)\b/.test(text)) {
    return { category: 'Contractor' };
  }
  if (/\b(plumb|electric|hvac|heating|cooling|ac service)\b/.test(text)) {
    return { category: 'Contractor' };
  }
  if (/\b(landscap|lawn|garden|tree service)\b/.test(text)) {
    return { category: 'Landscaping' };
  }

  // Maritime
  if (/\b(marina|boat|yacht|sailing|charter|ferry)\b/.test(text)) {
    return { category: 'Marina' };
  }
  if (/\b(tour|excursion|adventure|fishing trip)\b/.test(text)) {
    return { category: 'Tour Operator' };
  }

  // Health
  if (/\b(dental|dentist|dds|dmd|orthodont)\b/.test(text)) {
    return { category: 'Dental' };
  }
  if (/\b(doctor|medical|physician|md|clinic|health center|hospital)\b/.test(text)) {
    return { category: 'Medical' };
  }
  if (/\b(wellness|spa|massage|yoga|therapy|fitness|gym)\b/.test(text)) {
    return { category: 'Wellness' };
  }
  if (/\b(pharma|drug|rx)\b/.test(text)) {
    return { category: 'Pharmacy' };
  }

  // Professional
  if (/\b(law|attorney|lawyer|legal)\b/.test(text)) {
    return { category: 'Legal' };
  }
  if (/\b(account|cpa|tax|bookkeep)\b/.test(text)) {
    return { category: 'Accounting' };
  }
  if (/\b(insurance|insur)\b/.test(text)) {
    return { category: 'Insurance' };
  }
  if (/\b(bank|credit union|financial)\b/.test(text)) {
    return { category: 'Financial' };
  }

  // Community
  if (/\b(nonprofit|non-profit|foundation|association|charity)\b/.test(text)) {
    return { category: 'Nonprofit' };
  }
  if (/\b(school|academy|education|college|university)\b/.test(text)) {
    return { category: 'School' };
  }
  if (/\b(church|temple|synagogue|mosque|religious)\b/.test(text)) {
    return { category: 'Religious' };
  }
  if (/\b(camp|summer camp)\b/.test(text)) {
    return { category: 'Camp' };
  }
  if (/\b(library|museum|theater|theatre)\b/.test(text)) {
    return { category: 'Cultural' };
  }

  // Auto
  if (/\b(auto|car|vehicle|mechanic|garage|body shop)\b/.test(text)) {
    return { category: 'Auto' };
  }

  return { category: 'Other' };
}

/**
 * Calculate a confidence score for a business record
 */
export function calculateConfidenceScore(business: {
  business_name: string;
  town?: string;
  phone?: string;
  email?: string;
  website?: string;
  street_address?: string;
  category?: string;
  website_verified?: boolean;
  source_count?: number;
}): number {
  let score = 0;

  // Name quality (0-25)
  if (business.business_name) {
    score += 10;
    if (!isUrlStyleName(business.business_name)) {
      score += 10;
    }
    if (business.business_name.length > 3 && business.business_name.length < 100) {
      score += 5;
    }
  }

  // Location (0-20)
  if (business.town) {
    score += 10;
    if (business.street_address) {
      score += 10;
    }
  }

  // Contact info (0-30)
  if (business.phone) score += 10;
  if (business.email) score += 10;
  if (business.website) {
    score += 5;
    if (business.website_verified) {
      score += 5;
    }
  }

  // Category (0-10)
  if (business.category && business.category !== 'Other') {
    score += 10;
  }

  // Source corroboration (0-15)
  const sourceCount = business.source_count || 1;
  score += Math.min(sourceCount * 5, 15);

  return Math.round(score);
}

/**
 * Determine publishability tier based on confidence score and data completeness
 */
export function determinePublishTier(business: {
  business_name: string;
  town?: string;
  phone?: string;
  email?: string;
  website?: string;
  street_address?: string;
  category?: string;
  confidence_score?: number;
  website_verified?: boolean;
}): 'A' | 'B' | 'C' | 'unpublishable' {
  const score = business.confidence_score ?? calculateConfidenceScore(business);

  // Unpublishable: URL-style names, no town, or very low confidence
  if (isUrlStyleName(business.business_name)) {
    return 'unpublishable';
  }
  if (!business.town) {
    return 'unpublishable';
  }
  if (score < 30) {
    return 'unpublishable';
  }

  // Tier A: High quality (70+), has town + contact + verified website
  if (score >= 70 && business.website_verified && (business.phone || business.email)) {
    return 'A';
  }

  // Tier B: Good quality (50-69), has town + some contact
  if (score >= 50 && (business.phone || business.website)) {
    return 'B';
  }

  // Tier C: Acceptable (30-49), has town + name
  if (score >= 30) {
    return 'C';
  }

  return 'unpublishable';
}

/**
 * MV Towns list
 */
export const MV_TOWNS = [
  'Vineyard Haven',
  'Oak Bluffs',
  'Edgartown',
  'West Tisbury',
  'Chilmark',
  'Aquinnah'
];

/**
 * Town aliases/variations
 */
export const TOWN_ALIASES: Record<string, string> = {
  'tisbury': 'Vineyard Haven',
  'vh': 'Vineyard Haven',
  'ob': 'Oak Bluffs',
  'et': 'Edgartown',
  'wt': 'West Tisbury',
  'gay head': 'Aquinnah',
  'menemsha': 'Chilmark' // Menemsha is in Chilmark
};

/**
 * Normalize town name to standard form
 */
export function normalizeTown(town: string): string | null {
  if (!town) return null;

  const lower = town.toLowerCase().trim();

  // Check aliases
  if (TOWN_ALIASES[lower]) {
    return TOWN_ALIASES[lower];
  }

  // Check exact matches
  for (const mvTown of MV_TOWNS) {
    if (lower === mvTown.toLowerCase()) {
      return mvTown;
    }
  }

  // Check partial matches
  for (const mvTown of MV_TOWNS) {
    if (lower.includes(mvTown.toLowerCase()) || mvTown.toLowerCase().includes(lower)) {
      return mvTown;
    }
  }

  return null;
}

/**
 * Extract town from address string
 */
export function extractTownFromAddress(address: string): string | null {
  if (!address) return null;

  const lower = address.toLowerCase();

  // Check for MV towns in address
  for (const town of MV_TOWNS) {
    if (lower.includes(town.toLowerCase())) {
      return town;
    }
  }

  // Check aliases
  for (const [alias, canonical] of Object.entries(TOWN_ALIASES)) {
    if (lower.includes(alias)) {
      return canonical;
    }
  }

  return null;
}

/**
 * Determine island region from town
 */
export function getIslandRegion(town: string): 'down-island' | 'up-island' | null {
  if (!town) return null;

  const normalized = normalizeTown(town);
  if (!normalized) return null;

  const downIsland = ['Vineyard Haven', 'Oak Bluffs', 'Edgartown'];
  const upIsland = ['West Tisbury', 'Chilmark', 'Aquinnah'];

  if (downIsland.includes(normalized)) return 'down-island';
  if (upIsland.includes(normalized)) return 'up-island';

  return null;
}
