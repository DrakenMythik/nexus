import { Loader2 } from 'lucide-react';
import { Navigate, Outlet } from 'react-router-dom';

import {
  isAppUserOnboardingComplete,
  useAppUserQuery,
  useUserStore,
} from '@/entities/user';
import { Alert, AlertDescription } from '@/shared/ui';

function UserGateLoading() {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-center"
      role="status"
      aria-live="polite"
    >
      <Loader2
        aria-hidden
        className="size-6 animate-spin text-muted-foreground"
      />
      <p className="text-sm font-medium text-foreground">Loading…</p>
      <p className="text-xs text-muted-foreground">Loading your account.</p>
    </div>
  );
}

export function RequireCompleteUserProfile() {
  const authHydrated = useUserStore((s) => s.authHydrated);
  const userId = useUserStore((s) => s.userId);
  const { data, isPending, isError, error } = useAppUserQuery();

  if (!authHydrated) {
    return <UserGateLoading />;
  }

  if (!userId) {
    return <UserGateLoading />;
  }

  if (isPending) {
    return <UserGateLoading />;
  }

  if (isError) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center px-4 text-center">
        <Alert variant="destructive">
          <AlertDescription>
            {error?.message ?? 'Unknown error'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isAppUserOnboardingComplete(data)) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <Outlet />;
}
