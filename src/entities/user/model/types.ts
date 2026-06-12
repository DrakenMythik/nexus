import type { Database } from '@/shared/api';

/** Matches `public.users` Row shape. */
export type AppUser = Database['public']['Tables']['users']['Row'];

export type UserSex = Database['public']['Enums']['user_sex'];

/** Nominal typing for user identifiers (`auth.users.id` / `users.id`). */
export type UserId = string & { readonly __brand: 'UserId' };

export function asUserId(id: string): UserId {
  return id as UserId;
}

/** Preferred greeting: `display_name`, then email local-part. */
export function appUserGreetingName(user: AppUser | null | undefined): string | null {
  const displayName = user?.display_name?.trim();
  if (displayName) {
    return displayName;
  }
  const local = user?.email?.split('@')[0]?.trim();
  return local || null;
}

export function isAppUserOnboardingComplete(user: AppUser | null | undefined): boolean {
  return Boolean(user?.display_name?.trim() && user?.birthdate && user?.sex);
}
