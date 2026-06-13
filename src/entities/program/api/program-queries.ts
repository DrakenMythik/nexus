import type { NexusSupabaseClient } from '@/shared/api';

import type {
  Exercise,
  Program,
  ProgramWithWorkouts,
  Workout,
  WorkoutExercise,
  WorkoutExerciseWithDetails,
  WorkoutWithExercises,
} from '../model/types';

export const programQueryKeys = {
  all: ['program'] as const,
  published: ['program', 'published'] as const,
  withWorkouts: (programId: string) =>
    ['program', programId, 'with-workouts'] as const,
};

/**
 * Loads the program catalog. RLS restricts visibility for authenticated users.
 */
export async function getPublishedPrograms(
  client: NexusSupabaseClient,
): Promise<Program[]> {
  const { data, error } = await client
    .from('programs')
    .select('*')
    .order('name');

  if (error) {
    throw error;
  }

  return data ?? [];
}

type WorkoutExerciseRow = WorkoutExercise & {
  exercises: Exercise;
};

type WorkoutRow = Workout & {
  workout_exercises: WorkoutExerciseRow[];
};

type ProgramWithWorkoutsRow = Program & {
  workouts: WorkoutRow[];
};

const byWeekThenDay = (a: Workout, b: Workout) =>
  a.week_number - b.week_number || a.day_number - b.day_number;

const byOrderIndex = (a: WorkoutExercise, b: WorkoutExercise) =>
  a.order_index - b.order_index;

function mapWorkoutExercise(row: WorkoutExerciseRow): WorkoutExerciseWithDetails {
  const { exercises, ...workoutExercise } = row;
  return { ...workoutExercise, exercise: exercises };
}

function mapWorkout(row: WorkoutRow): WorkoutWithExercises {
  const { workout_exercises, ...workout } = row;
  return {
    ...workout,
    exercises: [...(workout_exercises ?? [])]
      .sort(byOrderIndex)
      .map(mapWorkoutExercise),
  };
}

/**
 * Loads a single program with workouts and nested exercise prescriptions in one
 * round-trip. Workouts and prescriptions are sorted client-side.
 * Returns `null` when the program is not found or not visible.
 */
export async function getProgramWithWorkouts(
  client: NexusSupabaseClient,
  programId: string,
): Promise<ProgramWithWorkouts | null> {
  const { data, error } = await client
    .from('programs')
    .select('*, workouts(*, workout_exercises(*, exercises(*)))')
    .eq('id', programId)
    .maybeSingle<ProgramWithWorkoutsRow>();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const { workouts, ...program } = data;
  const sortedWorkouts = [...(workouts ?? [])].sort(byWeekThenDay).map(mapWorkout);

  return { ...program, workouts: sortedWorkouts };
}
