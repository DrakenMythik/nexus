import type { NexusSupabaseClient } from '@/shared/api';

/**
 * Redirect URL must be listed under Supabase Dashboard → Authentication → URL Configuration.
 */
export function defaultAppleOAuthRedirectTo(): string {
  return new URL('/auth/callback', window.location.origin).href;
}

export async function signInWithApple(
  client: NexusSupabaseClient,
  options?: { redirectTo?: string },
): Promise<{ errorMessage: string | null }> {
  const redirectTo = options?.redirectTo ?? defaultAppleOAuthRedirectTo();
  const { error } = await client.auth.signInWithOAuth({
    provider: 'apple',
    options: { redirectTo },
  });

  if (error) {
    return { errorMessage: error.message };
  }

  return { errorMessage: null };
}
