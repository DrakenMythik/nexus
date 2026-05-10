import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { profileQueryKeys, useUserStore } from '@/entities/user';
import { useSupabase } from '@/shared/api';

/**
 * Keeps Zustand session state and React Query profile cache aligned with Supabase Auth.
 */
export function AuthStateBridge() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        useUserStore.getState().clearUser();
        queryClient.removeQueries({ queryKey: profileQueryKeys.all });
        return;
      }

      useUserStore.getState().setSession(session);
      void queryClient.invalidateQueries({
        queryKey: profileQueryKeys.byUserId(session.user.id),
      });
    });

    void supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        useUserStore.getState().clearUser();
      } else {
        useUserStore.getState().setSession(session);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, queryClient]);

  return null;
}
