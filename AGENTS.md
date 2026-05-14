# AGENTS.md

First-stop instructions for any AI coding agent working in the Nexus repository. Read this before taking action, then defer to the more specific Cursor rules listed below for details.

## Project Identity

Nexus is a lightweight, personal **lifting, sleep, nutrition, and habit tracker**. It is built as a **mobile-first Progressive Web App** where **offline resilience is a core product constraint**, not an afterthought. Treat any change that degrades offline behavior as a regression.

## Authoritative Sources

These files are the source of truth. If anything in this document conflicts with them, they win:

- [`README.md`](README.md) — product summary and intended repository structure.
- [`.cursor/rules/01-tech-stack.mdc`](.cursor/rules/01-tech-stack.mdc) — tech stack and global conventions.
- [`.cursor/rules/02-fsd.mdc`](.cursor/rules/02-fsd.mdc) — Feature-Sliced Design layers and import rules.
- [`.cursor/rules/03-agent-boundaries.mdc`](.cursor/rules/03-agent-boundaries.mdc) — security, anti-hallucination, and execution boundaries.
- [`.cursor/rules/04-frontend-implementation.mdc`](.cursor/rules/04-frontend-implementation.mdc) — frontend UI standards (React, Tailwind, FSD, accessibility).

## Repository State

The repository contains a **Vite + React 19** frontend under [`src/`](src/), **Supabase** SQL migrations under [`supabase/`](supabase/), supporting documentation under [`docs/`](docs/), and Node tooling in [`package.json`](package.json). The directory tree in [`README.md`](README.md) describes the **target** FSD layout; not every layer directory may exist until those slices are added.

## CI and verification

Pull requests targeting `main` run [`.github/workflows/main-protection.yml`](.github/workflows/main-protection.yml): `npm ci`, ESLint (`npm run lint`), agent context lint (`npm run lint:ctx`), `npm run build`, and Cypress (`npm run test:e2e:ci`).

## Agent Workflow

1. **Inspect before acting.** Check the current repository state (files, tooling, scripts in `package.json`) before suggesting commands or imports.
2. **Stay scoped.** Only modify files required by the user's request. Do not opportunistically scaffold unrelated areas.
3. **Ask before large changes.** Do not create major new systems or broad refactors without explicit user confirmation. Small, request-scoped edits do not require a separate question.
4. **Respect user changes.** Do not revert or "clean up" files the user has authored unless asked.
5. **Git safety.** Never run destructive or irreversible git commands (force push, hard reset, history rewrites) and never commit unless the user explicitly asks.

## Architecture Expectations

Follow the stack documented in the Cursor rules and README:

- **Core:** React 19, TypeScript (strict), Vite.
- **Styling:** Tailwind CSS.
- **State:** Zustand for offline cache, React Query for server state.
- **PWA:** `vite-plugin-pwa` using the **InjectManifest** strategy.
- **Auth:** Supabase Auth (Email/Password and OAuth providers).
- **Data:** Supabase PostgreSQL via the Supabase JS client (see `package.json` dependencies).
- **Architecture:** Feature-Sliced Design with strict unidirectional dependencies (`app` → `pages` → `widgets` → `features` → `entities` → `shared`) under `src/`.

## Coding Standards

- **Strict TypeScript.** No implicit `any`, no `// @ts-ignore` without justification.
- **Functional components and hooks only.** No class components.
- **Interface-first.** Define types and interfaces before implementation.
- **No placeholders.** Do not leave `// TODO`, stub functions, or unimplemented branches. Deliver fully functional units of work.
- **FSD imports.** A slice may only import from layers below it. Slices on the same layer must not import from each other directly. Expose each slice's public API through a barrel `index.ts`.
- **Comments.** Only explain non-obvious intent or constraints. Do not narrate what the code is doing.

## Security and Dependencies

- **Secrets never in code.** API keys, Supabase URLs, and tokens live in `.env` (gitignored) and are read via `import.meta.env.*` in Vite.
- **Verify packages exist** before suggesting an import. If a dependency is not in `package.json`, confirm it on the registry first.
- **Do not commit** files that may contain secrets (`.env`, `.env.local`, credentials, key files).
- **Supabase `public` tables:** do not leave new tables exposed to the **`anon`** role by default. After `CREATE TABLE`, RLS, and grants to `authenticated` (or other intended roles), explicitly **`REVOKE`** privileges from **`anon`** (at minimum `SELECT`) unless anonymous access is explicitly required.

## Validation

- Run the **narrowest relevant check** for the change you made (for example `npm run lint`, `npm run lint:ctx`, `npm run test:unit`, or `npm run build`).
- After substantive edits, check for linter errors on files you modified and fix any you introduced.

## Boundaries
### Always Do
- Follow the unidirectional dependency rules outlined in `.cursor/rules/02-fsd.mdc`.
- Update the `🤖 Agentic Pipeline` checklist in the GitHub issue when completing a phase.

### Ask First
- Ask first before creating, modifying, or executing any files within the `supabase/migrations/` directory or running any `supabase db` CLI commands.

### Never Do
- Never execute `git push origin main`, `git commit`, or merge branches autonomously. 
- Never expose PII or database credentials.
