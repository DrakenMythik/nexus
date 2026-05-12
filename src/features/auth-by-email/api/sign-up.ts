import type { NexusSupabaseClient } from '@/shared/api';

import type { AuthEmailResult, EmailPasswordCredentials } from '../model/types';

export async function signUpWithEmail(
  client: NexusSupabaseClient,
  credentials: EmailPasswordCredentials,
): Promise<AuthEmailResult> {
  const { email, password } = credentials;
  const { data, error } = await client.auth.signUp({ email, password });

  if (error) {
    if (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch')
    ) {
      return {
        ok: false,
        code: 'network',
        message: 'Network error. Check your connection and try again.',
      };
    }
    return { ok: false, code: 'unknown', message: error.message };
  }

  return { ok: true, session: data.session ?? null };
}
