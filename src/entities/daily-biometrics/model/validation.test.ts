import { describe, expect, it } from 'vitest';

import { validateDailyBiometricsInput } from './validation';

describe('validateDailyBiometricsInput', () => {
  it('accepts readiness with skipped optional biometrics', () => {
    expect(
      validateDailyBiometricsInput({
        logDate: '2026-06-13',
        readinessScore: 7,
      }).valid,
    ).toBe(true);
  });

  it('rejects invalid readiness and negative metrics', () => {
    const result = validateDailyBiometricsInput({
      logDate: '2026-06-13',
      readinessScore: 11,
      steps: -1,
      bodyWeight: 0,
    });

    expect(result.valid).toBe(false);
    expect(result.errors).toMatchObject({
      readinessScore: expect.any(String),
      steps: expect.any(String),
      bodyWeight: expect.any(String),
    });
  });
});
