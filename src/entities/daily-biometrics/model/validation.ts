import type { DailyBiometricsInput } from './types';

export interface DailyBiometricsValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof DailyBiometricsInput, string>>;
}

function isPositiveOrEmpty(value: number | null | undefined): boolean {
  return value == null || value >= 0;
}

export function validateDailyBiometricsInput(
  input: DailyBiometricsInput,
): DailyBiometricsValidationResult {
  const errors: DailyBiometricsValidationResult['errors'] = {};

  if (!Number.isInteger(input.readinessScore) || input.readinessScore < 1 || input.readinessScore > 10) {
    errors.readinessScore = 'Choose a readiness score from 1 to 10.';
  }

  if (input.sleepHours != null && (input.sleepHours < 0 || input.sleepHours > 24)) {
    errors.sleepHours = 'Sleep must be between 0 and 24 hours.';
  }

  if (!isPositiveOrEmpty(input.steps)) {
    errors.steps = 'Steps cannot be negative.';
  }

  if (!isPositiveOrEmpty(input.calories)) {
    errors.calories = 'Calories cannot be negative.';
  }

  if (!isPositiveOrEmpty(input.proteinG)) {
    errors.proteinG = 'Protein cannot be negative.';
  }

  if (input.bodyWeight != null && input.bodyWeight <= 0) {
    errors.bodyWeight = 'Body weight must be greater than zero.';
  }

  return { valid: Object.keys(errors).length === 0, errors };
}
