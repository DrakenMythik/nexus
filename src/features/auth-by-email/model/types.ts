import type { Session } from '@supabase/supabase-js';

export interface EmailPasswordCredentials {
  email: string;
  password: string;
}

export type AuthEmailErrorCode =
  | 'invalid_credentials'
  | 'network'
  | 'unknown';

export interface AuthEmailFailure {
  ok: false;
  code: AuthEmailErrorCode;
  message: string;
}

export interface AuthEmailSuccess {
  ok: true;
  /** Set by `signUpWithEmail`: null when email confirmation is required before a session exists. */
  session?: Session | null;
}

export type AuthEmailResult = AuthEmailSuccess | AuthEmailFailure;
