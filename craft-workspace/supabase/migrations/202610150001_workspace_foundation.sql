-- Draft migration only. It has NOT been applied to any Supabase project.
-- All tables are private-to-owner at the row level; client privileges are explicitly granted only to authenticated users.

create table if not exists public.workspace_projects (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) between 1 and 120),
  description text not null default '' check (length(description) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists workspace_projects_owner_updated_idx
  on public.workspace_projects (owner_id, updated_at desc);

create table if not exists public.workspace_assets (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid references public.workspace_projects (id) on delete cascade,
  storage_key text not null,
  file_name text not null check (length(trim(file_name)) between 1 and 255),
  media_type text not null default 'application/octet-stream',
  byte_size bigint not null check (byte_size >= 0),
  sha256 text,
  created_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  unique (owner_id, storage_key)
);

create index if not exists workspace_assets_owner_created_idx
  on public.workspace_assets (owner_id, created_at desc);

create table if not exists public.workspace_activity (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  project_id uuid references public.workspace_projects (id) on delete set null,
  event_type text not null check (length(trim(event_type)) between 1 and 100),
  detail text not null default '' check (length(detail) <= 2000),
  created_at timestamptz not null default now()
);

create index if not exists workspace_activity_owner_created_idx
  on public.workspace_activity (owner_id, created_at desc);

alter table public.workspace_projects enable row level security;
alter table public.workspace_assets enable row level security;
alter table public.workspace_activity enable row level security;

drop policy if exists "workspace_projects_select_own" on public.workspace_projects;
create policy "workspace_projects_select_own" on public.workspace_projects
  for select to authenticated using ((select auth.uid()) = owner_id);

drop policy if exists "workspace_projects_insert_own" on public.workspace_projects;
create policy "workspace_projects_insert_own" on public.workspace_projects
  for insert to authenticated with check ((select auth.uid()) = owner_id);

drop policy if exists "workspace_projects_update_own" on public.workspace_projects;
create policy "workspace_projects_update_own" on public.workspace_projects
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check ((select auth.uid()) = owner_id);

drop policy if exists "workspace_projects_delete_own" on public.workspace_projects;
create policy "workspace_projects_delete_own" on public.workspace_projects
  for delete to authenticated using ((select auth.uid()) = owner_id);

drop policy if exists "workspace_assets_select_own" on public.workspace_assets;
create policy "workspace_assets_select_own" on public.workspace_assets
  for select to authenticated
  using (
    (select auth.uid()) = owner_id
    and (project_id is null or exists (
      select 1 from public.workspace_projects p
      where p.id = workspace_assets.project_id and p.owner_id = (select auth.uid())
    ))
  );

drop policy if exists "workspace_assets_insert_own" on public.workspace_assets;
create policy "workspace_assets_insert_own" on public.workspace_assets
  for insert to authenticated
  with check (
    (select auth.uid()) = owner_id
    and (project_id is null or exists (
      select 1 from public.workspace_projects p
      where p.id = workspace_assets.project_id and p.owner_id = (select auth.uid())
    ))
  );

drop policy if exists "workspace_assets_update_own" on public.workspace_assets;
create policy "workspace_assets_update_own" on public.workspace_assets
  for update to authenticated
  using ((select auth.uid()) = owner_id)
  with check (
    (select auth.uid()) = owner_id
    and (project_id is null or exists (
      select 1 from public.workspace_projects p
      where p.id = workspace_assets.project_id and p.owner_id = (select auth.uid())
    ))
  );

drop policy if exists "workspace_assets_delete_own" on public.workspace_assets;
create policy "workspace_assets_delete_own" on public.workspace_assets
  for delete to authenticated using ((select auth.uid()) = owner_id);

drop policy if exists "workspace_activity_select_own" on public.workspace_activity;
create policy "workspace_activity_select_own" on public.workspace_activity
  for select to authenticated using ((select auth.uid()) = owner_id);

drop policy if exists "workspace_activity_insert_own" on public.workspace_activity;
create policy "workspace_activity_insert_own" on public.workspace_activity
  for insert to authenticated with check (
    (select auth.uid()) = owner_id
    and (project_id is null or exists (
      select 1 from public.workspace_projects p
      where p.id = workspace_activity.project_id and p.owner_id = (select auth.uid())
    ))
  );

drop policy if exists "workspace_activity_delete_own" on public.workspace_activity;
create policy "workspace_activity_delete_own" on public.workspace_activity
  for delete to authenticated using ((select auth.uid()) = owner_id);

revoke all on public.workspace_projects from anon, public;
revoke all on public.workspace_assets from anon, public;
revoke all on public.workspace_activity from anon, public;
grant select, insert, update, delete on public.workspace_projects to authenticated;
grant select, insert, update, delete on public.workspace_assets to authenticated;
grant select, insert, delete on public.workspace_activity to authenticated;
