#!/usr/bin/env npx tsx
/**
 * Phase 2 Schema Migration
 * Adds columns for completeness scoring, contact/location confidence,
 * outreach readiness, and suppression flags.
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'mv_registry.db');

function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  MV BUSINESS REGISTRY - PHASE 2 SCHEMA MIGRATION');
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

  // Phase 2 columns to add
  const newColumns = [
    // Quality & Completeness
    { name: 'completeness_score', type: 'INTEGER DEFAULT 0', comment: 'Field completeness 0-100' },
    { name: 'contact_confidence', type: 'INTEGER DEFAULT 0', comment: 'Contact info confidence 0-100' },
    { name: 'location_confidence', type: 'INTEGER DEFAULT 0', comment: 'Location data confidence 0-100' },

    // Operational flags
    { name: 'suppress_from_directory', type: 'INTEGER DEFAULT 0', comment: '1 = do not show publicly' },
    { name: 'outreach_ready', type: 'INTEGER DEFAULT 0', comment: '1 = ready for outreach' },
    { name: 'outreach_blocked_reason', type: 'TEXT', comment: 'Why outreach is blocked' },

    // Canonical duplicate tracking
    { name: 'canonical_business_id', type: 'INTEGER', comment: 'Points to the canonical record if this is merged' },

    // Map readiness
    { name: 'map_ready', type: 'INTEGER DEFAULT 0', comment: '1 = has valid lat/lng for map display' },
    { name: 'map_label', type: 'TEXT', comment: 'Display name for map markers' },

    // Email discovery
    { name: 'email_source', type: 'TEXT', comment: 'Where email was found' },
    { name: 'email_confidence', type: 'INTEGER', comment: 'Email validity confidence 0-100' },

    // Review flags
    { name: 'needs_manual_review', type: 'INTEGER DEFAULT 0', comment: '1 = needs human review' },
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

  // Create indexes for efficient filtering
  console.log('\nCreating indexes...');

  const indexes = [
    { name: 'idx_businesses_completeness', sql: 'CREATE INDEX IF NOT EXISTS idx_businesses_completeness ON businesses(completeness_score)' },
    { name: 'idx_businesses_suppress', sql: 'CREATE INDEX IF NOT EXISTS idx_businesses_suppress ON businesses(suppress_from_directory)' },
    { name: 'idx_businesses_outreach', sql: 'CREATE INDEX IF NOT EXISTS idx_businesses_outreach ON businesses(outreach_ready)' },
    { name: 'idx_businesses_map_ready', sql: 'CREATE INDEX IF NOT EXISTS idx_businesses_map_ready ON businesses(map_ready)' },
  ];

  for (const idx of indexes) {
    try {
      db.exec(idx.sql);
      console.log(`Created index: ${idx.name}`);
    } catch (error) {
      console.log(`Index exists or error: ${idx.name}`);
    }
  }

  // Set initial map_ready based on lat/lng
  console.log('\nSetting initial map_ready values...');
  const mapReadyResult = db.prepare(`
    UPDATE businesses
    SET map_ready = 1,
        map_label = business_name
    WHERE latitude IS NOT NULL
    AND longitude IS NOT NULL
    AND latitude != 0
    AND longitude != 0
  `).run();
  console.log(`  Set ${mapReadyResult.changes} records as map-ready`);

  db.close();

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  Migration complete. Added ${added} new columns.`);
  console.log('═══════════════════════════════════════════════════════════════\n');
}

main();
