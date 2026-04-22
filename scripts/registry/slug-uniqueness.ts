#!/usr/bin/env npx tsx
/**
 * Slug Uniqueness Enforcement
 *
 * Implements:
 * - UNIQUE constraint on (town, category, slug)
 * - canonical_slug field for redirects and indexing
 * - Validation logic to prevent duplicates
 * - Conflict detection with alternative suggestions
 */

import Database from 'better-sqlite3';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '../../data/mv_registry.db');

interface SlugConflict {
  slug: string;
  town: string;
  category: string;
  existing_id: number;
  existing_name: string;
}

interface SlugValidationResult {
  valid: boolean;
  error?: string;
  conflict?: SlugConflict;
  suggestions?: string[];
}

// ============================================================================
// SLUG GENERATION UTILITIES
// ============================================================================

function generateSlug(name: string, town: string): string {
  const normalized = name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  const townSlug = town
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');

  return `${normalized}-${townSlug}`;
}

function generateAlternativeSlugs(baseSlug: string, businessName: string, town: string): string[] {
  const alternatives: string[] = [];

  // Add numeric suffix
  for (let i = 2; i <= 5; i++) {
    alternatives.push(`${baseSlug}-${i}`);
  }

  // Add category-based suffix variations
  const words = businessName.toLowerCase().split(/\s+/);
  if (words.length > 2) {
    // Use initials
    const initials = words.map(w => w[0]).join('');
    alternatives.push(`${initials}-${town.toLowerCase().replace(/\s+/g, '-')}`);
  }

  // Add "mv" suffix (Martha's Vineyard)
  alternatives.push(`${baseSlug}-mv`);

  return alternatives;
}

// ============================================================================
// VALIDATION FUNCTIONS
// ============================================================================

function validateSlug(
  db: Database.Database,
  slug: string,
  town: string,
  category: string,
  excludeId?: number
): SlugValidationResult {
  // Check for empty/invalid slug
  if (!slug || slug.trim() === '') {
    return { valid: false, error: 'Slug cannot be empty' };
  }

  // Check slug format
  if (!/^[a-z0-9-]+$/.test(slug)) {
    return {
      valid: false,
      error: 'Slug must contain only lowercase letters, numbers, and hyphens'
    };
  }

  // Check for existing conflict within same town/category
  let query = `
    SELECT id, business_name, slug, town, category
    FROM businesses
    WHERE slug = ? AND town = ? AND category = ?
      AND is_duplicate = 0
  `;
  const params: (string | number)[] = [slug, town, category];

  if (excludeId !== undefined) {
    query += ' AND id != ?';
    params.push(excludeId);
  }

  const existing = db.prepare(query).get(...params) as {
    id: number;
    business_name: string;
    slug: string;
    town: string;
    category: string;
  } | undefined;

  if (existing) {
    const suggestions = generateAlternativeSlugs(slug, existing.business_name, town)
      .filter(alt => !checkSlugExists(db, alt, town, category, excludeId));

    return {
      valid: false,
      error: `Slug "${slug}" already exists in ${town}/${category}`,
      conflict: {
        slug: existing.slug,
        town: existing.town,
        category: existing.category,
        existing_id: existing.id,
        existing_name: existing.business_name
      },
      suggestions: suggestions.slice(0, 3)
    };
  }

  return { valid: true };
}

function checkSlugExists(
  db: Database.Database,
  slug: string,
  town: string,
  category: string,
  excludeId?: number
): boolean {
  let query = `
    SELECT 1 FROM businesses
    WHERE slug = ? AND town = ? AND category = ?
      AND is_duplicate = 0
  `;
  const params: (string | number)[] = [slug, town, category];

  if (excludeId !== undefined) {
    query += ' AND id != ?';
    params.push(excludeId);
  }

  return db.prepare(query).get(...params) !== undefined;
}

function validateBeforePublish(
  db: Database.Database,
  id: number
): SlugValidationResult {
  const record = db.prepare(`
    SELECT id, business_name, slug, town, category, canonical_slug
    FROM businesses
    WHERE id = ?
  `).get(id) as {
    id: number;
    business_name: string;
    slug: string;
    town: string;
    category: string;
    canonical_slug: string | null;
  } | undefined;

  if (!record) {
    return { valid: false, error: `Record ${id} not found` };
  }

  if (!record.slug) {
    return { valid: false, error: 'Record has no slug assigned' };
  }

  if (!record.town) {
    return { valid: false, error: 'Record has no town assigned' };
  }

  if (!record.category) {
    return { valid: false, error: 'Record has no category assigned' };
  }

  return validateSlug(db, record.slug, record.town, record.category, record.id);
}

// ============================================================================
// DATABASE MIGRATION
// ============================================================================

function migrateSchema(db: Database.Database, dryRun: boolean): void {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  SCHEMA MIGRATION: SLUG UNIQUENESS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Check if canonical_slug column exists
  const columns = db.prepare(`PRAGMA table_info(businesses)`).all() as { name: string }[];
  const hasCanonicalSlug = columns.some(c => c.name === 'canonical_slug');

  if (hasCanonicalSlug) {
    console.log('✓ canonical_slug column already exists');
  } else {
    console.log('Adding canonical_slug column...');
    if (!dryRun) {
      db.exec(`ALTER TABLE businesses ADD COLUMN canonical_slug TEXT`);
      console.log('✓ Added canonical_slug column');
    } else {
      console.log('  [DRY RUN] Would add canonical_slug column');
    }
  }

  // Populate canonical_slug from existing slug values (only if column exists)
  if (hasCanonicalSlug || !dryRun) {
    const needsCanonical = db.prepare(`
      SELECT COUNT(*) as count FROM businesses
      WHERE slug IS NOT NULL AND canonical_slug IS NULL
    `).get() as { count: number };

    if (needsCanonical.count > 0) {
      console.log(`\nPopulating canonical_slug for ${needsCanonical.count} records...`);
      if (!dryRun) {
        db.exec(`
          UPDATE businesses
          SET canonical_slug = slug
          WHERE slug IS NOT NULL AND canonical_slug IS NULL
        `);
        console.log('✓ Populated canonical_slug');
      } else {
        console.log('  [DRY RUN] Would populate canonical_slug');
      }
    }
  } else {
    // In dry run mode, estimate how many would need populating
    const withSlug = db.prepare(`
      SELECT COUNT(*) as count FROM businesses WHERE slug IS NOT NULL
    `).get() as { count: number };
    console.log(`\n  [DRY RUN] Would populate canonical_slug for ~${withSlug.count} records`);
  }

  // Check for existing slug conflicts within town/category
  console.log('\nChecking for slug conflicts within town/category...');
  const conflicts = db.prepare(`
    SELECT slug, town, category, COUNT(*) as count,
           GROUP_CONCAT(id) as ids,
           GROUP_CONCAT(business_name, ' | ') as names
    FROM businesses
    WHERE slug IS NOT NULL
      AND town IS NOT NULL
      AND category IS NOT NULL
      AND is_duplicate = 0
    GROUP BY slug, town, category
    HAVING count > 1
  `).all() as {
    slug: string;
    town: string;
    category: string;
    count: number;
    ids: string;
    names: string;
  }[];

  if (conflicts.length > 0) {
    console.log(`\n⚠️  Found ${conflicts.length} slug conflicts that must be resolved:\n`);
    for (const conflict of conflicts) {
      console.log(`  ${conflict.slug} (${conflict.town}/${conflict.category}):`);
      console.log(`    IDs: ${conflict.ids}`);
      console.log(`    Names: ${conflict.names}`);
    }
    console.log('\nResolving conflicts by adding numeric suffixes...');

    if (!dryRun) {
      for (const conflict of conflicts) {
        const ids = conflict.ids.split(',').map(Number);
        // Keep first ID as-is, modify others
        for (let i = 1; i < ids.length; i++) {
          const newSlug = `${conflict.slug}-${i + 1}`;
          db.prepare(`
            UPDATE businesses
            SET slug = ?, canonical_slug = ?
            WHERE id = ?
          `).run(newSlug, newSlug, ids[i]);
          console.log(`  Updated ID ${ids[i]}: ${conflict.slug} → ${newSlug}`);
        }
      }
      console.log('✓ Resolved all conflicts');
    }
  } else {
    console.log('✓ No slug conflicts found');
  }

  // Create unique index (replacing global unique constraint)
  console.log('\nCreating composite unique index...');

  // Check if index already exists
  const indexes = db.prepare(`
    SELECT name FROM sqlite_master
    WHERE type = 'index' AND tbl_name = 'businesses'
  `).all() as { name: string }[];

  const hasCompositeIndex = indexes.some(i => i.name === 'idx_unique_slug_town_category');

  if (hasCompositeIndex) {
    console.log('✓ Composite unique index already exists');
  } else {
    if (!dryRun) {
      // In SQLite, we can't easily drop the existing UNIQUE constraint on slug
      // But we can add a new composite unique index
      // The original UNIQUE on slug will remain but won't cause issues
      // since we're enforcing the stricter composite constraint in application code

      try {
        db.exec(`
          CREATE UNIQUE INDEX idx_unique_slug_town_category
          ON businesses(slug, town, category)
          WHERE slug IS NOT NULL
            AND town IS NOT NULL
            AND category IS NOT NULL
            AND is_duplicate = 0
        `);
        console.log('✓ Created composite unique index');
      } catch (e: any) {
        if (e.message.includes('UNIQUE constraint failed')) {
          console.log('⚠️  Cannot create index - unresolved conflicts exist');
        } else {
          throw e;
        }
      }
    } else {
      console.log('  [DRY RUN] Would create composite unique index');
    }
  }

  // Create index on canonical_slug for redirect lookups
  const hasCanonicalIndex = indexes.some(i => i.name === 'idx_canonical_slug');
  if (!hasCanonicalIndex) {
    console.log('\nCreating canonical_slug index...');
    if (!dryRun) {
      db.exec(`CREATE INDEX idx_canonical_slug ON businesses(canonical_slug)`);
      console.log('✓ Created canonical_slug index');
    } else {
      console.log('  [DRY RUN] Would create canonical_slug index');
    }
  }
}

// ============================================================================
// VALIDATION REPORT
// ============================================================================

function generateValidationReport(db: Database.Database): void {
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  SLUG VALIDATION REPORT');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Check if canonical_slug column exists
  const columns = db.prepare(`PRAGMA table_info(businesses)`).all() as { name: string }[];
  const hasCanonicalSlug = columns.some(c => c.name === 'canonical_slug');

  // Count records with/without slugs
  let stats: { total: number; with_slug: number; with_canonical: number; active: number };

  if (hasCanonicalSlug) {
    stats = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN slug IS NOT NULL THEN 1 ELSE 0 END) as with_slug,
        SUM(CASE WHEN canonical_slug IS NOT NULL THEN 1 ELSE 0 END) as with_canonical,
        SUM(CASE WHEN is_duplicate = 0 THEN 1 ELSE 0 END) as active
      FROM businesses
    `).get() as typeof stats;
  } else {
    const basicStats = db.prepare(`
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN slug IS NOT NULL THEN 1 ELSE 0 END) as with_slug,
        SUM(CASE WHEN is_duplicate = 0 THEN 1 ELSE 0 END) as active
      FROM businesses
    `).get() as { total: number; with_slug: number; active: number };
    stats = { ...basicStats, with_canonical: 0 };
  }

  console.log(`Total records:        ${stats.total}`);
  console.log(`Active records:       ${stats.active}`);
  console.log(`With slug:            ${stats.with_slug}`);
  console.log(`With canonical_slug:  ${hasCanonicalSlug ? stats.with_canonical : '(column not yet created)'}`);

  // Check for missing slugs on active records
  const missingSlugs = db.prepare(`
    SELECT id, business_name, town, category
    FROM businesses
    WHERE slug IS NULL AND is_duplicate = 0
    LIMIT 10
  `).all() as { id: number; business_name: string; town: string; category: string }[];

  if (missingSlugs.length > 0) {
    console.log(`\n⚠️  Active records missing slugs: ${missingSlugs.length}`);
    for (const r of missingSlugs) {
      const suggestedSlug = generateSlug(r.business_name, r.town);
      console.log(`  [${r.id}] ${r.business_name} → suggested: ${suggestedSlug}`);
    }
  }

  // Check for invalid slug formats
  const invalidSlugs = db.prepare(`
    SELECT id, business_name, slug
    FROM businesses
    WHERE slug IS NOT NULL
      AND slug NOT GLOB '[a-z0-9-]*'
      AND is_duplicate = 0
    LIMIT 10
  `).all() as { id: number; business_name: string; slug: string }[];

  if (invalidSlugs.length > 0) {
    console.log(`\n⚠️  Records with invalid slug format: ${invalidSlugs.length}`);
    for (const r of invalidSlugs) {
      console.log(`  [${r.id}] ${r.business_name}: "${r.slug}"`);
    }
  }

  // Check slug distribution by town
  console.log('\nSlug distribution by town:');
  const byTown = db.prepare(`
    SELECT town, COUNT(*) as count
    FROM businesses
    WHERE slug IS NOT NULL AND is_duplicate = 0
    GROUP BY town
    ORDER BY count DESC
  `).all() as { town: string; count: number }[];

  for (const t of byTown) {
    console.log(`  ${t.town}: ${t.count}`);
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--apply');
  const reportOnly = args.includes('--report');

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  MV BUSINESS REGISTRY - SLUG UNIQUENESS ENFORCEMENT');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Mode: ${reportOnly ? 'REPORT ONLY' : dryRun ? 'DRY RUN' : 'APPLY CHANGES'}`);
  console.log('═══════════════════════════════════════════════════════════════');

  const db = new Database(DB_PATH);

  if (reportOnly) {
    generateValidationReport(db);
  } else {
    migrateSchema(db, dryRun);
    generateValidationReport(db);

    if (dryRun) {
      console.log('\n📋 This was a DRY RUN. Run with --apply to make changes.');
    }
  }

  db.close();
}

// Export validation functions for use in other scripts
export {
  validateSlug,
  validateBeforePublish,
  generateSlug,
  generateAlternativeSlugs,
  checkSlugExists,
  SlugValidationResult,
  SlugConflict
};

main();
