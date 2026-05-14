import { Loader2 } from 'lucide-react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { useSupabase } from '@/shared/api';

export function AuthCallbackPage() {
  const supabase = useSupabase();
  const navigate = useNavigate();

  useEffect(() => {
    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let unsubscribe: (() => void) | undefined;

    const go = (to: '/' | '/login') => {
      if (cancelled) return;
      void navigate(to, { replace: true });
    };

    void (async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (cancelled) return;

      if (error) {
        go('/login');
        return;
      }

      if (session) {
        go('/');
        return;
      }

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        if (cancelled || !nextSession) return;
        subscription.unsubscribe();
        if (timeoutId !== undefined) clearTimeout(timeoutId);
        go('/');
      });

      unsubscribe = () => subscription.unsubscribe();

      timeoutId = window.setTimeout(() => {
        unsubscribe?.();
        go('/login');
      }, 10_000);
    })();

    return () => {
      cancelled = true;
      unsubscribe?.();
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, [navigate, supabase]);

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
      <p className="text-sm font-medium text-foreground">
        Completing sign in
      </p>
      <p className="text-xs text-muted-foreground">Connecting your session.</p>
    </div>
  );
}
