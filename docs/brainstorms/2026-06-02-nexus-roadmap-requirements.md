# Nexus Roadmap — Requirements

**Date:** 2026-06-02
**Status:** Draft for planning (`ce-plan` handoff)
**Branch:** `plan/initialstrategy`
**Type:** Product roadmap (Deep, product-tier brainstorm)

---

## 1. Summary

Nexus is a mobile-first, offline-first PWA for lifting, sleep, nutrition, and
habit tracking. Authentication + RLS data isolation (Epic 1 / Feature 1.1) is
**already shipped**. This document sequences the remaining vision into a tight
MVP floor and a phased path to the larger backlog.

The roadmap is organized around **one bet** and **one signature mechanic**:

- **The bet:** A workout app at its core that treats the user as a *whole
  system* — building the knowledge and habits to actually succeed at their
  fitness goals.
- **The signature mechanic:** **Readiness-adjusted consistency.** Showing up
  *and* training appropriately for your current state is the win condition. A
  smart rest on a bad day counts as success, not a broken streak.

## 2. Problem & thesis

**Core problem (validated against the primary user):** consistency, not
logging. Existing apps (Hevy, Strong) log fine; the failure is *staying
consistent*. Two failure modes drive the drop-off:

1. **No feedback loop** — nothing rewards showing up or makes progress visible.
2. **Life / recovery derailment** — bad sleep or busy days break the plan and
   there's no graceful way to adapt.

**Why these two together matter:** a naive streak *punishes* rest, but the
recovery problem says bad days *should* trigger rest. A feedback loop that
guilt-trips a smart deload fights the user's own recovery and gets abandoned.
The resolution is to score consistency as **readiness-adjusted adherence**, not
raw frequency — this single decision fuses all three thesis pillars (workout
execution, whole-system awareness, habit formation).

**Differentiation vs. existing apps:** Nexus is not "another logger." It (a)
adapts to your state, (b) rewards the *right* behavior, and (c) teaches the
"why" via curated knowledge — all on an offline-first dataset the user owns.

## 3. Target user

Single, personal user (the builder) to start. Solo-use is the design center;
multi-user / social is explicitly out of the product's near-term identity (see
§7). Auth already supports isolated per-user data, so this is a product-scope
decision, not a technical blocker.

## 4. Success criteria

**North-star (MVP):** a **consistency** metric, not a feature count.

- **MVP success:** the primary user completes **≥80% of prescribed sessions for
  4 consecutive weeks**, where a readiness-prescribed rest/deload counts toward
  adherence.
- **Leading indicators:** daily-open rate; vibe-check completion rate;
  proportion of "smart rest" days correctly credited (not penalized).
- **Anti-metric:** raw session count or streak length in isolation — explicitly
  *not* a success measure, because it rewards over-training and punishes
  recovery.

## 5. MVP scope (v1 floor — "The Adherence Loop + Knowledge")

The smallest version that proves the core bet and that the user opens daily.

| ID | Capability | Why it's in the floor |
|----|-----------|----------------------|
| MVP-1 | **Preset program → "today's session"** served up automatically | Kills decision fatigue; gives the plan to adhere to |
| MVP-2 | **Guided, offline-first workout execution** (step-through, set/rep logging) | Frictionless capture; offline resilience is a core constraint |
| MVP-3 | **Manual readiness vibe-check** (quick self-report) | Cheap readiness signal the consistency score depends on — no health integration required |
| MVP-4 | **Readiness-adjusted consistency feedback** (streak/progress that credits smart rest) | The signature mechanic; the reason it keeps you consistent |
| MVP-5 | **Static knowledge nudges** (curated science notes, no LLM) | Delivers the "knowledge" pillar cheaply; keeps v1 from feeling like just a logger |

**MVP deliberately excludes:** health-OS telemetry, HRV/sleep auto-import, WRS
calculator, LLM-generated notes, progression automation, exercise substitution,
and gamification depth (bio-core visualization). These are phased below.

## 6. Phased roadmap (path to the vision)

Maps the existing 8-epic backlog onto the consistency-first sequence.

- **Phase 1 — MVP / The Adherence Loop** (this doc, §5)
  Touches Epic 2 (program select, light), Epic 3 (scheduling, light), Epic 6
  (guided player), Epic 4.2 (manual vibe-check), Epic 5 (readiness-adjusted
  scoring, light), Epic 8 (consistency feedback, light).

- **Phase 2 — Whole-System Lite**
  Linear progression automation (Epic 7.2), manual sleep/nutrition logging,
  deeper flexible scheduling / on-the-fly adjustments (Epic 3 full). Makes the
  "whole system" view genuinely multi-signal.

- **Phase 3 — Intelligent Auto-Regulation**
  Health-OS integrations + background sync (Epic 4.1), WRS calculator +
  auto-regulation logic + LLM science notes (Epic 5 full). Upgrades the manual
  vibe-check into automatic, intelligent readiness.

- **Phase 4 — Behavioral Depth**
  Bio-Sync engine, program-aware streak depth, bio-core visualization
  (Epic 8.1 full), relational exercise library + smart substitution (Epic 7.1).

## 7. Scope boundaries

**Deferred for later (in the vision, not now):** automatic health telemetry,
LLM-driven coaching/notes, progression automation, smart exercise substitution,
gamification visualization.

**Outside this product's identity (Icebox):**
- AI-generated custom programming (Feature 9.2)
- Social profiles & communities (Feature 9.3)
- Real-time communication & activity feeds (Feature 9.4)
- "Smart Gym" equipment-profile auto-adjustment (Feature 9.1)

These risk turning a focused personal whole-system tracker into a social /
generative platform — a different product. Revisit only after the consistency
bet is proven.

## 8. Key decisions (locked in this brainstorm)

1. Thesis = workout-core **+** whole-system **+** knowledge/habits.
2. Primary problem = **consistency**, driven by missing feedback loop **and**
   life/recovery derailment.
3. Consistency is **readiness-adjusted adherence**, never raw frequency.
4. Auto-regulation is the *expression* of "whole system," not a separate
   product — and it **starts manual** (vibe-check) before any integration.
5. MVP = Approach A (lean loop) **+** static knowledge nudges.
6. Success = consistency north-star (≥80% adherence, 4 weeks), not feature count.

## 9. Dependencies & assumptions

- **Assumption:** the primary user's stated failure modes (no feedback / life
  derailment) generalize enough to design against; validated by self-report,
  not yet by usage data. The MVP success metric is the validation.
- **Dependency (shipped):** auth + RLS per-user isolation (Feature 1.1).
- **Constraint:** offline-first is non-negotiable; any phase that degrades
  offline behavior is a regression (per `AGENTS.md`).
- **Blueprint gate:** any new Supabase schema/RLS for Phases 1–4 must go through
  the blueprint phase before migrations (per `AGENTS.md`).

## 10. Open questions (for planning)

- **OQ-1:** What is the seed preset program for MVP-1 (one opinionated default
  vs. a small library)? Smallest answer: a single default program.
- **OQ-2:** What dimensions does the vibe-check capture (single 1–5 "readiness"
  vs. sleep + soreness + energy)? Smaller is better for the floor.
- **OQ-3:** Exact readiness-adjusted scoring formula — how a prescribed rest is
  credited. Needs a concrete rule before Phase 1 coding.
- **OQ-4:** Source/curation of static knowledge nudges (MVP-5).

## 11. Next steps

1. Run `ce-plan` against this document to produce a Phase 1 (MVP) implementation
   plan, starting with OQ-1–OQ-4 resolution.
2. Translate phases into GitHub Epics/Features per the GNAP pipeline (see
   `docs/handoffs/260507nexus-factory-floor-handoff.md`).
3. For Phase 1 data needs, design schema in the blueprint phase before any
   `supabase/migrations/` work.
