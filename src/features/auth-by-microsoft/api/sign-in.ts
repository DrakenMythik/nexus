import type { NexusSupabaseClient } from '@/shared/api';

/**
 * Supabase uses provider id `azure` for Microsoft (Azure AD).
 * Redirect URL must be listed under Supabase Dashboard → Authentication → URL Configuration.
 */
export function defaultMicrosoftOAuthRedirectTo(): string {
  return new URL('/auth/callback', window.location.origin).href;
}

export async function signInWithMicrosoft(
  client: NexusSupabaseClient,
  options?: { redirectTo?: string },
): Promise<{ errorMessage: string | null }> {
  const redirectTo = options?.redirectTo ?? defaultMicrosoftOAuthRedirectTo();
  const { error } = await client.auth.signInWithOAuth({
    provider: 'azure',
    options: { redirectTo },
  });

  if (error) {
    return { errorMessage: error.message };
  }

  return { errorMessage: null };
}
