import type { NexusSupabaseClient } from '@/shared/api';

import type {
  Program,
  ProgramBlockWithExercises,
  ProgramDay,
  ProgramDayWithBlocks,
  ProgramExercise,
  ProgramExerciseSet,
  ProgramExerciseWithSets,
  ProgramWithDays,
} from '../model/types';

export const programQueryKeys = {
  all: ['program'] as const,
  published: ['program', 'published'] as const,
  withDays: (programId: string) => ['program', programId, 'with-blocks'] as const,
};

/**
 * Loads the published program catalog (RLS already restricts to `is_published`).
 */
export async function getPublishedPrograms(
  client: NexusSupabaseClient,
): Promise<Program[]> {
  const { data, error } = await client
    .from('programs')
    .select('*')
    .eq('is_published', true)
    .order('name');

  if (error) {
    throw error;
  }

  return data ?? [];
}

type ProgramBlockRow = {
  id: string;
  program_day_id: string;
  slug: string;
  block_type: ProgramBlockWithExercises['block_type'];
  name: string;
  sort_order: number;
  instructions: string | null;
  round_count: number | null;
  program_exercises: (ProgramExercise & {
    program_exercise_sets: ProgramExerciseSet[];
  })[];
};

type ProgramDayRow = ProgramDay & {
  program_blocks: ProgramBlockRow[];
  program_exercises: (ProgramExercise & {
    program_exercise_sets: ProgramExerciseSet[];
  })[];
};

type ProgramWithDaysRow = Program & {
  program_days: ProgramDayRow[];
};

const bySortOrder = (a: { sort_order: number }, b: { sort_order: number }) =>
  a.sort_order - b.sort_order;

const bySetNumber = (a: { set_number: number }, b: { set_number: number }) =>
  a.set_number - b.set_number;

function mapExercise(
  row: ProgramExercise & { program_exercise_sets?: ProgramExerciseSet[] },
): ProgramExerciseWithSets {
  const { program_exercise_sets, ...exercise } = row;
  return {
    ...exercise,
    sets: [...(program_exercise_sets ?? [])].sort(bySetNumber),
  };
}

function mapBlock(row: ProgramBlockRow): ProgramBlockWithExercises {
  const { program_exercises, ...block } = row;
  return {
    ...block,
    exercises: [...(program_exercises ?? [])].sort(bySortOrder).map(mapExercise),
  };
}

function mapDay(day: ProgramDayRow): ProgramDayWithBlocks {
  const { program_blocks, program_exercises, ...rest } = day;
  const blocks = [...(program_blocks ?? [])].sort(bySortOrder).map(mapBlock);

  const blockExerciseIds = new Set(
    blocks.flatMap((block) => block.exercises.map((exercise) => exercise.id)),
  );
  const unassignedExercises = [...(program_exercises ?? [])]
    .filter((exercise) => !blockExerciseIds.has(exercise.id))
    .sort(bySortOrder)
    .map(mapExercise);

  if (unassignedExercises.length > 0) {
    const mainBlock = blocks.find(
      (block) => block.block_type === 'workout' || block.slug === 'main-workout',
    );
    if (mainBlock) {
      mainBlock.exercises = [...mainBlock.exercises, ...unassignedExercises].sort(
        bySortOrder,
      );
    }
  }

  return { ...rest, blocks };
}

/**
 * Loads a single program with days, blocks, exercises, and per-set rows in one
 * round-trip. Days, blocks, exercises, and sets are sorted client-side.
 * Returns `null` when the program is not found or not visible.
 */
export async function getProgramWithDays(
  client: NexusSupabaseClient,
  programId: string,
): Promise<ProgramWithDays | null> {
  const { data, error } = await client
    .from('programs')
    .select(
      '*, program_days(*, program_blocks(*, program_exercises(*, program_exercise_sets(*))), program_exercises(*, program_exercise_sets(*)))',
    )
    .eq('id', programId)
    .maybeSingle<ProgramWithDaysRow>();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const { program_days, ...program } = data;
  const days = [...(program_days ?? [])].sort(bySortOrder).map(mapDay);

  return { ...program, days };
}
