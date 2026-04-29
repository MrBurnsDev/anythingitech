#!/usr/bin/env node
/**
 * Primary Key Audit Script
 *
 * Audits primary keys between Supabase and exported datasets.
 * Identifies:
 * - Records where external_id or id differs
 * - Records missing Supabase IDs
 * - Records duplicated across systems
 *
 * Recommends adding external_source_id as stable identifier.
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const EXPORTS_DIR = path.join(DATA_DIR, 'exports');
const GAZETTE_DIR = path.join(DATA_DIR, 'gazette');
const BUSINESSES_2_DIR = path.join(DATA_DIR, 'imports', 'businesses-2');

// Load JSON file safely
function loadJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`Error loading ${filePath}:`, e.message);
    return null;
  }
}

// Generate stable external source ID
function generateExternalSourceId(source, record) {
  // Create a deterministic ID based on source and unique identifiers
  const cleanName = (record.business_name || record.name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .substring(0, 50);

  const town = (record.town || 'unknown')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-');

  return `${source}:${town}:${cleanName}`;
}

async function main() {
  console.log('='.repeat(60));
  console.log('PRIMARY KEY AUDIT REPORT');
  console.log('='.repeat(60));
  console.log(`Generated: ${new Date().toISOString()}\n`);

  const report = {
    timestamp: new Date().toISOString(),
    dataSources: {},
    idMismatches: [],
    missingSupabaseIds: [],
    duplicates: [],
    recommendations: []
  };

  // 1. Load all-businesses export (most recent Supabase snapshot)
  const allBusinessesFiles = fs.readdirSync(EXPORTS_DIR)
    .filter(f => f.startsWith('all-businesses-') && f.endsWith('.json'))
    .sort()
    .reverse();

  let supabaseData = [];
  if (allBusinessesFiles.length > 0) {
    const latestExport = path.join(EXPORTS_DIR, allBusinessesFiles[0]);
    supabaseData = loadJson(latestExport) || [];
    console.log(`Loaded Supabase export: ${allBusinessesFiles[0]}`);
    console.log(`  Records: ${supabaseData.length}`);
    report.dataSources.supabase = {
      file: allBusinessesFiles[0],
      count: supabaseData.length,
      idRange: supabaseData.length > 0 ? {
        min: Math.min(...supabaseData.map(b => b.id)),
        max: Math.max(...supabaseData.map(b => b.id))
      } : null
    };
  }

  // 2. Load original businesses.json (legacy local data)
  const legacyData = loadJson(path.join(EXPORTS_DIR, 'businesses.json')) || [];
  console.log(`\nLoaded legacy businesses.json`);
  console.log(`  Records: ${legacyData.length}`);
  report.dataSources.legacy = {
    file: 'businesses.json',
    count: legacyData.length,
    idRange: legacyData.length > 0 ? {
      min: Math.min(...legacyData.map(b => b.id)),
      max: Math.max(...legacyData.map(b => b.id))
    } : null
  };

  // 3. Load Gazette parsed businesses
  const gazetteData = loadJson(path.join(GAZETTE_DIR, 'parsed-businesses.json')) || [];
  console.log(`\nLoaded Gazette import`);
  console.log(`  Records: ${gazetteData.length}`);
  report.dataSources.gazette = {
    file: 'gazette/parsed-businesses.json',
    count: gazetteData.length
  };

  // 4. Load businesses-2 parsed businesses
  const businesses2Data = loadJson(path.join(BUSINESSES_2_DIR, 'parsed-businesses.json')) || [];
  console.log(`\nLoaded Businesses-2 import`);
  console.log(`  Records: ${businesses2Data.length}`);
  report.dataSources.businesses2 = {
    file: 'imports/businesses-2/parsed-businesses.json',
    count: businesses2Data.length
  };

  console.log('\n' + '='.repeat(60));
  console.log('ID ANALYSIS');
  console.log('='.repeat(60));

  // Build lookup maps
  const supabaseBySlug = new Map();
  const supabaseById = new Map();
  const supabaseByName = new Map();

  for (const b of supabaseData) {
    supabaseBySlug.set(b.slug, b);
    supabaseById.set(b.id, b);
    const nameKey = `${(b.business_name || '').toLowerCase()}:${(b.town || '').toLowerCase()}`;
    if (!supabaseByName.has(nameKey)) {
      supabaseByName.set(nameKey, []);
    }
    supabaseByName.get(nameKey).push(b);
  }

  // Compare legacy data with Supabase
  console.log('\n--- Legacy vs Supabase ---');
  let legacyMatched = 0;
  let legacyIdMismatch = 0;
  let legacyMissing = 0;

  for (const legacy of legacyData) {
    const legacySlug = legacy.slug;
    const legacyId = legacy.id;

    const supabase = supabaseBySlug.get(legacySlug);

    if (supabase) {
      legacyMatched++;
      if (supabase.id !== legacyId) {
        legacyIdMismatch++;
        report.idMismatches.push({
          source: 'legacy',
          name: legacy.name,
          slug: legacySlug,
          legacyId: legacyId,
          supabaseId: supabase.id,
          town: legacy.town
        });
      }
    } else {
      legacyMissing++;
      report.missingSupabaseIds.push({
        source: 'legacy',
        name: legacy.name,
        slug: legacySlug,
        legacyId: legacyId,
        town: legacy.town
      });
    }
  }

  console.log(`  Matched by slug: ${legacyMatched}`);
  console.log(`  ID mismatches: ${legacyIdMismatch}`);
  console.log(`  Missing in Supabase: ${legacyMissing}`);

  // Check for duplicate slugs in Supabase
  console.log('\n--- Duplicate Detection ---');
  const slugCounts = new Map();
  for (const b of supabaseData) {
    const count = slugCounts.get(b.slug) || 0;
    slugCounts.set(b.slug, count + 1);
  }

  const duplicateSlugs = [...slugCounts.entries()].filter(([, count]) => count > 1);
  console.log(`  Duplicate slugs in Supabase: ${duplicateSlugs.length}`);

  for (const [slug, count] of duplicateSlugs) {
    const records = supabaseData.filter(b => b.slug === slug);
    report.duplicates.push({
      type: 'duplicate_slug',
      slug,
      count,
      ids: records.map(r => r.id),
      names: records.map(r => r.business_name)
    });
  }

  // Check for name+town duplicates
  const nameTownCounts = new Map();
  for (const b of supabaseData) {
    const key = `${(b.business_name || '').toLowerCase()}:${(b.town || '').toLowerCase()}`;
    const existing = nameTownCounts.get(key) || [];
    existing.push(b);
    nameTownCounts.set(key, existing);
  }

  const nameTownDuplicates = [...nameTownCounts.entries()]
    .filter(([, records]) => records.length > 1);
  console.log(`  Duplicate name+town combinations: ${nameTownDuplicates.length}`);

  for (const [key, records] of nameTownDuplicates) {
    if (records.length > 1) {
      report.duplicates.push({
        type: 'duplicate_name_town',
        key,
        count: records.length,
        ids: records.map(r => r.id),
        slugs: records.map(r => r.slug)
      });
    }
  }

  // Analyze import sources
  console.log('\n--- Import Source Analysis ---');

  // Check Gazette matches
  let gazetteMatched = 0;
  let gazetteNew = 0;
  for (const g of gazetteData) {
    const nameKey = `${(g.name || '').toLowerCase()}:${(g.town || '').toLowerCase()}`;
    if (supabaseByName.has(nameKey)) {
      gazetteMatched++;
    } else {
      gazetteNew++;
    }
  }
  console.log(`  Gazette: ${gazetteMatched} matched, ${gazetteNew} new`);

  // Check businesses-2 matches
  let biz2Matched = 0;
  let biz2New = 0;
  for (const b of businesses2Data) {
    const nameKey = `${(b.name || '').toLowerCase()}:${(b.town || '').toLowerCase()}`;
    if (supabaseByName.has(nameKey)) {
      biz2Matched++;
    } else {
      biz2New++;
    }
  }
  console.log(`  Businesses-2: ${biz2Matched} matched, ${biz2New} new`);

  // Generate external_source_id examples
  console.log('\n' + '='.repeat(60));
  console.log('EXTERNAL SOURCE ID PROPOSAL');
  console.log('='.repeat(60));

  console.log('\nProposed format: {source}:{town-slug}:{name-slug}');
  console.log('\nExamples:');

  const examples = [];

  // From Supabase
  if (supabaseData.length > 0) {
    const sample = supabaseData[0];
    const extId = generateExternalSourceId('supabase', sample);
    console.log(`  Supabase: ${extId}`);
    examples.push({ source: 'supabase', record: sample.business_name, external_source_id: extId });
  }

  // From legacy
  if (legacyData.length > 0) {
    const sample = legacyData[0];
    const extId = generateExternalSourceId('legacy', { business_name: sample.name, town: sample.town });
    console.log(`  Legacy: ${extId}`);
    examples.push({ source: 'legacy', record: sample.name, external_source_id: extId });
  }

  // From Gazette
  if (gazetteData.length > 0) {
    const sample = gazetteData[0];
    const extId = generateExternalSourceId('gazette', { business_name: sample.name, town: sample.town });
    console.log(`  Gazette: ${extId}`);
    examples.push({ source: 'gazette', record: sample.name, external_source_id: extId });
  }

  report.externalSourceIdExamples = examples;

  // Recommendations
  console.log('\n' + '='.repeat(60));
  console.log('RECOMMENDATIONS');
  console.log('='.repeat(60));

  const recommendations = [
    {
      priority: 'HIGH',
      action: 'Add external_source_id column to businesses table',
      sql: `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS external_source_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_businesses_external_source_id ON businesses(external_source_id) WHERE external_source_id IS NOT NULL;`
    },
    {
      priority: 'HIGH',
      action: 'Add verification_source column to track data origin',
      sql: `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS verification_source TEXT DEFAULT 'manual';
-- Possible values: manual, legacy, gazette, chamber, google_places, import_batch_X`
    },
    {
      priority: 'MEDIUM',
      action: 'Populate external_source_id for existing records',
      description: 'Generate stable IDs based on slug or name+town combination'
    },
    {
      priority: 'MEDIUM',
      action: 'Update import scripts to use external_source_id for matching',
      description: 'Never rely on numeric ID for cross-system matching'
    },
    {
      priority: 'LOW',
      action: 'Clean up duplicate records',
      description: `Found ${report.duplicates.length} potential duplicates`
    }
  ];

  for (const rec of recommendations) {
    console.log(`\n[${rec.priority}] ${rec.action}`);
    if (rec.sql) console.log(`  SQL: ${rec.sql.split('\n')[0]}...`);
    if (rec.description) console.log(`  ${rec.description}`);
    report.recommendations.push(rec);
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('SUMMARY');
  console.log('='.repeat(60));

  console.log(`\nData Sources:`);
  console.log(`  Supabase: ${supabaseData.length} records (IDs ${report.dataSources.supabase?.idRange?.min}-${report.dataSources.supabase?.idRange?.max})`);
  console.log(`  Legacy: ${legacyData.length} records (IDs ${report.dataSources.legacy?.idRange?.min}-${report.dataSources.legacy?.idRange?.max})`);
  console.log(`  Gazette: ${gazetteData.length} records (no IDs - import source)`);
  console.log(`  Businesses-2: ${businesses2Data.length} records (no IDs - import source)`);

  console.log(`\nIssues Found:`);
  console.log(`  ID mismatches: ${report.idMismatches.length}`);
  console.log(`  Missing from Supabase: ${report.missingSupabaseIds.length}`);
  console.log(`  Duplicates: ${report.duplicates.length}`);

  // Write report
  const reportPath = path.join(DATA_DIR, 'audits', 'primary-key-audit.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`\nReport saved to: ${reportPath}`);

  // Generate SQL migration
  const migrationSql = `-- Primary Key Audit Migration
-- Generated: ${new Date().toISOString()}
-- Purpose: Add stable external_source_id field for cross-system matching

-- Add external_source_id column
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS external_source_id TEXT;

-- Add verification_source column to track data origin
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS verification_source TEXT DEFAULT 'manual';

-- Create unique index on external_source_id (allows NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS idx_businesses_external_source_id
  ON businesses(external_source_id)
  WHERE external_source_id IS NOT NULL;

-- Create index on verification_source for filtering
CREATE INDEX IF NOT EXISTS idx_businesses_verification_source
  ON businesses(verification_source);

-- Populate external_source_id for existing records based on slug
UPDATE businesses
SET external_source_id = 'supabase:' || COALESCE(slug, 'unknown')
WHERE external_source_id IS NULL;

-- Update verification_source for records that came from known imports
-- (Run these after manual review of import sources)

-- COMMENT: Import scripts should now use external_source_id for matching:
-- 1. Generate external_source_id from source name + town + business name
-- 2. Use UPSERT with external_source_id as conflict key
-- 3. Never rely on numeric ID for matching across systems
`;

  const migrationPath = path.join(__dirname, '..', 'migrations', '005-add-external-source-id.sql');
  fs.writeFileSync(migrationPath, migrationSql);
  console.log(`Migration saved to: ${migrationPath}`);

  // Show first few ID mismatches
  if (report.idMismatches.length > 0) {
    console.log('\n' + '='.repeat(60));
    console.log('SAMPLE ID MISMATCHES (first 10)');
    console.log('='.repeat(60));
    for (const m of report.idMismatches.slice(0, 10)) {
      console.log(`  ${m.name} (${m.town})`);
      console.log(`    Legacy ID: ${m.legacyId} → Supabase ID: ${m.supabaseId}`);
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('AUDIT COMPLETE');
  console.log('='.repeat(60));
}

main().catch(console.error);
