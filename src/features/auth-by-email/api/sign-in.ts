import type { NexusSupabaseClient } from '@/shared/api';

import type { AuthEmailResult, EmailPasswordCredentials } from '../model/types';

function mapSignInError(message: string): AuthEmailResult {
  const lower = message.toLowerCase();
  if (
    lower.includes('invalid login credentials') ||
    lower.includes('invalid email or password')
  ) {
    return {
      ok: false,
      code: 'invalid_credentials',
      message: 'Invalid email or password.',
    };
  }
  return { ok: false, code: 'unknown', message };
}

export async function signInWithEmail(
  client: NexusSupabaseClient,
  credentials: EmailPasswordCredentials,
): Promise<AuthEmailResult> {
  const { email, password } = credentials;
  const { error } = await client.auth.signInWithPassword({ email, password });

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
    return mapSignInError(error.message);
  }

  return { ok: true };
}
