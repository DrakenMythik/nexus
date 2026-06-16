---
title: Program library dashboard card and enroll-or-switch flow
date: 2026-06-16
category: architecture-patterns
module: workout-session
problem_type: architecture_pattern
component: frontend_stimulus
severity: medium
applies_when:
  - "Adding user-visible program choice on top of an existing seeded catalog"
  - "One active enrollment per user must support switching without a migration"
  - "Dashboard needs a navigation surface to a browse-and-enroll page"
tags:
  - program-library
  - enrollment
  - dashboard
  - fsd
  - react-router
  - cypress
related_components:
  - program-entity
  - dashboard-page
---

# Program library dashboard card and enroll-or-switch flow

## Context

Nexus MVP-1 requires serving today's session from a preset program, but the app only exposed catalog data through APIs and a silent "Begin Starting Strength" fallback on the dashboard. Users could not browse seeded templates (e.g. 3 Day Push PPL), switch after first enrollment, or see which plan they were on. `handleStartWorkout` also auto-enrolled the heuristic default program even when the user had browsed a different template.

The fix connects three surfaces: a dashboard program card, a `/programs` library page, and a single enroll-or-switch mutation in the workout-session entity.

## Guidance

### 1. Dashboard card is navigation + status, not enrollment

Add a **Your program** card on the dashboard that shows enrolled metadata (name, level, week/day) or an empty state with **Browse programs**. Enrollment actions live on the library page only — avoids duplicate CTAs and conflicting entry points.

### 2. Library page reuses catalog queries

Register `/programs` under the same auth and profile gates as the dashboard. List programs via `usePublishedProgramsQuery`; resolve the active row with `useActiveEnrollmentQuery`. Per-card CTA states:

- Unenrolled → **Enroll**
- Enrolled, same program → **Current program** (disabled)
- Enrolled, different program → **Switch to this program**

### 3. Enroll-or-switch without a migration

`user_program_enrollments` already has `active` and a partial unique index (`one active per user`). Switching is deactivate-then-insert:

```typescript
export async function enrollOrSwitchProgram(
  client: NexusSupabaseClient,
  userId: string,
  programId: string,
): Promise<UserProgramEnrollment> {
  const [currentEnrollment, activeLog] = await Promise.all([
    getActiveEnrollment(client, userId),
    getActiveWorkoutLog(client, userId),
  ]);

  if (currentEnrollment?.program_id === programId) {
    return currentEnrollment; // idempotent
  }

  if (!canSwitchProgram(activeLog)) {
    throw new ProgramSwitchBlockedError();
  }

  if (currentEnrollment) {
    await client
      .from('user_program_enrollments')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', currentEnrollment.id);
  }

  return createDefaultEnrollment(client, userId, programId);
}
```

Expose `useEnrollOrSwitchProgramMutation` with enrollment cache updates and `invalidateQueries({ queryKey: ['program'] })`. Do **not** import `@/entities/program` from `workout-session` — FSD forbids cross-entity imports; use the string query root instead.

### 4. Block switch during active workout

Guard in both mutation (`ProgramSwitchBlockedError`) and UI (disabled switch buttons + link to `/workout`). Prevents orphaning an active log that references the old program's workout.

### 5. Start workout must require enrollment

Remove silent default enrollment from `handleStartWorkout`. Require `enrollmentQuery.data` and resolve `programId` only from enrollment — never from `selectDefaultProgram()` on the start path:

```typescript
// Before (regression): auto-enrolls Starting Strength
if (!enrollment) {
  enrollment = await createEnrollment.mutateAsync(defaultProgram.id);
}

// After: enrollment is a prerequisite
if (!userId || !enrollment || !nextWorkout) {
  return;
}
```

### 6. React Router v7 navigation in handlers

`navigate()` returns a Promise in react-router-dom 7. Use `void navigate('/path')` in async handlers and `onClick={() => void navigate('/path')}` in JSX to satisfy `@typescript-eslint/no-floating-promises` and `no-misused-promises`.

### 7. Cypress for dashboard → library

Stub Supabase auth via `localStorage` key `sb-127-auth-token` (matches CI `VITE_SUPABASE_URL=http://127.0.0.1:54321`). Intercept REST endpoints for users, daily biometrics, programs, enrollments, and workout logs. Build must embed `VITE_*` env vars (CI workflow sets placeholders).

## Why This Matters

Without explicit program choice, MVP-1's "preset program → today's session" only works for the heuristic default. Users cannot test alternate seeded programs or see their active plan. The silent enroll-on-start bug makes library browsing meaningless if the user returns without enrolling.

Centralizing enroll/switch in one mutation keeps dashboard and library pages thin and makes the one-active-enrollment constraint enforceable in one place.

## When to Apply

- Adding or extending program selection UX in Nexus
- Implementing program switching when `user_program_enrollments_one_active` exists
- Wiring dashboard navigation cards to new pages (match existing Card + icon + CTA patterns)
- Adding E2E coverage for authenticated routes behind ritual and profile gates

## Examples

**Before:** Dashboard Next workout card showed "Begin Starting Strength" when unenrolled; no `/programs` route.

**After:** Dashboard program card → library → enroll → dashboard shows program name and next workout from enrolled template.

**Deferred (documented in plan):** offline enrollment queue, progression reset on switch, `/programs/:id` deep links.

## Related

- Plan: `docs/plans/2026-06-16-001-feat-program-library-dashboard-card-plan.md`
- PR: https://github.com/DrakenMythik/nexus/pull/88
- Prior MVP plan: `docs/plans/2026-06-13-001-feat-roadmap-phase-1-2-plan.md` (MVP-1 preset program)
