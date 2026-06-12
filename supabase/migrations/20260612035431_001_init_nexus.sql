-- 1. ENUMS
CREATE TYPE user_sex AS ENUM ('Male', 'Female', 'Other', 'Prefer Not to Say');
CREATE TYPE program_level AS ENUM ('Beginner', 'Intermediate', 'Advanced');
CREATE TYPE program_specialty AS ENUM ('Hypertrophy', 'Strength', 'Weight Loss');
CREATE TYPE block_type AS ENUM ('Warmup', 'Main', 'Cooldown');

-- 2. USERS (Links to Supabase Auth)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    display_name TEXT,
    sex user_sex,
    birthdate DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sync auth.users -> public.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.users (id, email, display_name)
  VALUES (
    new.id,
    coalesce(new.email, new.id::text || '@no-email.nexus.local'),
    new.raw_user_meta_data->>'display_name'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
END;
$$;

COMMENT ON FUNCTION public.handle_new_user() IS
  'Creates public.users when auth.users row is inserted; idempotent on conflict.';

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. DAILY BIOMETRICS
CREATE TABLE daily_biometrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    log_date DATE NOT NULL,
    sleep_hours NUMERIC,
    steps INTEGER,
    calories INTEGER,
    protein_g INTEGER,
    readiness_score INTEGER CHECK (readiness_score >= 1 AND readiness_score <= 100),
    UNIQUE(user_id, log_date)
);

-- 4. THE LIBRARY (Templates)
CREATE TABLE programs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    weeks_duration INTEGER NOT NULL,
    days_per_week INTEGER NOT NULL,
    level program_level,
    specialty program_specialty
);

CREATE TABLE workouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    program_id UUID REFERENCES programs(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    week_number INTEGER NOT NULL,
    day_number INTEGER NOT NULL
);

CREATE TABLE exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    instructions TEXT,
    muscle_group TEXT NOT NULL
);

CREATE TABLE workout_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_id UUID REFERENCES workouts(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
    block_type block_type NOT NULL,
    order_index INTEGER NOT NULL,
    superset_group TEXT,
    target_sets INTEGER NOT NULL,
    target_reps_min INTEGER, -- Nullable for time-based exercises
    target_reps_max INTEGER, -- Nullable for time-based exercises
    target_time_seconds INTEGER,
    rest_seconds INTEGER,
    tempo TEXT
);

-- 5. THE LOGS (User Actions)
CREATE TABLE workout_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
    workout_id UUID REFERENCES workouts(id) ON DELETE SET NULL, -- Nullable for freestyle
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at TIMESTAMPTZ
);

CREATE TABLE set_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_log_id UUID REFERENCES workout_logs(id) ON DELETE CASCADE NOT NULL,
    exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
    set_number INTEGER NOT NULL,
    weight NUMERIC NOT NULL,
    reps_completed INTEGER NOT NULL,
    rpe INTEGER CHECK (rpe >= 1 AND rpe <= 10)
);

-- 6. INDEXES (user-owned lookups)
CREATE INDEX idx_daily_biometrics_user_id ON public.daily_biometrics (user_id);
CREATE INDEX idx_workout_logs_user_id ON public.workout_logs (user_id);
CREATE INDEX idx_set_logs_workout_log_id ON public.set_logs (workout_log_id);
CREATE INDEX idx_workouts_program_id ON public.workouts (program_id);
CREATE INDEX idx_workout_exercises_workout_id ON public.workout_exercises (workout_id);

-- 7. ROW LEVEL SECURITY
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_biometrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.set_logs ENABLE ROW LEVEL SECURITY;

-- users: one row per auth user
CREATE POLICY "users_select_own"
  ON public.users
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = id);

CREATE POLICY "users_insert_own"
  ON public.users
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "users_update_own"
  ON public.users
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = id)
  WITH CHECK ((SELECT auth.uid()) = id);

CREATE POLICY "users_delete_own"
  ON public.users
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = id);

-- daily_biometrics: user-owned health snapshots
CREATE POLICY "daily_biometrics_select_own"
  ON public.daily_biometrics
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "daily_biometrics_insert_own"
  ON public.daily_biometrics
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "daily_biometrics_update_own"
  ON public.daily_biometrics
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "daily_biometrics_delete_own"
  ON public.daily_biometrics
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- catalog library: authenticated read-only (seed/edit via service role)
CREATE POLICY "programs_select_authenticated"
  ON public.programs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "workouts_select_authenticated"
  ON public.workouts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "exercises_select_authenticated"
  ON public.exercises
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "workout_exercises_select_authenticated"
  ON public.workout_exercises
  FOR SELECT
  TO authenticated
  USING (true);

-- workout_logs: user-owned sessions
CREATE POLICY "workout_logs_select_own"
  ON public.workout_logs
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "workout_logs_insert_own"
  ON public.workout_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND (
      workout_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.workouts w
        WHERE w.id = workout_id
      )
    )
  );

CREATE POLICY "workout_logs_update_own"
  ON public.workout_logs
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK (
    (SELECT auth.uid()) = user_id
    AND (
      workout_id IS NULL
      OR EXISTS (
        SELECT 1
        FROM public.workouts w
        WHERE w.id = workout_id
      )
    )
  );

CREATE POLICY "workout_logs_delete_own"
  ON public.workout_logs
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

-- set_logs: owned via parent workout_log (FK-aware WITH CHECK)
CREATE POLICY "set_logs_select_own"
  ON public.set_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.workout_logs wl
      WHERE wl.id = set_logs.workout_log_id
        AND wl.user_id = (SELECT auth.uid())
    )
  );

CREATE POLICY "set_logs_insert_own"
  ON public.set_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.workout_logs wl
      WHERE wl.id = workout_log_id
        AND wl.user_id = (SELECT auth.uid())
    )
    AND EXISTS (
      SELECT 1
      FROM public.exercises e
      WHERE e.id = exercise_id
    )
  );

CREATE POLICY "set_logs_update_own"
  ON public.set_logs
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.workout_logs wl
      WHERE wl.id = set_logs.workout_log_id
        AND wl.user_id = (SELECT auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.workout_logs wl
      WHERE wl.id = workout_log_id
        AND wl.user_id = (SELECT auth.uid())
    )
    AND EXISTS (
      SELECT 1
      FROM public.exercises e
      WHERE e.id = exercise_id
    )
  );

CREATE POLICY "set_logs_delete_own"
  ON public.set_logs
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.workout_logs wl
      WHERE wl.id = set_logs.workout_log_id
        AND wl.user_id = (SELECT auth.uid())
    )
  );

-- 8. GRANTS (authenticated clients use anon key + JWT; RLS applies)
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.daily_biometrics TO authenticated;
GRANT SELECT ON TABLE public.programs TO authenticated;
GRANT SELECT ON TABLE public.workouts TO authenticated;
GRANT SELECT ON TABLE public.exercises TO authenticated;
GRANT SELECT ON TABLE public.workout_exercises TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.workout_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.set_logs TO authenticated;

-- 9. ANON DEFAULT-DENY
REVOKE ALL ON TABLE public.users FROM anon;
REVOKE ALL ON TABLE public.daily_biometrics FROM anon;
REVOKE ALL ON TABLE public.programs FROM anon;
REVOKE ALL ON TABLE public.workouts FROM anon;
REVOKE ALL ON TABLE public.exercises FROM anon;
REVOKE ALL ON TABLE public.workout_exercises FROM anon;
REVOKE ALL ON TABLE public.workout_logs FROM anon;
REVOKE ALL ON TABLE public.set_logs FROM anon;