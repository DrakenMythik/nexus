import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useMemo, useState, type ReactNode } from 'react';

import {
  createSupabaseBrowserClient,
  SupabaseClientProvider,
} from '@/shared/api';

import { AuthStateBridge } from './AuthStateBridge';
import { ProfileHydration } from './ProfileHydration';

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

  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseClientProvider client={supabase}>
        <AuthStateBridge />
        <ProfileHydration />
        {children}
      </SupabaseClientProvider>
    </QueryClientProvider>
  );
}
