# SEO Backlog — non-critical improvements

Everything in this file is **optional**. The core SEO infrastructure (canonical/redirect/prerender/sitemap) is stable. These are quality-of-results improvements to consider after GSC stabilizes (post day-30).

---

## Critical
**None.** All critical issues are resolved.

---

## Important

### 1. Regenerate static exports
- **What:** `data/exports/towns.json` and `business-types.json` are stale; missing 2 towns (`tisbury`, `menemsha`) and 8 categories (`home-services-and-trades`, `automotive-and-marine`, `wedding-and-event-services`, `transportation-and-utilities`, `house-garden-and-pets`, `real-estate-and-rentals`, `sports-and-recreation`, `banking-finance-and-insurance`).
- **Impact:** 6 live businesses are temporarily excluded from sitemap+prerender. Their pages still load when a visitor reaches them, but Google won't discover them via sitemap.
- **Fix:** Run `npm run registry:export`, commit the regenerated exports. Re-run `npm run sitemap` to confirm count rises.
- **Effort:** ~10 min.

### 2. Resolve 45 category mismatches (`docs/category-mismatches.csv`)
- **What:** Plumbers under "Hotels & Lodging," architects under "Medical," galleries under "Restaurants," etc. Pages render correctly but the URL category doesn't match the business type.
- **Impact:** Weaker entity signals to Google; potential confusion for users; misclassified businesses won't rank well in their actual category.
- **Fix:** For each row in the CSV, edit the business in Supabase to set `businessType` to the inferred category. After each edit, the next sitemap regen + prerender will use the corrected URL.
- **Effort:** ~5 min per business × 45 = 4 hours, batchable.

### 3. Enrich 38 boilerplate descriptions
- **What:** 38 businesses have AI-generated boilerplate descriptions ("offers dining in [town], serving fresh meals in a relaxed island setting"). They have full contact data so they're not "thin" pages, but content is generic.
- **Impact:** Lower content-quality signals from Google. Mostly affects ranking, not indexing.
- **Fix:** Replace with hand-written 2-3 sentence descriptions over time. The list can be queried with the same boilerplate regex used in the audit (`scripts/generate-business-audit.cjs` if it still exists, otherwise grep).
- **Effort:** Variable; suggest 5/week.

### 4. Pre-existing stale rename redirects (24 entries)
- **What:** `vercel.json` has 24 business-rename redirects whose destinations don't exist in the current sitemap (e.g. `/the-outermost-inn-aquinnah → /outermost-inn-aquinnah` but the actual slug is `outermost-inn`).
- **Impact:** Low. Source URLs are unlikely to receive traffic at this point. If hit, they 308 to the SPA shell which client-side redirects to `/marthas-vineyard`.
- **Fix:** Either remove the entries or update destinations to match current slugs. Cross-reference `docs/snapshots/` against current sitemap URLs.
- **Effort:** ~1 hour.

---

## Nice-to-have

### 5. Bundle size / chunk splitting
- **What:** The main JS bundle is 823 KB minified. Vite warns about chunks > 500 KB.
- **Impact:** Page-load metric (LCP, TBT). Not directly SEO but affects Core Web Vitals which factor into ranking.
- **Fix:** Add `manualChunks` to `vite.config.ts`. Split out: `react`, `react-dom`, `@radix-ui/*`, `lucide-react`, `recharts`, `date-fns`. Possibly route-split admin pages.
- **Effort:** ~2 hours.

### 6. Image optimization
- **What:** Hero images are 100-340 KB JPEGs. No `srcset`, no AVIF/WebP variants.
- **Impact:** LCP score; mobile users on slow connections.
- **Fix:** Use Vercel's built-in image optimization (`<img>` with `loading="lazy"` for below-fold; Vercel Image component for above-fold). Add WebP variants.
- **Effort:** ~3 hours.

### 7. Structured data enhancements
- **What:** `LocalBusiness` JSON-LD currently includes name, description, URL, address, phone, geo, sameAs. Could add `priceRange`, `openingHours` (when business has hours data), `image`, `aggregateRating` (if reviews are added).
- **Impact:** Rich-snippet eligibility in SERPs.
- **Fix:** Extend the JSON-LD generator in `BusinessPage.tsx`. Map business `hours` field to schema.org's `OpeningHoursSpecification` format.
- **Effort:** ~2 hours; requires the business data to have those fields populated.

### 8. Breadcrumb schema expansion
- **What:** BreadcrumbList JSON-LD is correct, but only emitted on directory pages. Tech tip posts and service pages don't have them.
- **Impact:** SERP breadcrumb display.
- **Fix:** Add JSON-LD to `TechTipPost.tsx` and the service pages. Trivial.
- **Effort:** ~30 min.

### 9. Internal linking improvements
- **What:** Town pages currently link to category pages within that town, but cross-town and cross-category linking is sparse. Hub pages (`/marthas-vineyard`) could link more intentionally.
- **Impact:** PageRank distribution; helps Google discover deep pages.
- **Fix:** Audit `<Link>` density on town and category pages; add "related categories" or "nearby towns" sections.
- **Effort:** ~3-4 hours.

### 10. Tech tips structured data (Article)
- **What:** Tech tip posts are blog-style content but don't emit `Article` or `BlogPosting` JSON-LD.
- **Impact:** Article rich-snippet eligibility.
- **Fix:** Add `Article` JSON-LD to `TechTipPost.tsx`. Map `headline`, `datePublished`, `author`, `image`.
- **Effort:** ~1 hour.

### 11. Open Graph image per page
- **What:** Currently every page uses the same `/og-image.jpg`. Business pages could use the business's own image, town pages could use a town hero, tech tips could use the post's hero.
- **Impact:** Social-share appearance and click-through.
- **Fix:** Pass an `image` prop to `<SEO>` from each page where a relevant image exists.
- **Effort:** ~2 hours.

### 12. Hreflang (only if international audience emerges)
- **What:** No `hreflang` tags. Site is en-US only.
- **Impact:** None today.
- **Fix:** Skip until there's a non-English variant.

### 13. 410 instead of 308 for `/unknown/*` and `/other/*`
- **What:** Currently 308 to a parent index. Google deindexes 308s eventually; 410 (Gone) is faster.
- **Impact:** Marginally faster GSC cleanup. Not blocking.
- **Fix:** Build a Vercel function at `/api/_410.ts` that returns 410, then route `/unknown/(.*)` and `/:town/other/(.*)` to it. More work than the benefit warrants right now.
- **Effort:** ~2 hours.

---

## Watchlist (no action yet, but track)

- **Vercel build environment changes.** If Vercel updates the Node 24 image and Puppeteer's bundled Chromium fails to launch, the prerender step will fail. Mitigation: pin `puppeteer` version; consider switching to `puppeteer-core` + `@sparticuz/chromium` if Vercel's bundled browser disappears.
- **API rate limits during prerender.** Currently the prerender proxies ~331 requests to the live API in ~3-4 minutes. If the API ever rate-limits self-traffic, prerender fails. Mitigation: cache the businesses response for the duration of the build, or read from `data/exports/businesses.json` instead.
- **Sitemap drift if business data changes faster than deploys.** If a business is added but no deploy runs, GSC won't see them in the sitemap. Mitigation: schedule a daily Vercel deploy or hook business edits to a deploy webhook.
- **Static export drift.** Same root cause as item 1 above. As businesses get added/removed, the static `towns.json` and `business-types.json` snapshots can fall out of sync.
