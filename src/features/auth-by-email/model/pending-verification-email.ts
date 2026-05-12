/** Survives refresh on `/register/pending-verification` without putting email in the URL. */
export const PENDING_VERIFICATION_EMAIL_STORAGE_KEY =
  'nexus_auth_pending_verification_email';

export function persistPendingVerificationEmail(email: string): void {
  const trimmed = email.trim();
  if (!trimmed) return;
  try {
    sessionStorage.setItem(PENDING_VERIFICATION_EMAIL_STORAGE_KEY, trimmed);
  } catch {
    // private mode / quota
  }
}

export function peekPendingVerificationEmail(): string | null {
  try {
    const v = sessionStorage.getItem(PENDING_VERIFICATION_EMAIL_STORAGE_KEY);
    const t = v?.trim();
    return t ? t : null;
  } catch {
    return null;
  }
}

export function clearPendingVerificationEmail(): void {
  try {
    sessionStorage.removeItem(PENDING_VERIFICATION_EMAIL_STORAGE_KEY);
  } catch {
    // ignore
  }
}
