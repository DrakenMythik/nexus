import { createContext, useContext, type ReactNode } from 'react';

import type { NexusSupabaseClient } from './supabase-client';

const SupabaseClientContext = createContext<NexusSupabaseClient | null>(null);

export interface SupabaseClientProviderProps {
  client: NexusSupabaseClient;
  children: ReactNode;
}

export function SupabaseClientProvider({
  client,
  children,
}: SupabaseClientProviderProps) {
  return (
    <SupabaseClientContext.Provider value={client}>
      {children}
    </SupabaseClientContext.Provider>
  );
}

export function useSupabase(): NexusSupabaseClient {
  const client = useContext(SupabaseClientContext);
  if (!client) {
    throw new Error('useSupabase must be used within SupabaseClientProvider');
  }
  return client;
}
