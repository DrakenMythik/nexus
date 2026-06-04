import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '@/shared/api';

import {
  enrollInProgram,
  enrollmentQueryKeys,
  getActiveEnrollment,
} from './enrollment-queries';

/**
 * Reads the user's active enrollment. `userId` is passed in (not read from a
 * store) so this slice never imports `entities/user` (FSD).
 */
export function useActiveEnrollmentQuery(userId: string | null) {
  const supabase = useSupabase();

  return useQuery({
    queryKey: enrollmentQueryKeys.active(userId ?? ''),
    queryFn: () => getActiveEnrollment(supabase, userId as string),
    enabled: Boolean(userId),
  });
}

export function useEnrollInProgramMutation() {
  const supabase = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      programId,
    }: {
      userId: string;
      programId: string;
    }) => enrollInProgram(supabase, userId, programId),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: enrollmentQueryKeys.all,
      });
    },
  });
}
