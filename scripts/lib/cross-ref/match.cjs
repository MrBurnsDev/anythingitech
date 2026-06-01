/**
 * Matching engine: takes a candidate business record from an external directory
 * and decides whether it matches a business in our DB.
 *
 * Tier 1 — exact matchable-domain match.
 *           Auto-approve for ALL sources.
 *
 * Tier 2 — exact normalized name + town match.
 *           Auto-approve for chamber/gazette/gomv.
 *           Review-queue for blackOwned (per spec: website confirmation required).
 *
 * Tier 3 — anything fuzzy (similar names, missing website, multiple candidates).
 *           Always review-queue.
 *
 * Output for each candidate:
 *   { decision: 'auto' | 'review' | 'no-match', business_id?, tier?, confidence?, reason }
 *
 * The crawler layer decides what to do with the decision; this module is
 * source-aware (knows about blackOwned's stricter rules) but has no I/O.
 */

const { normalizeName, normalizeTown, matchableDomain } = require('./normalize.cjs');

// Sources whose Tier-2 (name+town) matches must NOT be auto-approved.
// Per spec, BlackOwnedMV requires website confirmation.
const TIER2_REVIEW_ONLY_SOURCES = new Set(['blackOwned']);

/**
 * Build matching indexes over our own businesses table once, then look up
 * candidates against them. Caller must pass an array of business rows with at
 * least { id, business_name, town, website }.
 */
function buildIndex(ourBusinesses) {
  const byDomain = new Map();   // matchableDomain -> [id, id, ...]
  const byNameTown = new Map(); // normalizedName + '|' + canonicalTown -> [id, id, ...]
  const byName = new Map();     // normalizedName -> [id, id, ...]  (for ambiguity detection)

  for (const b of ourBusinesses) {
    const id = b.id;
    const dom = matchableDomain(b.website);
    if (dom) {
      if (!byDomain.has(dom)) byDomain.set(dom, []);
      byDomain.get(dom).push(id);
    }
    const name = normalizeName(b.business_name);
    if (name) {
      if (!byName.has(name)) byName.set(name, []);
      byName.get(name).push(id);
      const town = normalizeTown(b.town);
      if (town) {
        const key = name + '|' + town;
        if (!byNameTown.has(key)) byNameTown.set(key, []);
        byNameTown.get(key).push(id);
      }
    }
  }

  return { byDomain, byNameTown, byName };
}

/**
 * Match one external candidate against our index.
 *
 * candidate: { source, name, town, website, external_url? }
 * index: result of buildIndex()
 *
 * Returns:
 *   { decision: 'auto'|'review'|'no-match',
 *     business_id?: number,
 *     tier?: 1|2|3,
 *     confidence?: number,
 *     reason: string,
 *     candidates?: number[] }     // populated when ambiguous
 */
function matchCandidate(candidate, index) {
  const { source, name, town, website } = candidate;

  // --- Tier 1: domain match (highest signal) ---
  const dom = matchableDomain(website);
  if (dom) {
    const ids = index.byDomain.get(dom) || [];
    if (ids.length === 1) {
      return {
        decision: 'auto',
        business_id: ids[0],
        tier: 1,
        confidence: 1.0,
        reason: `Tier 1 (exact domain match: ${dom})`,
      };
    }
    if (ids.length > 1) {
      return {
        decision: 'review',
        tier: 1,
        confidence: 0.8,
        reason: `Multiple internal businesses share domain ${dom}`,
        candidates: ids,
      };
    }
  }

  // --- Tier 2: exact name + town ---
  const normName = normalizeName(name);
  const normTown = normalizeTown(town);

  if (normName && normTown) {
    const key = normName + '|' + normTown;
    const ids = index.byNameTown.get(key) || [];
    if (ids.length === 1) {
      const autoOk = !TIER2_REVIEW_ONLY_SOURCES.has(source);
      return {
        decision: autoOk ? 'auto' : 'review',
        business_id: ids[0],
        tier: 2,
        confidence: 0.9,
        reason: autoOk
          ? `Tier 2 (exact name + town match)`
          : `Tier 2 (exact name + town) — requires website confirmation for ${source}`,
      };
    }
    if (ids.length > 1) {
      return {
        decision: 'review',
        tier: 2,
        confidence: 0.6,
        reason: `Multiple internal businesses share normalized name + town`,
        candidates: ids,
      };
    }
  }

  // --- Tier 3: name-only (for queueing) ---
  if (normName) {
    const ids = index.byName.get(normName) || [];
    if (ids.length > 0) {
      return {
        decision: 'review',
        tier: 3,
        confidence: 0.4,
        reason: ids.length === 1
          ? `Tier 3 (name match without confirmed town)`
          : `Tier 3 (name matches ${ids.length} internal businesses)`,
        candidates: ids,
      };
    }
  }

  return { decision: 'no-match', reason: 'No internal business matched name or domain' };
}

module.exports = { buildIndex, matchCandidate, TIER2_REVIEW_ONLY_SOURCES };
