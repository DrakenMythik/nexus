# nexus

Lightweight, personal lifting, sleep, nutrition and habit tracker. Designed as a mobile-first Progressive Web App (PWA) with a strong focus on data-driven training and offline resilience.

## 🚀 Tech Stack

**Frontend:**
- **Core:** React 19, TypeScript, Vite.
- **Styling:** Tailwind CSS.
- **State Management:** Zustand (for offline caching) and React Query.
- **PWA:** `vite-plugin-pwa` utilizing the InjectManifest strategy for robust offline orchestration.

**Backend & Data Layer:**
- **Database:** Supabase PostgreSQL (accessed via `@supabase/supabase-js`).
- **Authentication:** Supabase Auth (Email/Password & OAuth).

## 📁 Repository Structure

To optimize for Cursor AI context and maintain a clean separation of concerns, this repository uses a structured monorepo approach. The frontend strictly adheres to **Feature-Sliced Design (FSD)**, enforcing a unidirectional dependency flow.

```text
nexus/
├── .cursor/rules/          # Global AI instructions and agent boundaries for Cursor
├── .github/                # GitHub Actions workflows and issue templates
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
