#!/usr/bin/env npx tsx
/**
 * Database Schema Migration
 * Adds new columns for quality tracking and publishability
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'mv_registry.db');

function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  MV BUSINESS REGISTRY - SCHEMA MIGRATION');
  console.log('═══════════════════════════════════════════════════════════════');

  if (!fs.existsSync(DB_PATH)) {
    console.error(`Database not found at ${DB_PATH}`);
    process.exit(1);
  }

  const db = new Database(DB_PATH);

  // Get current columns
  const columns = db.prepare("PRAGMA table_info(businesses)").all() as Array<{ name: string }>;
  const columnNames = new Set(columns.map(c => c.name));

  console.log(`\nCurrent columns: ${columns.length}`);

  // Columns to add
  const newColumns = [
    { name: 'publish_tier', type: "TEXT DEFAULT 'unpublishable'", comment: 'A, B, C, or unpublishable' },
    { name: 'name_source', type: 'TEXT', comment: 'How the name was determined' },
    { name: 'name_quality', type: "TEXT DEFAULT 'unknown'", comment: 'good, url_style, needs_review' },
    { name: 'last_enrichment_error', type: 'TEXT', comment: 'Error from last enrichment attempt' },
    { name: 'enrichment_attempts', type: 'INTEGER DEFAULT 0', comment: 'Number of enrichment attempts' },
    { name: 'manual_override', type: 'INTEGER DEFAULT 0', comment: '1 if manually edited' },
  ];

  let added = 0;
  for (const col of newColumns) {
    if (!columnNames.has(col.name)) {
      console.log(`Adding column: ${col.name} (${col.comment})`);
      try {
        db.exec(`ALTER TABLE businesses ADD COLUMN ${col.name} ${col.type}`);
        added++;
      } catch (error) {
        console.error(`  Error adding ${col.name}: ${error}`);
      }
    } else {
      console.log(`Column exists: ${col.name}`);
    }
  }

  // Create index on publish_tier for efficient filtering
  console.log('\nCreating indexes...');

  const indexes = [
    { name: 'idx_businesses_publish_tier', sql: 'CREATE INDEX IF NOT EXISTS idx_businesses_publish_tier ON businesses(publish_tier)' },
    { name: 'idx_businesses_name_quality', sql: 'CREATE INDEX IF NOT EXISTS idx_businesses_name_quality ON businesses(name_quality)' },
  ];

  for (const idx of indexes) {
    try {
      db.exec(idx.sql);
      console.log(`Created index: ${idx.name}`);
    } catch (error) {
      console.log(`Index exists: ${idx.name}`);
    }
  }

  // Update existing records with name_quality based on current names
  console.log('\nUpdating name_quality for existing records...');

  // Mark URL-style names
  const urlStyleUpdate = db.prepare(`
    UPDATE businesses
    SET name_quality = 'url_style'
    WHERE (
      business_name LIKE '%.com%'
      OR business_name LIKE '%.net%'
      OR business_name LIKE '%.org%'
      OR business_name LIKE '%.site%'
      OR business_name LIKE 'www.%'
      OR business_name LIKE 'http%'
    )
    AND name_quality = 'unknown'
  `);
  const urlResult = urlStyleUpdate.run();
  console.log(`  Marked ${urlResult.changes} as url_style`);

  // Mark good names (not URL-style, has length > 2)
  const goodNameUpdate = db.prepare(`
    UPDATE businesses
    SET name_quality = 'good'
    WHERE name_quality = 'unknown'
    AND LENGTH(business_name) > 2
    AND business_name NOT LIKE '%.com%'
    AND business_name NOT LIKE '%.net%'
    AND business_name NOT LIKE '%.org%'
  `);
  const goodResult = goodNameUpdate.run();
  console.log(`  Marked ${goodResult.changes} as good`);

  // Set initial publish tiers based on current data
  console.log('\nSetting initial publish tiers...');

  // Tier A: Good name + verified website + phone or email
  db.exec(`
    UPDATE businesses
    SET publish_tier = 'A'
    WHERE name_quality = 'good'
    AND website_works = 1
    AND (phone IS NOT NULL OR email IS NOT NULL)
    AND town IS NOT NULL
    AND confidence_score >= 70
  `);

  // Tier B: Good name + website + some contact
  db.exec(`
    UPDATE businesses
    SET publish_tier = 'B'
    WHERE publish_tier = 'unpublishable'
    AND name_quality = 'good'
    AND website IS NOT NULL
    AND (phone IS NOT NULL OR website IS NOT NULL)
    AND town IS NOT NULL
    AND confidence_score >= 50
  `);

  // Tier C: Good name + town
  db.exec(`
    UPDATE businesses
    SET publish_tier = 'C'
    WHERE publish_tier = 'unpublishable'
    AND name_quality = 'good'
    AND town IS NOT NULL
    AND confidence_score >= 30
  `);

  // Get tier distribution
  const tierStats = db.prepare(`
    SELECT publish_tier, COUNT(*) as count
    FROM businesses
    WHERE is_duplicate = 0
    GROUP BY publish_tier
    ORDER BY
      CASE publish_tier
        WHEN 'A' THEN 1
        WHEN 'B' THEN 2
        WHEN 'C' THEN 3
        ELSE 4
      END
  `).all() as Array<{ publish_tier: string; count: number }>;

  console.log('\n  PUBLISH TIER DISTRIBUTION:');
  for (const tier of tierStats) {
    console.log(`    ${tier.publish_tier || 'unpublishable'}: ${tier.count}`);
  }

  db.close();

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  Migration complete. Added ${added} new columns.`);
  console.log('═══════════════════════════════════════════════════════════════\n');
}

main();
