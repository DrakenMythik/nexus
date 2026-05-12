import { type FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useSupabase } from '@/shared/api';

import { signInWithEmail } from '../api/sign-in';
import { signUpWithEmail } from '../api/sign-up';
import { persistPendingVerificationEmail } from '../model/pending-verification-email';

export interface EmailAuthFormProps {
  variant: 'login' | 'register';
  className?: string;
}

export function EmailAuthForm({ variant, className }: EmailAuthFormProps) {
  const client = useSupabase();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<
    | { kind: 'error'; text: string }
    | { kind: 'success'; text: string }
    | null
  >(null);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setFeedback(null);
    setSubmitting(true);
    try {
      const result =
        variant === 'login'
          ? await signInWithEmail(client, { email, password })
          : await signUpWithEmail(client, { email, password });

      if (!result.ok) {
        setFeedback({ kind: 'error', text: result.message });
        return;
      }

      if (variant === 'register') {
        const trimmedEmail = email.trim();
        if (result.session) {
          void navigate('/', { replace: true });
          return;
        }
        persistPendingVerificationEmail(trimmedEmail);
        void navigate('/register/pending-verification', {
          replace: true,
          state: { email: trimmedEmail },
        });
        return;
      }

      setFeedback({
        kind: 'success',
        text: "You're signed in.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  const title = variant === 'login' ? 'Email & password' : 'Create account';

  return (
    <form
      className={className}
      onSubmit={(e) => {
        void onSubmit(e);
      }}
      aria-labelledby="email-auth-heading"
    >
      <h2
        id="email-auth-heading"
        className="text-sm font-medium text-slate-200"
      >
        {title}
      </h2>
      <div className="mt-3 space-y-3">
        <label className="block text-xs text-slate-400" htmlFor="auth-email">
          Email
          <input
            id="auth-email"
            type="email"
            name="email"
            autoComplete="email"
            required
            value={email}
            onChange={(ev) => setEmail(ev.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/40 focus:border-sky-500 focus:ring-2"
          />
        </label>
        <label
          className="block text-xs text-slate-400"
          htmlFor="auth-password"
        >
          Password
          <input
            id="auth-password"
            type="password"
            name="password"
            autoComplete={
              variant === 'login' ? 'current-password' : 'new-password'
            }
            required
            minLength={6}
            value={password}
            onChange={(ev) => setPassword(ev.target.value)}
            className="mt-1 block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none ring-sky-500/40 focus:border-sky-500 focus:ring-2"
          />
        </label>
      </div>
      {feedback ? (
        <p
          className={
            feedback.kind === 'success'
              ? 'mt-3 text-sm text-emerald-300/90'
              : 'mt-3 text-sm text-amber-200/90'
          }
          role={feedback.kind === 'success' ? 'status' : 'alert'}
        >
          {feedback.text}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={submitting}
        className="mt-4 w-full rounded-md bg-sky-600 px-3 py-2 text-sm font-medium text-white hover:bg-sky-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {submitting
          ? 'Please wait…'
          : variant === 'login'
            ? 'Sign in'
            : 'Sign up'}
      </button>
    </form>
  );
}
