import type {
  AdherenceEvent,
  AdherenceSummary,
  DailyStatus,
  SmartRestCommitment,
} from './types';

export const SMART_REST_COMMITMENTS: SmartRestCommitment[] = [
  'push_tomorrow',
  'sleep_priority',
  'hydrate',
  'mobility',
];

export function readinessBand(readinessScore: number) {
  if (readinessScore <= 3) {
    return 'rest' as const;
  }
  if (readinessScore <= 5) {
    return 'adjust' as const;
  }
  return 'train' as const;
}

export function isCreditedStatus(status: DailyStatus): boolean {
  return status === 'trained' || status === 'programmed_rest' || status === 'smart_rest';
}

export function canCreditSmartRest(commitment: string | null | undefined): boolean {
  return SMART_REST_COMMITMENTS.includes(commitment as SmartRestCommitment);
}

export function summarizeAdherence(events: AdherenceEvent[]): AdherenceSummary {
  const prescribedDays = events.filter((event) => event.status !== 'pending').length;
  const creditedDays = events.filter((event) => isCreditedStatus(event.status)).length;
  const smartRestDays = events.filter((event) => event.status === 'smart_rest').length;

  return {
    creditedDays,
    prescribedDays,
    smartRestDays,
    percent: prescribedDays === 0 ? 0 : Math.round((creditedDays / prescribedDays) * 100),
  };
}
