-- Idempotent Starting Strength MVP seed (two-day A/B alternation, days_per_week = 3).
-- UPSERT by stable slug; never DELETE catalog rows.

insert into public.programs (slug, name, description, days_per_week, is_published)
values (
  'starting-strength-mvp',
  'Starting Strength',
  'MVP two-workout A/B template (barbell row on B). Train 3×/week; rotate A → B → A → B.',
  3,
  true
)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  days_per_week = excluded.days_per_week,
  is_published = excluded.is_published;

insert into public.program_days (program_id, slug, day_index, name, sort_order)
select p.id, v.slug, v.day_index, v.name, v.sort_order
from public.programs p
cross join (
  values
    ('workout-a', 1::smallint, 'Workout A', 1::smallint),
    ('workout-b', 2::smallint, 'Workout B', 2::smallint)
) as v (slug, day_index, name, sort_order)
where p.slug = 'starting-strength-mvp'
on conflict (program_id, slug) do update set
  day_index = excluded.day_index,
  name = excluded.name,
  sort_order = excluded.sort_order;

insert into public.program_exercises (
  program_day_id,
  slug,
  name,
  sort_order,
  target_sets,
  target_reps,
  rest_seconds,
  notes
)
select pd.id, v.slug, v.name, v.sort_order, v.target_sets, v.target_reps, 180::smallint, null::text
from public.program_days pd
join public.programs p on p.id = pd.program_id
cross join (
  values
    ('workout-a', 'squat', 'Squat', 1::smallint, 3::smallint, '5'),
    ('workout-a', 'bench-press', 'Bench Press', 2::smallint, 3::smallint, '5'),
    ('workout-a', 'deadlift', 'Deadlift', 3::smallint, 1::smallint, '5'),
    ('workout-b', 'squat', 'Squat', 1::smallint, 3::smallint, '5'),
    ('workout-b', 'overhead-press', 'Overhead Press', 2::smallint, 3::smallint, '5'),
    ('workout-b', 'barbell-row', 'Barbell Row', 3::smallint, 3::smallint, '5')
) as v (day_slug, slug, name, sort_order, target_sets, target_reps)
where p.slug = 'starting-strength-mvp'
  and pd.slug = v.day_slug
on conflict (program_day_id, slug) do update set
  name = excluded.name,
  sort_order = excluded.sort_order,
  target_sets = excluded.target_sets,
  target_reps = excluded.target_reps,
  rest_seconds = excluded.rest_seconds,
  notes = excluded.notes;
