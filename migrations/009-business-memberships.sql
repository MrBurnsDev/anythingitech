-- Business Memberships: tracks each business's presence in external local directories.
-- Treats inclusion as a temporal observation (last crawl), NOT a permanent certification.
-- Designed so new sources can be added without schema changes.
--
-- Run: sqlite3 data/mv_registry.db < migrations/009-business-memberships.sql

CREATE TABLE IF NOT EXISTS business_memberships (
  business_id        INTEGER NOT NULL,
  source             TEXT    NOT NULL,  -- 'chamber' | 'gazette' | 'gomv' | 'blackOwned' | future...
  listed             INTEGER NOT NULL,  -- 1 = present, 0 = explicitly absent (rare; we usually omit instead)
  last_verified_at   TEXT    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  external_name      TEXT,              -- name as it appears in the source directory
  external_url       TEXT,              -- link to the business's profile in the source directory
  external_website   TEXT,              -- the business website the source has on file
  match_tier         INTEGER,           -- 1 = website-domain match, 2 = exact name+town match
  match_confidence   REAL,              -- 0..1, informational
  notes              TEXT,
  created_at         TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at         TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (business_id, source),
  FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_business_memberships_source
  ON business_memberships(source, listed);

CREATE INDEX IF NOT EXISTS idx_business_memberships_business
  ON business_memberships(business_id);

-- Catalog of sources we know about, so the export pipeline and the UI can render
-- consistent neutral labels without hardcoding strings everywhere.
CREATE TABLE IF NOT EXISTS membership_sources (
  source           TEXT PRIMARY KEY,
  display_label    TEXT NOT NULL,   -- e.g. "Listed in Chamber Directory"
  source_url       TEXT,            -- the directory homepage
  counts_for_local INTEGER NOT NULL DEFAULT 0,  -- 1 = contributes to verifiedLocalBusiness
  description      TEXT,
  created_at       TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed the four sources we ship with. Idempotent via INSERT OR REPLACE.
INSERT OR REPLACE INTO membership_sources
  (source,       display_label,                                source_url,                                       counts_for_local, description)
VALUES
  ('chamber',    'Listed in Chamber Directory',                'https://business.mvy.com/memberdirectory',       1, 'Martha''s Vineyard Chamber of Commerce member directory'),
  ('gazette',    'Listed in Vineyard Gazette Directory',       'https://vineyardgazette.com/business-directory', 1, 'Vineyard Gazette business directory'),
  ('gomv',       'Listed in Go Martha''s Vineyard Directory',  'https://www.gomarthasvineyard.com/directory',    1, 'Go Martha''s Vineyard tourism directory'),
  ('blackOwned', 'Listed in BlackOwnedMV',                     'https://blackownedmv.com',                       0, 'BlackOwnedMV — Martha''s Vineyard Black-Owned Business Directory');
