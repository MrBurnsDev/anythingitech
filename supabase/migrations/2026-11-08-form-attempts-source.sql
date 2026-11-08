-- ============================================================================
-- Add `source` to contact_form_attempts so multiple public forms can share one
-- rate-limit / audit table with INDEPENDENT quotas.
-- Created 2026-11-08
-- ============================================================================
--
-- Background:
--   `contact_form_attempts` (migration 2026-05-14) backs the IP/email rate
--   limits for the contact form. The business-directory submission form is now
--   being hardened to reuse the same infrastructure. Without a discriminator,
--   the two forms would consume each other's quotas. This migration adds a
--   `source` column so every rate-limit query and recorded attempt is scoped to
--   the form it came from.
--
-- Backward compatibility / rollout safety:
--   * The column is added with DEFAULT 'contact', so every EXISTING row is
--     backfilled to 'contact' automatically and retains its original meaning.
--   * NOT NULL + DEFAULT means inserts that omit `source` (i.e. the current,
--     not-yet-updated contact.ts code) keep working and are recorded as
--     'contact' — so this migration is safe to apply BEFORE the code deploy.
--   * Identifiers are explicit strings: 'contact', 'directory_submission'.
--   * This is an additive, non-destructive change. No data is modified or
--     dropped. It is safe to run on a live database.
--
-- Rollout order (see deployment notes in the PR / change summary):
--     1. Apply THIS migration first.               (old code still works)
--     2. Then deploy the source-scoped code.        (new code filters by source)
--   Applying the migration first is always safe; deploying source-filtering
--   code before the column exists would error, so never reverse the order.

-- 1. Add the column (additive, backfills existing rows to 'contact').
alter table contact_form_attempts
  add column if not exists source text not null default 'contact';

-- 2. Constrain to known form identifiers. Extend this list when adding a new
--    form that reuses this table (keep in sync with FORM_SOURCES in the app).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'contact_form_attempts_source_chk'
  ) then
    alter table contact_form_attempts
      add constraint contact_form_attempts_source_chk
      check (source in ('contact', 'directory_submission'));
  end if;
end $$;

-- 3. Indexes: rate-limit lookups now filter by (source, ip_hash, created_at)
--    and (source, email, created_at). Add composite indexes with `source`
--    leading so per-source counts stay index-only and fast. The original
--    non-source indexes remain for the audit/pruning queries.
create index if not exists contact_form_attempts_source_ip_recent_idx
  on contact_form_attempts (source, ip_hash, created_at desc);

create index if not exists contact_form_attempts_source_email_recent_idx
  on contact_form_attempts (source, email, created_at desc)
  where email is not null;

-- RLS remains enabled from the original migration; only the service-role API
-- writes here. No policy change required.
