import type { Database } from '@/shared/api';

/** Matches `public.programs` Row shape. */
export type Program = Database['public']['Tables']['programs']['Row'];

/** Matches `public.program_days` Row shape. */
export type ProgramDay = Database['public']['Tables']['program_days']['Row'];

/** Matches `public.program_blocks` Row shape. */
export type ProgramBlock = Database['public']['Tables']['program_blocks']['Row'];

/** Matches `public.program_exercises` Row shape. */
export type ProgramExercise =
  Database['public']['Tables']['program_exercises']['Row'];

/** Matches `public.program_exercise_sets` Row shape. */
export type ProgramExerciseSet =
  Database['public']['Tables']['program_exercise_sets']['Row'];

/** Matches `public.user_program_enrollments` Row shape. */
export type Enrollment =
  Database['public']['Tables']['user_program_enrollments']['Row'];

/** Exercise with optional per-set prescription rows, ordered by `set_number`. */
export type ProgramExerciseWithSets = ProgramExercise & {
  sets: ProgramExerciseSet[];
};

/** Block with nested exercises and sets, ordered by `sort_order`. */
export type ProgramBlockWithExercises = ProgramBlock & {
  exercises: ProgramExerciseWithSets[];
};

/** A program day with ordered blocks (warmup → main → cooldown). */
export type ProgramDayWithBlocks = ProgramDay & {
  blocks: ProgramBlockWithExercises[];
};

/** @deprecated Use `ProgramDayWithBlocks`; kept for transitional imports. */
export type ProgramDayWithExercises = ProgramDayWithBlocks;

/** A program with its days (each carrying blocks), ordered by `sort_order`. */
export type ProgramWithDays = Program & {
  days: ProgramDayWithBlocks[];
};
