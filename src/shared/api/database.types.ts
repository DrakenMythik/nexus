/**
 * Supabase database typings for the browser client.
 * Kept in sync with SQL migrations under supabase/migrations/.
 */
export type WorkoutSessionStatus = 'in_progress' | 'completed' | 'skipped';

export type ProgramBlockType =
  | 'warmup'
  | 'workout'
  | 'superset'
  | 'interval_circuit'
  | 'cooldown';

export type ExercisePrescriptionMode =
  | 'sets_reps'
  | 'time_interval'
  | 'percentage_1rm';

export type ExerciseProtocol =
  | 'double_progression'
  | 'top_set_backoff'
  | 'percentage_block'
  | 'interval_progression'
  | 'circuit';

export type ProgramLevel = 'beginner' | 'intermediate' | 'advanced';

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string | null;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          display_name?: string | null;
          timezone?: string;
          updated_at?: string;
        };
      };
      workout_sessions: {
        Row: {
          id: string;
          user_id: string;
          program_day_id: string | null;
          status: WorkoutSessionStatus | null;
          session_date: string | null;
          started_at: string;
          ended_at: string | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          program_day_id?: string | null;
          status?: WorkoutSessionStatus | null;
          session_date?: string | null;
          started_at?: string;
          ended_at?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          program_day_id?: string | null;
          status?: WorkoutSessionStatus | null;
          session_date?: string | null;
          started_at?: string;
          ended_at?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      health_metrics: {
        Row: {
          id: string;
          user_id: string;
          recorded_at: string;
          weight_kg: number | null;
          sleep_hours: number | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          recorded_at?: string;
          weight_kg?: number | null;
          sleep_hours?: number | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          recorded_at?: string;
          weight_kg?: number | null;
          sleep_hours?: number | null;
          notes?: string | null;
          updated_at?: string;
        };
      };
      programs: {
        Row: {
          id: string;
          slug: string;
          name: string;
          description: string | null;
          days_per_week: number;
          is_published: boolean;
          created_at: string;
          tags: string[];
          source_folder: string | null;
          level: ProgramLevel | null;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          description?: string | null;
          days_per_week: number;
          is_published?: boolean;
          created_at?: string;
          tags?: string[];
          source_folder?: string | null;
          level?: ProgramLevel | null;
        };
        Update: {
          slug?: string;
          name?: string;
          description?: string | null;
          days_per_week?: number;
          is_published?: boolean;
          tags?: string[];
          source_folder?: string | null;
          level?: ProgramLevel | null;
        };
      };
      program_days: {
        Row: {
          id: string;
          program_id: string;
          slug: string;
          day_index: number;
          name: string;
          sort_order: number;
          focus: string | null;
        };
        Insert: {
          id?: string;
          program_id: string;
          slug: string;
          day_index: number;
          name: string;
          sort_order: number;
          focus?: string | null;
        };
        Update: {
          program_id?: string;
          slug?: string;
          day_index?: number;
          name?: string;
          sort_order?: number;
          focus?: string | null;
        };
      };
      program_blocks: {
        Row: {
          id: string;
          program_day_id: string;
          slug: string;
          block_type: ProgramBlockType;
          name: string;
          sort_order: number;
          instructions: string | null;
          round_count: number | null;
        };
        Insert: {
          id?: string;
          program_day_id: string;
          slug: string;
          block_type?: ProgramBlockType;
          name: string;
          sort_order: number;
          instructions?: string | null;
          round_count?: number | null;
        };
        Update: {
          program_day_id?: string;
          slug?: string;
          block_type?: ProgramBlockType;
          name?: string;
          sort_order?: number;
          instructions?: string | null;
          round_count?: number | null;
        };
      };
      program_exercises: {
        Row: {
          id: string;
          program_day_id: string;
          program_block_id: string | null;
          slug: string;
          name: string;
          sort_order: number;
          prescription_mode: ExercisePrescriptionMode;
          protocol: ExerciseProtocol | null;
          tempo: string | null;
          superset_letter: string | null;
          percentage_start: number | null;
          percentage_increment: number | null;
          work_seconds: number | null;
          target_sets: number;
          target_reps: string;
          rest_seconds: number | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          program_day_id: string;
          program_block_id?: string | null;
          slug: string;
          name: string;
          sort_order: number;
          prescription_mode?: ExercisePrescriptionMode;
          protocol?: ExerciseProtocol | null;
          tempo?: string | null;
          superset_letter?: string | null;
          percentage_start?: number | null;
          percentage_increment?: number | null;
          work_seconds?: number | null;
          target_sets: number;
          target_reps: string;
          rest_seconds?: number | null;
          notes?: string | null;
        };
        Update: {
          program_day_id?: string;
          program_block_id?: string | null;
          slug?: string;
          name?: string;
          sort_order?: number;
          prescription_mode?: ExercisePrescriptionMode;
          protocol?: ExerciseProtocol | null;
          tempo?: string | null;
          superset_letter?: string | null;
          percentage_start?: number | null;
          percentage_increment?: number | null;
          work_seconds?: number | null;
          target_sets?: number;
          target_reps?: string;
          rest_seconds?: number | null;
          notes?: string | null;
        };
      };
      program_exercise_sets: {
        Row: {
          id: string;
          program_exercise_id: string;
          set_number: number;
          target_reps: string | null;
          rest_seconds: number | null;
          work_seconds: number | null;
          load_note: string | null;
        };
        Insert: {
          id?: string;
          program_exercise_id: string;
          set_number: number;
          target_reps?: string | null;
          rest_seconds?: number | null;
          work_seconds?: number | null;
          load_note?: string | null;
        };
        Update: {
          program_exercise_id?: string;
          set_number?: number;
          target_reps?: string | null;
          rest_seconds?: number | null;
          work_seconds?: number | null;
          load_note?: string | null;
        };
      };
      program_exercise_alternates: {
        Row: {
          id: string;
          program_exercise_id: string;
          name: string;
          sort_order: number;
        };
        Insert: {
          id?: string;
          program_exercise_id: string;
          name: string;
          sort_order: number;
        };
        Update: {
          program_exercise_id?: string;
          name?: string;
          sort_order?: number;
        };
      };
      user_program_enrollments: {
        Row: {
          id: string;
          user_id: string;
          program_id: string;
          is_active: boolean;
          started_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          program_id: string;
          is_active?: boolean;
          started_at?: string;
          created_at?: string;
        };
        Update: {
          program_id?: string;
          is_active?: boolean;
          started_at?: string;
        };
      };
      readiness_checks: {
        Row: {
          id: string;
          user_id: string;
          check_date: string;
          readiness: number;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          check_date: string;
          readiness: number;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          check_date?: string;
          readiness?: number;
          note?: string | null;
        };
      };
      set_logs: {
        Row: {
          id: string;
          user_id: string;
          workout_session_id: string;
          program_exercise_id: string | null;
          exercise_name: string;
          set_index: number;
          target_reps: string | null;
          weight_kg: number | null;
          reps: number | null;
          is_completed: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          workout_session_id: string;
          program_exercise_id?: string | null;
          exercise_name: string;
          set_index: number;
          target_reps?: string | null;
          weight_kg?: number | null;
          reps?: number | null;
          is_completed?: boolean;
          created_at?: string;
        };
        Update: {
          program_exercise_id?: string | null;
          exercise_name?: string;
          set_index?: number;
          target_reps?: string | null;
          weight_kg?: number | null;
          reps?: number | null;
          is_completed?: boolean;
        };
      };
    };
  };
};
