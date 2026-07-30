"""
Phase 10 — Text Cleaning

trim, lower, upper, title, remove spaces/symbols, normalize unicode,
remove emojis, spell suggestions.
"""

from __future__ import annotations

import re
import unicodedata
from typing import Any, Optional

import pandas as pd

try:
    import emoji as emoji_lib
    HAS_EMOJI = True
except ImportError:
    HAS_EMOJI = False

try:
    from unidecode import unidecode
    HAS_UNIDECODE = True
except ImportError:
    HAS_UNIDECODE = False


def clean_text_series(
    s: pd.Series,
    *,
    operations: Optional[list[str]] = None,
) -> tuple[pd.Series, dict[str, Any]]:
    """
    Apply text cleaning operations. Returns (cleaned_series, stats).

    operations: trim, lower, upper, title, remove_spaces, remove_symbols,
                normalize_unicode, remove_emojis, collapse_spaces
    """
    ops = operations or [
        "trim", "collapse_spaces", "normalize_unicode", "remove_emojis"
    ]
    out = s.copy()
    stats = {"operations": ops, "rows_changed": 0}

    mask_str = out.map(lambda x: isinstance(x, str))
    original = out.copy()

    for op in ops:
        if op == "trim":
            out = out.map(lambda x: x.strip() if isinstance(x, str) else x)
        elif op == "lower":
            out = out.map(lambda x: x.lower() if isinstance(x, str) else x)
        elif op == "upper":
            out = out.map(lambda x: x.upper() if isinstance(x, str) else x)
        elif op == "title":
            out = out.map(lambda x: x.title() if isinstance(x, str) else x)
        elif op == "remove_spaces":
            out = out.map(lambda x: x.replace(" ", "") if isinstance(x, str) else x)
        elif op == "collapse_spaces":
            out = out.map(
                lambda x: re.sub(r"\s+", " ", x).strip() if isinstance(x, str) else x
            )
        elif op == "remove_symbols":
            out = out.map(
                lambda x: re.sub(r"[^\w\s]", "", x, flags=re.UNICODE) if isinstance(x, str) else x
            )
        elif op == "normalize_unicode":
            out = out.map(lambda x: _normalize_unicode(x) if isinstance(x, str) else x)
        elif op == "remove_emojis":
            out = out.map(lambda x: _remove_emojis(x) if isinstance(x, str) else x)
        elif op == "ascii_fold":
            out = out.map(lambda x: _ascii_fold(x) if isinstance(x, str) else x)

    changed = (original.astype(str) != out.astype(str)) & mask_str
    stats["rows_changed"] = int(changed.sum())
    return out, stats


def clean_dataframe_text(
    df: pd.DataFrame,
    columns: Optional[list[str]] = None,
    operations: Optional[list[str]] = None,
) -> tuple[pd.DataFrame, list[dict]]:
    """Clean text columns; return df + per-column change records."""
    out = df.copy()
    changes = []
    cols = columns or [
        c for c in df.columns
        if df[c].dtype == object or pd.api.types.is_string_dtype(df[c])
    ]
    for col in cols:
        cleaned, stats = clean_text_series(out[col], operations=operations)
        if stats["rows_changed"]:
            out[col] = cleaned
            changes.append({
                "column": col,
                "rows_affected": stats["rows_changed"],
                "operations": stats["operations"],
                "reason": "Text cleaning",
                "rule": f"Text Clean — {', '.join(stats['operations'])}",
            })
    return out, changes


def spell_suggestions(
    s: pd.Series,
    *,
    max_unique: int = 200,
    max_suggestions: int = 20,
) -> list[dict]:
    """
    Suggest spell corrections for rare tokens vs frequent ones (edit-distance).
    Lightweight — no external dictionary required.
    """
    from difflib import get_close_matches

    tokens = (
        s.dropna()
        .astype(str)
        .str.lower()
        .str.findall(r"[a-zA-Z']+")
        .explode()
        .dropna()
    )
    if tokens.empty:
        return []

    counts = tokens.value_counts()
    if len(counts) > max_unique:
        # Keep most common as dictionary, check rarer ones
        dictionary = counts.head(max_unique).index.tolist()
        rare = counts.tail(min(100, len(counts))).index.tolist()
    else:
        dictionary = counts[counts >= 2].index.tolist() or counts.index.tolist()
        rare = counts[counts == 1].index.tolist()

    suggestions = []
    for word in rare:
        if len(word) < 3:
            continue
        matches = get_close_matches(word, dictionary, n=3, cutoff=0.8)
        matches = [m for m in matches if m != word]
        if matches:
            suggestions.append({
                "token": word,
                "count": int(counts[word]),
                "suggestions": matches,
            })
        if len(suggestions) >= max_suggestions:
            break
    return suggestions


def analyze_text_quality(df: pd.DataFrame) -> dict[str, Any]:
    """Summarize text issues across columns."""
    columns = []
    for col in df.columns:
        if not (df[col].dtype == object or pd.api.types.is_string_dtype(df[col])):
            continue
        s = df[col].dropna().astype(str)
        if s.empty:
            continue
        columns.append({
            "column": col,
            "leading_trailing_ws": int((s != s.str.strip()).sum()),
            "multi_space": int(s.str.contains(r"\s{2,}", regex=True).sum()),
            "has_emoji": int(s.map(_has_emoji).sum()),
            "non_ascii": int(s.map(lambda x: any(ord(c) > 127 for c in x)).sum()),
            "spell_suggestions": spell_suggestions(df[col]),
        })
    return {"columns": columns}


def _normalize_unicode(text: str) -> str:
    # NFKC normalization
    return unicodedata.normalize("NFKC", text)


def _ascii_fold(text: str) -> str:
    if HAS_UNIDECODE:
        return unidecode(text)
    return unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode("ascii")


def _remove_emojis(text: str) -> str:
    if HAS_EMOJI:
        return emoji_lib.replace_emoji(text, replace="")
    # Fallback regex for common emoji ranges
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"
        "\U0001F300-\U0001F5FF"
        "\U0001F680-\U0001F6FF"
        "\U0001F1E0-\U0001F1FF"
        "\U00002702-\U000027B0"
        "\U000024C2-\U0001F251"
        "]+",
        flags=re.UNICODE,
    )
    return emoji_pattern.sub("", text)


def _has_emoji(text: str) -> bool:
    return _remove_emojis(text) != text
