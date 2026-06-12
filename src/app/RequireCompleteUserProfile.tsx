import { Navigate, Outlet } from 'react-router-dom';

import {
  isAppUserOnboardingComplete,
  useAppUserQuery,
  useUserStore,
} from '@/entities/user';

function UserGateLoading() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-center">
      <p className="text-sm font-medium text-slate-200">Loading…</p>
      <p className="text-xs text-slate-500">Loading your account.</p>
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
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm font-medium text-amber-200">Could not load account</p>
        <p className="text-xs text-slate-500">{error?.message ?? 'Unknown error'}</p>
      </div>
    );
  }

  if (!isAppUserOnboardingComplete(data)) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <Outlet />;
}
