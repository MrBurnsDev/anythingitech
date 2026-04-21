#!/usr/bin/env npx tsx
/**
 * MV Business Registry - Data Remediation Script
 *
 * This script:
 * 1. Identifies businesses with URL-style names
 * 2. Fetches their websites to extract proper names
 * 3. Updates records with enriched data
 * 4. Calculates confidence scores and publish tiers
 * 5. Exports a report of changes
 *
 * Usage:
 *   npx tsx scripts/registry/remediate.ts                  # Dry run (no changes)
 *   npx tsx scripts/registry/remediate.ts --apply          # Apply changes
 *   npx tsx scripts/registry/remediate.ts --apply --limit 10  # Apply to first 10
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import {
  isUrlStyleName,
  extractNameFromUrl,
  cleanBusinessName,
  normalizeForComparison,
  generateSlug,
  calculateConfidenceScore,
  determinePublishTier,
  categorizeByKeywords,
  normalizeTown,
  getIslandRegion,
} from './utils';
import { enrichFromWebsite } from './enrich';

// Parse CLI args
const args = process.argv.slice(2);
const dryRun = !args.includes('--apply');
const limitArg = args.find(a => a.startsWith('--limit'));
const limit = limitArg ? parseInt(limitArg.split('=')[1] || args[args.indexOf('--limit') + 1], 10) : null;

// Database path
const DB_PATH = path.join(process.cwd(), 'data', 'mv_registry.db');

interface BusinessRecord {
  id: number;
  business_name: string;
  normalized_name: string;
  slug: string;
  category: string;
  town: string;
  island_region: string;
  phone: string;
  email: string;
  website: string;
  domain: string;
  short_description: string;
  confidence_score: number;
  website_works: number | null;
  homepage_title: string;
  meta_description: string;
  primary_source: string;
  enriched_at: string | null;
}

interface RemediationResult {
  id: number;
  original_name: string;
  new_name: string | null;
  name_source: string | null;
  name_changed: boolean;
  category_updated: boolean;
  new_category: string | null;
  description_added: boolean;
  website_verified: boolean | null;
  confidence_score: number;
  publish_tier: string;
  error: string | null;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  MV BUSINESS REGISTRY - DATA REMEDIATION');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Mode: ${dryRun ? 'DRY RUN (no changes)' : 'APPLY CHANGES'}`);
  if (limit) console.log(`  Limit: ${limit} records`);
  console.log('');

  // Check database exists
  if (!fs.existsSync(DB_PATH)) {
    console.error(`Database not found at ${DB_PATH}`);
    process.exit(1);
  }

  const db = new Database(DB_PATH);

  // Get businesses that need remediation
  // Priority: URL-style names, then low confidence scores
  let query = `
    SELECT
      id, business_name, normalized_name, slug, category,
      town, island_region, phone, email, website, domain,
      short_description, confidence_score, website_works,
      homepage_title, meta_description, primary_source, enriched_at
    FROM businesses
    WHERE is_duplicate = 0
    ORDER BY
      CASE WHEN business_name LIKE '%.com%' OR business_name LIKE '%.net%' OR business_name LIKE '%.org%' THEN 0 ELSE 1 END,
      confidence_score ASC
  `;

  if (limit) {
    query += ` LIMIT ${limit}`;
  }

  const businesses = db.prepare(query).all() as BusinessRecord[];

  console.log(`Found ${businesses.length} businesses to process\n`);

  // Stats
  const stats = {
    total: businesses.length,
    url_style_names: 0,
    names_fixed: 0,
    categories_updated: 0,
    descriptions_added: 0,
    websites_verified: 0,
    websites_failed: 0,
    already_good: 0,
    errors: 0,
    tier_a: 0,
    tier_b: 0,
    tier_c: 0,
    unpublishable: 0,
  };

  const results: RemediationResult[] = [];

  // Prepare update statement
  const updateStmt = db.prepare(`
    UPDATE businesses SET
      business_name = ?,
      normalized_name = ?,
      slug = ?,
      category = ?,
      short_description = ?,
      confidence_score = ?,
      website_works = ?,
      homepage_title = ?,
      meta_description = ?,
      name_quality = ?,
      publish_tier = ?,
      name_source = ?,
      enriched_at = CURRENT_TIMESTAMP,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);

  // Process each business
  for (let i = 0; i < businesses.length; i++) {
    const biz = businesses[i];
    const progress = `[${i + 1}/${businesses.length}]`;

    const isUrlName = isUrlStyleName(biz.business_name);
    if (isUrlName) stats.url_style_names++;

    const result: RemediationResult = {
      id: biz.id,
      original_name: biz.business_name,
      new_name: null,
      name_source: null,
      name_changed: false,
      category_updated: false,
      new_category: null,
      description_added: false,
      website_verified: null,
      confidence_score: biz.confidence_score,
      publish_tier: 'unpublishable',
      error: null,
    };

    try {
      let newName = biz.business_name;
      let newDescription = biz.short_description;
      let newCategory = biz.category;
      let websiteWorks = biz.website_works;
      let homepageTitle = biz.homepage_title;
      let metaDescription = biz.meta_description;
      let nameSource: string | null = null;

      // If has website, try to enrich from it
      if (biz.website) {
        console.log(`${progress} Enriching: ${biz.business_name.slice(0, 40)}...`);

        const enriched = await enrichFromWebsite(biz.website, biz.business_name);

        if (enriched.success) {
          stats.websites_verified++;
          websiteWorks = 1;

          // Update name if better
          if (enriched.business_name && enriched.business_name !== biz.business_name) {
            newName = enriched.business_name;
            nameSource = enriched.name_source || 'website';
            result.name_changed = true;
            result.new_name = newName;
            result.name_source = nameSource;
            stats.names_fixed++;
          }

          // Update description
          if (enriched.short_description && !biz.short_description) {
            newDescription = enriched.short_description;
            result.description_added = true;
            stats.descriptions_added++;
          }

          // Update category if currently "Other"
          if (enriched.category && biz.category === 'Other') {
            newCategory = enriched.category;
            result.category_updated = true;
            result.new_category = newCategory;
            stats.categories_updated++;
          }

          // Store raw metadata
          homepageTitle = enriched.homepage_title || homepageTitle;
          metaDescription = enriched.meta_description || metaDescription;

          result.website_verified = true;
        } else {
          stats.websites_failed++;
          websiteWorks = 0;
          result.website_verified = false;
          result.error = enriched.error || 'Website unreachable';
        }

        // Rate limit: wait between requests
        await sleep(500);
      }

      // If still URL-style, try URL extraction as fallback
      if (isUrlStyleName(newName)) {
        // Use lowercase version for better word splitting
        const extracted = extractNameFromUrl(newName.toLowerCase());
        if (extracted && !isUrlStyleName(extracted)) {
          newName = cleanBusinessName(extracted);
          nameSource = 'url_extraction';
          result.name_changed = true;
          result.new_name = newName;
          result.name_source = nameSource;
          stats.names_fixed++;
        }
      }

      // Clean the name
      newName = cleanBusinessName(newName);

      // Re-categorize if still "Other"
      if (newCategory === 'Other') {
        const { category } = categorizeByKeywords(newName, newDescription);
        if (category !== 'Other') {
          newCategory = category;
          result.category_updated = true;
          result.new_category = newCategory;
          stats.categories_updated++;
        }
      }

      // Calculate new confidence score
      const confidenceScore = calculateConfidenceScore({
        business_name: newName,
        town: biz.town,
        phone: biz.phone,
        email: biz.email,
        website: biz.website,
        street_address: undefined,
        category: newCategory,
        website_verified: websiteWorks === 1,
        source_count: 1,
      });

      result.confidence_score = confidenceScore;

      // Determine publish tier
      const tier = determinePublishTier({
        business_name: newName,
        town: biz.town,
        phone: biz.phone,
        email: biz.email,
        website: biz.website,
        category: newCategory,
        confidence_score: confidenceScore,
        website_verified: websiteWorks === 1,
      });

      result.publish_tier = tier;

      // Update tier stats
      switch (tier) {
        case 'A': stats.tier_a++; break;
        case 'B': stats.tier_b++; break;
        case 'C': stats.tier_c++; break;
        default: stats.unpublishable++;
      }

      // Determine name quality
      const nameQuality = isUrlStyleName(newName) ? 'url_style' : 'good';

      // Apply changes if not dry run
      if (!dryRun && (result.name_changed || result.category_updated || result.description_added || websiteWorks !== biz.website_works)) {
        const normalized = normalizeForComparison(newName);
        const slug = generateSlug(newName, biz.town);

        updateStmt.run(
          newName,
          normalized,
          slug,
          newCategory,
          newDescription,
          confidenceScore,
          websiteWorks,
          homepageTitle,
          metaDescription,
          nameQuality,
          tier,
          nameSource,
          biz.id
        );
      }

      if (!result.name_changed && !result.category_updated && !result.description_added) {
        stats.already_good++;
      }

    } catch (error) {
      stats.errors++;
      result.error = error instanceof Error ? error.message : 'Unknown error';
      console.error(`${progress} Error processing ${biz.business_name}: ${result.error}`);
    }

    results.push(result);
  }

  db.close();

  // Print summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  REMEDIATION SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`  Total processed:      ${stats.total}`);
  console.log(`  URL-style names:      ${stats.url_style_names}`);
  console.log(`  Names fixed:          ${stats.names_fixed}`);
  console.log(`  Categories updated:   ${stats.categories_updated}`);
  console.log(`  Descriptions added:   ${stats.descriptions_added}`);
  console.log(`  Websites verified:    ${stats.websites_verified}`);
  console.log(`  Websites failed:      ${stats.websites_failed}`);
  console.log(`  Already good:         ${stats.already_good}`);
  console.log(`  Errors:               ${stats.errors}`);
  console.log('');
  console.log('  PUBLISH TIER BREAKDOWN:');
  console.log(`  Tier A (high quality):     ${stats.tier_a}`);
  console.log(`  Tier B (good):             ${stats.tier_b}`);
  console.log(`  Tier C (acceptable):       ${stats.tier_c}`);
  console.log(`  Unpublishable:             ${stats.unpublishable}`);
  console.log('═══════════════════════════════════════════════════════════════');

  if (dryRun) {
    console.log('\n  This was a DRY RUN. No changes were made.');
    console.log('  Run with --apply to apply changes.\n');
  }

  // Save report
  const reportPath = path.join(process.cwd(), 'data', 'exports', 'remediation-report.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });

  const report = {
    timestamp: new Date().toISOString(),
    mode: dryRun ? 'dry_run' : 'applied',
    stats,
    changes: results.filter(r => r.name_changed || r.category_updated || r.description_added),
    errors: results.filter(r => r.error),
  };

  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  console.log(`Report saved to: ${reportPath}`);

  // Print sample of fixed names
  const fixedNames = results.filter(r => r.name_changed).slice(0, 10);
  if (fixedNames.length > 0) {
    console.log('\n  SAMPLE NAME FIXES:');
    for (const fix of fixedNames) {
      console.log(`    ${fix.original_name.slice(0, 30).padEnd(30)} → ${fix.new_name?.slice(0, 30)} (${fix.name_source})`);
    }
  }
}

main().catch(console.error);
