"""
Phase 9 — Outlier Detection

IQR, Z-score, Isolation Forest, DBSCAN, LOF — each explains WHY.
"""

from __future__ import annotations

from typing import Any, Optional

import numpy as np
import pandas as pd


def detect_outliers(
    df: pd.DataFrame,
    *,
    methods: Optional[list[str]] = None,
    columns: Optional[list[str]] = None,
    z_threshold: float = 3.0,
    iqr_k: float = 1.5,
) -> dict[str, Any]:
    """Run multiple outlier detectors on numeric columns."""
    methods = methods or ["iqr", "zscore", "isolation_forest", "dbscan", "lof"]
    numeric_cols = columns or _numeric_columns(df)

    per_column = {}
    for col in numeric_cols:
        series = pd.to_numeric(df[col], errors="coerce")
        if series.notna().sum() < 5:
            continue
        per_column[col] = detect_column_outliers(
            series, methods=methods, z_threshold=z_threshold, iqr_k=iqr_k
        )

    return {
        "columns": per_column,
        "methods_used": methods,
        "total_flagged_values": sum(
            len(set().union(*[set(m.get("indices", [])) for m in info["methods"].values()]))
            for info in per_column.values()
        ),
    }


def detect_column_outliers(
    series: pd.Series,
    *,
    methods: list[str],
    z_threshold: float = 3.0,
    iqr_k: float = 1.5,
) -> dict[str, Any]:
    vals = series.dropna()
    idx = vals.index
    x = vals.to_numpy(dtype=float)

    results = {}
    if "iqr" in methods:
        results["iqr"] = _iqr_outliers(x, idx, iqr_k)
    if "zscore" in methods:
        results["zscore"] = _zscore_outliers(x, idx, z_threshold)
    if "isolation_forest" in methods:
        results["isolation_forest"] = _isolation_forest(x, idx)
    if "dbscan" in methods:
        results["dbscan"] = _dbscan_outliers(x, idx)
    if "lof" in methods:
        results["lof"] = _lof_outliers(x, idx)

    # Consensus: flagged by 2+ methods
    vote: dict[Any, int] = {}
    for m in results.values():
        for i in m.get("indices", []):
            vote[i] = vote.get(i, 0) + 1
    consensus = [i for i, c in vote.items() if c >= 2]

    return {
        "n_valid": int(len(x)),
        "methods": results,
        "consensus_indices": consensus,
        "consensus_count": len(consensus),
        "examples": _examples(series, consensus[:10], results),
    }


def _iqr_outliers(x: np.ndarray, idx, k: float) -> dict:
    q1, q3 = np.percentile(x, 25), np.percentile(x, 75)
    iqr = q3 - q1
    lo, hi = q1 - k * iqr, q3 + k * iqr
    mask = (x < lo) | (x > hi)
    indices = idx[mask].tolist()
    explanations = []
    for i, val in zip(idx[mask], x[mask]):
        why = (
            f"Value {val:.4g} is outside IQR fences [{lo:.4g}, {hi:.4g}] "
            f"(Q1={q1:.4g}, Q3={q3:.4g}, IQR={iqr:.4g}, k={k})"
        )
        explanations.append({"index": i, "value": float(val), "why": why})
    return {
        "count": int(mask.sum()),
        "indices": indices,
        "fences": {"low": float(lo), "high": float(hi)},
        "explanations": explanations[:20],
    }


def _zscore_outliers(x: np.ndarray, idx, threshold: float) -> dict:
    mean, std = float(np.mean(x)), float(np.std(x, ddof=1)) if len(x) > 1 else 0.0
    if std == 0:
        return {"count": 0, "indices": [], "explanations": []}
    z = (x - mean) / std
    mask = np.abs(z) > threshold
    explanations = []
    for i, val, zv in zip(idx[mask], x[mask], z[mask]):
        explanations.append({
            "index": i,
            "value": float(val),
            "z": float(zv),
            "why": (
                f"Value {val:.4g} has |z|={abs(zv):.2f} > {threshold} "
                f"(mean={mean:.4g}, std={std:.4g})"
            ),
        })
    return {
        "count": int(mask.sum()),
        "indices": idx[mask].tolist(),
        "threshold": threshold,
        "explanations": explanations[:20],
    }


def _isolation_forest(x: np.ndarray, idx) -> dict:
    try:
        from sklearn.ensemble import IsolationForest
    except ImportError:
        return {"count": 0, "indices": [], "explanations": [], "error": "sklearn not installed"}

    if len(x) < 10:
        return {"count": 0, "indices": [], "explanations": [], "note": "Too few points"}

    X = x.reshape(-1, 1)
    clf = IsolationForest(contamination="auto", random_state=42, n_estimators=100)
    labels = clf.fit_predict(X)
    scores = clf.decision_function(X)
    mask = labels == -1
    explanations = []
    for i, val, sc in zip(idx[mask], x[mask], scores[mask]):
        explanations.append({
            "index": i,
            "value": float(val),
            "anomaly_score": float(sc),
            "why": (
                f"Isolation Forest flagged {val:.4g} as anomalous "
                f"(decision score={sc:.4f}; lower = more anomalous)"
            ),
        })
    return {
        "count": int(mask.sum()),
        "indices": idx[mask].tolist(),
        "explanations": explanations[:20],
    }


def _dbscan_outliers(x: np.ndarray, idx) -> dict:
    try:
        from sklearn.cluster import DBSCAN
        from sklearn.preprocessing import StandardScaler
    except ImportError:
        return {"count": 0, "indices": [], "explanations": [], "error": "sklearn not installed"}

    if len(x) < 10:
        return {"count": 0, "indices": [], "explanations": [], "note": "Too few points"}

    X = StandardScaler().fit_transform(x.reshape(-1, 1))
    # Adaptive eps
    eps = 0.5
    clustering = DBSCAN(eps=eps, min_samples=max(3, len(x) // 50)).fit(X)
    mask = clustering.labels_ == -1
    explanations = []
    for i, val in zip(idx[mask], x[mask]):
        explanations.append({
            "index": i,
            "value": float(val),
            "why": (
                f"DBSCAN labeled {val:.4g} as noise (not belonging to any dense cluster, eps={eps})"
            ),
        })
    return {
        "count": int(mask.sum()),
        "indices": idx[mask].tolist(),
        "n_clusters": int(len(set(clustering.labels_)) - (1 if -1 in clustering.labels_ else 0)),
        "explanations": explanations[:20],
    }


def _lof_outliers(x: np.ndarray, idx) -> dict:
    try:
        from sklearn.neighbors import LocalOutlierFactor
    except ImportError:
        return {"count": 0, "indices": [], "explanations": [], "error": "sklearn not installed"}

    if len(x) < 10:
        return {"count": 0, "indices": [], "explanations": [], "note": "Too few points"}

    n_neighbors = min(20, len(x) - 1)
    lof = LocalOutlierFactor(n_neighbors=n_neighbors, contamination="auto")
    labels = lof.fit_predict(x.reshape(-1, 1))
    scores = lof.negative_outlier_factor_
    mask = labels == -1
    explanations = []
    for i, val, sc in zip(idx[mask], x[mask], scores[mask]):
        explanations.append({
            "index": i,
            "value": float(val),
            "lof_score": float(sc),
            "why": (
                f"LOF flagged {val:.4g}: local density is much lower than neighbors "
                f"(negative_outlier_factor={sc:.4f})"
            ),
        })
    return {
        "count": int(mask.sum()),
        "indices": idx[mask].tolist(),
        "explanations": explanations[:20],
    }


def _numeric_columns(df: pd.DataFrame) -> list[str]:
    cols = []
    for c in df.columns:
        if pd.api.types.is_bool_dtype(df[c]):
            continue
        if pd.api.types.is_numeric_dtype(df[c]):
            cols.append(c)
        else:
            coerced = pd.to_numeric(df[c], errors="coerce")
            if coerced.notna().mean() > 0.8:
                cols.append(c)
    return cols


def _examples(series: pd.Series, indices: list, method_results: dict) -> list[dict]:
    out = []
    for i in indices:
        whys = []
        for method, res in method_results.items():
            for exp in res.get("explanations", []):
                if exp["index"] == i:
                    whys.append({"method": method, "why": exp["why"]})
        out.append({
            "index": i,
            "value": float(pd.to_numeric(series.loc[i], errors="coerce")),
            "explanations": whys,
        })
    return out
