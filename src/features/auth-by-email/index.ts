export type {
  AuthEmailErrorCode,
  AuthEmailFailure,
  AuthEmailResult,
  AuthEmailSuccess,
  EmailPasswordCredentials,
} from './model/types';
export { signInWithEmail } from './api/sign-in';
export { signUpWithEmail } from './api/sign-up';
export { signOut } from './api/sign-out';
export { deleteAccount, type DeleteAccountResult } from './api/delete-account';
export { EmailAuthForm, type EmailAuthFormProps } from './ui/EmailAuthForm';
