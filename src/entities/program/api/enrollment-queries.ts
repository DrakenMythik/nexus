import type { NexusSupabaseClient } from '@/shared/api';

import type { Enrollment } from '../model/types';

export const enrollmentQueryKeys = {
  all: ['enrollment'] as const,
  active: (userId: string) => ['enrollment', userId, 'active'] as const,
};

/**
 * Loads the user's single active enrollment, or `null` when none is active.
 */
export async function getActiveEnrollment(
  client: NexusSupabaseClient,
  userId: string,
): Promise<Enrollment | null> {
  const { data, error } = await client
    .from('user_program_enrollments')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data ?? null;
}

/**
 * Activates an enrollment in `programId` for `userId`, deactivating any prior
 * active enrollment first so exactly one active row remains. The DB unique
 * partial index `user_program_enrollments_one_active_per_user` is the backstop.
 *
 * `userId` is passed explicitly: per FSD, `entities/program` must not import
 * `entities/user`. Errors propagate (no half-applied state is swallowed).
 */
export async function enrollInProgram(
  client: NexusSupabaseClient,
  userId: string,
  programId: string,
): Promise<Enrollment> {
  const { error: deactivateError } = await client
    .from('user_program_enrollments')
    .update({ is_active: false })
    .eq('user_id', userId)
    .eq('is_active', true);

  if (deactivateError) {
    throw deactivateError;
  }

  const { data, error } = await client
    .from('user_program_enrollments')
    .insert({ user_id: userId, program_id: programId, is_active: true })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
