/**
 * ESM wrapper around scripts/lib/taxonomy.cjs.
 *
 * Required because scripts/export-directory-data.js uses ESM syntax
 * (`import`) and can't `require()` the CJS module directly via Node's
 * normal interop. The wrapper re-exports the same constants so both
 * .cjs (sitemap, prerender) and .mjs (export-directory) consumers see
 * identical taxonomy.
 *
 * Keep this file thin — it should NEVER define taxonomy on its own.
 */

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const tax = require('./taxonomy.cjs');

export const MV_TOWNS = tax.MV_TOWNS;
export const VALID_TOWN_SLUGS = tax.VALID_TOWN_SLUGS;
export const CATEGORIES = tax.CATEGORIES;
export const VALID_CATEGORY_SLUGS = tax.VALID_CATEGORY_SLUGS;
export const CATEGORY_TO_SLUG = tax.CATEGORY_TO_SLUG;
export const LEGACY_LEGACY_SLUGS = tax.LEGACY_LEGACY_SLUGS;
export const assertModernCategorySlug = tax.assertModernCategorySlug;
