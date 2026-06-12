import { appUserGreetingName, useAppUserQuery, useUserStore } from '@/entities/user';

export function DashboardPage() {
  const userId = useUserStore((s) => s.userId);
  const authHydrated = useUserStore((s) => s.authHydrated);
  const { data, isPending } = useAppUserQuery();

  const readyForName = authHydrated && Boolean(userId) && !isPending;
  const name = appUserGreetingName(data);

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
