#!/usr/bin/env npx tsx
/**
 * Source Quality Audit
 *
 * This script:
 * 1. Analyzes contamination patterns by source domain
 * 2. Tracks field-level failure reasons
 * 3. Classifies suppressed records as recoverable or permanent
 * 4. Compares extracted names vs page titles vs domains
 * 5. Reports top contamination patterns
 *
 * Usage:
 *   npx tsx scripts/registry/audit-sources.ts
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'mv_registry.db');

// ============================================================================
// VALIDATION FUNCTIONS (from phase3-validate.ts)
// ============================================================================

const EMAIL_CONTAMINATION_PATTERNS = [
  { pattern: /facebook/i, name: 'facebook_in_email' },
  { pattern: /instagram/i, name: 'instagram_in_email' },
  { pattern: /twitter/i, name: 'twitter_in_email' },
  { pattern: /linkedin/i, name: 'linkedin_in_email' },
  { pattern: /social/i, name: 'social_in_email' },
  { pattern: /connect/i, name: 'connect_in_email' },
  { pattern: /^email/i, name: 'email_prefix' },
  { pattern: /email$/i, name: 'email_suffix' },
  { pattern: /^\d{3}[-.]?\d{3}/i, name: 'phone_in_email' },
];

const ADDRESS_CONTAMINATION_PATTERNS = [
  { pattern: /^com/i, name: 'com_prefix' },
  { pattern: /instagram/i, name: 'instagram_in_address' },
  { pattern: /facebook/i, name: 'facebook_in_address' },
  { pattern: /twitter/i, name: 'twitter_in_address' },
  { pattern: /linkedin/i, name: 'linkedin_in_address' },
  { pattern: /youtube/i, name: 'youtube_in_address' },
  { pattern: /follow us/i, name: 'follow_us_in_address' },
  { pattern: /contact us/i, name: 'contact_us_in_address' },
  { pattern: /\bintro\b/i, name: 'intro_in_address' },
  { pattern: /\bofferings\b/i, name: 'offerings_in_address' },
];

const NAME_CONTAMINATION_PATTERNS = [
  { pattern: /^a glimpse/i, name: 'glimpse_pattern' },
  { pattern: /^experience\s/i, name: 'experience_pattern' },
  { pattern: /^explore\s/i, name: 'explore_pattern' },
  { pattern: /^discover\s/i, name: 'discover_pattern' },
  { pattern: /^welcome\s/i, name: 'welcome_pattern' },
  { pattern: /^find your/i, name: 'find_your_pattern' },
  { pattern: /\.\.\s*$/i, name: 'ellipsis_pattern' },
  { pattern: /redirecting/i, name: 'redirecting_pattern' },
  { pattern: /^martha'?s?\s*vineyard\s*(hotels?|restaurants?|shops?|lodging)/i, name: 'mv_category_pattern' },
  { pattern: /^boutique hotels?$/i, name: 'boutique_hotels_pattern' },
  { pattern: /^iconic\s+/i, name: 'iconic_pattern' },
  { pattern: /artisanal.*studio.*shop/i, name: 'artisanal_pattern' },
  { pattern: /organic products in/i, name: 'organic_products_pattern' },
  { pattern: /\.com$/i, name: 'dot_com_suffix' },
  { pattern: /^the[a-z]+inn$/i, name: 'url_style_inn' },
  { pattern: /^[a-z]+hotels?$/i, name: 'url_style_hotels' },
  { pattern: /^[a-z]+arts$/i, name: 'url_style_arts' },
];

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
  domain: string;
  short_description: string;
  confidence_score: number;
  publish_tier: string;
  is_duplicate: number;
  suppress_from_directory: number;
  name_source: string;
  primary_source: string;
  homepage_title: string;
  validation_notes: string;
}

interface ContaminationStats {
  pattern: string;
  count: number;
  examples: string[];
}

interface SourceStats {
  source: string;
  total: number;
  suppressed: number;
  emailContamination: number;
  addressContamination: number;
  nameContamination: number;
  suppressionRate: number;
}

interface RecordClassification {
  id: number;
  name: string;
  website: string;
  classification: 'permanent_suppress' | 'recoverable_manual' | 'recoverable_extraction';
  reason: string;
  suggestedFix?: string;
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  MV BUSINESS REGISTRY - SOURCE QUALITY AUDIT');
  console.log('═══════════════════════════════════════════════════════════════\n');

  if (!fs.existsSync(DB_PATH)) {
    console.error(`Database not found at ${DB_PATH}`);
    process.exit(1);
  }

  const db = new Database(DB_PATH, { readonly: true });

  // Get all records
  const allRecords = db.prepare(`
    SELECT
      id, business_name, normalized_name, category, town,
      street_address, full_address, phone, email, website, domain,
      short_description, confidence_score, publish_tier, is_duplicate,
      suppress_from_directory, name_source, primary_source, homepage_title,
      validation_notes
    FROM businesses
    WHERE is_duplicate = 0
  `).all() as BusinessRecord[];

  const suppressedRecords = allRecords.filter(r => r.suppress_from_directory === 1);
  const activeRecords = allRecords.filter(r => r.suppress_from_directory === 0);

  console.log(`Total non-duplicate records: ${allRecords.length}`);
  console.log(`Active (public): ${activeRecords.length}`);
  console.log(`Suppressed: ${suppressedRecords.length}\n`);

  // =========================================================================
  // 1. CONTAMINATION BY SOURCE
  // =========================================================================
  console.log('─────────────────────────────────────────────────────────────────');
  console.log('  CONTAMINATION BY SOURCE');
  console.log('─────────────────────────────────────────────────────────────────\n');

  const sourceStats: Map<string, SourceStats> = new Map();

  for (const record of allRecords) {
    const source = record.primary_source || 'unknown';

    if (!sourceStats.has(source)) {
      sourceStats.set(source, {
        source,
        total: 0,
        suppressed: 0,
        emailContamination: 0,
        addressContamination: 0,
        nameContamination: 0,
        suppressionRate: 0,
      });
    }

    const stats = sourceStats.get(source)!;
    stats.total++;

    if (record.suppress_from_directory === 1) {
      stats.suppressed++;
    }

    // Check email contamination
    if (record.email) {
      for (const p of EMAIL_CONTAMINATION_PATTERNS) {
        if (p.pattern.test(record.email)) {
          stats.emailContamination++;
          break;
        }
      }
    }

    // Check address contamination
    if (record.full_address) {
      for (const p of ADDRESS_CONTAMINATION_PATTERNS) {
        if (p.pattern.test(record.full_address)) {
          stats.addressContamination++;
          break;
        }
      }
    }

    // Check name contamination
    if (record.business_name) {
      for (const p of NAME_CONTAMINATION_PATTERNS) {
        if (p.pattern.test(record.business_name)) {
          stats.nameContamination++;
          break;
        }
      }
    }
  }

  // Calculate suppression rates and sort by worst
  const sourceStatsArray = Array.from(sourceStats.values())
    .map(s => ({ ...s, suppressionRate: s.total > 0 ? (s.suppressed / s.total) * 100 : 0 }))
    .sort((a, b) => b.suppressionRate - a.suppressionRate);

  console.log('  Source                    | Total | Supp | Email | Addr | Name | Rate');
  console.log('  ─────────────────────────────────────────────────────────────────────');
  for (const s of sourceStatsArray) {
    console.log(`  ${s.source.padEnd(26)} | ${String(s.total).padStart(5)} | ${String(s.suppressed).padStart(4)} | ${String(s.emailContamination).padStart(5)} | ${String(s.addressContamination).padStart(4)} | ${String(s.nameContamination).padStart(4)} | ${s.suppressionRate.toFixed(1)}%`);
  }

  // =========================================================================
  // 2. TOP CONTAMINATION PATTERNS
  // =========================================================================
  console.log('\n─────────────────────────────────────────────────────────────────');
  console.log('  TOP CONTAMINATION PATTERNS');
  console.log('─────────────────────────────────────────────────────────────────\n');

  const emailPatternStats: Map<string, ContaminationStats> = new Map();
  const addressPatternStats: Map<string, ContaminationStats> = new Map();
  const namePatternStats: Map<string, ContaminationStats> = new Map();

  for (const record of allRecords) {
    // Email patterns
    if (record.email) {
      for (const p of EMAIL_CONTAMINATION_PATTERNS) {
        if (p.pattern.test(record.email)) {
          if (!emailPatternStats.has(p.name)) {
            emailPatternStats.set(p.name, { pattern: p.name, count: 0, examples: [] });
          }
          const stats = emailPatternStats.get(p.name)!;
          stats.count++;
          if (stats.examples.length < 3) {
            stats.examples.push(`${record.business_name}: ${record.email.slice(0, 50)}`);
          }
        }
      }
    }

    // Address patterns
    if (record.full_address) {
      for (const p of ADDRESS_CONTAMINATION_PATTERNS) {
        if (p.pattern.test(record.full_address)) {
          if (!addressPatternStats.has(p.name)) {
            addressPatternStats.set(p.name, { pattern: p.name, count: 0, examples: [] });
          }
          const stats = addressPatternStats.get(p.name)!;
          stats.count++;
          if (stats.examples.length < 3) {
            stats.examples.push(`${record.business_name}: ${record.full_address.slice(0, 50).replace(/\n/g, ' ')}`);
          }
        }
      }
    }

    // Name patterns
    if (record.business_name) {
      for (const p of NAME_CONTAMINATION_PATTERNS) {
        if (p.pattern.test(record.business_name)) {
          if (!namePatternStats.has(p.name)) {
            namePatternStats.set(p.name, { pattern: p.name, count: 0, examples: [] });
          }
          const stats = namePatternStats.get(p.name)!;
          stats.count++;
          if (stats.examples.length < 3) {
            stats.examples.push(record.business_name);
          }
        }
      }
    }
  }

  console.log('  EMAIL CONTAMINATION:');
  for (const [, stats] of Array.from(emailPatternStats.entries()).sort((a, b) => b[1].count - a[1].count)) {
    console.log(`    ${stats.pattern}: ${stats.count} records`);
    for (const ex of stats.examples) {
      console.log(`      - ${ex}`);
    }
  }

  console.log('\n  ADDRESS CONTAMINATION:');
  for (const [, stats] of Array.from(addressPatternStats.entries()).sort((a, b) => b[1].count - a[1].count)) {
    console.log(`    ${stats.pattern}: ${stats.count} records`);
    for (const ex of stats.examples) {
      console.log(`      - ${ex}`);
    }
  }

  console.log('\n  NAME CONTAMINATION:');
  for (const [, stats] of Array.from(namePatternStats.entries()).sort((a, b) => b[1].count - a[1].count)) {
    console.log(`    ${stats.pattern}: ${stats.count} records`);
    for (const ex of stats.examples) {
      console.log(`      - ${ex}`);
    }
  }

  // =========================================================================
  // 3. CLASSIFY SUPPRESSED RECORDS
  // =========================================================================
  console.log('\n─────────────────────────────────────────────────────────────────');
  console.log('  SUPPRESSED RECORD CLASSIFICATION');
  console.log('─────────────────────────────────────────────────────────────────\n');

  const classifications: RecordClassification[] = [];

  for (const record of suppressedRecords) {
    let classification: RecordClassification['classification'] = 'permanent_suppress';
    let reason = '';
    let suggestedFix: string | undefined;

    // Check validation notes for reason
    const notes = record.validation_notes || '';

    // URL-style names with good domain - recoverable with better extraction
    if (/url_style_name|url_style_inn|url_style_hotels/.test(notes)) {
      classification = 'recoverable_extraction';
      reason = 'URL-style name - entity exists but name extracted incorrectly';
      suggestedFix = `Extract proper name from ${record.domain || record.website}`;
    }
    // Artisanal/descriptive names - recoverable with better extraction
    else if (/artisanal|organic_products/.test(notes)) {
      classification = 'recoverable_extraction';
      reason = 'Descriptive tagline used as name';
      suggestedFix = `Extract actual business name from ${record.domain}`;
    }
    // Glimpse/decorative patterns - recoverable with better extraction
    else if (/glimpse|iconic/.test(notes)) {
      classification = 'recoverable_extraction';
      reason = 'Decorative/promotional text used as name';
      suggestedFix = `Extract actual business name from ${record.domain}`;
    }
    // Generic category titles - likely not real businesses
    else if (/mv_category|boutique_hotels/.test(notes)) {
      classification = 'permanent_suppress';
      reason = 'Generic category page, not a specific business';
    }
    // Redirecting pages - broken pages
    else if (/redirecting/.test(notes)) {
      classification = 'permanent_suppress';
      reason = 'Broken/redirecting page';
    }
    // Unknown - needs manual review
    else {
      classification = 'recoverable_manual';
      reason = 'Unclear issue - needs manual review';
    }

    classifications.push({
      id: record.id,
      name: record.business_name,
      website: record.website || '',
      classification,
      reason,
      suggestedFix,
    });
  }

  const permanent = classifications.filter(c => c.classification === 'permanent_suppress');
  const recoverableManual = classifications.filter(c => c.classification === 'recoverable_manual');
  const recoverableExtraction = classifications.filter(c => c.classification === 'recoverable_extraction');

  console.log(`  Permanently Suppress: ${permanent.length}`);
  for (const c of permanent.slice(0, 10)) {
    console.log(`    ID ${c.id}: "${c.name.slice(0, 35)}" - ${c.reason}`);
  }

  console.log(`\n  Recoverable (Manual Correction): ${recoverableManual.length}`);
  for (const c of recoverableManual.slice(0, 10)) {
    console.log(`    ID ${c.id}: "${c.name.slice(0, 35)}" - ${c.reason}`);
  }

  console.log(`\n  Recoverable (Improved Extraction): ${recoverableExtraction.length}`);
  for (const c of recoverableExtraction.slice(0, 10)) {
    console.log(`    ID ${c.id}: "${c.name.slice(0, 35)}"`);
    console.log(`      Fix: ${c.suggestedFix}`);
  }

  // =========================================================================
  // 4. ENTITY NAME MISMATCH ANALYSIS
  // =========================================================================
  console.log('\n─────────────────────────────────────────────────────────────────');
  console.log('  ENTITY NAME MISMATCH ANALYSIS');
  console.log('─────────────────────────────────────────────────────────────────\n');

  let mismatchCount = 0;
  const mismatches: Array<{ id: number; name: string; domain: string; title: string }> = [];

  for (const record of activeRecords) {
    if (!record.domain || !record.business_name) continue;

    const nameLower = record.business_name.toLowerCase().replace(/[^a-z0-9]/g, '');
    const domainLower = record.domain.replace(/\.(com|net|org|site).*$/i, '').replace(/[^a-z0-9]/g, '');

    // Check if name and domain are significantly different
    const similarity = calculateSimilarity(nameLower, domainLower);

    if (similarity < 0.3 && nameLower.length > 5 && domainLower.length > 5) {
      mismatchCount++;
      if (mismatches.length < 15) {
        mismatches.push({
          id: record.id,
          name: record.business_name,
          domain: record.domain,
          title: record.homepage_title || '',
        });
      }
    }
  }

  console.log(`  Records with name/domain mismatch: ${mismatchCount}`);
  console.log('  (These may need review for entity consistency)\n');
  for (const m of mismatches) {
    console.log(`    ID ${m.id}: "${m.name.slice(0, 30)}"`);
    console.log(`      Domain: ${m.domain}`);
    if (m.title) console.log(`      Title: ${m.title.slice(0, 40)}`);
  }

  db.close();

  // =========================================================================
  // SAVE REPORT
  // =========================================================================
  const reportPath = path.join(process.cwd(), 'data', 'exports', 'source-audit-report.json');
  const report = {
    timestamp: new Date().toISOString(),
    summary: {
      totalRecords: allRecords.length,
      activeRecords: activeRecords.length,
      suppressedRecords: suppressedRecords.length,
      permanentSuppress: permanent.length,
      recoverableManual: recoverableManual.length,
      recoverableExtraction: recoverableExtraction.length,
      nameDomainMismatches: mismatchCount,
    },
    sourceStats: sourceStatsArray,
    classifications,
    mismatches,
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport saved to: ${reportPath}`);
}

// Simple similarity function
function calculateSimilarity(a: string, b: string): number {
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;

  // Check if one contains the other
  if (a.includes(b) || b.includes(a)) return 0.7;

  // Count matching characters
  let matches = 0;
  const longer = a.length > b.length ? a : b;
  const shorter = a.length > b.length ? b : a;

  for (const char of shorter) {
    if (longer.includes(char)) matches++;
  }

  return matches / longer.length;
}

main().catch(console.error);
