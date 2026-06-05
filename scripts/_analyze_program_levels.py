"""One-off analysis of Drive workout PDFs for program level classification."""
from __future__ import annotations

import json
import re
import statistics
from collections import Counter
from pathlib import Path

from pypdf import PdfReader

ROOT = Path(r"G:\My Drive\1 Project\_Fitness\Workout Plans")

LEVEL_OVERRIDES: dict[tuple[int, str], str] = {
    (3, "Travel"): "beginner",
    (3, "Minimal Home"): "beginner",
    (3, "Dumbbells"): "beginner",
    (3, "Minimalist"): "beginner",
    (3, "Full Body"): "beginner",
    (3, "Female"): "intermediate",
    (3, "Push Pull Legs"): "intermediate",
    (3, "PLFull Body"): "intermediate",
    (4, "Bodyweight"): "beginner",
    (4, "Female Minimalist"): "beginner",
    (4, "Home HIIT"): "beginner",
    (4, "Minimalist"): "intermediate",
    (4, "Beach Body"): "intermediate",
    (4, "Female Specialized"): "intermediate",
    (4, "Female PLPL"): "intermediate",
    (4, "Science Based"): "intermediate",
    (4, "Muscle Builder"): "intermediate",
    (5, "Dumbbells"): "intermediate",
    (5, "Female"): "intermediate",
    (5, "Muscle Builder"): "intermediate",
    (5, "Powerbuilding"): "advanced",
    (5, "SBD Strength"): "advanced",
    (6, "PPL"): "advanced",
    (6, "Female PPL"): "intermediate",
    (6, "Muscle Builder"): "advanced",
}

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


def slugify(name: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def analyze_pdf(path: Path) -> dict:
    text = ""
    for page in PdfReader(str(path)).pages:
        text += page.extract_text() or ""
    upper = text.upper()
    lines = [line.strip() for line in text.split("\n") if line.strip()]
    title = ""
    subtitle = ""
    for index, line in enumerate(lines[:20]):
        if not title and re.search(r"PROGRAM|SPLIT|CIRCUIT|Strength", line, re.I):
            title = line
        if title and index > 0 and len(line) > 40 and "http" not in line and "Training Protocol" not in line:
            subtitle = line
            break
    rests = [int(value) for value in re.findall(r"REST\s*(\d+)s", text)]
    return {
        "title": title[:100],
        "subtitle": subtitle[:200],
        "exercises": len(re.findall(r"\n\d+\.\s+[A-Za-z]", text)),
        "supersets": len(re.findall(r"SUPERSET", upper)),
        "percentage": bool(re.search(r"PERCENTAGE|1\s*RM|1RM", upper)),
        "hiit": bool(re.search(r"INTERVAL|sec REST|mins", text, re.I)),
        "top_set": "TOP SET" in upper or "BACK OFF" in upper,
        "avg_rest": round(statistics.mean(rests)) if rests else None,
        "max_rest": max(rests) if rests else None,
    }


def score_program(dpw: int, name: str, days: list[dict]) -> int:
    avg_ex = sum(day["exercises"] for day in days) / len(days)
    total_ss = sum(day["supersets"] for day in days)
    any_pct = any(day["percentage"] for day in days)
    any_top = any(day["top_set"] for day in days)
    max_rest = max((day["max_rest"] or 0) for day in days)

    score = 0
    if dpw >= 6:
        score += 3
    elif dpw >= 5:
        score += 2
    elif dpw >= 4:
        score += 1
    if avg_ex >= 26:
        score += 2
    elif avg_ex >= 22:
        score += 1
    if any_pct:
        score += 3
    if total_ss >= 3:
        score += 1
    if any_top:
        score += 1
    if max_rest >= 300:
        score += 1
    lowered = name.lower()
    if "travel" in lowered or "minimal home" in lowered:
        score -= 2
    if "bodyweight" in lowered:
        score -= 1
    if "powerbuilding" in lowered or "sbd" in lowered:
        score += 2
    if "muscle builder" in lowered:
        score += 1
    return score


def heuristic_level(score: int) -> str:
    if score <= 1:
        return "beginner"
    if score <= 4:
        return "intermediate"
    return "advanced"


def main() -> None:
    programs = []
    for folder in sorted(ROOT.iterdir()):
        if not folder.is_dir():
            continue
        pdfs = sorted(folder.glob("*.pdf"))
        days = [analyze_pdf(pdf) for pdf in pdfs]
        match = re.match(r"^(\d+)\s+(.+)$", folder.name)
        dpw = int(match.group(1)) if match else 0
        name = match.group(2) if match else folder.name
        key = (dpw, name)
        score = score_program(dpw, name, days)
        level = LEVEL_OVERRIDES.get(key, heuristic_level(score))
        subtitle = next((day["subtitle"] for day in days if day["subtitle"]), "")
        programs.append(
            {
                "slug": f"{dpw}-{slugify(name)}",
                "name": f"{dpw} Day {name}",
                "days_per_week": dpw,
                "display_name": name,
                "level": level,
                "score": score,
                "description": DESCRIPTIONS.get(key, subtitle or f"{dpw}-day {name} training program."),
                "avg_exercises_per_day": round(sum(d["exercises"] for d in days) / len(days), 1),
                "percentage_based": any(d["percentage"] for d in days),
                "hiit": any(d["hiit"] for d in days),
                "source_folder": folder.name,
            }
        )

    print(json.dumps(programs, indent=2))
    print("\nLEVELS:", dict(Counter(program["level"] for program in programs)))


if __name__ == "__main__":
    main()
