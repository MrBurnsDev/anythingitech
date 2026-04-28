import { useParams, Navigate } from "react-router-dom";
import { getTownBySlug, getBusinessTypeBySlug } from "@/data/directory";
import TownPage from "./TownPage";
import BusinessTypePage from "./BusinessTypePage";

/**
 * Resolves a single slug parameter to either a Town page or BusinessType page.
 * This handles the route /marthas-vineyard/:slug where slug could be:
 * - A town slug like "edgartown", "oak-bluffs"
 * - A business type slug like "restaurantsand-food-and-beverages", "shopping-and-specialty-retail"
 */
export default function DirectorySlugResolver() {
  const { slug } = useParams<{ slug: string }>();

  if (!slug) {
    return <Navigate to="/marthas-vineyard" replace />;
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
