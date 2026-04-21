#!/usr/bin/env npx tsx
/**
 * Phase 4 - Manual Remediation Workflow
 *
 * This script:
 * 1. Generates a structured remediation queue for suppressed records
 * 2. Provides correction suggestions based on domain/metadata analysis
 * 3. Outputs remediation-ready JSON for human review
 * 4. Adds remediation state tracking to the database
 * 5. Implements safe reintroduction logic with validation gates
 *
 * IMPORTANT: This is a human-in-the-loop process.
 * No auto-restoration of suppressed records.
 *
 * Usage:
 *   npx tsx scripts/registry/phase4-remediation.ts              # Generate queue
 *   npx tsx scripts/registry/phase4-remediation.ts --migrate    # Add remediation columns
 *   npx tsx scripts/registry/phase4-remediation.ts --apply ID   # Apply correction for ID
 *   npx tsx scripts/registry/phase4-remediation.ts --restore ID # Attempt to restore ID
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const args = process.argv.slice(2);
const DB_PATH = path.join(process.cwd(), 'data', 'mv_registry.db');
const EXPORTS_PATH = path.join(process.cwd(), 'data', 'exports');

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

type FixType =
  | 'name_correction'
  | 'category_correction'
  | 'address_correction'
  | 'duplicate_merge'
  | 'remove_record'
  | 'manual_review_required';

type RemediationStatus =
  | 'pending'
  | 'reviewed'
  | 'corrected'
  | 'rejected'
  | 'removed';

interface SuppressedRecord {
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
  domain: string;
  short_description: string;
  confidence_score: number;
  publish_tier: string;
  suppress_from_directory: number;
  validation_notes: string;
  primary_source: string;
  homepage_title: string;
  remediation_status: string | null;
  corrected_by: string | null;
  corrected_at: string | null;
  remediation_notes: string | null;
}

interface RemediationQueueItem {
  record_id: number;
  extracted_name: string;
  domain: string;
  source: string;
  town: string;
  category: string;
  suppression_reason: string;
  suggested_correct_name: string | null;
  suggested_fix_type: FixType;
  suggestions: {
    business_name: string | null;
    category: string | null;
    address: string | null;
    phone: string | null;
    website: string | null;
  };
  confidence: number;
  action_required: string;
}

interface DashboardData {
  total_suppressed: number;
  recoverable_records: number;
  records_fixed: number;
  records_removed: number;
  records_pending: number;
  records_reviewed: number;
  records_rejected: number;
  by_fix_type: Record<FixType, number>;
  by_source: Record<string, number>;
}

// ============================================================================
// NAME SUGGESTION FROM DOMAIN
// ============================================================================

/**
 * Extract a proper business name from domain
 */
function suggestNameFromDomain(domain: string | null): string | null {
  if (!domain) return null;

  let name = domain
    .toLowerCase()
    .replace(/^www\./, '')
    .replace(/\.(com|org|net|io|co|mv|us)$/, '');

  // Handle common MV suffixes
  name = name.replace(/mv$/, '');

  // Known domain -> name mappings for MV businesses
  const knownMappings: Record<string, string> = {
    'thecharlotteinn': 'The Charlotte Inn',
    'harborviewhotel': 'Harbor View Hotel',
    'mvglassworks': 'MV Glassworks',
    'lookoutmv': 'Lookout Tavern',
    'deliciousmv': 'Delicious MV',
    'dunmerehouse': 'Dunmere House',
    'lazyfrogmv': 'Lazy Frog',
    'thegreatputonmv': 'The Great Put On',
    'pathwaysmv': 'Pathways Arts',
    'theharborsideinn': 'The Harborside Inn',
    'larkhotels': 'Lark Hotels',
    'mvsurfside': 'MV Surfside Hotel',
    'atlanticmv': 'Atlantic',
    'giosmv': "Gio's",
    'mvseafood': 'The Net Result',
    'aaonmv': 'AA on MV',
    'ymcamv': 'YMCA of Martha\'s Vineyard',
    'windsupmv': 'Wind\'s Up',
    'carrollsmv': "Carroll's",
    'mvtileco': 'MV Tile Company',
    'chilmarktavern': 'Chilmark Tavern',
    'btbmv': 'Behind the Bookstore',
    'edgartowndiner': 'Edgartown Diner',
    'edgartownpizza': 'Edgartown Pizza',
    'mvcma': 'Martha\'s Vineyard Camp Meeting Association',
    'campmv': 'Camp MV',
    'aquilamv': 'Aquila',
  };

  // Check known mappings
  const baseDomain = domain.replace(/^www\./, '').replace(/\.[^.]+$/, '');
  if (knownMappings[baseDomain]) {
    return knownMappings[baseDomain];
  }

  // Try to parse the domain name
  // Insert spaces at word boundaries
  let parsed = name
    // Handle "the" prefix
    .replace(/^the/, 'the ')
    // Common business suffixes
    .replace(/(inn|hotel|house|cafe|bar|shop|store|bakery|market|gallery|studio|yoga|arts|tavern|diner|pizza)$/i, ' $1')
    // CamelCase
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .trim();

  // Title case
  parsed = parsed
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  return parsed.length > 2 ? parsed : null;
}

/**
 * Classify the suppression reason and suggest fix type
 */
function classifySuppressionReason(notes: string | null): { reason: string; fixType: FixType } {
  if (!notes) {
    return { reason: 'unknown', fixType: 'manual_review_required' };
  }

  const notesLower = notes.toLowerCase();

  // Name issues
  if (notesLower.includes('entity_mismatch') || notesLower.includes('descriptive_phrase')) {
    return { reason: 'Extracted name is a descriptive phrase, not business name', fixType: 'name_correction' };
  }
  if (notesLower.includes('url_style_name')) {
    return { reason: 'Name looks like concatenated domain', fixType: 'name_correction' };
  }
  if (notesLower.includes('invalid_name_pattern')) {
    return { reason: 'Name matches invalid pattern (marketing text)', fixType: 'name_correction' };
  }
  if (notesLower.includes('.com')) {
    return { reason: 'Name ends with .com (URL used as name)', fixType: 'name_correction' };
  }
  if (notesLower.includes('glimpse') || notesLower.includes('experience')) {
    return { reason: 'Name is a decorative heading', fixType: 'name_correction' };
  }

  // Category issues
  if (notesLower.includes('category') || notesLower.includes('martha\'s vineyard hotels')) {
    return { reason: 'Generic category page, not a business', fixType: 'remove_record' };
  }

  // Duplicate issues
  if (notesLower.includes('duplicate')) {
    return { reason: 'Duplicate of another record', fixType: 'duplicate_merge' };
  }

  // Address issues
  if (notesLower.includes('address')) {
    return { reason: 'Address contains invalid data', fixType: 'address_correction' };
  }

  // Default
  return { reason: 'Requires manual review', fixType: 'manual_review_required' };
}

/**
 * Generate action description
 */
function generateActionRequired(fixType: FixType, suggested: string | null): string {
  switch (fixType) {
    case 'name_correction':
      return suggested
        ? `Verify and apply suggested name: "${suggested}"`
        : 'Manually identify correct business name from website';
    case 'category_correction':
      return 'Review and assign correct category';
    case 'address_correction':
      return 'Extract clean address from website';
    case 'duplicate_merge':
      return 'Identify primary record and merge data';
    case 'remove_record':
      return 'Confirm this is not a real business and remove';
    case 'manual_review_required':
    default:
      return 'Manually review record and determine appropriate action';
  }
}

// ============================================================================
// DATABASE MIGRATION
// ============================================================================

function migrateDatabase(db: Database.Database): void {
  console.log('Adding remediation columns to database...\n');

  const columns = [
    { name: 'remediation_status', type: "TEXT DEFAULT 'pending'" },
    { name: 'corrected_by', type: 'TEXT' },
    { name: 'corrected_at', type: 'TEXT' },
    { name: 'remediation_notes', type: 'TEXT' },
    { name: 'suggested_name', type: 'TEXT' },
    { name: 'suggested_fix_type', type: 'TEXT' },
  ];

  for (const col of columns) {
    try {
      db.exec(`ALTER TABLE businesses ADD COLUMN ${col.name} ${col.type}`);
      console.log(`  Added column: ${col.name}`);
    } catch (e: unknown) {
      const error = e as Error;
      if (error.message.includes('duplicate column')) {
        console.log(`  Column exists: ${col.name}`);
      } else {
        throw e;
      }
    }
  }

  // Set initial remediation_status for suppressed records
  const result = db.prepare(`
    UPDATE businesses
    SET remediation_status = 'pending'
    WHERE suppress_from_directory = 1
      AND remediation_status IS NULL
  `).run();

  console.log(`\n  Set ${result.changes} suppressed records to 'pending' status`);
}

// ============================================================================
// GENERATE REMEDIATION QUEUE
// ============================================================================

function generateRemediationQueue(db: Database.Database): RemediationQueueItem[] {
  const suppressed = db.prepare(`
    SELECT
      id, business_name, normalized_name, category, town,
      street_address, full_address, phone, email, website, domain,
      short_description, confidence_score, publish_tier,
      suppress_from_directory, validation_notes, primary_source,
      homepage_title, remediation_status, corrected_by, corrected_at,
      remediation_notes
    FROM businesses
    WHERE suppress_from_directory = 1
      AND is_duplicate = 0
    ORDER BY primary_source, id
  `).all() as SuppressedRecord[];

  const queue: RemediationQueueItem[] = [];

  for (const record of suppressed) {
    const { reason, fixType } = classifySuppressionReason(record.validation_notes);
    const suggestedName = suggestNameFromDomain(record.domain);

    // Calculate confidence in suggestion
    let confidence = 0;
    if (suggestedName) {
      // Higher confidence if domain is clean
      if (record.domain && !record.domain.includes('square') && !record.domain.includes('wheree')) {
        confidence = 70;
      } else {
        confidence = 40;
      }
      // Lower confidence if we're guessing
      if (fixType === 'manual_review_required') {
        confidence = Math.max(20, confidence - 30);
      }
    }

    queue.push({
      record_id: record.id,
      extracted_name: record.business_name,
      domain: record.domain,
      source: record.primary_source || 'unknown',
      town: record.town,
      category: record.category,
      suppression_reason: reason,
      suggested_correct_name: suggestedName,
      suggested_fix_type: fixType,
      suggestions: {
        business_name: suggestedName,
        category: record.category || null,
        address: record.full_address || null,
        phone: record.phone || null,
        website: record.website || null,
      },
      confidence,
      action_required: generateActionRequired(fixType, suggestedName),
    });
  }

  return queue;
}

// ============================================================================
// VALIDATION GATES FOR REINTRODUCTION
// ============================================================================

const VALID_CATEGORIES = [
  'Restaurants',
  'Lodging',
  'Shopping',
  'Health & Wellness',
  'Contractors',
  'Professional Services',
  'Community',
  'Recreation'
];

const VALID_TOWNS = [
  'Edgartown',
  'Oak Bluffs',
  'Vineyard Haven',
  'West Tisbury',
  'Chilmark',
  'Aquinnah'
];

interface ValidationGateResult {
  passed: boolean;
  failures: string[];
  warnings: string[];
}

function validateForReintroduction(record: SuppressedRecord, suggestedName?: string): ValidationGateResult {
  const failures: string[] = [];
  const warnings: string[] = [];

  const name = suggestedName || record.business_name;

  // Gate 1: Name must pass validation
  if (!name || name.trim().length < 3) {
    failures.push('Name is missing or too short');
  }
  if (/\.com$/i.test(name)) {
    failures.push('Name ends with .com');
  }
  if (/^(a glimpse|experience|discover|find your|entering|private|luxury|iconic|waterfront|organic)/i.test(name)) {
    failures.push('Name is a descriptive phrase');
  }
  if (/^[a-z]/.test(name)) {
    warnings.push('Name starts with lowercase');
  }

  // Gate 2: Domain must match identity (if we have one)
  if (record.domain && name) {
    const domainBase = record.domain.replace(/^www\./, '').replace(/\.[^.]+$/, '').toLowerCase();
    const nameLower = name.toLowerCase().replace(/[^a-z0-9]/g, '');

    // Check for some overlap
    const hasOverlap = domainBase.includes(nameLower.slice(0, 4)) ||
                       nameLower.includes(domainBase.slice(0, 4));

    if (!hasOverlap && domainBase.length > 4) {
      warnings.push(`Name "${name}" may not match domain "${record.domain}"`);
    }
  }

  // Gate 3: Category must be valid
  if (record.category && !VALID_CATEGORIES.includes(record.category)) {
    warnings.push(`Category "${record.category}" is not in standard list`);
  }

  // Gate 4: Location must be valid
  if (record.town && !VALID_TOWNS.includes(record.town)) {
    warnings.push(`Town "${record.town}" is not a standard MV town`);
  }

  // Gate 5: Confidence threshold
  if (record.confidence_score < 50) {
    warnings.push(`Low confidence score: ${record.confidence_score}`);
  }

  return {
    passed: failures.length === 0,
    failures,
    warnings
  };
}

// ============================================================================
// APPLY CORRECTION
// ============================================================================

function applyCorrection(
  db: Database.Database,
  recordId: number,
  corrections: Partial<{
    business_name: string;
    category: string;
    town: string;
    full_address: string;
    phone: string;
    email: string;
  }>,
  correctedBy: string = 'manual'
): { success: boolean; message: string } {

  const record = db.prepare(`
    SELECT * FROM businesses WHERE id = ?
  `).get(recordId) as SuppressedRecord | undefined;

  if (!record) {
    return { success: false, message: `Record ${recordId} not found` };
  }

  if (record.suppress_from_directory !== 1) {
    return { success: false, message: `Record ${recordId} is not suppressed` };
  }

  // Build update query
  const updates: string[] = [];
  const values: (string | number)[] = [];

  if (corrections.business_name) {
    updates.push('business_name = ?');
    values.push(corrections.business_name);
    updates.push('normalized_name = ?');
    values.push(corrections.business_name.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim());
  }
  if (corrections.category) {
    updates.push('category = ?');
    values.push(corrections.category);
  }
  if (corrections.town) {
    updates.push('town = ?');
    values.push(corrections.town);
  }
  if (corrections.full_address) {
    updates.push('full_address = ?');
    values.push(corrections.full_address);
  }
  if (corrections.phone) {
    updates.push('phone = ?');
    values.push(corrections.phone);
  }
  if (corrections.email) {
    updates.push('email = ?');
    values.push(corrections.email);
  }

  // Update remediation status
  updates.push('remediation_status = ?');
  values.push('corrected');
  updates.push('corrected_by = ?');
  values.push(correctedBy);
  updates.push('corrected_at = ?');
  values.push(new Date().toISOString());

  values.push(recordId);

  const sql = `UPDATE businesses SET ${updates.join(', ')} WHERE id = ?`;

  try {
    db.prepare(sql).run(...values);
    return { success: true, message: `Record ${recordId} corrected successfully` };
  } catch (e: unknown) {
    const error = e as Error;
    return { success: false, message: `Failed to update: ${error.message}` };
  }
}

// ============================================================================
// ATTEMPT RESTORATION
// ============================================================================

function attemptRestoration(
  db: Database.Database,
  recordId: number
): { success: boolean; message: string; validation: ValidationGateResult } {

  const record = db.prepare(`
    SELECT * FROM businesses WHERE id = ?
  `).get(recordId) as SuppressedRecord | undefined;

  if (!record) {
    return {
      success: false,
      message: `Record ${recordId} not found`,
      validation: { passed: false, failures: ['Record not found'], warnings: [] }
    };
  }

  if (record.suppress_from_directory !== 1) {
    return {
      success: false,
      message: `Record ${recordId} is not suppressed`,
      validation: { passed: false, failures: ['Not suppressed'], warnings: [] }
    };
  }

  // Run validation gates
  const validation = validateForReintroduction(record);

  if (!validation.passed) {
    return {
      success: false,
      message: `Record ${recordId} failed validation: ${validation.failures.join(', ')}`,
      validation
    };
  }

  // All gates passed - restore the record
  db.prepare(`
    UPDATE businesses SET
      suppress_from_directory = 0,
      publish_tier = 'B',
      remediation_status = 'corrected',
      corrected_at = ?
    WHERE id = ?
  `).run(new Date().toISOString(), recordId);

  return {
    success: true,
    message: `Record ${recordId} restored successfully`,
    validation
  };
}

// ============================================================================
// GENERATE DASHBOARD DATA
// ============================================================================

function generateDashboardData(db: Database.Database): DashboardData {
  const stats = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN remediation_status = 'pending' OR remediation_status IS NULL THEN 1 ELSE 0 END) as pending,
      SUM(CASE WHEN remediation_status = 'reviewed' THEN 1 ELSE 0 END) as reviewed,
      SUM(CASE WHEN remediation_status = 'corrected' THEN 1 ELSE 0 END) as corrected,
      SUM(CASE WHEN remediation_status = 'rejected' THEN 1 ELSE 0 END) as rejected,
      SUM(CASE WHEN remediation_status = 'removed' THEN 1 ELSE 0 END) as removed
    FROM businesses
    WHERE suppress_from_directory = 1 AND is_duplicate = 0
  `).get() as {
    total: number;
    pending: number;
    reviewed: number;
    corrected: number;
    rejected: number;
    removed: number;
  };

  const bySources = db.prepare(`
    SELECT primary_source, COUNT(*) as count
    FROM businesses
    WHERE suppress_from_directory = 1 AND is_duplicate = 0
    GROUP BY primary_source
  `).all() as { primary_source: string; count: number }[];

  const bySource: Record<string, number> = {};
  for (const row of bySources) {
    bySource[row.primary_source || 'unknown'] = row.count;
  }

  // Estimate fix types based on validation notes
  const records = db.prepare(`
    SELECT validation_notes FROM businesses
    WHERE suppress_from_directory = 1 AND is_duplicate = 0
  `).all() as { validation_notes: string }[];

  const byFixType: Record<FixType, number> = {
    name_correction: 0,
    category_correction: 0,
    address_correction: 0,
    duplicate_merge: 0,
    remove_record: 0,
    manual_review_required: 0,
  };

  for (const record of records) {
    const { fixType } = classifySuppressionReason(record.validation_notes);
    byFixType[fixType]++;
  }

  // Calculate recoverable (anything not marked for removal)
  const recoverable = stats.total - byFixType.remove_record;

  return {
    total_suppressed: stats.total,
    recoverable_records: recoverable,
    records_fixed: stats.corrected,
    records_removed: stats.removed,
    records_pending: stats.pending,
    records_reviewed: stats.reviewed,
    records_rejected: stats.rejected,
    by_fix_type: byFixType,
    by_source: bySource,
  };
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  MV BUSINESS REGISTRY - PHASE 4 REMEDIATION WORKFLOW');
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (!fs.existsSync(DB_PATH)) {
    console.error(`Database not found at ${DB_PATH}`);
    process.exit(1);
  }

  const db = new Database(DB_PATH);

  // Handle migration
  if (args.includes('--migrate')) {
    migrateDatabase(db);
    db.close();
    console.log('\nMigration complete.');
    return;
  }

  // Handle single record correction
  const applyIndex = args.indexOf('--apply');
  if (applyIndex !== -1 && args[applyIndex + 1]) {
    const recordId = parseInt(args[applyIndex + 1], 10);
    // For now, apply suggested name from queue
    const queue = generateRemediationQueue(db);
    const item = queue.find(q => q.record_id === recordId);

    if (!item) {
      console.error(`Record ${recordId} not in remediation queue`);
      db.close();
      return;
    }

    if (!item.suggested_correct_name) {
      console.error(`No suggested name for record ${recordId}`);
      db.close();
      return;
    }

    const result = applyCorrection(db, recordId, {
      business_name: item.suggested_correct_name
    });

    console.log(result.message);
    db.close();
    return;
  }

  // Handle restoration attempt
  const restoreIndex = args.indexOf('--restore');
  if (restoreIndex !== -1 && args[restoreIndex + 1]) {
    const recordId = parseInt(args[restoreIndex + 1], 10);
    const result = attemptRestoration(db, recordId);

    console.log(result.message);
    if (result.validation.warnings.length > 0) {
      console.log('  Warnings:', result.validation.warnings.join(', '));
    }
    db.close();
    return;
  }

  // Default: Generate remediation queue and dashboard
  console.log('Generating remediation queue...\n');

  // Ensure migration has been run
  try {
    db.prepare('SELECT remediation_status FROM businesses LIMIT 1').get();
  } catch {
    console.log('Running migration first...\n');
    migrateDatabase(db);
  }

  const queue = generateRemediationQueue(db);
  const dashboard = generateDashboardData(db);

  // Print dashboard
  console.log('─────────────────────────────────────────────────────────────────');
  console.log('  REMEDIATION DASHBOARD');
  console.log('─────────────────────────────────────────────────────────────────');
  console.log(`  Total suppressed:       ${dashboard.total_suppressed}`);
  console.log(`  Recoverable:            ${dashboard.recoverable_records}`);
  console.log(`  Pending review:         ${dashboard.records_pending}`);
  console.log(`  Reviewed:               ${dashboard.records_reviewed}`);
  console.log(`  Fixed/Restored:         ${dashboard.records_fixed}`);
  console.log(`  Rejected:               ${dashboard.records_rejected}`);
  console.log(`  Removed:                ${dashboard.records_removed}`);
  console.log('');
  console.log('  BY FIX TYPE:');
  for (const [type, count] of Object.entries(dashboard.by_fix_type)) {
    if (count > 0) {
      console.log(`    ${type.padEnd(25)} ${count}`);
    }
  }
  console.log('');
  console.log('  BY SOURCE:');
  for (const [source, count] of Object.entries(dashboard.by_source)) {
    console.log(`    ${(source || 'unknown').padEnd(25)} ${count}`);
  }
  console.log('─────────────────────────────────────────────────────────────────\n');

  // Print queue summary by fix type
  console.log('  REMEDIATION QUEUE BY TYPE:\n');

  const byType: Record<FixType, RemediationQueueItem[]> = {
    name_correction: [],
    category_correction: [],
    address_correction: [],
    duplicate_merge: [],
    remove_record: [],
    manual_review_required: [],
  };

  for (const item of queue) {
    byType[item.suggested_fix_type].push(item);
  }

  for (const [type, items] of Object.entries(byType)) {
    if (items.length === 0) continue;

    console.log(`  ═══ ${type.toUpperCase()} (${items.length} records) ═══\n`);

    for (const item of items.slice(0, 10)) {
      console.log(`    ID ${item.record_id}: "${item.extracted_name.slice(0, 35)}"`);
      if (item.suggested_correct_name) {
        console.log(`      → Suggested: "${item.suggested_correct_name}"`);
      }
      console.log(`      Domain: ${item.domain || 'N/A'}`);
      console.log(`      Action: ${item.action_required}`);
      console.log('');
    }

    if (items.length > 10) {
      console.log(`    ... and ${items.length - 10} more\n`);
    }
  }

  // Save queue to JSON
  const queuePath = path.join(EXPORTS_PATH, 'remediation-queue.json');
  const dashboardPath = path.join(EXPORTS_PATH, 'remediation-dashboard.json');

  fs.writeFileSync(queuePath, JSON.stringify(queue, null, 2));
  fs.writeFileSync(dashboardPath, JSON.stringify(dashboard, null, 2));

  console.log('─────────────────────────────────────────────────────────────────');
  console.log('  OUTPUT FILES');
  console.log('─────────────────────────────────────────────────────────────────');
  console.log(`  Queue:     ${queuePath}`);
  console.log(`  Dashboard: ${dashboardPath}`);
  console.log('');
  console.log('  NEXT STEPS:');
  console.log('    1. Review remediation-queue.json');
  console.log('    2. Apply corrections: npx tsx scripts/registry/phase4-remediation.ts --apply <ID>');
  console.log('    3. Attempt restoration: npx tsx scripts/registry/phase4-remediation.ts --restore <ID>');
  console.log('═══════════════════════════════════════════════════════════════\n');

  db.close();
}

main().catch(console.error);
