import type { Database } from '@/shared/api';

/** Matches `public.programs` Row shape. */
export type Program = Database['public']['Tables']['programs']['Row'];

/** Matches `public.workouts` Row shape. */
export type Workout = Database['public']['Tables']['workouts']['Row'];

/** Matches `public.exercises` Row shape. */
export type Exercise = Database['public']['Tables']['exercises']['Row'];

/** Matches `public.workout_exercises` Row shape. */
export type WorkoutExercise =
  Database['public']['Tables']['workout_exercises']['Row'];

/** Matches `public.block_type` enum on `workout_exercises`. */
export type BlockType = Database['public']['Enums']['block_type'];

/** Prescription row with joined exercise library details. */
export type WorkoutExerciseWithDetails = WorkoutExercise & {
  exercise: Exercise;
};

/** A workout template with ordered prescriptions. */
export type WorkoutWithExercises = Workout & {
  exercises: WorkoutExerciseWithDetails[];
};

/** A program with its workout templates, ordered by week then day. */
export type ProgramWithWorkouts = Program & {
  workouts: WorkoutWithExercises[];
};
