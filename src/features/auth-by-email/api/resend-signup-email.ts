import type { NexusSupabaseClient } from '@/shared/api';

import { authCallbackRedirectUrl } from '../lib/auth-callback-redirect-url';

export type ResendSignupEmailResult =
  | { ok: true }
  | { ok: false; message: string };

export async function resendSignupEmail(
  client: NexusSupabaseClient,
  email: string,
): Promise<ResendSignupEmailResult> {
  const trimmed = email.trim();
  if (!trimmed) {
    return {
      ok: false,
      message: 'Email is required to resend the confirmation link.',
    };
  }

  const { error } = await client.auth.resend({
    type: 'signup',
    email: trimmed,
    options: { emailRedirectTo: authCallbackRedirectUrl() },
  });

  if (error) {
    if (
      error.message.includes('fetch') ||
      error.message.includes('network') ||
      error.message.includes('Failed to fetch')
    ) {
      return {
        ok: false,
        message: 'Network error. Check your connection and try again.',
      };
    }
    return { ok: false, message: error.message };
  }

  return { ok: true };
}
