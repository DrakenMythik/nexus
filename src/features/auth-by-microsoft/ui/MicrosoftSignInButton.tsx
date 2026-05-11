import { useState } from 'react';

import { useSupabase } from '@/shared/api';

import { signInWithMicrosoft } from '../api/sign-in';

export interface MicrosoftSignInButtonProps {
  className?: string;
}

export function MicrosoftSignInButton({
  className,
}: MicrosoftSignInButtonProps) {
  const client = useSupabase();
  const [pending, setPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onClick() {
    setErrorMessage(null);
    setPending(true);
    try {
      const { errorMessage: msg } = await signInWithMicrosoft(client);
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
        <svg
          aria-hidden
          className="h-5 w-5 shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M2 3h9v9H2V3zm11 0h9v9h-9V3zM2 14h9v7H2v-7zm11 0h9v7h-9v-7z" />
        </svg>
        {pending ? 'Connecting…' : 'Continue with Microsoft'}
      </button>
      {errorMessage ? (
        <p className="mt-2 text-xs text-amber-200/90" role="alert">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
