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
  tags: [],
  source_folder: null,
  level: 'intermediate' as const,
};

function exercise(
  overrides: {
    slug: string;
    sort_order: number;
    program_block_id?: string | null;
    target_reps?: string;
    prescription_mode?: 'sets_reps' | 'time_interval' | 'percentage_1rm';
    work_seconds?: number | null;
  },
  sets: { set_number: number; work_seconds?: number | null }[] = [],
) {
  return {
    id: `ex-${overrides.slug}`,
    program_day_id: 'd1',
    program_block_id: overrides.program_block_id ?? 'blk-main',
    name: overrides.slug,
    prescription_mode: overrides.prescription_mode ?? ('sets_reps' as const),
    protocol: null,
    tempo: null,
    superset_letter: null,
    percentage_start: null,
    percentage_increment: null,
    work_seconds: overrides.work_seconds ?? null,
    target_sets: 3,
    target_reps: overrides.target_reps ?? '5',
    rest_seconds: 180,
    notes: null,
    program_exercise_sets: sets,
    ...overrides,
  };
}

function block(
  overrides: {
    id: string;
    slug: string;
    block_type: 'warmup' | 'workout' | 'cooldown';
    sort_order: number;
  },
  exercises: ReturnType<typeof exercise>[],
) {
  return {
    program_day_id: 'd1',
    name: overrides.slug,
    instructions: null,
    round_count: null,
    program_exercises: exercises,
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

  it('sorts days, blocks, exercises, and sets by sort_order / set_number', async () => {
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
          focus: null,
          program_blocks: [],
          program_exercises: [],
        },
        {
          id: 'd1',
          program_id: 'p1',
          slug: 'push',
          day_index: 1,
          name: 'Push',
          sort_order: 1,
          focus: 'push',
          program_blocks: [
            block(
              {
                id: 'blk-cool',
                slug: 'cool-down',
                block_type: 'cooldown',
                sort_order: 3,
              },
              [
                exercise(
                  {
                    slug: 'stretch',
                    sort_order: 1,
                    target_reps: '60s',
                    prescription_mode: 'time_interval',
                    work_seconds: 60,
                  },
                  [{ set_number: 1, work_seconds: 60 }],
                ),
              ],
            ),
            block(
              {
                id: 'blk-main',
                slug: 'main-workout',
                block_type: 'workout',
                sort_order: 2,
              },
              [
                exercise({ slug: 'bench-press', sort_order: 2 }),
                exercise({ slug: 'squat', sort_order: 1 }),
              ],
            ),
            block(
              {
                id: 'blk-warm',
                slug: 'warm-up',
                block_type: 'warmup',
                sort_order: 1,
              },
              [
                exercise({
                  slug: 'band-dislocates',
                  sort_order: 1,
                  target_reps: 'freestyle',
                }),
              ],
            ),
          ],
          program_exercises: [],
        },
      ],
    };
    const { client, select } = clientReturning(row);

    const result = await getProgramWithDays(client, 'p1');

    expect(select).toHaveBeenCalledWith(
      '*, program_days(*, program_blocks(*, program_exercises(*, program_exercise_sets(*))), program_exercises(*, program_exercise_sets(*)))',
    );
    expect(result?.days.map((d) => d.slug)).toEqual(['push', 'workout-b']);
    expect(result?.days[0].blocks.map((b) => b.slug)).toEqual([
      'warm-up',
      'main-workout',
      'cool-down',
    ]);
    expect(result?.days[0].blocks[0].exercises[0].target_reps).toBe('freestyle');
    expect(
      result?.days[0].blocks[1].exercises.map((e) => e.sort_order),
    ).toEqual([1, 2]);
    expect(result?.days[0].blocks[2].exercises[0].sets[0].work_seconds).toBe(60);
    expect(result?.days[0].blocks[2].exercises[0].prescription_mode).toBe(
      'time_interval',
    );
    expect(result?.days[0].blocks[2].exercises[0].work_seconds).toBe(60);
    expect(result).not.toHaveProperty('program_days');
  });

  it('merges day-level exercises with dangling block FK into the main workout block', async () => {
    const row = {
      ...program,
      program_days: [
        {
          id: 'd1',
          program_id: 'p1',
          slug: 'push',
          day_index: 1,
          name: 'Push',
          sort_order: 1,
          focus: null,
          program_blocks: [
            block(
              {
                id: 'blk-main',
                slug: 'main-workout',
                block_type: 'workout',
                sort_order: 1,
              },
              [exercise({ slug: 'bench-press', sort_order: 1 })],
            ),
          ],
          program_exercises: [
            exercise({
              slug: 'dangling-row',
              sort_order: 2,
              program_block_id: 'missing-block-id',
            }),
          ],
        },
      ],
    };
    const { client } = clientReturning(row);

    const result = await getProgramWithDays(client, 'p1');

    expect(result?.days[0].blocks).toHaveLength(1);
    expect(result?.days[0].blocks[0].exercises.map((e) => e.slug)).toEqual([
      'bench-press',
      'dangling-row',
    ]);
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
      'with-blocks',
    ]);
    expect(programQueryKeys.withDays('p1')).toEqual(
      programQueryKeys.withDays('p1'),
    );
    expect(JSON.stringify(programQueryKeys.published)).toBe(
      '["program","published"]',
    );
  });
});
