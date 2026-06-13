import { afterEach, describe, expect, it } from 'vitest';

import {
  KG_PER_LB,
  fromCanonicalKg,
  formatWeight,
  getStoredWeightUnit,
  setStoredWeightUnit,
  toCanonicalKg,
} from './weight';

const STORAGE_KEY = 'nexus.weight-unit';

describe('toCanonicalKg', () => {
  it('returns kg values unchanged', () => {
    expect(toCanonicalKg(80, 'kg')).toBe(80);
  });

  it('converts lb to kg', () => {
    expect(toCanonicalKg(180, 'lb')).toBeCloseTo(180 * KG_PER_LB, 5);
  });

  it('rejects non-positive values', () => {
    expect(() => toCanonicalKg(0, 'kg')).toThrow(RangeError);
    expect(() => toCanonicalKg(-10, 'lb')).toThrow(RangeError);
    expect(() => toCanonicalKg(Number.NaN, 'kg')).toThrow(RangeError);
  });
});

describe('fromCanonicalKg', () => {
  it('returns kg values unchanged', () => {
    expect(fromCanonicalKg(80, 'kg')).toBe(80);
  });

  it('converts kg to lb', () => {
    expect(fromCanonicalKg(81.6466, 'lb')).toBeCloseTo(180, 1);
  });

  it('rejects non-positive values', () => {
    expect(() => fromCanonicalKg(0, 'kg')).toThrow(RangeError);
    expect(() => fromCanonicalKg(-1, 'lb')).toThrow(RangeError);
  });
});

describe('round-trip conversion', () => {
  it('preserves lb input through kg storage and back', () => {
    const kg = toCanonicalKg(185, 'lb');
    expect(fromCanonicalKg(kg, 'lb')).toBeCloseTo(185, 5);
  });
});

describe('formatWeight', () => {
  it('includes unit suffix', () => {
    expect(formatWeight(80, 'kg')).toBe('80.0 kg');
    expect(formatWeight(toCanonicalKg(180, 'lb'), 'lb')).toBe('180.0 lb');
  });
});

describe('weight unit preference', () => {
  afterEach(() => {
    window.localStorage.removeItem(STORAGE_KEY);
  });

  it('defaults to kg when unset', () => {
    expect(getStoredWeightUnit()).toBe('kg');
  });

  it('persists kg or lb', () => {
    setStoredWeightUnit('lb');
    expect(getStoredWeightUnit()).toBe('lb');
    setStoredWeightUnit('kg');
    expect(getStoredWeightUnit()).toBe('kg');
  });
});
