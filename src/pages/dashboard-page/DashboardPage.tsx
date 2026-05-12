import { useUserStore } from '@/entities/user';

export function DashboardPage() {
  const profile = useUserStore((s) => s.profile);
  const name = profile?.display_name?.trim();

  return (
    <div className="space-y-2">
      {name ? (
        <p className="text-lg font-medium text-slate-100">Hello, {name}</p>
      ) : (
        <p className="text-sm text-slate-400">Loading…</p>
      )}
      <p className="text-sm text-slate-500">Nexus Dashboard (Protected)</p>
    </div>
  );
}
