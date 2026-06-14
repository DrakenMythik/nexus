import type { NexusSupabaseClient } from '@/shared/api';

import type { CompletedSetInput, SetLog, UserProgramEnrollment, WorkoutLog } from '../model/types';

export const workoutSessionQueryKeys = {
  all: ['workout-session'] as const,
  enrollment: (userId: string) => ['workout-session', userId, 'enrollment'] as const,
  activeLog: (userId: string) => ['workout-session', userId, 'active-log'] as const,
  setLogs: (workoutLogId: string) => ['workout-session', workoutLogId, 'set-logs'] as const,
};

export async function getActiveEnrollment(
  client: NexusSupabaseClient,
  userId: string,
): Promise<UserProgramEnrollment | null> {
  const { data, error } = await client
    .from('user_program_enrollments')
    .select('*')
    .eq('user_id', userId)
    .eq('active', true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function createDefaultEnrollment(
  client: NexusSupabaseClient,
  userId: string,
  programId: string,
): Promise<UserProgramEnrollment> {
  const { data, error } = await client
    .from('user_program_enrollments')
    .insert({ user_id: userId, program_id: programId })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateEnrollmentPosition(
  client: NexusSupabaseClient,
  enrollmentId: string,
  position: {
    current_week_number: number;
    current_day_number: number;
    pushed_until?: string | null;
  },
): Promise<UserProgramEnrollment> {
  const { data, error } = await client
    .from('user_program_enrollments')
    .update({ ...position, updated_at: new Date().toISOString() })
    .eq('id', enrollmentId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getActiveWorkoutLog(
  client: NexusSupabaseClient,
  userId: string,
): Promise<WorkoutLog | null> {
  const { data, error } = await client
    .from('workout_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .is('ended_at', null)
    .order('started_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function startWorkoutLog(
  client: NexusSupabaseClient,
  userId: string,
  workoutId: string,
  clientMutationId: string,
): Promise<WorkoutLog> {
  const activeLog = await getActiveWorkoutLog(client, userId);
  if (activeLog) {
    return activeLog;
  }

  const { data, error } = await client
    .from('workout_logs')
    .insert({
      user_id: userId,
      workout_id: workoutId,
      client_mutation_id: clientMutationId,
      status: 'active',
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function getSetLogs(
  client: NexusSupabaseClient,
  workoutLogId: string,
): Promise<SetLog[]> {
  const { data, error } = await client
    .from('set_logs')
    .select('*')
    .eq('workout_log_id', workoutLogId)
    .order('set_number');

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function upsertSetLog(
  client: NexusSupabaseClient,
  workoutLogId: string,
  input: CompletedSetInput & { clientMutationId: string },
): Promise<SetLog> {
  const { data, error } = await client
    .from('set_logs')
    .upsert(
      {
        workout_log_id: workoutLogId,
        exercise_id: input.exerciseId,
        set_number: input.setNumber,
        reps_completed: input.repsCompleted,
        weight: input.weight,
        rpe: input.rpe ?? null,
        client_mutation_id: input.clientMutationId,
      },
      { onConflict: 'workout_log_id,exercise_id,set_number' },
    )
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function finishWorkoutLog(
  client: NexusSupabaseClient,
  workoutLogId: string,
): Promise<WorkoutLog> {
  const completedAt = new Date().toISOString();
  const { data, error } = await client
    .from('workout_logs')
    .update({
      status: 'completed',
      ended_at: completedAt,
      completed_at: completedAt,
    })
    .eq('id', workoutLogId)
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}
