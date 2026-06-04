-- MVP user training tables, workout_sessions / profiles extensions, RLS, anon revoke.

-- -----------------------------------------------------------------------------
-- public.user_program_enrollments
-- -----------------------------------------------------------------------------
create table public.user_program_enrollments (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  program_id uuid not null references public.programs (id) on delete restrict,
  is_active boolean not null default true,
  started_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

comment on table public.user_program_enrollments is 'User participation in a catalog program; at most one active per user.';

create index idx_user_program_enrollments_user_id on public.user_program_enrollments (user_id);
create index idx_user_program_enrollments_program_id on public.user_program_enrollments (program_id);

create unique index user_program_enrollments_one_active_per_user
  on public.user_program_enrollments (user_id)
  where is_active;

alter table public.user_program_enrollments enable row level security;

create policy "user_program_enrollments_select_own"
  on public.user_program_enrollments
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "user_program_enrollments_insert_own"
  on public.user_program_enrollments
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.programs p
      where p.id = program_id
        and p.is_published = true
    )
  );

create policy "user_program_enrollments_update_own"
  on public.user_program_enrollments
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.programs p
      where p.id = program_id
        and p.is_published = true
    )
  );

create policy "user_program_enrollments_delete_own"
  on public.user_program_enrollments
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- public.readiness_checks
-- -----------------------------------------------------------------------------
create table public.readiness_checks (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  check_date date not null,
  readiness smallint not null,
  note text,
  created_at timestamptz not null default now(),
  constraint readiness_checks_user_id_check_date_key unique (user_id, check_date),
  constraint readiness_checks_readiness_range check (readiness between 1 and 5)
);

comment on table public.readiness_checks is 'Daily body check-in (1-5); check_date is user-local day from client.';

create index idx_readiness_checks_user_id on public.readiness_checks (user_id);

alter table public.readiness_checks enable row level security;

create policy "readiness_checks_select_own"
  on public.readiness_checks
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "readiness_checks_insert_own"
  on public.readiness_checks
  for insert
  to authenticated
  with check ((select auth.uid()) = user_id);

create policy "readiness_checks_update_own"
  on public.readiness_checks
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "readiness_checks_delete_own"
  on public.readiness_checks
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- public.set_logs
-- -----------------------------------------------------------------------------
create table public.set_logs (
  id uuid not null default gen_random_uuid() primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  workout_session_id uuid not null references public.workout_sessions (id) on delete cascade,
  program_exercise_id uuid references public.program_exercises (id) on delete set null,
  exercise_name text not null,
  set_index smallint not null,
  target_reps text,
  weight_kg numeric(7, 2),
  reps smallint,
  is_completed boolean not null default false,
  created_at timestamptz not null default now(),
  constraint set_logs_set_index_check check (set_index >= 0)
);

comment on table public.set_logs is 'Per-user logged sets; weight_kg is individualized load, not on catalog.';

create index idx_set_logs_user_id on public.set_logs (user_id);
create index idx_set_logs_workout_session_id on public.set_logs (workout_session_id);

alter table public.set_logs enable row level security;

create policy "set_logs_select_own"
  on public.set_logs
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "set_logs_insert_own"
  on public.set_logs
  for insert
  to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.workout_sessions ws
      where ws.id = workout_session_id
        and ws.user_id = (select auth.uid())
    )
    and (
      program_exercise_id is null
      or exists (
        select 1
        from public.program_exercises pe
        join public.program_days pd on pd.id = pe.program_day_id
        join public.programs p on p.id = pd.program_id
        where pe.id = program_exercise_id
          and p.is_published = true
      )
    )
  );

create policy "set_logs_update_own"
  on public.set_logs
  for update
  to authenticated
  using ((select auth.uid()) = user_id)
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1
      from public.workout_sessions ws
      where ws.id = workout_session_id
        and ws.user_id = (select auth.uid())
    )
    and (
      program_exercise_id is null
      or exists (
        select 1
        from public.program_exercises pe
        join public.program_days pd on pd.id = pe.program_day_id
        join public.programs p on p.id = pd.program_id
        where pe.id = program_exercise_id
          and p.is_published = true
      )
    )
  );

create policy "set_logs_delete_own"
  on public.set_logs
  for delete
  to authenticated
  using ((select auth.uid()) = user_id);

-- -----------------------------------------------------------------------------
-- Extend public.profiles and public.workout_sessions
-- -----------------------------------------------------------------------------
alter table public.profiles
  add column timezone text not null default 'UTC';

comment on column public.profiles.timezone is 'IANA timezone for local-day bucketing; default UTC for existing rows.';

alter table public.workout_sessions
  add column program_day_id uuid references public.program_days (id) on delete set null,
  add column status text,
  add column session_date date;

comment on column public.workout_sessions.program_day_id is 'Catalog day for this session; nullable for legacy rows.';
comment on column public.workout_sessions.status is 'in_progress, completed, or skipped; null for legacy rows.';
comment on column public.workout_sessions.session_date is 'User-local calendar day from client; no server default.';

alter table public.workout_sessions
  add constraint workout_sessions_status_check
  check (
    status is null
    or status in ('in_progress', 'completed', 'skipped')
  );

update public.workout_sessions
set status = 'completed'
where ended_at is not null
  and status is null;

create index idx_workout_sessions_program_day_id on public.workout_sessions (program_day_id);

-- -----------------------------------------------------------------------------
-- Grants and anon default-deny (new user-owned tables)
-- -----------------------------------------------------------------------------
grant select, insert, update, delete on table public.user_program_enrollments to authenticated;
grant select, insert, update, delete on table public.readiness_checks to authenticated;
grant select, insert, update, delete on table public.set_logs to authenticated;

revoke all on table public.user_program_enrollments from anon;
revoke all on table public.readiness_checks from anon;
revoke all on table public.set_logs from anon;
