import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://zrrinbeyiuiydalxiwii.supabase.co";
// Use service role key for server-side API (already available in Vercel)
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

/**
 * GET /api/directory/businesses
 *
 * Public API to fetch businesses from Supabase.
 * No authentication required - this is public data.
 *
 * Query params:
 *   - town: filter by town slug
 *   - type: filter by business type slug
 *   - slug: get single business by slug
 *   - search: search by name/description
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS");
  res.setHeader("Cache-Control", "s-maxage=60, stale-while-revalidate=300");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { town, type, slug, search } = req.query;

  try {
    let query = supabase
      .from("businesses")
      .select("*")
      .eq("business_status", "active")
      .eq("is_duplicate", false)
      .order("business_name");

    // Single business by slug
    if (slug && typeof slug === "string") {
      query = query.eq("slug", slug);
      const { data, error } = await query.single();

      if (error || !data) {
        return res.status(404).json({ error: "Business not found" });
      }

      return res.status(200).json({ business: transformBusiness(data) });
    }

    // Filter by town
    if (town && typeof town === "string") {
      // Convert town slug to town name for matching
      const townName = slugToTownName(town);
      if (townName) {
        query = query.eq("town", townName);
      }
    }

    // Filter by business type
    if (type && typeof type === "string") {
      const category = slugToCategory(type);
      if (category) {
        query = query.eq("category", category);
      }
    }

    // Search
    if (search && typeof search === "string") {
      query = query.or(`business_name.ilike.%${search}%,short_description.ilike.%${search}%`);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase error:", error);
      return res.status(500).json({ error: "Failed to fetch businesses" });
    }

    const businesses = (data || []).map(transformBusiness);

    return res.status(200).json({ businesses });
  } catch (error) {
    console.error("API error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

function transformBusiness(row: Record<string, unknown>) {
  return {
    id: row.id,
    name: row.business_name,
    slug: row.slug,
    category: row.category,
    businessType: categoryToSlug(row.category as string),
    description: row.short_description || null,
    town: row.town,
    townSlug: townToSlug(row.town as string),
    address: row.full_address || null,
    phone: row.phone || null,
    email: row.email || null,
    website: row.website || null,
    hours: null,
    seasonal: null,
    coordinates: row.latitude && row.longitude
      ? { lat: row.latitude as number, lng: row.longitude as number }
      : null,
    status: row.business_status || "active",
    confidence: row.confidence_score || 70,
    social: {
      facebook: row.facebook_url || null,
      instagram: row.instagram_url || null,
      yelp: row.yelp_url || null,
      tripadvisor: row.tripadvisor_url || null,
    },
  };
}

function townToSlug(town: string): string {
  if (!town) return "unknown";
  return town.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

function slugToTownName(slug: string): string | null {
  const townMap: Record<string, string> = {
    "vineyard-haven": "Vineyard Haven",
    "oak-bluffs": "Oak Bluffs",
    "edgartown": "Edgartown",
    "west-tisbury": "West Tisbury",
    "chilmark": "Chilmark",
    "aquinnah": "Aquinnah",
    "menemsha": "Menemsha",
    "tisbury": "Tisbury",
  };
  return townMap[slug] || null;
}

function categoryToSlug(category: string): string {
  if (!category) return "other";

  // Map to exact slugs used in business-types.json
  const categorySlugMap: Record<string, string> = {
    "restaurants, food & beverages": "restaurants-food-beverages",
    "shopping & specialty retail": "shopping-and-specialty-retail",
    "lodging & tourism": "lodging-and-tourism",
    "beauty & wellness": "beauty-and-wellness",
    "arts & entertainment": "arts-and-entertainment",
    "family, community & government": "family-community-government",
    "medical services & providers": "medical-services-and-providers",
    "building & construction": "building-and-construction",
    "business & professional services": "business-and-professional-services",
    "home services & trades": "home-services-and-trades",
    "real estate & rentals": "real-estate-and-rentals",
    "sports & recreation": "sports-and-recreation",
    "transportation & utilities": "transportation-and-utilities",
    "automotive & marine": "automotive-and-marine",
    "wedding & event services": "wedding-and-event-services",
    "banking, finance & insurance": "banking-finance-and-insurance",
    "house, garden & pets": "house-garden-and-pets",
    "professional services": "professional-services",
    "contractors": "contractors",
    "restaurant": "restaurants-food-beverages",
    "other": "other",
  };

  const normalized = category.toLowerCase().trim();
  return categorySlugMap[normalized] || category.toLowerCase()
    .replace(/&/g, "-")
    .replace(/,/g, "")
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-");
}

function slugToCategory(slug: string): string | null {
  const categoryMap: Record<string, string> = {
    "restaurants-food-beverages": "Restaurants, Food & Beverages",
    "restaurants-food-and-beverages": "Restaurants, Food & Beverages",
    "shopping-specialty-retail": "Shopping & Specialty Retail",
    "shopping-and-specialty-retail": "Shopping & Specialty Retail",
    "professional-services": "Professional Services",
    "building-construction": "Building & Construction",
    "building-and-construction": "Building & Construction",
    "health-wellness": "Health & Wellness",
    "health-and-wellness": "Health & Wellness",
    "arts-entertainment": "Arts & Entertainment",
    "arts-and-entertainment": "Arts & Entertainment",
    "lodging": "Lodging",
    "automotive-marine": "Automotive & Marine",
    "automotive-and-marine": "Automotive & Marine",
    "real-estate": "Real Estate",
    "family-community-government": "Family, Community & Government",
    "contractors": "Contractors",
    "other": "Other",
  };
  return categoryMap[slug] || null;
}
