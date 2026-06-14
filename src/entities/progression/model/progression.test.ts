import { describe, expect, it } from 'vitest';

import { evaluateNextTargetWeight } from './progression';

describe('evaluateNextTargetWeight', () => {
  it('increments after all prescribed sets meet target reps and load', () => {
    expect(
      evaluateNextTargetWeight({
        targetWeight: 100,
        incrementWeight: 2.5,
        prescribedSets: 3,
        targetReps: 5,
        completedSets: [
          { repsCompleted: 5, weight: 100 },
          { repsCompleted: 5, weight: 100 },
          { repsCompleted: 5, weight: 100 },
        ],
      }),
    ).toBe(102.5);
  });

  it('repeats when any prescribed set misses the target', () => {
    expect(
      evaluateNextTargetWeight({
        targetWeight: 100,
        incrementWeight: 2.5,
        prescribedSets: 3,
        targetReps: 5,
        completedSets: [
          { repsCompleted: 5, weight: 100 },
          { repsCompleted: 4, weight: 100 },
          { repsCompleted: 5, weight: 100 },
        ],
      }),
    ).toBe(100);
  });
});
