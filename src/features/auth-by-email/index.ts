export type {
  AuthEmailErrorCode,
  AuthEmailFailure,
  AuthEmailResult,
  AuthEmailSuccess,
  EmailPasswordCredentials,
} from './model/types';
export {
  clearPendingVerificationEmail,
  PENDING_VERIFICATION_EMAIL_STORAGE_KEY,
  peekPendingVerificationEmail,
  persistPendingVerificationEmail,
} from './model/pending-verification-email';
export { signInWithEmail } from './api/sign-in';
export { signUpWithEmail } from './api/sign-up';
export { resendSignupEmail, type ResendSignupEmailResult } from './api/resend-signup-email';
export { signOut } from './api/sign-out';
export { deleteAccount, type DeleteAccountResult } from './api/delete-account';
export { EmailAuthForm, type EmailAuthFormProps } from './ui/EmailAuthForm';
