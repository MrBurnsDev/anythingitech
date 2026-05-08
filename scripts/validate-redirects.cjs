#!/usr/bin/env node
/**
 * Validate vercel.json redirects against the live sitemap.
 *
 * Why: a redirect whose source matches a canonical (sitemap) URL is always
 * a bug. If the destination is the same URL, it's a self-redirect (308 loop
 * in production headers — this is what shipped during the original GSC
 * incident). If the destination is different, it makes a canonical page
 * uncrawlable.
 *
 * Fails the build if any redirect:
 *   - has source === destination (literal self-redirect), OR
 *   - has a source pattern that matches any URL in public/sitemap.xml after
 *     parameter substitution (regardless of where the destination resolves to)
 *
 * Wired into npm run build:prerender. Run standalone:
 *   npm run validate:redirects
 *
 * Exits non-zero on any violation, with one error message per violation.
 *
 * Vercel uses path-to-regexp for source patterns. The simulator below is a
 * faithful subset — it handles `:param` (single segment) and `:param*` (catch
 * all). If a future redirect uses an unsupported pattern, the simulator will
 * miss it; extend `patternToRegex` rather than disabling validation.
 */

const fs = require('fs');
const path = require('path');

const VERCEL_JSON = path.join(__dirname, '..', 'vercel.json');
const SITEMAP = path.join(__dirname, '..', 'public', 'sitemap.xml');

function patternToRegex(pattern) {
  // Two-pass conversion. We must extract :param tokens (and the :param* form)
  // BEFORE escaping regex specials, otherwise the trailing `*` gets escaped or
  // consumed by the wrong regex.
  // Replace :param* with placeholder __STAR_<name>__, :param with __P_<name>__
  let p = pattern;
  p = p.replace(/:([a-zA-Z][a-zA-Z0-9]*)\*/g, '__STAR_$1__');
  p = p.replace(/:([a-zA-Z][a-zA-Z0-9]*)/g, '__P_$1__');
  // Escape regex specials
  p = p.replace(/[.+?^${}()|[\]\\*]/g, '\\$&');
  // Restore placeholders as named groups
  p = p.replace(/__STAR_([a-zA-Z][a-zA-Z0-9]*)__/g, '(?<$1>.+)');
  p = p.replace(/__P_([a-zA-Z][a-zA-Z0-9]*)__/g, '(?<$1>[^/]+)');
  return new RegExp('^' + p + '$');
}

function resolveDestination(rule, match) {
  let dest = rule.destination;
  if (match.groups) {
    for (const [k, v] of Object.entries(match.groups)) {
      dest = dest.replace(new RegExp(':' + k + '\\*?', 'g'), v);
    }
  }
  return dest;
}

function main() {
  const vc = JSON.parse(fs.readFileSync(VERCEL_JSON, 'utf8'));
  const xml = fs.readFileSync(SITEMAP, 'utf8');
  const sitemapPaths = [...xml.matchAll(/<loc>https:\/\/anythingitechmv\.com([^<]*)<\/loc>/g)].map(m => m[1]);

  const errors = [];

  // 1. Strict self-redirects
  vc.redirects.forEach((r, i) => {
    if (r.source === r.destination) {
      errors.push(`#${i} self-redirect (source === destination): ${r.source}`);
    }
  });

  // 2. Any redirect rule that matches a sitemap URL is a problem
  for (const url of sitemapPaths) {
    for (let i = 0; i < vc.redirects.length; i++) {
      const r = vc.redirects[i];
      const m = url.match(patternToRegex(r.source));
      if (!m) continue;
      const resolved = resolveDestination(r, m);
      if (resolved === url) {
        errors.push(`#${i} sitemap URL self-redirects: ${url} (rule ${r.source} → ${r.destination})`);
      } else {
        errors.push(`#${i} sitemap URL ${url} would redirect to ${resolved} (rule ${r.source} → ${r.destination})`);
      }
      break; // first-match wins, only the first counts
    }
  }

  if (errors.length > 0) {
    console.error('❌ vercel.json redirect validation FAILED:');
    errors.forEach(e => console.error('  ' + e));
    console.error(`\nTotal violations: ${errors.length}`);
    process.exit(1);
  }

  console.log(`✅ vercel.json redirects clean: ${vc.redirects.length} rules, no canonical collisions across ${sitemapPaths.length} sitemap URLs.`);
}

main();
