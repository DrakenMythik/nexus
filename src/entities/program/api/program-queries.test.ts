import { describe, expect, it, vi } from 'vitest';

import type { NexusSupabaseClient } from '@/shared/api';

import {
  getProgramWithWorkouts,
  getPublishedPrograms,
  programQueryKeys,
} from './program-queries';

const program = {
  id: 'p1',
  name: 'Starting Strength',
  description: null,
  days_per_week: 3,
  weeks_duration: 12,
  level: 'Intermediate' as const,
  specialty: 'Strength' as const,
};

const squatLibrary = {
  id: 'lib-squat',
  name: 'Squat',
  instructions: null,
  muscle_group: 'Legs',
};

const benchLibrary = {
  id: 'lib-bench',
  name: 'Bench Press',
  instructions: null,
  muscle_group: 'Chest',
};

function workoutExercise(
  overrides: {
    id: string;
    order_index: number;
    block_type: 'Warmup' | 'Main' | 'Cooldown';
    exercise: typeof squatLibrary | typeof benchLibrary;
    target_reps_min?: number | null;
    target_reps_max?: number | null;
    target_time_seconds?: number | null;
  },
) {
  return {
    workout_id: 'w1',
    exercise_id: overrides.exercise.id,
    target_sets: 3,
    rest_seconds: 180,
    superset_group: null,
    tempo: null,
    target_reps_min: overrides.target_reps_min ?? 5,
    target_reps_max: overrides.target_reps_max ?? 5,
    target_time_seconds: overrides.target_time_seconds ?? null,
    exercises: overrides.exercise,
    ...overrides,
  };
}

describe('getPublishedPrograms', () => {
  it('returns all programs ordered by name', async () => {
    const order = vi.fn().mockResolvedValue({ data: [program], error: null });
    const select = vi.fn().mockReturnValue({ order });
    const from = vi.fn().mockReturnValue({ select });
    const client = { from } as unknown as NexusSupabaseClient;

    const result = await getPublishedPrograms(client);

    expect(from).toHaveBeenCalledWith('programs');
    expect(select).toHaveBeenCalledWith('*');
    expect(order).toHaveBeenCalledWith('name');
    expect(result).toEqual([program]);
  });

  it('returns an empty array when no data', async () => {
    const order = vi.fn().mockResolvedValue({ data: null, error: null });
    const client = {
      from: () => ({ select: () => ({ order }) }),
    } as unknown as NexusSupabaseClient;

    await expect(getPublishedPrograms(client)).resolves.toEqual([]);
  });

  it('throws when Supabase returns an error', async () => {
    const order = vi
      .fn()
      .mockResolvedValue({ data: null, error: new Error('boom') });
    const client = {
      from: () => ({ select: () => ({ order }) }),
    } as unknown as NexusSupabaseClient;

    await expect(getPublishedPrograms(client)).rejects.toThrow('boom');
  });
});

describe('getProgramWithWorkouts', () => {
  function clientReturning(data: unknown, error: unknown = null) {
    const maybeSingle = vi.fn().mockResolvedValue({ data, error });
    const eq = vi.fn().mockReturnValue({ maybeSingle });
    const select = vi.fn().mockReturnValue({ eq });
    const from = vi.fn().mockReturnValue({ select });
    return { client: { from } as unknown as NexusSupabaseClient, from, select };
  }

  it('sorts workouts by week/day and exercises by order_index', async () => {
    const row = {
      ...program,
      workouts: [
        {
          id: 'w2',
          program_id: 'p1',
          name: 'Workout B',
          description: null,
          week_number: 1,
          day_number: 2,
          workout_exercises: [],
        },
        {
          id: 'w1',
          program_id: 'p1',
          name: 'Workout A',
          description: null,
          week_number: 1,
          day_number: 1,
          workout_exercises: [
            workoutExercise({
              id: 'we2',
              order_index: 2,
              block_type: 'Main',
              exercise: benchLibrary,
            }),
            workoutExercise({
              id: 'we1',
              order_index: 1,
              block_type: 'Warmup',
              exercise: squatLibrary,
              target_reps_min: null,
              target_reps_max: null,
            }),
          ],
        },
      ],
    };
    const { client, select } = clientReturning(row);

    const result = await getProgramWithWorkouts(client, 'p1');

    expect(select).toHaveBeenCalledWith(
      '*, workouts(*, workout_exercises(*, exercises(*)))',
    );
    expect(result?.workouts.map((w) => w.name)).toEqual([
      'Workout A',
      'Workout B',
    ]);
    expect(result?.workouts[0].exercises.map((e) => e.order_index)).toEqual([
      1, 2,
    ]);
    expect(result?.workouts[0].exercises[0].exercise.name).toBe('Squat');
    expect(result?.workouts[0].exercises[1].block_type).toBe('Main');
    expect(result?.workouts[0]).not.toHaveProperty('workout_exercises');
  });

  it('returns null when the program is not found', async () => {
    const { client } = clientReturning(null);
    await expect(getProgramWithWorkouts(client, 'missing')).resolves.toBeNull();
  });

  it('throws when Supabase returns an error', async () => {
    const { client } = clientReturning(null, new Error('nope'));
    await expect(getProgramWithWorkouts(client, 'p1')).rejects.toThrow('nope');
  });
});

describe('programQueryKeys', () => {
  it('produces stable, serializable keys', () => {
    expect(programQueryKeys.withWorkouts('p1')).toEqual([
      'program',
      'p1',
      'with-workouts',
    ]);
    expect(programQueryKeys.withWorkouts('p1')).toEqual(
      programQueryKeys.withWorkouts('p1'),
    );
    expect(JSON.stringify(programQueryKeys.published)).toBe(
      '["program","published"]',
    );
  });
});
