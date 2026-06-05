---
title: "MVP user training RLS: user_id-only WITH CHECK allowed FK and catalog bypass"
module: u1-mvp-data-foundation
date: 2026-06-03
last_refreshed: 2026-06-04
category: security-issues
problem_type: security_issue
component: database
severity: high
symptoms:
  - "set_logs INSERT/UPDATE passed when user_id matched auth.uid() but workout_session_id referenced another user's session"
  - "user_program_enrollments allowed insert/update for programs with is_published false"
  - "set_logs could set program_exercise_id to exercises on unpublished programs"
root_cause: missing_permission
resolution_type: migration
tags:
  - supabase
  - rls
  - postgres
  - u1-mvp
  - set-logs
  - user-program-enrollments
---

# MVP user training RLS: user_id-only WITH CHECK allowed FK and catalog bypass

## Problem

MVP user-training RLS in `supabase/migrations/20260603120100_mvp_user_training.sql` treated "own row" as `(select auth.uid()) = user_id` only. Postgres does not enforce FK ownership or catalog eligibility in policies; clients can supply arbitrary FK values on INSERT/UPDATE as long as the row `user_id` matches the JWT. That left cross-user session attachment, enrollment in unpublished programs, and binding set logs to draft catalog exercises.

## Symptoms

| Severity | Table / op | Attacker-controlled column | Effect |
|----------|------------|----------------------------|--------|
| P0 | `set_logs` INSERT | `workout_session_id` | Log sets against another user `workout_sessions` while `user_id` = self |
| P1 | `user_program_enrollments` INSERT/UPDATE | `program_id` | Enroll in unpublished (`is_published = false`) programs |
| P1 | `set_logs` UPDATE | `workout_session_id` | Reassign an existing log to a foreign session |
| P2 | `set_logs` INSERT/UPDATE | `program_exercise_id` | Reference exercises on draft/unpublished programs |

Policies were named `*_own` but only gated on `user_id`, so U1 plan acceptance criteria (cross-user JWT → zero peer rows) could fail for FK manipulation without a row-owner mismatch.

## What Didn't Work

**User-id-only `WITH CHECK` / `USING` on `*_own` policies** - sufficient for tables with no security-sensitive FKs (e.g. `readiness_checks` in the same migration), but not for `set_logs` (`workout_session_id`, optional `program_exercise_id`) or `user_program_enrollments` (`program_id` -> catalog `programs`).

Representative weak pattern:

```sql
-- set_logs_insert_own (insufficient)
with check ((select auth.uid()) = user_id);

-- user_program_enrollments_insert_own (insufficient)
with check ((select auth.uid()) = user_id);
```

`UPDATE` on `set_logs` had the same gap: `using` matched `user_id`, but `with check` did not re-validate `workout_session_id` or `program_exercise_id`.

(session history) Initial policies mirrored Feature 1.1 core tables (`profiles`, `workout_sessions`) where `user_id`-only RLS is enough; that pattern was copied into U1 without listing FK columns in the RLS matrix before ship.

## Solution

Hardened policies in `supabase/migrations/20260603120100_mvp_user_training.sql`:

**`set_logs` - session ownership + published catalog exercise (INSERT/UPDATE `with check`):**

```sql
(select auth.uid()) = user_id
and exists (
  select 1 from public.workout_sessions ws
  where ws.id = workout_session_id
    and ws.user_id = (select auth.uid())
)
and (
  program_exercise_id is null
  or exists (
    select 1 from public.program_exercises pe
    join public.program_days pd on pd.id = pe.program_day_id
    join public.programs p on p.id = pd.program_id
    where pe.id = program_exercise_id
      and p.is_published = true
  )
)
```

**`user_program_enrollments` — published program on INSERT; publish gate on UPDATE only while active:**

INSERT (`20260603120100_mvp_user_training.sql`, unchanged):

```sql
(select auth.uid()) = user_id
and exists (
  select 1 from public.programs p
  where p.id = program_id
    and p.is_published = true
)
```

UPDATE was first hardened with the same publish `EXISTS` on every change. That blocked
**deactivation** (`is_active = false`) when `program_id` still pointed at a program
later unpublished — breaking U2 `enrollInProgram`’s deactivate step. A follow-up migration
narrows UPDATE `WITH CHECK`:

`supabase/migrations/20260603130000_fix_enrollment_update_rls.sql`:

```sql
(select auth.uid()) = user_id
and (
  not is_active
  or exists (
    select 1 from public.programs p
    where p.id = program_id
      and p.is_published = true
  )
)
```

App-layer enroll switching, React Query `onSettled` invalidation, and MVP deferrals
(non-transactional enroll, future **Not synced** / auto-retry): see
`docs/solutions/security-issues/enrollment-update-rls-deactivate-unpublished.md`.

`SELECT`/`DELETE` policies remain `user_id`-only; catalog visibility for reads stays in `supabase/migrations/20260603120000_mvp_programs_catalog.sql`. New tables still get `grant … to authenticated` and `revoke all … from anon` at the end of the migration.

**Verified:** `npm run db:reset`, `npm run db:lint` (including after `20260603130000`).

## Why This Works

RLS `WITH CHECK` runs on the **new row image** for INSERT and on the **updated row** for UPDATE. `EXISTS` subqueries tie each FK column to an authoritative row the caller is allowed to use: `workout_sessions.user_id` for session scope, `programs.is_published` for new enrollments and for catalog exercises via `program_exercises -> program_days -> programs`. For enrollments, `NOT is_active` on UPDATE allows deactivation without re-checking publish on a stale `program_id`. An attacker cannot satisfy the policy with another user session ID or an unpublished program/exercise on INSERT/active UPDATE while keeping `user_id = auth.uid()`. Nullable `program_exercise_id` is explicitly allowed when null; otherwise the join enforces the same publish gate as catalog SELECT (aligned with U1-KTD-2 in the U1 plan).

## Prevention

Checklist for future Nexus RLS on user-owned rows with FKs:

1. **List every FK on the table** in the migration/plan; mark each as "must match caller" or "catalog eligibility."
2. **`user_id = auth.uid()` is necessary, not sufficient** whenever INSERT/UPDATE sets FKs the client controls.
3. **Put FK validation in `WITH CHECK`** for INSERT and UPDATE (not only `USING` on UPDATE).
4. **Validate ownership on the parent row** (`exists (… parent.user_id = auth.uid())`), not only that the FK id exists.
5. **Catalog FKs:** join to `programs` (or equivalent) and enforce `is_published = true` in policy, mirroring `20260603120000_mvp_programs_catalog.sql`.
6. **Enrollment UPDATE:** require publish only when the row stays `is_active = true`; allow `NOT is_active` so deactivate succeeds when `program_id` references an unpublished program (see `20260603130000_fix_enrollment_update_rls.sql`).
7. **Name policies honestly** - `*_own` should mean row owner and allowed FK targets.
8. **Threat-model INSERT and UPDATE separately** (reassignment on UPDATE is easy to miss; deactivate-only updates are a third shape).
9. **Run `npm run db:reset` and `npm run db:lint`** after migration edits; spot-check with a second-user JWT per plan AE2.
10. **Blueprint first** per `AGENTS.md`: plan/ERD must call out FK-aware RLS before editing `supabase/migrations/`.
11. **Run `/ce-code-review`** on migration PRs before merge; tiered review surfaced FK gaps (U1) and the enrollment UPDATE deactivate regression (U2).

## Related Issues

- Implementation plan: `docs/plans/2026-06-03-001-feat-u1-mvp-data-foundation-plan.md` (R3 RLS matrix, U1-KTD-2, verification AE2).
- Adherence blueprint: `docs/plans/2026-06-02-001-feat-mvp-adherence-loop-plan.md` (KTD-8 RLS posture).
- Requirements: `docs/brainstorms/2026-06-03-individualized-target-weight-requirements.md` (R3, AE2, KD-7).
- Catalog RLS precedent: `supabase/migrations/20260603120000_mvp_programs_catalog.sql`.
- Enrollment UPDATE follow-up: `supabase/migrations/20260603130000_fix_enrollment_update_rls.sql`.
- U2 app slice + partial enroll UX: `docs/solutions/security-issues/enrollment-update-rls-deactivate-unpublished.md`, `src/entities/program/api/enrollment-queries.ts`.
- Core RLS patterns (no FK-in-policy examples): `supabase/migrations/20260509191000_core_profiles_workout_health_rls.sql`, `supabase/migrations/20260510120000_revoke_anon_select.sql`.
- GitHub issue #26 (Secure Authentication Setup; auth/RLS baseline; no U1-specific issue yet).

**Out of scope for this fix (document for future hardening):** `set_logs` does not require `program_exercise_id` to belong to the user's active enrollment (any published catalog exercise is allowed). After a program is unpublished, existing rows remain readable via `user_id`-only SELECT; `set_logs` UPDATE may still fail the publish `WITH CHECK` (same pattern as enrollment before `20260603130000`).
