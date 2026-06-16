import { describe, expect, it, vi } from 'vitest';

import type { NexusSupabaseClient } from '@/shared/api';

import {
  enrollOrSwitchProgram,
  ProgramSwitchBlockedError,
} from './workout-session-queries';
import type { UserProgramEnrollment, WorkoutLog } from '../model/types';

const userId = 'user-1';
const programA = 'program-a';
const programB = 'program-b';

const enrollmentA: UserProgramEnrollment = {
  id: 'enroll-a',
  user_id: userId,
  program_id: programA,
  started_on: '2026-06-16',
  current_week_number: 2,
  current_day_number: 1,
  pushed_until: null,
  active: true,
  created_at: '2026-06-01T00:00:00Z',
  updated_at: '2026-06-01T00:00:00Z',
};

const enrollmentB: UserProgramEnrollment = {
  id: 'enroll-b',
  user_id: userId,
  program_id: programB,
  started_on: '2026-06-16',
  current_week_number: 1,
  current_day_number: 1,
  pushed_until: null,
  active: true,
  created_at: '2026-06-16T00:00:00Z',
  updated_at: '2026-06-16T00:00:00Z',
};

const activeLog: WorkoutLog = {
  id: 'log-1',
  user_id: userId,
  workout_id: 'workout-1',
  started_at: '2026-06-16T08:00:00Z',
  ended_at: null,
  status: 'active',
  client_mutation_id: 'mut-1',
  completed_at: null,
};

function createClient(config: {
  enrollment?: UserProgramEnrollment | null;
  activeLog?: WorkoutLog | null;
  insertResult?: UserProgramEnrollment;
  deactivateError?: Error | null;
  insertError?: Error | null;
}) {
  const updateEq = vi.fn().mockResolvedValue({ error: config.deactivateError ?? null });
  const update = vi.fn().mockReturnValue({ eq: updateEq });
  const insertSingle = vi.fn().mockResolvedValue({
    data: config.insertResult ?? enrollmentB,
    error: config.insertError ?? null,
  });
  const insertSelect = vi.fn().mockReturnValue({ single: insertSingle });
  const insert = vi.fn().mockReturnValue({ select: insertSelect });

  const from = vi.fn((table: string) => {
    if (table === 'user_program_enrollments') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({
                data: config.enrollment ?? null,
                error: null,
              }),
            }),
          }),
        }),
        update,
        insert,
      };
    }

    if (table === 'workout_logs') {
      return {
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              is: vi.fn().mockReturnValue({
                order: vi.fn().mockReturnValue({
                  limit: vi.fn().mockReturnValue({
                    maybeSingle: vi.fn().mockResolvedValue({
                      data: config.activeLog ?? null,
                      error: null,
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      };
    }

    throw new Error(`Unexpected table: ${table}`);
  });

  return { from, update, insert } as unknown as NexusSupabaseClient & {
    update: ReturnType<typeof vi.fn>;
    insert: ReturnType<typeof vi.fn>;
  };
}

describe('enrollOrSwitchProgram', () => {
  it('inserts a new enrollment when none exists', async () => {
    const client = createClient({
      enrollment: null,
      activeLog: null,
      insertResult: enrollmentB,
    });

    const result = await enrollOrSwitchProgram(client, userId, programB);

    expect(result).toEqual(enrollmentB);
    expect(client.insert).toHaveBeenCalledTimes(1);
  });

  it('returns the existing enrollment when program matches', async () => {
    const client = createClient({
      enrollment: enrollmentA,
      activeLog: null,
    });

    const result = await enrollOrSwitchProgram(client, userId, programA);

    expect(result).toEqual(enrollmentA);
    expect(client.insert).not.toHaveBeenCalled();
    expect(client.update).not.toHaveBeenCalled();
  });

  it('deactivates the prior enrollment and inserts a new one when switching', async () => {
    const client = createClient({
      enrollment: enrollmentA,
      activeLog: null,
      insertResult: enrollmentB,
    });

    const result = await enrollOrSwitchProgram(client, userId, programB);

    expect(result).toEqual(enrollmentB);
    expect(client.update).toHaveBeenCalledTimes(1);
    expect(client.insert).toHaveBeenCalledTimes(1);
  });

  it('rejects switching while a workout is active', async () => {
    const client = createClient({
      enrollment: enrollmentA,
      activeLog,
    });

    await expect(enrollOrSwitchProgram(client, userId, programB)).rejects.toBeInstanceOf(
      ProgramSwitchBlockedError,
    );
    expect(client.update).not.toHaveBeenCalled();
    expect(client.insert).not.toHaveBeenCalled();
  });
});
