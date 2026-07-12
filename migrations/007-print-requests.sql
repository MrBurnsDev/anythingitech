-- ============================================================================
-- 3D Printing & Custom Fabrication intake — schema
-- Created 2026-05-14
-- ============================================================================

-- Updated-at trigger (idempotent — reuse if you already have it)
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ----------------------------------------------------------------------------
-- print_requests
-- ----------------------------------------------------------------------------
create table if not exists print_requests (
  id                  uuid primary key default gen_random_uuid(),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  status              text not null default 'new',
  priority            text not null default 'normal',

  -- contact
  name                text not null,
  email               text not null,
  phone               text,

  -- project
  project_type        text not null,
  tags                text[] not null default '{}',
  project_description text not null,
  quantity            integer not null default 1,
  approximate_size    text,
  deadline            date,
  color_preference    text,
  notes               text,

  -- file references (denormalised mirror of print_request_files for quick access)
  stl_file_urls       text[] not null default '{}',
  photo_urls          text[] not null default '{}',

  -- internal
  source              text not null default 'website_3d_printing_page',
  internal_notes      text,
  quoted_amount       numeric(10,2),
  quoted_at           timestamptz,
  approved_at         timestamptz,
  completed_at        timestamptz,

  constraint print_requests_project_type_chk check (
    project_type in (
      'print_from_file',
      'modify_file',
      'recreate_from_object',
      'recreate_from_photo'
    )
  ),
  constraint print_requests_status_chk check (
    status in (
      'new', 'reviewing', 'quoted', 'approved',
      'printing', 'ready', 'completed', 'declined'
    )
  ),
  constraint print_requests_priority_chk check (
    priority in ('low', 'normal', 'high')
  ),
  constraint print_requests_quantity_chk check (quantity > 0 and quantity <= 10000),
  constraint print_requests_email_chk check (email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$')
);

create index if not exists print_requests_created_at_idx  on print_requests (created_at desc);
create index if not exists print_requests_status_idx       on print_requests (status);
create index if not exists print_requests_project_type_idx on print_requests (project_type);
create index if not exists print_requests_email_idx        on print_requests (email);
create index if not exists print_requests_tags_gin_idx     on print_requests using gin (tags);

drop trigger if exists print_requests_set_updated_at on print_requests;
create trigger print_requests_set_updated_at
  before update on print_requests
  for each row execute function set_updated_at();

-- ----------------------------------------------------------------------------
-- print_request_files
-- ----------------------------------------------------------------------------
create table if not exists print_request_files (
  id                uuid primary key default gen_random_uuid(),
  print_request_id  uuid not null references print_requests(id) on delete cascade,
  created_at        timestamptz not null default now(),

  file_type         text not null,
  storage_bucket    text not null,
  storage_path      text not null,
  public_url        text,
  original_filename text,
  mime_type         text,
  size_bytes        bigint,

  constraint print_request_files_file_type_chk check (
    file_type in ('model_file', 'reference_photo')
  ),
  constraint print_request_files_size_chk check (size_bytes is null or size_bytes > 0)
);

create index if not exists print_request_files_request_idx on print_request_files (print_request_id);
create index if not exists print_request_files_type_idx    on print_request_files (file_type);

-- ----------------------------------------------------------------------------
-- Row-level security
-- ----------------------------------------------------------------------------
alter table print_requests       enable row level security;
alter table print_request_files  enable row level security;

-- (No policies = no access for non-service-role connections.)
-- Inserts go through the service-role-keyed API route, which bypasses RLS.
-- Authenticated admin reads can be added separately once admin auth is in place.

-- Optional: priority-queue view that flags photo-reconstruction leads
create or replace view print_request_priority_queue as
select
  pr.id,
  pr.created_at,
  pr.status,
  pr.priority,
  pr.name,
  pr.email,
  pr.project_type,
  pr.tags,
  pr.quantity,
  pr.deadline,
  ('photo_reconstruction' = any(pr.tags)) as is_photo_reconstruction,
  (select count(*) from print_request_files prf
     where prf.print_request_id = pr.id and prf.file_type = 'model_file')      as model_file_count,
  (select count(*) from print_request_files prf
     where prf.print_request_id = pr.id and prf.file_type = 'reference_photo') as photo_count
from print_requests pr
where pr.status not in ('completed', 'declined')
order by
  ('photo_reconstruction' = any(pr.tags)) desc,
  case pr.priority when 'high' then 0 when 'normal' then 1 else 2 end,
  pr.created_at desc;

-- ----------------------------------------------------------------------------
-- Storage buckets (private)
-- ----------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('print-model-files',       'print-model-files',       false),
  ('print-reference-photos',  'print-reference-photos',  false)
on conflict (id) do nothing;
