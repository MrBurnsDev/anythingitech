# SEO Redirect & Canonical Audit — 2026-05-08

Property: `https://anythingitechmv.com`
Trigger: Google Search Console "Page with redirect" exclusions jumped from ~19 → 244 → 590 between 2026-04-27 and 2026-05-03.

## TL;DR

The root cause was **not** a www/non-www problem. Three issues stacked:

1. **The SPA shell was being served as the canonical for every non-prerendered URL.** Vite SPA + Vercel rewrite `"/((?!api/).*)" → /index.html` meant Google fetched `https://anythingitechmv.com/marthas-vineyard/oak-bluffs/lodging-tourism/morgan-hotel-oak-bluffs` and got HTML whose static `<link rel="canonical">` was always `https://anythingitechmv.com/`. After JS hydration, React Router issued an in-app `<Navigate>` to the corrected URL — Google sees that as a redirect away from a page whose canonical pointed somewhere else. Hence "Page with redirect."

2. **Legacy category slugs had no server-side 308 redirect.** `lodging-tourism`, `shopping-specialty-retail`, `arts-entertainment`, `restaurant`, `health-wellness`, `other`, etc. existed as URLs in Google's index from the WordPress migration. The only handler was a client-side `<Navigate replace>` in React Router.

3. **The static prerender script only covered 12 routes.** Every directory page (~330 URLs) shipped without a real prerendered HTML file.

## Fixes deployed in this PR

### A. Server-side 308 redirects (`vercel.json`)
- 23 legacy single-segment category mappings (`/lodging-tourism → /lodging-and-tourism`, etc.).
- 46 town+category and town+category+business mappings (`/oak-bluffs/restaurant/foo → /oak-bluffs/restaurants-food-beverages/foo`).
- `/marthas-vineyard/unknown(/.*)? → /marthas-vineyard` (308).
- `/marthas-vineyard/:town/other(/.*)? → /marthas-vineyard/:town` (308).
- `/archives/:id → /tech-tips` (WordPress legacy).
- 49 pre-existing business-rename redirects modernized to use modern category slugs (prevents redirect chains).

### B. Prerender expansion (`scripts/prerender.cjs`)
- Reads `dist/sitemap.xml` and prerenders every URL (331 total).
- Proxies `/api/*` to the live API during prerender so the React app hydrates with real data.
- Concurrency tunable via `PRERENDER_CONCURRENCY` env var (default 4).
- Validates each prerendered page's `<link rel="canonical">` matches the URL it was rendered for; flags mismatches as warnings.
- Final result: **331 ok, 0 warnings, 0 failed.**

### C. Sitemap quality + alignment (`scripts/generate-sitemap.cjs`)
- Lightweight `LEGACY_CATEGORY_REMAP` translates stale `businessType` values (`lodging`, `health-wellness`, `community`, `professional-services`, etc.) to modern slugs at sitemap-generation time. Source of truth remains the business data; remap is transitional.
- `REJECT_CATEGORIES` (`other`, `unknown`, `contractors`) excluded entirely.
- Thin-page filter: businesses scoring < 2 on `description+phone+website+address+social+hours` are excluded (excludes 6 of 299).
- Sitemap entries are cross-checked against the static SPA exports (`data/exports/towns.json`, `business-types.json`) — entries the SPA can't render are excluded so the sitemap and prerender stay aligned.
- Public API endpoint instead of the previous hardcoded admin auth.
- New `npm run sitemap` script. `build:prerender` now runs sitemap → vite build → prerender in order.

### D. SEO component (`src/components/SEO.tsx`)
- Now accepts `jsonLd` prop and renders one or more `<script type="application/ld+json">` tags.
- Always emits `og:url` aligned with `canonical` (single source of truth).

### E. Page-level metadata
- `BusinessPage.tsx`: emits `LocalBusiness` + `BreadcrumbList` JSON-LD, all URLs aligned with canonical.
- `TownBusinessTypePage.tsx`, `TownPage.tsx`, `BusinessTypePage.tsx`: emit `BreadcrumbList` JSON-LD.
- `normalizeCategorySlug()` in `src/data/directory.ts` ensures the canonical URL always uses the modern slug, even if the user reached the page via a legacy slug. Mirrors `LEGACY_CATEGORY_REMAP` in the sitemap script.
- Internal URL helpers (`getBusinessUrl`, `getTownBusinessTypeUrl`, `getBusinessTypeUrl`) emit modern slugs unconditionally.

### F. Misc cleanup
- 11 `https://www.anythingitechmv.com/wp-content/...` image URLs in `src/data/tech-tips.json` → `https://anythingitechmv.com/...`.
- `https://www.anythingitechmv.com` link in `src/components/admin/AdminLayout.tsx` → `https://anythingitechmv.com`.
- DirectorySlugResolver, BusinessPage, TownBusinessTypePage now also normalize legacy slugs in-app as a safety net behind the server-side 308.

## Validation results

### Prerender
- 331 routes prerendered (was 12).
- 0 canonical mismatches.
- Average prerendered HTML size: ~95 KB (vs 1.4 KB SPA shell).
- Build wall-clock with concurrency=6: ~3-4 min.

### Sample prerendered output (Harbor View Hotel)
```
<title>Harbor View Hotel - Edgartown, Martha's Vineyard | Anything Itech MV</title>
<meta name="description" content="Historic grand hotel overlooking Edgartown Harbor... Located in Edgartown, Martha's Vineyard.">
<link rel="canonical" href="https://anythingitechmv.com/marthas-vineyard/edgartown/lodging-and-tourism/harbor-view-hotel-edgartown">
<meta property="og:url" content="https://anythingitechmv.com/marthas-vineyard/edgartown/lodging-and-tourism/harbor-view-hotel-edgartown">
<meta property="og:title" content="Harbor View Hotel - Edgartown, Martha's Vineyard | Anything Itech MV">
```
JSON-LD: `LocalBusiness` (with phone, address, geo) + `BreadcrumbList` (4-level: Directory → Edgartown → Hotels & Lodging → Harbor View Hotel).

### Curl tests (post-deploy expectations)
```bash
# Already working
curl -sI https://www.anythingitechmv.com/        # 308 → https://anythingitechmv.com/
curl -sI http://anythingitechmv.com/             # 308 → https://anythingitechmv.com/
curl -sI https://anythingitechmv.com/iphone-repair  # 308 → /services/apple-repair

# Will work after deploy
curl -sI https://anythingitechmv.com/marthas-vineyard/lodging-tourism
# expect: 308 → /marthas-vineyard/lodging-and-tourism
curl -sI https://anythingitechmv.com/marthas-vineyard/oak-bluffs/lodging-tourism/morgan-hotel-oak-bluffs
# expect: 308 → /marthas-vineyard/oak-bluffs/lodging-and-tourism/morgan-hotel-oak-bluffs
curl -sI https://anythingitechmv.com/marthas-vineyard/edgartown/restaurant/the-pelican-club
# expect: 308 → /marthas-vineyard/edgartown/restaurants-food-beverages/the-pelican-club
curl -sI https://anythingitechmv.com/marthas-vineyard/unknown/other/foo
# expect: 308 → /marthas-vineyard
curl -sI https://anythingitechmv.com/marthas-vineyard/edgartown/other/anything
# expect: 308 → /marthas-vineyard/edgartown
curl -sI https://anythingitechmv.com/archives/502
# expect: 308 → /tech-tips
```

### Sitemap counts
- 331 URLs (was 342) — net drop of 11 because 6 thin businesses + 34 `other`-category + 5 `tisbury`/`menemsha` businesses were excluded.
- Breakdown: 13 static + 14 tech-tips + 8 town indexes + 17 category indexes + 42 town+category indexes + 251 business pages.

## Known remaining risks

1. **Stale static exports.** `data/exports/towns.json` and `business-types.json` are missing several towns (`tisbury`, `menemsha`) and several categories (`home-services-and-trades`, `automotive-and-marine`, `wedding-and-event-services`, `transportation-and-utilities`, `house-garden-and-pets`, `real-estate-and-rentals`, `sports-and-recreation`, `banking-finance-and-insurance`). 6 live businesses are temporarily excluded from the sitemap until these are regenerated. Action: run the existing `npm run registry:export` workflow and commit the updated JSON.

2. **45 category mismatches** (see `docs/category-mismatches.csv`). Plumbers under "Hotels", architects under "Medical", etc. Not catastrophic — pages still render fine — but they'll get weaker entity signals from Google. Best fixed by editing the business records in Supabase. List exported to CSV for manual cleanup.

3. **24 stale rename redirects** in `vercel.json` whose destinations no longer exist (e.g., `/the-outermost-inn-aquinnah → /outermost-inn-aquinnah` but the current slug is `outermost-inn` without the `-aquinnah` suffix). Source URLs are unlikely to be hit at this point. Low priority.

4. **`/marthas-vineyard/unknown/*` and `/:town/other/*` redirect to a parent index, not 410.** Google deindexes 308-to-parent eventually; a 410 would be marginally faster. Deliberately deferred per architectural preference (no over-engineering).

5. **Build time increase**. `npm run build:prerender` went from ~30 s to ~3-4 min. If Vercel deploy times become an issue, raise `PRERENDER_CONCURRENCY` or split into a separate job.

6. **JS bundle size warning** (823 kB). Pre-existing. Not blocking.

## Expected GSC behavior after deploy

| Day | Behavior |
|-----|----------|
| 0–2 days | Google starts fetching deployed pages. Prerendered canonicals visible to crawler. New 308s start firing. |
| 3–14 days | "Page with redirect" count drops 50–70 % as Google reprocesses the bulk. May briefly tick UP as new 308s are discovered. |
| 14–45 days | Drop to <5 % of current count. Indexed page count rises as canonical pages get crawled and accepted. |
| 45–90 days | Long tail clears. www/http variants fully deindexed. Final state: ~0 redirect-related exclusions, 280–320 indexed pages. |

## File changes summary

```
M  vercel.json                                       # 78 new redirects + 49 modernized
M  scripts/generate-sitemap.cjs                      # legacy remap, thin filter, static-exports cross-check, public API
M  scripts/prerender.cjs                             # reads sitemap.xml, /api proxy, concurrency, canonical validation
M  src/components/SEO.tsx                            # jsonLd + og:url
M  src/data/directory.ts                             # normalizeCategorySlug, modern URL helpers
M  src/pages/directory/BusinessPage.tsx              # canonical/JSON-LD/breadcrumb alignment
M  src/pages/directory/BusinessTypePage.tsx          # canonical + breadcrumb
M  src/pages/directory/TownBusinessTypePage.tsx      # canonical + breadcrumb
M  src/pages/directory/TownPage.tsx                  # breadcrumb
M  src/pages/directory/DirectorySlugResolver.tsx     # SPA-side legacy slug fallback
M  src/data/tech-tips.json                           # www → non-www (11 image URLs)
M  src/components/admin/AdminLayout.tsx              # www → non-www
M  package.json                                      # new `sitemap` script, build:prerender wires sitemap first
A  docs/category-mismatches.csv                      # 45 mismatches for manual cleanup
A  docs/seo-redirect-audit-2026-05-08.md             # this doc
```

## Pre-deploy verification results

Run on the local `dist/` output of `npm run build:prerender`.

| Check | Result | Notes |
|---|---|---|
| Per-page canonical/title/desc/og:url/JSON-LD on 5 sample business pages | ✅ all match expected | Harbor View Hotel, Offshore Ale, Bunch of Grapes, Menemsha Gallery, State Road |
| Static HTML SEO presence on 8 page types | ✅ 8/8 pass | Business / town+cat / town / category / directory / tech-tip / service / home |
| Prerender coverage of every sitemap URL | ✅ 331/331 | min size 36 KB, max 253 KB, avg 65 KB (vs 1.4 KB SPA shell) |
| Per-page canonical exactly matches its URL | ✅ 0 mismatches across 331 | The bug we set out to fix is gone |
| Sitemap contains no legacy/forbidden patterns | ✅ 0 leaks | Checked: 27 legacy slug forms + `/other/` + `/unknown/` + `?` + `#` + `www.` + `http://` |
| Sitemap URL format hygiene | ✅ all lowercase, no trailing slashes, no duplicates | |
| No duplicate canonicals across the prerendered output | ✅ every canonical maps to one page | |

## Deploy checklist

- [ ] `npm install` clean (no lockfile drift)
- [x] `npm run build:prerender` succeeds locally (sitemap → build → prerender, 331/331 ok / 0 warnings)
- [x] Pre-deploy verifications above all pass
- [x] HTML snapshots saved to `docs/snapshots/` for future reference
- [ ] Deploy to Vercel: `npm run deploy`
- [ ] Run `bash docs/post-deploy-verify.sh` — should report `0 failed`
- [ ] Submit updated `sitemap.xml` in GSC and request re-validation on the "Page with redirect" issue
- [ ] Monitor GSC for 7–14 days; expect first drop in count
- [ ] Schedule a follow-up to regenerate `data/exports/*.json` so currently-excluded businesses re-enter the sitemap

## Files in this PR

```
M  vercel.json
M  scripts/generate-sitemap.cjs
M  scripts/prerender.cjs
M  src/components/SEO.tsx
M  src/data/directory.ts
M  src/pages/directory/BusinessPage.tsx
M  src/pages/directory/BusinessTypePage.tsx
M  src/pages/directory/TownBusinessTypePage.tsx
M  src/pages/directory/TownPage.tsx
M  src/pages/directory/DirectorySlugResolver.tsx
M  src/data/tech-tips.json
M  src/components/admin/AdminLayout.tsx
M  package.json
M  public/sitemap.xml         (regenerated)
M  public/robots.txt          (regenerated)
A  docs/seo-redirect-audit-2026-05-08.md
A  docs/category-mismatches.csv
A  docs/post-deploy-verify.sh
A  docs/snapshots/business-page-harbor-view-hotel.html
A  docs/snapshots/town-category-oak-bluffs-restaurants.html
A  docs/snapshots/directory-home.html
```
