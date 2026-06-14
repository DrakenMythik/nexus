import type { ProgressionEvaluationInput } from './types';

export const DEFAULT_INCREMENT_WEIGHT = 2.5;

export function evaluateNextTargetWeight({
  targetWeight,
  incrementWeight,
  prescribedSets,
  targetReps,
  completedSets,
}: ProgressionEvaluationInput): number {
  const qualifyingSets = completedSets.filter(
    (set) => set.weight >= targetWeight && set.repsCompleted >= targetReps,
  );

  if (qualifyingSets.length >= prescribedSets) {
    return targetWeight + incrementWeight;
  }

  return targetWeight;
}
