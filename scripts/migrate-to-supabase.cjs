#!/usr/bin/env node
/**
 * Migrate SQLite data to Supabase
 */

const { createClient } = require('@supabase/supabase-js');
const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const SUPABASE_URL = 'https://zrrinbeyiuiydalxiwii.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpycmluYmV5aXVpeWRhbHhpd2lpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NzMyMjEwMCwiZXhwIjoyMDkyODk4MTAwfQ.I9mzXQyW_yPd31Nd4k_HxtVs3tY7OugJTxb5FNQFjaE';

const DB_PATH = path.join(__dirname, '..', 'data', 'mv_registry.db');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runMigration() {
  console.log('Reading migration SQL...');
  const migrationSQL = fs.readFileSync(
    path.join(__dirname, '..', 'supabase', 'migrations', '001-init.sql'),
    'utf-8'
  );

  console.log('Running migration on Supabase...');

  // Split by semicolons and run each statement
  const statements = migrationSQL
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    try {
      const { error } = await supabase.rpc('exec_sql', { sql: statement + ';' });
      if (error && !error.message.includes('already exists')) {
        console.log('Statement:', statement.substring(0, 50) + '...');
        console.log('Error:', error.message);
      }
    } catch (e) {
      // Ignore errors for now, we'll run via SQL editor
    }
  }

  console.log('Migration statements prepared. Please run them in Supabase SQL Editor.');
}

async function migrateData() {
  console.log('Opening SQLite database...');
  const db = new Database(DB_PATH, { readonly: true });

  // Get all active businesses
  console.log('Reading businesses from SQLite...');
  const businesses = db.prepare(`
    SELECT
      id, business_name, slug, town, category, subcategory,
      short_description, full_address, street_address,
      phone, email, website,
      facebook_url, instagram_url, yelp_url, tripadvisor_url,
      business_status, confidence_score, needs_manual_review, review_reason,
      notes, latitude, longitude, is_duplicate,
      created_at, updated_at
    FROM businesses
    WHERE is_duplicate = 0
  `).all();

  console.log(`Found ${businesses.length} businesses to migrate`);

  // Transform for Supabase (convert SQLite booleans)
  const transformedBusinesses = businesses.map(b => ({
    business_name: b.business_name,
    slug: b.slug,
    town: b.town,
    category: b.category,
    subcategory: b.subcategory || null,
    short_description: b.short_description || null,
    full_address: b.full_address || null,
    street_address: b.street_address || null,
    phone: b.phone || null,
    email: b.email || null,
    website: b.website || null,
    facebook_url: b.facebook_url || null,
    instagram_url: b.instagram_url || null,
    yelp_url: b.yelp_url || null,
    tripadvisor_url: b.tripadvisor_url || null,
    business_status: b.business_status || 'active',
    confidence_score: Math.round(Number(b.confidence_score) || 50),
    needs_manual_review: b.needs_manual_review === 1,
    review_reason: b.review_reason || null,
    notes: b.notes || null,
    latitude: b.latitude || null,
    longitude: b.longitude || null,
    is_duplicate: false,
  }));

  // Insert in batches
  const BATCH_SIZE = 50;
  let inserted = 0;

  for (let i = 0; i < transformedBusinesses.length; i += BATCH_SIZE) {
    const batch = transformedBusinesses.slice(i, i + BATCH_SIZE);

    const { data, error } = await supabase
      .from('businesses')
      .upsert(batch, { onConflict: 'slug' });

    if (error) {
      console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, error.message);
    } else {
      inserted += batch.length;
      console.log(`Inserted batch ${Math.floor(i / BATCH_SIZE) + 1} (${inserted}/${transformedBusinesses.length})`);
    }
  }

  // Create admin user
  console.log('Creating admin user...');
  const adminPassword = process.env.ADMIN_PASSWORD || 'MV_Admin_2024!';
  const passwordHash = bcrypt.hashSync(adminPassword, 10);

  const { error: adminError } = await supabase
    .from('admin_users')
    .upsert({
      username: 'admin',
      password_hash: passwordHash,
      display_name: 'Administrator',
      email: 'louis@anythingitechmv.com',
      role: 'admin',
      is_active: true,
    }, { onConflict: 'username' });

  if (adminError) {
    console.error('Error creating admin user:', adminError.message);
  } else {
    console.log('Admin user created/updated');
  }

  db.close();
  console.log('Migration complete!');
}

async function main() {
  console.log('=== Supabase Migration ===\n');

  // Check if tables exist by trying to query
  const { data, error } = await supabase.from('businesses').select('id').limit(1);

  if (error && error.message.includes('does not exist')) {
    console.log('Tables do not exist. Please run the SQL migration first.');
    console.log('\n1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Copy the contents of supabase/migrations/001-init.sql');
    console.log('3. Paste and run it');
    console.log('4. Then run this script again\n');

    // Output the SQL for easy copy
    const sql = fs.readFileSync(
      path.join(__dirname, '..', 'supabase', 'migrations', '001-init.sql'),
      'utf-8'
    );
    console.log('=== SQL to run ===\n');
    console.log(sql);
    return;
  }

  await migrateData();
}

main().catch(console.error);
