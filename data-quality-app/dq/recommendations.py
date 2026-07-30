"""
Phase 14 — Recommendation Engine

Every recommendation includes:
  - why_detected: plain-language explanation of WHY the issue was found
  - safety_class: Safe | Needs Approval | Never Automatic
  - recommendation, confidence, reason (for the suggested fix)
"""

from __future__ import annotations

from typing import Any


# Safety classes — drive what the cleaner is allowed to do
SAFE = "Safe"
NEEDS_APPROVAL = "Needs Approval"
NEVER_AUTOMATIC = "Never Automatic"

SAFETY_ORDER = {SAFE: 0, NEEDS_APPROVAL: 1, NEVER_AUTOMATIC: 2}


def build_recommendations(findings: dict[str, Any]) -> dict[str, Any]:
    """Turn analysis findings into classified, explained recommendations."""
    recs: list[dict] = []

    # --- Sentinel missing codes (dataset-wide) ---
    missing = findings.get("missing") or {}
    sentinel_cols = []
    sentinel_examples = []
    for col in missing.get("columns", []):
        sents = col.get("sentinels") or {}
        if sents:
            sentinel_cols.append(col["name"])
            for val, cnt in list(sents.items())[:3]:
                sentinel_examples.append(f"{col['name']}={val!r} ({cnt}×)")
    if sentinel_cols:
        recs.append({
            "id": "sentinel_replace",
            "column": None,
            "category": "missing",
            "issue": f"Sentinel missing codes in {len(sentinel_cols)} column(s)",
            "recommendation": "Replace sentinel values (999, N/A, Unknown, …) with NaN",
            "confidence": 92.0,
            "why_detected": (
                "Survey/admin codes were found that usually mean 'missing', not real data. "
                f"Examples: {', '.join(sentinel_examples[:6]) or 'N/A, 999, Unknown'}."
            ),
            "reason": "Treating codes as real numbers/text skews stats and joins.",
            "safety_class": SAFE,
            "rule": "Missing Rule — sentinels",
        })

    # --- Per-column missing imputation ---
    for col in missing.get("columns", []):
        if col.get("total_missing_like", 0) <= 0:
            continue
        r = col.get("recommendation") or {}
        action = r.get("action", "Leave")
        parts = []
        if col.get("nan"):
            parts.append(f"{col['nan']} NaN/NULL")
        if col.get("empty_string"):
            parts.append(f"{col['empty_string']} empty string(s)")
        if col.get("sentinels"):
            parts.append(f"sentinels {dict(list(col['sentinels'].items())[:4])}")
        why = (
            f"Column '{col['name']}' has {col['missing_pct']}% missing-like values "
            f"({', '.join(parts) or 'missing cells'})."
        )
        if action == "Leave":
            safety = NEVER_AUTOMATIC
        elif action in ("Median", "Mean", "Mode", "Interpolation", "Multiple Imputation", "Remove"):
            safety = NEEDS_APPROVAL
        else:
            safety = NEEDS_APPROVAL

        recs.append({
            "id": f"missing_{col['name']}",
            "column": col["name"],
            "category": "missing",
            "issue": f"Missing {col['missing_pct']}%",
            "recommendation": action if action != "Leave" else "Leave as-is (no auto-impute)",
            "confidence": round(float(r.get("confidence", 0.5)) * 100, 1),
            "why_detected": why,
            "reason": r.get("reason", ""),
            "safety_class": safety,
            "rule": f"Missing Rule — {action}",
        })

    # --- Type casts ---
    for col, info in (findings.get("types") or {}).get("columns", {}).items():
        if not info.get("needs_cast"):
            continue
        conf = float(info.get("confidence", 0.5))
        details = info.get("details") or {}
        why = (
            f"Column '{col}' is stored as {info.get('storage_dtype')} but values look like "
            f"{info.get('semantic_type')} (detection confidence {conf:.0%})."
        )
        if info.get("name_hint"):
            why += f" Column name also hints at {info['name_hint']}."
        if details:
            why += f" Evidence: {details}."
        # High-confidence type casts are Safe; lower need approval
        safety = SAFE if conf >= 0.85 else NEEDS_APPROVAL
        recs.append({
            "id": f"type_{col}",
            "column": col,
            "category": "type",
            "issue": f"Stored as {info.get('storage_dtype')}, looks like {info.get('semantic_type')}",
            "recommendation": f"Cast to {info.get('suggested_dtype')}",
            "confidence": round(conf * 100, 1),
            "why_detected": why,
            "reason": f"Correct dtype improves validation, sorting, and analysis for {info.get('semantic_type')}.",
            "safety_class": safety,
            "rule": "Type Rule — cast",
        })

    # --- Formatting ---
    for issue in (findings.get("formatting") or {}).get("text_formatting", []):
        mapping = issue.get("suggested_map") or {}
        if not mapping:
            continue
        examples = [f"{o!r}→{n!r}" for o, n in list(mapping.items())[:5]]
        variants = issue.get("variants") or {}
        why = (
            f"Column '{issue['column']}' has inconsistent surface forms for the same logical value. "
            f"Detected {len(variants)} variant group(s). Examples to standardize: {', '.join(examples)}."
        )
        if issue.get("whitespace_leading_trailing"):
            why += f" Also {issue['whitespace_leading_trailing']} value(s) have leading/trailing spaces."
        recs.append({
            "id": f"format_{issue['column']}",
            "column": issue["column"],
            "category": "formatting",
            "issue": f"{len(mapping)} inconsistent value form(s)",
            "recommendation": "Standardize casing / synonyms",
            "confidence": 92.0,
            "why_detected": why,
            "reason": "One canonical form prevents false duplicates and broken filters (e.g. Male vs MALE vs M).",
            "safety_class": SAFE,
            "rule": f"Text Rule — {issue['column']}",
            "mapping": mapping,
        })

    for issue in (findings.get("formatting") or {}).get("date_formatting", []):
        formats = issue.get("formats_detected") or []
        if len(formats) <= 1:
            continue
        examples = issue.get("examples") or {}
        ex_bits = []
        for fmt, vals in list(examples.items())[:4]:
            ex_bits.append(f"{fmt}: {vals[:2]}")
        why = (
            f"Column '{issue['column']}' mixes date string formats {formats}. "
            f"Parse success rate ≈ {issue.get('parse_ratio', 0):.0%}. Examples: {'; '.join(ex_bits)}."
        )
        recs.append({
            "id": f"date_{issue['column']}",
            "column": issue["column"],
            "category": "formatting",
            "issue": f"Mixed formats: {formats}",
            "recommendation": "Normalize to ISO8601 (YYYY-MM-DD)",
            "confidence": 90.0,
            "why_detected": why,
            "reason": "Mixed date formats cause parse errors, wrong sorts, and failed joins.",
            "safety_class": SAFE,
            "rule": "Date Rule — ISO8601",
        })

    # --- Duplicates ---
    dup = findings.get("duplicates") or {}
    if dup.get("exact_duplicate_rows", 0) > 0:
        why = (
            f"Found {dup['exact_duplicate_rows']} fully identical row(s) "
            f"({dup.get('exact_duplicate_pct', 0)}% of the dataset) using exact cell-by-cell comparison."
        )
        recs.append({
            "id": "dup_exact",
            "column": None,
            "category": "duplicates",
            "issue": f"{dup['exact_duplicate_rows']} exact duplicate rows",
            "recommendation": "Drop exact duplicates (keep first)",
            "confidence": 95.0,
            "why_detected": why,
            "reason": "Identical rows usually add no information and inflate counts.",
            "safety_class": SAFE,
            "rule": "Duplicate Rule — exact drop",
        })

    for fuzzy in dup.get("fuzzy_near_duplicates", []):
        pairs = fuzzy.get("pairs") or []
        n = len(pairs)
        if not n:
            continue
        pair_ex = "; ".join(
            f"{p['value_a']!r}≈{p['value_b']!r} ({p['similarity']}%)"
            for p in pairs[:3]
        )
        why = (
            f"Fuzzy string matching on '{fuzzy['column']}' found {n} near-duplicate pair(s) "
            f"(similarity ≥ {dup.get('fuzzy_threshold', 90)}%). Examples: {pair_ex}. "
            "These may be typos OR distinct people/entities."
        )
        recs.append({
            "id": f"dup_fuzzy_{fuzzy['column']}",
            "column": fuzzy["column"],
            "category": "duplicates",
            "issue": f"{n} near-duplicate pairs",
            "recommendation": "Review & merge fuzzy matches manually",
            "confidence": 70.0,
            "why_detected": why,
            "reason": "Auto-merging names can destroy distinct records — human review required.",
            "safety_class": NEVER_AUTOMATIC,
            "rule": "Duplicate Rule — fuzzy review",
            "pairs": pairs[:10],
        })

    # --- Encoding ---
    for col_info in (findings.get("encoding") or {}).get("columns_with_mojibake", []):
        ex = col_info.get("examples") or []
        ex_str = ", ".join(
            f"{e['original']!r}→{e['repaired']!r}" for e in ex[:3]
        )
        why = (
            f"Column '{col_info['column']}' contains {col_info['mojibake_count']} value(s) with "
            f"classic mojibake markers (e.g. Ã, Â). Likely UTF-8 bytes decoded as Latin-1/CP1252. "
            f"Repair preview: {ex_str or 'MÃ¼ller→Müller'}."
        )
        recs.append({
            "id": f"enc_{col_info['column']}",
            "column": col_info["column"],
            "category": "encoding",
            "issue": f"{col_info['mojibake_count']} mojibake value(s)",
            "recommendation": "Repair UTF-8 mojibake",
            "confidence": 88.0,
            "why_detected": why,
            "reason": "Repaired text restores readable names/labels without changing meaning.",
            "safety_class": SAFE,
            "rule": "Encoding Rule — UTF-8 restore",
        })

    # --- Ranges ---
    for issue in (findings.get("ranges") or {}).get("issues", []):
        ex = issue.get("examples") or []
        ex_str = ", ".join(f"row {e['row']}={e['value']}" for e in ex[:4])
        why = (
            f"Column '{issue['column']}' has {issue['violations']} value(s) outside the configured "
            f"business range [{issue.get('min')}, {issue.get('max')}]. "
            f"Reasons: {', '.join(issue.get('reasons') or [])}. Examples: {ex_str}."
        )
        recs.append({
            "id": f"range_{issue['column']}",
            "column": issue["column"],
            "category": "range",
            "issue": f"{issue['violations']} out-of-range values",
            "recommendation": "Review; optionally set out-of-range values to NaN",
            "confidence": 80.0,
            "why_detected": why,
            "reason": "Out-of-range values may be data-entry errors — clipping/nulling needs approval.",
            "safety_class": NEEDS_APPROVAL,
            "rule": f"Range Rule — {issue['column']}",
            "min": issue.get("min"),
            "max": issue.get("max"),
        })

    # --- Business rules ---
    for rule in (findings.get("business_rules") or {}).get("results", []):
        if rule.get("violations", 0) <= 0:
            continue
        examples = rule.get("examples") or []
        ex_str = "; ".join(str(e)[:80] for e in examples[:2])
        why = (
            f"Business rule '{rule.get('name')}' ({rule.get('id')}) matched {rule['violations']} row(s). "
            f"{rule.get('description') or ''} Examples: {ex_str or 'see report'}."
        )
        recs.append({
            "id": f"rule_{rule.get('id')}",
            "column": None,
            "category": "business_rule",
            "issue": f"{rule['violations']} violation(s) of '{rule['name']}'",
            "recommendation": "Manual review only — never auto-fix",
            "confidence": 99.0,
            "why_detected": why,
            "reason": "Domain logic conflicts need a human decision; auto-changing could invent false data.",
            "safety_class": NEVER_AUTOMATIC,
            "rule": f"Business Rule — {rule.get('id')}",
        })

    # --- Outliers ---
    for col, info in (findings.get("outliers") or {}).get("columns", {}).items():
        if info.get("consensus_count", 0) <= 0:
            continue
        examples = info.get("examples") or []
        why_bits = []
        for ex in examples[:3]:
            for e in ex.get("explanations") or []:
                why_bits.append(f"{e.get('method')}: {e.get('why')}")
        why = (
            f"Column '{col}' has {info['consensus_count']} point(s) flagged by ≥2 outlier methods "
            f"(IQR / Z-score / Isolation Forest / DBSCAN / LOF). "
            + (" ".join(why_bits[:3]) if why_bits else "See method explanations in the report.")
        )
        recs.append({
            "id": f"outlier_{col}",
            "column": col,
            "category": "outlier",
            "issue": f"{info['consensus_count']} consensus outliers",
            "recommendation": "Investigate; do not auto-delete",
            "confidence": 75.0,
            "why_detected": why,
            "reason": "Outliers can be errors OR rare but valid cases — never remove automatically.",
            "safety_class": NEVER_AUTOMATIC,
            "rule": f"Outlier Rule — {col}",
        })

    # Deduplicate by id (sentinel + missing_* both ok)
    seen = set()
    unique = []
    for r in recs:
        if r["id"] in seen:
            continue
        seen.add(r["id"])
        # Back-compat flag
        r["auto_applicable"] = r["safety_class"] in (SAFE, NEEDS_APPROVAL)
        unique.append(r)

    unique.sort(key=lambda r: (SAFETY_ORDER.get(r["safety_class"], 9), -r["confidence"]))

    by_class = {
        SAFE: [r for r in unique if r["safety_class"] == SAFE],
        NEEDS_APPROVAL: [r for r in unique if r["safety_class"] == NEEDS_APPROVAL],
        NEVER_AUTOMATIC: [r for r in unique if r["safety_class"] == NEVER_AUTOMATIC],
    }

    return {
        "count": len(unique),
        "safe_count": len(by_class[SAFE]),
        "needs_approval_count": len(by_class[NEEDS_APPROVAL]),
        "never_automatic_count": len(by_class[NEVER_AUTOMATIC]),
        "by_class": by_class,
        "recommendations": unique,
    }


def format_recommendation_table(recs: list[dict]) -> list[dict]:
    """Flat rows for CLI display."""
    rows = []
    for r in recs:
        rows.append({
            "Class": r.get("safety_class", "—"),
            "Column": r.get("column") or "—",
            "Issue": r.get("issue"),
            "Recommendation": r.get("recommendation"),
            "Confidence": f"{r.get('confidence', 0):.0f}%",
            "Why detected": r.get("why_detected"),
            "Reason": r.get("reason"),
        })
    return rows


def ids_for_safety_classes(recs_wrap: dict, classes: list[str]) -> list[str]:
    """Return recommendation ids belonging to the given safety classes."""
    wanted = set(classes)
    return [
        r["id"]
        for r in recs_wrap.get("recommendations", [])
        if r.get("safety_class") in wanted
    ]
