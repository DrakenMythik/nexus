import { addLocalDays } from '@/shared/lib';
import type { ProgramWithWorkouts, WorkoutWithExercises } from '@/entities/program';

import type { CompletedSetInput, TodayWorkoutState, UserProgramEnrollment, WorkoutLog } from './types';

export function canSwitchProgram(activeLog: WorkoutLog | null): boolean {
  return activeLog === null;
}

export function selectDefaultProgram<T extends { name: string; level: string | null }>(
  programs: T[],
): T | null {
  return (
    programs.find((program) => program.name.toLowerCase() === 'starting strength') ??
    programs.find((program) => program.level === 'Beginner') ??
    programs[0] ??
    null
  );
}

function findWorkout(
  program: ProgramWithWorkouts,
  weekNumber: number,
  dayNumber: number,
): WorkoutWithExercises | null {
  return (
    program.workouts.find(
      (workout) =>
        workout.week_number === weekNumber && workout.day_number === dayNumber,
    ) ??
    program.workouts[0] ??
    null
  );
}

export function resolveTodayWorkoutState(input: {
  program: ProgramWithWorkouts | null;
  enrollment: UserProgramEnrollment | null;
  activeLog: WorkoutLog | null;
  today: string;
}): TodayWorkoutState {
  if (!input.program || !input.enrollment) {
    return {
      enrollment: input.enrollment,
      workout: null,
      activeLog: input.activeLog,
      reason: 'no-program',
    };
  }

  if (input.enrollment.pushed_until && input.enrollment.pushed_until > input.today) {
    return {
      enrollment: input.enrollment,
      workout: null,
      activeLog: input.activeLog,
      reason: 'pushed',
    };
  }

  return {
    enrollment: input.enrollment,
    workout: findWorkout(
      input.program,
      input.enrollment.current_week_number,
      input.enrollment.current_day_number,
    ),
    activeLog: input.activeLog,
    reason: 'ready',
  };
}

export function nextEnrollmentPosition(
  program: ProgramWithWorkouts,
  enrollment: UserProgramEnrollment,
) {
  const sorted = [...program.workouts].sort(
    (a, b) => a.week_number - b.week_number || a.day_number - b.day_number,
  );
  const currentIndex = sorted.findIndex(
    (workout) =>
      workout.week_number === enrollment.current_week_number &&
      workout.day_number === enrollment.current_day_number,
  );
  const nextWorkout = sorted[(currentIndex + 1) % sorted.length] ?? sorted[0];

  return {
    current_week_number: nextWorkout?.week_number ?? enrollment.current_week_number,
    current_day_number: nextWorkout?.day_number ?? enrollment.current_day_number,
  };
}

export function nextWorkoutPushDate(today: string): string {
  return addLocalDays(today, 1);
}

export function hasCompletedPrescribedSets(
  exerciseId: string,
  prescribedSets: number,
  completedSets: CompletedSetInput[],
): boolean {
  const uniqueSets = new Set(
    completedSets
      .filter((set) => set.exerciseId === exerciseId)
      .map((set) => set.setNumber),
  );
  return uniqueSets.size >= prescribedSets;
}
