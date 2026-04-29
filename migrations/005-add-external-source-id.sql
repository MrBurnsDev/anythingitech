-- Primary Key Audit Migration
-- Generated: 2026-04-29T03:41:40.304Z
-- Purpose: Add stable external_source_id field for cross-system matching

-- Add external_source_id column
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS external_source_id TEXT;

-- Add verification_source column to track data origin
ALTER TABLE businesses ADD COLUMN IF NOT EXISTS verification_source TEXT DEFAULT 'manual';

-- Create unique index on external_source_id (allows NULLs)
CREATE UNIQUE INDEX IF NOT EXISTS idx_businesses_external_source_id
  ON businesses(external_source_id)
  WHERE external_source_id IS NOT NULL;

-- Create index on verification_source for filtering
CREATE INDEX IF NOT EXISTS idx_businesses_verification_source
  ON businesses(verification_source);

-- Populate external_source_id for existing records based on slug
UPDATE businesses
SET external_source_id = 'supabase:' || COALESCE(slug, 'unknown')
WHERE external_source_id IS NULL;

-- Update verification_source for records that came from known imports
-- (Run these after manual review of import sources)

-- COMMENT: Import scripts should now use external_source_id for matching:
-- 1. Generate external_source_id from source name + town + business name
-- 2. Use UPSERT with external_source_id as conflict key
-- 3. Never rely on numeric ID for matching across systems
