"""Generate idempotent SQL seed for Drive workout program catalog."""
from __future__ import annotations

import re
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(r"G:\My Drive\1 Project\_Fitness\Workout Plans")
OUT = Path(__file__).resolve().parents[1] / "supabase" / "migrations" / "20260604130000_seed_fitness_catalog.sql"

DESCRIPTIONS: dict[tuple[int, str], str] = {
    (3, "Dumbbells"): (
        "Three-day dumbbell-only split covering strength, unilateral work, and conditioning. "
        "Minimal equipment; ideal for home or busy gyms."
    ),
    (3, "Female"): (
        "Three-day female-focused split with upper, lower/glute, and glute-bias sessions. "
        "Balanced hypertrophy with lower-body emphasis."
    ),
    (3, "Full Body"): (
        "Three-day full-body rotation across upper, lower, and combined sessions. "
        "Efficient frequency for general strength and muscle."
    ),
    (3, "Minimal Home"): (
        "Three-day minimal-equipment full-body program (A/B/C). "
        "Built for home training with limited gear."
    ),
    (3, "Minimalist"): (
        "Streamlined three-day upper/lower/full-body split with low exercise count per session. "
        "High signal-to-noise for time-crunched lifters."
    ),
    (3, "PLFull Body"): (
        "Three-day full-body program biased toward push, pull, or legs each session. "
        "Hybrid between PPL and full-body training."
    ),
    (3, "Push Pull Legs"): (
        "Classic three-day PPL split. Push, pull, and leg days with compound and accessory work, "
        "top-set/back-off progression on main lifts."
    ),
    (3, "Travel"): (
        "Hotel/travel circuit program with three no-equipment circuits. "
        "Bodyweight supersets for maintaining fitness on the road."
    ),
    (4, "Beach Body"): (
        "Four-day physique split: push, pull, upper, and legs. "
        "Hypertrophy focus for balanced upper/lower development."
    ),
    (4, "Bodyweight"): (
        "Four-day bodyweight-only program. No gym required; scalable progressions "
        "using tempo and density."
    ),
    (4, "Female Minimalist"): (
        "Four-day female minimalist split (upper A/B, legs A/B). "
        "Low volume per session with double-progression loading."
    ),
    (4, "Female PLPL"): (
        "Four-day female push/pull/legs/legs rotation. "
        "Extra lower-body frequency with moderate upper volume."
    ),
    (4, "Female Specialized"): (
        "Four-day female specialization split targeting squats, legs, back, and delts. "
        "Weak-point emphasis for intermediate lifters."
    ),
    (4, "Home HIIT"): (
        "Four-day home HIIT program with timed intervals. "
        "Beginner and advanced scaling via work/rest and load; fat-loss and conditioning focus."
    ),
    (4, "Minimalist"): (
        "Four-day minimalist hypertrophy split with reduced exercise count. "
        "Efficient sessions for intermediate trainees."
    ),
    (4, "Muscle Builder"): (
        "Four-day muscle-building split with moderate-to-high volume. "
        "Standard hypertrophy protocols with top-set/back-off on compounds."
    ),
    (4, "Science Based"): (
        "Four-day evidence-informed hypertrophy program. "
        "Volume and frequency aligned with current research on muscle growth."
    ),
    (5, "Dumbbells"): (
        "Five-day dumbbell hypertrophy program. Higher frequency with DB-only movements "
        "for home or limited-equipment gyms."
    ),
    (5, "Female"): (
        "Five-day female hypertrophy split with dedicated upper and leg sessions. "
        "Higher weekly frequency for lower and upper development."
    ),
    (5, "Muscle Builder"): (
        "Five-day muscle-building split with elevated weekly volume. "
        "Multiple sessions per muscle group for intermediate-to-advanced hypertrophy."
    ),
    (5, "Powerbuilding"): (
        "Five-day powerbuilding split (push, pull, upper, quads, hamstrings). "
        "Heavy compounds plus hypertrophy accessories; requires solid lifting experience."
    ),
    (5, "SBD Strength"): (
        "Five-day squat/bench/deadlift strength block with percentage-based main lifts. "
        "Requires known or estimated 1RMs; 5-week wave culminating in max testing."
    ),
    (6, "Female PPL"): (
        "Six-day female PPL (two rounds per week). High frequency hypertrophy "
        "for experienced female lifters who recover well."
    ),
    (6, "Muscle Builder"): (
        "Six-day muscle-building split — highest frequency in the catalog. "
        "Advanced volume and recovery demands."
    ),
    (6, "PPL"): (
        "Six-day PPL (two rounds per week). High-frequency hypertrophy for advanced lifters "
        "comfortable with push/pull/legs twice weekly."
    ),
}

LEVELS: dict[tuple[int, str], str] = {
    (3, "Dumbbells"): "beginner",
    (3, "Female"): "intermediate",
    (3, "Full Body"): "beginner",
    (3, "Minimal Home"): "beginner",
    (3, "Minimalist"): "beginner",
    (3, "PLFull Body"): "intermediate",
    (3, "Push Pull Legs"): "intermediate",
    (3, "Travel"): "beginner",
    (4, "Beach Body"): "intermediate",
    (4, "Bodyweight"): "beginner",
    (4, "Female Minimalist"): "beginner",
    (4, "Female PLPL"): "intermediate",
    (4, "Female Specialized"): "intermediate",
    (4, "Home HIIT"): "beginner",
    (4, "Minimalist"): "intermediate",
    (4, "Muscle Builder"): "intermediate",
    (4, "Science Based"): "intermediate",
    (5, "Dumbbells"): "intermediate",
    (5, "Female"): "intermediate",
    (5, "Muscle Builder"): "intermediate",
    (5, "Powerbuilding"): "advanced",
    (5, "SBD Strength"): "advanced",
    (6, "Female PPL"): "intermediate",
    (6, "Muscle Builder"): "advanced",
    (6, "PPL"): "advanced",
}

TAGS: dict[tuple[int, str], list[str]] = {
    (3, "Dumbbells"): ["dumbbells", "hypertrophy"],
    (3, "Female"): ["female", "hypertrophy"],
    (3, "Full Body"): ["hypertrophy"],
    (3, "Minimal Home"): ["home", "hypertrophy"],
    (3, "Minimalist"): ["hypertrophy"],
    (3, "PLFull Body"): ["hypertrophy"],
    (3, "Push Pull Legs"): ["hypertrophy"],
    (3, "Travel"): ["travel", "bodyweight"],
    (4, "Beach Body"): ["hypertrophy"],
    (4, "Bodyweight"): ["bodyweight", "hypertrophy"],
    (4, "Female Minimalist"): ["female", "hypertrophy"],
    (4, "Female PLPL"): ["female", "hypertrophy"],
    (4, "Female Specialized"): ["female", "hypertrophy"],
    (4, "Home HIIT"): ["hiit", "home"],
    (4, "Minimalist"): ["hypertrophy"],
    (4, "Muscle Builder"): ["hypertrophy"],
    (4, "Science Based"): ["hypertrophy"],
    (5, "Dumbbells"): ["dumbbells", "hypertrophy"],
    (5, "Female"): ["female", "hypertrophy"],
    (5, "Muscle Builder"): ["hypertrophy"],
    (5, "Powerbuilding"): ["strength", "hypertrophy"],
    (5, "SBD Strength"): ["strength"],
    (6, "Female PPL"): ["female", "hypertrophy"],
    (6, "Muscle Builder"): ["hypertrophy"],
    (6, "PPL"): ["hypertrophy"],
}


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", value.lower()).strip("-")


def sql_literal(value: str) -> str:
    return "'" + value.replace("'", "''") + "'"


def sql_array(values: list[str]) -> str:
    if not values:
        return "array[]::text[]"
    inner = ", ".join(sql_literal(value) for value in values)
    return f"array[{inner}]"


HIIT_DAY_NAMES: dict[int, tuple[str, str, str]] = {
    1: ("lower-body-engine", "Lower Body Engine", "lower"),
    2: ("upper-body-burn", "Upper Body Burn", "upper"),
    3: ("metcon-core", "Metcon Core", "core"),
    4: ("full-body-power", "Full Body Power", "full-body"),
}


def pdf_header_lines(path: Path) -> list[str]:
    text = ""
    for page in PdfReader(str(path)).pages[:1]:
        text += page.extract_text() or ""
    return [line.strip() for line in text.split("\n") if line.strip()]


def extract_day_label(lines: list[str]) -> str | None:
    for line in lines[:12]:
        if "http" in line.lower() or "Training Protocol" in line:
            continue
        program_match = re.search(
            r"^\d+\s*DAY\s+(?:PUSH/PULL/LEGS|MUSCLE BUILDER|FEMALE(?:\s+PPL)?|POWERBUILDING|"
            r"BEACH BOD(?:Y)?|FEMALE MINIMALIST|FEMALE SPECIALIZED|FEMALE PLPL|SCIENCE BASED|"
            r"BODYWEIGHT|MINIMALIST)\s*-\s*(.+)$",
            line,
            re.I,
        )
        if program_match:
            return program_match.group(1).strip()
        sbd_match = re.search(r"^SBD Strength Program\s*-\s*(.+)$", line, re.I)
        if sbd_match:
            return sbd_match.group(1).strip()
        hiit_match = re.search(r"^DAY\s+\(([^)]+)\)", line, re.I)
        if hiit_match:
            return hiit_match.group(1).strip()
        circuit_match = re.search(r"HOTEL/TRAVEL PROGRAM\s*-\s*(.+)$", line, re.I)
        if circuit_match:
            return circuit_match.group(1).strip()
    return None


def prettify_day_name(raw: str) -> str:
    cleaned = re.sub(r"\s*@\s*\d+%\)?", "", raw, flags=re.I)
    cleaned = re.sub(r"\s+", " ", cleaned).strip()
    if "(" in cleaned and ")" not in cleaned:
        cleaned = f"{cleaned})"
    if cleaned.isupper():
        return cleaned.title()
    return cleaned


def day_from_filename(path: Path, index: int, program_slug: str) -> tuple[str, str, str]:
    stem = path.stem.strip()
    prefix_match = re.match(r"^\d+[A-Z]{2,4}_(.+)$", stem, re.I)
    if prefix_match:
        raw = prefix_match.group(1).replace("_", " ").strip()
        slug = slugify(raw)
        name = raw.replace("(", " (").replace("  ", " ").strip()
        focus = slug.split("-")[0] if slug else f"day-{index}"
        return slug, prettify_day_name(name), focus

    if program_slug == "4-home-hiit" and index in HIIT_DAY_NAMES:
        return HIIT_DAY_NAMES[index]

    label = extract_day_label(pdf_header_lines(path))
    if label:
        slug = slugify(label)
        if len(slug) > 60:
            slug = f"day-{index:02d}"
        focus = slug.split("-")[0] if slug else f"day-{index}"
        return slug or f"day-{index:02d}", prettify_day_name(label), focus

    slug = f"day-{index:02d}"
    return slug, f"Day {index}", slug


def main() -> None:
    program_rows: list[str] = []
    day_rows: list[str] = []

    for folder in sorted(ROOT.iterdir()):
        if not folder.is_dir():
            continue
        match = re.match(r"^(\d+)\s+(.+)$", folder.name)
        if not match:
            continue
        dpw = int(match.group(1))
        display = match.group(2)
        key = (dpw, display)
        slug = f"{dpw}-{slugify(display)}"
        name = f"{dpw} Day {display}"
        description = DESCRIPTIONS[key]
        level = LEVELS[key]
        tags = TAGS[key]

        program_rows.append(
            "  (\n"
            f"    {sql_literal(slug)},\n"
            f"    {sql_literal(name)},\n"
            f"    {sql_literal(description)},\n"
            f"    {sql_literal(level)}::public.program_level,\n"
            f"    {dpw}::smallint,\n"
            f"    false,\n"
            f"    {sql_array(tags)},\n"
            f"    {sql_literal(folder.name)}\n"
            "  )"
        )

        pdfs = sorted(folder.glob("*.pdf"))
        for index, pdf in enumerate(pdfs, start=1):
            day_slug, day_name, focus = day_from_filename(pdf, index, slug)
            day_rows.append(
                "  (\n"
                f"    {sql_literal(slug)},\n"
                f"    {sql_literal(day_slug)},\n"
                f"    {index}::smallint,\n"
                f"    {sql_literal(day_name)},\n"
                f"    {index}::smallint,\n"
                f"    {sql_literal(focus)}\n"
                "  )"
            )

    sql = f"""-- Idempotent seed: 25 Drive workout programs and 103 program days.
-- Exercise prescriptions are imported separately; catalog metadata only.
-- UPSERT by stable slug; never DELETE catalog rows.

insert into public.programs (
  slug,
  name,
  description,
  level,
  days_per_week,
  is_published,
  tags,
  source_folder
)
values
{",\n".join(program_rows)}
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  level = excluded.level,
  days_per_week = excluded.days_per_week,
  is_published = excluded.is_published,
  tags = excluded.tags,
  source_folder = excluded.source_folder;

insert into public.program_days (program_id, slug, day_index, name, sort_order, focus)
select p.id, v.day_slug, v.day_index, v.day_name, v.sort_order, v.focus
from public.programs p
join (
  values
{",\n".join(day_rows)}
) as v (program_slug, day_slug, day_index, day_name, sort_order, focus)
  on p.slug = v.program_slug
on conflict (program_id, slug) do update set
  day_index = excluded.day_index,
  name = excluded.name,
  sort_order = excluded.sort_order,
  focus = excluded.focus;

-- Backfill Starting Strength metadata from schema extension migration.
update public.programs
set
  level = 'intermediate'::public.program_level,
  tags = array['strength']::text[]
where slug = 'starting-strength-mvp'
  and (level is null or tags = '{{}}'::text[]);
"""

    OUT.write_text(sql, encoding="utf-8")
    print(f"Wrote {OUT}")
    print(f"Programs: {len(program_rows)}, Days: {len(day_rows)}")


if __name__ == "__main__":
    main()
