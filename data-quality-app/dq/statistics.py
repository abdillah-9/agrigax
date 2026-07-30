"""
Phase 12 — Statistical Diagnostics

Mean, median, mode, variance, std, skewness, kurtosis, normality, correlation.
Includes mean-vs-median outlier demonstration data for teaching.
"""

from __future__ import annotations

from typing import Any, Optional

import numpy as np
import pandas as pd


def compute_statistics(df: pd.DataFrame) -> dict[str, Any]:
    """Compute descriptive stats for numeric columns + correlation matrix."""
    numeric_df = _to_numeric_frame(df)
    columns = {}

    for col in numeric_df.columns:
        columns[col] = column_statistics(numeric_df[col])

    corr = None
    if numeric_df.shape[1] >= 2:
        corr_matrix = numeric_df.corr(method="pearson")
        corr = {
            "method": "pearson",
            "matrix": corr_matrix.round(3).where(pd.notnull(corr_matrix), None).to_dict(),
            "strong_pairs": _strong_correlations(corr_matrix),
        }

    return {
        "columns": columns,
        "correlation": corr,
        "mean_vs_median_demo": mean_vs_median_demo(),
    }


def column_statistics(s: pd.Series) -> dict[str, Any]:
    vals = pd.to_numeric(s, errors="coerce").dropna()
    n = len(vals)
    if n == 0:
        return {"n": 0}

    mean = float(vals.mean())
    median = float(vals.median())
    mode_vals = vals.mode()
    mode = float(mode_vals.iloc[0]) if len(mode_vals) else None
    variance = float(vals.var(ddof=1)) if n > 1 else 0.0
    std = float(vals.std(ddof=1)) if n > 1 else 0.0
    skew = float(vals.skew()) if n > 2 else 0.0
    kurt = float(vals.kurtosis()) if n > 3 else 0.0

    normality = test_normality(vals)

    return {
        "n": n,
        "mean": round(mean, 6),
        "median": round(median, 6),
        "mode": round(mode, 6) if mode is not None else None,
        "variance": round(variance, 6),
        "std": round(std, 6),
        "skewness": round(skew, 6),
        "kurtosis": round(kurt, 6),
        "min": float(vals.min()),
        "max": float(vals.max()),
        "q25": float(vals.quantile(0.25)),
        "q75": float(vals.quantile(0.75)),
        "normality": normality,
        "mean_median_gap": round(abs(mean - median), 6),
        "outlier_effect_note": (
            "Mean is pulled toward extremes; median is robust."
            if abs(mean - median) > 0.1 * (std or 1)
            else "Mean and median are close — distribution likely symmetric."
        ),
    }


def test_normality(vals: pd.Series) -> dict[str, Any]:
    """Shapiro-Wilk (n<=5000) or D'Agostino."""
    x = vals.to_numpy(dtype=float)
    n = len(x)
    result: dict[str, Any] = {"n": n}

    try:
        from scipy import stats
    except ImportError:
        result["error"] = "scipy not installed"
        return result

    if n < 3:
        result["note"] = "Too few observations"
        return result

    if n <= 5000:
        stat, p = stats.shapiro(x[:5000])
        result["test"] = "Shapiro-Wilk"
        result["statistic"] = float(stat)
        result["p_value"] = float(p)
    else:
        stat, p = stats.normaltest(x)
        result["test"] = "D'Agostino K-squared"
        result["statistic"] = float(stat)
        result["p_value"] = float(p)

    result["is_normal_alpha_05"] = bool(result["p_value"] > 0.05)
    result["interpretation"] = (
        "Consistent with normality (fail to reject H0)"
        if result["is_normal_alpha_05"]
        else "Not normally distributed (reject H0 at α=0.05)"
    )
    return result


def mean_vs_median_demo(base: Optional[list[float]] = None) -> dict[str, Any]:
    """
    Interactive teaching concept: effect of outliers on mean vs median.

    No outlier: mean ≈ median
    High outlier: mean rises, median stable
    """
    data = list(base or [25, 30, 35, 38, 38, 40, 42, 45, 50])
    # Force demo where mean=median=38-ish if using default — adjust
    clean = [28, 32, 35, 38, 38, 40, 42, 45, 48]
    with_high = clean + [200]
    with_low = [-50] + clean

    def summary(arr, label):
        a = np.array(arr, dtype=float)
        return {
            "label": label,
            "data": arr,
            "mean": round(float(a.mean()), 2),
            "median": round(float(np.median(a)), 2),
            "message": (
                f"Mean is {a.mean():.1f}; median is {np.median(a):.1f}"
            ),
        }

    return {
        "description": (
            "Mean is sensitive to outliers; median is robust. "
            "Toggle scenarios to see the effect."
        ),
        "scenarios": [
            summary(clean, "No outlier"),
            summary(with_high, "High outlier"),
            summary(with_low, "Low outlier"),
        ],
        "scale": {"min": 0, "q25": 25, "q50": 50, "q75": 75, "max": 100},
    }


def _to_numeric_frame(df: pd.DataFrame) -> pd.DataFrame:
    out = {}
    for col in df.columns:
        if pd.api.types.is_bool_dtype(df[col]):
            continue
        if pd.api.types.is_numeric_dtype(df[col]):
            out[col] = pd.to_numeric(df[col], errors="coerce").astype(float)
        else:
            coerced = pd.to_numeric(df[col], errors="coerce")
            if coerced.notna().mean() > 0.7:
                out[col] = coerced.astype(float)
    return pd.DataFrame(out, index=df.index)


def _strong_correlations(corr: pd.DataFrame, threshold: float = 0.7) -> list[dict]:
    pairs = []
    cols = corr.columns.tolist()
    for i in range(len(cols)):
        for j in range(i + 1, len(cols)):
            val = corr.iloc[i, j]
            if pd.isna(val):
                continue
            if abs(val) >= threshold:
                pairs.append({
                    "column_a": cols[i],
                    "column_b": cols[j],
                    "correlation": round(float(val), 3),
                    "strength": "strong positive" if val > 0 else "strong negative",
                })
    return sorted(pairs, key=lambda p: -abs(p["correlation"]))
