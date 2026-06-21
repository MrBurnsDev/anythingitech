#!/usr/bin/env node
/**
 * One-off: layer business_memberships from the registry DB onto
 * data/exports/businesses.json in place. Adds `memberships` and
 * `verifiedLocalBusiness` to each matched record by `id`.
 *
 * Why this exists: the canonical exporter (scripts/export-directory-data.js)
 * was found to rebuild businesses.json from a stale BUSINESS_TYPES list,
 * which corrupted businessType slugs (modern → legacy short form). Until that
 * exporter is repaired or replaced, we revert to the known-good
 * businesses.json from bf751fe and use this script to splice memberships
 * back in without rerunning the broken exporter.
 *
 * Idempotent. Re-running with the same DB state produces the same output.
 *
 * Usage:
 *   node scripts/layer-memberships.cjs
 */

const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const ROOT = path.join(__dirname, '..');
const DB_PATH = path.join(ROOT, 'data', 'mv_registry.db');
const BUSINESSES_PATH = path.join(ROOT, 'data', 'exports', 'businesses.json');

function main() {
  const businesses = JSON.parse(fs.readFileSync(BUSINESSES_PATH, 'utf8'));
  const db = new Database(DB_PATH, { readonly: true });

  const sources = db.prepare(
    `SELECT source, counts_for_local FROM membership_sources`
  ).all();
  const sourceCatalog = new Map(sources.map((s) => [s.source, s]));

  const rows = db.prepare(
    `SELECT business_id, source, last_verified_at, external_url, external_name
       FROM business_memberships
      WHERE listed = 1`
  ).all();

  const byBiz = new Map();
  for (const r of rows) {
    if (!byBiz.has(r.business_id)) byBiz.set(r.business_id, []);
    byBiz.get(r.business_id).push(r);
  }

  let withMemberships = 0;
  let verifiedCount = 0;
  for (const b of businesses) {
    const rs = byBiz.get(b.id);
    if (!rs || rs.length === 0) continue;
    const memberships = {};
    let verified = false;
    for (const r of rs) {
      memberships[r.source] = {
        listed: true,
        lastVerified: r.last_verified_at,
        externalUrl: r.external_url || null,
        externalName: r.external_name || null,
      };
      const cat = sourceCatalog.get(r.source);
      if (cat && cat.counts_for_local) verified = true;
    }
    b.memberships = memberships;
    b.verifiedLocalBusiness = verified;
    withMemberships++;
    if (verified) verifiedCount++;
  }

  fs.writeFileSync(BUSINESSES_PATH, JSON.stringify(businesses, null, 2));
  console.log(
    `Wrote ${businesses.length} businesses; ${withMemberships} with memberships, ${verifiedCount} verifiedLocalBusiness.`
  );
}

main();
