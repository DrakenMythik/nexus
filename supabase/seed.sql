-- Disable triggers for bulk import to prevent foreign key errors during the drop phase
SET session_replication_role = 'replica';

-- 1. Clear Existing Data (Reverse dependency order)
DELETE FROM public.set_logs;
DELETE FROM public.workout_logs;
DELETE FROM public.workout_exercises;
DELETE FROM public.workouts;
DELETE FROM public.programs;
DELETE FROM public.exercises;

-- 2. Insert Exercises Catalog
INSERT INTO public.exercises (id, name, muscle_group, instructions) VALUES
-- Starting Strength Core Exercises
('e0000000-0000-0000-0000-000000000001', 'Low Bar Squat', 'Legs', 'Bar resting on the rear delts, break at hips and knees simultaneously.'),
('e0000000-0000-0000-0000-000000000002', 'Bench Press', 'Chest', 'Feet planted, slight back arch, bar touches mid-chest.'),
('e0000000-0000-0000-0000-000000000003', 'Deadlift', 'Back', 'Bar over mid-foot, hips high, drag bar up the shins.'),
('e0000000-0000-0000-0000-000000000004', 'Overhead Press', 'Shoulders', 'Strict press from the clavicle, push head through at the top.'),
('e0000000-0000-0000-0000-000000000005', 'Power Clean', 'Full Body', 'Explosive pull from the floor, catch the bar on the front delts.'),

-- 3 Day Push PPL Exercises
('e0000000-0000-0000-0000-000000000006', 'Incline Smith Chest Press', 'Chest', 'Top Set with Back Off Protocol.'),
('e0000000-0000-0000-0000-000000000007', 'Pin Loaded Shoulder Press', 'Shoulders', 'Top Set with Back Off Protocol.'),
('e0000000-0000-0000-0000-000000000008', 'Seated Dumbbell Lateral Raise', 'Shoulders', 'Control the eccentric.'),
('e0000000-0000-0000-0000-000000000009', 'Seated Dumbbell Bicep Curl', 'Arms', 'Keep elbows fixed.'),
('e0000000-0000-0000-0000-000000000010', 'Rope Tricep Pushdown', 'Arms', 'Pull rope apart at the bottom.'),
('e0000000-0000-0000-0000-000000000011', 'Bent Over V-Bar Row', 'Back', 'Hinge at the hips, pull to the belly button.'),
('e0000000-0000-0000-0000-000000000012', 'Assisted Pull Up', 'Back', 'Full stretch at the bottom.'),
('e0000000-0000-0000-0000-000000000013', 'Seated Cable Row', 'Back', 'Squeeze shoulder blades together.'),
('e0000000-0000-0000-0000-000000000014', 'Reverse Pec Deck Fly', 'Shoulders', 'Target rear delts.'),
('e0000000-0000-0000-0000-000000000015', 'Machine Preacher Curl', 'Arms', 'Full extension at the bottom.'),
('e0000000-0000-0000-0000-000000000016', 'Dumbbell Overhead Tricep Extension', 'Arms', 'Keep elbows tucked.'),
('e0000000-0000-0000-0000-000000000017', 'Smith Machine Stiff Leg Deadlift', 'Legs', 'Slight knee bend, hinge until hamstrings stretch.'),
('e0000000-0000-0000-0000-000000000018', 'Hack Squat', 'Legs', 'Deep range of motion, drive through heels.'),
('e0000000-0000-0000-0000-000000000019', 'Seated Leg Curl', 'Legs', 'Control the negative.'),
('e0000000-0000-0000-0000-000000000020', 'Walking Dumbbell Lunge', 'Legs', 'Long strides for glute focus, short for quads.'),
('e0000000-0000-0000-0000-000000000021', 'Assisted Sissy Squat', 'Legs', 'Push knees over toes, max reps to failure.'),
('e0000000-0000-0000-0000-000000000022', 'Standing Calf Raise', 'Legs', 'Pause at the stretch and contraction.');

-- 3. Insert Programs
INSERT INTO public.programs (id, name, description, level, specialty, days_per_week, weeks_duration) VALUES
('a1000000-0000-0000-0000-000000000001', 'Starting Strength', 'A novice linear progression program focused on the core barbell lifts.', 'Beginner', 'Strength', 3, 12),
('a1000000-0000-0000-0000-000000000002', '3 Day Push PPL', 'A 3-day split designed to build muscle through balanced push, pull, and leg sessions.', 'Intermediate', 'Hypertrophy', 3, 12);

-- 4. Insert Workouts (Week 1 Baseline)
INSERT INTO public.workouts (id, program_id, name, description, week_number, day_number) VALUES
-- Starting Strength Workouts
('b1000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000001', 'Workout A', 'Classic SS Session A', 1, 1),
('b1000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000001', 'Workout B', 'Classic SS Session B', 1, 2),

-- 3 Day PPL Workouts
('c2000000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', 'Push Session', 'Chest, Shoulders, and Triceps', 1, 1),
('c2000000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', 'Pull Session', 'Back, Rear Delts, and Biceps', 1, 2),
('c2000000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', 'Legs Session', 'Quads, Hamstrings, and Calves', 1, 3);

-- 5. Insert Workout Exercises
INSERT INTO public.workout_exercises (workout_id, exercise_id, block_type, order_index, target_sets, target_reps_min, target_reps_max, rest_seconds, tempo) VALUES
-- STARTING STRENGTH: Workout A
('b1000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000001', 'Main', 1, 3, 5, 5, 180, NULL), -- Squat
('b1000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000002', 'Main', 2, 3, 5, 5, 180, NULL), -- Bench Press
('b1000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000003', 'Main', 3, 1, 5, 5, 300, NULL), -- Deadlift

-- STARTING STRENGTH: Workout B
('b1000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000001', 'Main', 1, 3, 5, 5, 180, NULL), -- Squat
('b1000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000004', 'Main', 2, 3, 5, 5, 180, NULL), -- Overhead Press
('b1000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000005', 'Main', 3, 5, 3, 3, 180, NULL), -- Power Clean

-- 3 DAY PPL: Push Session
('c2000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000006', 'Main', 1, 3, 6, 12, 180, '3-1-X-1'), -- Incline Smith Chest Press
('c2000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000007', 'Main', 2, 3, 6, 12, 120, '3-1-X-1'), -- Pin Loaded Shoulder Press
('c2000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000008', 'Main', 3, 3, 10, 15, 120, '3-1-X-1'), -- Seated DB Lateral Raise
('c2000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000009', 'Main', 4, 3, 10, 15, 120, '3-1-2-1'), -- Seated DB Bicep Curl
('c2000000-0000-0000-0000-000000000001', 'e0000000-0000-0000-0000-000000000010', 'Main', 5, 3, 8, 12, 120, '3-1-X-1'), -- Rope Tricep Pushdown

-- 3 DAY PPL: Pull Session
('c2000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000011', 'Main', 1, 3, 8, 10, 120, '2-1-X-0'), -- Bent Over V-Bar Row
('c2000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000012', 'Main', 2, 3, 8, 12, 120, '3-1-X-1'), -- Assisted Pull Up
('c2000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000013', 'Main', 3, 3, 8, 12, 120, '3-1-X-1'), -- Seated Cable Row
('c2000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000014', 'Main', 4, 3, 10, 15, 120, '3-1-0-1'), -- Reverse Pec Deck Fly
('c2000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000015', 'Main', 5, 3, 8, 10, 120, '3-1-X-1'), -- Machine Preacher Curl
('c2000000-0000-0000-0000-000000000002', 'e0000000-0000-0000-0000-000000000016', 'Main', 6, 3, 12, 15, 120, '3-1-X-1'), -- DB Overhead Tricep Ext

-- 3 DAY PPL: Legs Session
('c2000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000017', 'Main', 1, 2, 4, 10, 180, '2-1-X-1'), -- Smith Stiff Leg Deadlift
('c2000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000018', 'Main', 2, 2, 8, 12, 180, '3-1-X-1'), -- Hack Squat
('c2000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000019', 'Main', 3, 3, 8, 12, 120, '3-1-0-1'), -- Seated Leg Curl
('c2000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000020', 'Main', 4, 3, 12, 15, 90, '3-1-2-1'), -- Walking DB Lunge
('c2000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000021', 'Main', 5, 2, 15, 20, 180, '3-0-2-0'), -- Assisted Sissy Squat
('c2000000-0000-0000-0000-000000000003', 'e0000000-0000-0000-0000-000000000022', 'Main', 6, 3, 12, 15, 120, '3-1-X-0'); -- Standing Calf Raise

INSERT INTO public.knowledge_nudges (category, title, content, source_citation) VALUES
-- Hypertrophy
('Hypertrophy', 'The Myth of the "Anabolic Window"', 'You don''t need to chug a protein shake within 30 minutes of lifting. Total daily protein intake matters far more than timing. Muscle protein synthesis remains elevated for 24-48 hours after a hard workout.', 'Schoenfeld et al., 2013'),
('Hypertrophy', 'Proximity to Failure (RIR)', 'To maximize muscle growth, your working sets must be challenging. Aim to finish your sets with 1-3 Reps in Reserve (RIR)—meaning you could only physically perform 1 to 3 more reps before failing.', 'Helms et al., 2016'),
('Hypertrophy', 'The Power of the Stretch', 'Exercises that load the muscle in a fully stretched position (like Romanian Deadlifts) cause greater hypertrophic signaling than those focused solely on the squeeze at the top.', 'Pedrosa et al., 2022'),
('Hypertrophy', 'Eccentric Overload', 'The lowering (eccentric) phase of a lift causes the most micro-tears in the muscle fiber, which stimulates growth. Never just drop the weight—control the descent for 2-3 seconds.', 'Franchi et al., 2017'),
('Hypertrophy', 'Volume vs. Frequency', 'Hitting a muscle group twice a week generally yields better growth than a single "bro-split" day, provided total weekly sets remain the same.', 'Schoenfeld et al., 2016'),

-- Strength
('Strength', 'Rest Between Sets', 'For maximal strength gains (lifting heavy in the 1-5 rep range), rest 3 to 5 minutes between sets. This allows your central nervous system to fully recover.', 'De Salles et al., 2009'),
('Strength', 'Specificity is King', 'Strength is a neurological skill. If you want a heavier squat, you have to practice squatting heavy. Accessory exercises help build muscle, but core movements must be trained heavy.', 'Principle of Specificity'),
('Strength', 'Intent to Move Fast', 'To get stronger, try to move the bar as fast as possible during the pushing/pulling phase. The intent to move fast recruits maximum fast-twitch muscle fibers.', 'Behm & Sale, 1993'),
('Strength', 'Microloading Matters', 'Adding just 2.5 lbs to each side of the bar might feel insignificant, but it is the secret to long-term strength. Linear progression relies on small increments.', 'Starting Strength'),
('Strength', 'Core Bracing (The Valsalva)', 'Before a heavy lift, take a deep breath into your belly and flex your core. This creates intra-abdominal pressure, protecting your spine and transferring force efficiently.', 'McGill, 2010'),

-- Weight Loss
('Weight Loss', 'The NEAT Factor', 'Non-Exercise Activity Thermogenesis (NEAT) accounts for up to 15% of your daily calorie burn. Taking the stairs and short walks burn far more calories over a week than a single intense cardio session.', 'Levine, 2002'),
('Weight Loss', 'Protein''s Thermic Effect', 'Your body burns 20-30% of the calories in protein just to digest it. This passively increases your daily calorie expenditure while preserving muscle.', 'Pesta & Samuel, 2014'),
('Weight Loss', 'The Sleep-Fat Loss Connection', 'When sleep-deprived, the body loses up to 55% less fat and 60% more muscle mass while on a calorie deficit.', 'Nedeltcheva et al., 2010'),
('Weight Loss', 'You Can''t Out-Train a Bad Diet', 'Running a mile burns roughly 100 calories. Fat loss is driven primarily by kitchen habits, while training drives body composition.', 'Hall et al., 2012'),
('Weight Loss', 'Beware of Liquid Calories', 'Sodas and heavy coffees bypass your brain''s satiety signals. You can consume 500 calories in seconds without feeling full.', 'DiMeglio & Mattes, 2000'),

-- Nutrition
('Nutrition', 'Carbs are Not the Enemy', 'Carbohydrates are your body''s primary fuel source for high-intensity training. Eating carbs around your workout replenishes glycogen stores.', 'Ivy, 2004'),
('Nutrition', 'The Leucine Threshold', 'To trigger muscle growth, a meal needs about 2.5-3 grams of the amino acid leucine (roughly 25-30g of high-quality protein).', 'Morton et al., 2015'),
('Nutrition', 'Hydration and Strength', 'Even a 2% drop in hydration levels can lead to a 10% drop in muscular strength and endurance.', 'Judelson et al., 2007'),
('Nutrition', 'Fats for Hormones', 'Extremely low-fat diets can crash your natural testosterone. Ensure at least 20-30% of your daily calories come from healthy fats.', 'Volek et al., 1997'),
('Nutrition', 'Micronutrients Matter', 'Hitting your macros is great, but vitamins and minerals govern the chemical reactions that make fat loss and muscle building possible.', 'Sports Nutrition Guidelines'),

-- Sleep (Recovery)
('Recovery', 'The HGH Spike', 'Up to 70% of your daily Human Growth Hormone (HGH) is released during the deepest phases of sleep. Skipping sleep robs your body of recovery.', 'Van Cauter et al., 2000'),
('Recovery', 'Caffeine''s Half-Life', 'Caffeine has a half-life of 5-6 hours. A 200mg pre-workout drink at 4 PM leaves 100mg active in your system at 9 PM, suppressing deep sleep.', 'Drake et al., 2013'),
('Recovery', 'The Temperature Trick', 'Your core body temperature needs to drop slightly to initiate deep sleep. Keeping your bedroom cool (around 65°F) improves sleep quality.', 'Harding et al., 2019'),
('Recovery', 'The 90-Minute Rule', 'Sleep occurs in 90-minute cycles. Waking up at the end of a cycle leaves you feeling refreshed, while waking up mid-cycle causes grogginess.', 'National Sleep Foundation'),
('Recovery', 'Light Viewing for Circadian Rhythm', 'Viewing natural sunlight within 30 minutes of waking triggers a healthy cortisol spike for morning energy and times your evening melatonin production.', 'Dijk et al., 1995');

-- Re-enable triggers
SET session_replication_role = 'origin';