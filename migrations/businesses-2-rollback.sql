-- Businesses 2 Import Rollback
-- Generated: 2026-04-29T03:21:07.194Z
-- Use this to undo the businesses 2 import

-- Remove newly added businesses
DELETE FROM businesses WHERE verification_source = 'businesses_2_import' AND status = 'needs_review';

-- Note: Safe updates cannot be automatically rolled back
-- You would need to restore from backup or manually revert each field