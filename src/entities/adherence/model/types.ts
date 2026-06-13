import type { Database } from '@/shared/api';

export type DailyStatus = Database['public']['Enums']['daily_status'];
export type AdherenceEvent =
  Database['public']['Tables']['adherence_events']['Row'];

export type SmartRestCommitment =
  | 'push_tomorrow'
  | 'sleep_priority'
  | 'hydrate'
  | 'mobility';

export interface AdherenceSummary {
  creditedDays: number;
  prescribedDays: number;
  percent: number;
  smartRestDays: number;
}
