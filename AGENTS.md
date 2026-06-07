# AGENTS.md

Router for AI agents working in the Nexus repository. Read this first, then follow the linked rules and skills for the task at hand. **Cursor rules win** if anything here conflicts with them.

## Project identity

Nexus is a lightweight, personal **lifting, sleep, nutrition, and habit tracker** — a **mobile-first PWA** where **offline resilience** is a core constraint. Treat changes that degrade offline behavior as regressions.

## Rule router

| When you are… | Read |
|---------------|------|
| Starting any task | [`.cursor/rules/03-agent-boundaries.mdc`](.cursor/rules/03-agent-boundaries.mdc) (always applied) |
| Writing application code in `src/` | [`.cursor/rules/01-tech-stack.mdc`](.cursor/rules/01-tech-stack.mdc), [`.cursor/rules/02-fsd.mdc`](.cursor/rules/02-fsd.mdc) |
| Building UI in `src/` | [`.cursor/rules/04-frontend-implementation.mdc`](.cursor/rules/04-frontend-implementation.mdc) |
| Understanding repo layout or product scope | [`README.md`](README.md) |
| Designing Supabase schema / RLS (blueprint phase) | [Blueprint phase — Supabase](#blueprint-phase--supabase) below, [`.cursor/skills/architect-planning/SKILL.md`](.cursor/skills/architect-planning/SKILL.md) |
| Brainstorming, planning, or compounding learnings | [Compound Engineering](#compound-engineering) below |

Do not duplicate stack, FSD, security, or UI standards here — they live in the rule files above.

## Compound Engineering

Local config (gitignored, machine-specific): copy [`.compound-engineering/config.local.example.yaml`](.compound-engineering/config.local.example.yaml) to a gitignored local override in that directory if missing. Skills read it for optional defaults (for example `plan_output`, `brainstorm_output`).

Local tooling (gitignored, machine-specific): the entire [`scripts/`](scripts/) directory — catalog PDF import helpers, one-off analysis, and optional `ce-sessions.ps1` for `/ce-sessions` or `/ce-compound` session-history discovery on Windows (`pwsh -File scripts/ce-sessions.ps1`; Git Bash + `PYTHONUTF8` for plugin scripts). Not tracked in git; maintain locally if you use it.

Artifact directories (search before implementing in a related area):

| Path | Purpose |
|------|---------|
| [`docs/brainstorms/`](docs/brainstorms/) | Requirements from `ce-brainstorm` (`*-requirements.md` / `.html`) |
| [`docs/plans/`](docs/plans/) | Implementation plans from `ce-plan` |
| [`docs/solutions/`](docs/solutions/) | Past learnings from `ce-compound` (YAML frontmatter, by category) |

Compound skills ship with the Cursor Compound Engineering plugin; Nexus also uses repo skills under [`.cursor/skills/`](.cursor/skills/) for the architect → coder pipeline.

## Blueprint phase — Supabase

**Any change to Supabase database schema, RLS policies, grants, or files under `supabase/migrations/` must be designed and vetted during the blueprint phase before implementation.** Do not add or edit migration SQL during coding or review without an approved blueprint artifact.

**Blueprint phase** means one of:

1. **Requirements** — an artifact in `docs/brainstorms/` (from `ce-brainstorm` or equivalent) that covers data needs, or
2. **Technical plan** — an artifact in `docs/plans/` (from `ce-plan`) that explicitly covers tables, RLS, and `anon` / `authenticated` posture, or
3. **Architect skill** — a Mermaid ER diagram saved under `docs/` plus explicit human **Approved**, per [architect-planning](.cursor/skills/architect-planning/SKILL.md) Phase 1.

Only after approval: `supabase migration new`, write SQL, run `supabase db lint`. For `public` tables, follow **anon default-deny** in [`.cursor/rules/03-agent-boundaries.mdc`](.cursor/rules/03-agent-boundaries.mdc) (`REVOKE` from `anon` after grants unless anonymous access is required).

## Repository state

- **Frontend:** [`src/`](src/) (Vite + React 19; FSD layout per README — not every slice may exist yet).
- **Database:** [`supabase/`](supabase/) migrations and config.
- **Docs:** [`docs/`](docs/) (brainstorms, plans, solutions, specs, handoffs).
- **Tooling:** [`package.json`](package.json) — verify scripts exist before running them.

## CI and verification

PRs to `main` run [`.github/workflows/main-protection.yml`](.github/workflows/main-protection.yml): `npm ci`, `npm run lint`, `npm run lint:ctx`, `npm run build`, `npm run test:e2e:ci`.

After substantive edits, run the **narrowest relevant check** (`lint`, `lint:ctx`, `test:unit`, or `build`) and fix linter issues you introduced.

## Agent workflow

1. **Inspect before acting** — confirm files, dependencies, and scripts exist.
2. **Stay scoped** — only change what the request requires.
3. **Ask before large changes** — no broad refactors without confirmation.
4. **Respect user changes** — do not revert user-authored work unless asked.
5. **Git safety** — no destructive git ops; no commit unless explicitly requested.

## Boundaries

### Always do

- Follow FSD import rules in [`.cursor/rules/02-fsd.mdc`](.cursor/rules/02-fsd.mdc).
- Update the `🤖 Agentic Pipeline` checklist on the GitHub issue when completing a phase.

### Ask first

- Creating, modifying, or executing `supabase/migrations/` or `supabase db` CLI commands **without** a vetted blueprint artifact (see [Blueprint phase](#blueprint-phase--supabase)).

### Never do

- `git push origin main`, autonomous `git commit`, or branch merges.
- Expose PII or database credentials in code or logs.
