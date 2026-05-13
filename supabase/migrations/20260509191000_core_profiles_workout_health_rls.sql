-- Core IAM foundation: profiles, workout_sessions, health_metrics with RLS.
-- Requires: Supabase Auth (auth.users). Policies gate rows by auth.uid().

-- -----------------------------------------------------------------------------
-- public.profiles
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid not null primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'App-visible user metadata; one row per auth user.';

alter table public.profiles enable row level security;

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_insert_own"
  on public.profiles
  for insert
  to authenticated
  with check ((select auth.uid()) = id);

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "profiles_delete_own"
  on public.profiles
  for delete
  to authenticated
  using ((select auth.uid()) = id);

-- -----------------------------------------------------------------------------
-- New auth user -> profile row (all providers + email)
-- -----------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

comment on function public.handle_new_user() is 'Syncs public.profiles when a row is inserted into auth.users.';

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute procedure public.handle_new_user();

-- -----------------------------------------------------------------------------
-- public.workout_sessions (Option B)
-- -----------------------------------------------------------------------------
create table public.workout_sessions (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.workout_sessions is 'User-owned workout blocks; RLS enforces user_id = auth.uid().';

create index idx_workout_sessions_user_id on public.workout_sessions (user_id);
create index idx_workout_sessions_user_started on public.workout_sessions (user_id, started_at desc);

alter table public.workout_sessions enable row level security;

create policy "workout_sessions_select_own"
  on public.workout_sessions
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "workout_sessions_insert_own"
  on public.workout_sessions
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "workout_sessions_update_own"
  on public.workout_sessions
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "workout_sessions_delete_own"
  on public.workout_sessions
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- public.health_metrics (Option B)
-- -----------------------------------------------------------------------------
create table public.health_metrics (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  recorded_at timestamptz not null default now(),
  weight_kg numeric(6, 2),
  sleep_hours numeric(4, 2),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.health_metrics is 'User-owned health snapshots; RLS enforces user_id = auth.uid().';

create index idx_health_metrics_user_id on public.health_metrics (user_id);
create index idx_health_metrics_user_recorded on public.health_metrics (user_id, recorded_at desc);

alter table public.health_metrics enable row level security;

create policy "health_metrics_select_own"
  on public.health_metrics
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "health_metrics_insert_own"
  on public.health_metrics
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "health_metrics_update_own"
  on public.health_metrics
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "health_metrics_delete_own"
  on public.health_metrics
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- Grants (Data API: authenticated clients use anon key + JWT; RLS applies)
-- -----------------------------------------------------------------------------
grant select, insert, update, delete on table public.profiles to authenticated;
grant select, insert, update, delete on table public.workout_sessions to authenticated;
grant select, insert, update, delete on table public.health_metrics to authenticated;
