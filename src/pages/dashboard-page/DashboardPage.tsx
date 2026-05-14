import { useProfileQuery, useUserStore } from '@/entities/user';

export function DashboardPage() {
  const userId = useUserStore((s) => s.userId);
  const authHydrated = useUserStore((s) => s.authHydrated);
  const { data, isPending } = useProfileQuery();

  const readyForName = authHydrated && Boolean(userId) && !isPending;
  const name = data?.display_name?.trim();

  return (
    <div className="space-y-2">
      {readyForName && name ? (
        <p className="text-lg font-medium text-foreground">Hello, {name}</p>
      ) : null}
      <p className="text-sm text-muted-foreground">
        Nexus Dashboard (Protected)
      </p>
    </div>
  );
}
