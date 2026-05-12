import type { Session } from '@supabase/supabase-js';
import { create } from 'zustand';

import { asUserId, type Profile, type UserId } from './types';

export interface UserStoreState {
  session: Session | null;
  userId: UserId | null;
  /** Denormalized snapshot for offline-friendly reads; server truth via React Query. */
  profile: Profile | null;
  /** True after the first Supabase session resolution (getSession or auth listener). */
  authHydrated: boolean;
  setSession: (session: Session | null) => void;
  clearUser: () => void;
  setProfile: (profile: Profile | null) => void;
  markAuthReady: () => void;
}

export const useUserStore = create<UserStoreState>((set) => ({
  session: null,
  userId: null,
  profile: null,
  authHydrated: false,
  setSession: (session) =>
    set({
      session,
      userId: session?.user?.id ? asUserId(session.user.id) : null,
      ...(session ? {} : { profile: null }),
    }),
  clearUser: () =>
    set({
      session: null,
      userId: null,
      profile: null,
    }),
  setProfile: (profile) => set({ profile }),
  markAuthReady: () =>
    set((state) => (state.authHydrated ? state : { ...state, authHydrated: true })),
}));
