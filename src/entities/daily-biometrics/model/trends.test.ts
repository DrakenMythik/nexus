import { describe, expect, it } from 'vitest';

import { summarizeBiometricTrends } from './trends';
import type { DailyBiometrics } from './types';

const baseRow: DailyBiometrics = {
  id: 'daily-1',
  user_id: 'user-1',
  log_date: '2026-06-12',
  sleep_hours: null,
  steps: null,
  calories: null,
  protein_g: null,
  body_weight: null,
  readiness_score: 7,
  status: 'pending',
  streak_count: 0,
};

describe('summarizeBiometricTrends', () => {
  it('marks sparse metrics as insufficient', () => {
    const trends = summarizeBiometricTrends([{ ...baseRow, sleep_hours: 7 }]);

    expect(trends.find((trend) => trend.label === 'Sleep')).toMatchObject({
      latest: 7,
      previous: null,
      direction: 'insufficient',
    });
  });

  it('compares the two latest values', () => {
    const trends = summarizeBiometricTrends([
      { ...baseRow, id: 'daily-1', log_date: '2026-06-12', steps: 5000 },
      { ...baseRow, id: 'daily-2', log_date: '2026-06-13', steps: 7000 },
    ]);

    expect(trends.find((trend) => trend.label === 'Steps')).toMatchObject({
      latest: 7000,
      previous: 5000,
      direction: 'up',
    });
  });
});
