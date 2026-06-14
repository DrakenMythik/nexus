import type { Database } from '@/shared/api';
import type { WorkoutWithExercises } from '@/entities/program';

export type UserProgramEnrollment =
  Database['public']['Tables']['user_program_enrollments']['Row'];
export type WorkoutLog = Database['public']['Tables']['workout_logs']['Row'];
export type SetLog = Database['public']['Tables']['set_logs']['Row'];

export interface TodayWorkoutState {
  enrollment: UserProgramEnrollment | null;
  workout: WorkoutWithExercises | null;
  activeLog: WorkoutLog | null;
  reason: 'ready' | 'program-rest' | 'no-program' | 'pushed';
}

export interface CompletedSetInput {
  exerciseId: string;
  setNumber: number;
  repsCompleted: number;
  weight: number;
  rpe?: number | null;
}
