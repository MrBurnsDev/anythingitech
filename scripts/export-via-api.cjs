#!/usr/bin/env node
/**
 * Export Business Data via Production API
 *
 * Since SUPABASE_SERVICE_ROLE_KEY isn't available locally,
 * this script uses the public API to export business data.
 */

const fs = require('fs');
const path = require('path');

const API_BASE = process.env.API_BASE || 'https://anythingitech.vercel.app';

async function getAdminToken() {
  const response = await fetch(`${API_BASE}/api/admin/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'admin', password: 'MV_Admin_2024!' })
  });
  const data = await response.json();
  if (!data.token) {
    throw new Error('Failed to get admin token: ' + JSON.stringify(data));
  }
  return data.token;
}

async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  EXPORT BUSINESS DATA VIA API');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log('Getting admin token...');
  const ADMIN_TOKEN = await getAdminToken();
  console.log('Token obtained successfully\n');

  // Fetch all businesses via admin API (paginated)
  console.log('Fetching businesses from production API...');

  let allBusinesses = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(`${API_BASE}/api/admin/businesses?page=${page}&limit=100`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch businesses: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const businesses = data.businesses || [];
    allBusinesses = allBusinesses.concat(businesses);

    console.log(`  Page ${page}: ${businesses.length} businesses`);

    // Check if there are more pages
    if (data.pagination) {
      hasMore = page < data.pagination.totalPages;
    } else {
      hasMore = businesses.length === 100;
    }
    page++;
  }

  const businesses = allBusinesses;
  console.log(`\nTotal fetched: ${businesses.length} businesses`);

  // Separate public vs needs_review
  // API uses business_status and needs_manual_review fields
  const publicBusinesses = businesses.filter(b =>
    b.business_status === 'active' && !b.needs_manual_review
  );
  const needsReviewBusinesses = businesses.filter(b =>
    b.business_status === 'needs_review' || b.needs_manual_review === true
  );

  console.log(`Public businesses: ${publicBusinesses.length}`);
  console.log(`Needs review / hidden: ${needsReviewBusinesses.length}`);

  // Format for the frontend (matching existing structure)
  const formattedPublic = publicBusinesses.map(b => ({
    id: b.id,
    name: b.business_name || b.name,
    slug: b.slug,
    category: b.category,
    businessType: b.business_type || categoryToBusinessType(b.category),
    subcategory: b.subcategory,
    description: b.short_description || b.description,
    town: b.town,
    townSlug: b.town ? b.town.toLowerCase().replace(/\s+/g, '-') : null,
    address: b.full_address || b.street_address,
    phone: b.phone,
    website: b.website,
    hours: b.hours,
    seasonal: b.seasonal,
    coordinates: b.latitude && b.longitude ? { lat: b.latitude, lng: b.longitude } : null,
    status: b.business_status,
    confidence: b.confidence_score,
    social: {
      facebook: b.facebook_url,
      instagram: b.instagram_url,
      yelp: b.yelp_url,
      tripadvisor: b.tripadvisor_url
    }
  }));

  function categoryToBusinessType(category) {
    const mapping = {
      'Restaurants, Food & Beverages': 'restaurants',
      'Shopping & Specialty Retail': 'shopping',
      'Health & Wellness': 'health-and-wellness',
      'Home & Garden Services': 'home-and-garden',
      'Professional Services': 'professional-services',
      'Lodging & Tourism': 'lodging-and-tourism',
      'Arts & Entertainment': 'arts-and-entertainment',
      'Automotive': 'automotive',
      'Real Estate': 'real-estate',
      'Construction & Trades': 'construction-and-trades',
      'Marine & Boating': 'marine-and-boating',
      'Education & Childcare': 'education-and-childcare',
      'Nonprofit & Community': 'nonprofit-and-community'
    };
    return mapping[category] || 'other';
  }

  // Write exports
  const exportDir = path.join(__dirname, '../src/data');
  const backupDir = path.join(__dirname, '../data/exports');

  // Ensure directories exist
  if (!fs.existsSync(exportDir)) fs.mkdirSync(exportDir, { recursive: true });
  if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });

  // Write public businesses for frontend
  fs.writeFileSync(
    path.join(exportDir, 'businesses.json'),
    JSON.stringify(formattedPublic, null, 2)
  );
  console.log(`\nWritten: src/data/businesses.json (${formattedPublic.length} public records)`);

  // Write full backup with all data
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.writeFileSync(
    path.join(backupDir, `all-businesses-${timestamp}.json`),
    JSON.stringify(businesses, null, 2)
  );
  console.log(`Written: data/exports/all-businesses-${timestamp}.json (${businesses.length} total)`);

  // Write needs_review for staging workflow
  fs.writeFileSync(
    path.join(backupDir, 'needs-review.json'),
    JSON.stringify(needsReviewBusinesses, null, 2)
  );
  console.log(`Written: data/exports/needs-review.json (${needsReviewBusinesses.length} staged)`);

  // Generate summary
  const summary = {
    timestamp: new Date().toISOString(),
    totalBusinesses: businesses.length,
    publicBusinesses: publicBusinesses.length,
    needsReview: needsReviewBusinesses.length,
    byTown: {},
    byCategory: {},
    byStatus: {}
  };

  for (const b of businesses) {
    summary.byTown[b.town] = (summary.byTown[b.town] || 0) + 1;
    summary.byCategory[b.category] = (summary.byCategory[b.category] || 0) + 1;
    summary.byStatus[b.business_status] = (summary.byStatus[b.business_status] || 0) + 1;
  }

  fs.writeFileSync(
    path.join(backupDir, 'export-summary.json'),
    JSON.stringify(summary, null, 2)
  );
  console.log(`Written: data/exports/export-summary.json`);

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('  EXPORT COMPLETE');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log(`\nTotal businesses: ${businesses.length}`);
  console.log(`Public (live): ${publicBusinesses.length}`);
  console.log(`Staged (needs_review): ${needsReviewBusinesses.length}`);

  console.log('\nBy Status:');
  for (const [status, count] of Object.entries(summary.byStatus)) {
    console.log(`  ${status}: ${count}`);
  }

  console.log('\nBy Town:');
  for (const [town, count] of Object.entries(summary.byTown).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${town}: ${count}`);
  }
}

main().catch(console.error);
