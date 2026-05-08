# vercel.json — architectural notes

JSON doesn't allow comments, so the rationale for the structure of `vercel.json` lives here. Read this before editing the file.

---

## Top-level fields

### `framework: "vite"`
Tells Vercel to use the Vite build defaults. Without it, Vercel auto-detects (and currently mis-detects this project as Next.js — see `.vercel/project.json`). Don't remove.

### `buildCommand: "npm run build:prerender"`
**Critical.** Must NOT be `npm run build` (that's just `vite build`, which produces only the SPA shell — no prerendered HTML). The full pipeline is:
```
sitemap → validate:redirects → vite build → prerender
```
If this is changed back to `npm run build`, every directory page on production reverts to serving the SPA shell, the canonical leak returns, and GSC's "Page with redirect" spike comes back.

### `outputDirectory: "dist"`
Where Vite writes its build output. Vercel copies this directory verbatim into `.vercel/output/static/` on `vercel build`.

---

## `redirects` ordering

Vercel evaluates `redirects` top-to-bottom; first match wins. Order matters.

The current ordering (roughly):
1. **WP-era exact paths** (`/iphone-repair → /services/apple-repair`, etc.) — high specificity, no params
2. **Tech-tip slug-only paths** (`/why-i-built-... → /tech-tips/why-i-built-...`)
3. **Specific business-rename redirects** (`/edgartown/restaurants-food-beverages/atria-restaurant-edgartown → ...atria-edgartown`) — must come BEFORE the parameterized category-normalization rules below, otherwise the catch-all would fire first and the rename target wouldn't exist
4. **Bare-category legacy slug normalizations** (`/marthas-vineyard/lodging-tourism → /marthas-vineyard/lodging-and-tourism`)
5. **Town+category and town+category+business legacy normalizations** (`/marthas-vineyard/:town/lodging-tourism/:business → /marthas-vineyard/:town/lodging-and-tourism/:business`)
6. **Bucket cleanup** (`/marthas-vineyard/unknown(/.*)? → /marthas-vineyard`, `/marthas-vineyard/:town/other(/.*)? → /marthas-vineyard/:town`)
7. **WordPress archive paths** (`/archives/:id → /tech-tips`)

When adding a new entry, place it in the correct ordering bucket. A specific rule placed below a parameterized one will be unreachable.

---

## Self-redirect prevention

**A redirect rule's source must NEVER match a URL in `public/sitemap.xml` after parameter substitution.**

This rule is enforced by `scripts/validate-redirects.cjs`, which runs as part of `npm run build:prerender` (and therefore as part of every `vercel build`). The build fails if any sitemap URL would match any redirect's source.

**Why this matters:** if a redirect's source matches a canonical URL, that canonical URL 308s before reaching the filesystem check. If destination resolves to the same URL, it's a self-redirect (loop in production headers). If destination resolves elsewhere, the canonical page becomes uncrawlable.

**Origin of the historical bug:** an earlier modernization regex rewrote both source AND destination of certain rules from legacy slugs to modern slugs. For 21 entries, source ended up identical to destination — pure self-redirects. Production exhibited HTTP 308 with `Location` matching the requested URL exactly. The validator now prevents recurrence.

---

## `rewrites` semantics

```json
"rewrites": [{ "source": "/((?!api/).*)", "destination": "/index.html" }]
```

This is the SPA fallback. It rewrites any non-`/api/` path to the SPA shell `/index.html`.

**Critical:** in Vercel's build output, this rewrite is emitted **after** the `handle: filesystem` marker. That means:

```
[ redirects ]   → fire first; if matched, 308 to destination, STOP
handle: filesystem → check if dist/{path}/index.html exists; if yes, serve and STOP
[ rewrite ]    → only fires when filesystem missed
```

So a prerendered `dist/marthas-vineyard/edgartown/lodging-and-tourism/harbor-view-hotel-edgartown/index.html` gets served as itself; the SPA rewrite only fires for paths without prerendered output (which shouldn't exist if sitemap and prerender are aligned).

**Don't change the rewrite source.** Adding broader exclusions (`(?!api/|assets/)`) is fine if assets ever start being mis-served, but the current `(?!api/)` is correct given Vercel's filesystem-first behavior.

**Don't add another rewrite that catches `/marthas-vineyard/*` specifically.** It would override the filesystem-first behavior and break prerender serving.

---

## Domain canonicalization

WWW → non-WWW and HTTP → HTTPS are NOT in this file. They're handled at the Vercel project domain config level (one-time setup). To verify:

```bash
curl -sI https://www.anythingitechmv.com/  # 308 → https://anythingitechmv.com/
curl -sI http://anythingitechmv.com/        # 308 → https://anythingitechmv.com/
```

Don't add WWW redirects to `vercel.json` — they'd duplicate Vercel's domain-level handling and could cause double-redirect chains.
