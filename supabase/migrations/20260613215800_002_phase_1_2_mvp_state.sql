-- Phase 1 + Phase 2 MVP state: enrollment, adherence, progression, and sync metadata.

ALTER TABLE public.workout_logs
  ADD COLUMN status text NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'discarded')),
  ADD COLUMN client_mutation_id text,
  ADD COLUMN completed_at timestamptz;

ALTER TABLE public.set_logs
  ADD COLUMN client_mutation_id text;

ALTER TABLE public.workout_logs
  ADD CONSTRAINT workout_logs_client_mutation_unique UNIQUE (user_id, client_mutation_id),
  ADD CONSTRAINT workout_logs_completed_consistency CHECK (
    (status = 'completed' AND ended_at IS NOT NULL)
    OR status <> 'completed'
  );

ALTER TABLE public.set_logs
  ADD CONSTRAINT set_logs_workout_exercise_set_unique
    UNIQUE (workout_log_id, exercise_id, set_number);

CREATE TABLE public.user_program_enrollments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  program_id uuid REFERENCES public.programs(id) ON DELETE RESTRICT NOT NULL,
  started_on date NOT NULL DEFAULT current_date,
  current_week_number integer NOT NULL DEFAULT 1 CHECK (current_week_number > 0),
  current_day_number integer NOT NULL DEFAULT 1 CHECK (current_day_number > 0),
  pushed_until date,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX user_program_enrollments_one_active
  ON public.user_program_enrollments (user_id)
  WHERE active;

CREATE INDEX idx_user_program_enrollments_user_id
  ON public.user_program_enrollments (user_id);

CREATE TABLE public.adherence_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  event_date date NOT NULL,
  status daily_status NOT NULL DEFAULT 'pending',
  source text NOT NULL DEFAULT 'daily_ritual'
    CHECK (source IN ('daily_ritual', 'workout_finish', 'smart_rest', 'system')),
  smart_rest_commitment text
    CHECK (
      smart_rest_commitment IS NULL
      OR smart_rest_commitment IN ('push_tomorrow', 'sleep_priority', 'hydrate', 'mobility')
    ),
  workout_log_id uuid REFERENCES public.workout_logs(id) ON DELETE SET NULL,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, event_date),
  CHECK (
    status <> 'smart_rest'
    OR smart_rest_commitment IS NOT NULL
  )
);

CREATE INDEX idx_adherence_events_user_date
  ON public.adherence_events (user_id, event_date DESC);

CREATE TABLE public.exercise_progressions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  exercise_id uuid REFERENCES public.exercises(id) ON DELETE CASCADE NOT NULL,
  target_weight numeric NOT NULL CHECK (target_weight > 0),
  increment_weight numeric NOT NULL DEFAULT 2.5 CHECK (increment_weight > 0),
  last_completed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, exercise_id)
);

CREATE INDEX idx_exercise_progressions_user_id
  ON public.exercise_progressions (user_id);

CREATE TABLE public.offline_mutations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  client_mutation_id text NOT NULL,
  mutation_type text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  status text NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'syncing', 'synced', 'failed')),
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  synced_at timestamptz,
  UNIQUE (user_id, client_mutation_id)
);

CREATE INDEX idx_offline_mutations_user_status
  ON public.offline_mutations (user_id, status, created_at);

ALTER TABLE public.user_program_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.adherence_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_progressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.offline_mutations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_program_enrollments_select_own"
  ON public.user_program_enrollments
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "user_program_enrollments_insert_own"
  ON public.user_program_enrollments
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "user_program_enrollments_update_own"
  ON public.user_program_enrollments
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "user_program_enrollments_delete_own"
  ON public.user_program_enrollments
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "adherence_events_select_own"
  ON public.adherence_events
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "adherence_events_insert_own"
  ON public.adherence_events
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "adherence_events_update_own"
  ON public.adherence_events
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "adherence_events_delete_own"
  ON public.adherence_events
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "exercise_progressions_select_own"
  ON public.exercise_progressions
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "exercise_progressions_insert_own"
  ON public.exercise_progressions
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "exercise_progressions_update_own"
  ON public.exercise_progressions
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "exercise_progressions_delete_own"
  ON public.exercise_progressions
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "offline_mutations_select_own"
  ON public.offline_mutations
  FOR SELECT
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

CREATE POLICY "offline_mutations_insert_own"
  ON public.offline_mutations
  FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "offline_mutations_update_own"
  ON public.offline_mutations
  FOR UPDATE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id)
  WITH CHECK ((SELECT auth.uid()) = user_id);

CREATE POLICY "offline_mutations_delete_own"
  ON public.offline_mutations
  FOR DELETE
  TO authenticated
  USING ((SELECT auth.uid()) = user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.user_program_enrollments TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.adherence_events TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.exercise_progressions TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.offline_mutations TO authenticated;

REVOKE ALL ON TABLE public.user_program_enrollments FROM anon;
REVOKE ALL ON TABLE public.adherence_events FROM anon;
REVOKE ALL ON TABLE public.exercise_progressions FROM anon;
REVOKE ALL ON TABLE public.offline_mutations FROM anon;
