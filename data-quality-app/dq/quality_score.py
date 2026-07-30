"""
Phase 13 — Quality Score

Antivirus-style score: Dataset Quality 82% ⭐⭐⭐⭐☆
Problems / Critical / Warnings / Suggestions.
"""

from __future__ import annotations

from typing import Any


def compute_quality_score(findings: dict[str, Any]) -> dict[str, Any]:
    """
    Aggregate all analysis findings into a single quality score.

    findings keys (optional):
      profile, types, missing, duplicates, formatting, ranges,
      business_rules, outliers, encoding, text
    """
    problems: list[dict] = []

    # Missing
    for col in (findings.get("missing") or {}).get("columns", []):
        pct = col.get("missing_pct", 0)
        if pct <= 0:
            continue
        severity = "critical" if pct > 40 else ("warning" if pct > 10 else "suggestion")
        problems.append({
            "category": "missing",
            "severity": severity,
            "column": col["name"],
            "message": f"{col['name']}: {pct}% missing-like values",
            "detail": col.get("recommendation"),
        })

    # Duplicates
    dup = findings.get("duplicates") or {}
    if dup.get("exact_duplicate_rows", 0) > 0:
        pct = dup.get("exact_duplicate_pct", 0)
        problems.append({
            "category": "duplicates",
            "severity": "warning" if pct < 10 else "critical",
            "column": None,
            "message": f"{dup['exact_duplicate_rows']} exact duplicate rows ({pct}%)",
        })
    for issue in dup.get("case_whitespace_issues", []):
        problems.append({
            "category": "duplicates",
            "severity": "suggestion",
            "column": issue["column"],
            "message": f"{issue['column']}: {issue['collapsed_groups']} case/whitespace variant groups",
        })
    for fuzzy in dup.get("fuzzy_near_duplicates", []):
        n = len(fuzzy.get("pairs", []))
        if n:
            problems.append({
                "category": "duplicates",
                "severity": "warning",
                "column": fuzzy["column"],
                "message": f"{fuzzy['column']}: {n} fuzzy near-duplicate pairs",
            })

    # Formatting
    for issue in (findings.get("formatting") or {}).get("text_formatting", []):
        if issue.get("inconsistent"):
            problems.append({
                "category": "formatting",
                "severity": "suggestion",
                "column": issue["column"],
                "message": f"{issue['column']}: inconsistent text formatting",
            })
    for issue in (findings.get("formatting") or {}).get("date_formatting", []):
        if len(issue.get("formats_detected", [])) > 1:
            problems.append({
                "category": "formatting",
                "severity": "warning",
                "column": issue["column"],
                "message": f"{issue['column']}: mixed date formats {issue['formats_detected']}",
            })

    # Ranges
    for issue in (findings.get("ranges") or {}).get("issues", []):
        problems.append({
            "category": "range",
            "severity": issue.get("severity", "warning"),
            "column": issue["column"],
            "message": (
                f"{issue['column']}: {issue['violations']} values outside "
                f"[{issue.get('min')}, {issue.get('max')}]"
            ),
        })

    # Business rules
    for rule in (findings.get("business_rules") or {}).get("results", []):
        if rule.get("violations", 0) > 0:
            problems.append({
                "category": "business_rule",
                "severity": rule.get("severity", "warning"),
                "column": None,
                "message": f"Rule '{rule['name']}': {rule['violations']} violations",
                "rule_id": rule.get("id"),
            })

    # Outliers — consensus
    for col, info in (findings.get("outliers") or {}).get("columns", {}).items():
        n = info.get("consensus_count", 0)
        if n > 0:
            problems.append({
                "category": "outlier",
                "severity": "warning" if n < 10 else "critical",
                "column": col,
                "message": f"{col}: {n} consensus outlier(s)",
            })

    # Types needing cast
    for col in (findings.get("types") or {}).get("summary", {}).get("columns_needing_cast", []):
        info = (findings.get("types") or {}).get("columns", {}).get(col, {})
        problems.append({
            "category": "type",
            "severity": "suggestion",
            "column": col,
            "message": (
                f"{col}: stored as {info.get('storage_dtype')}, "
                f"inferred {info.get('semantic_type')}"
            ),
        })

    # Encoding
    enc = findings.get("encoding") or {}
    if enc.get("total_mojibake_values", 0) > 0:
        problems.append({
            "category": "encoding",
            "severity": "warning",
            "column": None,
            "message": f"{enc['total_mojibake_values']} mojibake value(s) detected",
        })

    # Profile problems
    for col in (findings.get("profile") or {}).get("columns", []):
        for p in col.get("problems", []):
            if "High missing" in p:
                continue  # already counted
            problems.append({
                "category": "profile",
                "severity": "suggestion",
                "column": col["name"],
                "message": f"{col['name']}: {p}",
            })

    critical = [p for p in problems if p["severity"] == "critical"]
    warnings = [p for p in problems if p["severity"] == "warning"]
    suggestions = [p for p in problems if p["severity"] == "suggestion"]

    # Score: start 100, deduct
    score = 100.0
    score -= min(40, len(critical) * 8)
    score -= min(30, len(warnings) * 3)
    score -= min(15, len(suggestions) * 1)
    # Extra penalties from volume
    missing_total = (findings.get("missing") or {}).get("total_missing_like_cells", 0)
    overview = (findings.get("profile") or {}).get("overview") or {}
    cells = overview.get("total_cells") or 1
    missing_ratio = missing_total / cells
    score -= min(20, missing_ratio * 100)

    score = max(0.0, min(100.0, round(score, 1)))
    stars = _stars(score)

    return {
        "score": score,
        "score_label": f"{score:.0f}%",
        "stars": stars,
        "stars_display": "⭐" * stars + "☆" * (5 - stars),
        "grade": _grade(score),
        "problems_total": len(problems),
        "critical": len(critical),
        "warnings": len(warnings),
        "suggestions": len(suggestions),
        "problems": problems,
        "summary_line": (
            f"Dataset Quality {score:.0f}%  {('⭐' * stars) + ('☆' * (5 - stars))}  "
            f"— Problems {len(problems)} | Critical {len(critical)} | "
            f"Warnings {len(warnings)} | Suggestions {len(suggestions)}"
        ),
    }


def _stars(score: float) -> int:
    if score >= 90:
        return 5
    if score >= 75:
        return 4
    if score >= 60:
        return 3
    if score >= 40:
        return 2
    if score >= 20:
        return 1
    return 0


def _grade(score: float) -> str:
    if score >= 90:
        return "A"
    if score >= 80:
        return "B"
    if score >= 70:
        return "C"
    if score >= 60:
        return "D"
    return "F"
