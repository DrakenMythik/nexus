import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '@/shared/api';

import {
  createDefaultEnrollment,
  finishWorkoutLog,
  getActiveEnrollment,
  getActiveWorkoutLog,
  getSetLogs,
  startWorkoutLog,
  updateEnrollmentPosition,
  upsertSetLog,
  workoutSessionQueryKeys,
} from './workout-session-queries';
import type { CompletedSetInput } from '../model/types';

export function useActiveEnrollmentQuery(userId: string | null) {
  const client = useSupabase();

  return useQuery({
    queryKey: workoutSessionQueryKeys.enrollment(userId ?? 'anonymous'),
    queryFn: () => getActiveEnrollment(client, userId ?? ''),
    enabled: Boolean(userId),
  });
}

export function useActiveWorkoutLogQuery(userId: string | null) {
  const client = useSupabase();

  return useQuery({
    queryKey: workoutSessionQueryKeys.activeLog(userId ?? 'anonymous'),
    queryFn: () => getActiveWorkoutLog(client, userId ?? ''),
    enabled: Boolean(userId),
  });
}

export function useSetLogsQuery(workoutLogId: string | null) {
  const client = useSupabase();

  return useQuery({
    queryKey: workoutSessionQueryKeys.setLogs(workoutLogId ?? 'none'),
    queryFn: () => getSetLogs(client, workoutLogId ?? ''),
    enabled: Boolean(workoutLogId),
  });
}

export function useCreateDefaultEnrollmentMutation(userId: string | null) {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (programId: string) => {
      if (!userId) {
        throw new Error('User is required to enroll in a program.');
      }
      return createDefaultEnrollment(client, userId, programId);
    },
    onSuccess: (enrollment) => {
      queryClient.setQueryData(
        workoutSessionQueryKeys.enrollment(enrollment.user_id),
        enrollment,
      );
    },
  });
}

export function useUpdateEnrollmentPositionMutation() {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: {
      enrollmentId: string;
      userId: string;
      position: {
        current_week_number: number;
        current_day_number: number;
        pushed_until?: string | null;
      };
    }) => updateEnrollmentPosition(client, input.enrollmentId, input.position),
    onSuccess: (enrollment) => {
      queryClient.setQueryData(
        workoutSessionQueryKeys.enrollment(enrollment.user_id),
        enrollment,
      );
    },
  });
}

export function useStartWorkoutLogMutation(userId: string | null) {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: { workoutId: string; clientMutationId: string }) => {
      if (!userId) {
        throw new Error('User is required to start workouts.');
      }
      return startWorkoutLog(client, userId, input.workoutId, input.clientMutationId);
    },
    onSuccess: (workoutLog) => {
      queryClient.setQueryData(
        workoutSessionQueryKeys.activeLog(workoutLog.user_id),
        workoutLog,
      );
    },
  });
}

export function useUpsertSetLogMutation(workoutLogId: string | null) {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CompletedSetInput & { clientMutationId: string }) => {
      if (!workoutLogId) {
        throw new Error('Workout log is required to save a set.');
      }
      return upsertSetLog(client, workoutLogId, input);
    },
    onSuccess: (setLog) => {
      void queryClient.invalidateQueries({
        queryKey: workoutSessionQueryKeys.setLogs(setLog.workout_log_id),
      });
    },
  });
}

export function useFinishWorkoutLogMutation() {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (workoutLogId: string) => finishWorkoutLog(client, workoutLogId),
    onSuccess: (workoutLog) => {
      void queryClient.invalidateQueries({
        queryKey: workoutSessionQueryKeys.all,
      });
      queryClient.setQueryData(
        workoutSessionQueryKeys.activeLog(workoutLog.user_id),
        null,
      );
    },
  });
}
