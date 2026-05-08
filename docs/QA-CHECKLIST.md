# Production QA Checklist

Run before announcing a deploy or after any significant change to redirects, sitemap, prerender, or page metadata.

---

## Pre-deploy (local)

```bash
cd path/to/anythingitech

# Run the full pipeline. Build fails on any redirect violation or prerender error.
npm run build:prerender
```

- [ ] **Build succeeds** with `331 ok, 0 warnings, 0 failed` (or current expected count) from prerender.
- [ ] **Sitemap report** shows expected URL count (~331). No `unknown` rejections beyond what's expected.
- [ ] **Redirect validator** prints `✅ vercel.json redirects clean: NNN rules, no canonical collisions`.
- [ ] Spot-check 3 prerendered files exist with correct canonicals:
  ```bash
  for f in \
    dist/marthas-vineyard/edgartown/lodging-and-tourism/harbor-view-hotel-edgartown/index.html \
    dist/marthas-vineyard/oak-bluffs/restaurants-food-beverages/offshore-ale-company-oak-bluffs/index.html \
    dist/marthas-vineyard/lodging-and-tourism/index.html; do
    echo "$f"
    grep -oE 'rel="canonical"[^>]+href="[^"]+"' "$f" | head -1
  done
  ```

## Deploy

```bash
npm run deploy
```

- [ ] `vercel build --prod` reports `Build completed successfully` with `target: production`.
- [ ] `vercel deploy --prebuilt --prod` returns a deployment URL.

## Post-deploy (production)

```bash
bash docs/post-deploy-verify.sh
```

Expected: `41 passed, 0 failed`. The script tests:

### Canonical verification
- [ ] Home, directory home, town indexes return 200 with correct canonical
- [ ] Category indexes (all 17) return 200 — none 308-self
- [ ] Town+category permutations return 200
- [ ] Sample business pages return 200 with correct canonical
- [ ] Prerendered HTML head contains canonical, og:url, title, description (not the SPA shell)

### Redirect verification
- [ ] Domain canonicalization: `www → non-www`, `http → https`, single-hop 308
- [ ] Legacy category 308s: `/lodging-tourism → /lodging-and-tourism` (and 22 other categories)
- [ ] Town+category and town+category+business legacy 308s
- [ ] `/unknown/*` and `/:town/other/*` 308 to parent
- [ ] WP legacy paths 308 to canonical (`/iphone-repair`, `/about-us`, `/feed`, `/archives/:id`)
- [ ] **Self-redirect guard:** Location header never equals requested path

### Sitemap verification
- [ ] `https://anythingitechmv.com/sitemap.xml` returns 200 with ~331 `<loc>` entries
- [ ] `https://anythingitechmv.com/robots.txt` returns 200
- [ ] robots.txt declares `Host: anythingitechmv.com` (non-www)
- [ ] robots.txt Sitemap URL = `https://anythingitechmv.com/sitemap.xml`

### Prerender verification (manual spot-check)
- [ ] `curl -s https://anythingitechmv.com/marthas-vineyard/edgartown/lodging-and-tourism/harbor-view-hotel-edgartown` returns ~60 KB of HTML containing the business name in `<title>`, the LocalBusiness JSON-LD, and the correct canonical
- [ ] `curl -sI ...` returns 200 with `x-vercel-cache: HIT` (after first request)

### Google Search Console
After deploying, do these in GSC for the property:

- [ ] **Re-submit sitemap.** GSC → Sitemaps → confirm `sitemap.xml` is submitted and shows the expected URL count.
- [ ] **Validate fix on "Page with redirect."** GSC → Pages → "Page with redirect" → click "Validate fix." Google starts re-checking the affected URLs.
- [ ] **URL inspection on a sample.** Test `https://anythingitechmv.com/marthas-vineyard/edgartown/lodging-and-tourism/harbor-view-hotel-edgartown` via "Inspect any URL." Should show:
  - Coverage: URL is on Google (after recrawl) or Discovered (during recrawl)
  - User-declared canonical: matches Google-selected canonical
  - HTML render: includes the business H1, LocalBusiness JSON-LD
- [ ] **Mobile usability** report should be clean (no new errors).
- [ ] **Core Web Vitals** unchanged or improved (build hasn't impacted bundle size).

### Follow-up checks (3, 7, 14, 30 days post-deploy)

- [ ] **Day 3:** GSC "Page with redirect" count starts dropping, or stays flat (Google recrawls in batches; first signal usually appears within 72h).
- [ ] **Day 7:** Indexed page count begins climbing toward sitemap count.
- [ ] **Day 14:** "Page with redirect" exclusion count down 50%+. If not, file another "Validate fix" request.
- [ ] **Day 30:** Long tail clearing. Check Coverage report — most sitemap URLs should be Indexed or Discovered.

---

## If any check fails

| Failure | Likely cause | Fix |
|---|---|---|
| `validate:redirects` exits non-zero | Self-redirect or canonical collision in vercel.json | Read the error, find the rule, fix or remove it |
| Prerender warning "canonical mismatch" | SPA route is redirecting client-side (town/category not in static exports) | Update `data/exports/towns.json` or `business-types.json` |
| Prerender error "API proxy 502" | Live API down or rate-limiting | Wait, retry, or set `PRERENDER_API_BASE` |
| Production 308 self-redirect | Old vercel.json still on production | Run `npm run deploy` to overwrite |
| Production serves SPA shell (no prerender HTML) | `buildCommand` reverted or `dist/` was wiped between prerender and deploy | Verify `vercel.json buildCommand` = `npm run build:prerender`; verify `package.json deploy` = `vercel build --prod && vercel deploy --prebuilt --prod` |
| GSC count not dropping after 14 days | Validate fix not requested, or new issue introduced | File "Validate fix"; check post-deploy-verify.sh again |
