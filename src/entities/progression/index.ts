export {
  getExerciseProgressions,
  progressionQueryKeys,
  upsertExerciseProgression,
} from './api/progression-queries';
export {
  useExerciseProgressionsQuery,
  useUpsertExerciseProgressionMutation,
} from './api/use-progression';
export {
  DEFAULT_INCREMENT_WEIGHT,
  evaluateNextTargetWeight,
} from './model/progression';
export type {
  ExerciseProgression,
  ProgressionEvaluationInput,
} from './model/types';
