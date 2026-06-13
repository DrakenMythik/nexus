import { Loader2 } from 'lucide-react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useUserStore } from '@/entities/user';

export function AuthSessionGate() {
  const location = useLocation();
  const authHydrated = useUserStore((s) => s.authHydrated);
  const session = useUserStore((s) => s.session);

  if (!authHydrated) {
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
        <p className="text-xs text-muted-foreground">Checking your session.</p>
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
