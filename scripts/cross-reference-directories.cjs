#!/usr/bin/env node
/**
 * Cross-reference every business in our directory against external local
 * directories. Writes confirmed matches to the `business_memberships` table
 * and uncertain matches to data/exports/review-queue.json.
 *
 * Sources crawled:
 *   - business.mvy.com/memberdirectory       (Chamber)
 *   - vineyardgazette.com/business-directory (Gazette)
 *   - gomarthasvineyard.com/directory        (GoMV)
 *   - blackownedmv.com  (PDF: BOB 2025)      (BlackOwnedMV)
 *
 * Matching policy:
 *   Tier 1 — exact matchable-domain match.
 *            Auto-approve for all sources.
 *   Tier 2 — exact normalized name + town match.
 *            Auto-approve for chamber/gazette/gomv.
 *            Review-queue for blackOwned (website confirmation required).
 *   Tier 3 — fuzzy name match (or candidates).
 *            Always review-queue.
 *
 * Usage:
 *   npm run cross-reference                 # dry run
 *   npm run cross-reference:apply           # write to DB
 *   --source <name>                         # crawl only one source
 *   --no-cache-blackowned                   # force re-download of the PDF
 *
 * After running with --apply:
 *   npm run registry:export                 # rebuild data/exports/*.json
 */

const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const { buildIndex, matchCandidate } = require('./lib/cross-ref/match.cjs');
const chamber = require('./lib/cross-ref/chamber.cjs');
const gazette = require('./lib/cross-ref/gazette.cjs');
const gomv = require('./lib/cross-ref/gomv.cjs');
const blackowned = require('./lib/cross-ref/blackowned.cjs');

const ROOT = path.join(__dirname, '..');
const DB_PATH = path.join(ROOT, 'data', 'mv_registry.db');
const REVIEW_PATH = path.join(ROOT, 'data', 'exports', 'review-queue.json');
const REPORT_PATH = path.join(ROOT, 'data', 'exports', 'cross-reference-report.json');

const args = process.argv.slice(2);
const APPLY = args.includes('--apply');
const SOURCE_FILTER = (() => {
  const i = args.indexOf('--source');
  return i >= 0 ? args[i + 1] : null;
})();

const SOURCES = {
  chamber: { crawl: chamber.crawl, label: 'Chamber' },
  gazette: { crawl: gazette.crawl, label: 'Gazette' },
  gomv: { crawl: gomv.crawl, label: 'GoMV' },
  blackOwned: { crawl: blackowned.crawl, label: 'BlackOwnedMV' },
};

function loadOurBusinesses(db) {
  return db.prepare(
    `SELECT id, business_name, town, website
       FROM businesses
      WHERE COALESCE(is_duplicate, 0) = 0
        AND COALESCE(suppress_from_directory, 0) = 0
        AND business_status IN ('active', 'uncertain', 'unknown')`
  ).all();
}

function summarize(buckets) {
  const out = {};
  for (const [source, { auto, review, noMatch }] of Object.entries(buckets)) {
    out[source] = { auto: auto.length, review: review.length, noMatch: noMatch.length, total: auto.length + review.length + noMatch.length };
  }
  return out;
}

async function main() {
  console.log('='.repeat(72));
  console.log('Directory cross-reference');
  console.log(`Mode: ${APPLY ? 'APPLY (writing to DB)' : 'DRY RUN'}`);
  if (SOURCE_FILTER) console.log(`Source filter: ${SOURCE_FILTER}`);
  console.log('='.repeat(72));

  if (!fs.existsSync(DB_PATH)) {
    console.error(`DB not found: ${DB_PATH}`);
    process.exit(1);
  }

  const db = new Database(DB_PATH, { readonly: !APPLY });
  const ourBusinesses = loadOurBusinesses(db);
  console.log(`Loaded ${ourBusinesses.length} internal businesses`);
  const index = buildIndex(ourBusinesses);
  const ourBusinessById = new Map(ourBusinesses.map((b) => [b.id, b]));

  const buckets = {};
  const sourceNames = SOURCE_FILTER ? [SOURCE_FILTER] : Object.keys(SOURCES);

  for (const sourceKey of sourceNames) {
    const src = SOURCES[sourceKey];
    if (!src) {
      console.error(`Unknown source: ${sourceKey}`);
      continue;
    }
    console.log(`\n--- ${src.label} ---`);
    let candidates;
    try {
      candidates = await src.crawl();
    } catch (err) {
      console.error(`  Failed: ${err.message}`);
      continue;
    }
    console.log(`  Crawled ${candidates.length} candidates`);

    const auto = [];
    const review = [];
    const noMatch = [];
    for (const cand of candidates) {
      const result = matchCandidate(cand, index);
      const merged = { ...cand, ...result };
      if (result.decision === 'auto') auto.push(merged);
      else if (result.decision === 'review') review.push(merged);
      else noMatch.push(merged);
    }
    console.log(`  Auto: ${auto.length}, Review: ${review.length}, No match: ${noMatch.length}`);
    buckets[sourceKey] = { auto, review, noMatch };
  }

  // --- Write auto-approved matches to DB ---
  if (APPLY) {
    const now = new Date().toISOString();
    const upsert = db.prepare(
      `INSERT INTO business_memberships
         (business_id, source, listed, last_verified_at, external_name, external_url, external_website, match_tier, match_confidence, updated_at)
       VALUES (?, ?, 1, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(business_id, source) DO UPDATE SET
         listed = 1,
         last_verified_at = excluded.last_verified_at,
         external_name = excluded.external_name,
         external_url = excluded.external_url,
         external_website = excluded.external_website,
         match_tier = excluded.match_tier,
         match_confidence = excluded.match_confidence,
         updated_at = excluded.updated_at`
    );
    const tx = db.transaction((items) => {
      for (const it of items) {
        upsert.run(
          it.business_id,
          it.source,
          now,
          it.name || null,
          it.external_url || null,
          it.website || null,
          it.tier || null,
          it.confidence || null,
          now
        );
      }
    });
    let totalAuto = 0;
    for (const [src, b] of Object.entries(buckets)) {
      tx(b.auto);
      totalAuto += b.auto.length;
      console.log(`  Wrote ${b.auto.length} ${src} memberships`);
    }
    console.log(`\nTotal auto-approved memberships written: ${totalAuto}`);
  }

  // --- Build review queue ---
  const reviewItems = [];
  for (const [source, b] of Object.entries(buckets)) {
    for (const r of b.review) {
      const candidateIds = r.candidates || (r.business_id ? [r.business_id] : []);
      const matched = candidateIds.map((id) => {
        const our = ourBusinessById.get(id);
        return our
          ? {
              id: our.id,
              name: our.business_name,
              town: our.town,
              website: our.website,
            }
          : null;
      }).filter(Boolean);

      reviewItems.push({
        source,
        candidate_name: r.name,
        candidate_town: r.town,
        candidate_website: r.website,
        candidate_external_url: r.external_url,
        tier: r.tier,
        confidence: r.confidence,
        reason: r.reason,
        matched_businesses: matched,
      });
    }
  }

  fs.mkdirSync(path.dirname(REVIEW_PATH), { recursive: true });
  fs.writeFileSync(
    REVIEW_PATH,
    JSON.stringify(
      {
        generated_at: new Date().toISOString(),
        apply: APPLY,
        total: reviewItems.length,
        items: reviewItems,
      },
      null,
      2
    )
  );
  console.log(`\nReview queue: ${reviewItems.length} items → ${REVIEW_PATH}`);

  // --- Summary report ---
  const summary = summarize(buckets);
  const report = {
    generated_at: new Date().toISOString(),
    apply: APPLY,
    source_filter: SOURCE_FILTER,
    summary,
  };
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2));

  console.log(`\nSummary:`);
  console.log(JSON.stringify(summary, null, 2));
  console.log(`\nReport: ${REPORT_PATH}`);
  if (!APPLY) console.log(`\nDry run — re-run with --apply to write to DB.`);
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(1);
});
