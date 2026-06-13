import type { NexusSupabaseClient } from '@/shared/api';

import type { DailyBiometrics, DailyBiometricsInput } from '../model/types';
import { validateDailyBiometricsInput } from '../model/validation';

export const dailyBiometricsQueryKeys = {
  all: ['daily-biometrics'] as const,
  today: (userId: string, logDate: string) =>
    ['daily-biometrics', userId, logDate] as const,
  recent: (userId: string, days: number) =>
    ['daily-biometrics', userId, 'recent', days] as const,
};

export async function getDailyBiometrics(
  client: NexusSupabaseClient,
  userId: string,
  logDate: string,
): Promise<DailyBiometrics | null> {
  const { data, error } = await client
    .from('daily_biometrics')
    .select('*')
    .eq('user_id', userId)
    .eq('log_date', logDate)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
}

export async function getRecentDailyBiometrics(
  client: NexusSupabaseClient,
  userId: string,
  limit = 7,
): Promise<DailyBiometrics[]> {
  const { data, error } = await client
    .from('daily_biometrics')
    .select('*')
    .eq('user_id', userId)
    .order('log_date', { ascending: false })
    .limit(limit);

  if (error) {
    throw error;
  }

  return data ?? [];
}

export async function upsertDailyBiometrics(
  client: NexusSupabaseClient,
  userId: string,
  input: DailyBiometricsInput,
): Promise<DailyBiometrics> {
  const validation = validateDailyBiometricsInput(input);
  if (!validation.valid) {
    throw new Error('Daily biometrics input is invalid.');
  }

  const { data, error } = await client
    .from('daily_biometrics')
    .upsert(
      {
        user_id: userId,
        log_date: input.logDate,
        readiness_score: input.readinessScore,
        sleep_hours: input.sleepHours ?? null,
        steps: input.steps ?? null,
        calories: input.calories ?? null,
        protein_g: input.proteinG ?? null,
        body_weight: input.bodyWeight ?? null,
        status: 'pending',
      },
      { onConflict: 'user_id,log_date' },
    )
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return data;
}
