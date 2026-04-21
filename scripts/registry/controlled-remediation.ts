#!/usr/bin/env npx tsx
/**
 * Controlled Remediation Pass
 *
 * This script executes a SAFE, TRUST-FIRST remediation pass:
 * 1. Only applies highest-confidence name corrections
 * 2. Re-validates each record BEFORE restoration
 * 3. Only restores records that pass ALL validation gates
 * 4. Keeps questionable records suppressed
 * 5. Generates prioritized manual-review table
 *
 * RULES:
 * - No auto-restoration of weak records
 * - All critical fields must be clean
 * - Address/email contamination = stay suppressed
 * - Trust > record count
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'mv_registry.db');
const EXPORTS_PATH = path.join(process.cwd(), 'data', 'exports');

// ============================================================================
// VALIDATION RULES (STRICT)
// ============================================================================

const VALID_TOWNS = [
  'Edgartown', 'Oak Bluffs', 'Vineyard Haven', 'West Tisbury', 'Chilmark', 'Aquinnah', 'Tisbury', 'Menemsha'
];

const PRIORITY_CATEGORIES = [
  'Lodging', 'Restaurant', 'Inn', 'Hotel', 'Shopping', 'Retail', 'Bar', 'Contractors', 'Professional Services'
];

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

interface Record {
  id: number;
  business_name: string;
  category: string;
  town: string;
  street_address: string;
  full_address: string;
  phone: string;
  email: string;
  website: string;
  domain: string;
  confidence_score: number;
  suppress_from_directory: number;
  validation_notes: string;
  primary_source: string;
}

interface CorrectionCandidate {
  id: number;
  currentName: string;
  suggestedName: string;
  domain: string;
  town: string;
  category: string;
  source: string;
  confidence: number;
  addressClean: boolean;
  emailClean: boolean;
  phoneClean: boolean;
  canRestore: boolean;
  blockingIssues: string[];
}

interface ManualReviewItem {
  record_id: number;
  current_name: string;
  suggested_name: string | null;
  domain: string | null;
  town: string;
  category: string;
  source: string;
  suppression_reason: string;
  fix_type: string;
  high_business_value: boolean;
  outreach_relevant: boolean;
  priority_rank: number;
}

// ============================================================================
// KNOWN MAPPINGS (VERIFIED CORRECTIONS)
// ============================================================================

const VERIFIED_CORRECTIONS: Record<number, { name: string; category?: string; address?: string }> = {
  // HIGH CONFIDENCE - Domain clearly matches business
  64: { name: 'Harbor View Hotel', category: 'Lodging' },
  119: { name: 'Winnetu Oceanside Resort', category: 'Lodging' },
  162: { name: 'Lookout Tavern', category: 'Restaurant' },
  297: { name: 'MV Glassworks', category: 'Shopping' },
  314: { name: 'Pathways Arts', category: 'Community' },
  383: { name: 'Dunmere House', category: 'Lodging' },
  385: { name: 'Edgar Hotel', category: 'Lodging' },
  395: { name: 'The Harborside Inn', category: 'Lodging' },
  427: { name: 'The Charlotte Inn', category: 'Lodging' },
  433: { name: 'Lark Hotels', category: 'Lodging' },
  439: { name: 'Morgan Hotel', category: 'Lodging' },
  551: { name: 'Lazy Frog', category: 'Shopping' },
  669: { name: 'The Great Put On', category: 'Shopping' },

  // RESTAURANTS - Domain clearly supports
  43: { name: 'Chilmark Tavern', category: 'Restaurant' },
  62: { name: 'Behind the Bookstore', category: 'Restaurant' },
  81: { name: 'Edgartown Diner', category: 'Restaurant' },
  85: { name: 'Edgartown Pizza', category: 'Restaurant' },

  // LODGING - Name extraction from domain
  377: { name: 'Ashley Inn', category: 'Lodging' },
  397: { name: 'Hob Knob', category: 'Lodging' },
  405: { name: "Lambert's Cove Inn", category: 'Lodging' },

  // OTHER VERIFIABLE
  200: { name: 'Delicious MV', category: 'Restaurant' },  // Bakery
  249: { name: 'Vineyard Grocer', category: 'Shopping' },
  300: { name: 'MV Museum', category: 'Community' },
  310: { name: 'MV Camp Meeting Association', category: 'Community' },
  408: { name: 'Camp MV', category: 'Recreation' },
  640: { name: 'The Green Room', category: 'Shopping' },
  544: { name: "King's Barber Shop", category: 'Health & Wellness' },
  507: { name: 'East Chop Sleep Shop', category: 'Shopping' },
  567: { name: 'MV Shipyard', category: 'Professional Services' },
};

// Records to permanently suppress (not real businesses or defunct)
const PERMANENT_SUPPRESS = [
  34,   // "Facebook" - social media link, not a business
  328,  // "Instagram" - social media link, not a business
  591,  // "Phillips Hardware Closed" - explicitly closed
  646,  // Government site, not a business
];

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

function isEmailClean(email: string | null): boolean {
  if (!email || email.trim() === '') return true; // No email is fine
  const clean = email.trim();
  // Check for contamination
  if (/facebook|instagram|twitter|linkedin|social|connect/i.test(clean)) return false;
  if (/^\d{3}[-.]?\d{3}/.test(clean)) return false; // Phone number in email
  if (/\d{3}[-.]?\d{4}[a-z]/i.test(clean)) return false; // Phone merged with text
  // Check format
  return EMAIL_REGEX.test(clean);
}

function isAddressClean(address: string | null): boolean {
  if (!address || address.trim() === '') return true; // No address is acceptable
  const clean = address.trim();
  // Check for contamination
  if (/^com/i.test(clean)) return false;
  if (/instagram|facebook|twitter|linkedin|youtube/i.test(clean)) return false;
  if (/follow us|contact us/i.test(clean)) return false;
  if (/\bintro\b|\bofferings\b/i.test(clean)) return false;
  if (/behindthe|image/i.test(clean)) return false;
  if (/\n{3,}/.test(clean)) return false; // Excessive newlines = garbage
  if (clean.length > 200) return false; // Too long = garbage
  return true;
}

function isPhoneClean(phone: string | null): boolean {
  if (!phone || phone.trim() === '') return true;
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 || (digits.length === 11 && digits.startsWith('1'));
}

function isNameValid(name: string): boolean {
  if (!name || name.length < 3) return false;
  if (/\.com$/i.test(name)) return false;
  if (/^(a glimpse|experience|discover|find your|entering|private|luxury|iconic|waterfront|organic)/i.test(name)) return false;
  if (/redirecting|home|menu|welcome|intro/i.test(name)) return false;
  if (/\.\./i.test(name)) return false;
  return true;
}

function isTownValid(town: string | null): boolean {
  if (!town) return false;
  return VALID_TOWNS.some(t => town.toLowerCase().includes(t.toLowerCase()));
}

function extractSuppressionReason(notes: string | null): string {
  if (!notes) return 'unknown';
  if (notes.includes('entity_mismatch') || notes.includes('descriptive_phrase')) {
    return 'Descriptive phrase used as name';
  }
  if (notes.includes('url_style_name')) return 'Domain concatenation as name';
  if (notes.includes('invalid_name_pattern')) return 'Marketing text as name';
  if (notes.includes('.com')) return 'URL used as name';
  if (notes.includes('address')) return 'Contaminated address';
  if (notes.includes('email')) return 'Contaminated email';
  return 'Manual review required';
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  CONTROLLED REMEDIATION PASS');
  console.log('  Trust-First • Validate-Before-Restore • Quality > Quantity');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const db = new Database(DB_PATH);

  // Get all suppressed records
  const suppressed = db.prepare(`
    SELECT * FROM businesses
    WHERE suppress_from_directory = 1 AND is_duplicate = 0
  `).all() as Record[];

  console.log(`Total suppressed records: ${suppressed.length}\n`);

  const corrected: { id: number; oldName: string; newName: string }[] = [];
  const restored: { id: number; name: string }[] = [];
  const staysSuppressed: { id: number; name: string; reason: string }[] = [];
  const permanentlyRemoved: { id: number; name: string }[] = [];

  // Prepare statements
  const updateRecord = db.prepare(`
    UPDATE businesses SET
      business_name = ?,
      normalized_name = ?,
      category = COALESCE(?, category),
      remediation_status = 'corrected',
      corrected_by = 'controlled_remediation',
      corrected_at = ?
    WHERE id = ?
  `);

  const restoreRecord = db.prepare(`
    UPDATE businesses SET
      suppress_from_directory = 0,
      publish_tier = 'B',
      remediation_status = 'corrected'
    WHERE id = ?
  `);

  const markRemoved = db.prepare(`
    UPDATE businesses SET
      remediation_status = 'removed',
      remediation_notes = ?
    WHERE id = ?
  `);

  // Step 1: Mark permanent suppressions
  console.log('─────────────────────────────────────────────────────────────────');
  console.log('  STEP 1: MARKING PERMANENT SUPPRESSIONS');
  console.log('─────────────────────────────────────────────────────────────────\n');

  for (const id of PERMANENT_SUPPRESS) {
    const record = suppressed.find(r => r.id === id);
    if (record) {
      markRemoved.run('Not a real business or defunct', id);
      permanentlyRemoved.push({ id, name: record.business_name });
      console.log(`  ❌ ID ${id}: "${record.business_name}" - Permanently suppressed`);
    }
  }

  // Step 2: Apply verified corrections
  console.log('\n─────────────────────────────────────────────────────────────────');
  console.log('  STEP 2: APPLYING VERIFIED CORRECTIONS');
  console.log('─────────────────────────────────────────────────────────────────\n');

  for (const [idStr, correction] of Object.entries(VERIFIED_CORRECTIONS)) {
    const id = parseInt(idStr, 10);
    const record = suppressed.find(r => r.id === id);
    if (!record) continue;

    // Skip if already removed
    if (PERMANENT_SUPPRESS.includes(id)) continue;

    const oldName = record.business_name;
    const newName = correction.name;

    // Apply correction
    updateRecord.run(
      newName,
      newName.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim(),
      correction.category || null,
      new Date().toISOString(),
      id
    );

    corrected.push({ id, oldName, newName });
    console.log(`  ✏️  ID ${id}: "${oldName.slice(0, 30)}" → "${newName}"`);
  }

  // Step 3: Validate and attempt restoration for corrected records
  console.log('\n─────────────────────────────────────────────────────────────────');
  console.log('  STEP 3: VALIDATION BEFORE RESTORATION');
  console.log('─────────────────────────────────────────────────────────────────\n');

  // Re-fetch corrected records
  const correctedIds = corrected.map(c => c.id);
  const toValidate = db.prepare(`
    SELECT * FROM businesses WHERE id IN (${correctedIds.map(() => '?').join(',')})
  `).all(...correctedIds) as Record[];

  for (const record of toValidate) {
    const issues: string[] = [];

    // Gate 1: Name must be valid
    if (!isNameValid(record.business_name)) {
      issues.push('Name still invalid');
    }

    // Gate 2: Address must be clean
    if (!isAddressClean(record.full_address)) {
      issues.push('Address contaminated');
    }

    // Gate 3: Email must be clean
    if (!isEmailClean(record.email)) {
      issues.push('Email contaminated');
    }

    // Gate 4: Phone must be clean
    if (!isPhoneClean(record.phone)) {
      issues.push('Phone malformed');
    }

    // Gate 5: Town must be valid
    if (!isTownValid(record.town)) {
      issues.push('Town not recognized');
    }

    if (issues.length === 0) {
      // All gates passed - RESTORE
      restoreRecord.run(record.id);
      restored.push({ id: record.id, name: record.business_name });
      console.log(`  ✅ ID ${record.id}: "${record.business_name}" - RESTORED`);
    } else {
      // Failed validation - stay suppressed
      staysSuppressed.push({
        id: record.id,
        name: record.business_name,
        reason: issues.join(', ')
      });
      console.log(`  ⚠️  ID ${record.id}: "${record.business_name}" - STAYS SUPPRESSED`);
      console.log(`      Issues: ${issues.join(', ')}`);
    }
  }

  // Step 4: Build manual review table for remaining suppressed
  console.log('\n─────────────────────────────────────────────────────────────────');
  console.log('  STEP 4: GENERATING MANUAL REVIEW TABLE');
  console.log('─────────────────────────────────────────────────────────────────\n');

  const remaining = db.prepare(`
    SELECT * FROM businesses
    WHERE suppress_from_directory = 1
      AND is_duplicate = 0
      AND remediation_status != 'removed'
      AND id NOT IN (${restored.map(() => '?').join(',') || '0'})
  `).all(...restored.map(r => r.id)) as Record[];

  const manualReview: ManualReviewItem[] = [];

  for (const record of remaining) {
    const isPriorityCategory = PRIORITY_CATEGORIES.some(c =>
      record.category?.toLowerCase().includes(c.toLowerCase())
    );
    const hasWebsite = !!record.website && !record.website.includes('facebook.com') && !record.website.includes('instagram.com');
    const hasPhone = !!record.phone && record.phone.length >= 10;
    const isLodging = /lodging|inn|hotel/i.test(record.category || '');
    const isRestaurant = /restaurant|bar|cafe/i.test(record.category || '');

    // Calculate priority
    let priority = 100;
    if (isLodging) priority -= 30;
    if (isRestaurant) priority -= 25;
    if (isPriorityCategory) priority -= 20;
    if (hasWebsite) priority -= 15;
    if (hasPhone) priority -= 10;

    // Suggest name from domain
    let suggestedName: string | null = null;
    if (record.domain) {
      const base = record.domain.replace(/^www\./, '').replace(/\.[^.]+$/, '').replace(/mv$/, '');
      // Simple capitalization
      suggestedName = base.charAt(0).toUpperCase() + base.slice(1);
    }

    manualReview.push({
      record_id: record.id,
      current_name: record.business_name,
      suggested_name: suggestedName,
      domain: record.domain,
      town: record.town,
      category: record.category,
      source: record.primary_source || 'unknown',
      suppression_reason: extractSuppressionReason(record.validation_notes),
      fix_type: record.validation_notes?.includes('name') ? 'name_correction' :
                record.validation_notes?.includes('address') ? 'address_correction' : 'manual_review',
      high_business_value: isLodging || isRestaurant || isPriorityCategory,
      outreach_relevant: hasWebsite && hasPhone,
      priority_rank: priority
    });
  }

  // Sort by priority (lower = higher priority)
  manualReview.sort((a, b) => a.priority_rank - b.priority_rank);

  // ============================================================================
  // OUTPUT RESULTS
  // ============================================================================

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  REMEDIATION RESULTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log(`  Records corrected:           ${corrected.length}`);
  console.log(`  Records RESTORED:            ${restored.length}`);
  console.log(`  Stays suppressed (issues):   ${staysSuppressed.length}`);
  console.log(`  Permanently removed:         ${permanentlyRemoved.length}`);
  console.log(`  Awaiting manual review:      ${manualReview.length}`);

  // Print restored records
  console.log('\n  ═══ RESTORED RECORDS ═══\n');
  for (const r of restored) {
    console.log(`    ✅ ID ${r.id}: ${r.name}`);
  }

  // Print suppressed with issues
  if (staysSuppressed.length > 0) {
    console.log('\n  ═══ CORRECTED BUT NOT RESTORED (validation issues) ═══\n');
    for (const r of staysSuppressed) {
      console.log(`    ⚠️  ID ${r.id}: ${r.name}`);
      console.log(`        Reason: ${r.reason}`);
    }
  }

  // Print removed
  if (permanentlyRemoved.length > 0) {
    console.log('\n  ═══ PERMANENTLY REMOVED ═══\n');
    for (const r of permanentlyRemoved) {
      console.log(`    ❌ ID ${r.id}: ${r.name}`);
    }
  }

  // Save manual review table
  const reviewPath = path.join(EXPORTS_PATH, 'manual-review-queue.json');
  fs.writeFileSync(reviewPath, JSON.stringify(manualReview, null, 2));

  // Print top priority items
  console.log('\n  ═══ TOP PRIORITY MANUAL REVIEW (first 25) ═══\n');
  console.log('  ID    | Current Name                    | Suggested         | Category        | Town           | Value | Outreach');
  console.log('  ────────────────────────────────────────────────────────────────────────────────────────────────────────────────────');

  for (const item of manualReview.slice(0, 25)) {
    const currentName = item.current_name.slice(0, 30).padEnd(31);
    const suggested = (item.suggested_name || 'N/A').slice(0, 17).padEnd(17);
    const category = (item.category || 'N/A').slice(0, 15).padEnd(15);
    const town = (item.town || 'N/A').slice(0, 14).padEnd(14);
    const value = item.high_business_value ? '✓' : ' ';
    const outreach = item.outreach_relevant ? '✓' : ' ';

    console.log(`  ${String(item.record_id).padEnd(5)} | ${currentName} | ${suggested} | ${category} | ${town} | ${value.padEnd(5)} | ${outreach}`);
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  Manual review queue saved to: ${reviewPath}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Final stats
  const finalPublic = db.prepare(`
    SELECT COUNT(*) as count FROM businesses
    WHERE suppress_from_directory = 0 AND is_duplicate = 0
  `).get() as { count: number };

  console.log(`  FINAL PUBLIC DIRECTORY COUNT: ${finalPublic.count}`);

  db.close();
}

main().catch(console.error);
