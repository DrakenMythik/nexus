import type { NexusSupabaseClient } from '@/shared/api';

import { signOut } from './sign-out';

export interface DeleteAccountResult {
  /** App profile row removed when RLS allows; auth.users removal requires service role. */
  profileRemoved: boolean;
  signedOut: boolean;
}

/**
 * Signs out and deletes the current user's `public.profiles` row when permitted by RLS.
 * Removing the Supabase Auth user record requires a server-side admin flow (Edge Function or dashboard).
 */
export async function deleteAccount(
  client: NexusSupabaseClient,
): Promise<DeleteAccountResult> {
  const {
    data: { user },
  } = await client.auth.getUser();

  let profileRemoved = false;

  if (user) {
    const { error } = await client.from('profiles').delete().eq('id', user.id);
    if (!error) {
      profileRemoved = true;
    }
  }

  await signOut(client);

  return { profileRemoved, signedOut: true };
}
