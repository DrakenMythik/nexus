import { useState } from 'react';

import { useSupabase } from '@/shared/api';

import { signInWithGoogle } from '../api/sign-in';

export interface GoogleSignInButtonProps {
  className?: string;
}

export function GoogleSignInButton({ className }: GoogleSignInButtonProps) {
  const client = useSupabase();
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onClick() {
    setErrorMessage(null);
    setPending(true);
    try {
      const { errorMessage: msg } = await signInWithGoogle(client);
      if (msg) {
        setErrorMessage(msg);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <div className={className}>
      <button
        type="button"
        disabled={pending}
        onClick={() => {
          void onClick();
        }}
        className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-600 bg-slate-900 px-3 py-2 text-sm font-medium text-slate-100 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <span aria-hidden className="text-lg leading-none">
          G
        </span>
        {pending ? 'Connecting…' : 'Continue with Google'}
      </button>
      {errorMessage ? (
        <p className="mt-2 text-xs text-amber-200/90" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
