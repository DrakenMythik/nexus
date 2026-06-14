import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '@/shared/api';

import {
  getKnowledgeNudges,
  getUserNudgeHistory,
  knowledgeNudgeQueryKeys,
  recordNudgeSeen,
} from './knowledge-nudge-queries';

export function useKnowledgeNudgesQuery() {
  const client = useSupabase();

  return useQuery({
    queryKey: knowledgeNudgeQueryKeys.catalog,
    queryFn: () => getKnowledgeNudges(client),
  });
}

export function useUserNudgeHistoryQuery(userId: string | null) {
  const client = useSupabase();

  return useQuery({
    queryKey: knowledgeNudgeQueryKeys.history(userId ?? 'anonymous'),
    queryFn: () => getUserNudgeHistory(client, userId ?? ''),
    enabled: Boolean(userId),
  });
}

export function useRecordNudgeSeenMutation(userId: string | null) {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (nudgeId: string) => {
      if (!userId) {
        throw new Error('User is required to record nudge history.');
      }
      return recordNudgeSeen(client, userId, nudgeId);
    },
    onSuccess: (history) => {
      void queryClient.invalidateQueries({
        queryKey: knowledgeNudgeQueryKeys.history(history.user_id ?? 'anonymous'),
      });
    },
  });
}
