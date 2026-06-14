import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '@/shared/api';

import {
  adherenceQueryKeys,
  getRecentAdherenceEvents,
  upsertAdherenceEvent,
} from './adherence-queries';
import type { DailyStatus, SmartRestCommitment } from '../model/types';

export function useRecentAdherenceQuery(userId: string | null, days = 28) {
  const client = useSupabase();

  return useQuery({
    queryKey: adherenceQueryKeys.recent(userId ?? 'anonymous', days),
    queryFn: () => getRecentAdherenceEvents(client, userId ?? '', days),
    enabled: Boolean(userId),
  });
}

export function useUpsertAdherenceEventMutation(userId: string | null) {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      eventDate: string;
      status: DailyStatus;
      source: string;
      smartRestCommitment?: SmartRestCommitment | null;
      workoutLogId?: string | null;
      notes?: string | null;
    }) => {
      if (!userId) {
        throw new Error('User is required to update adherence.');
      }
      return upsertAdherenceEvent(client, { ...input, userId });
    },
    onSuccess: (event) => {
      queryClient.setQueryData(
        adherenceQueryKeys.day(event.user_id, event.event_date),
        event,
      );
      void queryClient.invalidateQueries({ queryKey: adherenceQueryKeys.all });
    },
  });
}
