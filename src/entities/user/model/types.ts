import type { Database } from '@/shared/api';

/** Matches `public.profiles` Row shape. */
export type Profile = Database['public']['Tables']['profiles']['Row'];

/** Nominal typing for user identifiers (`auth.users.id` / `profiles.id`). */
export type UserId = string & { readonly __brand: 'UserId' };

export function asUserId(id: string): UserId {
  return id as UserId;
}
