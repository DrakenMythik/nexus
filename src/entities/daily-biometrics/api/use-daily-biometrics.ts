import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useSupabase } from '@/shared/api';

import {
  dailyBiometricsQueryKeys,
  getDailyBiometrics,
  getRecentDailyBiometrics,
  upsertDailyBiometrics,
} from './daily-biometrics-queries';
import type { DailyBiometricsInput } from '../model/types';

export function useDailyBiometricsQuery(userId: string | null, logDate: string) {
  const client = useSupabase();

  return useQuery({
    queryKey: dailyBiometricsQueryKeys.today(userId ?? 'anonymous', logDate),
    queryFn: () => getDailyBiometrics(client, userId ?? '', logDate),
    enabled: Boolean(userId),
  });
}

export function useRecentDailyBiometricsQuery(userId: string | null, days = 7) {
  const client = useSupabase();

  return useQuery({
    queryKey: dailyBiometricsQueryKeys.recent(userId ?? 'anonymous', days),
    queryFn: () => getRecentDailyBiometrics(client, userId ?? '', days),
    enabled: Boolean(userId),
  });
}

export function useUpsertDailyBiometricsMutation(userId: string | null) {
  const client = useSupabase();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: DailyBiometricsInput) => {
      if (!userId) {
        throw new Error('User is required to log daily biometrics.');
      }
      return upsertDailyBiometrics(client, userId, input);
    },
    onSuccess: (dailyBiometrics) => {
      queryClient.setQueryData(
        dailyBiometricsQueryKeys.today(
          dailyBiometrics.user_id,
          dailyBiometrics.log_date,
        ),
        dailyBiometrics,
      );
      void queryClient.invalidateQueries({
        queryKey: dailyBiometricsQueryKeys.all,
      });
    },
  });
}
