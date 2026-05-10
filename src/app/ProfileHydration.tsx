import { useEffect } from 'react';

import { useProfileQuery, useUserStore } from '@/entities/user';

/**
 * Mirrors React Query profile data into the user store for offline-friendly snapshots.
 */
export function ProfileHydration() {
  const { data } = useProfileQuery();
  const setProfile = useUserStore((s) => s.setProfile);

  useEffect(() => {
    setProfile(data ?? null);
  }, [data, setProfile]);

  return null;
}
