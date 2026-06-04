import { describe, expect, it, vi } from 'vitest';

import type { NexusSupabaseClient } from '@/shared/api';

import {
  enrollInProgram,
  enrollmentQueryKeys,
  getActiveEnrollment,
} from './enrollment-queries';

const userId = 'user-1';
const newEnrollment = {
  id: 'e2',
  user_id: userId,
  program_id: 'p1',
  is_active: true,
  started_at: '2026-06-03T00:00:00Z',
  created_at: '2026-06-03T00:00:00Z',
};

describe('getActiveEnrollment', () => {
  function client(data: unknown, error: unknown = null) {
    const maybeSingle = vi.fn().mockResolvedValue({ data, error });
    const eq2 = vi.fn().mockReturnValue({ maybeSingle });
    const eq1 = vi.fn().mockReturnValue({ eq: eq2 });
    const select = vi.fn().mockReturnValue({ eq: eq1 });
    return {
      api: { from: () => ({ select }) } as unknown as NexusSupabaseClient,
      eq1,
      eq2,
    };
  }

  it('returns the active enrollment row', async () => {
    const { api, eq1, eq2 } = client(newEnrollment);
    const result = await getActiveEnrollment(api, userId);

    expect(eq1).toHaveBeenCalledWith('user_id', userId);
    expect(eq2).toHaveBeenCalledWith('is_active', true);
    expect(result).toEqual(newEnrollment);
  });

  it('returns null when no active enrollment', async () => {
    const { api } = client(null);
    await expect(getActiveEnrollment(api, userId)).resolves.toBeNull();
  });

  it('throws on error', async () => {
    const { api } = client(null, new Error('boom'));
    await expect(getActiveEnrollment(api, userId)).rejects.toThrow('boom');
  });
});

describe('enrollInProgram', () => {
  function makeClient(opts: {
    deactivateError?: unknown;
    insertResult?: { data: unknown; error: unknown };
  }) {
    const calls: string[] = [];

    const deactivateEq2 = vi
      .fn()
      .mockResolvedValue({ error: opts.deactivateError ?? null });
    const deactivateEq1 = vi.fn().mockReturnValue({ eq: deactivateEq2 });
    const update = vi.fn((payload: { is_active: boolean }) => {
      calls.push('update');
      expect(payload).toEqual({ is_active: false });
      return { eq: deactivateEq1 };
    });

    const single = vi
      .fn()
      .mockResolvedValue(
        opts.insertResult ?? { data: newEnrollment, error: null },
      );
    const insertSelect = vi.fn().mockReturnValue({ single });
    const insert = vi.fn(() => {
      calls.push('insert');
      return { select: insertSelect };
    });

    const api = {
      from: () => ({ update, insert }),
    } as unknown as NexusSupabaseClient;

    return { api, calls, update, insert, deactivateEq1, deactivateEq2 };
  }

  it('deactivates the prior active enrollment before inserting the new one', async () => {
    const { api, calls, insert, deactivateEq1, deactivateEq2 } = makeClient({});

    const result = await enrollInProgram(api, userId, 'p1');

    expect(calls).toEqual(['update', 'insert']);
    expect(deactivateEq1).toHaveBeenCalledWith('user_id', userId);
    expect(deactivateEq2).toHaveBeenCalledWith('is_active', true);
    expect(insert).toHaveBeenCalledWith({
      user_id: userId,
      program_id: 'p1',
      is_active: true,
    });
    expect(result).toEqual(newEnrollment);
  });

  it('propagates an insert error after deactivating', async () => {
    const { api, calls } = makeClient({
      insertResult: { data: null, error: new Error('conflict') },
    });

    await expect(enrollInProgram(api, userId, 'p1')).rejects.toThrow(
      'conflict',
    );
    expect(calls).toEqual(['update', 'insert']);
  });

  it('short-circuits before insert when deactivate fails', async () => {
    const { api, calls } = makeClient({
      deactivateError: new Error('deactivate failed'),
    });

    await expect(enrollInProgram(api, userId, 'p1')).rejects.toThrow(
      'deactivate failed',
    );
    expect(calls).toEqual(['update']);
  });
});

describe('enrollmentQueryKeys', () => {
  it('produces stable, serializable keys', () => {
    expect(enrollmentQueryKeys.active(userId)).toEqual([
      'enrollment',
      userId,
      'active',
    ]);
    expect(JSON.stringify(enrollmentQueryKeys.all)).toBe('["enrollment"]');
  });
});
