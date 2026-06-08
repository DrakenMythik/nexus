---
title: Supabase email confirmation links redirect to localhost on production
date: 2026-06-07
category: integration-issues
module: auth-by-email
problem_type: integration_issue
component: authentication
symptoms:
  - "Supabase signup confirmation email opens localhost instead of the Vercel deployment URL"
  - "Resend confirmation from production worked after code fix; initial signup emails still used Site URL fallback before fix"
  - "@typescript-eslint/no-unsafe-assignment CI failure when asserting emailRedirectTo with expect.stringMatching"
root_cause: logic_error
resolution_type: code_fix
severity: high
tags:
  - supabase
  - auth
  - email-confirmation
  - vercel
  - emailRedirectTo
  - vitest
  - eslint
related_components:
  - supabase-dashboard
  - github-actions
---

# Supabase email confirmation links redirect to localhost on production

## Problem

After deploying Nexus to Vercel and registering with email/password, the Supabase confirmation email sent users to `localhost` (or `127.0.0.1:5173`) instead of the production PWA URL. Users could not complete email verification from their inbox.

## Symptoms

- Confirmation link in the signup email targets `http://127.0.0.1:5173` or similar local dev origin.
- Issue appears only on hosted Supabase + Vercel; local dev signup may appear fine.
- Follow-up CI failure on branch `mvp/local-host-fix`: ESLint `@typescript-eslint/no-unsafe-assignment` at `sign-up.test.ts` line 28 when using `expect.stringMatching()` inside a `toHaveBeenCalledWith` object literal.

## What Didn't Work

- Relying on Supabase Dashboard **Site URL** alone without passing `emailRedirectTo` from the client on initial signup — resend already passed the correct origin, but signup did not, so only the first email was wrong.
- Using `expect.stringMatching(/\/auth\/callback$/)` as a property value in Vitest matchers — passes tests locally but fails strict ESLint in CI because the matcher is typed as `any`.

## Solution

### 1. Pass `emailRedirectTo` on signup (code fix)

Extract a shared helper and use it for both signup and resend:

```typescript
// src/features/auth-by-email/lib/auth-callback-redirect-url.ts
export function authCallbackRedirectUrl(): string {
  if (typeof window === 'undefined') {
    return '/auth/callback';
  }
  return `${window.location.origin}/auth/callback`;
}
```

```typescript
// src/features/auth-by-email/api/sign-up.ts (before)
const { data, error } = await client.auth.signUp({ email, password });

// after
const { data, error } = await client.auth.signUp({
  email,
  password,
  options: { emailRedirectTo: authCallbackRedirectUrl() },
});
```

When the user signs up from Vercel, `window.location.origin` is the production URL, so the confirmation email embeds the correct callback.

### 2. Allow-list production callback in Supabase Dashboard (config)

In **Authentication → URL Configuration** for the hosted project:

| Setting | Value |
|---------|--------|
| **Site URL** | `https://<vercel-app>.vercel.app` |
| **Redirect URLs** | `https://<vercel-app>.vercel.app/auth/callback` |
| | Keep `http://127.0.0.1:5173/auth/callback` for local dev |

Supabase rejects or ignores redirect targets not in this list even when the client passes `emailRedirectTo`.

### 3. CI-safe test assertion (test fix)

Assert mock call args in separate steps with an explicit type instead of inline asymmetric matchers:

```typescript
expect(signUp).toHaveBeenCalledOnce();
const signUpArgs = signUp.mock.calls[0]?.[0] as {
  email: string;
  password: string;
  options: { emailRedirectTo: string };
};
expect(signUpArgs.options.emailRedirectTo).toMatch(/\/auth\/callback$/);
```

## Why This Works

Supabase Auth uses this priority for email confirmation redirects:

1. `options.emailRedirectTo` from the client call (if allow-listed).
2. Project **Site URL** when `emailRedirectTo` is omitted.

`resendSignupEmail` already passed `emailRedirectTo` using the current page origin; `signUpWithEmail` did not. Omission caused Supabase to fall back to **Site URL**, which was still set to local dev (`http://127.0.0.1:5173` in `supabase/config.toml` and likely mirrored in the hosted dashboard). The code fix makes signup behave like resend. Dashboard config ensures production URLs are allow-listed.

## Prevention

- **Parity rule:** Any Supabase auth call that sends email links (`signUp`, `resend`, password reset) must pass `emailRedirectTo` (or equivalent) using the current origin — never assume Site URL matches deployment.
- **Spec alignment:** `docs/specs/feature-1.1.md` documents resend with `emailRedirectTo`; keep signup in sync when editing auth flows.
- **Test style:** Under `@typescript-eslint/no-unsafe-assignment`, avoid assigning Vitest matchers (`expect.stringMatching`, `expect.any`) inside object literals; inspect `mock.calls` with typed args instead.
- **Deploy checklist:** When adding a new hosting URL, update Supabase redirect allow list before testing email auth.
- **Re-test with fresh email:** Old confirmation emails retain the baked-in localhost URL; resend or register a new user after deploy.

## Related Issues

- Branch: `mvp/local-host-fix` (commits `28e499a`, `26542af`)
- Spec: `docs/specs/feature-1.1.md` (email confirmation UX)
- Local auth config reference: `supabase/config.toml` `[auth]` `site_url` / `additional_redirect_urls`
- OAuth sign-in paths already use `window.location.origin` for `redirectTo` in `auth-by-google`, `auth-by-microsoft`, `auth-by-apple`
