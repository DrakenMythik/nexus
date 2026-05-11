Secure Authentication & RLS — Architecture Blueprint (agent:architect)
This document is the deliverable for issue feat: Secure Authentication Setup - Core login infrastructure. It aligns README.md intended layout with .cursor/rules/02-fsd.mdc. No application code—only schema and file mapping.
1. Scope vs issue requirements
Requirement
Blueprint coverage
Task 1.1 SSO + Email (Apple, Google, Microsoft, Email/Password)
Supabase Dashboard OAuth apps + env vars; FSD feature slices per provider; pages compose features
Task 1.2 User data isolation (RLS)
SQL: profiles + domain tables with user_id; policies on auth.uid()
DoD: register / login / logout / delete for all four methods
Auth flows in features + entities/user; deletion documented (client sign-out + user deletion path—often Edge Function or Dashboard pattern for full cascade)
DoD: tests prove cross-user access denied
Test layout under cypress/ or e2e/ calling Supabase with two sessions (see §5)
FSD constraint: Features on the same layer must not import each other. The login/register page orchestrates multiple features via composition only (imports each feature’s public API from its index.ts).
2. Supabase SQL schema (exact objects to create)
Place in [supabase/migrations/](supabase/migrations/) as one or more migrations (exact filename TBD when implementing). Below is the logical schema to implement.

2.1 Prerequisites (implicit in Supabase)
auth.users (managed by Supabase Auth)—source of truth for identity.
Enable Email provider and OAuth providers (Google, Apple, Microsoft) in project settings; redirect URLs for local + production PWA.
2.2 public.profiles
Binds app-visible user metadata to auth.users.id (common pattern for RLS-friendly auth.uid() checks on a single-row-per-user table).
Column
Type
Notes
id
uuid
PK, references auth.users(id) on delete cascade
display_name
text
nullable
created_at
timestamptz
default now()
updated_at
timestamptz
default now()
alter table public.profiles enable row level security;
Policies (authenticated role): SELECT/INSERT/UPDATE/DELETE where auth.uid() = id (insert/update with check same predicate).
2.3 Trigger: new auth user → profile row
Function e.g. public.handle_new_user() security definer, set search_path = public
Trigger on auth.users after insert—insert matching public.profiles row
Keeps registration consistent for all providers
2.4 Representative health / workout tables (RLS proof + MVP foundation)
Minimum viable tables so Task 1.2 and automated tests are meaningful (adjust names to match your domain vocabulary in docs/ later).
Option A — single generic placeholder (fastest for tests):

public.user_owned_records (or private_health_snapshots): id uuid pk default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, payload jsonb or narrow columns, created_at timestamptz default now()
Option B — closer to product language:

public.workout_sessions: id, user_id, started_at, …  
public.health_metrics: id, user_id, recorded_at, …
For each table:

user_id uuid not null references auth.users(id) on delete cascade
enable row level security
Policies: SELECT/INSERT/UPDATE/DELETE using auth.uid() = user_id (insert/update with with check)
2.5 Indexes
create index ... on <table> (user_id); for typical queries
2.6 Grants
Grant intended roles (typically `authenticated`) with RLS; do not leave `anon` with table privileges by default—`REVOKE` from `anon` unless anonymous access is explicitly required. Avoid blanket `ALL` without RLS unless intentional.
2.7 Account deletion (data layer)
FK on delete cascade from domain tables and profiles to auth.users ensures DB rows disappear when the auth user is removed via service role path.
Implementing “delete my account” in the app often requires a secured Edge Function (service role) or Supabase-supported admin API flow—call out as a follow-up migration/function in implementation; schema above stays valid.
3. ER diagram (conceptual)
erDiagram
  auth_users["auth.users"] ||--|| profiles : "id"
  auth_users ||--o{ workout_or_health : "user_id"
  profiles {
    uuid id PK_FK
    text display_name
    timestamptz created_at
    timestamptz updated_at
  }
  workout_or_health {
    uuid id PK
    uuid user_id FK
    timestamptz created_at
  }
4. FSD directory and file map (target layout)
Root follows README.md: [src/](src/) with FSD layers. Barrel file index.ts per slice where a public API is exposed.

4.1 src/app/ — global wiring
Path
Responsibility
[src/app/providers/SupabaseProvider.tsx](src/app/providers/SupabaseProvider.tsx) (or alongside existing [src/app/App.tsx](src/app/App.tsx))
React context providing Supabase client + session subscription
[src/app/providers/AuthSessionGate.tsx](src/app/providers/AuthSessionGate.tsx) (optional)
Redirect unauthenticated users away from protected routes
[src/main.tsx](src/main.tsx)
Already exists—wrap with providers
Rule: Initialize one browser Supabase client here or inject from below; avoid duplicate clients.

4.2 src/shared/ — domain-agnostic only
Path
Allowed
[src/shared/api/supabase-client.ts](src/shared/api/supabase-client.ts)
Create client from import.meta.env.VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY only—no signIn* calls
[src/shared/config/env.ts](src/shared/config/env.ts)
Typed env accessors
[src/shared/ui/...](src/shared/ui/)
Buttons, inputs, layout primitives for auth forms
Rule (from issue): No signInWithOAuth, signInWithPassword, or domain-specific queries here.

4.3 src/entities/user/ — model + data access for profiles
Path
Responsibility
[src/entities/user/model/types.ts](src/entities/user/model/types.ts)
Profile, UserId types
[src/entities/user/model/store.ts](src/entities/user/model/store.ts)
Zustand (or React Query keys) for cached profile/session snapshot
[src/entities/user/api/profile-queries.ts](src/entities/user/api/profile-queries.ts)
getProfile, upsertProfile using Supabase client passed in or from context—entity-level data access
[src/entities/user/index.ts](src/entities/user/index.ts)
Barrel exports
4.4 src/features/ — one slice per auth method (no cross-imports)
Slice
Suggested files
[src/features/auth-by-email/](src/features/auth-by-email/)
model/types.ts, api/sign-in.ts, api/sign-up.ts, api/sign-out.ts, api/delete-account.ts (thin wrappers calling Supabase Auth), ui/EmailAuthForm.tsx, index.ts
[src/features/auth-by-google/](src/features/auth-by-google/)
api/sign-in.ts (signInWithOAuth provider google), ui/GoogleSignInButton.tsx, index.ts
[src/features/auth-by-microsoft/](src/features/auth-by-microsoft/)
Same pattern, provider azure (Azure AD per Supabase naming)
[src/features/auth-by-apple/](src/features/auth-by-apple/)
Same pattern, provider apple
OAuth callback: Route handler or dedicated page under pages/ that completes session exchange if your flow requires it (Supabase PKCE flow often lands on /auth/callback).

4.5 src/pages/ — route assembly
Path
Responsibility
[src/pages/login-page/LoginPage.tsx](src/pages/login-page/LoginPage.tsx)
Compose email form + OAuth buttons from features
[src/pages/register-page/RegisterPage.tsx](src/pages/register-page/RegisterPage.tsx)
Registration variant
[src/pages/auth-callback-page/AuthCallbackPage.tsx](src/pages/auth-callback-page/AuthCallbackPage.tsx)
OAuth redirect handling if needed
Pages may import widgets for layout but must not duplicate provider-specific API calls.

4.6 src/widgets/ (optional for this epic)
Path
Responsibility
[src/widgets/auth-panel/AuthPanel.tsx](src/widgets/auth-panel/AuthPanel.tsx)
Groups login UI; imports only from features/* and shared/ui
4.7 Environment
Path
Responsibility
[.env.local](.env.local)
VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, optional redirect URL notes
5. Automated tests (RLS + auth DoD)
Not application code in this blueprint, but locations and intent:
Artifact
Purpose
Cypress (see repo skill [.cursor/skills/cypress-tester/SKILL.md](.cursor/skills/cypress-tester/SKILL.md)) or integration suite
E2E: login flows per provider where testable; email/password fully automatable
Second-user / JWT test
Use Supabase REST or JS client with User A token: select on User B’s user_id row → 0 rows or error per policy
Migration against local Supabase
supabase db lint / advisors after migrations per [.cursor/skills/architect-planning/SKILL.md](.cursor/skills/architect-planning/SKILL.md)
6. Dependency
[@supabase/supabase-js](https://www.npmjs.com/package/@supabase/supabase-js)—verify version in [package.json](package.json) when implementing.
7. Implementation ordering (for agent:coder later)
Add supabase/ migrations for §2 → validate locally.
.env.example + shared Supabase client + app provider.
entities/user + profiles read path.
Four feature slices + login/register pages.
Tests for RLS and critical auth paths.
Review checkpoints for you
Confirm OAuth provider IDs (e.g. Azure as azure) match your Supabase project settings.
Choose Option A vs B for §2.4 domain tables for the first migration.
Confirm account deletion strategy (client-only vs Edge Function) before coding delete-account.