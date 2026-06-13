# nexus

Lightweight, personal lifting, sleep, nutrition and habit tracker. Designed as a mobile-first Progressive Web App (PWA) with a strong focus on data-driven training and offline resilience.

## 🚀 Tech Stack

**Frontend:**
- **Core:** React 19, TypeScript, Vite.
- **Styling:** Tailwind CSS.
- **State Management:** Zustand (for offline caching) and React Query.
- **PWA:** `vite-plugin-pwa` utilizing the InjectManifest strategy for robust offline orchestration.

**Backend & Data Layer:**
- **Database:** Supabase PostgreSQL (accessed via the Supabase JS client in `package.json`).
- **Authentication:** Supabase Auth (Email/Password & OAuth).

## 📁 Repository Structure

To optimize for Cursor AI context and maintain a clean separation of concerns, this repository uses a structured monorepo approach. The frontend strictly adheres to **Feature-Sliced Design (FSD)**, enforcing a unidirectional dependency flow.

```text
nexus/
├── .cursor/rules/          # Global AI instructions and agent boundaries for Cursor
├── .github/                # GitHub Actions workflows
├── docs/                   # Deep-dive documentation (architecture, database schema context)
├── supabase/               # Database schema, migrations, seed data, and config
├── src/                    # Main application code (Frontend)
│   ├── app/                # Global offline error boundaries, Supabase Provider initialization
│   ├── pages/              # Full route components (e.g., DashboardPage, WorkoutGuidedPage)
│   ├── widgets/            # Standalone UI blocks comprised of multiple features
│   ├── features/           # User scenarios and domain-specific interactions (e.g., auth)
│   ├── entities/           # Business logic, core data models, and state
│   └── shared/             # Reusable, domain-agnostic tools (UI kits, API proxies, libs)
├── .env.example            # Environment variable template
├── package.json            
└── README.md               # The entry point for developers and Cursor
```

## Local Supabase

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) running.

1. Install dependencies: `npm ci`
2. Copy env: `cp .env.example .env.local` (or use keys from `npm run supabase:status`)
3. Start stack: `npm run supabase:start`
4. Apply migrations: `npm run db:reset`
5. Lint schema: `npm run db:lint`

| Service | URL |
|---------|-----|
| API | http://127.0.0.1:54321 |
| Studio | http://127.0.0.1:54323 |
| Mailpit (auth emails) | http://127.0.0.1:54324 |

CLI is available via `npm run supabase -- <command>` (devDependency) or global `npm install -g supabase`.

## Continuous integration

Pull requests to `main` run the **GNAP Pipeline: Verification** workflow ([`.github/workflows/main-protection.yml`](.github/workflows/main-protection.yml)): install dependencies with `npm ci`, run ESLint (`npm run lint`), lint agent context with [ctxlint](https://github.com/YawLabs/ctxlint) (`npm run lint:ctx`), build the app (`npm run build`), and run Cypress in CI (`npm run test:e2e:ci`).