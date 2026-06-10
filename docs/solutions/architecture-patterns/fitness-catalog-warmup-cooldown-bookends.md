---
title: Fitness catalog warmup and cooldown bookends
date: 2026-06-04
category: architecture-patterns
module: fitness-catalog
problem_type: architecture_pattern
component: database
severity: medium
applies_when:
  - "Adding display-only bookend blocks (warmup/cooldown) to the fitness catalog seed pipeline"
  - "Generating large Supabase seed migrations from local PDF import scripts"
  - "Exposing block-ordered program days to guided workout UI without logging bookends"
symptoms:
  - "supabase db reset fails with SQLSTATE 42804 (null smallint inferred as text)"
  - "SQLSTATE 21000 ON CONFLICT duplicate set_number during seed apply"
  - "SQLSTATE 23514 program_blocks round_count check violation for OCR supersets"
  - "PDF Cool Down regex splits inline prose instead of section headers"
root_cause: logic_error
resolution_type: seed_data_update
related_components:
  - entities/program
  - supabase/migrations
tags:
  - fitness-catalog
  - warmup-cooldown
  - program-blocks
  - seed-migration
  - supabase
  - pdf-import
  - is-loggable-block
  - block-aware-query
---

# Fitness catalog warmup and cooldown bookends

## Context

The fitness catalog import pipeline parses Drive workout PDFs into idempotent SQL for `program_blocks`, `program_exercises`, and `program_exercise_sets`. Warmup sections were partially modeled (instructions only); cooldown sections were detected but dropped because `program_block_type` had no `cooldown` value and the parser never emitted cooldown rows.

Product requirement ([plan 2026-06-04-002](../../plans/2026-06-04-002-feat-fitness-catalog-cooldown-blocks-plan.md)): seed structured warmup and cooldown **bookends** as display-only sections. Main work blocks (`workout`, `superset`, `interval_circuit`) remain the only loggable region for guided workout `set_logs`.

The pattern spans three layers:

| Layer | Responsibility |
|-------|----------------|
| Postgres | Extend `program_block_type` with `cooldown` before seed migration |
| Python (local) | Parse asymmetric bookends from PDFs; generate typed SQL |
| TypeScript | Block-aware query, client-side sort, `isLoggableBlock()` gate |

**Tooling split:** `scripts/` is gitignored local tooling (PDF paths, one-off generators). **Deploy artifact** is the generated migration under `supabase/migrations/` — production never runs Python at runtime.

## Guidance

### 1. Schema before seed

Add enum values in a migration that runs **before** the seed file:

```sql
alter type public.program_block_type add value if not exists 'cooldown';

comment on type public.program_block_type is
  'Day section type: warmup/cooldown are display-only; workout/superset/interval_circuit are loggable.';
```

Migration order: `20260604135000_fitness_catalog_cooldown_block_type.sql` → `20260604140000_seed_fitness_exercises.sql`.

### 2. Asymmetric bookend parsing (PDF → seed)

| Section | PDF shape | Seed model |
|---------|-----------|------------|
| Warmup | Preamble + `LIST OF EXERCISES:` list | `block_type=warmup`, `target_reps='freestyle'`, list in `instructions` |
| Cooldown | Numbered stretches with hold times | `block_type=cooldown`, `prescription_mode=time_interval`, `work_seconds` on sets |
| Main work | Numbered exercises with sets/reps | Existing loggable block types |

Anchor block headers to line starts — especially Cool Down — so inline prose like "muscles to cool down between sets" does not spawn a section:

```python
# BLOCK_HEADER_RE cooldown alternation (excerpt)
r"(?:^|\n)\s*Cool\s+Do(?:wn|n)(?:\s+Routine)?(?:\s*\(OPTIONAL\))?"
```

Use `re.I | re.M` on the compiled pattern.

### 3. Typed SQL nulls for smallint columns

Bare `null` in `VALUES`/`SELECT` is inferred as `text`. Emit explicit casts:

```python
def sql_smallint(value: int | None) -> str:
    if value is None:
        return "null::smallint"
    return f"{value}::smallint"
```

### 4. Dedupe before ON CONFLICT

OCR noise can produce duplicate `set_number` rows in one INSERT. Key by set number in Python before rendering SQL:

```python
by_number: dict[int, ParsedSet] = {}
for parsed_set in sets:
    by_number[parsed_set.set_number] = parsed_set
sets = [by_number[n] for n in sorted(by_number)]
```

### 5. Guard invalid superset round counts

OCR headers like `SUPERSET 0 Sets` violate `round_count > 0`. Downgrade to `workout` when count is non-positive in `block_meta_from_header()`.

### 6. TypeScript consumption layer

**Loggability gate** — centralize; do not scatter block-type checks in features:

```typescript
const LOGGABLE_BLOCK_TYPES = new Set(['workout', 'superset', 'interval_circuit']);

export function isLoggableBlock(blockType: ProgramBlockType): boolean {
  return LOGGABLE_BLOCK_TYPES.has(blockType);
}
```

**Block-aware query** — one round-trip nested select; sort days → blocks → exercises → sets client-side. Bump React Query key segment when mapping semantics change (`with-blocks` after block tree shipped).

**Orphan exercises** — with no legacy unblocked data, do not synthesize fake blocks with non-UUID ids. Merge day-level exercises missing from nested blocks into the main workout block:

```typescript
const unassignedExercises = [...(program_exercises ?? [])]
  .filter((exercise) => !blockExerciseIds.has(exercise.id))
  .sort(bySortOrder)
  .map(mapExercise);

if (unassignedExercises.length > 0) {
  const mainBlock = blocks.find(
    (block) => block.block_type === 'workout' || block.slug === 'main-workout',
  );
  if (mainBlock) {
    mainBlock.exercises = [...mainBlock.exercises, ...unassignedExercises].sort(bySortOrder);
  }
}
```

## Why This Matters

Without bookend blocks in the seed, guided UI cannot show warmup/cooldown in program order. Without `isLoggableBlock()`, bookends risk generating `set_logs` — wrong for display-only stretches.

Migration pitfalls (untyped null, duplicate conflict keys, invalid superset counts) only surface during `supabase db reset` on a multi-megabyte seed. Fixing them in the parser/generator avoids repeated binary-search debugging through 86k-line SQL files.

Keeping import scripts local and migrations tracked separates machine-specific PDF paths from the deploy artifact CI and hosted Postgres actually apply.

## When to Apply

- Extending catalog block types or bookend sections from PDF import
- Regenerating `20260604140000_seed_fitness_exercises.sql` after parser changes
- Wiring guided workout UI (U7) — use `day.blocks[]` and skip logging when `!isLoggableBlock(block.block_type)`
- Any breaking change to `getProgramWithDays` response shape — bump query key segment

## Examples

### Verification after parser or seed changes

```bash
cd scripts
python generate_exercise_seed.py --stats-only
python generate_exercise_seed.py --sample 3-push-pull-legs/push
cd ..
supabase db reset
npm run test:unit -- src/entities/program
```

Confirm stats report nonzero warmup exercises and cooldown blocks; push day should show warmup → main → cooldown block order.

### Regex pitfall

```python
# Wrong — PatternError or wrong semantics
r"[^]*?"  # invalid character class

# Right — multiline non-greedy
r".*?" with re.S
```

## Related

- [Fitness catalog cooldown blocks plan](../../plans/2026-06-04-002-feat-fitness-catalog-cooldown-blocks-plan.md) — R1–R10 requirements
- [Fitness catalog schema plan](../../plans/2026-06-04-001-feat-fitness-catalog-schema-plan.md) — `program_blocks` baseline
- [Supabase RLS FK ownership checks](../security-issues/supabase-rls-exists-fk-ownership-checks.md) — catalog publish gates (extend if block-level RLS is added)
- GitHub EPIC #16 — Program Library & Selection
