"""
Apply Knowledge Pack terminology + domain recommendation enrichment.
"""

from __future__ import annotations

from typing import Any, Optional

import pandas as pd


def apply_terminology(
    df: pd.DataFrame,
    terminology: dict[str, dict],
    global_synonyms: Optional[dict] = None,
) -> tuple[pd.DataFrame, list[dict]]:
    """
    Normalize values using pack/org terminology maps.
    Returns (df, list of audit-ready actions with value_changes).
    """
    out = df.copy()
    actions: list[dict] = []
    global_synonyms = global_synonyms or {}

    # Build per-column effective maps: column map overrides global
    columns_to_map: dict[str, dict] = {}
    for col in out.columns:
        col_l = col.lower()
        mapping = {}
        # global synonyms applied to object columns
        if global_synonyms and (
            out[col].dtype == object or pd.api.types.is_string_dtype(out[col])
        ):
            mapping.update({str(k): v for k, v in global_synonyms.items()})
        # explicit column maps (match case-insensitive column key)
        for key, mmap in (terminology or {}).items():
            if key.lower() == col_l and isinstance(mmap, dict):
                mapping.update({str(k): v for k, v in mmap.items()})
        if mapping:
            columns_to_map[col] = mapping

    for col, mapping in columns_to_map.items():
        # Case-insensitive match on stripped values
        lower_map = {str(k).strip().lower(): v for k, v in mapping.items()}
        value_changes = []
        s = out[col]
        if not (s.dtype == object or pd.api.types.is_string_dtype(s)):
            # still try string cast for coded fields
            pass
        as_str = s.astype(str)
        stripped = as_str.str.strip()
        keys = stripped.str.lower()
        for old_key, new_val in lower_map.items():
            mask = s.notna() & (keys == old_key) & (stripped != str(new_val))
            # Also skip if already canonical ignoring case and equal
            idxs = out.index[mask].tolist()
            if not idxs:
                continue
            for idx in idxs[:200]:
                value_changes.append({
                    "row": int(idx) if str(idx).isdigit() else idx,
                    "column": col,
                    "original": out.at[idx, col],
                    "new": new_val,
                })
            out.loc[mask, col] = new_val
        if value_changes:
            sample = value_changes[0]
            actions.append({
                "id": f"term_{col}",
                "column": col,
                "action": "Terminology normalization",
                "original": sample["original"],
                "new": sample["new"],
                "rows_affected": len(value_changes),
                "reason": "Domain/organization terminology map",
                "rule": f"Terminology Rule — {col}",
                "safety_class": "Safe",
                "why_detected": f"Knowledge pack / org terminology defines canonical forms for '{col}'.",
                "value_changes": value_changes,
            })
    return out, actions


def enrich_recommendations_with_domain(
    recommendations: dict[str, Any],
    domain_recs: dict[str, Any],
    domain: Optional[str] = None,
) -> dict[str, Any]:
    """Attach possible_causes / domain advice to matching recommendations."""
    if not domain_recs:
        return recommendations

    for rec in recommendations.get("recommendations", []):
        col = (rec.get("column") or "").lower()
        advice = None
        if col and col in {k.lower(): v for k, v in domain_recs.items()}:
            # direct
            for k, v in domain_recs.items():
                if k.lower() == col:
                    advice = v
                    break
        # Also match range_* / missing_* by column
        if advice is None:
            for k, v in domain_recs.items():
                if col and k.lower() in col or (col and col in k.lower()):
                    advice = v
                    break
        if not advice or not isinstance(advice, dict):
            continue

        causes = advice.get("possible_causes") or []
        tip = advice.get("recommendation") or ""
        extra = ""
        if causes:
            extra += " Possible causes: " + "; ".join(f"✓ {c}" for c in causes) + "."
        if tip:
            extra += f" Domain recommendation: {tip}"
        rec["why_detected"] = (rec.get("why_detected") or "") + extra
        rec["domain_advice"] = advice
        if domain:
            rec["domain"] = domain

    recommendations["domain_enriched"] = True
    return recommendations


def check_template_issues(org_validation: dict) -> list[dict]:
    """Turn org template mismatches into Never Automatic recommendations."""
    recs = []
    if not org_validation:
        return recs

    for col in org_validation.get("missing_required_columns") or []:
        recs.append({
            "id": f"org_missing_required_{col}",
            "column": col,
            "category": "organization",
            "issue": f"Required template column missing: {col}",
            "recommendation": "Restore column from source template — do not invent data",
            "confidence": 99.0,
            "why_detected": (
                f"Organization profile '{org_validation.get('profile_name')}' "
                f"expects required column '{col}', but it is absent in this file."
            ),
            "reason": "Missing required fields break monthly reporting continuity.",
            "safety_class": "Never Automatic",
            "rule": f"Org Template — required:{col}",
        })

    for col in org_validation.get("unexpected_columns") or []:
        recs.append({
            "id": f"org_unexpected_{col}",
            "column": col,
            "category": "organization",
            "issue": f"Unexpected column vs template: {col}",
            "recommendation": "Confirm schema change with data provider",
            "confidence": 80.0,
            "why_detected": (
                f"Column '{col}' is not in the remembered template for "
                f"'{org_validation.get('profile_name')}'."
            ),
            "reason": "Schema drift may indicate a new template version.",
            "safety_class": "Never Automatic",
            "rule": f"Org Template — unexpected:{col}",
        })
    return recs
