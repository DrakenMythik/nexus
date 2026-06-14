import type { DailyBiometrics } from './types';

type MetricKey = 'sleep_hours' | 'steps' | 'calories' | 'protein_g' | 'body_weight';

interface MetricDefinition {
  key: MetricKey;
  label: string;
  unit: string;
}

const METRICS: MetricDefinition[] = [
  { key: 'sleep_hours', label: 'Sleep', unit: 'h' },
  { key: 'steps', label: 'Steps', unit: 'steps' },
  { key: 'calories', label: 'Calories', unit: 'kcal' },
  { key: 'protein_g', label: 'Protein', unit: 'g' },
  { key: 'body_weight', label: 'Body weight', unit: 'kg' },
];

export function summarizeBiometricTrends(rows: DailyBiometrics[]) {
  const sorted = [...rows].sort((a, b) => a.log_date.localeCompare(b.log_date));

  return METRICS.map(({ key, label, unit }) => {
    const values = sorted
      .map((row) => row[key])
      .filter((value): value is number => typeof value === 'number');

    const latest = values.at(-1) ?? null;
    const previous = values.at(-2) ?? null;

    if (latest == null || previous == null) {
      return { label, unit, latest, previous, direction: 'insufficient' as const };
    }

    const delta = latest - previous;
    return {
      label,
      unit,
      latest,
      previous,
      direction:
        Math.abs(delta) < 0.01 ? 'flat' as const : delta > 0 ? 'up' as const : 'down' as const,
    };
  });
}
