---
name: Nexus
last_updated: 2026-06-13
---

# Nexus Strategy

## Target problem

For a committed lifter, the failure isn't logging — apps like Hevy and Strong log fine — it's *staying consistent*. Two things break it: there's no feedback loop that rewards showing up, and bad sleep or a busy day derails the plan with no graceful way to adapt. The crux: a naive streak *punishes* rest, so it fights the user's own recovery and gets abandoned.

## Our approach

We win by scoring consistency as **readiness-adjusted adherence**, never raw frequency — a smart rest on a bad day counts as success, not a broken streak. This single choice fuses the three pillars (workout execution, whole-system awareness, knowledge/habits) so the product adapts to your state and rewards the *right* behavior instead of just counting sessions.

To preserve the psychological value of the streak, a Smart Rest is never just a "free pass." Earning the adherence point requires a micro-commitment (e.g., pushing the workout explicitly to tomorrow, or checking a box to prioritize hydration/sleep today). The score must always feel earned.

## Who it's for

**Primary:** A single, personal user (the builder). They're hiring Nexus to stay consistent with a training plan while adapting to real life and recovery — without it guilt-tripping a deload. Solo-use is the design center; multi-user and social are explicitly outside the near-term identity.

## Key metrics

- **Adherence Target** — ≥80% of *prescribed* sessions completed over 4 consecutive weeks, where a readiness-prescribed rest/deload counts toward adherence (the lagging success measure).
- **Daily-open rate** — does the user open the app daily; the leading signal that the feedback loop is working.
- **Vibe-check completion rate** — share of days the 1–10 readiness check-in is logged; the input the consistency score depends on.
- **Rebound Adherence** — the completion rate of the scheduled workout immediately *following* a smart rest. This is the true test of the thesis: if the app gives them grace on Tuesday, do they actually show up and lift on Wednesday?
- **Anti-metric:** raw session count or streak length in isolation — explicitly *not* a success measure, because it rewards over-training and punishes recovery.

## Tracks

### The Adherence Loop

The readiness-adjusted consistency engine — readiness check-in, the scoring rule that credits smart rest, and the progress/feedback surface built on it.

_Why it serves the approach:_ It *is* the signature mechanic; everything else feeds it.

### Guided workout execution

Frictionless, **contextual** capture. The logger must require near-zero keyboard typing on the gym floor. It instantly auto-fills the user's previous weights and allows 1-tap set completion.

_Why it serves the approach:_ Gives the user a plan to adhere to and removes the friction that breaks consistency. If logging is even 5% slower than a physical notebook or existing apps, the user will abandon the adherence loop entirely. Offline resilience is a non-negotiable constraint.

### Whole-system signals

Readiness and recovery inputs over time — starting manual (the 1–10 vibe-check), expanding through daily biometrics and, later, health-OS auto-regulation.

_Why it serves the approach:_ Makes "adjusted for readiness" real and multi-signal rather than a single guess.

### Knowledge & habits

Curated science notes and nudges that teach the "why" behind the plan.

_Why it serves the approach:_ Keeps Nexus from being "just a logger" and builds the understanding that sustains the habit.

### The Morning Ritual (Integration)

To drive the *Daily-open rate* on non-lifting days, the Whole-system signals and Knowledge tracks function as a lock-and-key. The user opens the app, inputs their 1–10 manual vibe-check (the key), which instantly unlocks their curated daily science nudge (the reward). This validates their recovery state and makes opening the app rewarding every single day.

## Not working on

- AI-generated custom programming.
- Social profiles, communities, and activity feeds.
- "Smart Gym" equipment-profile auto-adjustment.
- Near-term: automatic health telemetry, LLM coaching/notes, advanced progression depth, and smart exercise substitution are *deferred* (in the vision, phased later) — not iceboxed. Minimum linear progression is included in the Phase 1 + Phase 2 MVP to keep today's session alive during the 4-week adherence test.

## Marketing

**One-liner:** Not another logger — a whole-system tracker that rewards showing up *and* training right for the day you're actually having.

**Key message:** Consistency, not raw frequency. Nexus adapts to your state, credits a smart rest instead of breaking your streak, and teaches the why — all on an offline-first dataset you own.
