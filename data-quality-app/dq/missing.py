"""
Phase 4 — Missing Value Analysis

Detect NULL, NaN, empty string, Unknown, N/A, 999, -99, etc.
Recommend: Remove, Median, Mode, Regression, Interpolation, Leave, Multiple Imputation.
"""

from __future__ import annotations

from typing import Any, Optional

import numpy as np
import pandas as pd
import yaml
from pathlib import Path


DEFAULT_SENTINELS = [
    "999", "-99", "-999", "99", "N/A", "n/a", "NA", "na",
    "NULL", "null", "None", "none", "Unknown", "unknown", "UNK",
    ".", "", " ", "#", "missing", "Missing", "MISSING",
    "NaN", "nan", "-", "--", "nil", "Nil",
]


def load_sentinels(config_path: Optional[str] = None) -> list[str]:
    if config_path and Path(config_path).exists():
        with open(config_path, encoding="utf-8") as f:
            cfg = yaml.safe_load(f) or {}
        return list(cfg.get("missing_sentinels", DEFAULT_SENTINELS))
    return list(DEFAULT_SENTINELS)


def analyze_missing(
    df: pd.DataFrame,
    sentinels: Optional[list[str]] = None,
) -> dict[str, Any]:
    """Detect all forms of missingness and recommend strategies."""
    sentinels = sentinels or DEFAULT_SENTINELS
    sentinel_set = {str(s).strip().lower() for s in sentinels}

    columns = []
    total_issues = 0

    for col in df.columns:
        result = analyze_column_missing(df[col], col, sentinel_set)
        columns.append(result)
        total_issues += result["total_missing_like"]

    return {
        "columns": columns,
        "total_missing_like_cells": total_issues,
        "sentinels_used": sorted(sentinel_set),
        "columns_with_issues": [c["name"] for c in columns if c["total_missing_like"] > 0],
    }


def analyze_column_missing(
    s: pd.Series,
    name: str,
    sentinel_set: set[str],
) -> dict[str, Any]:
    n = len(s)
    nan_count = int(s.isna().sum())

    # Empty strings
    empty_count = 0
    sentinel_counts: dict[str, int] = {}
    as_str = None

    if s.dtype == object or pd.api.types.is_string_dtype(s) or True:
        as_str = s.astype(str)
        # Exclude actual NaN string representations from pandas
        mask_not_na = s.notna()
        stripped = as_str.where(mask_not_na, other=pd.NA)
        empty_count = int(((stripped == "") | (stripped.str.strip() == "")).sum()) if mask_not_na.any() else 0

        for val in stripped.dropna().unique():
            key = str(val).strip().lower()
            if key in sentinel_set and key not in ("", " "):
                cnt = int((stripped.astype(str).str.strip().str.lower() == key).sum())
                if cnt:
                    sentinel_counts[str(val)] = cnt

    # Numeric sentinels (999, -99) even in numeric columns
    numeric = pd.to_numeric(s, errors="coerce")
    for sent in ("999", "-99", "-999", "99"):
        try:
            num_sent = float(sent)
            cnt = int((numeric == num_sent).sum())
            if cnt and sent not in {str(k) for k in sentinel_counts}:
                # Only flag if it looks like a sentinel (rare extreme or survey code)
                if _looks_like_sentinel(numeric, num_sent):
                    sentinel_counts[sent] = cnt
        except ValueError:
            pass

    sentinel_total = sum(sentinel_counts.values())
    # Avoid double-counting empties already in sentinels
    total_missing_like = nan_count + empty_count + sentinel_total
    # Cap at n
    total_missing_like = min(total_missing_like, n)
    pct = round(100.0 * total_missing_like / n, 2) if n else 0.0

    recommendation = recommend_imputation(s, total_missing_like, pct)

    return {
        "name": name,
        "rows": n,
        "nan": nan_count,
        "empty_string": empty_count,
        "sentinels": sentinel_counts,
        "total_missing_like": total_missing_like,
        "missing_pct": pct,
        "recommendation": recommendation,
    }


def _looks_like_sentinel(numeric: pd.Series, value: float) -> bool:
    """Heuristic: value is sentinel if it's an extreme code used rarely."""
    vals = numeric.dropna()
    if vals.empty:
        return False
    share = (vals == value).mean()
    if share == 0:
        return False
    # Common survey missing codes
    if value in (99, 999, -99, -999, 9, -9) and share < 0.3:
        # And it's near the max/min or isolated
        if value >= vals.quantile(0.95) or value <= vals.quantile(0.05):
            return True
        if value in (99, 999, -99, -999):
            return True
    return False


def recommend_imputation(
    s: pd.Series,
    missing_count: int,
    missing_pct: float,
) -> dict[str, Any]:
    """Recommend a strategy with confidence and reason."""
    if missing_count == 0:
        return {
            "action": "Leave",
            "confidence": 1.0,
            "reason": "No missing values detected.",
        }

    if missing_pct > 60:
        return {
            "action": "Remove",
            "confidence": 0.85,
            "reason": f"Column is {missing_pct}% missing — imputation may distort results.",
        }

    if missing_pct > 40:
        return {
            "action": "Multiple Imputation",
            "confidence": 0.75,
            "reason": "High missingness; multiple imputation better preserves uncertainty.",
        }

    numeric = pd.to_numeric(s, errors="coerce")
    numeric_ratio = numeric.notna().mean()

    if numeric_ratio > 0.7:
        vals = numeric.dropna()
        if len(vals) < 3:
            return {
                "action": "Median",
                "confidence": 0.6,
                "reason": "Too few values for robust distribution analysis.",
            }
        skew = float(vals.skew()) if len(vals) > 2 else 0.0
        if abs(skew) > 1.0:
            return {
                "action": "Median",
                "confidence": 0.94,
                "reason": f"Distribution is skewed (skew={skew:.2f}); median is robust.",
            }
        # Check if ordered / time-like index suggests interpolation
        if abs(skew) < 0.5 and missing_pct < 15:
            return {
                "action": "Mean",
                "confidence": 0.8,
                "reason": "Nearly symmetric numeric distribution.",
            }
        return {
            "action": "Interpolation",
            "confidence": 0.7,
            "reason": "Numeric column with moderate missingness; interpolation may fit.",
        }

    # Categorical
    mode_vals = s.mode(dropna=True)
    if len(mode_vals):
        return {
            "action": "Mode",
            "confidence": 0.88,
            "reason": "Categorical/text column; mode (most frequent) is appropriate.",
        }

    return {
        "action": "Leave",
        "confidence": 0.5,
        "reason": "Unable to determine a safe imputation strategy.",
    }


def replace_sentinels_with_nan(
    df: pd.DataFrame,
    sentinels: Optional[list[str]] = None,
    analysis: Optional[dict] = None,
) -> pd.DataFrame:
    """Replace detected sentinel values with NaN. Returns a copy."""
    out = df.copy()
    sentinels = sentinels or DEFAULT_SENTINELS
    sentinel_lower = {str(s).strip().lower() for s in sentinels}

    for col in out.columns:
        # String sentinels
        if out[col].dtype == object or pd.api.types.is_string_dtype(out[col]):
            mask = out[col].astype(str).str.strip().str.lower().isin(sentinel_lower)
            out.loc[mask, col] = np.nan
            # Empty strings
            mask_empty = out[col].astype(str).str.strip() == ""
            out.loc[mask_empty & out[col].notna(), col] = np.nan

        # Numeric sentinels from analysis
        if analysis:
            for cinfo in analysis.get("columns", []):
                if cinfo["name"] != col:
                    continue
                for sent, _cnt in cinfo.get("sentinels", {}).items():
                    try:
                        num = float(sent)
                        out.loc[pd.to_numeric(out[col], errors="coerce") == num, col] = np.nan
                    except ValueError:
                        pass
    return out
