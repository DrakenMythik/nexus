import { useQuery } from '@tanstack/react-query';

import { useSupabase } from '@/shared/api';

import { fetchProfile, profileQueryKeys } from './profile-queries';
import { useUserStore } from '../model/store';

const PROFILE_STALE_MS = 60_000;

export function useProfileQuery() {
  const supabase = useSupabase();
  const userId = useUserStore((s) => s.userId);

  return useQuery({
    queryKey: profileQueryKeys.byUserId(userId ?? ''),
    queryFn: async () => {
      if (!userId) {
        return null;
      }
      return fetchProfile(supabase, userId);
    },
    enabled: Boolean(userId),
    staleTime: PROFILE_STALE_MS,
  });
}
