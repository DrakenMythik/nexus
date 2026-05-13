import { Link } from 'react-router-dom';

import { AppleSignInButton } from '@/features/auth-by-apple';
import { EmailAuthForm } from '@/features/auth-by-email';
import { GoogleSignInButton } from '@/features/auth-by-google';
import { MicrosoftSignInButton } from '@/features/auth-by-microsoft';

export function LoginPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-100">
          Sign in
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          Welcome back. Use email or a linked provider.
        </p>
      </header>

      <EmailAuthForm variant="login" />

      <div className="relative">
        <div
          className="absolute inset-0 flex items-center"
          aria-hidden
        >
          <div className="w-full border-t border-slate-700" />
        </div>
        <div className="relative flex justify-center text-xs uppercase tracking-wide">
          <span className="bg-slate-950 px-2 text-slate-500">
            Or continue with
          </span>
        </div>
      </div>

      <div className="space-y-3">
        <GoogleSignInButton />
        <AppleSignInButton />
        <MicrosoftSignInButton />
      </div>

      <p className="text-center text-sm text-slate-400">
        No account?{' '}
        <Link
          to="/register"
          className="font-medium text-sky-400 underline-offset-2 hover:text-sky-300 hover:underline"
        >
          Create one
        </Link>
      </p>
    </div>
  );
}
