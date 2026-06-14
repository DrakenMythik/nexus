import type { NexusSupabaseClient } from '@/shared/api';

import { DEFAULT_INCREMENT_WEIGHT } from '../model/progression';
import type { ExerciseProgression } from '../model/types';

export const progressionQueryKeys = {
  all: ['progression'] as const,
  byUser: (userId: string) => ['progression', userId] as const,
};

export async function getExerciseProgressions(
  client: NexusSupabaseClient,
  userId: string,
): Promise<ExerciseProgression[]> {
  const { data, error } = await client
    .from('exercise_progressions')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function upsertExerciseProgression(
  client: NexusSupabaseClient,
  input: {
    userId: string;
    exerciseId: string;
    targetWeight: number;
    incrementWeight?: number;
  },
): Promise<ExerciseProgression> {
  const { data, error } = await client
    .from('exercise_progressions')
    .upsert(
      {
        user_id: input.userId,
        exercise_id: input.exerciseId,
        target_weight: input.targetWeight,
        increment_weight: input.incrementWeight ?? DEFAULT_INCREMENT_WEIGHT,
        last_completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,exercise_id' },
    )
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}
