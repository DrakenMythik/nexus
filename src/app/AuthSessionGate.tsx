import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useUserStore } from '@/entities/user';

export function AuthSessionGate() {
  const location = useLocation();
  const authHydrated = useUserStore((s) => s.authHydrated);
  const session = useUserStore((s) => s.session);

  if (!authHydrated) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm font-medium text-slate-200">Loading…</p>
        <p className="text-xs text-slate-500">Checking your session.</p>
      </div>
    );
  }

  if (!session) {
    return (
      <Navigate to="/login" replace state={{ from: location }} />
    );
  }

  return <Outlet />;
}
