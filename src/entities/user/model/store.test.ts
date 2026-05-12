import type { Session } from '@supabase/supabase-js';
import { beforeEach, describe, expect, it } from 'vitest';

import { asUserId } from './types';
import { useUserStore } from './store';

const testUserId = '11111111-1111-4111-8111-111111111111';

function mockSession(userId: string): Session {
  return {
    access_token: 'test-access',
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    refresh_token: 'test-refresh',
    user: {
      id: userId,
      aud: 'authenticated',
      role: 'authenticated',
      email: 'test@example.com',
      app_metadata: {},
      user_metadata: {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      identities: [],
      factors: null
    }
  } as unknown as Session;
}

describe('useUserStore', () => {
  beforeEach(() => {
    useUserStore.setState({
      session: null,
      userId: null,
      profile: null,
      authHydrated: false
    });
  });

  it('setSession maps user id and preserves profile when session is set', () => {
    useUserStore.getState().setProfile({
      id: asUserId(testUserId),
      display_name: 'Test',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    const session = mockSession(testUserId);
    useUserStore.getState().setSession(session);

    const state = useUserStore.getState();
    expect(state.session).toBe(session);
    expect(state.userId).toBe(asUserId(testUserId));
    expect(state.profile).not.toBeNull();
  });

  it('setSession(null) clears profile', () => {
    useUserStore.getState().setProfile({
      id: asUserId(testUserId),
      display_name: 'Test',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    useUserStore.getState().setSession(mockSession(testUserId));

    useUserStore.getState().setSession(null);

    const state = useUserStore.getState();
    expect(state.session).toBeNull();
    expect(state.userId).toBeNull();
    expect(state.profile).toBeNull();
  });

  it('markAuthReady sets authHydrated and is idempotent', () => {
    expect(useUserStore.getState().authHydrated).toBe(false);

    useUserStore.getState().markAuthReady();
    expect(useUserStore.getState().authHydrated).toBe(true);

    useUserStore.getState().markAuthReady();
    expect(useUserStore.getState().authHydrated).toBe(true);
  });

  it('clearUser resets session, userId, and profile', () => {
    useUserStore.getState().setSession(mockSession(testUserId));
    useUserStore.getState().setProfile({
      id: asUserId(testUserId),
      display_name: 'Test',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    useUserStore.getState().clearUser();

    const state = useUserStore.getState();
    expect(state.session).toBeNull();
    expect(state.userId).toBeNull();
    expect(state.profile).toBeNull();
  });

  it('clearUser does not reset authHydrated', () => {
    useUserStore.getState().markAuthReady();
    useUserStore.getState().setSession(mockSession(testUserId));

    useUserStore.getState().clearUser();

    expect(useUserStore.getState().authHydrated).toBe(true);
  });
});
