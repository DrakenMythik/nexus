import type { Database } from '@/shared/api';

export type ExerciseProgression =
  Database['public']['Tables']['exercise_progressions']['Row'];

export interface ProgressionEvaluationInput {
  targetWeight: number;
  incrementWeight: number;
  prescribedSets: number;
  targetReps: number;
  completedSets: Array<{ repsCompleted: number; weight: number }>;
}
