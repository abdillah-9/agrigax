"""
Phase 11 — Encoding Detection & Repair

Detect UTF-8, UTF-16, Latin-1, ASCII. Repair mojibake like MÃ¼ller → Müller.
"""

from __future__ import annotations

from pathlib import Path
from typing import Any, Optional

import pandas as pd

try:
    import chardet
    HAS_CHARDET = True
except ImportError:
    HAS_CHARDET = False


# Common mojibake markers (UTF-8 read as Latin-1/CP1252)
MOJIBAKE_MARKERS = ("Ã", "Â", "â€", "Ã¼", "Ã¶", "Ã¤", "Ã©", "Ã¨", "Ã±", "ï¿½")


def detect_file_encoding(path: str, sample_size: int = 100_000) -> dict[str, Any]:
    """Detect encoding of a text file."""
    raw = Path(path).read_bytes()[:sample_size]
    result = {
        "path": path,
        "size_sampled": len(raw),
        "is_ascii": all(b < 128 for b in raw),
    }

    if HAS_CHARDET:
        detected = chardet.detect(raw)
        enc = detected.get("encoding") or "utf-8"
        conf = float(detected.get("confidence") or 0)
        result["encoding"] = _normalize_encoding_name(enc)
        result["confidence"] = round(conf, 3)
        result["chardet_raw"] = detected
    else:
        # Manual sniff
        result["encoding"] = _sniff_encoding(raw)
        result["confidence"] = 0.6

    # Try BOM
    if raw.startswith(b"\xff\xfe") or raw.startswith(b"\xfe\xff"):
        result["encoding"] = "utf-16"
        result["confidence"] = 0.99
        result["bom"] = True
    elif raw.startswith(b"\xef\xbb\xbf"):
        result["encoding"] = "utf-8-sig"
        result["confidence"] = 0.99
        result["bom"] = True

    return result


def _normalize_encoding_name(enc: str) -> str:
    e = (enc or "utf-8").lower().replace("_", "-")
    aliases = {
        "ascii": "ascii",
        "us-ascii": "ascii",
        "utf-8": "utf-8",
        "utf8": "utf-8",
        "utf-16": "utf-16",
        "utf-16le": "utf-16",
        "utf-16be": "utf-16",
        "iso-8859-1": "latin-1",
        "iso8859-1": "latin-1",
        "latin1": "latin-1",
        "latin-1": "latin-1",
        "windows-1252": "cp1252",
        "cp1252": "cp1252",
    }
    return aliases.get(e, e)


def _sniff_encoding(raw: bytes) -> str:
    try:
        raw.decode("utf-8")
        return "utf-8"
    except UnicodeDecodeError:
        pass
    try:
        raw.decode("utf-16")
        return "utf-16"
    except UnicodeDecodeError:
        pass
    try:
        raw.decode("latin-1")
        return "latin-1"
    except UnicodeDecodeError:
        return "utf-8"


def analyze_dataframe_encoding(df: pd.DataFrame) -> dict[str, Any]:
    """Find mojibake / encoding issues already present in string columns."""
    issues = []
    for col in df.columns:
        if not (df[col].dtype == object or pd.api.types.is_string_dtype(df[col])):
            continue
        s = df[col].dropna().astype(str)
        if s.empty:
            continue
        mojibake_mask = s.map(_looks_like_mojibake)
        n = int(mojibake_mask.sum())
        if n == 0:
            continue
        examples = []
        for val in s[mojibake_mask].unique()[:10]:
            fixed = repair_mojibake(val)
            examples.append({"original": val, "repaired": fixed})
        issues.append({
            "column": col,
            "mojibake_count": n,
            "examples": examples,
        })
    return {
        "columns_with_mojibake": issues,
        "total_mojibake_values": sum(i["mojibake_count"] for i in issues),
    }


def _looks_like_mojibake(text: str) -> bool:
    return any(m in text for m in MOJIBAKE_MARKERS)


def repair_mojibake(text: str) -> str:
    """
    Attempt to repair UTF-8 text that was incorrectly decoded as Latin-1/CP1252.
    Example: 'MÃ¼ller' → 'Müller'
    """
    if not _looks_like_mojibake(text):
        return text

    for enc in ("latin-1", "cp1252"):
        try:
            repaired = text.encode(enc).decode("utf-8")
            # Prefer repair if it reduces mojibake markers
            if not _looks_like_mojibake(repaired) or repaired.count("Ã") < text.count("Ã"):
                return repaired
        except (UnicodeEncodeError, UnicodeDecodeError):
            continue
    return text


def repair_dataframe_encoding(df: pd.DataFrame) -> tuple[pd.DataFrame, list[dict]]:
    """Repair mojibake in all text columns. Returns (df, audit changes)."""
    out = df.copy()
    changes = []
    for col in out.columns:
        if not (out[col].dtype == object or pd.api.types.is_string_dtype(out[col])):
            continue
        s = out[col]
        mask = s.notna() & s.astype(str).map(_looks_like_mojibake)
        if not mask.any():
            continue
        samples = []
        for idx in out.index[mask][:5]:
            old = str(out.at[idx, col])
            new = repair_mojibake(old)
            samples.append({"original": old, "new": new})
        out.loc[mask, col] = out.loc[mask, col].astype(str).map(repair_mojibake)
        n = int(mask.sum())
        changes.append({
            "column": col,
            "rows_affected": n,
            "original": samples[0]["original"] if samples else "",
            "new": samples[0]["new"] if samples else "",
            "examples": samples,
            "reason": "Encoding repair (mojibake)",
            "rule": "Encoding Rule — UTF-8 restore",
        })
    return out, changes


def read_text_with_detected_encoding(path: str) -> tuple[str, dict]:
    """Read a text file using detected encoding."""
    info = detect_file_encoding(path)
    enc = info["encoding"]
    # ascii → utf-8 is fine
    if enc == "ascii":
        enc = "utf-8"
    text = Path(path).read_text(encoding=enc, errors="replace")
    return text, info
