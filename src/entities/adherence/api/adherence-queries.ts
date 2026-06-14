import type { NexusSupabaseClient } from '@/shared/api';

import type { AdherenceEvent, DailyStatus, SmartRestCommitment } from '../model/types';

export const adherenceQueryKeys = {
  all: ['adherence'] as const,
  recent: (userId: string, days: number) => ['adherence', userId, 'recent', days] as const,
  day: (userId: string, eventDate: string) => ['adherence', userId, eventDate] as const,
};

export async function getRecentAdherenceEvents(
  client: NexusSupabaseClient,
  userId: string,
  limit = 28,
): Promise<AdherenceEvent[]> {
  const { data, error } = await client
    .from('adherence_events')
    .select('*')
    .eq('user_id', userId)
    .order('event_date', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function upsertAdherenceEvent(
  client: NexusSupabaseClient,
  input: {
    userId: string;
    eventDate: string;
    status: DailyStatus;
    source: string;
    smartRestCommitment?: SmartRestCommitment | null;
    workoutLogId?: string | null;
    notes?: string | null;
  },
): Promise<AdherenceEvent> {
  const { data, error } = await client
    .from('adherence_events')
    .upsert(
      {
        user_id: input.userId,
        event_date: input.eventDate,
        status: input.status,
        source: input.source,
        smart_rest_commitment: input.smartRestCommitment ?? null,
        workout_log_id: input.workoutLogId ?? null,
        notes: input.notes ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,event_date' },
    )
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}
