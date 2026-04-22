#!/usr/bin/env npx tsx
/**
 * Description Enhancement Pipeline
 *
 * Improves description quality using category-aware templates.
 *
 * DOES NOT CHANGE:
 * - Validation logic
 * - Cleanup logic
 * - Original high-quality descriptions
 *
 * PHASES:
 * 1. Category-specific templates (3-5 per category)
 * 2. Randomized safe variation
 * 3. SEO signal preservation (name, town, Martha's Vineyard)
 * 4. Preserve existing good descriptions
 * 5. Reprocess only generated/generic descriptions
 * 6. Add description_quality field
 * 7. Report
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.join(process.cwd(), 'data', 'mv_registry.db');
const EXPORTS_PATH = path.join(process.cwd(), 'data', 'exports');

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

type DescriptionQuality = 'high' | 'medium' | 'generated';

interface EnhancementResult {
  id: number;
  name: string;
  category: string;
  oldDesc: string | null;
  newDesc: string | null;
  quality: DescriptionQuality;
  templateUsed: string | null;
  action: 'preserved' | 'enhanced' | 'unchanged';
}

// ============================================================================
// PHASE 1: CATEGORY-SPECIFIC TEMPLATES
// ============================================================================

type CategoryTemplates = {
  [key: string]: string[];
};

const TEMPLATES: CategoryTemplates = {
  // RESTAURANT TEMPLATES
  'restaurant': [
    "{name} is a restaurant in {town}, Martha's Vineyard, known for quality cuisine and welcoming locals and visitors year-round.",
    "{name} offers dining in {town}, Martha's Vineyard, serving fresh meals in a relaxed island setting.",
    "{name} is a popular dining destination in {town}, Martha's Vineyard, providing delicious food and friendly service.",
    "Located in {town}, {name} serves the Martha's Vineyard community with flavorful dishes and warm hospitality.",
    "{name} brings delicious dining to {town}, Martha's Vineyard, offering a memorable meal for island visitors and residents alike.",
  ],

  // LODGING TEMPLATES (hotels, inns, B&Bs)
  'lodging': [
    "{name} offers comfortable accommodations in {town}, Martha's Vineyard, providing a relaxing island retreat for visitors.",
    "Stay at {name} in {town}, Martha's Vineyard, and enjoy charming accommodations with true island hospitality.",
    "{name} welcomes guests to {town}, Martha's Vineyard, offering quality lodging and a peaceful island getaway.",
    "Located in {town}, {name} provides comfortable accommodations for visitors exploring Martha's Vineyard.",
    "{name} is a welcoming destination in {town}, Martha's Vineyard, offering restful stays for island visitors.",
  ],

  'inn': [
    "{name} is a charming inn in {town}, Martha's Vineyard, offering cozy accommodations and personalized hospitality.",
    "Experience island charm at {name} in {town}, Martha's Vineyard, a welcoming inn for visitors seeking comfort.",
    "{name} welcomes guests to {town}, Martha's Vineyard, providing intimate inn accommodations with local character.",
    "Stay at {name} in {town}, Martha's Vineyard, and enjoy the warmth of a classic New England inn experience.",
    "Located in {town}, {name} offers guests a peaceful retreat with the hospitality Martha's Vineyard is known for.",
  ],

  'hotel': [
    "{name} is a hotel in {town}, Martha's Vineyard, offering quality accommodations for island visitors.",
    "Experience Martha's Vineyard hospitality at {name} in {town}, a welcoming hotel for travelers.",
    "{name} provides comfortable hotel accommodations in {town}, Martha's Vineyard, for visitors year-round.",
    "Stay at {name} in {town}, Martha's Vineyard, and enjoy convenient hotel amenities during your island visit.",
    "Located in {town}, {name} offers hotel accommodations perfect for exploring Martha's Vineyard.",
  ],

  // SHOPPING TEMPLATES
  'shopping': [
    "{name} is a shop in {town}, Martha's Vineyard, offering unique finds for locals and visitors alike.",
    "Visit {name} in {town}, Martha's Vineyard, for quality merchandise and friendly island service.",
    "{name} serves shoppers in {town}, Martha's Vineyard, with carefully selected items and local charm.",
    "Located in {town}, {name} offers a distinctive shopping experience on Martha's Vineyard.",
    "{name} welcomes customers to {town}, Martha's Vineyard, providing quality products and personalized service.",
  ],

  'retail': [
    "{name} is a retail destination in {town}, Martha's Vineyard, serving island shoppers with quality goods.",
    "Shop at {name} in {town}, Martha's Vineyard, for a curated selection of merchandise.",
    "{name} offers retail shopping in {town}, Martha's Vineyard, with products for residents and visitors.",
    "Located in {town}, {name} provides a welcoming retail experience on Martha's Vineyard.",
    "Visit {name} in {town}, Martha's Vineyard, for quality retail finds and friendly service.",
  ],

  // BAR & NIGHTLIFE TEMPLATES
  'bar': [
    "{name} is a bar in {town}, Martha's Vineyard, offering drinks and entertainment for island visitors.",
    "Enjoy the atmosphere at {name} in {town}, Martha's Vineyard, a popular spot for locals and visitors.",
    "{name} serves drinks in {town}, Martha's Vineyard, providing a welcoming space for socializing.",
    "Located in {town}, {name} offers a relaxed bar experience on Martha's Vineyard.",
    "Visit {name} in {town}, Martha's Vineyard, for good drinks and island hospitality.",
  ],

  // CAFE TEMPLATES
  'cafe': [
    "{name} is a cafe in {town}, Martha's Vineyard, serving coffee, light fare, and island hospitality.",
    "Visit {name} in {town}, Martha's Vineyard, for quality coffee and a relaxed atmosphere.",
    "{name} offers cafe dining in {town}, Martha's Vineyard, perfect for breakfast or a quick bite.",
    "Located in {town}, {name} serves coffee and fare to the Martha's Vineyard community.",
    "Enjoy coffee and more at {name} in {town}, Martha's Vineyard, a welcoming cafe for all.",
  ],

  // BAKERY TEMPLATES
  'bakery': [
    "{name} is a bakery in {town}, Martha's Vineyard, offering fresh baked goods daily.",
    "Visit {name} in {town}, Martha's Vineyard, for delicious pastries and baked treats.",
    "{name} serves the {town} community on Martha's Vineyard with quality baked goods.",
    "Located in {town}, {name} offers fresh-baked items for locals and visitors alike.",
    "Enjoy fresh pastries at {name} in {town}, Martha's Vineyard, a neighborhood bakery favorite.",
  ],

  // HEALTH & WELLNESS TEMPLATES
  'wellness': [
    "{name} provides wellness services in {town}, Martha's Vineyard, supporting health and relaxation.",
    "Visit {name} in {town}, Martha's Vineyard, for professional wellness and self-care services.",
    "{name} serves the {town} community on Martha's Vineyard with health and wellness offerings.",
    "Located in {town}, {name} offers wellness services to residents and visitors of Martha's Vineyard.",
    "Experience wellness at {name} in {town}, Martha's Vineyard, dedicated to your health and wellbeing.",
  ],

  'spa': [
    "{name} is a spa in {town}, Martha's Vineyard, offering relaxation and rejuvenation services.",
    "Relax at {name} in {town}, Martha's Vineyard, a spa dedicated to your comfort and wellness.",
    "{name} provides spa services in {town}, Martha's Vineyard, for visitors seeking relaxation.",
    "Located in {town}, {name} offers spa treatments in a peaceful Martha's Vineyard setting.",
    "Visit {name} in {town}, Martha's Vineyard, for spa experiences that refresh and restore.",
  ],

  'salon': [
    "{name} is a salon in {town}, Martha's Vineyard, providing beauty and grooming services.",
    "Visit {name} in {town}, Martha's Vineyard, for professional salon services and care.",
    "{name} serves clients in {town}, Martha's Vineyard, with quality beauty treatments.",
    "Located in {town}, {name} offers salon services to the Martha's Vineyard community.",
    "Experience quality care at {name} in {town}, Martha's Vineyard, a welcoming salon.",
  ],

  // GALLERY TEMPLATES
  'gallery': [
    "{name} is an art gallery in {town}, Martha's Vineyard, featuring works by local and regional artists.",
    "Visit {name} in {town}, Martha's Vineyard, to explore fine art and creative works.",
    "{name} showcases art in {town}, Martha's Vineyard, bringing culture to the island community.",
    "Located in {town}, {name} offers art exhibitions and gallery experiences on Martha's Vineyard.",
    "Discover art at {name} in {town}, Martha's Vineyard, a gallery celebrating creative expression.",
  ],

  // COMMUNITY TEMPLATES
  'community': [
    "{name} serves the {town} community on Martha's Vineyard with programs and services.",
    "Located in {town}, {name} supports the Martha's Vineyard community through dedicated service.",
    "{name} provides community services in {town}, Martha's Vineyard, for residents and visitors.",
    "Visit {name} in {town}, Martha's Vineyard, a community organization serving the island.",
    "{name} contributes to {town}, Martha's Vineyard, through community programs and engagement.",
  ],

  // PROFESSIONAL SERVICES TEMPLATES
  'professional services': [
    "{name} provides professional services in {town}, Martha's Vineyard, serving businesses and residents.",
    "Located in {town}, {name} offers professional services to the Martha's Vineyard community.",
    "{name} serves {town}, Martha's Vineyard, with quality professional services and expertise.",
    "Trust {name} in {town}, Martha's Vineyard, for reliable professional services.",
    "Visit {name} in {town}, Martha's Vineyard, for professional services you can count on.",
  ],

  // CONTRACTOR TEMPLATES
  'contractors': [
    "{name} provides contracting services in {town}, Martha's Vineyard, for residential and commercial projects.",
    "Located in {town}, {name} offers quality contracting work on Martha's Vineyard.",
    "{name} serves the {town} area on Martha's Vineyard with professional contracting services.",
    "Trust {name} in {town}, Martha's Vineyard, for reliable construction and renovation work.",
    "{name} brings skilled contracting services to {town}, Martha's Vineyard, and the surrounding area.",
  ],

  // RECREATION TEMPLATES
  'recreation': [
    "{name} offers recreational activities in {town}, Martha's Vineyard, for visitors and locals.",
    "Experience outdoor fun at {name} in {town}, Martha's Vineyard, with activities for all ages.",
    "{name} provides recreation in {town}, Martha's Vineyard, bringing active experiences to the island.",
    "Located in {town}, {name} offers recreational opportunities on Martha's Vineyard.",
    "Visit {name} in {town}, Martha's Vineyard, for memorable recreational experiences.",
  ],

  // VACATION RENTAL TEMPLATES
  'vacation rental': [
    "{name} offers vacation rentals in {town}, Martha's Vineyard, for visitors seeking island stays.",
    "Book with {name} in {town}, Martha's Vineyard, for comfortable vacation accommodations.",
    "{name} provides vacation rental options in {town}, Martha's Vineyard, for travelers.",
    "Located in {town}, {name} offers vacation rentals perfect for exploring Martha's Vineyard.",
    "Stay with {name} in {town}, Martha's Vineyard, and enjoy a home away from home.",
  ],

  // MUSEUM TEMPLATES
  'museum': [
    "{name} is a museum in {town}, Martha's Vineyard, preserving and sharing island history and culture.",
    "Visit {name} in {town}, Martha's Vineyard, for exhibits and programs exploring local heritage.",
    "{name} serves the Martha's Vineyard community from {town} with cultural and educational offerings.",
    "Located in {town}, {name} offers museum experiences celebrating Martha's Vineyard.",
    "Discover history at {name} in {town}, Martha's Vineyard, a museum for all ages.",
  ],

  // DEFAULT/OTHER TEMPLATES
  'other': [
    "{name} serves the {town} community on Martha's Vineyard with quality products and services.",
    "Located in {town}, {name} offers services to residents and visitors of Martha's Vineyard.",
    "{name} is a business in {town}, Martha's Vineyard, serving the island community.",
    "Visit {name} in {town}, Martha's Vineyard, for quality service and island hospitality.",
    "{name} welcomes customers to {town}, Martha's Vineyard, with friendly service and care.",
  ],
};

// ============================================================================
// PHASE 2: RANDOMIZED SAFE VARIATION
// ============================================================================

// Simple seeded random for consistent but varied results
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function selectTemplate(category: string, recordId: number): { template: string; templateIndex: number } {
  // Normalize category
  const normalizedCategory = category.toLowerCase().trim();

  // Find matching templates
  let templates = TEMPLATES['other'];
  let matchedCategory = 'other';

  for (const [cat, tmpl] of Object.entries(TEMPLATES)) {
    if (normalizedCategory.includes(cat) || cat.includes(normalizedCategory)) {
      templates = tmpl;
      matchedCategory = cat;
      break;
    }
  }

  // Use record ID as seed for consistent variation
  const index = Math.floor(seededRandom(recordId) * templates.length);

  return {
    template: templates[index],
    templateIndex: index
  };
}

function generateDescription(template: string, name: string, town: string): string {
  return template
    .replace(/{name}/g, name)
    .replace(/{town}/g, town || 'Martha\'s Vineyard');
}

// ============================================================================
// PHASE 4 & 5: IDENTIFY DESCRIPTIONS TO PRESERVE vs ENHANCE
// ============================================================================

// Patterns that indicate a generated/generic description
const GENERATED_PATTERNS = [
  /^.+ is a .+ located in .+, Martha's Vineyard, providing .+ for residents and visitors\.$/,
  /^.+ is a .+ in .+, Martha's Vineyard,/,
  /^Located in .+, .+ offers .+ to the Martha's Vineyard community/,
  /^.+ serves the .+ community on Martha's Vineyard/,
];

// Minimum quality indicators
const QUALITY_INDICATORS = [
  /\bsince \d{4}\b/i,           // Established date
  /\bfamily[- ]owned\b/i,       // Family business
  /\bspecializ/i,               // Specialization mention
  /\baward/i,                   // Awards
  /\bfresh\b.*\blocal/i,        // Fresh/local sourcing
  /\bartisan/i,                 // Artisan
  /\bhandmade\b/i,              // Handmade
  /\borganic\b/i,               // Organic
  /\bhistoric\b/i,              // Historic
  /\biconic\b/i,                // Iconic
  /\bfeaturing\b/i,             // Featured items
  /\bknown for\b/i,             // Known for something
  /\byear-round\b/i,            // Year-round operation
  /\bseasonal\b/i,              // Seasonal specialty
];

function assessDescriptionQuality(desc: string | null, businessName: string): DescriptionQuality {
  if (!desc || desc.trim().length < 40) {
    return 'generated';
  }

  // Check if it's a previously generated description
  for (const pattern of GENERATED_PATTERNS) {
    if (pattern.test(desc)) {
      return 'generated';
    }
  }

  // Check for quality indicators
  let qualityScore = 0;
  for (const pattern of QUALITY_INDICATORS) {
    if (pattern.test(desc)) {
      qualityScore++;
    }
  }

  // Check length and specificity
  if (desc.length > 150) qualityScore++;
  if (desc.length > 250) qualityScore++;

  // Check if contains specific details (numbers, proper nouns beyond business name)
  if (/\d+/.test(desc)) qualityScore++;

  // Determine quality level
  if (qualityScore >= 3) {
    return 'high';
  } else if (qualityScore >= 1 || desc.length > 100) {
    return 'medium';
  }

  return 'generated';
}

// ============================================================================
// PHASE 6: DATABASE MIGRATION FOR QUALITY FIELD
// ============================================================================

function ensureQualityColumn(db: Database.Database): void {
  try {
    db.exec(`ALTER TABLE businesses ADD COLUMN description_quality TEXT DEFAULT 'generated'`);
    console.log('  Added description_quality column');
  } catch (e: unknown) {
    const error = e as Error;
    if (!error.message.includes('duplicate column')) {
      throw e;
    }
  }
}

// ============================================================================
// MAIN EXECUTION
// ============================================================================

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  DESCRIPTION ENHANCEMENT PIPELINE');
  console.log('  Category-Aware Templates with Quality Preservation');
  console.log('═══════════════════════════════════════════════════════════════\n');

  const db = new Database(DB_PATH);

  // Ensure quality column exists
  ensureQualityColumn(db);

  // Get all public records
  const records = db.prepare(`
    SELECT id, business_name, category, town, short_description, primary_source
    FROM businesses
    WHERE suppress_from_directory = 0 AND is_duplicate = 0
    ORDER BY id
  `).all() as Record[];

  console.log(`Processing ${records.length} public records...\n`);

  const results: EnhancementResult[] = [];
  const stats = {
    preserved: 0,
    enhanced: 0,
    unchanged: 0,
    qualityHigh: 0,
    qualityMedium: 0,
    qualityGenerated: 0,
  };
  const templateUsage: Record<string, number> = {};

  // Prepare update statements
  const updateDesc = db.prepare(`
    UPDATE businesses
    SET short_description = ?, description_quality = ?
    WHERE id = ?
  `);

  const updateQualityOnly = db.prepare(`
    UPDATE businesses
    SET description_quality = ?
    WHERE id = ?
  `);

  console.log('─────────────────────────────────────────────────────────────────');
  console.log('  PROCESSING DESCRIPTIONS');
  console.log('─────────────────────────────────────────────────────────────────\n');

  for (const record of records) {
    const quality = assessDescriptionQuality(record.short_description, record.business_name);
    let action: 'preserved' | 'enhanced' | 'unchanged' = 'unchanged';
    let newDesc = record.short_description;
    let templateUsed: string | null = null;

    if (quality === 'high') {
      // PRESERVE - High quality original description
      stats.preserved++;
      stats.qualityHigh++;
      action = 'preserved';
      updateQualityOnly.run('high', record.id);

    } else if (quality === 'medium') {
      // PRESERVE - Medium quality, don't overwrite
      stats.preserved++;
      stats.qualityMedium++;
      action = 'preserved';
      updateQualityOnly.run('medium', record.id);

    } else {
      // ENHANCE - Generate better description
      const { template, templateIndex } = selectTemplate(record.category || 'other', record.id);
      newDesc = generateDescription(template, record.business_name, record.town);

      // Track template usage
      const templateKey = `${record.category || 'other'}_${templateIndex}`;
      templateUsage[templateKey] = (templateUsage[templateKey] || 0) + 1;

      updateDesc.run(newDesc, 'generated', record.id);
      stats.enhanced++;
      stats.qualityGenerated++;
      action = 'enhanced';
      templateUsed = template;

      console.log(`  ✨ ID ${record.id}: ${record.business_name.slice(0, 30)}`);
      console.log(`      Category: ${record.category || 'other'}`);
      console.log(`      New: "${newDesc.slice(0, 70)}..."`);
    }

    results.push({
      id: record.id,
      name: record.business_name,
      category: record.category || 'other',
      oldDesc: record.short_description,
      newDesc: action === 'enhanced' ? newDesc : null,
      quality,
      templateUsed,
      action
    });
  }

  // ============================================================================
  // PHASE 7: REPORT
  // ============================================================================

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  ENHANCEMENT RESULTS');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log(`  Total records processed:    ${records.length}`);
  console.log(`  Records preserved:          ${stats.preserved}`);
  console.log(`  Records enhanced:           ${stats.enhanced}`);
  console.log('');
  console.log('  DESCRIPTION QUALITY DISTRIBUTION:');
  console.log(`    High quality:             ${stats.qualityHigh}`);
  console.log(`    Medium quality:           ${stats.qualityMedium}`);
  console.log(`    Generated:                ${stats.qualityGenerated}`);

  // Template usage summary
  console.log('\n  TEMPLATE USAGE BY CATEGORY:');
  const categoryUsage: Record<string, number> = {};
  for (const [key, count] of Object.entries(templateUsage)) {
    const category = key.split('_')[0];
    categoryUsage[category] = (categoryUsage[category] || 0) + count;
  }
  for (const [category, count] of Object.entries(categoryUsage).sort((a, b) => b[1] - a[1])) {
    console.log(`    ${category.padEnd(25)} ${count}`);
  }

  // Sample preserved (high quality)
  const preserved = results.filter(r => r.quality === 'high');
  if (preserved.length > 0) {
    console.log('\n  ═══ SAMPLE HIGH QUALITY DESCRIPTIONS (preserved) ═══\n');
    for (const r of preserved.slice(0, 5)) {
      console.log(`    ✓ ID ${r.id}: ${r.name}`);
      console.log(`      "${(r.oldDesc || '').slice(0, 80)}..."`);
    }
  }

  // Sample enhanced
  const enhanced = results.filter(r => r.action === 'enhanced');
  if (enhanced.length > 0) {
    console.log('\n  ═══ SAMPLE ENHANCED DESCRIPTIONS ═══\n');
    for (const r of enhanced.slice(0, 10)) {
      console.log(`    ✨ ID ${r.id}: ${r.name} (${r.category})`);
      console.log(`       "${(r.newDesc || '').slice(0, 80)}..."`);
    }
  }

  // Save report
  const report = {
    timestamp: new Date().toISOString(),
    stats,
    templateUsage,
    categoryUsage,
    preserved: results.filter(r => r.action === 'preserved').map(r => ({
      id: r.id,
      name: r.name,
      quality: r.quality
    })),
    enhanced: results.filter(r => r.action === 'enhanced').map(r => ({
      id: r.id,
      name: r.name,
      category: r.category,
      description: r.newDesc
    })),
  };

  const reportPath = path.join(EXPORTS_PATH, 'description-enhance-report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  Report saved to: ${reportPath}`);
  console.log('═══════════════════════════════════════════════════════════════\n');

  db.close();
}

main().catch(console.error);
