"""
Phase 5 — Duplicate Analysis

Exact duplicates + case/whitespace variants + fuzzy near-duplicates
(e.g. John Smith vs John Smyth).
"""

from __future__ import annotations

from typing import Any, Optional

import pandas as pd

try:
    from rapidfuzz import fuzz
    HAS_RAPIDFUZZ = True
except ImportError:
    HAS_RAPIDFUZZ = False


def analyze_duplicates(
    df: pd.DataFrame,
    *,
    subset: Optional[list[str]] = None,
    fuzzy_columns: Optional[list[str]] = None,
    fuzzy_threshold: int = 90,
    max_fuzzy_pairs: int = 200,
) -> dict[str, Any]:
    """
    Detect exact, normalized, and fuzzy duplicate groups.
    """
    n = len(df)
    cols = subset or list(df.columns)

    # Exact full-row duplicates
    exact_mask = df.duplicated(keep=False)
    exact_count = int(df.duplicated().sum())
    exact_groups = int(df[exact_mask].groupby(list(df.columns), dropna=False).ngroups) if exact_mask.any() else 0

    # Normalized duplicates (case + strip + collapse spaces) on subset
    normalized = _normalize_frame(df[cols])
    norm_dup_mask = normalized.duplicated(keep=False)
    norm_extra = int(normalized.duplicated().sum())

    # Case-insensitive string column duplicates
    case_issues = []
    for col in df.columns:
        if df[col].dtype == object or pd.api.types.is_string_dtype(df[col]):
            s = df[col].dropna().astype(str)
            if s.empty:
                continue
            stripped = s.str.strip()
            lowered = stripped.str.lower().str.replace(r"\s+", " ", regex=True)
            if lowered.nunique() < stripped.nunique():
                # Show variants that collapse
                variants = (
                    pd.DataFrame({"raw": stripped, "key": lowered})
                    .groupby("key")["raw"]
                    .nunique()
                )
                multi = variants[variants > 1]
                examples = []
                for key in multi.head(10).index:
                    examples.append(sorted(stripped[lowered == key].unique().tolist())[:5])
                case_issues.append({
                    "column": col,
                    "collapsed_groups": int(len(multi)),
                    "examples": examples,
                })

    # Fuzzy matching on selected text columns
    fuzzy_cols = fuzzy_columns or _guess_fuzzy_columns(df)
    fuzzy_pairs = []
    for col in fuzzy_cols:
        if col not in df.columns:
            continue
        pairs = find_fuzzy_duplicates(df[col], threshold=fuzzy_threshold, max_pairs=max_fuzzy_pairs)
        if pairs:
            fuzzy_pairs.append({"column": col, "pairs": pairs})

    return {
        "rows": n,
        "exact_duplicate_rows": exact_count,
        "exact_duplicate_pct": round(100.0 * exact_count / n, 2) if n else 0.0,
        "exact_duplicate_groups": exact_groups,
        "normalized_duplicate_rows": norm_extra,
        "normalized_duplicate_pct": round(100.0 * norm_extra / n, 2) if n else 0.0,
        "case_whitespace_issues": case_issues,
        "fuzzy_near_duplicates": fuzzy_pairs,
        "fuzzy_threshold": fuzzy_threshold,
    }


def _normalize_frame(df: pd.DataFrame) -> pd.DataFrame:
    out = df.copy()
    for col in out.columns:
        if out[col].dtype == object or pd.api.types.is_string_dtype(out[col]):
            out[col] = (
                out[col]
                .astype(str)
                .str.strip()
                .str.lower()
                .str.replace(r"\s+", " ", regex=True)
            )
    return out


def _guess_fuzzy_columns(df: pd.DataFrame) -> list[str]:
    name_hints = ("name", "full_name", "firstname", "lastname", "company", "address", "city")
    picks = []
    for col in df.columns:
        cl = col.lower()
        if any(h in cl for h in name_hints):
            picks.append(col)
        elif df[col].dtype == object or pd.api.types.is_string_dtype(df[col]):
            s = df[col].dropna().astype(str)
            if 5 < s.nunique() < min(500, max(len(s) * 0.8, 6)):
                avg_len = s.str.len().mean()
                if avg_len and avg_len > 3:
                    picks.append(col)
    return picks[:5]


def find_fuzzy_duplicates(
    series: pd.Series,
    threshold: int = 90,
    max_pairs: int = 200,
) -> list[dict]:
    """Find near-duplicate string pairs using rapidfuzz (or difflib fallback)."""
    values = (
        series.dropna()
        .astype(str)
        .str.strip()
        .loc[lambda s: s != ""]
        .unique()
        .tolist()
    )
    # Cap uniqueness for performance
    if len(values) > 400:
        values = values[:400]

    pairs = []
    for i in range(len(values)):
        for j in range(i + 1, len(values)):
            a, b = values[i], values[j]
            if a.lower() == b.lower():
                continue  # handled by case analysis
            score = _similarity(a, b)
            if score >= threshold:
                pairs.append({
                    "value_a": a,
                    "value_b": b,
                    "similarity": round(score, 1),
                })
                if len(pairs) >= max_pairs:
                    return sorted(pairs, key=lambda x: -x["similarity"])
    return sorted(pairs, key=lambda x: -x["similarity"])


def _similarity(a: str, b: str) -> float:
    if HAS_RAPIDFUZZ:
        return float(fuzz.token_sort_ratio(a, b))
    # Fallback
    from difflib import SequenceMatcher
    return SequenceMatcher(None, a.lower(), b.lower()).ratio() * 100


def drop_exact_duplicates(df: pd.DataFrame, keep: str = "first") -> pd.DataFrame:
    return df.drop_duplicates(keep=keep).reset_index(drop=True)
