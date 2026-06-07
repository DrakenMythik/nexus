import { describe, expect, it } from 'vitest';

import { isLoggableBlock } from './block-utils';

describe('isLoggableBlock', () => {
  it('returns true for main work block types', () => {
    expect(isLoggableBlock('workout')).toBe(true);
    expect(isLoggableBlock('superset')).toBe(true);
    expect(isLoggableBlock('interval_circuit')).toBe(true);
  });

  it('returns false for warmup and cooldown bookends', () => {
    expect(isLoggableBlock('warmup')).toBe(false);
    expect(isLoggableBlock('cooldown')).toBe(false);
  });
});
