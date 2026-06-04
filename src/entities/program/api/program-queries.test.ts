import { describe, expect, it, vi } from 'vitest';

import type { NexusSupabaseClient } from '@/shared/api';

import {
  getProgramWithDays,
  getPublishedPrograms,
  programQueryKeys,
} from './program-queries';

const program = {
  id: 'p1',
  slug: 'starting-strength-mvp',
  name: 'Starting Strength',
  description: null,
  days_per_week: 3,
  is_published: true,
  created_at: '2026-06-03T00:00:00Z',
};

function exercise(overrides: { slug: string; sort_order: number }) {
  return {
    id: `ex-${overrides.slug}`,
    program_day_id: 'd1',
    name: overrides.slug,
    target_sets: 3,
    target_reps: '5',
    rest_seconds: 180,
    notes: null,
    ...overrides,
  };
}

describe('getPublishedPrograms', () => {
  it('returns published programs filtered by is_published', async () => {
    const order = vi.fn().mockResolvedValue({ data: [program], error: null });
    const eq = vi.fn().mockReturnValue({ order });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });
    const client = { from } as unknown as NexusSupabaseClient;

    const result = await getPublishedPrograms(client);

    expect(from).toHaveBeenCalledWith('programs');
    expect(eq).toHaveBeenCalledWith('is_published', true);
    expect(result).toEqual([program]);
  });

  it('returns an empty array when no data', async () => {
    const order = vi.fn().mockResolvedValue({ data: null, error: null });
    const client = {
      from: () => ({ select: () => ({ eq: () => ({ order }) }) }),
    } as unknown as NexusSupabaseClient;

    await expect(getPublishedPrograms(client)).resolves.toEqual([]);
  });

  it('throws when Supabase returns an error', async () => {
    const order = vi
      .fn()
      .mockResolvedValue({ data: null, error: new Error('boom') });
    const client = {
      from: () => ({ select: () => ({ eq: () => ({ order }) }) }),
    } as unknown as NexusSupabaseClient;

    await expect(getPublishedPrograms(client)).rejects.toThrow('boom');
  });
});

describe('getProgramWithDays', () => {
  function clientReturning(data: unknown, error: unknown = null) {
    const maybeSingle = vi.fn().mockResolvedValue({ data, error });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });
    return { client: { from } as unknown as NexusSupabaseClient, from, select };
  }

  it('sorts days and nested exercises by sort_order', async () => {
    const row = {
      ...program,
      program_days: [
        {
          id: 'd2',
          program_id: 'p1',
          slug: 'workout-b',
          day_index: 2,
          name: 'Workout B',
          sort_order: 2,
          program_exercises: [],
        },
        {
          id: 'd1',
          program_id: 'p1',
          slug: 'workout-a',
          day_index: 1,
          name: 'Workout A',
          sort_order: 1,
          program_exercises: [
            exercise({ slug: 'deadlift', sort_order: 3 }),
            exercise({ slug: 'squat', sort_order: 1 }),
            exercise({ slug: 'bench-press', sort_order: 2 }),
          ],
        },
      ],
    };
    const { client, select } = clientReturning(row);

    const result = await getProgramWithDays(client, 'p1');

    expect(select).toHaveBeenCalledWith(
      '*, program_days(*, program_exercises(*))',
    );
    expect(result?.days.map((d) => d.slug)).toEqual(['workout-a', 'workout-b']);
    expect(result?.days[0].exercises.map((e) => e.sort_order)).toEqual([
      1, 2, 3,
    ]);
    // raw nested key is not leaked
    expect(result).not.toHaveProperty('program_days');
  });

  it('returns null when the program is not found', async () => {
    const { client } = clientReturning(null);
    await expect(getProgramWithDays(client, 'missing')).resolves.toBeNull();
  });

  it('throws when Supabase returns an error', async () => {
    const { client } = clientReturning(null, new Error('nope'));
    await expect(getProgramWithDays(client, 'p1')).rejects.toThrow('nope');
  });
});

describe('programQueryKeys', () => {
  it('produces stable, serializable keys', () => {
    expect(programQueryKeys.withDays('p1')).toEqual([
      'program',
      'p1',
      'with-days',
    ]);
    expect(programQueryKeys.withDays('p1')).toEqual(
      programQueryKeys.withDays('p1'),
    );
    expect(JSON.stringify(programQueryKeys.published)).toBe(
      '["program","published"]',
    );
  });
});
