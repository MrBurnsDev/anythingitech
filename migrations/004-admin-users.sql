-- Admin Users and Audit Log
-- Run: sqlite3 data/mv_registry.db < migrations/004-admin-users.sql

-- Admin users table
CREATE TABLE IF NOT EXISTS admin_users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  display_name TEXT,
  email TEXT,
  role TEXT DEFAULT 'admin',
  is_active INTEGER DEFAULT 1,
  last_login_at TEXT,
  created_at TEXT DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT DEFAULT CURRENT_TIMESTAMP
);

-- Audit log for tracking all changes
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL, -- 'business', 'user', etc.
  entity_id INTEGER,
  action TEXT NOT NULL, -- 'create', 'update', 'delete', 'archive', 'login', 'logout'
  changes TEXT, -- JSON of changed fields
  previous_values TEXT, -- JSON of previous values
  performed_by TEXT NOT NULL, -- username
  performed_at TEXT DEFAULT CURRENT_TIMESTAMP,
  ip_address TEXT,
  user_agent TEXT
);

-- Index for audit log queries
CREATE INDEX IF NOT EXISTS idx_audit_entity ON audit_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_performed_at ON audit_log(performed_at);
CREATE INDEX IF NOT EXISTS idx_audit_performed_by ON audit_log(performed_by);

-- Add internal_notes column if not exists (for admin notes)
-- Note: SQLite doesn't have IF NOT EXISTS for ALTER TABLE, so we'll handle this in code
