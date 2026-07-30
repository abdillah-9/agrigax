"""
Knowledge Pack loader.

Each pack lives under knowledge/<domain>/:
  pack.yaml, signals.yaml, rules.yaml, ranges.yaml,
  terminology.yaml, recommendations.yaml
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Optional

import yaml

KNOWLEDGE_ROOT = Path(__file__).resolve().parent.parent.parent / "knowledge"


def list_packs() -> list[str]:
    if not KNOWLEDGE_ROOT.exists():
        return []
    packs = []
    for p in sorted(KNOWLEDGE_ROOT.iterdir()):
        if p.is_dir() and not p.name.startswith(("_", ".")):
            if (p / "pack.yaml").exists() or (p / "signals.yaml").exists():
                packs.append(p.name)
    return packs


def pack_path(domain: str) -> Path:
    return KNOWLEDGE_ROOT / domain


def load_pack_file(domain: str, filename: str) -> Optional[dict | list]:
    path = pack_path(domain) / filename
    if not path.exists():
        return None
    with open(path, encoding="utf-8") as f:
        return yaml.safe_load(f) or {}


def load_knowledge_pack(domain: str) -> dict[str, Any]:
    """Load a full knowledge pack into a single dict."""
    if domain not in list_packs():
        raise ValueError(f"Unknown knowledge pack: {domain}")

    pack = load_pack_file(domain, "pack.yaml") or {}
    signals = load_pack_file(domain, "signals.yaml") or {}
    rules_doc = load_pack_file(domain, "rules.yaml") or {}
    ranges_doc = load_pack_file(domain, "ranges.yaml") or {}
    terminology = load_pack_file(domain, "terminology.yaml") or {}
    recommendations = load_pack_file(domain, "recommendations.yaml") or {}

    # Normalize shapes
    rules = rules_doc.get("rules", rules_doc) if isinstance(rules_doc, dict) else rules_doc
    if not isinstance(rules, list):
        rules = []

    ranges = ranges_doc.get("ranges", ranges_doc) if isinstance(ranges_doc, dict) else {}
    if not isinstance(ranges, dict):
        ranges = {}

    sentinels = []
    if isinstance(rules_doc, dict):
        sentinels = list(rules_doc.get("missing_sentinels") or [])
    if isinstance(ranges_doc, dict) and ranges_doc.get("missing_sentinels"):
        sentinels = list(ranges_doc["missing_sentinels"])

    term_maps = {}
    if isinstance(terminology, dict):
        # Either {column: {old: new}} or {maps: {column: {...}}} or global synonyms
        if "maps" in terminology:
            term_maps = terminology["maps"] or {}
        else:
            # columns that aren't metadata keys
            meta = {"description", "version", "domain", "synonyms"}
            term_maps = {k: v for k, v in terminology.items() if k not in meta and isinstance(v, dict)}
        global_synonyms = terminology.get("synonyms") or {}
    else:
        global_synonyms = {}

    return {
        "domain": domain,
        "meta": pack if isinstance(pack, dict) else {},
        "signals": signals if isinstance(signals, dict) else {},
        "rules": rules,
        "ranges": {str(k).lower(): v for k, v in ranges.items()},
        "missing_sentinels": sentinels,
        "terminology": term_maps,
        "global_synonyms": global_synonyms if isinstance(global_synonyms, dict) else {},
        "domain_recommendations": recommendations if isinstance(recommendations, dict) else {},
        "path": str(pack_path(domain)),
    }


def merge_pack_into_config(
    base_rules_path: Optional[str],
    pack: dict[str, Any],
    org_profile: Optional[dict] = None,
) -> dict[str, Any]:
    """
    Merge generic config + knowledge pack + org profile into one runtime config.

    Returns dict with keys: rules, ranges, missing_sentinels, terminology, domain_recommendations
    """
    import copy

    base: dict[str, Any] = {"rules": [], "ranges": {}, "missing_sentinels": []}
    if base_rules_path and Path(base_rules_path).exists():
        with open(base_rules_path, encoding="utf-8") as f:
            loaded = yaml.safe_load(f) or {}
        base["rules"] = list(loaded.get("rules") or [])
        base["ranges"] = dict(loaded.get("ranges") or {})
        base["missing_sentinels"] = list(loaded.get("missing_sentinels") or [])

    merged = {
        "rules": copy.deepcopy(base["rules"]),
        "ranges": {str(k).lower(): v for k, v in base["ranges"].items()},
        "missing_sentinels": list(base["missing_sentinels"]),
        "terminology": {},
        "global_synonyms": {},
        "domain_recommendations": {},
        "sources": ["generic"],
    }

    if pack:
        # Pack rules append (pack-specific ids win if duplicate id)
        existing_ids = {r.get("id") for r in merged["rules"]}
        for r in pack.get("rules") or []:
            if r.get("id") in existing_ids:
                merged["rules"] = [x for x in merged["rules"] if x.get("id") != r.get("id")]
            merged["rules"].append(r)
        merged["ranges"].update(pack.get("ranges") or {})
        for s in pack.get("missing_sentinels") or []:
            if s not in merged["missing_sentinels"]:
                merged["missing_sentinels"].append(s)
        merged["terminology"].update(pack.get("terminology") or {})
        merged["global_synonyms"].update(pack.get("global_synonyms") or {})
        merged["domain_recommendations"] = pack.get("domain_recommendations") or {}
        merged["sources"].append(f"pack:{pack.get('domain')}")

    if org_profile:
        org_rules = org_profile.get("rules") or []
        existing_ids = {r.get("id") for r in merged["rules"]}
        for r in org_rules:
            if r.get("id") in existing_ids:
                merged["rules"] = [x for x in merged["rules"] if x.get("id") != r.get("id")]
            merged["rules"].append(r)
        merged["ranges"].update(
            {str(k).lower(): v for k, v in (org_profile.get("ranges") or {}).items()}
        )
        for s in org_profile.get("missing_sentinels") or []:
            if s not in merged["missing_sentinels"]:
                merged["missing_sentinels"].append(s)
        # Org terminology overrides pack
        for col, mapping in (org_profile.get("terminology") or {}).items():
            merged["terminology"].setdefault(col, {}).update(mapping)
        merged["sources"].append(f"org:{org_profile.get('id') or org_profile.get('name')}")
        merged["org_profile_id"] = org_profile.get("id")
        merged["expected_columns"] = org_profile.get("expected_columns") or []
        merged["required_columns"] = org_profile.get("required_columns") or []

    return merged
