/** Supabase email links must redirect to an allow-listed `/auth/callback` URL. */
export function authCallbackRedirectUrl(): string {
  if (typeof window === 'undefined') {
    return '/auth/callback';
  }
  return `${window.location.origin}/auth/callback`;
}
