import { describe, expect, it } from 'vitest';

import {
  canCreditSmartRest,
  readinessBand,
  summarizeAdherence,
} from './adherence';
import type { AdherenceEvent } from './types';

const event = (status: AdherenceEvent['status']): AdherenceEvent => ({
  id: status,
  user_id: 'user-1',
  event_date: '2026-06-13',
  status,
  source: 'daily_ritual',
  smart_rest_commitment: status === 'smart_rest' ? 'hydrate' : null,
  workout_log_id: null,
  notes: null,
  created_at: '2026-06-13T00:00:00Z',
  updated_at: '2026-06-13T00:00:00Z',
});

describe('adherence helpers', () => {
  it('maps readiness scores into action bands', () => {
    expect(readinessBand(2)).toBe('rest');
    expect(readinessBand(5)).toBe('adjust');
    expect(readinessBand(8)).toBe('train');
  });

  it('requires known smart rest commitments', () => {
    expect(canCreditSmartRest('hydrate')).toBe(true);
    expect(canCreditSmartRest(null)).toBe(false);
  });

  it('credits trained, programmed rest, and smart rest days', () => {
    expect(
      summarizeAdherence([
        event('trained'),
        event('smart_rest'),
        event('missed'),
        event('pending'),
      ]),
    ).toMatchObject({
      creditedDays: 2,
      prescribedDays: 3,
      smartRestDays: 1,
      percent: 67,
    });
  });
});
