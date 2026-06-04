-- MVP program catalog: global read-only prescriptions (no per-user load on catalog).
-- RLS: authenticated SELECT only when program is published; anon revoked.

-- -----------------------------------------------------------------------------
-- public.programs
-- -----------------------------------------------------------------------------
create table public.programs (
  id uuid not null default gen_random_uuid() primary key,
  slug text not null,
  name text not null,
  description text,
  days_per_week smallint not null,
  is_published boolean not null default false,
  created_at timestamptz not null default now(),
  constraint programs_slug_key unique (slug),
  constraint programs_days_per_week_check check (days_per_week > 0)
);

comment on table public.programs is 'Global program catalog; published rows readable by authenticated users.';

-- -----------------------------------------------------------------------------
-- public.program_days
-- -----------------------------------------------------------------------------
create table public.program_days (
  id uuid not null default gen_random_uuid() primary key,
  program_id uuid not null references public.programs (id) on delete cascade,
  slug text not null,
  day_index smallint not null,
  name text not null,
  sort_order smallint not null,
  constraint program_days_program_id_slug_key unique (program_id, slug),
  constraint program_days_day_index_check check (day_index > 0),
  constraint program_days_sort_order_check check (sort_order > 0)
);

comment on table public.program_days is 'Workout templates within a program; stable slug for idempotent seed.';

create index idx_program_days_program_id on public.program_days (program_id);

-- -----------------------------------------------------------------------------
-- public.program_exercises
-- -----------------------------------------------------------------------------
create table public.program_exercises (
  id uuid not null default gen_random_uuid() primary key,
  program_day_id uuid not null references public.program_days (id) on delete cascade,
  slug text not null,
  name text not null,
  sort_order smallint not null,
  target_sets smallint not null,
  target_reps text not null,
  rest_seconds smallint,
  notes text,
  constraint program_exercises_program_day_id_slug_key unique (program_day_id, slug),
  constraint program_exercises_sort_order_check check (sort_order > 0),
  constraint program_exercises_target_sets_check check (target_sets > 0)
);

comment on table public.program_exercises is 'Shared exercise prescriptions (sets/reps/rest); no weight column.';

create index idx_program_exercises_program_day_id on public.program_exercises (program_day_id);

-- -----------------------------------------------------------------------------
-- RLS: catalog SELECT for authenticated when published
-- -----------------------------------------------------------------------------
alter table public.programs enable row level security;

create policy "programs_select_published"
  on public.programs
  for select
  to authenticated
  using (is_published = true);

alter table public.program_days enable row level security;

create policy "program_days_select_published"
  on public.program_days
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.programs p
      where p.id = program_days.program_id
        and p.is_published = true
    )
  );

alter table public.program_exercises enable row level security;

create policy "program_exercises_select_published"
  on public.program_exercises
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.program_days pd
      join public.programs p on p.id = pd.program_id
      where pd.id = program_exercises.program_day_id
        and p.is_published = true
    )
  );

-- -----------------------------------------------------------------------------
-- Grants and anon default-deny
-- -----------------------------------------------------------------------------
grant select on table public.programs to authenticated;
grant select on table public.program_days to authenticated;
grant select on table public.program_exercises to authenticated;

revoke all on table public.programs from anon;
revoke all on table public.program_days from anon;
revoke all on table public.program_exercises from anon;
