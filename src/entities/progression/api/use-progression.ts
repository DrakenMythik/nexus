import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '@/shared/api';

import {
  getExerciseProgressions,
  progressionQueryKeys,
  upsertExerciseProgression,
} from './progression-queries';

export function useExerciseProgressionsQuery(userId: string | null) {
  const client = useSupabase();

  return useQuery({
    queryKey: progressionQueryKeys.byUser(userId ?? 'anonymous'),
    queryFn: () => getExerciseProgressions(client, userId ?? ''),
    enabled: Boolean(userId),
  });
}

export function useUpsertExerciseProgressionMutation(userId: string | null) {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      exerciseId: string;
      targetWeight: number;
      incrementWeight?: number;
    }) => {
      if (!userId) {
        throw new Error('User is required to update progression.');
      }
      return upsertExerciseProgression(client, { ...input, userId });
    },
    onSuccess: (progression) => {
      void queryClient.invalidateQueries({
        queryKey: progressionQueryKeys.byUser(progression.user_id),
      });
    },
  });
}
