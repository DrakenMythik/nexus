# Nexus Architecture & GNAP Pipeline Handoff
**Date:** 2026.05.06
**Project:** Nexus (PWA Workout Tracker)

## 1. Core Architecture Decisions
- **Stack:** React 19, TypeScript, Vite, Tailwind, Supabase (Auth/Postgres), Zustand.
- **Frontend Paradigm:** Strict Feature-Sliced Design (FSD) with unidirectional dependency enforcement.
- **Agent Policy:** "Zero Bug Policy" via automated Git-Native Agent Protocol (GNAP) CI/CD pipeline. Zero placeholder policy (no `// TODO` stubs).

## 2. The Agent Habitat (Implemented Configuration)
We have successfully transitioned the repository from a standard codebase to an AI-optimized Agent Habitat:
- **Guardrails:** `.cursorignore` is configured to hide `.env*`, `dist/`, and `node_modules/` to protect secrets and save token context.
- **Wayfinding:** `AGENTS.md` is positioned at the root, defining FSD boundaries, "Ask First" database rules, and "Never Do" autonomous git push restrictions.
- **State Machine (Traveler Document):** The `.github/ISSUE_TEMPLATE/feature.md` template is configured to act as the pipeline tracker, using dynamic `Current Skill:` pointers and an `🤖 Agentic Pipeline` checklist.

## 3. GNAP Roles & Skills
We have defined three primary agent roles (workers) governed by specific GitHub labels, reading from specific instruction manuals (skills):
1. **`agent:architect`**: Uses `.cursor/skills/architect-planning/SKILL.md`. Queries Supabase MCP, generates Mermaid ER diagrams in `docs/`, and plans migrations.
2. **`agent:coder`**: Uses `.cursor/skills/react-coder/SKILL.md`. Reads FSD rules and Mermaid blueprints, then implements FSD-compliant React components.
3. **`agent:tester`**: Uses `.cursor/skills/cypress-tester/SKILL.md`. Reads git diffs, starts the local dev server, and writes/runs Cypress E2E tests in a self-healing loop.

## 4. Pipeline Execution State
- **Kanban Flow:** The GitHub Project board operates on the following states: `Todo` → `Architecting` → `Coding` → `Testing` → `Reviewing` (`human:review`) → `Done`.
- **Cloud Authentication:** Cursor Cloud Agents are configured to bypass integration limits using a Fine-Grained Personal Access Token (PAT) stored as the `GH_TOKEN` environment variable.

## 5. Immediate Next Steps (Action Items for Next Session)
1. Commit the newly generated `AGENTS.md`, `.cursorignore`, `feature.md`, and `.cursor/skills/` files to the `main` branch.
2. Create the GitHub Project Kanban board with the statuses: Architecting, Coding, Testing, Reviewing.
3. Create the required GitHub repository labels: `agent:architect`, `agent:coder`, `agent:tester`, `human:review`.
4. Create the first Feature Issue using the new template to test the `agent:architect` pipeline trigger.
