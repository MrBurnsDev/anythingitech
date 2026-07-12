-- ============================================================================
-- Contact form spam protection — rate-limit log + spam audit
-- Created 2026-05-14
-- ============================================================================
--
-- Tracks every contact-form attempt (accepted or blocked) with IP, email,
-- and outcome. Used by api/contact.ts for IP and per-email rate limits, and
-- as an audit trail for spam analysis.
--
-- This table is append-only. A scheduled job (or manual sweep) can prune
-- rows older than 30 days; rate-limit checks only ever look at the last hour.

create table if not exists contact_form_attempts (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  ip_hash     text not null,             -- sha256(ip + secret), never raw IP
  email       text,
  outcome     text not null,             -- 'sent', 'rate_limited', 'spam_blocked', 'validation_failed', 'turnstile_failed'
  reason      text,                      -- short explanation, e.g. 'honeypot', 'too_fast', 'bad_token'
  spam_score  integer,                   -- 0-100; >= 60 blocked

  constraint contact_form_attempts_outcome_chk check (
    outcome in ('sent', 'rate_limited', 'spam_blocked', 'validation_failed', 'turnstile_failed')
  )
);

create index if not exists contact_form_attempts_ip_recent_idx
  on contact_form_attempts (ip_hash, created_at desc);

create index if not exists contact_form_attempts_email_recent_idx
  on contact_form_attempts (email, created_at desc)
  where email is not null;

create index if not exists contact_form_attempts_created_at_idx
  on contact_form_attempts (created_at desc);

-- RLS: locked down. Only service-role API writes here.
alter table contact_form_attempts enable row level security;
