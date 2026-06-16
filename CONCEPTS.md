# Concepts

Shared domain vocabulary for this project — entities, named processes, and status concepts with project-specific meaning. Seeded with core domain vocabulary, then accretes as ce-compound and ce-compound-refresh process learnings; direct edits are fine. Glossary only, not a spec or catch-all.

## Programs and enrollment

### Program
A published training template in the catalog — a multi-week schedule of prescribed workouts. Programs are seeded and read-only for authenticated users in MVP; the user does not author custom programs here.

### Program library
The browse surface where a user views published programs and chooses one to follow. Entry point from the dashboard program card at `/programs`.

### Program enrollment
The user's active commitment to one program template. Tracks which program is followed and the current position (week and day) in that template's schedule. At most one enrollment is active per user.

### Today's session
The workout resolved from the active enrollment's current position for the local calendar day, after applying smart-rest push rules. The guided workout logger and dashboard next-workout card both surface this session.

### Smart rest
A readiness-driven rest day that still earns adherence credit when the user completes a micro-commitment (e.g. push workout to tomorrow). Distinct from skipping a session without credit.
