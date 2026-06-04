import type { NexusSupabaseClient } from '@/shared/api';

import type {
  Program,
  ProgramDay,
  ProgramExercise,
  ProgramWithDays,
} from '../model/types';

export const programQueryKeys = {
  all: ['program'] as const,
  published: ['program', 'published'] as const,
  withDays: (programId: string) => ['program', programId, 'with-days'] as const,
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

type ProgramWithDaysRow = Program & {
  program_days: (ProgramDay & {
    program_exercises: ProgramExercise[];
  })[];
};

const bySortOrder = (a: { sort_order: number }, b: { sort_order: number }) =>
  a.sort_order - b.sort_order;

/**
 * Loads a single program with its days and nested exercises in one round-trip.
 * Days and exercises are sorted by `sort_order` client-side for determinism.
 * Returns `null` when the program is not found or not visible.
 */
export async function getProgramWithDays(
  client: NexusSupabaseClient,
  programId: string,
): Promise<ProgramWithDays | null> {
  const { data, error } = await client
    .from('programs')
    .select('*, program_days(*, program_exercises(*))')
    .eq('id', programId)
    .maybeSingle<ProgramWithDaysRow>();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const { program_days, ...program } = data;

  const days = [...program_days].sort(bySortOrder).map((day) => {
    const { program_exercises, ...rest } = day;
    return {
      ...rest,
      exercises: [...program_exercises].sort(bySortOrder),
    };
  });

  return { ...program, days };
}
