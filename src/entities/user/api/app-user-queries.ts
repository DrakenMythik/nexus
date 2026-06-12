import type { NexusSupabaseClient } from '@/shared/api';

import type { AppUser, UserId, UserSex } from '../model/types';

export const appUserQueryKeys = {
  all: ['appUser'] as const,
  byUserId: (userId: string) => ['appUser', userId] as const,
};

/**
 * Loads the signed-in user's row from `public.users` (RLS restricts to own row).
 */
export async function fetchAppUser(
  client: NexusSupabaseClient,
  userId: UserId,
): Promise<AppUser | null> {
  const { data, error } = await client
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
}

export interface UpdateAppUserInput {
  display_name?: string | null;
  sex?: UserSex | null;
  birthdate?: string | null;
}

/**
 * Updates the current user's row in `public.users` (trigger creates id/email on sign-up).
 */
export async function updateAppUser(
  client: NexusSupabaseClient,
  input: UpdateAppUserInput,
): Promise<AppUser> {
  const {
    data: { user },
    error: userError,
  } = await client.auth.getUser();

  if (userError) {
    throw userError;
  }
  if (!user?.id) {
    throw new Error('Cannot update user without an authenticated session.');
  }

  const { data, error } = await client
    .from('users')
    .update({
      ...(input.display_name !== undefined
        ? { display_name: input.display_name?.trim() || null }
        : {}),
      ...(input.sex !== undefined ? { sex: input.sex } : {}),
      ...(input.birthdate !== undefined ? { birthdate: input.birthdate } : {}),
    })
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
