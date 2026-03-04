-- Stage-level traceability for audiovisual workflow
create table if not exists public.pipeline_stage_events (
  id uuid primary key default gen_random_uuid(),
  content_item_id uuid not null references public.content_items(id) on delete cascade,
  from_stage public.pipeline_stage,
  to_stage public.pipeline_stage not null,
  actor text not null,
  note text,
  changed_at timestamptz not null default now()
);

create index if not exists pipeline_stage_events_item_time_idx
  on public.pipeline_stage_events(content_item_id, changed_at desc);

alter table public.pipeline_stage_events enable row level security;

create policy "pipeline_stage_events_rw_open"
on public.pipeline_stage_events
for all
to anon, authenticated
using (true)
with check (true);
