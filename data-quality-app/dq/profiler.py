"""
Phase 2 — Dataset Profiling

Generate rows, columns, missing %, unique %, duplicates, memory, dtypes,
distributions, top/bottom values — like a doctor checking a patient.
"""

from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd


def profile_dataset(df: pd.DataFrame, top_n: int = 5) -> dict[str, Any]:
    """Full dataset + per-column profile."""
    n_rows, n_cols = df.shape
    dup_rows = int(df.duplicated().sum())
    mem = float(df.memory_usage(deep=True).sum())

    overview = {
        "rows": n_rows,
        "columns": n_cols,
        "column_names": list(df.columns),
        "duplicate_rows": dup_rows,
        "duplicate_row_pct": round(100.0 * dup_rows / n_rows, 2) if n_rows else 0.0,
        "memory_bytes": mem,
        "memory_human": _human_bytes(mem),
        "total_cells": n_rows * n_cols,
        "total_missing_cells": int(df.isna().sum().sum()),
    }

    columns = [profile_column(df, col, top_n=top_n) for col in df.columns]
    return {"overview": overview, "columns": columns}


def profile_column(df: pd.DataFrame, col: str, top_n: int = 5) -> dict[str, Any]:
    """Profile a single column."""
    s = df[col]
    n = len(s)
    missing = int(s.isna().sum())
    # Also count empty strings as missing-ish for object cols
    empty = 0
    if s.dtype == object or pd.api.types.is_string_dtype(s):
        empty = int((s.astype(str).str.strip() == "").sum()) if n else 0

    non_null = s.dropna()
    n_unique = int(non_null.nunique())
    unique_pct = round(100.0 * n_unique / n, 2) if n else 0.0
    missing_pct = round(100.0 * missing / n, 2) if n else 0.0

    top_values = _value_counts_safe(non_null, top_n, ascending=False)
    bottom_values = _value_counts_safe(non_null, top_n, ascending=True)

    dtype_name = str(s.dtype)
    inferred = _simple_type_label(s)

    problems = _detect_column_problems(s)

    result: dict[str, Any] = {
        "name": col,
        "dtype": dtype_name,
        "inferred_type": inferred,
        "count": n,
        "missing": missing,
        "missing_pct": missing_pct,
        "empty_strings": empty,
        "unique": n_unique,
        "unique_pct": unique_pct,
        "top_values": top_values,
        "bottom_values": bottom_values,
        "problems": problems,
    }

    # Numeric distribution (skip bool / non-numeric)
    if pd.api.types.is_bool_dtype(s):
        vc = non_null.astype(str).value_counts(normalize=True).head(10)
        result["distribution"] = {
            "type": "boolean",
            "top_share": {str(k): round(float(v) * 100, 2) for k, v in vc.items()},
        }
    else:
        numeric = pd.to_numeric(non_null, errors="coerce")
        # Force float to avoid bool quantile errors after type casts
        numeric = numeric.dropna().astype(float)
        if len(numeric) >= 2 and len(numeric) >= 0.5 * len(non_null):
            result["distribution"] = {
                "min": float(numeric.min()),
                "max": float(numeric.max()),
                "mean": float(numeric.mean()),
                "median": float(numeric.median()),
                "std": float(numeric.std()) if len(numeric) > 1 else 0.0,
                "q25": float(numeric.quantile(0.25)),
                "q75": float(numeric.quantile(0.75)),
            }
        elif len(non_null):
            vc = non_null.astype(str).value_counts(normalize=True).head(10)
            result["distribution"] = {
                "type": "categorical",
                "top_share": {str(k): round(float(v) * 100, 2) for k, v in vc.items()},
            }

    return result


def _value_counts_safe(s: pd.Series, n: int, ascending: bool = False) -> list[dict]:
    if s.empty:
        return []
    try:
        vc = s.astype(str).value_counts(ascending=ascending).head(n)
        return [{"value": str(k), "count": int(v)} for k, v in vc.items()]
    except Exception:
        return []


def _simple_type_label(s: pd.Series) -> str:
    if pd.api.types.is_bool_dtype(s):
        return "Boolean"
    if pd.api.types.is_integer_dtype(s):
        return "Integer"
    if pd.api.types.is_float_dtype(s):
        return "Float"
    if pd.api.types.is_datetime64_any_dtype(s):
        return "DateTime"
    # Heuristic for object columns
    sample = s.dropna().head(100)
    if sample.empty:
        return "Empty"
    # Try numeric
    coerced = pd.to_numeric(sample, errors="coerce")
    if coerced.notna().mean() > 0.9:
        if (coerced.dropna() % 1 == 0).all():
            return "Integer (stored as text)"
        return "Float (stored as text)"
    return "Text"


def _detect_column_problems(s: pd.Series) -> list[str]:
    problems = []
    non_null = s.dropna()
    if non_null.empty:
        problems.append("All values missing")
        return problems

    if s.dtype == object or pd.api.types.is_string_dtype(s):
        as_str = non_null.astype(str)
        # Inconsistent capitalization
        lowered = as_str.str.lower().str.strip()
        if lowered.nunique() < as_str.nunique() and as_str.nunique() <= 50:
            problems.append("Inconsistent capitalization")
        # Leading/trailing whitespace
        if (as_str != as_str.str.strip()).any():
            problems.append("Leading/trailing whitespace")
        # Mixed numeric/text
        numeric_mask = pd.to_numeric(as_str, errors="coerce").notna()
        if 0.1 < numeric_mask.mean() < 0.9:
            problems.append("Mixed numeric and text values")

    missing_pct = s.isna().mean()
    if missing_pct > 0.5:
        problems.append(f"High missing rate ({missing_pct*100:.0f}%)")
    elif missing_pct > 0.2:
        problems.append(f"Moderate missing rate ({missing_pct*100:.0f}%)")

    return problems


def _human_bytes(n: float) -> str:
    for unit in ("B", "KB", "MB", "GB"):
        if abs(n) < 1024:
            return f"{n:.1f} {unit}"
        n /= 1024
    return f"{n:.1f} TB"


def profile_summary_table(profile: dict) -> list[dict]:
    """Flat table suitable for CLI / reports."""
    rows = []
    for col in profile["columns"]:
        top = col["top_values"][0]["value"] if col["top_values"] else "—"
        rows.append({
            "Column": col["name"],
            "Type": col["inferred_type"],
            "Unique": col["unique"],
            "Missing %": col["missing_pct"],
            "Top Value": top,
            "Problems": "; ".join(col["problems"]) or "—",
        })
    return rows
