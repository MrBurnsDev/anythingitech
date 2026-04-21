#!/usr/bin/env npx tsx
/**
 * Phase 2 Hardening Script
 *
 * This script:
 * 1. Detects and resolves duplicates
 * 2. Validates and cleans business names more strictly
 * 3. Calculates completeness scores
 * 4. Applies stricter publish tier logic
 * 5. Prepares records for map display
 * 6. Determines outreach readiness
 *
 * Usage:
 *   npx tsx scripts/registry/phase2-harden.ts           # Dry run
 *   npx tsx scripts/registry/phase2-harden.ts --apply   # Apply changes
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Parse CLI args
const args = process.argv.slice(2);
const dryRun = !args.includes('--apply');

const DB_PATH = path.join(process.cwd(), 'data', 'mv_registry.db');

// ============================================================================
// NAME VALIDATION - Stricter rules for what constitutes a valid business name
// ============================================================================

const INVALID_NAME_PATTERNS = [
  // Generic page titles (exact match only)
  /^(home|homepage|home page|welcome|about|contact|menu|directory|subscribe)$/i,
  // Generic business types ONLY when they stand alone
  /^(restaurant|bar|shop|store|hotel|inn)s?$/i,

  // Location-based generic titles without a business name
  // Matches: "Edgartown", "Edgartown, MA", "Edgartown Restaurants", "Edgartown, MA Bars"
  // Does NOT match: "Edgartown Pizza" or "Aquinnah Shop" (these are specific business names)
  /^(vineyard haven|edgartown|oak bluffs|west tisbury|chilmark|aquinnah)\s*,?\s*(ma|massachusetts)?$/i,
  // Only match plural forms which are clearly generic (restaurants, bars, stores, shops)
  /^(vineyard haven|edgartown|oak bluffs|west tisbury|chilmark|aquinnah)\s*,?\s*(ma|massachusetts)?\s+(restaurants|bars|stores|shops)$/i,
  /,\s*ma\s*(restaurants?|bars?|stores?|shops?|location)?$/i,
  // Only match "Martha's Vineyard" alone or with generic suffixes
  /^martha'?s?\s*vineyard\s*(island)?(\s*,?\s*(ma|massachusetts)?)?$/i,
  /^martha'?s?\s*vineyard\s+(magazine|restaurants?|bars?)$/i,

  // SEO/directory junk
  /\|\s*(home|menu|about)/i,
  /^store location$/i,
  /^island weddings$/i,
  /^visit\s+(martha|mv|the island)/i,
  /^directories?$/i,

  // URL leftovers
  /\.(com|net|org|site|square|business)\/?$/i,
  /^(www|http|https)/i,
  /^facebook$/i,
  /^instagram$/i,

  // Too short or generic
  /^.{1,2}$/,  // 1-2 characters
  /^v\d+$/i,   // Version numbers like "V2"
];

const SUSPICIOUS_NAME_PATTERNS = [
  // Contains location suffix that should be stripped
  /,\s*(martha'?s?\s*vineyard|mv|ma|massachusetts)$/i,
  /\s+(in|at)\s+(edgartown|vineyard haven|oak bluffs|west tisbury|chilmark|aquinnah)/i,

  // HTML entities that weren't decoded
  /&#\d+;/,
  /&[a-z]+;/i,

  // Metadata artifacts
  /\s*[-–—|]\s*$/,
  /^\s*[-–—|]\s*/,
];

function isInvalidBusinessName(name: string): boolean {
  if (!name || name.trim().length < 2) return true;

  for (const pattern of INVALID_NAME_PATTERNS) {
    if (pattern.test(name.trim())) return true;
  }

  return false;
}

function cleanBusinessNameStrict(name: string): string {
  if (!name) return '';

  let cleaned = name.trim();

  // Decode HTML entities
  cleaned = cleaned
    .replace(/&#39;/g, "'")
    .replace(/&#(\d+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'");

  // Remove location suffixes
  cleaned = cleaned.replace(/,\s*(martha'?s?\s*vineyard|mv|ma|massachusetts)$/i, '');
  cleaned = cleaned.replace(/\s+(in|at)\s+(edgartown|vineyard haven|oak bluffs|west tisbury|chilmark|aquinnah).*$/i, '');

  // Remove trailing separators and metadata
  cleaned = cleaned.replace(/\s*[-–—|:]\s*(home|menu|about|contact|welcome).*$/i, '');
  cleaned = cleaned.replace(/\s*[-–—|]\s*$/, '');

  // Fix possessive apostrophe capitalization
  cleaned = cleaned.replace(/'S\b/g, "'s");

  // Clean whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

function scoreNameQuality(name: string): number {
  if (!name || isInvalidBusinessName(name)) return 0;

  let score = 100;

  // Deductions for suspicious patterns
  for (const pattern of SUSPICIOUS_NAME_PATTERNS) {
    if (pattern.test(name)) score -= 20;
  }

  // Length penalties
  if (name.length < 4) score -= 30;
  if (name.length > 60) score -= 20;

  // All caps or all lowercase
  if (name === name.toUpperCase() || name === name.toLowerCase()) score -= 10;

  // Contains numbers only
  if (/^\d+$/.test(name)) score -= 50;

  return Math.max(0, score);
}

// ============================================================================
// DUPLICATE DETECTION
// ============================================================================

interface DuplicateCluster {
  canonical_id: number;
  duplicate_ids: number[];
  match_reason: string;
  confidence: number;
}

function normalizeForMatching(str: string): string {
  if (!str) return '';
  return str.toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .replace(/\b(the|a|an|and|of|in|on|at|llc|inc|corp|co)\b/g, '')
    .trim();
}

function normalizePhone(phone: string): string | null {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1);
  if (digits.length === 10) return digits;
  return null;
}

function detectDuplicates(db: Database.Database): DuplicateCluster[] {
  const clusters: DuplicateCluster[] = [];
  const processed = new Set<number>();

  const businesses = db.prepare(`
    SELECT id, business_name, normalized_name, domain, phone, town, category
    FROM businesses
    WHERE is_duplicate = 0
    ORDER BY confidence_score DESC, id ASC
  `).all() as Array<{
    id: number;
    business_name: string;
    normalized_name: string;
    domain: string;
    phone: string;
    town: string;
    category: string;
  }>;

  // Build lookup indices
  const byPhone = new Map<string, number[]>();
  const byDomain = new Map<string, number[]>();
  const byNormalizedName = new Map<string, number[]>();

  for (const biz of businesses) {
    // Phone index
    const normPhone = normalizePhone(biz.phone);
    if (normPhone) {
      if (!byPhone.has(normPhone)) byPhone.set(normPhone, []);
      byPhone.get(normPhone)!.push(biz.id);
    }

    // Domain index
    if (biz.domain) {
      const normDomain = biz.domain.toLowerCase().replace(/^www\./, '');
      if (!byDomain.has(normDomain)) byDomain.set(normDomain, []);
      byDomain.get(normDomain)!.push(biz.id);
    }

    // Normalized name index (within same town)
    if (biz.normalized_name && biz.town) {
      const key = `${normalizeForMatching(biz.normalized_name)}|${biz.town.toLowerCase()}`;
      if (!byNormalizedName.has(key)) byNormalizedName.set(key, []);
      byNormalizedName.get(key)!.push(biz.id);
    }
  }

  // Find clusters by phone (highest confidence)
  for (const [phone, ids] of byPhone) {
    if (ids.length > 1 && !ids.some(id => processed.has(id))) {
      const canonical = ids[0]; // First one (highest confidence)
      const duplicates = ids.slice(1);
      clusters.push({
        canonical_id: canonical,
        duplicate_ids: duplicates,
        match_reason: `same_phone:${phone}`,
        confidence: 0.95
      });
      ids.forEach(id => processed.add(id));
    }
  }

  // Find clusters by domain
  for (const [domain, ids] of byDomain) {
    // Skip generic directory domains
    if (['business.mvy.com', 'gomarthasvineyard.com'].includes(domain)) continue;

    const unprocessed = ids.filter(id => !processed.has(id));
    if (unprocessed.length > 1) {
      const canonical = unprocessed[0];
      const duplicates = unprocessed.slice(1);
      clusters.push({
        canonical_id: canonical,
        duplicate_ids: duplicates,
        match_reason: `same_domain:${domain}`,
        confidence: 0.90
      });
      unprocessed.forEach(id => processed.add(id));
    }
  }

  // Find clusters by normalized name + town
  for (const [key, ids] of byNormalizedName) {
    const unprocessed = ids.filter(id => !processed.has(id));
    if (unprocessed.length > 1) {
      const canonical = unprocessed[0];
      const duplicates = unprocessed.slice(1);
      clusters.push({
        canonical_id: canonical,
        duplicate_ids: duplicates,
        match_reason: `same_name_town:${key}`,
        confidence: 0.80
      });
      unprocessed.forEach(id => processed.add(id));
    }
  }

  return clusters;
}

// ============================================================================
// COMPLETENESS & QUALITY SCORING
// ============================================================================

interface BusinessRecord {
  id: number;
  business_name: string;
  normalized_name: string;
  category: string;
  town: string;
  street_address: string;
  full_address: string;
  phone: string;
  email: string;
  website: string;
  latitude: number;
  longitude: number;
  short_description: string;
  confidence_score: number;
  website_works: number;
  source_count: number;
  is_duplicate: number;
}

function calculateCompletenessScore(biz: BusinessRecord): number {
  let score = 0;
  const weights = {
    business_name: 15,
    category: 10,
    town: 10,
    street_address: 10,
    phone: 15,
    email: 10,
    website: 10,
    coordinates: 10,
    description: 10,
  };

  if (biz.business_name && !isInvalidBusinessName(biz.business_name)) score += weights.business_name;
  if (biz.category && biz.category !== 'Other') score += weights.category;
  if (biz.town) score += weights.town;
  if (biz.street_address || biz.full_address) score += weights.street_address;
  if (biz.phone) score += weights.phone;
  if (biz.email) score += weights.email;
  if (biz.website) score += weights.website;
  if (biz.latitude && biz.longitude) score += weights.coordinates;
  if (biz.short_description && biz.short_description.length > 10) score += weights.description;

  return score;
}

function calculateContactConfidence(biz: BusinessRecord): number {
  let score = 0;
  if (biz.phone) score += 40;
  if (biz.email) score += 30;
  if (biz.website && biz.website_works === 1) score += 30;
  else if (biz.website) score += 15;
  return Math.min(100, score);
}

function calculateLocationConfidence(biz: BusinessRecord): number {
  let score = 0;
  if (biz.town) score += 30;
  if (biz.street_address) score += 30;
  else if (biz.full_address) score += 20;
  if (biz.latitude && biz.longitude) score += 40;
  return Math.min(100, score);
}

function determinePublishTierStrict(
  biz: BusinessRecord,
  nameQuality: number,
  completeness: number,
  contactConfidence: number,
  locationConfidence: number
): 'A' | 'B' | 'C' | 'unpublishable' {
  // Absolute disqualifiers
  if (isInvalidBusinessName(biz.business_name)) return 'unpublishable';
  if (biz.is_duplicate) return 'unpublishable';
  if (!biz.town) return 'unpublishable';
  if (nameQuality < 50) return 'unpublishable';

  // Tier A: Strong listing
  // - Clean name (80+)
  // - Town + address or strong geocode
  // - Phone
  // - Website (verified)
  // - High completeness (70+)
  if (
    nameQuality >= 80 &&
    locationConfidence >= 70 &&
    contactConfidence >= 70 &&
    completeness >= 70 &&
    biz.phone &&
    biz.website_works === 1
  ) {
    return 'A';
  }

  // Tier B: Acceptable listing
  // - Clean name (60+)
  // - Town
  // - Phone or website
  // - Reasonable completeness (50+)
  if (
    nameQuality >= 60 &&
    biz.town &&
    (biz.phone || biz.website) &&
    completeness >= 50
  ) {
    return 'B';
  }

  // Tier C: Internal only
  // - Has town and name but weak on other fronts
  if (
    nameQuality >= 50 &&
    biz.town &&
    completeness >= 30
  ) {
    return 'C';
  }

  return 'unpublishable';
}

function isOutreachReady(
  biz: BusinessRecord,
  tier: string,
  contactConfidence: number
): boolean {
  if (tier === 'unpublishable' || tier === 'C') return false;
  if (biz.is_duplicate) return false;
  if (!biz.phone && !biz.email && !biz.website) return false;
  if (contactConfidence < 40) return false;
  return true;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  MV BUSINESS REGISTRY - PHASE 2 HARDENING');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Mode: ${dryRun ? 'DRY RUN (no changes)' : 'APPLY CHANGES'}`);
  console.log('');

  if (!fs.existsSync(DB_PATH)) {
    console.error(`Database not found at ${DB_PATH}`);
    process.exit(1);
  }

  const db = new Database(DB_PATH);

  // Stats
  const stats = {
    total: 0,
    duplicates_found: 0,
    duplicates_marked: 0,
    names_cleaned: 0,
    names_invalidated: 0,
    tier_a: 0,
    tier_b: 0,
    tier_c: 0,
    unpublishable: 0,
    outreach_ready: 0,
  };

  // =========================================================================
  // STEP 1: Detect and mark duplicates
  // =========================================================================
  console.log('STEP 1: Detecting duplicates...');

  const duplicateClusters = detectDuplicates(db);
  stats.duplicates_found = duplicateClusters.reduce((sum, c) => sum + c.duplicate_ids.length, 0);

  console.log(`  Found ${duplicateClusters.length} duplicate clusters (${stats.duplicates_found} duplicate records)`);

  if (!dryRun) {
    const markDuplicate = db.prepare(`
      UPDATE businesses SET
        is_duplicate = 1,
        duplicate_of_id = ?,
        validation_notes = COALESCE(validation_notes, '') || ' | Duplicate: ' || ?,
        publish_tier = 'unpublishable',
        updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    for (const cluster of duplicateClusters) {
      for (const dupId of cluster.duplicate_ids) {
        markDuplicate.run(cluster.canonical_id, cluster.match_reason, dupId);
        stats.duplicates_marked++;
      }
    }
  }

  // =========================================================================
  // STEP 2: Clean names and calculate scores
  // =========================================================================
  console.log('\nSTEP 2: Cleaning names and scoring records...');

  const businesses = db.prepare(`
    SELECT
      id, business_name, normalized_name, category, town,
      street_address, full_address, phone, email, website,
      latitude, longitude, short_description, confidence_score,
      website_works, source_count, is_duplicate
    FROM businesses
    WHERE is_duplicate = 0
  `).all() as BusinessRecord[];

  stats.total = businesses.length;

  const updateRecord = db.prepare(`
    UPDATE businesses SET
      business_name = ?,
      name_quality = ?,
      completeness_score = ?,
      contact_confidence = ?,
      location_confidence = ?,
      publish_tier = ?,
      outreach_ready = ?,
      needs_manual_review = ?,
      suppress_from_directory = ?,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  const results: Array<{
    id: number;
    name: string;
    cleaned_name: string;
    name_quality: number;
    completeness: number;
    tier: string;
    outreach_ready: boolean;
    issues: string[];
  }> = [];

  for (const biz of businesses) {
    const issues: string[] = [];

    // Clean name
    const cleanedName = cleanBusinessNameStrict(biz.business_name);
    const nameChanged = cleanedName !== biz.business_name;
    if (nameChanged) stats.names_cleaned++;

    // Check if name is invalid
    const nameInvalid = isInvalidBusinessName(cleanedName);
    if (nameInvalid) {
      stats.names_invalidated++;
      issues.push('invalid_name');
    }

    // Calculate scores
    const nameQuality = nameInvalid ? 0 : scoreNameQuality(cleanedName);
    const completeness = calculateCompletenessScore({ ...biz, business_name: cleanedName });
    const contactConfidence = calculateContactConfidence(biz);
    const locationConfidence = calculateLocationConfidence(biz);

    // Determine tier
    const tier = determinePublishTierStrict(
      { ...biz, business_name: cleanedName },
      nameQuality,
      completeness,
      contactConfidence,
      locationConfidence
    );

    // Determine outreach readiness
    const outreachReady = isOutreachReady(biz, tier, contactConfidence);

    // Track stats
    switch (tier) {
      case 'A': stats.tier_a++; break;
      case 'B': stats.tier_b++; break;
      case 'C': stats.tier_c++; break;
      default: stats.unpublishable++;
    }
    if (outreachReady) stats.outreach_ready++;

    // Determine if needs review
    const needsReview = nameQuality < 70 || completeness < 50 || issues.length > 0;
    const suppress = tier === 'unpublishable' || tier === 'C';

    results.push({
      id: biz.id,
      name: biz.business_name,
      cleaned_name: cleanedName,
      name_quality: nameQuality,
      completeness,
      tier,
      outreach_ready: outreachReady,
      issues,
    });

    // Apply updates
    if (!dryRun) {
      updateRecord.run(
        nameChanged ? cleanedName : biz.business_name,
        nameQuality >= 80 ? 'good' : nameQuality >= 50 ? 'acceptable' : 'poor',
        completeness,
        contactConfidence,
        locationConfidence,
        tier,
        outreachReady ? 1 : 0,
        needsReview ? 1 : 0,
        suppress ? 1 : 0,
        biz.id
      );
    }
  }

  db.close();

  // =========================================================================
  // PRINT SUMMARY
  // =========================================================================
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  PHASE 2 HARDENING SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Total records processed:    ${stats.total}`);
  console.log('');
  console.log('  DUPLICATES:');
  console.log(`    Clusters found:           ${duplicateClusters.length}`);
  console.log(`    Duplicates marked:        ${stats.duplicates_marked}`);
  console.log('');
  console.log('  NAME QUALITY:');
  console.log(`    Names cleaned:            ${stats.names_cleaned}`);
  console.log(`    Names invalidated:        ${stats.names_invalidated}`);
  console.log('');
  console.log('  PUBLISH TIERS:');
  console.log(`    Tier A (strong):          ${stats.tier_a}`);
  console.log(`    Tier B (acceptable):      ${stats.tier_b}`);
  console.log(`    Tier C (internal only):   ${stats.tier_c}`);
  console.log(`    Unpublishable:            ${stats.unpublishable}`);
  console.log('');
  console.log('  OUTREACH:');
  console.log(`    Outreach ready:           ${stats.outreach_ready}`);
  console.log('═══════════════════════════════════════════════════════════════');

  if (dryRun) {
    console.log('\n  This was a DRY RUN. No changes were made.');
    console.log('  Run with --apply to apply changes.\n');
  }

  // Save detailed report
  const reportPath = path.join(process.cwd(), 'data', 'exports', 'phase2-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    mode: dryRun ? 'dry_run' : 'applied',
    stats,
    duplicate_clusters: duplicateClusters,
    problem_records: results.filter(r => r.tier === 'unpublishable' || r.issues.length > 0).slice(0, 50),
    tier_c_records: results.filter(r => r.tier === 'C').slice(0, 30),
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Report saved to: ${reportPath}`);

  // Print sample problem records
  const problems = results.filter(r => r.tier === 'unpublishable' || r.name_quality < 50);
  if (problems.length > 0) {
    console.log('\n  SAMPLE PROBLEM RECORDS:');
    for (const p of problems.slice(0, 10)) {
      console.log(`    ID ${p.id}: "${p.name.slice(0, 40)}" → quality=${p.name_quality}, tier=${p.tier}`);
    }
  }
}

main().catch(console.error);
