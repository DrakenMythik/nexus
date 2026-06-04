import type { Database } from '@/shared/api';

/** Matches `public.programs` Row shape. */
export type Program = Database['public']['Tables']['programs']['Row'];

/** Matches `public.program_days` Row shape. */
export type ProgramDay = Database['public']['Tables']['program_days']['Row'];

/** Matches `public.program_exercises` Row shape. */
export type ProgramExercise =
  Database['public']['Tables']['program_exercises']['Row'];

/** Matches `public.user_program_enrollments` Row shape. */
export type Enrollment =
  Database['public']['Tables']['user_program_enrollments']['Row'];

/** A program day with its exercises, ordered by `sort_order`. */
export type ProgramDayWithExercises = ProgramDay & {
  exercises: ProgramExercise[];
};

/** A program with its days (each carrying exercises), ordered by `sort_order`. */
export type ProgramWithDays = Program & {
  days: ProgramDayWithExercises[];
};
