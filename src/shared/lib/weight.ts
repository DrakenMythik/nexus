import { useCallback, useState } from 'react';

export type WeightUnit = 'kg' | 'lb';

/** Kilograms per pound (international avoirdupois). */
export const KG_PER_LB = 0.45359237;

const STORAGE_KEY = 'nexus.weight-unit';

function isWeightUnit(value: unknown): value is WeightUnit {
  return value === 'kg' || value === 'lb';
}

/** Reads persisted weight unit preference; defaults to `kg`. */
export function getStoredWeightUnit(): WeightUnit {
  if (typeof window === 'undefined') return 'kg';
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return isWeightUnit(raw) ? raw : 'kg';
  } catch {
    return 'kg';
  }
}

/** Persists weight unit preference for input/display. */
export function setStoredWeightUnit(unit: WeightUnit): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, unit);
  } catch {
    // Storage may be unavailable (private mode, blocked, quota).
  }
}

function assertPositive(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new RangeError(`${label} must be a finite number greater than zero`);
  }
}

/** Converts a user-entered weight to canonical kilograms for DB storage. */
export function toCanonicalKg(value: number, unit: WeightUnit): number {
  assertPositive(value, 'Weight');
  return unit === 'kg' ? value : value * KG_PER_LB;
}

/** Converts canonical kilograms to the given display/input unit. */
export function fromCanonicalKg(kg: number, unit: WeightUnit): number {
  assertPositive(kg, 'Weight');
  return unit === 'kg' ? kg : kg / KG_PER_LB;
}

/** Formats canonical kg for display with unit suffix. */
export function formatWeight(kg: number, unit: WeightUnit, decimals = 1): string {
  const display = fromCanonicalKg(kg, unit);
  return `${display.toFixed(decimals)} ${unit}`;
}

export interface UseWeightUnitResult {
  unit: WeightUnit;
  setUnit: (next: WeightUnit) => void;
  toggleUnit: () => void;
}

export function useWeightUnit(): UseWeightUnitResult {
  const [unit, setUnitState] = useState<WeightUnit>(() => getStoredWeightUnit());

  const setUnit = useCallback((next: WeightUnit) => {
    setUnitState(next);
    setStoredWeightUnit(next);
  }, []);

  const toggleUnit = useCallback(() => {
    setUnit(unit === 'kg' ? 'lb' : 'kg');
  }, [unit, setUnit]);

  return { unit, setUnit, toggleUnit };
}
