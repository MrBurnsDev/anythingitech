# SEO Documentation

Operational docs for the SEO/deploy/prerender infrastructure.

## Read this first
- **[SEO-INFRASTRUCTURE.md](./SEO-INFRASTRUCTURE.md)** — Final report. Root causes, architecture, expected GSC behavior. Read for context.
- **[MAINTENANCE.md](./MAINTENANCE.md)** — Day-to-day operations. How prerender/sitemap/redirects work; how to add categories or redirects safely; common failure modes.
- **[QA-CHECKLIST.md](./QA-CHECKLIST.md)** — Run before and after every deploy.

## Reference
- **[SEO-BACKLOG.md](./SEO-BACKLOG.md)** — Prioritized non-critical improvements.
- **[../vercel.json.NOTES.md](../vercel.json.NOTES.md)** — Architectural commentary on `vercel.json` (since JSON has no comments).
- **[seo-redirect-audit-2026-05-08.md](./seo-redirect-audit-2026-05-08.md)** — Original audit report from the GSC incident response.

## Operational data
- **[category-mismatches.csv](./category-mismatches.csv)** — 45 businesses with category mismatches; for manual cleanup.
- **[snapshots/](./snapshots/)** — Reference HTML snapshots from a known-good prerender output.

## Tools
- **[post-deploy-verify.sh](./post-deploy-verify.sh)** — Production smoke test. Run after every deploy: `bash docs/post-deploy-verify.sh`.

## Quick reference
| Goal | Command |
|---|---|
| Generate sitemap | `npm run sitemap` |
| Validate redirects | `npm run validate:redirects` |
| Build with prerender | `npm run build:prerender` |
| Deploy to production | `npm run deploy` |
| Verify production | `bash docs/post-deploy-verify.sh` |
