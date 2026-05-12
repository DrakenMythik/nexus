import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import { asUserId, type UserId } from './types';

export interface UserStoreState {
  session: Session | null;
  userId: UserId | null;
  /** True after the first Supabase session resolution (getSession or auth listener). */
  authHydrated: boolean;
  setSession: (session: Session | null) => void;
  clearUser: () => void;
  markAuthReady: () => void;
}

export const useUserStore = create<UserStoreState>((set) => ({
  session: null,
  userId: null,
  authHydrated: false,
  setSession: (session) =>
    set({
      session,
      userId: session?.user?.id ? asUserId(session.user.id) : null,
    }),
  clearUser: () =>
    set({
      session: null,
      userId: null,
    }),
  markAuthReady: () =>
    set((state) => (state.authHydrated ? state : { ...state, authHydrated: true })),
}));
