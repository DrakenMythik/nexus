import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { useSupabase } from '@/shared/api';
import { Button } from '@/shared/ui';

import { signInWithMicrosoft } from '../api/sign-in';

export interface MicrosoftSignInButtonProps {
  className?: string;
}

export function MicrosoftSignInButton({
  className,
}: MicrosoftSignInButtonProps) {
  const client = useSupabase();
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    try {
      const { errorMessage } = await signInWithMicrosoft(client);
      if (errorMessage) {
        toast.error(errorMessage);
      }
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      disabled={pending}
      onClick={() => {
        void onClick();
      }}
      className={className ? `w-full ${className}` : 'w-full'}
    >
      {pending ? (
        <Loader2 className="size-4 animate-spin" />
      ) : (
        <svg
          aria-hidden
          className="size-5 shrink-0"
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M2 3h9v9H2V3zm11 0h9v9h-9V3zM2 14h9v7H2v-7zm11 0h9v7h-9v-7z" />
        </svg>
      )}
      {pending ? 'Connecting' : 'Continue with Microsoft'}
    </Button>
  );
}
