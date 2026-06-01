# SEO: Next Highest-Impact Wins

After directory verification (Chamber, Gazette, GoMV, BlackOwnedMV) and the
new business-detail badges, JSON-LD `sameAs`, and `/businesses/*` filter
landing pages, here are the next moves ranked by expected impact vs. effort.

Generated 2026-06-01.

---

## P1 — Eliminate templated descriptions (biggest unlock)

**Current state.** 36 of 304 published businesses still ship with templated
short_descriptions like *"X is a restaurant in Y, known for quality cuisine
and welcoming locals and visitors year-round."* That same template is reused
across many businesses (some of which aren't even restaurants — see the
prior audit). Google's helpful-content systems treat that as low-value
auto-generated content and demote the whole directory section.

**Why this is the #1 lever.** Templated descriptions are the single most
likely reason only 41/331 directory pages are indexed today — the trust
penalty applies to neighbors, not just the offending pages.

**Action.**
1. Run `npm run scrape:meta:apply` to pull authored meta descriptions from
   each business's own website. The scraper exists at
   `scripts/scrape-meta-descriptions.cjs` but has never been applied
   (current `meta-scrape-report.json` is `"apply": false`).
2. For the businesses whose websites don't expose a meta description
   (~35 of 50 sampled), null out the templated `short_description` so the
   page renders contact info without misleading copy. Google prefers an
   information-dense page with no description over one with misleading
   description.
3. Re-run `npm run registry:export && npm run sitemap` and deploy.

**Effort.** 30 minutes of operator time + 10 minutes of scraping.
**Expected effect.** Indexed page count should grow over 2–4 weeks as
Google re-crawls.

---

## P2 — Use directory listing data to enrich missing fields

**Current state.** Many businesses have town/website/phone gaps. The Chamber,
Gazette, and GoMV crawls already collect those fields per business but only
use them for matching, not enrichment.

**Action.** Extend the cross-reference pipeline so that when a Tier-1 (domain)
match is found and our DB has a `null` field that the source has, we backfill
from the source. Conservative rules:
- Only backfill `phone`, `address`, `hours`, `website` when ours is null.
- Never overwrite a non-null field.
- Always record provenance in a `field_sources` column or audit log so we
  can revert later if the source is wrong.

**Effort.** ~2 hours.
**Expected effect.** ~20–40 more pages move from "thin" to "publishable" in
the sitemap (`THIN_PAGE_MIN_SCORE`).

---

## P3 — Server-side render directory pages, not just prerender

**Current state.** Pages prerender via Puppeteer at build time (good for
static businesses), but the directory and filter pages load JS to populate
their lists. Googlebot does render JS but with delay and risk.

**Action.** The simplest version: include the businesses listed on each
prerendered page in a `<script type="application/json" id="ld-businesses">`
data island that the JSON-LD `ItemList` and the visible cards can both
read from synchronously. This costs ~5KB per page and makes the content
indexable instantly, regardless of JS execution.

**Effort.** ~2 hours.
**Expected effect.** Filter-pages (`/businesses/verified` etc.) become
SEO-ready without depending on JS rendering. Same fix benefits town and
category pages.

---

## P4 — Add `BreadcrumbList` JSON-LD to listing pages

**Current state.** BusinessPage emits a `BreadcrumbList`. TownPage,
BusinessTypePage, TownBusinessTypePage, and the new filter pages don't.

**Action.** Add a small `breadcrumbsJsonLd()` helper in `src/lib/seo.ts` and
call it from those pages. Each is a single SEO prop change.

**Effort.** 30 minutes.
**Expected effect.** Breadcrumb-rich SERP listings on category/town pages.

---

## P5 — Internal linking from BusinessPage to filter pages

**Current state.** The new `<DirectoryListings>` component on each
BusinessPage links *out* to Chamber/Gazette/etc. We should also link *in*
to the corresponding `/businesses/<filter>` page, so PageRank flows through.

**Action.** Each `<li>` in DirectoryListings gets a second small link
(or the existing link becomes a pair) to `/businesses/chamber-listed` etc.

**Effort.** 15 minutes.
**Expected effect.** Faster discovery + indexing of the new filter pages;
small ranking lift for each.

---

## P6 — Fix the 18 town-mismatched slugs

**Current state.** 18 business slugs reference the wrong town (e.g. a
business filed under Edgartown but with `-vineyard-haven` in the slug).
Google sees the inconsistency as a quality signal.

**Action.** Write a one-off migration script that regenerates the slug
from name+town for these specific records, plus a `vercel.json` 301 from
old to new so existing backlinks survive.

**Effort.** ~1 hour.
**Expected effect.** Removes a small but visible quality flag.

---

## P7 — Add an HTML sitemap page

**Current state.** Only `sitemap.xml`. Humans never see it, and crawlers
prefer internal links anyway.

**Action.** Add `/sitemap` as an HTML page that links to every town,
category, town+category combo, business, tech tip, and filter page. Keep
it visually minimal — it's a discovery aid, not a feature.

**Effort.** ~1 hour.
**Expected effect.** Modest, but it's a useful internal-linking artifact.

---

## P8 — `<meta name="robots">` per-page review

**Current state.** All directory pages declare `index, follow, noemailindex`.
Some review/admin pages may be inadvertently indexable.

**Action.** Audit each route in `src/App.tsx` and confirm robots meta is
appropriate. Likely small: 1–2 fixes.

**Effort.** 30 minutes.
**Expected effect.** Avoid wasted crawl budget on admin/internal pages.

---

## Skipped: things NOT worth doing right now

- **Pagination on directory listing pages.** 304 businesses, no perf issue.
  Adding pagination would split signal across N pages and hurt SEO.
- **More schema.org types.** LocalBusiness + BreadcrumbList + CollectionPage
  cover everything Google currently uses. Adding `Service`, `Offer`,
  `AggregateRating` without real data behind them is cargo-culting.
- **AMP.** Dead format.
- **More language variants.** Single-locale audience.

---

## How to track progress

After applying any of these, watch GSC Pages → Indexed count for the sitemap
view. Re-index latency is ~1–4 weeks on this domain. The single most
sensitive metric for content-quality fixes is **"Crawled - currently not
indexed"** dropping.
