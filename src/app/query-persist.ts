import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import type { Query } from '@tanstack/react-query';
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';

import { adherenceQueryKeys } from '@/entities/adherence';
import { dailyBiometricsQueryKeys } from '@/entities/daily-biometrics';
import { knowledgeNudgeQueryKeys } from '@/entities/knowledge-nudge';
import { programQueryKeys } from '@/entities/program';
import { appUserQueryKeys } from '@/entities/user';
import { workoutSessionQueryKeys } from '@/entities/workout-session';
import { clearOfflineMutations } from '@/shared/lib';

const PERSIST_STORAGE_KEY = 'nexus-rq-v1';
const PERSISTED_QUERY_ROOTS = new Set([
  appUserQueryKeys.all[0],
  programQueryKeys.all[0],
  dailyBiometricsQueryKeys.all[0],
  knowledgeNudgeQueryKeys.all[0],
  adherenceQueryKeys.all[0],
  workoutSessionQueryKeys.all[0],
]);

let persisterSingleton: ReturnType<
  typeof createSyncStoragePersister
> | null = null;

export function getQueryPersister(): ReturnType<
  typeof createSyncStoragePersister
> | null {
  if (typeof window === 'undefined') {
    return null;
  }
  if (!persisterSingleton) {
    persisterSingleton = createSyncStoragePersister({
      storage: window.localStorage,
      key: PERSIST_STORAGE_KEY,
    });
  }
  return persisterSingleton;
}

export function clearPersistedQueryClient(): void {
  void getQueryPersister()?.removeClient();
  clearOfflineMutations();
}

function shouldDehydrateNexusQuery(query: Query): boolean {
  return PERSISTED_QUERY_ROOTS.has(String(query.queryKey[0]));
}

const PERSIST_MAX_AGE_MS = 86_400_000; // 24 hours

export function buildPersistQueryOptions(): Omit<
  PersistQueryClientOptions,
  'queryClient'
> {
  const persister = getQueryPersister();
  if (!persister) {
    throw new Error('Query persister requires a browser environment.');
  }
  return {
    persister,
    maxAge: PERSIST_MAX_AGE_MS,
    dehydrateOptions: {
      shouldDehydrateQuery: shouldDehydrateNexusQuery,
    },
  };
}
