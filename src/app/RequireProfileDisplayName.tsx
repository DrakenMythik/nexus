import { Navigate, Outlet } from 'react-router-dom';

import { useProfileQuery, useUserStore } from '@/entities/user';

function ProfileGateLoading() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-center">
      <p className="text-sm font-medium text-slate-200">Loading…</p>
      <p className="text-xs text-slate-500">Loading your profile.</p>
    </div>
  );
}

export function RequireProfileDisplayName() {
  const authHydrated = useUserStore((s) => s.authHydrated);
  const userId = useUserStore((s) => s.userId);
  const { data, isPending, isError, error } = useProfileQuery();

  if (!authHydrated) {
    return <ProfileGateLoading />;
  }

  if (!userId) {
    return <ProfileGateLoading />;
  }

  if (isPending) {
    return <ProfileGateLoading />;
  }

  if (isError) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm font-medium text-amber-200">Could not load profile</p>
        <p className="text-xs text-slate-500">{error?.message ?? 'Unknown error'}</p>
      </div>
    );
  }

  if (!data?.display_name?.trim()) {
    return <Navigate to="/complete-profile" replace />;
  }

  return <Outlet />;
}
