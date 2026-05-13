import { useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

import {
  clearPendingVerificationEmail,
  peekPendingVerificationEmail,
  resendSignupEmail,
} from '@/features/auth-by-email';
import { useSupabase } from '@/shared/api';

function emailFromLocationState(state: unknown): string {
  if (typeof state !== 'object' || state === null || !('email' in state)) {
    return '';
  }
  const record = state as Record<string, unknown>;
  return typeof record.email === 'string' ? record.email.trim() : '';
}

export function PendingVerificationPage() {
  const client = useSupabase();
  const location = useLocation();
  const stateEmail = emailFromLocationState(location.state);
  const storageEmail = peekPendingVerificationEmail();
  const resolvedEmail = (stateEmail || storageEmail || '').trim();

  const [resendFeedback, setResendFeedback] = useState<
    | { kind: 'success'; text: string }
    | { kind: 'error'; text: string }
    | null
  >(null);
  const [resending, setResending] = useState(false);

  const clearStorageAndNavigate = useCallback(() => {
    clearPendingVerificationEmail();
  }, []);

  const onResend = useCallback(async () => {
    if (!resolvedEmail) return;
    setResendFeedback(null);
    setResending(true);
    try {
      const result = await resendSignupEmail(client, resolvedEmail);
      if (!result.ok) {
        setResendFeedback({ kind: 'error', text: result.message });
        return;
      }
      setResendFeedback({
        kind: 'success',
        text: 'We sent another confirmation email. Check your inbox and spam folder.',
      });
    } finally {
      setResending(false);
    }
  }, [client, resolvedEmail]);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
          Confirm your email
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          We sent a confirmation link
          {resolvedEmail ? (
            <>
              {' '}
              to <span className="font-medium text-slate-200">{resolvedEmail}</span>
            </>
          ) : (
            ' to your inbox'
          )}
          . Open it on this device to finish setting up your account. Links can
          take a minute to arrive; check spam and promotions folders.
        </p>
      </header>

      <div className="space-y-3">
        <button
          type="button"
          disabled={resending || !resolvedEmail}
          onClick={() => {
            void onResend();
          }}
          className="w-full rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {resending ? 'Sending…' : 'Resend confirmation email'}
        </button>
        {resendFeedback ? (
          <p
            className={
              resendFeedback.kind === 'success'
                ? 'text-sm text-emerald-300/90'
                : 'text-sm text-amber-200/90'
            }
            role={resendFeedback.kind === 'success' ? 'status' : 'alert'}
          >
            {resendFeedback.text}
          </p>
        ) : null}
      </div>

      <p className="text-center text-sm text-slate-400">
        <Link
          to="/login"
          onClick={clearStorageAndNavigate}
          className="font-medium text-sky-400 underline-offset-2 hover:text-sky-300 hover:underline"
        >
          Back to sign in
        </Link>
        {' · '}
        <Link
          to="/register"
          replace
          onClick={clearStorageAndNavigate}
          className="font-medium text-sky-400 underline-offset-2 hover:text-sky-300 hover:underline"
        >
          Use a different email
        </Link>
      </p>
    </div>
  );
}
