## Context
[A 1-2 sentence explanation of why this feature exists. e.g., "We need a way for users to log their daily sleep and weight data securely to Supabase."]

## Requirements
- [ ] Connect to the Supabase client.
- [ ] Create a form with inputs for Sleep (hrs) and Weight (kg/lbs).
- [ ] Implement an Optimistic UI pattern for form submission.

## Technical Guidance (For Cursor)
- **Relevant Files:** `src/widgets/DailyVitalsForm/`, `src/features/sync-vitals/`
- **Dependencies:** Use `react-hook-form` and `zod` for validation.
- **Rules:** Follow the Feature-Sliced Design (FSD) architecture.

## Definition of Done
- [ ] Form successfully submits data to the `metrics` table.
- [ ] UI reflects a "Syncing..." to "Synced" state immediately upon submission.
