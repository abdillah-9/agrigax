"""
Phase 7 — Range Validation

Flag values outside expected ranges (e.g. survey 1–5 found 7, age -5).
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Optional

import pandas as pd
import yaml


DEFAULT_RANGES = {
    "age": {"min": 0, "max": 120},
    "income": {"min": 0, "max": None},
    "salary": {"min": 0, "max": None},
    "score": {"min": 1, "max": 5},
    "rating": {"min": 1, "max": 5},
    "latitude": {"min": -90, "max": 90},
    "longitude": {"min": -180, "max": 180},
    "lat": {"min": -90, "max": 90},
    "lon": {"min": -180, "max": 180},
    "lng": {"min": -180, "max": 180},
    "percentage": {"min": 0, "max": 100},
    "percent": {"min": 0, "max": 100},
    "probability": {"min": 0, "max": 1},
}


def load_ranges(config_path: Optional[str] = None) -> dict[str, dict]:
    ranges = dict(DEFAULT_RANGES)
    if config_path and Path(config_path).exists():
        with open(config_path, encoding="utf-8") as f:
            cfg = yaml.safe_load(f) or {}
        user_ranges = cfg.get("ranges") or {}
        for k, v in user_ranges.items():
            ranges[k.lower()] = v
    return ranges


def validate_ranges(
    df: pd.DataFrame,
    ranges: Optional[dict[str, dict]] = None,
    extra_ranges: Optional[dict[str, dict]] = None,
) -> dict[str, Any]:
    """Validate numeric columns against configured min/max ranges."""
    ranges = dict(ranges or DEFAULT_RANGES)
    if extra_ranges:
        ranges.update({k.lower(): v for k, v in extra_ranges.items()})

    issues = []
    for col in df.columns:
        constraint = _resolve_constraint(col, ranges)
        if not constraint:
            # Auto-suggest from data for unknown numeric cols? Skip unless named.
            continue

        numeric = pd.to_numeric(df[col], errors="coerce")
        valid_mask = numeric.notna()
        if not valid_mask.any():
            continue

        lo = constraint.get("min")
        hi = constraint.get("max")
        violations = pd.Series(False, index=df.index)
        reasons = []

        if lo is not None:
            below = valid_mask & (numeric < lo)
            if below.any():
                violations |= below
                reasons.append(f"below min {lo}")
        if hi is not None:
            above = valid_mask & (numeric > hi)
            if above.any():
                violations |= above
                reasons.append(f"above max {hi}")

        n_viol = int(violations.sum())
        if n_viol == 0:
            continue

        viol_vals = numeric[violations]
        examples = [
            {"row": int(idx) if isinstance(idx, (int, float)) else idx, "value": float(val)}
            for idx, val in viol_vals.head(10).items()
        ]

        issues.append({
            "column": col,
            "min": lo,
            "max": hi,
            "violations": n_viol,
            "violation_pct": round(100.0 * n_viol / len(df), 2),
            "reasons": reasons,
            "examples": examples,
            "severity_min": float(viol_vals.min()),
            "worst_max": float(viol_vals.max()),
            "severity": "warning" if n_viol / len(df) < 0.05 else "critical",
        })

    return {
        "issues": issues,
        "columns_checked": [
            c for c in df.columns if _resolve_constraint(c, ranges)
        ],
        "total_violations": sum(i["violations"] for i in issues),
    }


def _resolve_constraint(col: str, ranges: dict) -> Optional[dict]:
    cl = col.lower().strip()
    if cl in ranges:
        return ranges[cl]
    # Partial match: age_years -> age
    for key, constraint in ranges.items():
        if key == cl or cl.endswith("_" + key) or cl.startswith(key + "_") or key in cl.split("_"):
            return constraint
    return None


def suggest_ranges_from_data(df: pd.DataFrame) -> dict[str, dict]:
    """Suggest IQR-based soft ranges for numeric columns (informational)."""
    suggestions = {}
    for col in df.columns:
        numeric = pd.to_numeric(df[col], errors="coerce").dropna()
        if len(numeric) < 10:
            continue
        q1, q3 = numeric.quantile(0.25), numeric.quantile(0.75)
        iqr = q3 - q1
        suggestions[col] = {
            "min": float(q1 - 1.5 * iqr),
            "max": float(q3 + 1.5 * iqr),
            "method": "IQR 1.5",
            "note": "Soft statistical range — not a business rule",
        }
    return suggestions
