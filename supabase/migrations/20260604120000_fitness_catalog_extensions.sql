-- Fitness catalog extensions for Drive workout plans.
-- Extends MVP programs schema; backward-compatible with Starting Strength seed.

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------
create type public.program_block_type as enum (
  'warmup',
  'workout',
  'superset',
  'interval_circuit'
);

create type public.exercise_prescription_mode as enum (
  'sets_reps',
  'time_interval',
  'percentage_1rm'
);

create type public.exercise_protocol as enum (
  'double_progression',
  'top_set_backoff',
  'percentage_block',
  'interval_progression',
  'circuit'
);

create type public.program_level as enum (
  'beginner',
  'intermediate',
  'advanced'
);

-- -----------------------------------------------------------------------------
-- public.programs — metadata for catalog filtering
-- -----------------------------------------------------------------------------
alter table public.programs
  add column tags text[] not null default '{}',
  add column source_folder text,
  add column level public.program_level;

comment on column public.programs.description is
  'Catalog summary (1-3 sentences): split style, audience, equipment. Required for seeded Drive programs.';
comment on column public.programs.level is
  'Difficulty tier for catalog filtering and onboarding recommendations.';
comment on column public.programs.tags is
  'Catalog facets, e.g. female, dumbbells, bodyweight, travel, hiit, strength.';
comment on column public.programs.source_folder is
  'Import traceability; matches Drive folder name.';

update public.programs
set
  level = 'intermediate',
  description = coalesce(
    description,
    'MVP two-workout A/B template (barbell row on B). Train 3x/week; rotate A -> B -> A -> B.'
  )
where slug = 'starting-strength-mvp'
  and level is null;

create index idx_programs_level on public.programs (level)
  where is_published = true;

-- -----------------------------------------------------------------------------
-- public.program_days — day focus label
-- -----------------------------------------------------------------------------
alter table public.program_days
  add column focus text;

comment on column public.program_days.focus is
  'Day emphasis: push, pull, legs, upper, lower, circuit-1, etc.';

-- -----------------------------------------------------------------------------
-- public.program_blocks — warmup, main, superset, interval sections
-- -----------------------------------------------------------------------------
create table public.program_blocks (
  id uuid not null default gen_random_uuid() primary key,
  program_day_id uuid not null references public.program_days (id) on delete cascade,
  slug text not null,
  block_type public.program_block_type not null default 'workout',
  name text not null,
  sort_order smallint not null,
  instructions text,
  round_count smallint,
  constraint program_blocks_program_day_id_slug_key unique (program_day_id, slug),
  constraint program_blocks_sort_order_check check (sort_order > 0),
  constraint program_blocks_round_count_check check (round_count is null or round_count > 0)
);

comment on table public.program_blocks is
  'Section within a program day: warmup instructions, main work, superset, or HIIT circuit.';

create index idx_program_blocks_program_day_id on public.program_blocks (program_day_id);

-- -----------------------------------------------------------------------------
-- public.program_exercises — extended prescription
-- -----------------------------------------------------------------------------
alter table public.program_exercises
  add column program_block_id uuid references public.program_blocks (id) on delete set null,
  add column prescription_mode public.exercise_prescription_mode not null default 'sets_reps',
  add column protocol public.exercise_protocol,
  add column tempo text,
  add column superset_letter char(1),
  add column percentage_start smallint,
  add column percentage_increment smallint,
  add column work_seconds smallint;

alter table public.program_exercises
  add constraint program_exercises_superset_letter_check
  check (superset_letter is null or superset_letter ~ '^[A-Z]$');

alter table public.program_exercises
  add constraint program_exercises_percentage_start_check
  check (percentage_start is null or (percentage_start > 0 and percentage_start <= 100));

alter table public.program_exercises
  add constraint program_exercises_percentage_increment_check
  check (percentage_increment is null or (percentage_increment > 0 and percentage_increment <= 25));

comment on column public.program_exercises.prescription_mode is
  'sets_reps (default), time_interval (HIIT), percentage_1rm (SBD main lifts).';
comment on column public.program_exercises.protocol is
  'Progression model from PDF protocol sheet.';
comment on column public.program_exercises.tempo is
  'Tempo prescription, e.g. 3-1-X-1.';
comment on column public.program_exercises.superset_letter is
  'A/B/C within a superset block; null for straight sets.';
comment on column public.program_exercises.percentage_start is
  'Week-1 working percentage of 1RM for percentage_1rm mode.';
comment on column public.program_exercises.percentage_increment is
  'Weekly % increase until 1RM test week (typically +5).';
comment on column public.program_exercises.work_seconds is
  'Default work interval for time_interval mode when sets table omitted.';

create index idx_program_exercises_program_block_id on public.program_exercises (program_block_id);

-- -----------------------------------------------------------------------------
-- public.program_exercise_sets — per-set prescription
-- -----------------------------------------------------------------------------
create table public.program_exercise_sets (
  id uuid not null default gen_random_uuid() primary key,
  program_exercise_id uuid not null references public.program_exercises (id) on delete cascade,
  set_number smallint not null,
  target_reps text,
  rest_seconds smallint,
  work_seconds smallint,
  load_note text,
  constraint program_exercise_sets_exercise_set_key unique (program_exercise_id, set_number),
  constraint program_exercise_sets_set_number_check check (set_number > 0),
  constraint program_exercise_sets_prescription_check check (
    target_reps is not null
    or work_seconds is not null
    or load_note is not null
  )
);

comment on table public.program_exercise_sets is
  'Per-set reps/rest/work/load; preferred over flat target_* when present.';

create index idx_program_exercise_sets_program_exercise_id
  on public.program_exercise_sets (program_exercise_id);

-- -----------------------------------------------------------------------------
-- public.program_exercise_alternates — substitution list from PDFs
-- -----------------------------------------------------------------------------
create table public.program_exercise_alternates (
  id uuid not null default gen_random_uuid() primary key,
  program_exercise_id uuid not null references public.program_exercises (id) on delete cascade,
  name text not null,
  sort_order smallint not null,
  constraint program_exercise_alternates_exercise_sort_key unique (program_exercise_id, sort_order),
  constraint program_exercise_alternates_sort_order_check check (sort_order > 0)
);

comment on table public.program_exercise_alternates is
  'Alternate exercises listed on each PDF movement.';

create index idx_program_exercise_alternates_program_exercise_id
  on public.program_exercise_alternates (program_exercise_id);

-- -----------------------------------------------------------------------------
-- RLS (published-catalog pattern)
-- -----------------------------------------------------------------------------
alter table public.program_blocks enable row level security;

create policy "program_blocks_select_published"
  on public.program_blocks
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.program_days pd
      join public.programs p on p.id = pd.program_id
      where pd.id = program_blocks.program_day_id
        and p.is_published = true
    )
  );

alter table public.program_exercise_sets enable row level security;

create policy "program_exercise_sets_select_published"
  on public.program_exercise_sets
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.program_exercises pe
      join public.program_days pd on pd.id = pe.program_day_id
      join public.programs p on p.id = pd.program_id
      where pe.id = program_exercise_sets.program_exercise_id
        and p.is_published = true
    )
  );

alter table public.program_exercise_alternates enable row level security;

create policy "program_exercise_alternates_select_published"
  on public.program_exercise_alternates
  for select
  to authenticated
  using (
    exists (
      select 1
      from public.program_exercises pe
      join public.program_days pd on pd.id = pe.program_day_id
      join public.programs p on p.id = pd.program_id
      where pe.id = program_exercise_alternates.program_exercise_id
        and p.is_published = true
    )
  );

-- -----------------------------------------------------------------------------
-- Grants and anon default-deny
-- -----------------------------------------------------------------------------
grant select on table public.program_blocks to authenticated;
grant select on table public.program_exercise_sets to authenticated;
grant select on table public.program_exercise_alternates to authenticated;

revoke all on table public.program_blocks from anon;
revoke all on table public.program_exercise_sets from anon;
revoke all on table public.program_exercise_alternates from anon;
