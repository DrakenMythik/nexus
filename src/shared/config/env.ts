export interface SupabaseEnv {
  url: string;
  anonKey: string;
}

/**
 * Reads Supabase browser credentials from Vite env.
 * Throws with a clear message when required variables are missing (e.g. forgot `.env`).
 */
export function getSupabaseEnv(): SupabaseEnv {
  const url = import.meta.env.VITE_SUPABASE_URL?.trim();
  const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

  if (!url) {
    throw new Error(
      'Missing VITE_SUPABASE_URL. Copy .env.example to .env and set your Supabase project URL.',
    );
  }
  if (!anonKey) {
    throw new Error(
      'Missing VITE_SUPABASE_ANON_KEY. Copy .env.example to .env and set your Supabase anon key.',
    );
  }

  return { url, anonKey };
}
