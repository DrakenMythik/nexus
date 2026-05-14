import { Link } from 'react-router-dom';

import { AppleSignInButton } from '@/features/auth-by-apple';
import { EmailAuthForm } from '@/features/auth-by-email';
import { GoogleSignInButton } from '@/features/auth-by-google';
import { MicrosoftSignInButton } from '@/features/auth-by-microsoft';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  Separator,
} from '@/shared/ui';

export function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <h1 className="text-2xl font-semibold tracking-tight">Create account</h1>
        <CardDescription>
          Sign up with email or continue with a provider.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <EmailAuthForm variant="register" />

        <div className="relative">
          <Separator />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs uppercase tracking-wide text-muted-foreground">
            Or continue with
          </span>
        </div>

        <div className="space-y-3">
          <GoogleSignInButton />
          <AppleSignInButton />
          <MicrosoftSignInButton />
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
