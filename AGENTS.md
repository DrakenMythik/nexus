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

## Repository State

The project has been scaffolded with a working Vite + React 19 + TypeScript setup. The `src/` directory follows Feature-Sliced Design, and `package.json` with all dev dependencies is in place.

## Agent Workflow

1. **Inspect before acting.** Always check the current repository state (files, tooling, scripts) before suggesting commands or imports. Do not assume scripts like `npm run build` or `npm test` exist.
2. **Stay scoped.** Only modify files required by the user's request. Do not opportunistically scaffold unrelated areas.
3. **Ask before scaffolding.** Do not create major planned directories or systems (`src/`, `supabase/`, `docs/`, `package.json`, build configs, CI workflows, framework setup) without explicit user confirmation. Single small files inside an already-existing area do not require a question.
4. **Respect user changes.** Do not revert or "clean up" files the user has authored unless asked.
5. **Git safety.** Never run destructive or irreversible git commands (force push, hard reset, history rewrites) and never commit unless the user explicitly asks.

## Architecture Expectations

When implementation work begins, follow the planned stack:

- **Core:** React 19, TypeScript (strict), Vite.
- **Styling:** Tailwind CSS.
- **State:** Zustand for offline cache, React Query for server state.
- **PWA:** `vite-plugin-pwa` using the **InjectManifest** strategy.
- **Auth:** Supabase Auth (Email/Password and OAuth providers).
- **Data:** Supabase PostgreSQL via `@supabase/supabase-js`.
- **Architecture:** Feature-Sliced Design with strict unidirectional dependencies (`app` → `pages` → `widgets` → `features` → `entities` → `shared`).

## Coding Standards

- **Strict TypeScript.** No implicit `any`, no `// @ts-ignore` without justification.
- **Functional components and hooks only.** No class components.
- **Interface-first.** Define types and interfaces before implementation.
- **No placeholders.** Do not leave `// TODO`, stub functions, or unimplemented branches. Deliver fully functional units of work.
- **FSD imports.** A slice may only import from layers below it. Slices on the same layer must not import from each other directly. Expose each slice's public API through a barrel `index.ts`.
- **Comments.** Only explain non-obvious intent or constraints. Do not narrate what the code is doing.

## Security and Dependencies

- **Secrets never in code.** API keys, Supabase URLs, and tokens live in `.env` (gitignored) and are read via `import.meta.env.*` in Vite.
- **Verify packages exist** before suggesting an import. If a dependency is not in `package.json` (once it exists), confirm it on the registry first.
- **Do not commit** files that may contain secrets (`.env`, `.env.local`, credentials, key files).

## Validation

- Run the **narrowest relevant check** for the change you made (type-check the touched package, run the affected test file, lint the edited files).
- If validation cannot be run because the project is not scaffolded yet (no `package.json`, no scripts), say so explicitly in your response instead of inventing or skipping commands.
- After substantive edits, check for linter errors on files you modified and fix any you introduced.

## Cursor Cloud specific instructions

### Available scripts (via `pnpm`)

| Command | Purpose |
|---------|---------|
| `pnpm dev` | Vite dev server at `localhost:5173` with HMR |
| `pnpm build` | TypeScript check + production Vite build |
| `pnpm lint` | ESLint across `**/*.{ts,tsx}` |
| `pnpm typecheck` | TypeScript project references type-check (no emit) |
| `pnpm test` | Vitest single run (jsdom environment) |
| `pnpm test:watch` | Vitest in watch mode |
| `pnpm preview` | Serve the production build locally |

### Gotchas

- **esbuild build scripts**: pnpm requires explicit approval for native addon build scripts. The `pnpm.onlyBuiltDependencies` field in `package.json` allows esbuild. If new native packages are added, they must be added there too.
- **TypeScript 6**: `baseUrl` is deprecated. Use relative `paths` entries like `"@/*": ["./src/*"]` without a `baseUrl` field.
- **Tailwind v4**: Uses the `@import "tailwindcss"` directive in CSS (no `@tailwind` directives). Configuration is via the `@tailwindcss/vite` plugin, not a `tailwind.config.js` file.
- **PWA service worker**: The InjectManifest strategy builds `src/sw.ts` into `dist/sw.js`. Dev mode enables a dev SW via `devOptions.enabled: true` in vite-plugin-pwa config.
- **Supabase not required for local dev**: The app runs without Supabase credentials. Features that need auth/data will gracefully degrade. Supply `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env` only when testing auth/data flows.
