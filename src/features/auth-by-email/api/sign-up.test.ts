import type { Session } from '@supabase/supabase-js';
import { describe, expect, it, vi } from 'vitest';

import type { NexusSupabaseClient } from '@/shared/api';

import { signUpWithEmail } from './sign-up';

describe('signUpWithEmail', () => {
  it('returns session when Supabase returns one', async () => {
    const fakeSession = { access_token: 'x' } as unknown as Session;
    const signUp = vi.fn().mockResolvedValue({
      data: { session: fakeSession, user: { id: 'u1' } },
      error: null,
    });
    const client = {
      auth: { signUp },
    } as unknown as NexusSupabaseClient;

    const result = await signUpWithEmail(client, {
      email: 'a@b.co',
      password: 'secret12',
    });

    expect(result).toEqual({ ok: true, session: fakeSession });
  });

  it('returns null session when confirmation is pending', async () => {
    const signUp = vi.fn().mockResolvedValue({
      data: { session: null, user: { id: 'u1' } },
      error: null,
    });
    const client = {
      auth: { signUp },
    } as unknown as NexusSupabaseClient;

    const result = await signUpWithEmail(client, {
      email: 'a@b.co',
      password: 'secret12',
    });

    expect(result).toEqual({ ok: true, session: null });
  });
});
