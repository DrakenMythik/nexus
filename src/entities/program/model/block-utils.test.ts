import { describe, expect, it } from 'vitest';

import { isLoggableBlock } from './block-utils';

describe('isLoggableBlock', () => {
  it('returns true for the main work block type', () => {
    expect(isLoggableBlock('Main')).toBe(true);
  });

  it('returns false for warmup and cooldown bookends', () => {
    expect(isLoggableBlock('Warmup')).toBe(false);
    expect(isLoggableBlock('Cooldown')).toBe(false);
  });
});
