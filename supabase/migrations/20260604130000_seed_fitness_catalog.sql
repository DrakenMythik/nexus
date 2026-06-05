-- Idempotent seed: 25 Drive workout programs and 103 program days.
-- Exercise prescriptions are imported separately; catalog metadata only.
-- UPSERT by stable slug; never DELETE catalog rows.

insert into public.programs (
  slug,
  name,
  description,
  level,
  days_per_week,
  is_published,
  tags,
  source_folder
)
values
  (
    '3-dumbbells',
    '3 Day Dumbbells',
    'Three-day dumbbell-only split covering strength, unilateral work, and conditioning. Minimal equipment; ideal for home or busy gyms.',
    'beginner'::public.program_level,
    3::smallint,
    false,
    array['dumbbells', 'hypertrophy'],
    '3 Dumbbells'
  ),
  (
    '3-female',
    '3 Day Female',
    'Three-day female-focused split with upper, lower/glute, and glute-bias sessions. Balanced hypertrophy with lower-body emphasis.',
    'intermediate'::public.program_level,
    3::smallint,
    false,
    array['female', 'hypertrophy'],
    '3 Female'
  ),
  (
    '3-full-body',
    '3 Day Full Body',
    'Three-day full-body rotation across upper, lower, and combined sessions. Efficient frequency for general strength and muscle.',
    'beginner'::public.program_level,
    3::smallint,
    false,
    array['hypertrophy'],
    '3 Full Body'
  ),
  (
    '3-minimal-home',
    '3 Day Minimal Home',
    'Three-day minimal-equipment full-body program (A/B/C). Built for home training with limited gear.',
    'beginner'::public.program_level,
    3::smallint,
    false,
    array['home', 'hypertrophy'],
    '3 Minimal Home'
  ),
  (
    '3-minimalist',
    '3 Day Minimalist',
    'Streamlined three-day upper/lower/full-body split with low exercise count per session. High signal-to-noise for time-crunched lifters.',
    'beginner'::public.program_level,
    3::smallint,
    false,
    array['hypertrophy'],
    '3 Minimalist'
  ),
  (
    '3-plfull-body',
    '3 Day PLFull Body',
    'Three-day full-body program biased toward push, pull, or legs each session. Hybrid between PPL and full-body training.',
    'intermediate'::public.program_level,
    3::smallint,
    false,
    array['hypertrophy'],
    '3 PLFull Body'
  ),
  (
    '3-push-pull-legs',
    '3 Day Push Pull Legs',
    'Classic three-day PPL split. Push, pull, and leg days with compound and accessory work, top-set/back-off progression on main lifts.',
    'intermediate'::public.program_level,
    3::smallint,
    false,
    array['hypertrophy'],
    '3 Push Pull Legs'
  ),
  (
    '3-travel',
    '3 Day Travel',
    'Hotel/travel circuit program with three no-equipment circuits. Bodyweight supersets for maintaining fitness on the road.',
    'beginner'::public.program_level,
    3::smallint,
    false,
    array['travel', 'bodyweight'],
    '3 Travel'
  ),
  (
    '4-beach-body',
    '4 Day Beach Body',
    'Four-day physique split: push, pull, upper, and legs. Hypertrophy focus for balanced upper/lower development.',
    'intermediate'::public.program_level,
    4::smallint,
    false,
    array['hypertrophy'],
    '4 Beach Body'
  ),
  (
    '4-bodyweight',
    '4 Day Bodyweight',
    'Four-day bodyweight-only program. No gym required; scalable progressions using tempo and density.',
    'beginner'::public.program_level,
    4::smallint,
    false,
    array['bodyweight', 'hypertrophy'],
    '4 Bodyweight'
  ),
  (
    '4-female-minimalist',
    '4 Day Female Minimalist',
    'Four-day female minimalist split (upper A/B, legs A/B). Low volume per session with double-progression loading.',
    'beginner'::public.program_level,
    4::smallint,
    false,
    array['female', 'hypertrophy'],
    '4 Female Minimalist'
  ),
  (
    '4-female-plpl',
    '4 Day Female PLPL',
    'Four-day female push/pull/legs/legs rotation. Extra lower-body frequency with moderate upper volume.',
    'intermediate'::public.program_level,
    4::smallint,
    false,
    array['female', 'hypertrophy'],
    '4 Female PLPL'
  ),
  (
    '4-female-specialized',
    '4 Day Female Specialized',
    'Four-day female specialization split targeting squats, legs, back, and delts. Weak-point emphasis for intermediate lifters.',
    'intermediate'::public.program_level,
    4::smallint,
    false,
    array['female', 'hypertrophy'],
    '4 Female Specialized'
  ),
  (
    '4-home-hiit',
    '4 Day Home HIIT',
    'Four-day home HIIT program with timed intervals. Beginner and advanced scaling via work/rest and load; fat-loss and conditioning focus.',
    'beginner'::public.program_level,
    4::smallint,
    false,
    array['hiit', 'home'],
    '4 Home HIIT'
  ),
  (
    '4-minimalist',
    '4 Day Minimalist',
    'Four-day minimalist hypertrophy split with reduced exercise count. Efficient sessions for intermediate trainees.',
    'intermediate'::public.program_level,
    4::smallint,
    false,
    array['hypertrophy'],
    '4 Minimalist'
  ),
  (
    '4-muscle-builder',
    '4 Day Muscle Builder',
    'Four-day muscle-building split with moderate-to-high volume. Standard hypertrophy protocols with top-set/back-off on compounds.',
    'intermediate'::public.program_level,
    4::smallint,
    false,
    array['hypertrophy'],
    '4 Muscle Builder'
  ),
  (
    '4-science-based',
    '4 Day Science Based',
    'Four-day evidence-informed hypertrophy program. Volume and frequency aligned with current research on muscle growth.',
    'intermediate'::public.program_level,
    4::smallint,
    false,
    array['hypertrophy'],
    '4 Science Based'
  ),
  (
    '5-dumbbells',
    '5 Day Dumbbells',
    'Five-day dumbbell hypertrophy program. Higher frequency with DB-only movements for home or limited-equipment gyms.',
    'intermediate'::public.program_level,
    5::smallint,
    false,
    array['dumbbells', 'hypertrophy'],
    '5 Dumbbells'
  ),
  (
    '5-female',
    '5 Day Female',
    'Five-day female hypertrophy split with dedicated upper and leg sessions. Higher weekly frequency for lower and upper development.',
    'intermediate'::public.program_level,
    5::smallint,
    false,
    array['female', 'hypertrophy'],
    '5 Female'
  ),
  (
    '5-muscle-builder',
    '5 Day Muscle Builder',
    'Five-day muscle-building split with elevated weekly volume. Multiple sessions per muscle group for intermediate-to-advanced hypertrophy.',
    'intermediate'::public.program_level,
    5::smallint,
    false,
    array['hypertrophy'],
    '5 Muscle Builder'
  ),
  (
    '5-powerbuilding',
    '5 Day Powerbuilding',
    'Five-day powerbuilding split (push, pull, upper, quads, hamstrings). Heavy compounds plus hypertrophy accessories; requires solid lifting experience.',
    'advanced'::public.program_level,
    5::smallint,
    false,
    array['strength', 'hypertrophy'],
    '5 Powerbuilding'
  ),
  (
    '5-sbd-strength',
    '5 Day SBD Strength',
    'Five-day squat/bench/deadlift strength block with percentage-based main lifts. Requires known or estimated 1RMs; 5-week wave culminating in max testing.',
    'advanced'::public.program_level,
    5::smallint,
    false,
    array['strength'],
    '5 SBD Strength'
  ),
  (
    '6-female-ppl',
    '6 Day Female PPL',
    'Six-day female PPL (two rounds per week). High frequency hypertrophy for experienced female lifters who recover well.',
    'intermediate'::public.program_level,
    6::smallint,
    false,
    array['female', 'hypertrophy'],
    '6 Female PPL'
  ),
  (
    '6-muscle-builder',
    '6 Day Muscle Builder',
    'Six-day muscle-building split — highest frequency in the catalog. Advanced volume and recovery demands.',
    'advanced'::public.program_level,
    6::smallint,
    false,
    array['hypertrophy'],
    '6 Muscle Builder'
  ),
  (
    '6-ppl',
    '6 Day PPL',
    'Six-day PPL (two rounds per week). High-frequency hypertrophy for advanced lifters comfortable with push/pull/legs twice weekly.',
    'advanced'::public.program_level,
    6::smallint,
    false,
    array['hypertrophy'],
    '6 PPL'
  )
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  level = excluded.level,
  days_per_week = excluded.days_per_week,
  is_published = excluded.is_published,
  tags = excluded.tags,
  source_folder = excluded.source_folder;

insert into public.program_days (program_id, slug, day_index, name, sort_order, focus)
select p.id, v.day_slug, v.day_index, v.day_name, v.sort_order, v.focus
from public.programs p
join (
  values
  (
    '3-dumbbells',
    'conditioning',
    1::smallint,
    'Conditioning',
    1::smallint,
    'conditioning'
  ),
  (
    '3-dumbbells',
    'strength',
    2::smallint,
    'Strength',
    2::smallint,
    'strength'
  ),
  (
    '3-dumbbells',
    'unilateral',
    3::smallint,
    'Unilateral',
    3::smallint,
    'unilateral'
  ),
  (
    '3-female',
    'glute',
    1::smallint,
    'Glute',
    1::smallint,
    'glute'
  ),
  (
    '3-female',
    'lower',
    2::smallint,
    'Lower',
    2::smallint,
    'lower'
  ),
  (
    '3-female',
    'upper',
    3::smallint,
    'Upper',
    3::smallint,
    'upper'
  ),
  (
    '3-full-body',
    'fullbody',
    1::smallint,
    'FullBody',
    1::smallint,
    'fullbody'
  ),
  (
    '3-full-body',
    'lower',
    2::smallint,
    'Lower',
    2::smallint,
    'lower'
  ),
  (
    '3-full-body',
    'upper',
    3::smallint,
    'Upper',
    3::smallint,
    'upper'
  ),
  (
    '3-minimal-home',
    'fullbody-a',
    1::smallint,
    'FullBody A',
    1::smallint,
    'fullbody'
  ),
  (
    '3-minimal-home',
    'fullbody-b',
    2::smallint,
    'FullBody B',
    2::smallint,
    'fullbody'
  ),
  (
    '3-minimal-home',
    'fullbody-c',
    3::smallint,
    'FullBody C',
    3::smallint,
    'fullbody'
  ),
  (
    '3-minimalist',
    'fullbody',
    1::smallint,
    'FullBody',
    1::smallint,
    'fullbody'
  ),
  (
    '3-minimalist',
    'lower',
    2::smallint,
    'Lower',
    2::smallint,
    'lower'
  ),
  (
    '3-minimalist',
    'upper',
    3::smallint,
    'Upper',
    3::smallint,
    'upper'
  ),
  (
    '3-plfull-body',
    'leg',
    1::smallint,
    'Leg',
    1::smallint,
    'leg'
  ),
  (
    '3-plfull-body',
    'pull',
    2::smallint,
    'Pull',
    2::smallint,
    'pull'
  ),
  (
    '3-plfull-body',
    'push',
    3::smallint,
    'Push',
    3::smallint,
    'push'
  ),
  (
    '3-push-pull-legs',
    'legs',
    1::smallint,
    'Legs',
    1::smallint,
    'legs'
  ),
  (
    '3-push-pull-legs',
    'pull',
    2::smallint,
    'Pull',
    2::smallint,
    'pull'
  ),
  (
    '3-push-pull-legs',
    'push',
    3::smallint,
    'Push',
    3::smallint,
    'push'
  ),
  (
    '3-travel',
    'circuit-1',
    1::smallint,
    'Circuit 1',
    1::smallint,
    'circuit'
  ),
  (
    '3-travel',
    'circuit-2',
    2::smallint,
    'Circuit 2',
    2::smallint,
    'circuit'
  ),
  (
    '3-travel',
    'circuit-3',
    3::smallint,
    'Circuit 3',
    3::smallint,
    'circuit'
  ),
  (
    '4-beach-body',
    'legs',
    1::smallint,
    'Legs',
    1::smallint,
    'legs'
  ),
  (
    '4-beach-body',
    'pull',
    2::smallint,
    'Pull',
    2::smallint,
    'pull'
  ),
  (
    '4-beach-body',
    'push',
    3::smallint,
    'Push',
    3::smallint,
    'push'
  ),
  (
    '4-beach-body',
    'upper',
    4::smallint,
    'Upper',
    4::smallint,
    'upper'
  ),
  (
    '4-bodyweight',
    'lower',
    1::smallint,
    'Lower',
    1::smallint,
    'lower'
  ),
  (
    '4-bodyweight',
    'conditioning',
    2::smallint,
    'Conditioning',
    2::smallint,
    'conditioning'
  ),
  (
    '4-bodyweight',
    'day-03',
    3::smallint,
    'Day 3',
    3::smallint,
    'day-03'
  ),
  (
    '4-bodyweight',
    'pull-core',
    4::smallint,
    'Pull/Core',
    4::smallint,
    'pull'
  ),
  (
    '4-female-minimalist',
    'legs-a',
    1::smallint,
    'Legs A',
    1::smallint,
    'legs'
  ),
  (
    '4-female-minimalist',
    'legs-b',
    2::smallint,
    'Legs B',
    2::smallint,
    'legs'
  ),
  (
    '4-female-minimalist',
    'upper-a',
    3::smallint,
    'Upper A',
    3::smallint,
    'upper'
  ),
  (
    '4-female-minimalist',
    'upper-b',
    4::smallint,
    'Upper B',
    4::smallint,
    'upper'
  ),
  (
    '4-female-plpl',
    'day-01',
    1::smallint,
    'Day 1',
    1::smallint,
    'day-01'
  ),
  (
    '4-female-plpl',
    'day-02',
    2::smallint,
    'Day 2',
    2::smallint,
    'day-02'
  ),
  (
    '4-female-plpl',
    'day-03',
    3::smallint,
    'Day 3',
    3::smallint,
    'day-03'
  ),
  (
    '4-female-plpl',
    'day-04',
    4::smallint,
    'Day 4',
    4::smallint,
    'day-04'
  ),
  (
    '4-female-specialized',
    'back',
    1::smallint,
    'Back',
    1::smallint,
    'back'
  ),
  (
    '4-female-specialized',
    'delt',
    2::smallint,
    'Delt',
    2::smallint,
    'delt'
  ),
  (
    '4-female-specialized',
    'legs',
    3::smallint,
    'Legs',
    3::smallint,
    'legs'
  ),
  (
    '4-female-specialized',
    'squats',
    4::smallint,
    'Squats',
    4::smallint,
    'squats'
  ),
  (
    '4-home-hiit',
    'lower-body-engine',
    1::smallint,
    'Lower Body Engine',
    1::smallint,
    'lower'
  ),
  (
    '4-home-hiit',
    'upper-body-burn',
    2::smallint,
    'Upper Body Burn',
    2::smallint,
    'upper'
  ),
  (
    '4-home-hiit',
    'metcon-core',
    3::smallint,
    'Metcon Core',
    3::smallint,
    'core'
  ),
  (
    '4-home-hiit',
    'full-body-power',
    4::smallint,
    'Full Body Power',
    4::smallint,
    'full-body'
  ),
  (
    '4-minimalist',
    'lower-push',
    1::smallint,
    'Lower + Push',
    1::smallint,
    'lower'
  ),
  (
    '4-minimalist',
    'upper',
    2::smallint,
    'Upper',
    2::smallint,
    'upper'
  ),
  (
    '4-minimalist',
    'pull-glutes',
    3::smallint,
    'Pull + Glutes',
    3::smallint,
    'pull'
  ),
  (
    '4-minimalist',
    'lower-stability',
    4::smallint,
    'Lower + Stability',
    4::smallint,
    'lower'
  ),
  (
    '4-muscle-builder',
    'upper-a',
    1::smallint,
    'Upper (A)',
    1::smallint,
    'upper'
  ),
  (
    '4-muscle-builder',
    'lower-a',
    2::smallint,
    'Lower (A)',
    2::smallint,
    'lower'
  ),
  (
    '4-muscle-builder',
    'lower-b',
    3::smallint,
    'Lower (B)',
    3::smallint,
    'lower'
  ),
  (
    '4-muscle-builder',
    'upper-b',
    4::smallint,
    'Upper (B)',
    4::smallint,
    'upper'
  ),
  (
    '4-science-based',
    'day-01',
    1::smallint,
    'Day 1',
    1::smallint,
    'day-01'
  ),
  (
    '4-science-based',
    'day-02',
    2::smallint,
    'Day 2',
    2::smallint,
    'day-02'
  ),
  (
    '4-science-based',
    'day-03',
    3::smallint,
    'Day 3',
    3::smallint,
    'day-03'
  ),
  (
    '4-science-based',
    'day-04',
    4::smallint,
    'Day 4',
    4::smallint,
    'day-04'
  ),
  (
    '5-dumbbells',
    'day-01',
    1::smallint,
    'Day 1',
    1::smallint,
    'day-01'
  ),
  (
    '5-dumbbells',
    'day-02',
    2::smallint,
    'Day 2',
    2::smallint,
    'day-02'
  ),
  (
    '5-dumbbells',
    'day-03',
    3::smallint,
    'Day 3',
    3::smallint,
    'day-03'
  ),
  (
    '5-dumbbells',
    'day-04',
    4::smallint,
    'Day 4',
    4::smallint,
    'day-04'
  ),
  (
    '5-dumbbells',
    'day-05',
    5::smallint,
    'Day 5',
    5::smallint,
    'day-05'
  ),
  (
    '5-female',
    'day-01',
    1::smallint,
    'Day 1',
    1::smallint,
    'day-01'
  ),
  (
    '5-female',
    'day-02',
    2::smallint,
    'Day 2',
    2::smallint,
    'day-02'
  ),
  (
    '5-female',
    'day-03',
    3::smallint,
    'Day 3',
    3::smallint,
    'day-03'
  ),
  (
    '5-female',
    'day-04',
    4::smallint,
    'Day 4',
    4::smallint,
    'day-04'
  ),
  (
    '5-female',
    'day-05',
    5::smallint,
    'Day 5',
    5::smallint,
    'day-05'
  ),
  (
    '5-muscle-builder',
    'push',
    1::smallint,
    'Push',
    1::smallint,
    'push'
  ),
  (
    '5-muscle-builder',
    'legs-a',
    2::smallint,
    'Legs (A)',
    2::smallint,
    'legs'
  ),
  (
    '5-muscle-builder',
    'legs-b',
    3::smallint,
    'Legs (B)',
    3::smallint,
    'legs'
  ),
  (
    '5-muscle-builder',
    'upper',
    4::smallint,
    'Upper',
    4::smallint,
    'upper'
  ),
  (
    '5-muscle-builder',
    'pull',
    5::smallint,
    'Pull',
    5::smallint,
    'pull'
  ),
  (
    '5-powerbuilding',
    'day-01',
    1::smallint,
    'Day 1',
    1::smallint,
    'day-01'
  ),
  (
    '5-powerbuilding',
    'day-02',
    2::smallint,
    'Day 2',
    2::smallint,
    'day-02'
  ),
  (
    '5-powerbuilding',
    'day-03',
    3::smallint,
    'Day 3',
    3::smallint,
    'day-03'
  ),
  (
    '5-powerbuilding',
    'day-04',
    4::smallint,
    'Day 4',
    4::smallint,
    'day-04'
  ),
  (
    '5-powerbuilding',
    'day-05',
    5::smallint,
    'Day 5',
    5::smallint,
    'day-05'
  ),
  (
    '5-sbd-strength',
    'legs-squats-75',
    1::smallint,
    'Legs (Squats)',
    1::smallint,
    'legs'
  ),
  (
    '5-sbd-strength',
    'push-bench-75',
    2::smallint,
    'Push (Bench)',
    2::smallint,
    'push'
  ),
  (
    '5-sbd-strength',
    'upper',
    3::smallint,
    'Upper',
    3::smallint,
    'upper'
  ),
  (
    '5-sbd-strength',
    'lower-deadlifts-75',
    4::smallint,
    'Lower (Deadlifts)',
    4::smallint,
    'lower'
  ),
  (
    '5-sbd-strength',
    'pull',
    5::smallint,
    'Pull',
    5::smallint,
    'pull'
  ),
  (
    '6-female-ppl',
    'day-01',
    1::smallint,
    'Day 1',
    1::smallint,
    'day-01'
  ),
  (
    '6-female-ppl',
    'day-02',
    2::smallint,
    'Day 2',
    2::smallint,
    'day-02'
  ),
  (
    '6-female-ppl',
    'day-03',
    3::smallint,
    'Day 3',
    3::smallint,
    'day-03'
  ),
  (
    '6-female-ppl',
    'day-04',
    4::smallint,
    'Day 4',
    4::smallint,
    'day-04'
  ),
  (
    '6-female-ppl',
    'day-05',
    5::smallint,
    'Day 5',
    5::smallint,
    'day-05'
  ),
  (
    '6-female-ppl',
    'day-06',
    6::smallint,
    'Day 6',
    6::smallint,
    'day-06'
  ),
  (
    '6-muscle-builder',
    'upper-a',
    1::smallint,
    'Upper (A)',
    1::smallint,
    'upper'
  ),
  (
    '6-muscle-builder',
    'legs-c',
    2::smallint,
    'Legs (C)',
    2::smallint,
    'legs'
  ),
  (
    '6-muscle-builder',
    'legs-a',
    3::smallint,
    'Legs (A)',
    3::smallint,
    'legs'
  ),
  (
    '6-muscle-builder',
    'upper-c',
    4::smallint,
    'Upper (C)',
    4::smallint,
    'upper'
  ),
  (
    '6-muscle-builder',
    'legs-b',
    5::smallint,
    'Legs (B)',
    5::smallint,
    'legs'
  ),
  (
    '6-muscle-builder',
    'upper-b',
    6::smallint,
    'Upper (B)',
    6::smallint,
    'upper'
  ),
  (
    '6-ppl',
    'push-a',
    1::smallint,
    'Push (A)',
    1::smallint,
    'push'
  ),
  (
    '6-ppl',
    'legs-b',
    2::smallint,
    'Legs (B)',
    2::smallint,
    'legs'
  ),
  (
    '6-ppl',
    'pull-a',
    3::smallint,
    'Pull (A)',
    3::smallint,
    'pull'
  ),
  (
    '6-ppl',
    'push-b',
    4::smallint,
    'Push (B)',
    4::smallint,
    'push'
  ),
  (
    '6-ppl',
    'pull-b',
    5::smallint,
    'Pull (B)',
    5::smallint,
    'pull'
  ),
  (
    '6-ppl',
    'legs-a',
    6::smallint,
    'Legs (A)',
    6::smallint,
    'legs'
  )
) as v (program_slug, day_slug, day_index, day_name, sort_order, focus)
  on p.slug = v.program_slug
on conflict (program_id, slug) do update set
  day_index = excluded.day_index,
  name = excluded.name,
  sort_order = excluded.sort_order,
  focus = excluded.focus;

-- Backfill Starting Strength metadata from schema extension migration.
update public.programs
set
  level = 'intermediate'::public.program_level,
  tags = array['strength']::text[]
where slug = 'starting-strength-mvp'
  and (level is null or tags = '{}'::text[]);
