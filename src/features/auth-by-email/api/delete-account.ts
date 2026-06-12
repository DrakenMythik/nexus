import type { NexusSupabaseClient } from '@/shared/api';

import { signOut } from './sign-out';

export interface DeleteAccountResult {
  /** App user row removed when RLS allows; auth.users removal requires service role. */
  userRowRemoved: boolean;
  signedOut: boolean;
}

/**
 * Signs out and deletes the current user's `public.users` row when permitted by RLS.
 * Removing the Supabase Auth user record requires a server-side admin flow (Edge Function or dashboard).
 */
export async function deleteAccount(
  client: NexusSupabaseClient,
): Promise<DeleteAccountResult> {
  const {
    data: { user },
  } = await client.auth.getUser();

  let userRowRemoved = false;

  if (user) {
    const { error } = await client.from('users').delete().eq('id', user.id);
    if (!error) {
      userRowRemoved = true;
    }
  }

  await signOut(client);

  return { userRowRemoved, signedOut: true };
}
