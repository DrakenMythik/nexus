import { useQuery } from '@tanstack/react-query';

import { useSupabase } from '@/shared/api';

import { appUserQueryKeys, fetchAppUser } from './app-user-queries';
import { useUserStore } from '../model/store';

const APP_USER_STALE_MS = 60_000;

export function useAppUserQuery() {
  const supabase = useSupabase();
  const userId = useUserStore((s) => s.userId);

  return useQuery({
    queryKey: appUserQueryKeys.byUserId(userId ?? ''),
    queryFn: async () => {
      if (!userId) {
        return null;
      }
      return fetchAppUser(supabase, userId);
    },
    enabled: Boolean(userId),
    staleTime: APP_USER_STALE_MS,
  });
}
