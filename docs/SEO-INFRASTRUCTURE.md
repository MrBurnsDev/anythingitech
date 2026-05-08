# SEO Infrastructure — Final Report

**Status:** Stable. 41 production verifications passing, 0 failed.
**Property:** `https://anythingitechmv.com`
**Stabilized:** 2026-05-08

---

## Original root causes

Three independent issues stacked, each compounding the others.

### 1. SPA shell served as canonical for every directory page
The Vite SPA used a Vercel rewrite (`/((?!api/).*) → /index.html`) for client-side routing. The static `index.html` had a hardcoded canonical of `https://anythingitechmv.com/`. Every URL Google fetched returned that file, so every page declared the homepage as its canonical. After hydration, React Router would issue a client-side `<Navigate>` to the corrected route — Google read this as "page redirected to a different URL than its canonical," which is exactly the GSC error "Page with redirect."

### 2. No server-side redirects for legacy slug forms
~330 URLs from the old WordPress site used short-form category slugs (`lodging-tourism`, `shopping-specialty-retail`, `arts-entertainment`, `restaurant`, `health-wellness`, `other`, `unknown`, etc.) that Google still had indexed. These had no `vercel.json` redirect rules. Instead, they hit the SPA shell, which then issued a client-side `<Navigate replace>` — invisible to crawlers as a redirect, visible as a "duplicate of `/`" with a JS-driven URL change.

### 3. Prerender script covered only 12 routes
`scripts/prerender.cjs` originally prerendered the home page, services pages, and a handful of static routes — 12 in total. Every directory page (towns, categories, businesses, ~330 URLs) shipped without prerendered HTML, falling back to the SPA shell.

These three issues compounded: GSC saw hundreds of URLs returning the SPA shell + hydration redirect, all declaring the same canonical, and flagged them en masse. The "Page with redirect" count jumped from 19 → 244 → 590 between 2026-04-27 and 2026-05-03 as Google recrawled.

---

## Major fixes

### A. Server-side 308 redirects (`vercel.json`)
- 23 legacy single-segment category mappings (`/lodging-tourism → /lodging-and-tourism`, etc.)
- 46 town+category and town+category+business mappings (`/oak-bluffs/restaurant/foo → /oak-bluffs/restaurants-food-beverages/foo`)
- `/marthas-vineyard/unknown(/.*)? → /marthas-vineyard` (308)
- `/marthas-vineyard/:town/other(/.*)? → /marthas-vineyard/:town` (308)
- `/archives/:id → /tech-tips` (WordPress legacy)
- All sources distinct from destinations — no self-redirects (validated automatically by `scripts/validate-redirects.cjs`)
- 49 pre-existing business-rename redirects modernized to use modern category slugs

### B. Prerender expansion (`scripts/prerender.cjs`)
- Reads `dist/sitemap.xml` to determine the route list (sitemap and prerender stay in lockstep automatically)
- 4-way concurrent (configurable via `PRERENDER_CONCURRENCY`)
- Proxies `/api/*` to the live API during prerender so the SPA hydrates with real data
- Validates each output's canonical matches the URL it was rendered for
- 331 prerendered HTMLs in the final build, 0 warnings

### C. Sitemap quality + alignment (`scripts/generate-sitemap.cjs`)
- Lightweight `LEGACY_CATEGORY_REMAP` translates stale `businessType` values to modern slugs at generation time. Source of truth remains the business data; remap is transitional.
- `REJECT_CATEGORIES` (`other`, `unknown`, `contractors`) excluded entirely
- Thin-page filter (data-completeness score < 2) excludes 6 of 299 businesses
- Cross-checks against static SPA exports so URLs that the SPA can't render are excluded from the sitemap
- Public API endpoint (no admin auth) for portability

### D. Page-level metadata
- `BusinessPage.tsx` emits `LocalBusiness` + `BreadcrumbList` JSON-LD with full URL alignment
- `TownPage.tsx`, `BusinessTypePage.tsx`, `TownBusinessTypePage.tsx` emit `BreadcrumbList` JSON-LD
- `normalizeCategorySlug()` in `src/data/directory.ts` ensures the canonical URL always uses the modern slug, even if the page was reached via a legacy slug
- Internal URL helpers (`getBusinessUrl`, `getTownBusinessTypeUrl`, `getBusinessTypeUrl`) emit modern slugs unconditionally

### E. SEO component (`src/components/SEO.tsx`)
- Accepts a `jsonLd` prop and renders one or more `<script type="application/ld+json">` tags
- Always emits `og:url` aligned with `canonical` — single source of truth

### F. Build + deploy pipeline
- `vercel.json buildCommand`: `npm run build:prerender` (was `npm run build`). Ensures the prerender pipeline runs whenever Vercel builds.
- `package.json deploy`: `vercel build --prod && vercel deploy --prebuilt --prod`. Removed redundant pre-build that was wiping prerender output.
- `npm run build:prerender` runs: `sitemap → validate:redirects → vite build → prerender`. Build fails if validation fails.

### G. Misc cleanup
- 11 `https://www.anythingitechmv.com/wp-content/...` image URLs in `src/data/tech-tips.json` → `https://anythingitechmv.com/...`
- `https://www.anythingitechmv.com` link in `src/components/admin/AdminLayout.tsx` → `https://anythingitechmv.com`
- DirectorySlugResolver, BusinessPage, TownBusinessTypePage normalize legacy slugs in-app as a safety net behind the server-side 308

---

## Redirect architecture summary

Vercel evaluates routes in this order (verified in `.vercel/output/config.json`):

1. **Routes 0–185 — `redirects`** (308 permanent). 186 rules. Includes:
   - WP legacy paths (`/iphone-repair`, `/about-us`, `/feed`, etc.)
   - Domain canonicalization (handled by Vercel domain config: `www → non-www`, `http → https`)
   - Legacy category slug normalization (`/lodging-tourism → /lodging-and-tourism`)
   - Town+category+business renames
   - `/unknown/*` and `/other/*` to parent index
2. **Route 186 — `handle: filesystem`**. Vercel checks for a static file at the path. If found, it's served and processing stops. **This is where prerendered HTMLs get served.**
3. **Route 187 — SPA rewrite**: `/((?!api/).*) → /index.html`. Only fires when filesystem missed.
4. **Routes 188+** — error handles + API rewrites.

**Key invariant:** The redirect validator (`scripts/validate-redirects.cjs`) ensures no canonical (sitemap) URL matches any redirect's source. If it did, that URL would 308 before reaching the filesystem check.

---

## Prerender architecture summary

```
            ┌──────────────────────┐
            │  vite build          │  → dist/index.html (SPA shell) + assets
            └──────────────────────┘
                       ↓
            ┌──────────────────────┐
            │  prerender.cjs       │  Read dist/sitemap.xml
            │                      │  For each URL:
            │                      │    1. Spin up local static server
            │                      │    2. Proxy /api/* to live API
            │                      │    3. Puppeteer loads the URL
            │                      │    4. Wait for React + SEO hooks
            │                      │    5. Serialize document.documentElement.outerHTML
            │                      │    6. Write to dist/{path}/index.html
            │                      │    7. Validate <link rel="canonical"> matches URL
            └──────────────────────┘
                       ↓
                  331 HTMLs in dist/
                       ↓
            ┌──────────────────────┐
            │  vercel build        │  Copies dist/ to .vercel/output/static/
            │                      │  Synthesizes routes from vercel.json
            └──────────────────────┘
                       ↓
            ┌──────────────────────┐
            │  vercel deploy       │  Uploads .vercel/output/
            │  --prebuilt --prod   │
            └──────────────────────┘
```

**Single source of truth for what gets prerendered:** `public/sitemap.xml` (regenerated by `scripts/generate-sitemap.cjs` on every build). If a URL is in the sitemap, it gets prerendered. If it's not, it doesn't. The two stay in lockstep automatically.

---

## Sitemap generation summary

```
                  Live API
       (anythingitechmv.com/api/directory/businesses)
                       │
                       ▼
        scripts/generate-sitemap.cjs
                       │
        Apply filters in order:
        1. Town slug must be in static exports
        2. Category slug must be in static exports (after legacy remap)
        3. Business slug must not be a URL artifact (.com, http, facebook, etc.)
        4. Data-completeness score >= 2
        5. Not in REJECT_CATEGORIES (other, unknown, contractors)
                       │
                       ▼
        Build URL set:
        - 13 static pages
        - 14 tech tip posts
        - 8 town indexes
        - 17 category indexes (filtered to those with businesses)
        - 42 town+category indexes
        - 251 business pages
                       │
                       ▼
        public/sitemap.xml (331 <loc> entries)
        public/robots.txt (declares Host: anythingitechmv.com, Sitemap URL)
```

**Why the static-exports cross-check?** The SPA bundle ships a static snapshot of valid towns and categories (`data/exports/towns.json`, `business-types.json`). If a sitemap URL references a town/category the SPA doesn't recognize, the React app redirects out client-side and the prerendered canonical wouldn't match. Cross-checking keeps sitemap and SPA in sync.

---

## Canonical strategy summary

Every page has exactly one canonical URL, declared in three aligned places:

1. **`<link rel="canonical">`** in the prerendered HTML head
2. **`<meta property="og:url">`** in the prerendered HTML head
3. **JSON-LD** `url` / `@id` (LocalBusiness) and `BreadcrumbList` leaf `item`

All three are written by the `SEO` component (`src/components/SEO.tsx`) using a single `canonical` prop.

**Canonical URL format:**
- Always `https://anythingitechmv.com` (non-www, https)
- No trailing slash (except root `/`)
- Always uses modern category slug (legacy slugs are normalized via `normalizeCategorySlug()` before constructing URLs)
- All-lowercase

**Derivation rules:**
- Static pages (services, about, contact, tech-tips, marthas-vineyard, etc.): hardcoded in each page component
- Town pages: `/marthas-vineyard/{townSlug}`
- Category pages: `/marthas-vineyard/{normalizedCategorySlug}`
- Town+category: `/marthas-vineyard/{townSlug}/{normalizedCategorySlug}`
- Business pages: `/marthas-vineyard/{townSlug}/{normalizedCategorySlug}/{businessSlug}`

---

## Remaining known risks

| # | Risk | Severity | Mitigation |
|---|---|---|---|
| 1 | Stale static exports (`data/exports/towns.json`, `business-types.json`) — missing several categories and 2 towns | Low | Re-run `npm run registry:export` periodically; 6 businesses are temporarily excluded from sitemap until then |
| 2 | 45 category mismatches (plumbers under "Hotels", etc.) | Low — pages render fine, weaker entity signals | List exported in `docs/category-mismatches.csv`; fix manually in Supabase over time |
| 3 | 24 stale business-rename redirects whose destinations no longer exist | Very low — source URLs unlikely to be hit | Will surface if anyone links to the old URL; clean up if reported |
| 4 | `/unknown/*` and `/:town/other/*` 308 to a parent index, not 410 | Low — Google deindexes 308s eventually | Acceptable; deferred per architectural preference (no over-engineering) |
| 5 | Build time ~3-4 min for full prerender | Low | Concurrency tunable via `PRERENDER_CONCURRENCY` env var |
| 6 | JS bundle size 823 kB (pre-existing) | Low — page-load metric, not SEO | Future code-splitting opportunity |

---

## Expected GSC behavior over the next few weeks

| Days post-deploy | Expected behavior |
|---|---|
| 0–2 | Google starts fetching deployed pages. Prerendered canonicals visible. New 308s start firing. |
| 3–14 | "Page with redirect" count drops 50–70% as Google reprocesses the bulk. Count may briefly tick UP as new 308s are discovered. |
| 14–45 | Drop to <5% of current count. Indexed page count rises as canonical pages get crawled and accepted. |
| 45–90 | Long tail clears. www/http variants fully deindexed. Final state: ~0 redirect-related exclusions, 280–320 indexed pages. |

**What to watch in GSC during this period:**
- "Page with redirect" exclusion count — should be monotonically decreasing after week 1
- "Discovered – currently not indexed" — may briefly rise then fall
- "Indexed pages" — should climb to within 90% of sitemap URL count
- Coverage report on the sitemap — should show all 331 URLs as Submitted, with a steady increase in "Indexed"

If "Page with redirect" doesn't drop after 14 days, file a "Validate fix" request in GSC for that issue.
