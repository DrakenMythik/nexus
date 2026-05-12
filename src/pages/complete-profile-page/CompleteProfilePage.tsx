import { useQueryClient } from '@tanstack/react-query';
import { type FormEvent, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import {
  profileQueryKeys,
  upsertProfile,
  useProfileQuery,
  useUserStore,
} from '@/entities/user';
import { useSupabase } from '@/shared/api';

export function CompleteProfilePage() {
  const client = useSupabase();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const userId = useUserStore((s) => s.userId);
  const { data: profile, isPending } = useProfileQuery();

  const [displayName, setDisplayName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<
    { kind: 'error'; text: string } | null
  >(null);

  const existingName = profile?.display_name?.trim();

  if (isPending) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-center">
        <p className="text-sm font-medium text-slate-200">Loading…</p>
        <p className="text-xs text-slate-500">Loading your profile.</p>
      </div>
    );
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFeedback(null);
    const trimmed = displayName.trim();
    if (!trimmed) {
      setFeedback({ kind: 'error', text: 'Enter a display name.' });
      return;
    }
    setSubmitting(true);
    try {
      const updated = await upsertProfile(client, { display_name: trimmed });
      if (userId) {
        queryClient.setQueryData(profileQueryKeys.byUserId(userId), updated);
      }
      void navigate('/', { replace: true });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not save your profile.';
      setFeedback({ kind: 'error', text: message });
    } finally {
      setSubmitting(false);
    }
  }

  if (existingName) {
    return (
      <div className="space-y-8">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
            Profile complete
          </h1>
          <p className="mt-2 text-sm text-slate-400">
            You already have a display name set. Continue to the dashboard.
          </p>
        </header>
        <Link
          to="/"
          className="flex w-full items-center justify-center rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500"
        >
          Go to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
          Finish setting up
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Choose how we should greet you in the app. You can change this later.
        </p>
      </header>

      <form
        onSubmit={(ev) => {
          void onSubmit(ev);
        }}
        className="space-y-4"
        aria-labelledby="complete-profile-heading"
      >
        <h2 id="complete-profile-heading" className="sr-only">
          Display name
        </h2>
        <label
          className="block text-xs text-slate-400"
          htmlFor="complete-profile-display-name"
        >
          Display name
          <input
            id="complete-profile-display-name"
            type="text"
            name="displayName"
            autoComplete="nickname"
            required
            minLength={1}
            value={displayName}
            onChange={(ev) => setDisplayName(ev.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/40 focus:border-sky-500 focus:ring-2"
          />
        </label>
        {feedback ? (
          <p className="text-sm text-amber-200/90" role="alert">
            {feedback.text}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? 'Saving…' : 'Save and continue'}
        </button>
      </form>
    </div>
  );
}
