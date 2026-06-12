import { describe, expect, it } from 'vitest';

import { appUserGreetingName, isAppUserOnboardingComplete } from './types';
import type { AppUser } from './types';

const baseUser: AppUser = {
  id: 'user-1',
  email: 'alex@example.com',
  display_name: null,
  sex: null,
  birthdate: null,
  created_at: '2026-01-01T00:00:00Z',
};

describe('appUserGreetingName', () => {
  it('prefers display_name over email local-part', () => {
    expect(
      appUserGreetingName({ ...baseUser, display_name: '  Alex  ' }),
    ).toBe('Alex');
  });

  it('falls back to email local-part when display_name is empty', () => {
    expect(appUserGreetingName(baseUser)).toBe('alex');
  });
});

describe('isAppUserOnboardingComplete', () => {
  it('requires display_name, sex, and birthdate', () => {
    expect(
      isAppUserOnboardingComplete({
        ...baseUser,
        display_name: 'Alex',
        sex: 'Male',
        birthdate: '1990-01-01',
      }),
    ).toBe(true);
  });

  it('is false when display_name is missing', () => {
    expect(
      isAppUserOnboardingComplete({
        ...baseUser,
        sex: 'Male',
        birthdate: '1990-01-01',
      }),
    ).toBe(false);
  });
});
