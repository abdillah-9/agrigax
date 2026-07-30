"""
Pipeline orchestrator — Brain 1 (generic) + Brain 2 (domain intelligence).

Flow:
  Dataset → Generic Engine → Domain Detector → Knowledge Pack
         → Organization Profile → Recommendations → Audit Log
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Optional

from .audit import AuditLog
from .auto_clean import interactive_fix_chooser, run_auto_clean
from .business_rules import validate_business_rules
from .domain.apply import (
    apply_terminology,
    check_template_issues,
    enrich_recommendations_with_domain,
)
from .domain.detector import detect_domain
from .domain.organization import (
    learn_organization_profile,
    match_organization_profile,
    validate_against_profile,
)
from .domain.packs import load_knowledge_pack, merge_pack_into_config
from .duplicates import analyze_duplicates
from .encoding import analyze_dataframe_encoding, detect_file_encoding
from .formatting import analyze_formatting
from .loader import load_dataset
from .missing import analyze_missing
from .outliers import detect_outliers
from .profiler import profile_dataset
from .quality_score import compute_quality_score
from .range_validation import validate_ranges
from .recommendations import SAFE, build_recommendations
from .report import generate_reports
from .statistics import compute_statistics
from .text_cleaning import analyze_text_quality
from .type_detector import detect_types


def run_pipeline(
    source: str,
    *,
    output_dir: str = "output",
    rules_path: Optional[str] = None,
    clean_mode: str = "none",
    apply_ids: Optional[list[str]] = None,
    report_formats: Optional[list[str]] = None,
    table: Optional[str] = None,
    query: Optional[str] = None,
    sheet_name: Optional[str | int] = 0,
    interactive: bool = False,
    save_cleaned: bool = True,
    defer_clean_choice: bool = False,
    domain: Optional[str] = None,
    org: Optional[str] = None,
    learn_org: Optional[str] = None,
    no_domain: bool = False,
) -> dict[str, Any]:
    """
    Full data-quality pipeline with optional domain + organization intelligence.

    domain: force a knowledge pack (e.g. "healthcare"); None = auto-detect
    org: force/match an organization profile by name
    learn_org: save/update an organization profile after analysis
    no_domain: skip Brain 2 entirely (generic only)
    """
    output_dir = str(Path(output_dir))
    Path(output_dir).mkdir(parents=True, exist_ok=True)

    if rules_path is None:
        rules_path = str(
            Path(__file__).resolve().parent.parent / "config" / "default_rules.yaml"
        )

    audit = AuditLog(source=source)
    result: dict[str, Any] = {
        "source": source,
        "findings": {},
        "_meta": {
            "rules_path": rules_path,
            "output_dir": output_dir,
            "report_formats": report_formats,
            "save_cleaned": save_cleaned,
            "domain": domain,
            "org": org,
            "learn_org": learn_org,
            "no_domain": no_domain,
        },
    }

    # --- Phase 1: Load ---
    file_encoding = None
    if Path(source).exists() and Path(source).suffix.lower() in {
        ".csv", ".tsv", ".txt", ".json"
    }:
        file_encoding = detect_file_encoding(source)
        result["file_encoding"] = file_encoding

    df = load_dataset(
        source,
        sheet_name=sheet_name,
        table=table,
        query=query,
        encoding=(file_encoding or {}).get("encoding") if file_encoding else None,
    )
    audit.record(
        action="Load dataset",
        reason="Dataset loaded into standardized DataFrame",
        rule="Phase 1 — Loader",
        original=source,
        new=f"{df.shape[0]} rows × {df.shape[1]} cols",
        rows_affected=len(df),
    )
    original_df = df.copy()
    result["_df"] = df
    result["_original_df"] = original_df
    result["_audit"] = audit

    # --- Brain 2: Domain Detector + Knowledge Pack + Org Profile ---
    pack = None
    org_profile = None
    org_validation = None
    merged_cfg = merge_pack_into_config(rules_path, {})

    if no_domain:
        detection = {
            "domain": None,
            "confidence": 0.0,
            "message": "Domain detection skipped (--no-domain). Generic engine only.",
            "scores": {},
        }
    else:
        detection = detect_domain(df, forced_domain=domain)
        if detection.get("domain"):
            pack = load_knowledge_pack(detection["domain"])
            audit.record(
                action="Load knowledge pack",
                reason=detection.get("message", "Domain pack loaded"),
                rule=f"Domain Pack — {detection['domain']}",
                original="generic",
                new=detection["domain"],
                rows_affected=0,
                safety_class="Safe",
            )

        org_profile = match_organization_profile(
            df, org_name=org, domain=detection.get("domain")
        )
        if org_profile:
            org_validation = validate_against_profile(df, org_profile)
            audit.record(
                action="Match organization profile",
                reason=org_validation.get("message", "Organization profile matched"),
                rule=f"Org Profile — {org_profile.get('id')}",
                original=org_profile.get("name"),
                new=f"fingerprint {org_profile.get('column_fingerprint')}",
                rows_affected=0,
            )

        merged_cfg = merge_pack_into_config(rules_path, pack or {}, org_profile)

    result["domain_detection"] = detection
    result["knowledge_pack"] = {
        "domain": (pack or {}).get("domain"),
        "meta": (pack or {}).get("meta"),
        "path": (pack or {}).get("path"),
        "sources": merged_cfg.get("sources"),
    } if pack or org_profile else {"domain": None, "sources": ["generic"]}
    result["organization"] = {
        "profile": {
            k: v for k, v in (org_profile or {}).items()
            if k not in ("rules",)  # keep payload lighter
        } if org_profile else None,
        "validation": org_validation,
    }

    # Persist merged runtime config for cleaning / re-score
    result["_merged_cfg"] = merged_cfg
    result["_pack"] = pack
    sentinels = merged_cfg.get("missing_sentinels") or []
    ranges_cfg = merged_cfg.get("ranges") or {}
    rules_list = merged_cfg.get("rules") or []
    terminology = merged_cfg.get("terminology") or {}
    global_synonyms = merged_cfg.get("global_synonyms") or {}
    domain_recs = merged_cfg.get("domain_recommendations") or {}

    # Resolve terminology keys to actual column names
    term_by_actual_col = {}
    lower_cols = {c.lower(): c for c in df.columns}
    for key, mapping in terminology.items():
        actual = lower_cols.get(key.lower(), key)
        term_by_actual_col[actual] = mapping

    # --- Phases 2–12 (generic engine, domain-aware config) ---
    result["findings"]["profile"] = profile_dataset(df)
    result["findings"]["types"] = detect_types(df)
    result["findings"]["missing"] = analyze_missing(df, sentinels=sentinels)
    result["findings"]["duplicates"] = analyze_duplicates(df)
    result["findings"]["formatting"] = analyze_formatting(
        df,
        extra_synonym_maps=term_by_actual_col,
        global_synonyms=global_synonyms,
    )
    result["findings"]["ranges"] = validate_ranges(df, ranges=ranges_cfg)
    result["findings"]["business_rules"] = validate_business_rules(df, rules=rules_list)
    result["findings"]["outliers"] = detect_outliers(df)
    result["findings"]["text"] = analyze_text_quality(df)
    result["findings"]["encoding"] = analyze_dataframe_encoding(df)
    result["findings"]["statistics"] = compute_statistics(df)

    # --- Phase 13–14 ---
    result["quality"] = compute_quality_score(result["findings"])
    recommendations = build_recommendations(result["findings"])

    # Inject terminology recommendation (Safe)
    if term_by_actual_col or global_synonyms:
        recommendations["recommendations"].insert(0, {
            "id": "terminology_pack",
            "column": None,
            "category": "terminology",
            "issue": "Domain/organization terminology available",
            "recommendation": "Normalize terms using Knowledge Pack maps (e.g. HTN→Hypertension, M→Male)",
            "confidence": 93.0,
            "why_detected": (
                f"Loaded terminology from sources: {', '.join(merged_cfg.get('sources') or [])}."
            ),
            "reason": "Canonical terms improve joins, filters, and reporting consistency.",
            "safety_class": SAFE,
            "rule": "Terminology Rule — knowledge pack",
            "auto_applicable": True,
        })
        recommendations["safe_count"] = recommendations.get("safe_count", 0) + 1
        recommendations["count"] = len(recommendations["recommendations"])

    # Org template issues
    for rec in check_template_issues(org_validation or {}):
        recommendations["recommendations"].append(rec)
        recommendations["never_automatic_count"] = (
            recommendations.get("never_automatic_count", 0) + 1
        )
        recommendations["count"] = len(recommendations["recommendations"])

    # Domain-specific advice (possible causes)
    recommendations = enrich_recommendations_with_domain(
        recommendations, domain_recs, domain=detection.get("domain")
    )
    # Rebuild by_class
    recommendations["by_class"] = {
        "Safe": [r for r in recommendations["recommendations"] if r.get("safety_class") == "Safe"],
        "Needs Approval": [
            r for r in recommendations["recommendations"]
            if r.get("safety_class") == "Needs Approval"
        ],
        "Never Automatic": [
            r for r in recommendations["recommendations"]
            if r.get("safety_class") == "Never Automatic"
        ],
    }
    result["recommendations"] = recommendations

    result["_sentinels"] = sentinels
    result["_ranges_cfg"] = ranges_cfg
    result["_rules_list"] = rules_list
    result["_rules_path"] = rules_path
    result["_terminology"] = term_by_actual_col
    result["_global_synonyms"] = global_synonyms

    # Learn organization profile if requested
    if learn_org:
        learned = learn_organization_profile(
            df,
            name=learn_org,
            domain=detection.get("domain"),
            findings=result["findings"],
            notes=f"Learned from {source}",
        )
        result["organization"]["learned"] = {
            "id": learned.get("id"),
            "name": learned.get("name"),
            "path": learned.get("_path"),
            "seen_count": learned.get("seen_count"),
        }
        audit.record(
            action="Learn organization profile",
            reason=f"Saved/updated profile for recurring template '{learn_org}'",
            rule="Org Learning",
            original=source,
            new=learned.get("_path"),
        )

    if defer_clean_choice or clean_mode == "none":
        cleaned_df = df
        result["cleaning"] = {
            "mode": "none",
            "applied": [],
            "skipped": [],
            "rows_before": len(original_df),
            "rows_after": len(cleaned_df),
            "cols_before": original_df.shape[1],
            "cols_after": cleaned_df.shape[1],
        }
        return _finalize(
            result, cleaned_df, audit, output_dir,
            report_formats=report_formats,
            save_cleaned=save_cleaned and clean_mode != "none",
        )

    return apply_cleaning(
        result,
        clean_mode=clean_mode,
        apply_ids=apply_ids,
        interactive=interactive,
    )


def apply_cleaning(
    result: dict[str, Any],
    *,
    clean_mode: str = "ask",
    apply_ids: Optional[list[str]] = None,
    interactive: bool = False,
) -> dict[str, Any]:
    """Apply user-selected fixes to an analyzed result, then write audit + reports."""
    df = result["_df"]
    original_df = result["_original_df"]
    audit: AuditLog = result["_audit"]
    meta = result.get("_meta") or {}
    output_dir = meta.get("output_dir", "output")
    report_formats = meta.get("report_formats")
    save_cleaned = meta.get("save_cleaned", True)
    recommendations = result["recommendations"]
    findings = result["findings"]

    mode = clean_mode
    selected_ids = list(apply_ids or [])

    if mode == "ask" and not selected_ids:
        if interactive:
            selected_ids = interactive_fix_chooser(recommendations)
            mode = "selected"
        else:
            mode = "none"

    cleaned_df, applied, skipped = run_auto_clean(
        df,
        findings,
        recommendations,
        mode=mode,
        apply_ids=selected_ids if mode == "selected" else apply_ids,
    )

    # Apply terminology if selected / safe / all
    term_id = "terminology_pack"
    should_term = False
    if mode == "safe":
        should_term = True
    elif mode == "all":
        should_term = True
    elif mode == "selected" and term_id in set(selected_ids or apply_ids or []):
        should_term = True
    # Also if run_auto_clean already would have — handle here since category is custom
    if should_term and (result.get("_terminology") or result.get("_global_synonyms")):
        cleaned_df, term_actions = apply_terminology(
            cleaned_df,
            result.get("_terminology") or {},
            result.get("_global_synonyms") or {},
        )
        applied.extend(term_actions)
        # Remove from skipped if present
        skipped = [s for s in skipped if s.get("id") != term_id]

    audit.record_many(applied)
    result["cleaning"] = {
        "mode": clean_mode,
        "applied": applied,
        "skipped": skipped,
        "selected_ids": selected_ids,
        "rows_before": len(original_df),
        "rows_after": len(cleaned_df),
        "cols_before": original_df.shape[1],
        "cols_after": cleaned_df.shape[1],
    }

    if applied:
        sentinels = result.get("_sentinels")
        ranges_cfg = result.get("_ranges_cfg")
        rules_list = result.get("_rules_list")
        post_findings = {
            "profile": profile_dataset(cleaned_df),
            "types": detect_types(cleaned_df),
            "missing": analyze_missing(cleaned_df, sentinels=sentinels),
            "duplicates": analyze_duplicates(cleaned_df),
            "formatting": analyze_formatting(
                cleaned_df,
                extra_synonym_maps=result.get("_terminology") or {},
                global_synonyms=result.get("_global_synonyms") or {},
            ),
            "ranges": validate_ranges(cleaned_df, ranges=ranges_cfg),
            "business_rules": validate_business_rules(cleaned_df, rules=rules_list),
            "outliers": detect_outliers(cleaned_df),
            "encoding": analyze_dataframe_encoding(cleaned_df),
        }
        result["quality_after"] = compute_quality_score(post_findings)
        result["findings_after"] = post_findings
        result["recommendations_after"] = build_recommendations(post_findings)

    return _finalize(
        result, cleaned_df, audit, output_dir,
        report_formats=report_formats,
        save_cleaned=save_cleaned,
    )


def _finalize(
    result: dict,
    cleaned_df,
    audit: AuditLog,
    output_dir: str,
    *,
    report_formats: Optional[list[str]],
    save_cleaned: bool,
) -> dict:
    result["audit"] = audit.to_dict()
    audit.save_json(str(Path(output_dir) / "audit_log.json"))
    audit.save_markdown(str(Path(output_dir) / "audit_log.md"))

    if save_cleaned:
        cleaned_path = Path(output_dir) / "cleaned_dataset.csv"
        cleaned_df.to_csv(cleaned_path, index=False)
        result["cleaned_path"] = str(cleaned_path)

    report_payload = {k: v for k, v in result.items() if not k.startswith("_")}
    report_paths = generate_reports(
        report_payload,
        output_dir,
        formats=report_formats or ["markdown", "html", "pdf", "json"],
        title="Data Quality Report",
    )
    result["report_paths"] = report_paths
    result["dataframe"] = cleaned_df
    return result
