import { useQuery } from '@tanstack/react-query';

import { useSupabase } from '@/shared/api';

import {
  getProgramWithDays,
  getPublishedPrograms,
  programQueryKeys,
} from './program-queries';

const CATALOG_STALE_MS = 5 * 60_000;

export function usePublishedProgramsQuery() {
  const supabase = useSupabase();

  return useQuery({
    queryKey: programQueryKeys.published,
    queryFn: () => getPublishedPrograms(supabase),
    staleTime: CATALOG_STALE_MS,
  });
}

export function useProgramWithDaysQuery(programId?: string) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: programQueryKeys.withDays(programId ?? ''),
    queryFn: async () => {
      if (!programId) {
        return null;
      }
      return getProgramWithDays(supabase, programId);
    },
    enabled: Boolean(programId),
    staleTime: CATALOG_STALE_MS,
  });
}
