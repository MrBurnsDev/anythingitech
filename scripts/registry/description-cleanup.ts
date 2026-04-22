#!/usr/bin/env npx tsx
/**
 * Description Cleanup Pipeline
 *
 * Produces clean, readable, single-paragraph business descriptions.
 *
 * PHASES:
 * 1. Strip invalid content (HTML, navigation, buttons, etc.)
 * 2. Deduplicate sentences
 * 3. Normalize formatting (single paragraph, proper length)
 * 4. Generate fallback descriptions when needed
 * 5. Reprocess ALL public records
 * 6. Validate and report
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'mv_registry.db');
const EXPORTS_PATH = path.join(process.cwd(), 'data', 'exports');

// ============================================================================
// CONFIGURATION
// ============================================================================

const PREFERRED_MAX_LENGTH = 300;
const HARD_MAX_LENGTH = 500;
const MIN_LENGTH = 40;

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface Record {
  id: number;
  business_name: string;
  category: string;
  town: string;
  short_description: string;
  primary_source: string;
}

interface CleanupResult {
  id: number;
  name: string;
  originalDesc: string | null;
  cleanedDesc: string | null;
  action: 'cleaned' | 'regenerated' | 'unchanged' | 'flagged';
  issues: string[];
}

// ============================================================================
// PHASE 1: STRIP INVALID CONTENT
// ============================================================================

// HTML entity patterns
const HTML_ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#39;': "'",
  '&apos;': "'",
  '&nbsp;': ' ',
  '&#x27;': "'",
  '&#x2F;': '/',
  '&mdash;': '—',
  '&ndash;': '–',
  '&hellip;': '...',
  '&rsquo;': "'",
  '&lsquo;': "'",
  '&rdquo;': '"',
  '&ldquo;': '"',
  '&copy;': '©',
  '&reg;': '®',
  '&trade;': '™',
};

// Navigation/button text to remove (case insensitive)
const NAVIGATION_PATTERNS = [
  /\bread more\b/gi,
  /\blearn more\b/gi,
  /\bclick here\b/gi,
  /\bsubscribe\b/gi,
  /\bfollow us\b/gi,
  /\bsign up\b/gi,
  /\bjoin us\b/gi,
  /\bget started\b/gi,
  /\bbook now\b/gi,
  /\border now\b/gi,
  /\bcontact us\b/gi,
  /\bcall now\b/gi,
  /\bview menu\b/gi,
  /\bview more\b/gi,
  /\bsee more\b/gi,
  /\bshow more\b/gi,
  /\bexplore\b/gi,
  /\bdiscover\b/gi,
  /\bshop now\b/gi,
  /\bbuy now\b/gi,
  /\breserve\b/gi,
  /\bcheck availability\b/gi,
  />>+/g,
  /<<+/g,
  /\[\.\.\.\]/g,
  /\.{4,}/g,
];

// Rejection patterns - if found, sentence is invalid
const REJECTION_PATTERNS = [
  />>>/,
  /READ MORE/i,
  /LEARN MORE/i,
  /CLICK HERE/i,
  /SUBSCRIBE/i,
  /FOLLOW US/i,
  /^\s*menu\s*$/i,
  /^\s*home\s*$/i,
  /^\s*about\s*$/i,
  /^\s*contact\s*$/i,
  /^\s*hours\s*$/i,
  /\bjavascript:/i,
  /\bhttp[s]?:\/\//i,
  /\bwww\./i,
  /^\d+$/,  // Just numbers
  /^[A-Z\s]{20,}$/,  // All caps blocks > 20 chars
];

function stripInvalidContent(text: string | null): string {
  if (!text) return '';

  let cleaned = text;

  // Remove HTML tags
  cleaned = cleaned.replace(/<[^>]*>/g, ' ');

  // Decode HTML entities
  for (const [entity, replacement] of Object.entries(HTML_ENTITIES)) {
    cleaned = cleaned.replace(new RegExp(entity, 'gi'), replacement);
  }

  // Remove numeric HTML entities
  cleaned = cleaned.replace(/&#(\d+);/g, (_, code) => {
    const num = parseInt(code, 10);
    return num > 31 && num < 127 ? String.fromCharCode(num) : ' ';
  });

  // Remove hex HTML entities
  cleaned = cleaned.replace(/&#x([0-9a-f]+);/gi, (_, code) => {
    const num = parseInt(code, 16);
    return num > 31 && num < 127 ? String.fromCharCode(num) : ' ';
  });

  // Remove any remaining HTML entities
  cleaned = cleaned.replace(/&[a-z]+;/gi, ' ');

  // Remove navigation patterns
  for (const pattern of NAVIGATION_PATTERNS) {
    cleaned = cleaned.replace(pattern, ' ');
  }

  // Normalize whitespace
  cleaned = cleaned
    .replace(/\n+/g, ' ')
    .replace(/\t+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return cleaned;
}

// ============================================================================
// PHASE 2: DEDUPLICATE SENTENCES
// ============================================================================

function deduplicateSentences(text: string): string {
  if (!text) return '';

  // Split into sentences
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // Track seen sentences (normalized for comparison)
  const seen = new Set<string>();
  const unique: string[] = [];

  for (const sentence of sentences) {
    // Normalize for comparison
    const normalized = sentence.toLowerCase().replace(/[^\w\s]/g, '').trim();

    // Skip if too short or already seen
    if (normalized.length < 10) continue;
    if (seen.has(normalized)) continue;

    // Check for partial duplicates (one sentence contains another)
    let isDuplicate = false;
    for (const existing of seen) {
      if (existing.includes(normalized) || normalized.includes(existing)) {
        // Keep the longer one
        if (normalized.length > existing.length) {
          // Replace shorter with longer
          const idx = unique.findIndex(s =>
            s.toLowerCase().replace(/[^\w\s]/g, '').trim() === existing
          );
          if (idx !== -1) {
            unique[idx] = sentence;
            seen.delete(existing);
            seen.add(normalized);
          }
        }
        isDuplicate = true;
        break;
      }
    }

    if (!isDuplicate) {
      seen.add(normalized);
      unique.push(sentence);
    }
  }

  return unique.join(' ');
}

// ============================================================================
// PHASE 3: NORMALIZE FORMATTING
// ============================================================================

function normalizeFormatting(text: string): string {
  if (!text) return '';

  let normalized = text;

  // Remove duplicate punctuation
  normalized = normalized.replace(/([.!?])\1+/g, '$1');
  normalized = normalized.replace(/,{2,}/g, ',');
  normalized = normalized.replace(/;{2,}/g, ';');

  // Fix spacing around punctuation
  normalized = normalized.replace(/\s+([.!?,;:])/g, '$1');
  normalized = normalized.replace(/([.!?,;:])\s*(?=[A-Za-z])/g, '$1 ');

  // Capitalize first letter
  normalized = normalized.charAt(0).toUpperCase() + normalized.slice(1);

  // Ensure ends with proper punctuation
  if (!/[.!?]$/.test(normalized)) {
    // Check if truncated mid-word
    if (/\w$/.test(normalized)) {
      // Likely truncated - add ellipsis
      normalized = normalized + '...';
    } else {
      normalized = normalized + '.';
    }
  }

  // Remove trailing fragments (incomplete sentences at end)
  // Look for patterns like "The restaurant also" at the end
  const trailingFragmentPattern = /\.\s+[A-Z][^.!?]{0,30}$/;
  if (trailingFragmentPattern.test(normalized)) {
    normalized = normalized.replace(trailingFragmentPattern, '.');
  }

  // Trim to preferred length if needed
  if (normalized.length > HARD_MAX_LENGTH) {
    // Find a good break point
    let breakPoint = normalized.lastIndexOf('. ', PREFERRED_MAX_LENGTH);
    if (breakPoint === -1) {
      breakPoint = normalized.lastIndexOf(' ', PREFERRED_MAX_LENGTH);
    }
    if (breakPoint > MIN_LENGTH) {
      normalized = normalized.slice(0, breakPoint + 1).trim();
      if (!/[.!?]$/.test(normalized)) {
        normalized = normalized + '...';
      }
    }
  }

  return normalized.trim();
}

// ============================================================================
// PHASE 4: FALLBACK DESCRIPTION GENERATION
// ============================================================================

// Category to service mapping
const CATEGORY_SERVICES: Record<string, string> = {
  'restaurant': 'dining experiences',
  'lodging': 'accommodations',
  'inn': 'bed and breakfast accommodations',
  'hotel': 'hotel accommodations',
  'shopping': 'retail services',
  'retail': 'retail shopping',
  'bar': 'drinks and entertainment',
  'cafe': 'coffee and light fare',
  'bakery': 'fresh baked goods',
  'gallery': 'art and exhibitions',
  'museum': 'cultural exhibits and programs',
  'wellness': 'health and wellness services',
  'salon': 'beauty and grooming services',
  'spa': 'relaxation and spa treatments',
  'contractors': 'construction and renovation services',
  'professional services': 'professional services',
  'community': 'community services and programs',
  'recreation': 'recreational activities',
  'auto': 'automotive services',
  'marine': 'marine and boating services',
  'real estate': 'real estate services',
  'vacation rental': 'vacation rental properties',
  'camp': 'camping and outdoor activities',
  'other': 'services',
};

function generateFallbackDescription(record: Record): string {
  const name = record.business_name;
  const town = record.town || 'Martha\'s Vineyard';
  const category = (record.category || 'business').toLowerCase();

  // Find matching service description
  let service = 'services';
  for (const [cat, svc] of Object.entries(CATEGORY_SERVICES)) {
    if (category.includes(cat)) {
      service = svc;
      break;
    }
  }

  // Generate description
  const templates = [
    `${name} is a ${category} located in ${town}, Martha's Vineyard, providing ${service} for residents and visitors.`,
    `Located in ${town}, ${name} offers ${service} to the Martha's Vineyard community and visitors alike.`,
    `${name} serves the ${town} area of Martha's Vineyard, specializing in ${service}.`,
  ];

  // Use first template as default
  return templates[0];
}

// ============================================================================
// PHASE 6: VALIDATION
// ============================================================================

interface ValidationResult {
  isValid: boolean;
  issues: string[];
}

function validateDescription(text: string | null): ValidationResult {
  const issues: string[] = [];

  if (!text || text.trim() === '') {
    return { isValid: false, issues: ['Empty description'] };
  }

  // Check for HTML entities
  if (/&[a-z]+;/i.test(text) || /&#\d+;/.test(text)) {
    issues.push('Contains HTML entities');
  }

  // Check for navigation text
  for (const pattern of REJECTION_PATTERNS) {
    if (pattern.test(text)) {
      issues.push('Contains navigation/invalid text');
      break;
    }
  }

  // Check length
  if (text.length < MIN_LENGTH) {
    issues.push(`Too short (${text.length} chars, min ${MIN_LENGTH})`);
  }
  if (text.length > 600) {
    issues.push(`Too long (${text.length} chars, max 600)`);
  }

  // Check for duplicate sentences
  const sentences = text.split(/(?<=[.!?])\s+/);
  const seen = new Set<string>();
  for (const s of sentences) {
    const norm = s.toLowerCase().trim();
    if (seen.has(norm) && norm.length > 20) {
      issues.push('Contains duplicate sentences');
      break;
    }
    seen.add(norm);
  }

  // Check for truncation mid-word
  if (/\w{3,}$/.test(text) && !/[.!?]$/.test(text)) {
    issues.push('Ends mid-word (truncated)');
  }

  return {
    isValid: issues.length === 0,
    issues
  };
}

// ============================================================================
// MAIN PIPELINE
// ============================================================================

function cleanDescription(text: string | null, record: Record): {
  cleaned: string;
  action: 'cleaned' | 'regenerated' | 'unchanged';
  issues: string[];
} {
  // Phase 1: Strip invalid content
  let cleaned = stripInvalidContent(text);

  // Phase 2: Deduplicate sentences
  cleaned = deduplicateSentences(cleaned);

  // Phase 3: Normalize formatting
  cleaned = normalizeFormatting(cleaned);

  // Phase 6: Validate
  const validation = validateDescription(cleaned);

  // Phase 4: Generate fallback if needed
  if (!validation.isValid || cleaned.length < MIN_LENGTH) {
    const fallback = generateFallbackDescription(record);
    return {
      cleaned: fallback,
      action: 'regenerated',
      issues: validation.issues
    };
  }

  // Check if unchanged
  if (cleaned === text) {
    return {
      cleaned,
      action: 'unchanged',
      issues: []
    };
  }

  return {
    cleaned,
    action: 'cleaned',
    issues: validation.issues
  };
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  DESCRIPTION CLEANUP PIPELINE');
  console.log('  Clean, Readable, Single-Paragraph Descriptions');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const db = new Database(DB_PATH);

  // Phase 5: Get ALL public records
  const records = db.prepare(`
    SELECT id, business_name, category, town, short_description, primary_source
    FROM businesses
    WHERE suppress_from_directory = 0 AND is_duplicate = 0
    ORDER BY id
  `).all() as Record[];

  console.log(`Processing ${records.length} public records...\n`);

  const results: CleanupResult[] = [];
  const stats = {
    cleaned: 0,
    regenerated: 0,
    unchanged: 0,
    flagged: 0,
  };

  // Prepare update statement
  const updateDesc = db.prepare(`
    UPDATE businesses SET short_description = ? WHERE id = ?
  `);

  console.log('─────────────────────────────────────────────────────────────────');
  console.log('  PROCESSING DESCRIPTIONS');
  console.log('─────────────────────────────────────────────────────────────────\n');

  for (const record of records) {
    const result = cleanDescription(record.short_description, record);

    const cleanupResult: CleanupResult = {
      id: record.id,
      name: record.business_name,
      originalDesc: record.short_description,
      cleanedDesc: result.cleaned,
      action: result.action,
      issues: result.issues
    };

    // Apply update if changed
    if (result.action !== 'unchanged') {
      updateDesc.run(result.cleaned, record.id);

      if (result.action === 'cleaned') {
        stats.cleaned++;
        // Only log significant changes
        if (record.short_description && record.short_description.length > 50) {
          console.log(`  ✏️  ID ${record.id}: ${record.business_name.slice(0, 30)}`);
          console.log(`      Cleaned: ${result.cleaned.slice(0, 60)}...`);
        }
      } else if (result.action === 'regenerated') {
        stats.regenerated++;
        console.log(`  🔄 ID ${record.id}: ${record.business_name.slice(0, 30)}`);
        console.log(`      Generated: ${result.cleaned.slice(0, 60)}...`);
        if (result.issues.length > 0) {
          console.log(`      Reason: ${result.issues.join(', ')}`);
        }
      }
    } else {
      stats.unchanged++;
    }

    // Final validation check
    const finalValidation = validateDescription(result.cleaned);
    if (!finalValidation.isValid) {
      cleanupResult.action = 'flagged';
      cleanupResult.issues = finalValidation.issues;
      stats.flagged++;
    }

    results.push(cleanupResult);
  }

  // ============================================================================
  // PHASE 7: REPORT
  // ============================================================================

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  CLEANUP RESULTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log(`  Total records processed:    ${records.length}`);
  console.log(`  Records cleaned:            ${stats.cleaned}`);
  console.log(`  Records regenerated:        ${stats.regenerated}`);
  console.log(`  Records unchanged:          ${stats.unchanged}`);
  console.log(`  Records flagged:            ${stats.flagged}`);

  // Show flagged records needing manual review
  const flagged = results.filter(r => r.action === 'flagged');
  if (flagged.length > 0) {
    console.log('\n  ═══ RECORDS NEEDING MANUAL REVIEW ═══\n');
    for (const r of flagged.slice(0, 20)) {
      console.log(`    ⚠️  ID ${r.id}: ${r.name}`);
      console.log(`        Issues: ${r.issues.join(', ')}`);
    }
    if (flagged.length > 20) {
      console.log(`    ... and ${flagged.length - 20} more`);
    }
  }

  // Show sample regenerated descriptions
  const regenerated = results.filter(r => r.action === 'regenerated');
  if (regenerated.length > 0) {
    console.log('\n  ═══ SAMPLE REGENERATED DESCRIPTIONS ═══\n');
    for (const r of regenerated.slice(0, 10)) {
      console.log(`    🔄 ID ${r.id}: ${r.name}`);
      console.log(`       "${r.cleanedDesc?.slice(0, 80)}..."`);
    }
  }

  // Save detailed report
  const report = {
    timestamp: new Date().toISOString(),
    stats,
    cleaned: results.filter(r => r.action === 'cleaned').map(r => ({
      id: r.id,
      name: r.name,
      before: r.originalDesc?.slice(0, 100),
      after: r.cleanedDesc?.slice(0, 100)
    })),
    regenerated: results.filter(r => r.action === 'regenerated').map(r => ({
      id: r.id,
      name: r.name,
      description: r.cleanedDesc,
      reason: r.issues
    })),
    flagged: results.filter(r => r.action === 'flagged').map(r => ({
      id: r.id,
      name: r.name,
      issues: r.issues
    })),
  };

  const reportPath = path.join(EXPORTS_PATH, 'description-cleanup-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  Report saved to: ${reportPath}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  db.close();
}

main().catch(console.error);
