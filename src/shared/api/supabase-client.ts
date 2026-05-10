import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { getSupabaseEnv } from '../config/env';

import type { Database } from './database.types';

export type NexusSupabaseClient = SupabaseClient<Database>;

/**
 * Browser Supabase client — env validation only; no auth helpers here (see FSD rules).
 */
export function createSupabaseBrowserClient(): NexusSupabaseClient {
  const { url, anonKey } = getSupabaseEnv();
  return createClient<Database>(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}
