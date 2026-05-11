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
}

export type AuthEmailResult = AuthEmailSuccess | AuthEmailFailure;
