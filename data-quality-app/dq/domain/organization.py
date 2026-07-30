"""
Organization Learning — remember recurring ministry/NGO templates.

Generic → Domain → Organization-specific knowledge.
"""

from __future__ import annotations

import hashlib
import json
import re
from datetime import datetime
from pathlib import Path
from typing import Any, Optional

import pandas as pd
import yaml

ORG_ROOT = Path(__file__).resolve().parent.parent.parent / "organizations" / "profiles"


def _slug(name: str) -> str:
    s = re.sub(r"[^a-zA-Z0-9]+", "_", name.strip().lower()).strip("_")
    return s or "unnamed"


def column_fingerprint(columns: list[str]) -> str:
    norm = sorted(c.strip().lower() for c in columns)
    blob = "|".join(norm)
    return hashlib.sha256(blob.encode("utf-8")).hexdigest()[:16]


def list_organization_profiles() -> list[dict[str, Any]]:
    ORG_ROOT.mkdir(parents=True, exist_ok=True)
    profiles = []
    for path in sorted(ORG_ROOT.glob("*.yaml")):
        with open(path, encoding="utf-8") as f:
            data = yaml.safe_load(f) or {}
        data["_path"] = str(path)
        profiles.append(data)
    return profiles


def match_organization_profile(
    df: pd.DataFrame,
    *,
    org_name: Optional[str] = None,
    domain: Optional[str] = None,
) -> Optional[dict[str, Any]]:
    """
    Match dataset to a saved organization profile.

    Priority:
      1. Exact org id/name if provided
      2. Exact column fingerprint
      3. High column overlap (>= 80%) within same domain
    """
    profiles = list_organization_profiles()
    if not profiles:
        return None

    cols = [str(c) for c in df.columns]
    fp = column_fingerprint(cols)
    col_set = {c.lower() for c in cols}

    if org_name:
        slug = _slug(org_name)
        for p in profiles:
            if p.get("id") == slug or _slug(p.get("name", "")) == slug:
                return {**p, "match_type": "named", "match_confidence": 1.0}

    # Exact fingerprint
    for p in profiles:
        if p.get("column_fingerprint") == fp:
            if domain and p.get("domain") and p["domain"] != domain:
                continue
            return {**p, "match_type": "fingerprint", "match_confidence": 0.98}

    # Overlap match
    best = None
    best_score = 0.0
    for p in profiles:
        if domain and p.get("domain") and p["domain"] != domain:
            continue
        expected = {c.lower() for c in (p.get("expected_columns") or [])}
        if not expected:
            continue
        overlap = len(col_set & expected) / max(len(expected), 1)
        coverage = len(col_set & expected) / max(len(col_set), 1)
        score = 0.6 * overlap + 0.4 * coverage
        if score > best_score:
            best_score = score
            best = p

    if best and best_score >= 0.8:
        return {
            **best,
            "match_type": "overlap",
            "match_confidence": round(best_score, 3),
        }
    return None


def learn_organization_profile(
    df: pd.DataFrame,
    *,
    name: str,
    domain: Optional[str] = None,
    findings: Optional[dict] = None,
    notes: str = "",
) -> dict[str, Any]:
    """
    Create or update an organization profile from the current dataset.

    Remembers expected columns, common formatting maps, and domain.
    """
    ORG_ROOT.mkdir(parents=True, exist_ok=True)
    org_id = _slug(name)
    path = ORG_ROOT / f"{org_id}.yaml"

    cols = [str(c) for c in df.columns]
    existing = {}
    if path.exists():
        with open(path, encoding="utf-8") as f:
            existing = yaml.safe_load(f) or {}

    # Harvest terminology suggestions from formatting findings
    terminology: dict[str, dict] = dict(existing.get("terminology") or {})
    if findings:
        for issue in (findings.get("formatting") or {}).get("text_formatting", []):
            col = issue.get("column")
            mapping = issue.get("suggested_map") or {}
            if col and mapping:
                terminology.setdefault(col, {}).update(mapping)

    # Required = columns with low missing in this run
    required = list(existing.get("required_columns") or [])
    if findings:
        for col in (findings.get("missing") or {}).get("columns", []):
            if col.get("missing_pct", 100) < 5 and col["name"] not in required:
                required.append(col["name"])

    # Common problems seen
    common_problems = list(existing.get("common_problems") or [])
    if findings:
        for col in (findings.get("profile") or {}).get("columns", []):
            for p in col.get("problems") or []:
                entry = f"{col['name']}: {p}"
                if entry not in common_problems:
                    common_problems.append(entry)
        common_problems = common_problems[-50:]

    profile = {
        "id": org_id,
        "name": name,
        "domain": domain or existing.get("domain"),
        "column_fingerprint": column_fingerprint(cols),
        "expected_columns": cols,
        "required_columns": required or cols[: min(5, len(cols))],
        "terminology": terminology,
        "ranges": existing.get("ranges") or {},
        "rules": existing.get("rules") or [],
        "missing_sentinels": existing.get("missing_sentinels") or [],
        "common_problems": common_problems,
        "notes": notes or existing.get("notes") or "",
        "seen_count": int(existing.get("seen_count") or 0) + 1,
        "updated_at": datetime.now().isoformat(timespec="seconds"),
        "created_at": existing.get("created_at")
        or datetime.now().isoformat(timespec="seconds"),
    }

    with open(path, "w", encoding="utf-8") as f:
        yaml.safe_dump(profile, f, sort_keys=False, allow_unicode=True)

    # Also keep a JSON copy for easy inspection
    json_path = ORG_ROOT / f"{org_id}.json"
    json_path.write_text(json.dumps(profile, indent=2, default=str), encoding="utf-8")

    profile["_path"] = str(path)
    return profile


def validate_against_profile(df: pd.DataFrame, profile: dict) -> dict[str, Any]:
    """Check dataset against remembered organization template."""
    expected = [c.lower() for c in (profile.get("expected_columns") or [])]
    required = [c.lower() for c in (profile.get("required_columns") or [])]
    actual = [c.lower() for c in df.columns]

    missing_expected = [c for c in expected if c not in actual]
    unexpected = [c for c in actual if c not in expected] if expected else []
    missing_required = [c for c in required if c not in actual]

    return {
        "profile_id": profile.get("id"),
        "profile_name": profile.get("name"),
        "missing_expected_columns": missing_expected,
        "unexpected_columns": unexpected,
        "missing_required_columns": missing_required,
        "template_match_ok": len(missing_required) == 0,
        "message": (
            f"Matched organization profile '{profile.get('name')}' "
            f"({profile.get('match_type', 'saved')}, "
            f"confidence {profile.get('match_confidence', 1):.0%})."
            if profile.get("match_type")
            else f"Using organization profile '{profile.get('name')}'."
        ),
    }
