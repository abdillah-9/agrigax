"""
Phase 15 — Cleaning Engine

Safety classes:
  Safe            — reversible / low-risk; can auto-apply
  Needs Approval  — changes meaning of data; user must approve
  Never Automatic — reported only; never applied by the engine

Users choose which fixes to apply. Every cell-level change can be audited.
"""

from __future__ import annotations

from typing import Any, Callable, Optional

import numpy as np
import pandas as pd

from .duplicates import drop_exact_duplicates
from .encoding import repair_dataframe_encoding, repair_mojibake, _looks_like_mojibake
from .formatting import apply_formatting_fixes
from .missing import replace_sentinels_with_nan
from .recommendations import (
    SAFE,
    NEEDS_APPROVAL,
    NEVER_AUTOMATIC,
    ids_for_safety_classes,
)
from .type_detector import apply_type_casts


ApplyChoice = str  # "apply" | "skip" | "manual"


def interactive_fix_chooser(recommendations: dict[str, Any]) -> list[str]:
    """
    Show all fixes by safety class with why_detected, then let the user choose.

    Returns list of recommendation ids to apply.
    Never Automatic ids are never returned.
    """
    recs = recommendations.get("recommendations") or []
    if not recs:
        print("\nNo recommendations to apply.")
        return []

    indexed = []
    print("\n" + "=" * 72)
    print(" FIXES BY SAFETY CLASS")
    print("=" * 72)

    for cls, label_note in (
        (SAFE, "low risk — safe to auto-apply"),
        (NEEDS_APPROVAL, "changes data meaning — approve each"),
        (NEVER_AUTOMATIC, "review only — NEVER applied automatically"),
    ):
        group = [r for r in recs if r.get("safety_class") == cls]
        print(f"\n── {cls} ({label_note}) ──")
        if not group:
            print("  (none)")
            continue
        for r in group:
            indexed.append(r)
            n = len(indexed)
            col = r.get("column") or "—"
            print(f"\n  [{n}] id={r['id']}")
            print(f"      Column:         {col}")
            print(f"      Issue:          {r.get('issue')}")
            print(f"      Recommendation: {r.get('recommendation')}")
            print(f"      Confidence:     {r.get('confidence')}%")
            print(f"      Why detected:   {r.get('why_detected')}")
            print(f"      Fix reason:     {r.get('reason')}")
            print(f"      Rule:           {r.get('rule')}")
            if cls == NEVER_AUTOMATIC:
                print("      → Cannot be selected for automatic apply.")

    selectable = {
        i + 1: r
        for i, r in enumerate(indexed)
        if r.get("safety_class") != NEVER_AUTOMATIC
    }

    print("\n" + "-" * 72)
    print("Choose fixes to apply:")
    print("  safe          → all Safe fixes")
    print("  approval      → review Needs Approval one-by-one")
    print("  1,3,5         → specific numbers from the list above")
    print("  safe+2,4      → Safe class plus selected numbers")
    print("  none          → apply nothing")
    print("-" * 72)

    while True:
        raw = input("Your choice: ").strip().lower()
        if raw in ("", "none", "n", "skip"):
            return []
        if raw in ("safe", "all-safe"):
            return ids_for_safety_classes(recommendations, [SAFE])
        if raw == "approval":
            return _prompt_needs_approval(recommendations)
        if raw.startswith("safe+"):
            ids = ids_for_safety_classes(recommendations, [SAFE])
            nums = raw[5:]
            ids.extend(_parse_numbers(nums, selectable))
            return list(dict.fromkeys(ids))
        if raw.replace(",", "").replace(" ", "").isdigit() or any(
            c.isdigit() for c in raw
        ):
            return _parse_numbers(raw, selectable)
        print("  Invalid. Try: safe | approval | 1,2,3 | none")


def _parse_numbers(raw: str, selectable: dict[int, dict]) -> list[str]:
    ids = []
    for part in raw.replace(" ", "").split(","):
        if not part:
            continue
        if not part.isdigit():
            print(f"  Skipping invalid token: {part}")
            continue
        n = int(part)
        if n not in selectable:
            print(f"  [{n}] is not selectable (Never Automatic or out of range).")
            continue
        ids.append(selectable[n]["id"])
    return ids


def _prompt_needs_approval(recommendations: dict) -> list[str]:
    ids = []
    # Always offer Safe first
    ids.extend(ids_for_safety_classes(recommendations, [SAFE]))
    print("\n(Safe fixes will be included. Now review Needs Approval…)")
    for r in recommendations.get("recommendations", []):
        if r.get("safety_class") != NEEDS_APPROVAL:
            continue
        print()
        print(f"  Column:         {r.get('column') or '—'}")
        print(f"  Issue:          {r.get('issue')}")
        print(f"  Recommendation: {r.get('recommendation')}")
        print(f"  Confidence:     {r.get('confidence')}%")
        print(f"  Why detected:   {r.get('why_detected')}")
        print(f"  Fix reason:     {r.get('reason')}")
        while True:
            ans = input("  Apply this? [y/n] (default n): ").strip().lower()
            if ans in ("", "n", "no", "s", "skip"):
                break
            if ans in ("y", "yes", "a", "apply"):
                ids.append(r["id"])
                break
            print("  Please enter y or n.")
    return list(dict.fromkeys(ids))


def run_auto_clean(
    df: pd.DataFrame,
    findings: dict[str, Any],
    recommendations: dict[str, Any],
    *,
    mode: str = "none",
    apply_ids: Optional[list[str]] = None,
    skip_ids: Optional[list[str]] = None,
    prompt_fn: Optional[Callable[[dict], ApplyChoice]] = None,
) -> tuple[pd.DataFrame, list[dict], list[dict]]:
    """
    Apply cleaning based on safety class + user selection.

    mode:
      - "none": apply nothing
      - "safe": apply all Safe
      - "all": apply Safe + Needs Approval (never Never Automatic)
      - "ask": use prompt_fn / interactive chooser should pass apply_ids via "selected"
      - "selected": apply only apply_ids (Never Automatic filtered out)

    Returns (cleaned_df, applied_actions, skipped_actions)
    Each applied action may include value_changes[] for the audit log.
    """
    out = df.copy()
    applied: list[dict] = []
    skipped: list[dict] = []
    apply_ids_set = set(apply_ids or [])
    skip_ids_set = set(skip_ids or [])

    if mode == "safe":
        apply_ids_set = set(ids_for_safety_classes(recommendations, [SAFE]))
        mode = "selected"
    elif mode == "all":
        apply_ids_set = set(
            ids_for_safety_classes(recommendations, [SAFE, NEEDS_APPROVAL])
        )
        mode = "selected"
    elif mode == "ask":
        # Prefer interactive chooser when no prompt_fn override
        if prompt_fn is None:
            apply_ids_set = set(interactive_fix_chooser(recommendations))
            mode = "selected"
        # else: fall through to per-item prompt below

    # Track whole-frame ops so we don't double-apply
    formatting_done = False
    encoding_done = False
    types_done = False
    sentinel_done = False

    for rec in recommendations.get("recommendations", []):
        rid = rec["id"]
        safety = rec.get("safety_class", NEEDS_APPROVAL)

        if rid in skip_ids_set:
            skipped.append({"id": rid, "choice": "skip", "safety_class": safety})
            continue

        # Hard block
        if safety == NEVER_AUTOMATIC:
            skipped.append({
                "id": rid,
                "choice": "never_automatic",
                "safety_class": safety,
                "reason": "Classified as Never Automatic — reported only",
            })
            continue

        if mode == "none":
            skipped.append({"id": rid, "choice": "skip", "safety_class": safety})
            continue

        if mode == "selected":
            if rid not in apply_ids_set:
                skipped.append({"id": rid, "choice": "skip", "safety_class": safety})
                continue
            choice = "apply"
        elif mode == "ask" and prompt_fn:
            choice = prompt_fn(rec)
            if choice != "apply":
                skipped.append({"id": rid, "choice": choice, "safety_class": safety})
                continue
        else:
            skipped.append({"id": rid, "choice": "skip", "safety_class": safety})
            continue

        cat = rec.get("category")
        if cat == "formatting" and formatting_done and rid.startswith("format_"):
            # Allow per-column formatting; date_ ids separate
            pass
        if rid == "sentinel_replace" and sentinel_done:
            skipped.append({"id": rid, "choice": "skip", "reason": "Already applied"})
            continue
        if cat == "encoding" and encoding_done:
            skipped.append({"id": rid, "choice": "skip", "reason": "Already applied"})
            continue
        if cat == "type" and types_done:
            # apply per-column type cast instead of whole frame once — still ok once
            pass

        out, actions = _apply_one(out, rec, findings)
        if actions:
            if isinstance(actions, dict):
                actions = [actions]
            for action in actions:
                action.setdefault("safety_class", safety)
                action.setdefault("why_detected", rec.get("why_detected"))
                applied.append(action)
            if rid == "sentinel_replace":
                sentinel_done = True
            if cat == "encoding":
                encoding_done = True
            if cat == "type":
                types_done = True
            if cat == "formatting":
                formatting_done = True
        else:
            skipped.append({"id": rid, "choice": "skip", "reason": "Nothing to change"})

    return out, applied, skipped


def cli_prompt(rec: dict) -> ApplyChoice:
    """Per-item prompt (legacy / approval walkthrough)."""
    if rec.get("safety_class") == NEVER_AUTOMATIC:
        return "manual"
    print()
    print(f"  Class:          {rec.get('safety_class')}")
    print(f"  Column:         {rec.get('column') or '—'}")
    print(f"  Issue:          {rec.get('issue', rec.get('recommendation'))}")
    print(f"  Recommendation: {rec.get('recommendation')}")
    print(f"  Confidence:     {rec.get('confidence', '?')}%")
    print(f"  Why detected:   {rec.get('why_detected', '')}")
    print(f"  Fix reason:     {rec.get('reason', '')}")
    while True:
        ans = input("  Apply / Skip / Manual? [a/s/m] (default s): ").strip().lower()
        if ans in ("", "s", "skip"):
            return "skip"
        if ans in ("a", "apply", "y", "yes"):
            return "apply"
        if ans in ("m", "manual"):
            return "manual"
        print("  Please enter a, s, or m.")


def _apply_one(
    df: pd.DataFrame,
    rec: dict,
    findings: dict,
) -> tuple[pd.DataFrame, list[dict]]:
    """Apply one recommendation; return list of audit-ready action dicts."""
    cat = rec.get("category")
    col = rec.get("column")
    rid = rec["id"]
    rule = rec.get("rule") or ""
    reason = rec.get("reason") or ""
    why = rec.get("why_detected") or ""

    # --- Sentinels ---
    if rid == "sentinel_replace":
        value_changes = _capture_sentinel_changes(df, findings.get("missing") or {})
        out = replace_sentinels_with_nan(df, analysis=findings.get("missing"))
        return out, [{
            "id": rid,
            "column": None,
            "action": "Replace sentinels with NaN",
            "original": "sentinel codes (999, N/A, …)",
            "new": "NaN",
            "rows_affected": len(value_changes),
            "reason": reason,
            "why_detected": why,
            "rule": rule or "Missing Rule — sentinels",
            "value_changes": value_changes,
        }]

    # --- Missing impute ---
    if cat == "missing" and col and col in df.columns:
        action = rec.get("recommendation", "")
        s = df[col]
        value_changes: list[dict] = []

        if action == "Median":
            numeric = pd.to_numeric(s, errors="coerce")
            fill = numeric.median()
            mask = numeric.isna() & s.notna() | s.isna()
            # fill where numeric is na
            mask = numeric.isna()
            for idx in df.index[mask][:500]:
                value_changes.append({
                    "row": int(idx) if str(idx).isdigit() else idx,
                    "column": col,
                    "original": _cell(s.loc[idx]),
                    "new": fill,
                })
            out = df.copy()
            out[col] = numeric.fillna(fill)
            return out, [{
                "id": rid, "column": col, "action": f"Impute Median ({fill})",
                "original": "missing", "new": fill,
                "rows_affected": int(mask.sum()),
                "reason": reason, "why_detected": why,
                "rule": rule or "Missing Rule — Median",
                "value_changes": value_changes,
            }]

        if action == "Mean":
            numeric = pd.to_numeric(s, errors="coerce")
            fill = float(numeric.mean())
            mask = numeric.isna()
            for idx in df.index[mask][:500]:
                value_changes.append({
                    "row": int(idx) if str(idx).isdigit() else idx,
                    "column": col,
                    "original": _cell(s.loc[idx]),
                    "new": fill,
                })
            out = df.copy()
            out[col] = numeric.fillna(fill)
            return out, [{
                "id": rid, "column": col, "action": f"Impute Mean ({fill})",
                "original": "missing", "new": fill,
                "rows_affected": int(mask.sum()),
                "reason": reason, "why_detected": why,
                "rule": rule or "Missing Rule — Mean",
                "value_changes": value_changes,
            }]

        if action == "Mode":
            mode = s.mode(dropna=True)
            if not len(mode):
                return df, []
            fill = mode.iloc[0]
            mask = s.isna()
            for idx in df.index[mask][:500]:
                value_changes.append({
                    "row": int(idx) if str(idx).isdigit() else idx,
                    "column": col,
                    "original": None,
                    "new": fill,
                })
            out = df.copy()
            out[col] = s.fillna(fill)
            return out, [{
                "id": rid, "column": col, "action": f"Impute Mode ({fill!r})",
                "original": "missing", "new": fill,
                "rows_affected": int(mask.sum()),
                "reason": reason, "why_detected": why,
                "rule": rule or "Missing Rule — Mode",
                "value_changes": value_changes,
            }]

        if action == "Remove" or "Remove" in str(action):
            for cinfo in (findings.get("missing") or {}).get("columns", []):
                if cinfo["name"] == col and cinfo.get("missing_pct", 0) > 60:
                    out = df.drop(columns=[col])
                    return out, [{
                        "id": rid, "column": col,
                        "action": f"Removed column {col}",
                        "original": f"column with {cinfo['missing_pct']}% missing",
                        "new": "(column dropped)",
                        "rows_affected": len(df),
                        "reason": reason, "why_detected": why,
                        "rule": rule or "Missing Rule — remove column",
                    }]
            return df, []

        return df, []

    # --- Type cast (single column preferred) ---
    if cat == "type" and col and col in df.columns and findings.get("types"):
        before = str(df[col].dtype)
        # Cast only this column via a mini report
        mini = {"columns": {col: findings["types"]["columns"][col]}}
        out = apply_type_casts(df, mini)
        after = str(out[col].dtype)
        return out, [{
            "id": rid, "column": col,
            "action": rec.get("recommendation"),
            "original": before, "new": after,
            "rows_affected": len(df),
            "reason": reason, "why_detected": why,
            "rule": rule or "Type Rule — cast",
        }]

    # --- Formatting (text / date for one column) ---
    if cat == "formatting" and findings.get("formatting"):
        fmt = findings["formatting"]
        # Narrow to this column
        narrow = {
            "text_formatting": [
                t for t in fmt.get("text_formatting", [])
                if t.get("column") == col
            ],
            "date_formatting": [
                d for d in fmt.get("date_formatting", [])
                if d.get("column") == col
            ],
        }
        out, changes = apply_formatting_fixes(df, narrow)
        actions = []
        for c in changes:
            value_changes = []
            # Expand mapping into value_changes when possible
            if c.get("original") and c.get("new") and col and col in df.columns:
                old, new = c["original"], c["new"]
                if old not in ("(leading/trailing spaces)",) and not str(old).startswith("["):
                    mask = df[col].astype(str).str.strip() == str(old)
                    for idx in df.index[mask][:200]:
                        value_changes.append({
                            "row": int(idx) if str(idx).isdigit() else idx,
                            "column": col,
                            "original": old,
                            "new": new,
                        })
            actions.append({
                "id": rid,
                "column": c.get("column", col),
                "action": rec.get("recommendation"),
                "original": c.get("original"),
                "new": c.get("new"),
                "rows_affected": c.get("rows_affected", 0),
                "reason": c.get("reason") or reason,
                "why_detected": why,
                "rule": c.get("rule") or rule,
                "value_changes": value_changes,
            })
        return out, actions

    # --- Exact duplicates ---
    if cat == "duplicates" and rid == "dup_exact":
        before = len(df)
        dup_mask = df.duplicated(keep="first")
        dropped_idx = df.index[dup_mask].tolist()
        out = drop_exact_duplicates(df)
        value_changes = [
            {
                "row": int(i) if str(i).isdigit() else i,
                "column": None,
                "original": f"duplicate of earlier row",
                "new": "(row dropped)",
            }
            for i in dropped_idx[:200]
        ]
        return out, [{
            "id": rid, "column": None,
            "action": "Drop exact duplicates",
            "original": f"{before} rows",
            "new": f"{len(out)} rows",
            "rows_affected": before - len(out),
            "reason": reason, "why_detected": why,
            "rule": rule or "Duplicate Rule — exact drop",
            "value_changes": value_changes,
        }]

    # --- Encoding ---
    if cat == "encoding":
        out = df.copy()
        value_changes = []
        if col and col in out.columns:
            s = out[col]
            mask = s.notna() & s.astype(str).map(_looks_like_mojibake)
            for idx in out.index[mask]:
                old = str(out.at[idx, col])
                new = repair_mojibake(old)
                if old != new:
                    value_changes.append({
                        "row": int(idx) if str(idx).isdigit() else idx,
                        "column": col,
                        "original": old,
                        "new": new,
                    })
            if mask.any():
                out.loc[mask, col] = out.loc[mask, col].astype(str).map(repair_mojibake)
        else:
            out, changes = repair_dataframe_encoding(df)
            for c in changes:
                for ex in c.get("examples") or []:
                    value_changes.append({
                        "row": "?",
                        "column": c.get("column"),
                        "original": ex.get("original"),
                        "new": ex.get("new"),
                    })
        sample = value_changes[0] if value_changes else {}
        return out, [{
            "id": rid, "column": col,
            "action": "Repair mojibake",
            "original": sample.get("original"),
            "new": sample.get("new"),
            "rows_affected": len(value_changes),
            "reason": reason, "why_detected": why,
            "rule": rule or "Encoding Rule — UTF-8 restore",
            "value_changes": value_changes,
        }]

    # --- Range → set OOR to NaN ---
    if cat == "range" and col and col in df.columns:
        lo, hi = rec.get("min"), rec.get("max")
        numeric = pd.to_numeric(df[col], errors="coerce")
        mask = numeric.notna()
        if lo is not None:
            mask &= numeric < lo
        above = numeric.notna()
        if hi is not None:
            above = numeric > hi
        else:
            above = pd.Series(False, index=df.index)
        if lo is not None:
            below = numeric.notna() & (numeric < lo)
        else:
            below = pd.Series(False, index=df.index)
        viol = below | above
        value_changes = []
        for idx in df.index[viol][:500]:
            value_changes.append({
                "row": int(idx) if str(idx).isdigit() else idx,
                "column": col,
                "original": _cell(df.at[idx, col]),
                "new": None,
            })
        out = df.copy()
        out.loc[viol, col] = np.nan
        return out, [{
            "id": rid, "column": col,
            "action": f"Set out-of-range values to NaN (bounds [{lo}, {hi}])",
            "original": f"{int(viol.sum())} out-of-range value(s)",
            "new": "NaN",
            "rows_affected": int(viol.sum()),
            "reason": reason, "why_detected": why,
            "rule": rule or f"Range Rule — {col}",
            "value_changes": value_changes,
        }]

    return df, []


def _capture_sentinel_changes(df: pd.DataFrame, missing_analysis: dict) -> list[dict]:
    changes = []
    for cinfo in missing_analysis.get("columns", []):
        col = cinfo["name"]
        if col not in df.columns:
            continue
        for sent in (cinfo.get("sentinels") or {}):
            try:
                num = float(sent)
                mask = pd.to_numeric(df[col], errors="coerce") == num
            except ValueError:
                mask = df[col].astype(str).str.strip().str.lower() == str(sent).strip().lower()
            for idx in df.index[mask][:100]:
                changes.append({
                    "row": int(idx) if str(idx).isdigit() else idx,
                    "column": col,
                    "original": sent,
                    "new": None,
                })
        # empty strings
        if cinfo.get("empty_string"):
            mask = df[col].astype(str).str.strip() == ""
            for idx in df.index[mask][:50]:
                changes.append({
                    "row": int(idx) if str(idx).isdigit() else idx,
                    "column": col,
                    "original": "",
                    "new": None,
                })
    return changes[:500]


def _cell(v: Any) -> Any:
    if v is None or (isinstance(v, float) and np.isnan(v)):
        return None
    try:
        if pd.isna(v):
            return None
    except Exception:
        pass
    return v
