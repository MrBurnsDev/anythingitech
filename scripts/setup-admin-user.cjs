#!/usr/bin/env node
/**
 * Setup Admin User
 *
 * Creates the initial admin user for the directory dashboard.
 * Password is read from environment variable or command line argument.
 *
 * Usage:
 *   ADMIN_PASSWORD=yourpassword node scripts/setup-admin-user.cjs
 *   or
 *   node scripts/setup-admin-user.cjs yourpassword
 */

const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'mv_registry.db');

// Get password from env or args
const password = process.env.ADMIN_PASSWORD || process.argv[2];

if (!password) {
  console.error('Error: No password provided.');
  console.error('Usage: ADMIN_PASSWORD=yourpassword node scripts/setup-admin-user.cjs');
  console.error('   or: node scripts/setup-admin-user.cjs yourpassword');
  process.exit(1);
}

if (password.length < 8) {
  console.error('Error: Password must be at least 8 characters.');
  process.exit(1);
}

const db = new Database(DB_PATH);

// Check if admin user already exists
const existing = db.prepare('SELECT id FROM admin_users WHERE username = ?').get('admin');

if (existing) {
  // Update existing admin password
  const hash = bcrypt.hashSync(password, 10);
  db.prepare(`
    UPDATE admin_users
    SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
    WHERE username = 'admin'
  `).run(hash);
  console.log('✓ Admin password updated successfully.');
} else {
  // Create new admin user
  const hash = bcrypt.hashSync(password, 10);
  db.prepare(`
    INSERT INTO admin_users (username, password_hash, display_name, email, role)
    VALUES (?, ?, ?, ?, ?)
  `).run('admin', hash, 'Administrator', 'louis@anythingitechmv.com', 'admin');
  console.log('✓ Admin user created successfully.');
}

console.log('');
console.log('Admin credentials:');
console.log('  Username: admin');
console.log('  Password: (as provided)');
console.log('');
console.log('You can now log in at /admin/login');

db.close();
