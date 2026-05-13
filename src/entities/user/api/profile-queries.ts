import type { NexusSupabaseClient } from '@/shared/api';

import type { Profile, UserId } from '../model/types';

export const profileQueryKeys = {
  all: ['profile'] as const,
  byUserId: (userId: string) => ['profile', userId] as const,
};

/**
 * Loads the signed-in user's profile row (RLS restricts to own row).
 */
export async function fetchProfile(
  client: NexusSupabaseClient,
  userId: UserId,
): Promise<Profile | null> {
  const { data, error } = await client
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
}

export interface UpsertProfileInput {
  display_name?: string | null;
}

/**
 * Creates or updates the current user's profile row (`id` must match `auth.uid()` per RLS).
 */
export async function upsertProfile(
  client: NexusSupabaseClient,
  input: UpsertProfileInput,
): Promise<Profile> {
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError) {
    throw userError;
  }
  if (!user?.id) {
    throw new Error('Cannot upsert profile without an authenticated user.');
  }

  const now = new Date().toISOString();

  const { data, error } = await client
    .from('profiles')
    .upsert(
      {
        id: user.id,
        display_name: input.display_name ?? null,
        updated_at: now,
      },
      { onConflict: 'id' },
    )
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
