-- Create slug_redirects table for automatic redirect handling when slugs change
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS slug_redirects (
  id SERIAL PRIMARY KEY,
  business_id INTEGER NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  old_slug VARCHAR(255) NOT NULL,
  new_slug VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by VARCHAR(100),

  -- Ensure old_slug is unique (can only redirect to one place)
  CONSTRAINT unique_old_slug UNIQUE (old_slug)
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_slug_redirects_old_slug ON slug_redirects(old_slug);
CREATE INDEX IF NOT EXISTS idx_slug_redirects_business_id ON slug_redirects(business_id);

-- Comment
COMMENT ON TABLE slug_redirects IS 'Stores old business slugs that should redirect to new slugs';
