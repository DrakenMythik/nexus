import { describe, expect, it } from 'vitest';

import {
  clearOfflineMutations,
  enqueueOfflineMutation,
  listOfflineMutations,
  markOfflineMutationStatus,
  removeOfflineMutation,
  type OfflineQueueStorage,
} from './offline-queue';

function createMemoryStorage(): OfflineQueueStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

describe('offline queue', () => {
  it('deduplicates queued mutations by id', () => {
    const storage = createMemoryStorage();

    enqueueOfflineMutation(
      { id: 'set-1', mutationType: 'set-log', payload: { reps: 5 } },
      storage,
    );
    enqueueOfflineMutation(
      { id: 'set-1', mutationType: 'set-log', payload: { reps: 5 } },
      storage,
    );

    expect(listOfflineMutations(storage)).toHaveLength(1);
  });

  it('updates status and removes completed mutations', () => {
    const storage = createMemoryStorage();

    enqueueOfflineMutation(
      { id: 'vibe-1', mutationType: 'daily-biometrics', payload: { readiness: 7 } },
      storage,
    );
    markOfflineMutationStatus('vibe-1', 'failed', 'offline', storage);

    expect(listOfflineMutations(storage)[0]).toMatchObject({
      status: 'failed',
      errorMessage: 'offline',
    });

    removeOfflineMutation('vibe-1', storage);
    expect(listOfflineMutations(storage)).toEqual([]);
  });

  it('can clear persisted mutations', () => {
    const storage = createMemoryStorage();
    enqueueOfflineMutation(
      { id: 'nudge-1', mutationType: 'nudge-history', payload: {} },
      storage,
    );

    clearOfflineMutations(storage);
    expect(listOfflineMutations(storage)).toEqual([]);
  });
});
