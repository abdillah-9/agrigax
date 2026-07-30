"""
Phase 8 — Business Rule Validation

Configurable rules (YAML): Age=10 + Occupation=Doctor → impossible, etc.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Optional

import pandas as pd
import yaml


OPS = {
    "eq": lambda s, v: s == v,
    "ne": lambda s, v: s != v,
    "gt": lambda s, v: pd.to_numeric(s, errors="coerce") > v,
    "gte": lambda s, v: pd.to_numeric(s, errors="coerce") >= v,
    "lt": lambda s, v: pd.to_numeric(s, errors="coerce") < v,
    "lte": lambda s, v: pd.to_numeric(s, errors="coerce") <= v,
    "in": lambda s, v: s.astype(str).str.strip().str.lower().isin(
        [str(x).strip().lower() for x in (v if isinstance(v, list) else [v])]
    ),
    "not_in": lambda s, v: ~s.astype(str).str.strip().str.lower().isin(
        [str(x).strip().lower() for x in (v if isinstance(v, list) else [v])]
    ),
    "contains": lambda s, v: s.astype(str).str.contains(str(v), na=False, regex=False),
    "icontains": lambda s, v: s.astype(str).str.lower().str.contains(
        str(v).lower(), na=False, regex=False
    ),
    "isna": lambda s, v: s.isna(),
    "notna": lambda s, v: s.notna(),
}


def load_rules(config_path: Optional[str] = None) -> list[dict]:
    if not config_path:
        # Default next to package
        here = Path(__file__).resolve().parent.parent / "config" / "default_rules.yaml"
        config_path = str(here)
    path = Path(config_path)
    if not path.exists():
        return []
    with open(path, encoding="utf-8") as f:
        cfg = yaml.safe_load(f) or {}
    return list(cfg.get("rules") or [])


def validate_business_rules(
    df: pd.DataFrame,
    rules: Optional[list[dict]] = None,
    config_path: Optional[str] = None,
) -> dict[str, Any]:
    """Evaluate configurable business rules against the DataFrame."""
    rules = rules if rules is not None else load_rules(config_path)
    results = []
    total_violations = 0

    for rule in rules:
        result = evaluate_rule(df, rule)
        results.append(result)
        total_violations += result["violations"]

    return {
        "rules_evaluated": len(results),
        "total_violations": total_violations,
        "results": results,
        "critical": sum(1 for r in results if r["severity"] == "critical" and r["violations"] > 0),
        "warnings": sum(1 for r in results if r["severity"] == "warning" and r["violations"] > 0),
    }


def evaluate_rule(df: pd.DataFrame, rule: dict) -> dict[str, Any]:
    rule_id = rule.get("id", "unnamed")
    name = rule.get("name", rule_id)
    severity = rule.get("severity", "warning")
    description = rule.get("description", "")

    try:
        mask = _eval_condition(df, rule.get("condition") or {})
    except Exception as e:
        return {
            "id": rule_id,
            "name": name,
            "severity": severity,
            "description": description,
            "violations": 0,
            "error": str(e),
            "examples": [],
        }

    # Missing columns → skip quietly
    if mask is None:
        return {
            "id": rule_id,
            "name": name,
            "severity": severity,
            "description": description,
            "violations": 0,
            "skipped": True,
            "reason": "Required columns not present",
            "examples": [],
        }

    n = int(mask.sum())
    examples = []
    if n:
        sample = df.loc[mask].head(5)
        examples = sample.to_dict(orient="records")
        # Make JSON-serializable
        for row in examples:
            for k, v in list(row.items()):
                if pd.isna(v):
                    row[k] = None
                elif hasattr(v, "item"):
                    row[k] = v.item()
                else:
                    row[k] = v

    return {
        "id": rule_id,
        "name": name,
        "severity": severity,
        "description": description,
        "violations": n,
        "violation_pct": round(100.0 * n / len(df), 2) if len(df) else 0.0,
        "examples": examples,
    }


def _eval_condition(df: pd.DataFrame, condition: dict) -> Optional[pd.Series]:
    if not condition:
        return pd.Series(False, index=df.index)

    if "all" in condition:
        masks = []
        for clause in condition["all"]:
            m = _eval_clause(df, clause)
            if m is None:
                return None
            masks.append(m)
        out = masks[0]
        for m in masks[1:]:
            out = out & m
        return out

    if "any" in condition:
        masks = []
        for clause in condition["any"]:
            m = _eval_clause(df, clause)
            if m is None:
                return None
            masks.append(m)
        out = masks[0]
        for m in masks[1:]:
            out = out | m
        return out

    # Single clause at top level
    return _eval_clause(df, condition)


def _eval_clause(df: pd.DataFrame, clause: dict) -> Optional[pd.Series]:
    # Nested all/any
    if "all" in clause or "any" in clause:
        return _eval_condition(df, clause)

    col = clause.get("column")
    if col is None:
        raise ValueError(f"Clause missing column: {clause}")

    # Case-insensitive column resolve
    resolved = _resolve_column(df, col)
    if resolved is None:
        return None

    op = clause.get("op", "eq")
    value = clause.get("value")
    if op not in OPS:
        raise ValueError(f"Unknown operator: {op}")

    series = df[resolved]
    # For string ops, work on stripped strings
    if op in ("eq", "ne") and not isinstance(value, (int, float, bool)):
        left = series.astype(str).str.strip().str.lower()
        right = str(value).strip().lower()
        return (left == right) if op == "eq" else (left != right)

    return OPS[op](series, value)


def _resolve_column(df: pd.DataFrame, name: str) -> Optional[str]:
    if name in df.columns:
        return name
    lower_map = {c.lower(): c for c in df.columns}
    return lower_map.get(name.lower())
