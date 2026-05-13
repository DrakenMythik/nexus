import type { NexusSupabaseClient } from '@/shared/api';

/**
 * Redirect URL must be listed under Supabase Dashboard → Authentication → URL Configuration
 * (redirect URLs for local dev and production).
 */
export function defaultGoogleOAuthRedirectTo(): string {
  return new URL('/auth/callback', window.location.origin).href;
}

export async function signInWithGoogle(
  client: NexusSupabaseClient,
  options?: { redirectTo?: string },
): Promise<{ errorMessage: string | null }> {
  const redirectTo = options?.redirectTo ?? defaultGoogleOAuthRedirectTo();
  const { error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  });

  if (error) {
    return { errorMessage: error.message };
  }

  return { errorMessage: null };
}
