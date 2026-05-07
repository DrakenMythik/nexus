# Nexus Architecture & GNAP Pipeline Handoff (Phase 2: Production)
**Date:** 2026.05.07
**Project:** Nexus (PWA Workout Tracker)

## 1. Pipeline State (Infrastructure Complete)
- **Branch Protection:** `main` is locked. PRs require status checks to pass before merging.
- **CI/CD Verification:** GitHub Actions are configured to enforce `npm run build`, `npm run lint` (strict FSD boundaries), and `npm run test:e2e:ci`.
- **Scaffolding:** React 19, Vite, TypeScript, Tailwind, and PWA (InjectManifest) configurations are initialized and merged into `main`.
- **Workflow State:** GitHub Project infrastructure is ready with statuses (`Todo`, `Architecting`, `Coding`, `Testing`, `Reviewing`, `Done`) and worker labels (`agent:architect`, `agent:coder`, `agent:tester`, `human:review`).

## 2. The Factory Floor: Project Hierarchy
To prevent Agent hallucination and ensure strict FSD compliance, work is divided into a strict hierarchy:

* **Epics (The Milestones):** Large, user-facing areas of the application. Agents never see Epics directly.
* **Features (The Assembly Line Parts):** Atomic, self-contained slices of functionality mapped to a single GitHub Issue using the `.github/ISSUE_TEMPLATE/feature.md`.
* **Tasks (The Instructions):** The individual, executable checkboxes inside the Feature Issue.

## 3. The Kanban Conveyor Belt (Agent Handoff Rules)
A single Feature Issue moves across the board by swapping labels:

1.  **Todo:** Issue created. Human fills out the `feature.md` template.
2.  **Architecting:** Human applies `agent:architect`. Agent reads template, plans DB schema/FSD layers, writes markdown specs, creates a PR. Human reviews and merges. Label swapped.
3.  **Coding:** Human applies `agent:coder`. Agent reads the Architect's specs, builds the React components, creates a PR. Human reviews and merges. Label swapped.
4.  **Testing:** Human applies `agent:tester`. Agent writes Cypress E2E tests for the new UI. Creates PR.
5.  **Reviewing:** Human applies `human:review`. Final visual and code check.
6.  **Done:** Feature is live on `main`.

## 4. Product Roadmap (High-Level Backlog)

### [cite_start]Epic 1: Identity & Access Management (IAM) [cite: 178]
* [cite_start]**Feature 1.1:** Secure Authentication Setup (SSO & Email Auth, RLS Data Isolation)[cite: 179, 180, 183].

### [cite_start]Epic 2: Program Library & Selection [cite: 186]
* [cite_start]**Feature 2.1:** Preset Program Management (Library UI & Onboarding Flow)[cite: 187, 188, 191].

### [cite_start]Epic 3: Schedule Management [cite: 194]
* [cite_start]**Feature 3.1:** Dynamic Weekly Scheduling (Default Configs & On-the-Fly Adjustments)[cite: 195, 196, 199].

### [cite_start]Epic 4: Telemetry Pipeline & Sync Hub [cite: 202]
* [cite_start]**Feature 4.1:** Health Data Integrations (OS-level permissions & Background Sync)[cite: 203, 204, 207].
* [cite_start]**Feature 4.2:** Fallback Mechanisms (Manual Vibe Check UI)[cite: 210, 211].

### [cite_start]Epic 5: Readiness Engine & Auto-Regulation [cite: 214]
* [cite_start]**Feature 5.1:** The AI Decision Engine (WRS Calculator, Auto-Regulation Logic, LLM Science Notes)[cite: 215, 216, 219, 222].

### [cite_start]Epic 6: Guided Workout Execution [cite: 225]
* [cite_start]**Feature 6.1:** The Active Workout Player (Step-Through UI, Set/Rep Logging, Override Toggles)[cite: 226, 227, 230, 233].

### [cite_start]Epic 7: Progression Engine & Exercise Management [cite: 236]
* [cite_start]**Feature 7.1:** Relational Exercise Library & Smart Substitution[cite: 237, 238, 241, 244].
* [cite_start]**Feature 7.2:** Performance Evaluation & Linear Progression (Automated Weight Adjustments)[cite: 248, 249, 252].

### [cite_start]Epic 8: Gamification & Behavioral Consistency [cite: 255]
* [cite_start]**Feature 8.1:** Bio-Sync Engine (Program-Aware Streaks & Bio-Core Visualization)[cite: 256, 257, 260].

### [cite_start]ICEBOX (Post-MVP Scope) [cite: 263]
* [cite_start]**Feature 9.1:** "Smart Gym" Auto-Adjustment (Equipment Profiles)[cite: 264, 265].
* [cite_start]**Feature 9.2:** AI-Generated Custom Programming[cite: 268, 269].
* [cite_start]**Feature 9.3:** Social Profiles & Communities[cite: 271, 272].
* [cite_start]**Feature 9.4:** Real-Time Communication & Activity Feeds[cite: 274, 275].

## 5. Immediate Next Steps
1. Translate Epics 1-8 into a structural view inside the GitHub Project board.
2. Create the first Issue for **Feature 1.1 (Secure Authentication Setup)** using the `.github/ISSUE_TEMPLATE/feature.md` template.
3. Apply the `agent:architect` label to Feature 1.1 to kick off the assembly line.