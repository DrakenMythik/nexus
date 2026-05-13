import type { NexusSupabaseClient } from '@/shared/api';

export async function signOut(client: NexusSupabaseClient): Promise<void> {
  const { error } = await client.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
}
