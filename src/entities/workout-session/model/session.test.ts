import { describe, expect, it } from 'vitest';

import { resolveTodayWorkoutState, selectDefaultProgram } from './session';
import type { UserProgramEnrollment } from './types';
import type { ProgramWithWorkouts } from '@/entities/program';

const enrollment: UserProgramEnrollment = {
  id: 'enrollment-1',
  user_id: 'user-1',
  program_id: 'program-1',
  started_on: '2026-06-01',
  current_week_number: 1,
  current_day_number: 1,
  pushed_until: null,
  active: true,
  created_at: '2026-06-01T00:00:00Z',
  updated_at: '2026-06-01T00:00:00Z',
};

const program: ProgramWithWorkouts = {
  id: 'program-1',
  name: 'Starting Strength',
  description: null,
  days_per_week: 3,
  weeks_duration: 4,
  level: 'Beginner',
  specialty: 'Strength',
  workouts: [
    {
      id: 'workout-1',
      program_id: 'program-1',
      name: 'Day 1',
      description: null,
      week_number: 1,
      day_number: 1,
      exercises: [],
    },
  ],
};

describe('workout session helpers', () => {
  it('prefers Starting Strength as the default program', () => {
    expect(
      selectDefaultProgram([
        { name: 'Other', level: 'Beginner' },
        { name: 'Starting Strength', level: 'Beginner' },
      ])?.name,
    ).toBe('Starting Strength');
  });

  it('resolves the current enrollment workout', () => {
    expect(
      resolveTodayWorkoutState({
        program,
        enrollment,
        activeLog: null,
        today: '2026-06-13',
      }),
    ).toMatchObject({
      reason: 'ready',
      workout: { id: 'workout-1' },
    });
  });

  it('honors pushed smart-rest days', () => {
    expect(
      resolveTodayWorkoutState({
        program,
        enrollment: { ...enrollment, pushed_until: '2026-06-14' },
        activeLog: null,
        today: '2026-06-13',
      }).reason,
    ).toBe('pushed');
  });
});
