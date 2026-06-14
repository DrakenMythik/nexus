import type { Json } from '@/shared/api';

export type OfflineMutationStatus = 'pending' | 'syncing' | 'synced' | 'failed';

export interface OfflineMutation {
  id: string;
  mutationType: string;
  payload: Json;
  status: OfflineMutationStatus;
  createdAt: string;
  errorMessage?: string;
}

export interface OfflineMutationDraft {
  id: string;
  mutationType: string;
  payload: Json;
}

export interface OfflineQueueStorage {
  getItem: (key: string) => string | null;
  setItem: (key: string, value: string) => void;
  removeItem: (key: string) => void;
}

const STORAGE_KEY = 'nexus-offline-mutations-v1';

function getStorage(): OfflineQueueStorage | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage;
}

function readQueue(storage: OfflineQueueStorage | null = getStorage()): OfflineMutation[] {
  if (!storage) {
    return [];
  }

  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw) as OfflineMutation[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeQueue(
  queue: OfflineMutation[],
  storage: OfflineQueueStorage | null = getStorage(),
) {
  if (!storage) {
    return;
  }
  storage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

export function enqueueOfflineMutation(
  draft: OfflineMutationDraft,
  storage: OfflineQueueStorage | null = getStorage(),
): OfflineMutation[] {
  const queue = readQueue(storage);
  if (queue.some((mutation) => mutation.id === draft.id)) {
    return queue;
  }

  const next = [
    ...queue,
    {
      ...draft,
      status: 'pending' as const,
      createdAt: new Date().toISOString(),
    },
  ];
  writeQueue(next, storage);
  return next;
}

export function listOfflineMutations(
  storage: OfflineQueueStorage | null = getStorage(),
): OfflineMutation[] {
  return readQueue(storage);
}

export function markOfflineMutationStatus(
  id: string,
  status: OfflineMutationStatus,
  errorMessage?: string,
  storage: OfflineQueueStorage | null = getStorage(),
): OfflineMutation[] {
  const next = readQueue(storage).map((mutation) =>
    mutation.id === id ? { ...mutation, status, errorMessage } : mutation,
  );
  writeQueue(next, storage);
  return next;
}

export function removeOfflineMutation(
  id: string,
  storage: OfflineQueueStorage | null = getStorage(),
): OfflineMutation[] {
  const next = readQueue(storage).filter((mutation) => mutation.id !== id);
  writeQueue(next, storage);
  return next;
}

export function clearOfflineMutations(
  storage: OfflineQueueStorage | null = getStorage(),
) {
  storage?.removeItem(STORAGE_KEY);
}
