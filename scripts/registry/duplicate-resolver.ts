#!/usr/bin/env npx tsx
/**
 * Duplicate Resolution System
 *
 * Identifies, classifies, and safely resolves duplicate business records.
 * - Does NOT delete records automatically
 * - Does NOT change public URLs without validation
 * - Creates redirect mappings for removed duplicates
 */

import Database from 'better-sqlite3';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../../data/mv_registry.db');
const EXPORT_PATH = path.join(__dirname, '../../data/exports');

interface BusinessRecord {
  id: number;
  business_name: string;
  normalized_name: string | null;
  slug: string | null;
  town: string;
  category: string | null;
  full_address: string | null;
  street_address: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  confidence_score: number;
  primary_source: string | null;
  website_works: number | null;
  short_description: string | null;
  is_duplicate: number;
  duplicate_of_id: number | null;
}

interface DuplicateGroup {
  normalized_name: string;
  records: BusinessRecord[];
  duplicate_type: DuplicateType;
  canonical_id: number;
  merge_candidates: number[];
  analysis: GroupAnalysis;
}

interface GroupAnalysis {
  name_match: 'exact' | 'variation';
  location_match: 'same' | 'different' | 'unknown';
  category_match: 'same' | 'different';
  has_conflicting_data: boolean;
  confidence_delta: number;
  recommendation: 'merge' | 'keep_both' | 'manual_review';
}

type DuplicateType =
  | 'true_duplicate'        // Same business, same location
  | 'name_variation'        // Same business, different name spelling
  | 'location_variation'    // Same name, might be different locations
  | 'category_variation'    // Same business, different category
  | 'closed_business'       // One appears to be closed/outdated
  | 'data_conflict'         // Significant conflicting information
  | 'distinct_business_same_name';  // Different businesses with same name

interface RedirectMapping {
  old_slug: string;
  canonical_slug: string;
  redirect_type: 'permanent';
  created_at: string;
}

interface ResolutionReport {
  timestamp: string;
  duplicate_groups_found: number;
  records_merged: number;
  records_marked_duplicate: number;
  redirects_created: number;
  records_needing_manual_review: number;
  groups: DuplicateGroup[];
  redirects: RedirectMapping[];
  manual_review_needed: DuplicateGroup[];
}

// ============================================================================
// PHASE 1: Identify Duplicate Groups
// ============================================================================

function identifyDuplicateGroups(db: Database.Database): Map<string, BusinessRecord[]> {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  PHASE 1: IDENTIFY DUPLICATE GROUPS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Find all normalized names with duplicates
  const duplicateNames = db.prepare(`
    SELECT normalized_name, COUNT(*) as count
    FROM businesses
    WHERE normalized_name IS NOT NULL
      AND is_duplicate = 0
    GROUP BY normalized_name
    HAVING count > 1
    ORDER BY count DESC
  `).all() as { normalized_name: string; count: number }[];

  console.log(`Found ${duplicateNames.length} duplicate groups by normalized name\n`);

  const groups = new Map<string, BusinessRecord[]>();

  for (const { normalized_name } of duplicateNames) {
    const records = db.prepare(`
      SELECT
        id, business_name, normalized_name, slug, town, category,
        full_address, street_address, phone, email, website,
        confidence_score, primary_source, website_works, short_description,
        is_duplicate, duplicate_of_id
      FROM businesses
      WHERE normalized_name = ?
      ORDER BY confidence_score DESC, id ASC
    `).all(normalized_name) as BusinessRecord[];

    groups.set(normalized_name, records);

    console.log(`  ${normalized_name}:`);
    for (const r of records) {
      console.log(`    [${r.id}] ${r.business_name} (${r.town}) - score: ${r.confidence_score}`);
    }
  }

  return groups;
}

// ============================================================================
// PHASE 2: Classify Duplicate Type
// ============================================================================

function classifyDuplicateType(records: BusinessRecord[]): DuplicateType {
  if (records.length < 2) return 'true_duplicate';

  const [a, b] = records;

  // Check if towns are different
  const townA = a.town?.toLowerCase().trim();
  const townB = b.town?.toLowerCase().trim();

  if (townA && townB && townA !== townB) {
    // Different towns - could be location variation or distinct business
    // Check if addresses suggest same physical location (e.g., boundary areas)
    const addressA = a.full_address?.toLowerCase() || '';
    const addressB = b.full_address?.toLowerCase() || '';

    // If one has no address, might be same business listed in wrong town
    if (!addressA || !addressB) {
      return 'location_variation';
    }

    // If addresses are clearly different streets, likely distinct businesses
    return 'distinct_business_same_name';
  }

  // Same town - likely true duplicate
  // Check for data conflicts
  const hasConflict = checkForConflicts(a, b);
  if (hasConflict) {
    return 'data_conflict';
  }

  // Check if categories differ
  const catA = a.category?.toLowerCase();
  const catB = b.category?.toLowerCase();
  if (catA && catB && catA !== catB) {
    // Different categories but same name/town
    // Could be lodging/restaurant combo or miscategorization
    return 'category_variation';
  }

  // Check for name variations
  const nameA = a.business_name.toLowerCase().replace(/[^a-z0-9]/g, '');
  const nameB = b.business_name.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (nameA !== nameB) {
    return 'name_variation';
  }

  return 'true_duplicate';
}

function checkForConflicts(a: BusinessRecord, b: BusinessRecord): boolean {
  // Check for conflicting phone numbers (only if both have valid phones)
  // Note: toll-free (800/844/855/866/877/888) vs local is NOT a conflict
  if (a.phone && b.phone) {
    const phoneA = a.phone.replace(/\D/g, '');
    const phoneB = b.phone.replace(/\D/g, '');
    if (phoneA.length >= 10 && phoneB.length >= 10 && phoneA !== phoneB) {
      // Check if one is toll-free and one is local - not a conflict
      const tollFreeA = /^(800|844|855|866|877|888)/.test(phoneA);
      const tollFreeB = /^(800|844|855|866|877|888)/.test(phoneB);
      if (tollFreeA !== tollFreeB) {
        // One toll-free, one local - same business, not a conflict
      } else if (!tollFreeA && !tollFreeB) {
        // Both local numbers but different - could be conflict
        // But many businesses have multiple local lines, so be lenient
        // Only flag as conflict if area codes also differ
        const areaA = phoneA.slice(0, 3);
        const areaB = phoneB.slice(0, 3);
        if (areaA !== areaB) {
          return true;
        }
      }
    }
  }

  // Check for conflicting addresses (same town but different street)
  // Skip if either address is contaminated
  const addrA = a.full_address || a.street_address || '';
  const addrB = b.full_address || b.street_address || '';

  if (hasContamination(addrA) || hasContamination(addrB)) {
    // One address is contaminated - not a true conflict
    return false;
  }

  if (a.street_address && b.street_address) {
    const streetA = a.street_address.toLowerCase().replace(/[^a-z0-9]/g, '');
    const streetB = b.street_address.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (streetA !== streetB && streetA.length > 5 && streetB.length > 5) {
      return true;
    }
  }

  return false;
}

function analyzeGroup(records: BusinessRecord[], duplicateType: DuplicateType): GroupAnalysis {
  const [a, b] = records;

  const nameMatch = a.business_name.toLowerCase() === b.business_name.toLowerCase() ? 'exact' : 'variation';

  let locationMatch: 'same' | 'different' | 'unknown' = 'unknown';
  if (a.town && b.town) {
    locationMatch = a.town.toLowerCase() === b.town.toLowerCase() ? 'same' : 'different';
  }

  const categoryMatch = (a.category?.toLowerCase() === b.category?.toLowerCase()) ? 'same' : 'different';
  const hasConflictingData = checkForConflicts(a, b);
  const confidenceDelta = Math.abs((a.confidence_score || 0) - (b.confidence_score || 0));

  let recommendation: 'merge' | 'keep_both' | 'manual_review' = 'merge';

  if (duplicateType === 'distinct_business_same_name') {
    recommendation = 'keep_both';
  } else if (hasConflictingData) {
    recommendation = 'manual_review';
  } else if (duplicateType === 'location_variation' && locationMatch === 'different') {
    recommendation = 'manual_review';
  }

  return {
    name_match: nameMatch,
    location_match: locationMatch,
    category_match: categoryMatch,
    has_conflicting_data: hasConflictingData,
    confidence_delta: confidenceDelta,
    recommendation
  };
}

// ============================================================================
// PHASE 3: Select Canonical Record
// ============================================================================

function selectCanonicalRecord(records: BusinessRecord[]): number {
  // Score each record based on data completeness and quality
  const scored = records.map(r => {
    let score = 0;

    // Has complete address (+20)
    if (r.full_address && r.full_address.length > 10 && !hasContamination(r.full_address)) {
      score += 20;
    }

    // Has valid phone (+15)
    if (r.phone && /\d{10}|\(\d{3}\)\s*\d{3}/.test(r.phone)) {
      score += 15;
    }

    // Has valid email (+15)
    if (r.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) {
      score += 15;
    }

    // Has verified website (+10)
    if (r.website_works === 1) {
      score += 10;
    } else if (r.website) {
      score += 5;
    }

    // Higher confidence score (+weight)
    score += (r.confidence_score || 0) * 0.5;

    // Has description (+5)
    if (r.short_description && r.short_description.length > 50) {
      score += 5;
    }

    // Lower ID (older record, likely more established) (+5)
    score += Math.max(0, 10 - (r.id / 100));

    // Source quality
    if (r.primary_source === 'manual_import') {
      score += 3;
    } else if (r.primary_source === 'vineyard_gazette') {
      score += 2;
    }

    return { record: r, score };
  });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);

  return scored[0].record.id;
}

function hasContamination(text: string): boolean {
  if (!text) return false;
  const contaminants = [
    /LOCATION\d/i,
    /Adjust Your Order/i,
    /9pm\n/i,
    /Media[\s\n]*Careers/i,
    /Follow us/i,
    /Instagram/i,
    /Facebook/i,
    /Gift Cards/i,
    /Travel Advisors/i,
    /Accessibility\n/i,
    /Find Us\n/i
  ];
  return contaminants.some(p => p.test(text));
}

// ============================================================================
// PHASE 4: Merge Non-Conflicting Data
// ============================================================================

interface MergeResult {
  canonical_id: number;
  merged_fields: string[];
  source_ids: number[];
}

function mergeNonConflictingData(
  db: Database.Database,
  canonicalId: number,
  duplicateIds: number[],
  dryRun: boolean
): MergeResult {
  const canonical = db.prepare(`SELECT * FROM businesses WHERE id = ?`).get(canonicalId) as any;
  const duplicates = duplicateIds.map(id =>
    db.prepare(`SELECT * FROM businesses WHERE id = ?`).get(id) as any
  );

  const mergedFields: string[] = [];
  const updates: Record<string, any> = {};

  // Fields that can be merged if canonical is missing
  const mergeableFields = [
    'phone', 'email', 'street_address', 'zip_code',
    'facebook_url', 'instagram_url', 'yelp_url', 'tripadvisor_url',
    'hours', 'year_established', 'latitude', 'longitude'
  ];

  for (const field of mergeableFields) {
    if (!canonical[field] || canonical[field] === '') {
      for (const dup of duplicates) {
        if (dup[field] && dup[field] !== '') {
          updates[field] = dup[field];
          mergedFields.push(`${field} (from ID ${dup.id})`);
          break;
        }
      }
    }
  }

  // Merge description if canonical is missing or generic
  if (!canonical.short_description || canonical.short_description.length < 50) {
    for (const dup of duplicates) {
      if (dup.short_description && dup.short_description.length > 50) {
        updates.short_description = dup.short_description;
        mergedFields.push(`short_description (from ID ${dup.id})`);
        break;
      }
    }
  }

  // Apply updates if not dry run
  if (!dryRun && Object.keys(updates).length > 0) {
    const setClauses = Object.keys(updates).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(updates), canonicalId];
    db.prepare(`UPDATE businesses SET ${setClauses}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`).run(...values);
  }

  return {
    canonical_id: canonicalId,
    merged_fields: mergedFields,
    source_ids: duplicateIds
  };
}

// ============================================================================
// PHASE 5: Create Redirect Mappings
// ============================================================================

function createRedirectMappings(
  db: Database.Database,
  canonicalId: number,
  duplicateIds: number[]
): RedirectMapping[] {
  const canonical = db.prepare(`SELECT slug FROM businesses WHERE id = ?`).get(canonicalId) as { slug: string };
  const redirects: RedirectMapping[] = [];

  for (const dupId of duplicateIds) {
    const dup = db.prepare(`SELECT slug FROM businesses WHERE id = ?`).get(dupId) as { slug: string };

    if (dup.slug && canonical.slug && dup.slug !== canonical.slug) {
      redirects.push({
        old_slug: dup.slug,
        canonical_slug: canonical.slug,
        redirect_type: 'permanent',
        created_at: new Date().toISOString()
      });
    }
  }

  return redirects;
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--apply');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  MV BUSINESS REGISTRY - DUPLICATE RESOLUTION');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Mode: ${dryRun ? 'DRY RUN (preview only)' : 'APPLY CHANGES'}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  const db = new Database(DB_PATH);

  // PHASE 1: Identify duplicates
  const groups = identifyDuplicateGroups(db);

  if (groups.size === 0) {
    console.log('\n✓ No duplicate groups found. Database is clean.');
    db.close();
    return;
  }

  // PHASE 2-5: Process each group
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  PHASE 2-5: CLASSIFY, SELECT, MERGE, REDIRECT');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const resolvedGroups: DuplicateGroup[] = [];
  const allRedirects: RedirectMapping[] = [];
  const manualReviewNeeded: DuplicateGroup[] = [];
  let mergedCount = 0;
  let markedDuplicateCount = 0;

  for (const [normalizedName, records] of groups) {
    console.log(`\nProcessing: ${normalizedName}`);
    console.log('─'.repeat(50));

    // Classify
    const duplicateType = classifyDuplicateType(records);
    const analysis = analyzeGroup(records, duplicateType);

    console.log(`  Type: ${duplicateType}`);
    console.log(`  Recommendation: ${analysis.recommendation}`);

    // Select canonical
    const canonicalId = selectCanonicalRecord(records);
    const duplicateIds = records.filter(r => r.id !== canonicalId).map(r => r.id);

    console.log(`  Canonical: ID ${canonicalId}`);
    console.log(`  Duplicates: ${duplicateIds.join(', ')}`);

    const group: DuplicateGroup = {
      normalized_name: normalizedName,
      records,
      duplicate_type: duplicateType,
      canonical_id: canonicalId,
      merge_candidates: duplicateIds,
      analysis
    };

    if (analysis.recommendation === 'manual_review') {
      manualReviewNeeded.push(group);
      console.log(`  ⚠️  Flagged for manual review`);
      continue;
    }

    if (analysis.recommendation === 'keep_both') {
      console.log(`  ℹ️  Keeping both records (distinct businesses)`);
      resolvedGroups.push(group);
      continue;
    }

    // Merge data
    const mergeResult = mergeNonConflictingData(db, canonicalId, duplicateIds, dryRun);
    if (mergeResult.merged_fields.length > 0) {
      console.log(`  Merged: ${mergeResult.merged_fields.join(', ')}`);
      mergedCount += mergeResult.merged_fields.length;
    }

    // Create redirects
    const redirects = createRedirectMappings(db, canonicalId, duplicateIds);
    allRedirects.push(...redirects);
    if (redirects.length > 0) {
      console.log(`  Redirects: ${redirects.map(r => r.old_slug).join(', ')} → ${redirects[0].canonical_slug}`);
    }

    // Mark duplicates
    if (!dryRun) {
      for (const dupId of duplicateIds) {
        db.prepare(`
          UPDATE businesses
          SET is_duplicate = 1,
              duplicate_of_id = ?,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `).run(canonicalId, dupId);
        markedDuplicateCount++;
      }
      console.log(`  ✓ Marked ${duplicateIds.length} as duplicate`);
    } else {
      console.log(`  Would mark ${duplicateIds.length} as duplicate`);
    }

    resolvedGroups.push(group);
  }

  // Save redirects to file
  const redirectsPath = path.join(EXPORT_PATH, 'slug-redirects.json');
  if (!dryRun && allRedirects.length > 0) {
    fs.writeFileSync(redirectsPath, JSON.stringify(allRedirects, null, 2));
    console.log(`\nRedirects saved to: ${redirectsPath}`);
  }

  // Generate report
  const report: ResolutionReport = {
    timestamp: new Date().toISOString(),
    duplicate_groups_found: groups.size,
    records_merged: mergedCount,
    records_marked_duplicate: markedDuplicateCount,
    redirects_created: allRedirects.length,
    records_needing_manual_review: manualReviewNeeded.length,
    groups: resolvedGroups,
    redirects: allRedirects,
    manual_review_needed: manualReviewNeeded
  };

  const reportPath = path.join(EXPORT_PATH, 'duplicate-resolution-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  DUPLICATE RESOLUTION SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Duplicate groups found:      ${groups.size}`);
  console.log(`  Fields merged:               ${mergedCount}`);
  console.log(`  Records marked duplicate:    ${markedDuplicateCount}`);
  console.log(`  Redirects created:           ${allRedirects.length}`);
  console.log(`  Needs manual review:         ${manualReviewNeeded.length}`);
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\nReport saved to: ${reportPath}`);

  if (manualReviewNeeded.length > 0) {
    console.log('\n⚠️  RECORDS NEEDING MANUAL REVIEW:');
    for (const group of manualReviewNeeded) {
      console.log(`\n  ${group.normalized_name}:`);
      console.log(`    Type: ${group.duplicate_type}`);
      console.log(`    Reason: ${group.analysis.has_conflicting_data ? 'Conflicting data' : 'Location variation'}`);
      for (const r of group.records) {
        console.log(`    [${r.id}] ${r.business_name} (${r.town}) - ${r.full_address || 'no address'}`);
      }
    }
  }

  if (dryRun) {
    console.log('\n📋 This was a DRY RUN. Run with --apply to make changes.');
  }

  db.close();
}

main();
