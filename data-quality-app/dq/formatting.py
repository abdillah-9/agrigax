"""
Phase 6 — Formatting Analysis

Detect inconsistent casing (male/Male/MALE/M) and date formats;
suggest canonical forms and normalize.
"""

from __future__ import annotations

from collections import Counter, defaultdict
from typing import Any, Optional

import pandas as pd


# Common synonym maps for gender and similar fields
GENDER_CANONICAL = {
    "m": "Male",
    "male": "Male",
    "man": "Male",
    "boy": "Male",
    "f": "Female",
    "female": "Female",
    "woman": "Female",
    "girl": "Female",
    "o": "Other",
    "other": "Other",
    "non-binary": "Non-binary",
    "nonbinary": "Non-binary",
    "nb": "Non-binary",
}

YES_NO_CANONICAL = {
    "y": "Yes",
    "yes": "Yes",
    "true": "Yes",
    "1": "Yes",
    "n": "No",
    "no": "No",
    "false": "No",
    "0": "No",
}


def analyze_formatting(
    df: pd.DataFrame,
    extra_synonym_maps: Optional[dict[str, dict[str, str]]] = None,
    global_synonyms: Optional[dict[str, str]] = None,
) -> dict[str, Any]:
    """Analyze casing, category synonyms, and date format inconsistencies."""
    text_issues = []
    date_issues = []
    extra_synonym_maps = extra_synonym_maps or {}
    global_synonyms = global_synonyms or {}

    for col in df.columns:
        s = df[col]
        if s.dtype == object or pd.api.types.is_string_dtype(s):
            issue = analyze_text_formatting(
                s, col,
                extra_map=extra_synonym_maps.get(col) or extra_synonym_maps.get(col.lower()),
                global_synonyms=global_synonyms,
            )
            if issue["variants"] or issue["suggested_map"]:
                text_issues.append(issue)

            date_issue = analyze_date_formats(s, col)
            if date_issue["formats_detected"] and len(date_issue["formats_detected"]) > 1:
                date_issues.append(date_issue)
        elif pd.api.types.is_datetime64_any_dtype(s):
            continue

    return {
        "text_formatting": text_issues,
        "date_formatting": date_issues,
        "columns_with_issues": (
            [t["column"] for t in text_issues if t.get("inconsistent")]
            + [d["column"] for d in date_issues]
        ),
    }


def analyze_text_formatting(
    s: pd.Series,
    name: str,
    extra_map: Optional[dict[str, str]] = None,
    global_synonyms: Optional[dict[str, str]] = None,
) -> dict[str, Any]:
    non_null = s.dropna().astype(str)
    if non_null.empty:
        return {"column": name, "variants": {}, "suggested_map": {}, "inconsistent": False}

    stripped = non_null.str.strip()
    # Group by lowercased key
    groups: dict[str, Counter] = defaultdict(Counter)
    for val in stripped:
        key = " ".join(val.lower().split())
        groups[key][val] += 1

    variants = {}
    suggested_map = {}
    inconsistent = False

    # Synonym maps based on column name + knowledge pack extras
    canon_map = dict(_pick_synonym_map(name))
    if global_synonyms:
        canon_map.update({str(k).lower(): v for k, v in global_synonyms.items()})
    if extra_map:
        canon_map.update({str(k).lower(): v for k, v in extra_map.items()})

    for key, counter in groups.items():
        forms = list(counter.keys())
        if len(forms) > 1:
            inconsistent = True
            # Prefer Title Case most common, else most frequent
            canonical = _choose_canonical(forms, counter, canon_map, key)
            variants[key] = {
                "forms": dict(counter),
                "suggested": canonical,
            }
            for form in forms:
                if form != canonical:
                    suggested_map[form] = canonical
        elif canon_map and key in canon_map:
            canonical = canon_map[key]
            if forms[0] != canonical:
                inconsistent = True
                suggested_map[forms[0]] = canonical
                variants[key] = {"forms": dict(counter), "suggested": canonical}

    # Also map abbreviations via synonym map even for single forms
    if canon_map:
        for key, counter in groups.items():
            if key in canon_map:
                canonical = canon_map[key]
                for form in counter:
                    if form != canonical:
                        suggested_map[form] = canonical
                        inconsistent = True

    whitespace_issues = int((non_null != stripped).sum())
    multi_space = int(stripped.str.contains(r"\s{2,}", regex=True).sum())

    return {
        "column": name,
        "variants": variants,
        "suggested_map": suggested_map,
        "inconsistent": inconsistent or bool(suggested_map),
        "whitespace_leading_trailing": whitespace_issues,
        "multi_space": multi_space,
        "canonical_style": _infer_style(stripped),
    }


def _pick_synonym_map(name: str) -> dict[str, str]:
    n = name.lower()
    if any(k in n for k in ("gender", "sex")):
        return GENDER_CANONICAL
    if any(k in n for k in ("married", "pregnant", "active", "employed", "yes", "flag")):
        return YES_NO_CANONICAL
    return {}


def _choose_canonical(
    forms: list[str],
    counter: Counter,
    canon_map: dict[str, str],
    key: str,
) -> str:
    if canon_map and key in canon_map:
        return canon_map[key]
    # Prefer Title Case if any form is title-like
    title_forms = [f for f in forms if f == f.title()]
    if title_forms:
        return max(title_forms, key=lambda f: counter[f])
    return counter.most_common(1)[0][0]


def _infer_style(s: pd.Series) -> str:
    if s.empty:
        return "unknown"
    lower = (s == s.str.lower()).mean()
    upper = (s == s.str.upper()).mean()
    title = (s == s.str.title()).mean()
    best = max(
        [("lower", lower), ("upper", upper), ("title", title)],
        key=lambda x: x[1],
    )
    return best[0] if best[1] > 0.5 else "mixed"


def analyze_date_formats(s: pd.Series, name: str) -> dict[str, Any]:
    """Detect multiple date string formats in a column."""
    non_null = s.dropna().astype(str).str.strip()
    if non_null.empty:
        return {"column": name, "formats_detected": [], "examples": {}}

    formats = defaultdict(list)
    for val in non_null.head(500):
        fmt = _guess_date_format(val)
        if fmt:
            if len(formats[fmt]) < 3:
                formats[fmt].append(val)

    # Only treat as date column if enough values parse
    parsed = pd.to_datetime(non_null.head(200), errors="coerce", format="mixed")
    parse_ratio = float(parsed.notna().mean()) if len(non_null) else 0.0
    if parse_ratio < 0.5 and len(formats) < 2:
        return {"column": name, "formats_detected": [], "examples": {}, "parse_ratio": parse_ratio}

    return {
        "column": name,
        "formats_detected": list(formats.keys()),
        "examples": dict(formats),
        "parse_ratio": round(parse_ratio, 3),
        "suggested_format": "ISO8601 (YYYY-MM-DD)",
    }


def _guess_date_format(val: str) -> Optional[str]:
    import re
    v = val.strip()
    patterns = [
        (r"^\d{4}-\d{2}-\d{2}$", "YYYY-MM-DD"),
        (r"^\d{4}/\d{2}/\d{2}$", "YYYY/MM/DD"),
        (r"^\d{2}/\d{2}/\d{2}$", "DD/MM/YY or MM/DD/YY"),
        (r"^\d{2}/\d{2}/\d{4}$", "DD/MM/YYYY or MM/DD/YYYY"),
        (r"^\d{1,2}/\d{1,2}/\d{2,4}$", "D/M/Y"),
        (r"^\d{1,2}-\d{1,2}-\d{2,4}$", "D-M-Y"),
        (r"^\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4}$", "D Mon YYYY"),
        (r"^[A-Za-z]{3,9}\s+\d{1,2},?\s+\d{2,4}$", "Mon D, YYYY"),
        (r"^\d{8}$", "YYYYMMDD"),
        (r"^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}", "ISO DateTime"),
    ]
    for pat, label in patterns:
        if re.match(pat, v):
            return label
    # Loose check
    if re.search(r"\d{1,4}[-/]\d{1,2}[-/]\d{1,4}", v):
        return "Other date-like"
    return None


def apply_formatting_fixes(
    df: pd.DataFrame,
    formatting_report: dict,
    *,
    normalize_dates: bool = True,
) -> tuple[pd.DataFrame, list[dict]]:
    """
    Apply suggested text maps and ISO-normalize dates.
    Returns (new_df, list of change records for audit).
    """
    out = df.copy()
    changes = []

    for issue in formatting_report.get("text_formatting", []):
        col = issue["column"]
        mapping = issue.get("suggested_map") or {}
        if col not in out.columns or not mapping:
            continue
        for old, new in mapping.items():
            mask = out[col].astype(str).str.strip() == old
            idxs = out.index[mask].tolist()
            if not idxs:
                continue
            out.loc[mask, col] = new
            changes.append({
                "column": col,
                "rows_affected": len(idxs),
                "original": old,
                "new": new,
                "reason": "Formatting Standardization",
                "rule": f"Text Rule — {col}",
            })
        # Strip whitespace
        if out[col].dtype == object or pd.api.types.is_string_dtype(out[col]):
            before = out[col].copy()
            out[col] = out[col].map(lambda x: x.strip() if isinstance(x, str) else x)
            n_ws = int((before.astype(str) != out[col].astype(str)).sum())
            if n_ws:
                changes.append({
                    "column": col,
                    "rows_affected": n_ws,
                    "original": "(leading/trailing spaces)",
                    "new": "(trimmed)",
                    "reason": "Whitespace trim",
                    "rule": "Text Rule — trim",
                })

    if normalize_dates:
        for issue in formatting_report.get("date_formatting", []):
            col = issue["column"]
            if col not in out.columns:
                continue
            if len(issue.get("formats_detected", [])) > 1 or issue.get("parse_ratio", 0) > 0.5:
                original_sample = out[col].dropna().astype(str).head(3).tolist()
                parsed = pd.to_datetime(out[col], errors="coerce", format="mixed")
                # Keep as ISO date string for audit clarity
                new_vals = parsed.dt.strftime("%Y-%m-%d")
                changed = out[col].notna() & parsed.notna()
                n = int(changed.sum())
                if n:
                    out.loc[changed, col] = new_vals[changed]
                    changes.append({
                        "column": col,
                        "rows_affected": n,
                        "original": str(original_sample),
                        "new": "YYYY-MM-DD",
                        "reason": "Date format normalization",
                        "rule": "Date Rule — ISO8601",
                    })

    return out, changes
