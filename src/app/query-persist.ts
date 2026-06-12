import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import type { Query } from '@tanstack/react-query';
import type { PersistQueryClientOptions } from '@tanstack/react-query-persist-client';

import { appUserQueryKeys } from '@/entities/user';

const PERSIST_STORAGE_KEY = 'nexus-rq-v1';
const APP_USER_ROOT = appUserQueryKeys.all[0];

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
}

function shouldDehydrateAppUserQuery(query: Query): boolean {
  return query.queryKey[0] === APP_USER_ROOT;
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
      shouldDehydrateQuery: shouldDehydrateAppUserQuery,
    },
  };
}
