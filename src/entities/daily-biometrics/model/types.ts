import type { Database } from '@/shared/api';

export type DailyBiometrics =
  Database['public']['Tables']['daily_biometrics']['Row'];

export interface DailyBiometricsInput {
  logDate: string;
  readinessScore: number;
  sleepHours?: number | null;
  steps?: number | null;
  calories?: number | null;
  proteinG?: number | null;
  bodyWeight?: number | null;
}

export interface BiometricTrend {
  label: string;
  latest: number | null;
  previous: number | null;
  direction: 'up' | 'down' | 'flat' | 'insufficient';
  unit: string;
}
