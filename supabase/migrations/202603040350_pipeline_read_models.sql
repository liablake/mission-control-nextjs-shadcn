-- Read-heavy audiovisual pipeline entities
create type public.pipeline_stage as enum ('ideation', 'planning', 'production', 'review', 'publishing');
create type public.review_status as enum ('pending', 'changes_requested', 'approved');
create type public.publish_channel as enum ('youtube', 'instagram', 'tiktok');
create type public.publish_status as enum ('draft', 'scheduled', 'published');

create table public.content_items (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  stage public.pipeline_stage not null default 'ideation',
  owner text not null,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.asset_versions (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  version_label text not null,
  format text not null,
  duration_sec integer,
  status public.review_status not null default 'pending',
  preview_url text,
  uploaded_at timestamptz not null default now()
);

create table public.review_comments (
  id uuid primary key default gen_random_uuid(),
  asset_version_id uuid not null references public.asset_versions(id) on delete cascade,
  author text not null,
  body text not null,
  timecode_sec integer,
  resolved boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.publish_slots (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  channel public.publish_channel not null,
  scheduled_for timestamptz not null,
  status public.publish_status not null default 'draft',
  checklist_score integer not null default 0 check (checklist_score >= 0 and checklist_score <= 100),
  published_at timestamptz
);

create index content_items_stage_idx on public.content_items(stage);
create index asset_versions_status_idx on public.asset_versions(status);
create index review_comments_asset_idx on public.review_comments(asset_version_id, resolved);
create index publish_slots_schedule_idx on public.publish_slots(channel, scheduled_for);

create trigger content_items_set_updated_at
before update on public.content_items
for each row
execute function public.set_updated_at();

alter table public.content_items enable row level security;
alter table public.asset_versions enable row level security;
alter table public.review_comments enable row level security;
alter table public.publish_slots enable row level security;

create policy "content_items_rw_open"
on public.content_items
for all
to anon, authenticated
using (true)
with check (true);

create policy "asset_versions_rw_open"
on public.asset_versions
for all
to anon, authenticated
using (true)
with check (true);

create policy "review_comments_rw_open"
on public.review_comments
for all
to anon, authenticated
using (true)
with check (true);

create policy "publish_slots_rw_open"
on public.publish_slots
for all
to anon, authenticated
using (true)
with check (true);
