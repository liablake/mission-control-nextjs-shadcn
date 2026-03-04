-- Mission Control initial schema
create extension if not exists pgcrypto;

create type public.task_status as enum ('todo', 'doing', 'done');

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status public.task_status not null default 'todo',
  due_at timestamptz,
  completed_at timestamptz,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint completed_when_done check (
    (status = 'done' and completed_at is not null)
    or (status <> 'done')
  )
);

create table public.task_status_history (
  id bigint generated always as identity primary key,
  task_id uuid not null references public.tasks(id) on delete cascade,
  from_status public.task_status,
  to_status public.task_status not null,
  changed_at timestamptz not null default now()
);

create index tasks_project_status_idx on public.tasks(project_id, status);
create index tasks_due_at_idx on public.tasks(due_at);
create index status_history_task_id_idx on public.task_status_history(task_id);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger projects_set_updated_at
before update on public.projects
for each row
execute function public.set_updated_at();

create trigger tasks_set_updated_at
before update on public.tasks
for each row
execute function public.set_updated_at();

create or replace function public.log_task_status_change()
returns trigger
language plpgsql
as $$
begin
  if tg_op = 'INSERT' then
    insert into public.task_status_history(task_id, from_status, to_status)
    values (new.id, null, new.status);
  elsif tg_op = 'UPDATE' and old.status is distinct from new.status then
    insert into public.task_status_history(task_id, from_status, to_status)
    values (new.id, old.status, new.status);
  end if;
  return new;
end;
$$;

create trigger task_status_history_trigger
after insert or update on public.tasks
for each row
execute function public.log_task_status_change();

alter table public.projects enable row level security;
alter table public.tasks enable row level security;
alter table public.task_status_history enable row level security;

-- Temporary permissive policies while auth is not configured.
create policy "projects_rw_open"
on public.projects
for all
to anon, authenticated
using (true)
with check (true);

create policy "tasks_rw_open"
on public.tasks
for all
to anon, authenticated
using (true)
with check (true);

create policy "task_status_history_read_open"
on public.task_status_history
for select
to anon, authenticated
using (true);
