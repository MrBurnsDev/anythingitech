# SEO Maintenance Guide

For day-to-day work on the directory, redirects, and SEO output. Read this before touching `vercel.json`, `scripts/generate-sitemap.cjs`, `scripts/prerender.cjs`, or page-level SEO.

---

## How prerendering works

The site is a Vite SPA. To make Google see real per-page metadata (canonical, title, JSON-LD) without executing JS, every URL in `sitemap.xml` is prerendered to a static HTML file at build time.

```
public/sitemap.xml ──► scripts/prerender.cjs
                            │
                            └─► For each URL, Puppeteer:
                                  1. loads the URL on a local static server
                                  2. proxies /api/* requests to live API
                                  3. waits for React + SEO hooks to finish
                                  4. writes dist/{path}/index.html
                                  5. validates canonical matches URL
```

**Key invariant:** the sitemap is the source of truth. If a URL isn't in `sitemap.xml`, it isn't prerendered. If a URL is in `sitemap.xml`, it must prerender successfully or the build fails.

**To regenerate prerender locally:**
```bash
npm run build:prerender
```
This runs sitemap → validate:redirects → vite build → prerender. Output lands in `dist/`.

**To run only the prerender step (dist must already exist):**
```bash
npm run prerender
```

**Concurrency:** default 4 workers. Tune with `PRERENDER_CONCURRENCY=8 npm run prerender` for faster local builds (Vercel build env handles 4 fine).

---

## How sitemap generation works

`scripts/generate-sitemap.cjs` fetches the live business list from `https://anythingitechmv.com/api/directory/businesses` and applies these filters:

1. **Town slug** must be in `data/exports/towns.json` (the SPA's static town list)
2. **Category slug** must resolve to a valid modern slug via `LEGACY_CATEGORY_REMAP` (e.g. `lodging` → `lodging-and-tourism`)
3. **Category slug** must be in `data/exports/business-types.json`
4. Business slug must not be a URL artifact (matches `INVALID_SLUG_PATTERNS`: `.com`, `http`, `facebook`, `menu-`, etc.)
5. Data-completeness score (`scoreBusiness()`) must be ≥ 2
6. Category must not be in `REJECT_CATEGORIES` (`other`, `unknown`, `contractors`)

**Output:** `public/sitemap.xml` and `public/robots.txt`.

**To regenerate the sitemap:**
```bash
npm run sitemap
```

**To override the API base** (useful if testing against staging):
```bash
SITEMAP_API_BASE=https://staging.example.com npm run sitemap
```

---

## How redirects are validated

`scripts/validate-redirects.cjs` runs as part of `build:prerender`. It fails the build if any redirect:
- has `source === destination` (literal self-redirect)
- has a source pattern that matches a sitemap URL (would redirect a canonical page anywhere)

The validator simulates Vercel's path-to-regexp matching. It catches collisions that pure source-string inspection would miss (e.g. a `:town/restaurants-food-beverages/:business` rule matching every modern business URL).

**To run the validator manually:**
```bash
npm run validate:redirects
```

---

## How to safely add a new category

If a new top-level category is needed in the directory:

1. Add the slug + name to `scripts/generate-sitemap.cjs`'s `VALID_CATEGORY_SLUGS` and `CATEGORIES`
2. Add the slug + name + icon to `data/exports/business-types.json` (or regenerate via `npm run registry:export`)
3. Confirm the category renders in the SPA: `npm run dev` and visit `/marthas-vineyard/{new-slug}`
4. Run `npm run sitemap` and verify the new category index appears
5. Run `npm run build:prerender` and verify the new prerendered HTML has correct canonical
6. **Don't** add a redirect from the new slug to itself — that's a self-redirect

---

## How to safely add a redirect rule

When adding a new entry to the `redirects` array in `vercel.json`:

1. **The source must NOT match any sitemap URL.** If the source uses `:param`, mentally substitute realistic values — would that match a canonical URL?
2. **The destination must be in the sitemap** (or be one of the static pages: `/`, `/about`, `/contact`, `/tech-tips`, `/services/...`). Run `npm run validate:redirects` to confirm.
3. **Source ≠ destination.** Always.
4. Add a parameterized rule rather than enumerating each business if you can. For trailing-slash variants, add an explicit `/source/` entry — Vercel doesn't auto-collapse.
5. **Order matters.** Vercel evaluates redirects top-to-bottom. Specific rules first, parameterized catch-alls later.
6. After adding: `npm run validate:redirects` then `npm run build:prerender`.

---

## How to avoid future self-redirects

Three rules:

1. **Never write `source === destination`.** The validator catches this, but you should catch yourself first.
2. **Never run a search-and-replace over `vercel.json` that touches both `source` and `destination` lines.** If you need to migrate a slug, plan the change so legacy slugs survive on the source side. (This is what caused the original 21 self-redirect bug — a regex modernized destinations AND sources of the same rules.)
3. **Always run `npm run validate:redirects` before deploy.** It's wired into `build:prerender`, but if you're modifying redirects without rebuilding the sitemap, run it standalone.

---

## How to verify production after deploy

```bash
bash docs/post-deploy-verify.sh
```

Tests 41 production endpoints:
- Domain canonicalization (www → non-www, http → https, single-hop)
- Legacy category 308s (`/lodging-tourism → /lodging-and-tourism`, etc.)
- WP legacy paths (`/iphone-repair`, `/about-us`, `/feed`, `/archives/:id`)
- Canonical URLs return 200 (not redirected)
- Self-redirect guard (Location ≠ requested path)
- Canonical tags present in static HTML
- Sitemap + robots.txt accessible and well-formed

Exit code 0 = all pass. Exit code 1 = at least one failure (with details).

---

## Required deployment workflow

```bash
# 1. Make changes
# 2. Verify locally
npm run build:prerender   # build fails if anything is wrong

# 3. Spot-check a few prerendered files in dist/
ls dist/marthas-vineyard/edgartown/lodging-and-tourism/harbor-view-hotel-edgartown/index.html

# 4. Deploy
npm run deploy            # = vercel build --prod && vercel deploy --prebuilt --prod

# 5. Verify production
bash docs/post-deploy-verify.sh
```

**Do not:**
- Run `vercel deploy` without `--prebuilt` (Vercel will rebuild remotely with whatever buildCommand is set; that should work via vercel.json now, but `--prebuilt` deploys exactly what we built locally and verified)
- Run `vite build` directly and try to deploy from raw `dist/` — you'll skip prerender, sitemap, and validation
- Push partial fixes to vercel.json without running `npm run validate:redirects`

---

## How to regenerate sitemap/prerender locally

| Goal | Command |
|---|---|
| Generate sitemap.xml + robots.txt | `npm run sitemap` |
| Validate redirects against sitemap | `npm run validate:redirects` |
| Build SPA without prerender (fast, dev) | `npm run build` |
| Full production build with prerender | `npm run build:prerender` |
| Run only prerender (sitemap + dist must exist) | `npm run prerender` |
| Build for Vercel + deploy to prod | `npm run deploy` |
| Local Vercel build (test deploy artifact without uploading) | `npx vercel build --prod` |

---

## Common failure modes

### Build: "vercel.json redirect validation FAILED"
A redirect's source matches a sitemap URL (or source === destination). Read the error message, find the rule, fix it. Don't bypass.

### Build: prerender warnings ("canonical mismatch")
The prerendered URL's canonical doesn't match the URL it was rendered for. Common causes:
- The SPA route is redirecting client-side (e.g., town not recognized → React routes to `/marthas-vineyard`)
- The `getTownBySlug` / `getBusinessTypeBySlug` static data is missing the slug
Check `data/exports/towns.json` and `business-types.json` for the missing slug.

### Build: "API proxy 502"
The prerender's static server proxies `/api/*` to production. If the live API is down or rate-limiting, the prerender hydrates with empty data and produces wrong canonicals. Wait and retry, or set `PRERENDER_API_BASE` to a working host.

### Build: "No Chromium executable found"
The prerender uses `puppeteer-core` and resolves the browser via `resolveBrowserLaunchOptions()` in `scripts/prerender.cjs`:
- **On Vercel/Linux** — uses `@sparticuz/chromium`'s bundled binary (~66 MB devDep).
- **On macOS** — uses the system Google Chrome at `/Applications/Google Chrome.app/...`.
- **Override** with `PUPPETEER_EXECUTABLE_PATH=/path/to/chrome npm run prerender`.

If the build fails with "No Chromium executable found":
- On macOS: install Google Chrome.
- On Linux without `@sparticuz/chromium`: `npm install --save-dev @sparticuz/chromium`.
- Anywhere: set `PUPPETEER_EXECUTABLE_PATH` to a valid Chrome/Chromium binary.

### Production: 308 self-redirect on a canonical URL
The deployed `vercel.json` has a self-redirect. Check `npm run validate:redirects` locally — if it passes, the broken redirects are NOT in the file you're about to deploy, but ARE in production from a previous broken deploy. Run `npm run deploy` to overwrite.

### Production: 200 but generic SPA shell HTML
The deployed dist doesn't include prerendered HTML. Causes:
- `vercel.json buildCommand` is `npm run build` instead of `npm run build:prerender`
- `npm run deploy` ran an extra `vercel build` after the prerender that wiped the output
Check `vercel.json buildCommand` and the `deploy` script in `package.json`.

### GSC still shows "Page with redirect"
Allow 14 days for Google to recrawl. After that, file "Validate fix" in GSC for the affected issue.

---

## Operational tips

- **Don't commit `dist/` or `.vercel/output/`** — both are build artifacts (`.gitignore` should already cover them).
- **Don't edit `public/sitemap.xml` or `public/robots.txt` by hand** — they're regenerated by `scripts/generate-sitemap.cjs`.
- **Don't add SEO tags to `index.html` directly** — use the `<SEO>` component in the page; `index.html` is the SPA shell template.
- **Run `npm run build:prerender` before opening any PR** that touches redirects, sitemap generation, or the SEO component.
