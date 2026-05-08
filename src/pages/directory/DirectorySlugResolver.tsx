import { useParams, Navigate } from "react-router-dom";
import { getTownBySlug, getBusinessTypeBySlug, normalizeCategorySlug } from "@/data/directory";
import TownPage from "./TownPage";
import BusinessTypePage from "./BusinessTypePage";

// Legacy slug shapes that don't fit the central LEGACY_CATEGORY_REMAP — these
// were one-off WordPress migration artifacts. Server-side 308s in vercel.json
// should catch these before the SPA loads; this is the SPA-side fallback for
// in-app navigations.
const SLUG_REDIRECTS: Record<string, string> = {
  "restaurantsand-food-and-beverages": "restaurants-food-beverages",
  "familyand-community-and-government": "family-community-government",
};

/**
 * Resolves a single slug parameter to either a Town page or BusinessType page.
 * This handles the route /marthas-vineyard/:slug where slug could be:
 * - A town slug like "edgartown", "oak-bluffs"
 * - A business type slug like "restaurants-food-beverages", "shopping-and-specialty-retail"
 * - An old slug that needs redirecting
 */
export default function DirectorySlugResolver() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return <Navigate to="/marthas-vineyard" replace />;
  }

  // Check if this is an old slug that needs redirect
  const redirectSlug = SLUG_REDIRECTS[slug];
  if (redirectSlug) {
    return <Navigate to={`/marthas-vineyard/${redirectSlug}`} replace />;
  }

  // Legacy category short-form (e.g. /lodging-tourism → /lodging-and-tourism).
  // Server-side 308 should beat us to it; this is the SPA safety net.
  const normalized = normalizeCategorySlug(slug);
  if (normalized && normalized !== slug && getBusinessTypeBySlug(normalized)) {
    return <Navigate to={`/marthas-vineyard/${normalized}`} replace />;
  }

  // Check if it's a business type first (more specific slugs)
  const businessType = getBusinessTypeBySlug(slug);
  if (businessType) {
    return <BusinessTypePage />;
  }

  // Check if it's a town
  const town = getTownBySlug(slug);
  if (town) {
    return <TownPage />;
  }

  // Neither - redirect to directory index
  return <Navigate to="/marthas-vineyard" replace />;
}
