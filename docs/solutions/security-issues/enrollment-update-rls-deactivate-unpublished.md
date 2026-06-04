---
title: "Program enrollment switch: UPDATE RLS blocked deactivate; stale cache on partial enroll"
module: u2-mvp-entities-program
date: 2026-06-04
category: security-issues
problem_type: security_issue
component: database
severity: medium
symptoms:
  - "Switching programs fails when the current enrollment references an unpublished program"
  - "enrollInProgram errors on deactivate even though the client only sets is_active=false"
  - "UI shows the old active enrollment after deactivate succeeds but insert fails"
root_cause: missing_permission
resolution_type: migration
tags:
  - supabase
  - rls
  - postgres
  - user-program-enrollments
  - u2-mvp
  - entities-program
  - react-query
  - enrollInProgram
---

# Program enrollment switch: UPDATE RLS blocked deactivate; stale cache on partial enroll

## Problem

The U2 `entities/program` slice implements program switching with `enrollInProgram` in
`src/entities/program/api/enrollment-queries.ts`: deactivate any active enrollment,
then insert a new active row. Code review on PR #75 surfaced two defects that broke
switching and misled the UI. Non-transactional deactivate-then-insert is **accepted
for MVP**; a follow-up will add automatic retry and a **"Not synced"** indicator when
local state and the server disagree. Atomic enroll via Postgres RPC remains deferred
per `docs/plans/2026-06-03-002-feat-u2-program-entity-slice-plan.md` (U2-KTD-4).

## Symptoms

- User tries to enroll in a published program B while still active on program A; the
  mutation fails on the **deactivate** step when A was unpublished after enrollment,
  even though B is visible in the catalog.
- After deactivate succeeds and insert fails, the dashboard still shows program A as
  active until a full refetch or remount.
- Database can temporarily have **zero** active enrollments (deactivate committed,
  insert did not). Errors propagate to the caller; there is no automatic retry yet.

## What Didn't Work

**Copying the INSERT publish gate onto every UPDATE.** U1 hardened
`user_program_enrollments` with `EXISTS (... programs.is_published = true)` on both
INSERT and UPDATE (`supabase/migrations/20260603120100_mvp_user_training.sql`). That
closes enrolling in draft programs but breaks **deactivation**: Postgres evaluates
`WITH CHECK` on the **new row image**. Setting `is_active = false` leaves `program_id`
pointing at an unpublished program, so the publish `EXISTS` fails and RLS rejects the
UPDATE. See also `docs/solutions/security-issues/supabase-rls-exists-fk-ownership-checks.md`
for the original FK/publish hardening context.

**`onSuccess`-only React Query invalidation.** `useEnrollInProgramMutation` in
`src/entities/program/api/use-enrollment.ts` refetched enrollment only when the full
mutation succeeded. Partial success (deactivate OK, insert error) left
`enrollmentQueryKeys.active(userId)` serving stale cache.

(session history) The U1 RLS matrix treated enrollment UPDATE like INSERT; the
deactivate-only path was not exercised until U2 wired `enrollInProgram` and review
simulated unpublish + switch.

## Solution

### 1. RLS: allow deactivate without publish check; keep gate for active rows

New migration `supabase/migrations/20260603130000_fix_enrollment_update_rls.sql`
replaces `user_program_enrollments_update_own`:

```sql
with check (
  (select auth.uid()) = user_id
  and (
    not is_active
    or exists (
      select 1
      from public.programs p
      where p.id = program_id
        and p.is_published = true
    )
  )
);
```

INSERT policy is unchanged: new enrollments still require a published `program_id`.

### 2. Invalidate enrollment cache on settle (success or error)

```typescript
onSettled: () => {
  void queryClient.invalidateQueries({
    queryKey: enrollmentQueryKeys.all,
  });
},
```

Runs after terminal mutation state so a failed insert still refetches active enrollment
(often `null` after deactivate-only).

### 3. Client enroll sequence (MVP)

```typescript
await client
  .from('user_program_enrollments')
  .update({ is_active: false })
  .eq('user_id', userId)
  .eq('is_active', true);

await client
  .from('user_program_enrollments')
  .insert({ user_id: userId, program_id: programId, is_active: true })
  .select()
  .single();
```

The unique partial index `user_program_enrollments_one_active_per_user` (U1) remains
the backstop for concurrent enroll races. `userId` is passed explicitly into query/hook
APIs so `entities/program` never imports `entities/user` (FSD).

Tests in `src/entities/program/api/enrollment-queries.test.ts` assert deactivate
payload `{ is_active: false }`, call order `update` then `insert`, and error
propagation when insert fails after deactivate.

## Why This Works

- **RLS:** `NOT is_active` short-circuits the publish check for deactivation updates, so
  flipping `is_active` to `false` succeeds even when `program_id` references an
  unpublished program. Rows that stay `is_active = true` still require a published
  program.
- **Cache:** `onSettled` refetches after errors, aligning UI with deactivate-only DB
  state until retry/sync UX ships.
- **MVP tradeoff:** Two client round trips without a transaction can leave zero active
  rows; the product accepts that until RPC + **Not synced** / auto-retry.

## Prevention

1. **UPDATE policies with catalog FKs:** Split "deactivate / unlink" (`NOT is_active`)
   from "stay active / rebind" (publish `EXISTS`). Do not reuse INSERT `WITH CHECK`
   verbatim on UPDATE.
2. **Multi-step mutations:** Use `onSettled` (or invalidate on `onError` too) when an
   early step can commit before a later step fails.
3. **Review checklist:** Unpublish program → switch enrollment → deactivate UPDATE must
   pass; insert-after-deactivate failure must refresh UI.
4. **Future (post-MVP):** Atomic `enroll_in_program` RPC (blueprint migration); client
   auto-retry + **Not synced** when enrollment read disagrees with expected local state.

## Related Issues

- Prior learning: `docs/solutions/security-issues/supabase-rls-exists-fk-ownership-checks.md`
- U2 plan: `docs/plans/2026-06-03-002-feat-u2-program-entity-slice-plan.md` (U2-KTD-4, U2-KTD-5)
- U1 migration: `supabase/migrations/20260603120100_mvp_user_training.sql`
- Fix migration: `supabase/migrations/20260603130000_fix_enrollment_update_rls.sql`
- App API: `src/entities/program/api/enrollment-queries.ts`, `src/entities/program/api/use-enrollment.ts`
- PR #75 (`mvp/data-foundation`)
