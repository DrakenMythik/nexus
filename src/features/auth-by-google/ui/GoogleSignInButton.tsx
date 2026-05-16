import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

import { useSupabase } from '@/shared/api';
import { Button } from '@/shared/ui';

import { signInWithGoogle } from '../api/sign-in';

export interface GoogleSignInButtonProps {
  className?: string;
}

export function GoogleSignInButton({ className }: GoogleSignInButtonProps) {
  const client = useSupabase();
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    try {
      const { errorMessage } = await signInWithGoogle(client);
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
        <span aria-hidden className="text-lg leading-none">
          G
        </span>
      )}
      {pending ? 'Connecting' : 'Continue with Google'}
    </Button>
  );
}
