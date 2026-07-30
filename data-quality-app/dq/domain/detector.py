"""
Domain Detector — figures out which Knowledge Pack fits the dataset.

Scores each pack from column-name signals (+ optional value hints).
"""

from __future__ import annotations

from typing import Any, Optional

import pandas as pd

from .packs import list_packs, load_pack_file


def detect_domain(
    df: pd.DataFrame,
    *,
    forced_domain: Optional[str] = None,
    min_confidence: float = 0.35,
) -> dict[str, Any]:
    """
    Detect the most likely domain for a DataFrame.

    Returns:
      domain, confidence (0-1), scores{domain: float}, matched_signals, message
    """
    if forced_domain:
        packs = list_packs()
        if forced_domain not in packs:
            return {
                "domain": None,
                "confidence": 0.0,
                "forced": forced_domain,
                "error": f"Unknown domain '{forced_domain}'. Available: {packs}",
                "scores": {},
                "matched_signals": [],
                "message": f"Forced domain '{forced_domain}' not found.",
            }
        meta = load_pack_file(forced_domain, "pack.yaml") or {}
        return {
            "domain": forced_domain,
            "confidence": 1.0,
            "forced": True,
            "display_name": meta.get("display_name", forced_domain.title()),
            "scores": {forced_domain: 1.0},
            "matched_signals": [f"(forced) {forced_domain}"],
            "message": (
                f"Domain forced: {meta.get('display_name', forced_domain.title())} (100%)"
            ),
        }

    columns = [str(c) for c in df.columns]
    col_lower = [c.lower().strip() for c in columns]
    joined = " ".join(col_lower)

    scores: dict[str, float] = {}
    matched: dict[str, list[str]] = {}

    for domain in list_packs():
        signals = load_pack_file(domain, "signals.yaml") or {}
        strong = [str(s).lower() for s in (signals.get("strong_columns") or [])]
        weak = [str(s).lower() for s in (signals.get("weak_columns") or [])]
        keywords = [str(s).lower() for s in (signals.get("keywords") or [])]
        exclude = [str(s).lower() for s in (signals.get("exclude_columns") or [])]

        hits: list[str] = []
        points = 0.0

        for sig in strong:
            if _column_matches(sig, col_lower, joined):
                points += 3.0
                hits.append(f"strong:{sig}")
        for sig in weak:
            if _column_matches(sig, col_lower, joined):
                points += 1.0
                hits.append(f"weak:{sig}")
        for kw in keywords:
            if kw in joined:
                points += 0.5
                hits.append(f"keyword:{kw}")
        for ex in exclude:
            if _column_matches(ex, col_lower, joined):
                points -= 2.0
                hits.append(f"exclude:{ex}")

        budget = max(1.0, 3.0 * max(len(strong), 1) + max(len(weak), 1))
        score = max(0.0, min(1.0, points / budget * 1.4))
        strong_hits = sum(1 for h in hits if h.startswith("strong:"))
        if strong_hits >= 3:
            score = min(1.0, score + 0.15)
        if strong_hits >= 5:
            score = min(1.0, score + 0.1)

        scores[domain] = round(score, 4)
        matched[domain] = hits

    if not scores:
        return {
            "domain": None,
            "confidence": 0.0,
            "scores": {},
            "matched_signals": [],
            "message": "No knowledge packs installed.",
        }

    ranked = sorted(scores.items(), key=lambda x: -x[1])
    best_domain, best_score = ranked[0]
    second = ranked[1][1] if len(ranked) > 1 else 0.0

    if best_score < min_confidence:
        return {
            "domain": None,
            "confidence": best_score,
            "scores": scores,
            "ranked": ranked[:5],
            "matched_signals": matched.get(best_domain, []),
            "message": (
                f"No confident domain match (best was {best_domain} at "
                f"{best_score:.0%}). Using generic engine only."
            ),
        }

    pack_meta = load_pack_file(best_domain, "pack.yaml") or {}
    display = pack_meta.get("display_name", best_domain.title())

    if best_score - second < 0.08 and second >= min_confidence:
        return {
            "domain": best_domain,
            "confidence": round(best_score * 0.85, 4),
            "ambiguous": True,
            "display_name": display,
            "scores": scores,
            "ranked": ranked[:5],
            "matched_signals": matched.get(best_domain, []),
            "message": (
                f"Ambiguous domain — leaning {display} ({best_score:.0%}) "
                f"over {ranked[1][0]} ({second:.0%}). "
                f"Override with --domain if wrong."
            ),
        }

    return {
        "domain": best_domain,
        "confidence": best_score,
        "display_name": display,
        "scores": scores,
        "ranked": ranked[:5],
        "matched_signals": matched.get(best_domain, []),
        "message": (
            f"Domain Detection: {display} — Confidence {best_score:.0%} "
            f"— Loaded {best_domain} Knowledge Pack"
        ),
    }


def _column_matches(signal: str, col_lower: list[str], joined: str) -> bool:
    sig = signal.lower().strip()
    if not sig:
        return False
    for c in col_lower:
        if c == sig or sig in c or c in sig:
            return True
        if sig.replace(" ", "_") == c or sig.replace("_", " ") == c:
            return True
    return sig in joined
