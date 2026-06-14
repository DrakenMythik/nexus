import { describe, expect, it } from 'vitest';

import { addLocalDays, formatLocalDate, isIsoDate } from './date';

describe('date helpers', () => {
  it('formats browser-local dates as ISO calendar dates', () => {
    expect(formatLocalDate(new Date(2026, 5, 3, 23, 30))).toBe('2026-06-03');
  });

  it('adds local calendar days across month boundaries', () => {
    expect(addLocalDays('2026-06-30', 1)).toBe('2026-07-01');
  });

  it('validates date-only text', () => {
    expect(isIsoDate('2026-06-13')).toBe(true);
    expect(isIsoDate('2026-6-13')).toBe(false);
  });
});
