#!/usr/bin/env node
/**
 * Email Privacy Validation Script
 *
 * Checks that email addresses are NOT exposed in:
 * - Public JSON exports
 * - Public API endpoint code
 * - Public UI components
 *
 * And verifies emails ARE still available in:
 * - Admin API endpoints
 * - Admin UI components
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const ERRORS = [];
const SUCCESSES = [];

function log(type, message) {
  if (type === 'error') {
    ERRORS.push(message);
    console.log(`❌ ${message}`);
  } else if (type === 'success') {
    SUCCESSES.push(message);
    console.log(`✅ ${message}`);
  } else {
    console.log(`ℹ️  ${message}`);
  }
}

function checkFileForEmailField(filepath, shouldContain, context) {
  if (!fs.existsSync(filepath)) {
    log('error', `File not found: ${filepath}`);
    return;
  }

  const content = fs.readFileSync(filepath, 'utf-8');
  const hasEmail = content.includes('"email"') || content.includes("'email'") || content.includes('email:');

  if (shouldContain && !hasEmail) {
    log('error', `${context}: Email field MISSING (should be present)`);
  } else if (!shouldContain && hasEmail) {
    // More specific check for actual email data vs email form fields
    const hasEmailData = /"email"\s*:/ .test(content) && !content.includes('// email: REMOVED');
    if (hasEmailData && !filepath.includes('/admin/')) {
      log('error', `${context}: Email field FOUND in public file (should be removed)`);
    } else {
      log('success', `${context}: Email field properly handled`);
    }
  } else if (shouldContain && hasEmail) {
    log('success', `${context}: Email field present (correct)`);
  } else {
    log('success', `${context}: No email field (correct)`);
  }
}

function checkJSONExportForEmails(filepath, context) {
  if (!fs.existsSync(filepath)) {
    log('error', `File not found: ${filepath}`);
    return;
  }

  const content = fs.readFileSync(filepath, 'utf-8');
  const emailMatches = content.match(/"email"\s*:/g) || [];

  if (emailMatches.length > 0) {
    log('error', `${context}: Found ${emailMatches.length} email fields (should be 0)`);
  } else {
    log('success', `${context}: No email fields found (correct)`);
  }
}

console.log('🔒 Email Privacy Validation\n');
console.log('═══════════════════════════════════════════════════════\n');

// 1. Check public JSON exports
console.log('📁 Checking Public JSON Exports...\n');

checkJSONExportForEmails(
  path.join(ROOT, 'data/exports/businesses.json'),
  'Public Export (businesses.json)'
);

checkJSONExportForEmails(
  path.join(ROOT, 'data/exports/mv-business-directory-public.json'),
  'Public Export (mv-business-directory-public.json)'
);

// 2. Check public API endpoint
console.log('\n📡 Checking Public API Endpoints...\n');

const publicApiPath = path.join(ROOT, 'api/directory/businesses.ts');
if (fs.existsSync(publicApiPath)) {
  const content = fs.readFileSync(publicApiPath, 'utf-8');
  if (content.includes('email: row.email') && !content.includes('// email: REMOVED')) {
    log('error', 'Public API: Email field being returned');
  } else if (content.includes('email: REMOVED') || !content.includes('email: row.email')) {
    log('success', 'Public API: Email field removed from response');
  }
} else {
  log('error', 'Public API file not found');
}

// 3. Check public UI components
console.log('\n🖥️  Checking Public UI Components...\n');

const businessPagePath = path.join(ROOT, 'src/pages/directory/BusinessPage.tsx');
if (fs.existsSync(businessPagePath)) {
  const content = fs.readFileSync(businessPagePath, 'utf-8');
  // Check if email is being displayed (mailto: link)
  if (content.includes('mailto:${business.email}') && !content.includes('/* Email removed')) {
    log('error', 'BusinessPage: Email being displayed');
  } else {
    log('success', 'BusinessPage: Email not displayed');
  }
}

// 4. Check admin endpoints still have email
console.log('\n👑 Verifying Admin Access to Emails...\n');

const adminApiPath = path.join(ROOT, 'api/admin/businesses.ts');
if (fs.existsSync(adminApiPath)) {
  const content = fs.readFileSync(adminApiPath, 'utf-8');
  if (content.includes('email:') && content.includes('sanitize(data.email)')) {
    log('success', 'Admin API: Email field still accessible');
  } else {
    log('error', 'Admin API: Email field may be missing');
  }
}

const adminEditDrawerPath = path.join(ROOT, 'src/components/directory/AdminEditDrawer.tsx');
if (fs.existsSync(adminEditDrawerPath)) {
  const content = fs.readFileSync(adminEditDrawerPath, 'utf-8');
  if (content.includes('id="email"') && content.includes('formData.email')) {
    log('success', 'AdminEditDrawer: Email form field present');
  } else {
    log('error', 'AdminEditDrawer: Email form field may be missing');
  }
}

// 5. Check rate limiting is in place
console.log('\n⏱️  Verifying Rate Limiting...\n');

if (fs.existsSync(publicApiPath)) {
  const content = fs.readFileSync(publicApiPath, 'utf-8');
  if (content.includes('rateLimit') && content.includes('rate-limit')) {
    log('success', 'Public API: Rate limiting implemented');
  } else {
    log('error', 'Public API: Rate limiting NOT found');
  }
}

// 6. Check noemailindex meta tags
console.log('\n🏷️  Verifying Anti-Scraping Meta Tags...\n');

const seoPath = path.join(ROOT, 'src/components/SEO.tsx');
if (fs.existsSync(seoPath)) {
  const content = fs.readFileSync(seoPath, 'utf-8');
  if (content.includes('noEmailIndex') && content.includes('noemailindex')) {
    log('success', 'SEO component: noEmailIndex support added');
  } else {
    log('error', 'SEO component: noEmailIndex support missing');
  }
}

// Summary
console.log('\n═══════════════════════════════════════════════════════');
console.log('📊 VALIDATION SUMMARY\n');
console.log(`   ✅ Passed: ${SUCCESSES.length}`);
console.log(`   ❌ Failed: ${ERRORS.length}`);

if (ERRORS.length === 0) {
  console.log('\n✅ All email privacy checks passed!');
  console.log('   Email addresses are protected from public access.');
  process.exit(0);
} else {
  console.log('\n❌ Some checks failed:');
  ERRORS.forEach(e => console.log(`   - ${e}`));
  process.exit(1);
}
