import type { NexusSupabaseClient } from '@/shared/api';

import type { KnowledgeNudge, UserNudgeHistory } from '../model/types';

export const knowledgeNudgeQueryKeys = {
  all: ['knowledge-nudge'] as const,
  catalog: ['knowledge-nudge', 'catalog'] as const,
  history: (userId: string) => ['knowledge-nudge', userId, 'history'] as const,
};

export async function getKnowledgeNudges(
  client: NexusSupabaseClient,
): Promise<KnowledgeNudge[]> {
  const { data, error } = await client
    .from('knowledge_nudges')
    .select('*')
    .order('category')
    .order('title');

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function getUserNudgeHistory(
  client: NexusSupabaseClient,
  userId: string,
): Promise<UserNudgeHistory[]> {
  const { data, error } = await client
    .from('user_nudge_history')
    .select('*')
    .eq('user_id', userId)
    .order('seen_at', { ascending: false });

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function recordNudgeSeen(
  client: NexusSupabaseClient,
  userId: string,
  nudgeId: string,
): Promise<UserNudgeHistory> {
  const { data, error } = await client
    .from('user_nudge_history')
    .upsert(
      { user_id: userId, nudge_id: nudgeId, seen_at: new Date().toISOString() },
      { onConflict: 'user_id,nudge_id' },
    )
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}
