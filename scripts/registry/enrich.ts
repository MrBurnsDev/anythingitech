/**
 * Business Enrichment Pipeline
 * Fetches website metadata to extract proper business names and details
 */

import {
  isUrlStyleName,
  extractNameFromUrl,
  cleanBusinessName,
  extractDomain,
  categorizeByKeywords,
  calculateConfidenceScore,
  determinePublishTier,
  titleCase,
} from './utils';

interface EnrichmentResult {
  success: boolean;
  business_name?: string;
  name_source?: 'website_title' | 'og_title' | 'meta_name' | 'url_extraction' | 'original';
  short_description?: string;
  description_source?: 'meta_description' | 'og_description';
  category?: string;
  category_source?: 'website_content' | 'name_keywords';
  website_verified?: boolean;
  website_status?: number;
  homepage_title?: string;
  meta_description?: string;
  error?: string;
}

/**
 * Decode HTML entities
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&nbsp;/g, ' ')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"');
}

/**
 * Clean a title tag to extract business name
 */
function cleanTitleTag(title: string): string | null {
  if (!title || title.length < 2) return null;

  // Decode HTML entities first
  let cleaned = decodeHtmlEntities(title.trim());

  // Remove common suffixes and separators
  const suffixPatterns = [
    /\s*[-–—|]\s*(Home|Welcome|Official Site|Official Website).*$/i,
    /\s*[-–—|]\s*(Martha'?s?\s+Vineyard|MV|MVY).*$/i,
    /\s*[-–—|]\s*(Oak Bluffs|Edgartown|Vineyard Haven|West Tisbury|Chilmark|Aquinnah|Massachusetts|MA).*$/i,
    /\s*\|\s*Home\s*$/i,
    /\s*-\s*Home\s*$/i,
    /^Home\s*[-–—|]\s*/i,
    /^Welcome to\s+/i,
    /\s*[-–—|]\s*$/, // Trailing separator
    /\s*[-–—|].*$/, // Everything after a separator (captures overly long titles)
  ];

  for (const pattern of suffixPatterns) {
    cleaned = cleaned.replace(pattern, '');
  }

  cleaned = cleaned.trim();

  // If too short or too long, it's probably not a good name
  if (cleaned.length < 2 || cleaned.length > 60) return null;

  // If it still looks like a URL, skip it
  if (isUrlStyleName(cleaned)) return null;

  // Skip generic/placeholder names
  const genericPatterns = [
    /^website\s*\d*$/i,
    /^site\s*\d*$/i,
    /^untitled/i,
    /^coming soon/i,
    /^under construction/i,
    /^page not found/i,
    /^404/i,
    /^error/i,
  ];
  for (const pattern of genericPatterns) {
    if (pattern.test(cleaned)) return null;
  }

  return titleCase(cleaned);
}

/**
 * Extract business info from HTML content
 */
function extractFromHtml(html: string): {
  title?: string;
  ogTitle?: string;
  metaName?: string;
  metaDescription?: string;
  ogDescription?: string;
} {
  const result: ReturnType<typeof extractFromHtml> = {};

  // Extract <title>
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch) {
    result.title = titleMatch[1].trim();
  }

  // Extract og:title
  const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:title["']/i);
  if (ogTitleMatch) {
    result.ogTitle = ogTitleMatch[1].trim();
  }

  // Extract meta name (some sites use this for business name)
  const metaNameMatch = html.match(/<meta[^>]*name=["']application-name["'][^>]*content=["']([^"']+)["']/i);
  if (metaNameMatch) {
    result.metaName = metaNameMatch[1].trim();
  }

  // Extract meta description
  const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']description["']/i);
  if (metaDescMatch) {
    result.metaDescription = metaDescMatch[1].trim();
  }

  // Extract og:description
  const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i)
    || html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:description["']/i);
  if (ogDescMatch) {
    result.ogDescription = ogDescMatch[1].trim();
  }

  return result;
}

/**
 * Fetch website and extract business information
 */
export async function enrichFromWebsite(
  website: string,
  currentName: string
): Promise<EnrichmentResult> {
  if (!website) {
    return { success: false, error: 'No website provided' };
  }

  // Normalize URL
  let url = website.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  try {
    // Fetch with timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      redirect: 'follow',
    });

    clearTimeout(timeout);

    // Check if we were redirected to a different domain (parked/sold domain)
    const originalDomain = extractDomain(url);
    const finalDomain = extractDomain(response.url);
    if (originalDomain && finalDomain && originalDomain !== finalDomain) {
      // Different domain - likely parked or sold
      return {
        success: false,
        error: `Redirected to different domain: ${finalDomain}`,
        website_verified: false,
      };
    }

    const result: EnrichmentResult = {
      success: true,
      website_verified: response.ok,
      website_status: response.status,
    };

    if (!response.ok) {
      result.success = false;
      result.error = `HTTP ${response.status}`;
      return result;
    }

    const html = await response.text();
    const extracted = extractFromHtml(html);

    // Store raw metadata
    result.homepage_title = extracted.title;
    result.meta_description = extracted.metaDescription || extracted.ogDescription;

    // Determine best business name
    const currentNameIsUrl = isUrlStyleName(currentName);

    // Priority: og:title > cleaned title > application-name > url extraction > original
    let newName: string | null = null;
    let nameSource: EnrichmentResult['name_source'] = 'original';

    // Try og:title first (often cleaner)
    if (extracted.ogTitle) {
      const cleanedOg = cleanTitleTag(extracted.ogTitle);
      if (cleanedOg && cleanedOg.length >= 2) {
        newName = cleanedOg;
        nameSource = 'og_title';
      }
    }

    // Try regular title if no og:title worked
    if (!newName && extracted.title) {
      const cleanedTitle = cleanTitleTag(extracted.title);
      if (cleanedTitle && cleanedTitle.length >= 2) {
        newName = cleanedTitle;
        nameSource = 'website_title';
      }
    }

    // Try meta application-name
    if (!newName && extracted.metaName) {
      const cleanedMeta = cleanTitleTag(extracted.metaName);
      if (cleanedMeta && cleanedMeta.length >= 2) {
        newName = cleanedMeta;
        nameSource = 'meta_name';
      }
    }

    // If current name is URL-style and we still have nothing, try URL extraction
    if (!newName && currentNameIsUrl) {
      const urlExtracted = extractNameFromUrl(currentName);
      if (urlExtracted) {
        newName = urlExtracted;
        nameSource = 'url_extraction';
      }
    }

    // Set the name
    if (newName && (currentNameIsUrl || newName.length > currentName.length)) {
      result.business_name = cleanBusinessName(newName);
      result.name_source = nameSource;
    } else if (!currentNameIsUrl) {
      result.business_name = cleanBusinessName(currentName);
      result.name_source = 'original';
    }

    // Set description
    if (extracted.metaDescription) {
      result.short_description = extracted.metaDescription.slice(0, 300);
      result.description_source = 'meta_description';
    } else if (extracted.ogDescription) {
      result.short_description = extracted.ogDescription.slice(0, 300);
      result.description_source = 'og_description';
    }

    // Categorize based on content
    if (result.business_name || result.short_description) {
      const { category } = categorizeByKeywords(
        result.business_name || currentName,
        result.short_description
      );
      if (category !== 'Other') {
        result.category = category;
        result.category_source = result.short_description ? 'website_content' : 'name_keywords';
      }
    }

    return result;

  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      website_verified: false,
    };
  }
}

/**
 * Enrich a business record with additional data
 */
export async function enrichBusiness(business: {
  id: number;
  business_name: string;
  website?: string;
  category?: string;
  short_description?: string;
}): Promise<EnrichmentResult & { confidence_score: number; publish_tier: string }> {
  // Start with URL-based name extraction if needed
  let enriched: EnrichmentResult = { success: false };

  if (business.website) {
    enriched = await enrichFromWebsite(business.website, business.business_name);
  } else if (isUrlStyleName(business.business_name)) {
    // No website but URL-style name - try to extract from the name itself
    const extracted = extractNameFromUrl(business.business_name);
    if (extracted) {
      enriched = {
        success: true,
        business_name: cleanBusinessName(extracted),
        name_source: 'url_extraction',
      };
    }
  }

  // Calculate scores
  const updatedBusiness = {
    ...business,
    business_name: enriched.business_name || business.business_name,
    category: enriched.category || business.category,
    short_description: enriched.short_description || business.short_description,
    website_verified: enriched.website_verified,
  };

  const confidence_score = calculateConfidenceScore(updatedBusiness);
  const publish_tier = determinePublishTier({
    ...updatedBusiness,
    confidence_score,
  });

  return {
    ...enriched,
    confidence_score,
    publish_tier,
  };
}

/**
 * Process a batch of businesses for enrichment
 */
export async function enrichBatch(
  businesses: Array<{
    id: number;
    business_name: string;
    website?: string;
    category?: string;
    short_description?: string;
  }>,
  options: {
    concurrency?: number;
    delayMs?: number;
    onProgress?: (current: number, total: number, result: EnrichmentResult) => void;
  } = {}
): Promise<Map<number, EnrichmentResult & { confidence_score: number; publish_tier: string }>> {
  const { concurrency = 3, delayMs = 500, onProgress } = options;
  const results = new Map<number, EnrichmentResult & { confidence_score: number; publish_tier: string }>();

  // Process in batches
  for (let i = 0; i < businesses.length; i += concurrency) {
    const batch = businesses.slice(i, i + concurrency);

    const batchResults = await Promise.all(
      batch.map(async (business) => {
        const result = await enrichBusiness(business);
        return { id: business.id, result };
      })
    );

    for (const { id, result } of batchResults) {
      results.set(id, result);
      if (onProgress) {
        onProgress(i + batchResults.indexOf({ id, result } as any) + 1, businesses.length, result);
      }
    }

    // Rate limiting delay
    if (i + concurrency < businesses.length) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  return results;
}
