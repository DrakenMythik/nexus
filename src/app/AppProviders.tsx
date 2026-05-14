import {
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { useMemo, useState, type ReactNode } from 'react';

import {
  createSupabaseBrowserClient,
  SupabaseClientProvider,
} from '@/shared/api';
import { Toaster } from '@/shared/ui';

import { AuthStateBridge } from './AuthStateBridge';
import { buildPersistQueryOptions, getQueryPersister } from './query-persist';

export function AppProviders({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60_000,
            retry: (failureCount) => failureCount < 3,
          },
        },
      }),
  );

  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const persister = useMemo(() => getQueryPersister(), []);

  const persistOptions = useMemo(
    () => (persister ? buildPersistQueryOptions() : null),
    [persister],
  );

  const inner = (
    <SupabaseClientProvider client={supabase}>
      <AuthStateBridge />
      {children}
      <Toaster richColors closeButton position="top-right" />
    </SupabaseClientProvider>
  );

  if (persister && persistOptions) {
    return (
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={persistOptions}
      >
        {inner}
      </PersistQueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>{inner}</QueryClientProvider>
  );
}
