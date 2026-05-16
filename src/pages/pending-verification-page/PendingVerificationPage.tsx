import { Loader2 } from 'lucide-react';
import { useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

import {
  clearPendingVerificationEmail,
  peekPendingVerificationEmail,
  resendSignupEmail,
} from '@/features/auth-by-email';
import { useSupabase } from '@/shared/api';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from '@/shared/ui';

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

  const [resending, setResending] = useState(false);

  const clearStorageAndNavigate = useCallback(() => {
    clearPendingVerificationEmail();
  }, []);

  const onResend = useCallback(async () => {
    if (!resolvedEmail) return;
    setResending(true);
    try {
      const result = await resendSignupEmail(client, resolvedEmail);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      toast.success(
        'We sent another confirmation email. Check your inbox and spam folder.',
      );
    } finally {
      setResending(false);
    }
  }, [client, resolvedEmail]);

  return (
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-semibold tracking-tight">
          Confirm your email
        </h1>
        <CardDescription>
          We sent a confirmation link
          {resolvedEmail ? (
            <>
              {' '}
              to{' '}
              <span className="font-medium text-foreground">
                {resolvedEmail}
              </span>
            </>
          ) : (
            ' to your inbox'
          )}
          . Open it on this device to finish setting up your account. Links can
          take a minute to arrive; check spam and promotions folders.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Button
          type="button"
          variant="outline"
          disabled={resending || !resolvedEmail}
          onClick={() => {
            void onResend();
          }}
          className="w-full"
        >
          {resending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Sending
            </>
          ) : (
            'Resend confirmation email'
          )}
        </Button>

        <p className="text-center text-sm text-muted-foreground">
          <Link
            to="/login"
            onClick={clearStorageAndNavigate}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Back to sign in
          </Link>
          {' · '}
          <Link
            to="/register"
            replace
            onClick={clearStorageAndNavigate}
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Use a different email
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
