"""
Phase 3 — Automatic Data Type Detection

Infer: Integer, Boolean, Ordinal, Nominal, Continuous, Date, Time,
Currency, Phone, Email, ID, Latitude, Longitude — even when stored as strings.
"""

from __future__ import annotations

import re
from typing import Any, Optional

import numpy as np
import pandas as pd


EMAIL_RE = re.compile(r"^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$")
PHONE_RE = re.compile(
    r"^[\+]?[(]?[0-9]{1,4}[)]?[-\s\./0-9]{6,18}$"
)
CURRENCY_RE = re.compile(
    r"^[$€£¥₹]?\s*-?\d{1,3}([,\s]\d{3})*(\.\d+)?\s*[$€£¥₹]?$"
)
DATE_HINTS = re.compile(
    r"(\d{1,4}[-/\.]\d{1,2}[-/\.]\d{1,4})|"
    r"(\d{1,2}\s+[A-Za-z]{3,9}\s+\d{2,4})|"
    r"([A-Za-z]{3,9}\s+\d{1,2},?\s+\d{2,4})"
)
TIME_RE = re.compile(r"^([01]?\d|2[0-3]):[0-5]\d(:[0-5]\d)?(\s?[AaPp][Mm])?$")
UUID_RE = re.compile(
    r"^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$"
)

BOOL_TRUE = {"true", "t", "yes", "y", "1", "male"}  # male alone not bool
BOOL_VALUES = {
    "true", "false", "t", "f", "yes", "no", "y", "n",
    "1", "0", "male", "female",  # only if exactly these pairs — handled separately
}
STRICT_BOOL = {
    frozenset({"true", "false"}),
    frozenset({"t", "f"}),
    frozenset({"yes", "no"}),
    frozenset({"y", "n"}),
    frozenset({"1", "0"}),
    frozenset({"true", "false", "1", "0"}),
    frozenset({"yes", "no", "y", "n"}),
}

ORDINAL_HINTS = {
    "low", "medium", "high", "very low", "very high",
    "poor", "fair", "good", "excellent",
    "strongly disagree", "disagree", "neutral", "agree", "strongly agree",
    "never", "rarely", "sometimes", "often", "always",
    "primary", "secondary", "tertiary",
}


def detect_types(df: pd.DataFrame) -> dict[str, Any]:
    """Detect semantic types for every column."""
    results = {}
    for col in df.columns:
        results[col] = detect_column_type(df[col], column_name=col)
    return {
        "columns": results,
        "summary": _summarize(results),
    }


def detect_column_type(s: pd.Series, column_name: str = "") -> dict[str, Any]:
    """Infer storage dtype vs semantic type for one column."""
    name_lower = column_name.lower().strip()
    non_null = s.dropna()
    if non_null.empty:
        return {
            "storage_dtype": str(s.dtype),
            "semantic_type": "Empty",
            "suggested_dtype": None,
            "confidence": 0.0,
            "needs_cast": False,
            "details": {},
        }

    sample = non_null.head(500)
    as_str = sample.astype(str).str.strip()

    # Name-based hints first (high confidence when values agree)
    name_hint = _name_based_hint(name_lower)

    checks = [
        ("Boolean", _is_boolean),
        ("Email", _is_email),
        ("Phone Number", _is_phone),
        ("ID", _is_id),
        ("UUID", _is_uuid),
        ("Latitude", lambda as_str, sample, name: _is_lat_lon(as_str, sample, "lat", name)),
        ("Longitude", lambda as_str, sample, name: _is_lat_lon(as_str, sample, "lon", name)),
        ("Currency", _is_currency),
        ("Date", _is_date),
        ("Time", _is_time),
        ("Integer", _is_integer),
        ("Continuous", _is_continuous),
        ("Ordinal", _is_ordinal),
        ("Nominal", _is_nominal),
    ]

    best_type = "Nominal"
    best_conf = 0.0
    best_details: dict = {}

    for type_name, checker in checks:
        conf, details = checker(as_str, sample, name_lower)
        # Boost if name hints match
        if name_hint and name_hint == type_name:
            conf = min(1.0, conf + 0.15)
        if conf > best_conf:
            best_conf = conf
            best_type = type_name
            best_details = details

    if name_hint and best_conf < 0.5:
        best_type = name_hint
        best_conf = max(best_conf, 0.55)

    suggested = _suggested_pandas_dtype(best_type)
    storage = str(s.dtype)
    needs_cast = _needs_cast(storage, best_type, sample)

    return {
        "storage_dtype": storage,
        "semantic_type": best_type,
        "suggested_dtype": suggested,
        "confidence": round(best_conf, 3),
        "needs_cast": needs_cast,
        "details": best_details,
        "name_hint": name_hint,
    }


def _name_based_hint(name: str) -> Optional[str]:
    mapping = [
        (("email", "e-mail", "mail"), "Email"),
        (("phone", "mobile", "tel", "cellphone"), "Phone Number"),
        (("lat", "latitude"), "Latitude"),
        (("lon", "lng", "long", "longitude"), "Longitude"),
        (("date", "dob", "birthday", "created_at", "updated_at"), "Date"),
        (("time", "hour", "timestamp"), "Time"),
        (("price", "cost", "salary", "income", "amount", "wage", "fee"), "Currency"),
        (("id", "uuid", "guid", "key", "pk"), "ID"),
        (("age", "count", "qty", "quantity", "year", "score", "rating"), "Integer"),
        (("gender", "sex", "country", "city", "status", "category"), "Nominal"),
        (("agree", "likert", "satisfaction", "education_level"), "Ordinal"),
    ]
    for keys, typ in mapping:
        for k in keys:
            if name == k or name.endswith("_" + k) or name.startswith(k + "_") or k in name.split("_"):
                return typ
    return None


def _ratio(mask: pd.Series) -> float:
    return float(mask.mean()) if len(mask) else 0.0


def _is_boolean(as_str, sample, name) -> tuple[float, dict]:
    vals = set(as_str.str.lower().unique())
    vals.discard("")
    for allowed in STRICT_BOOL:
        if vals and vals <= allowed:
            return 0.95, {"values": sorted(vals)}
    if vals <= {"true", "false", "yes", "no", "y", "n", "t", "f", "1", "0", "male", "female"}:
        if len(vals) <= 2 and vals <= {"male", "female"}:
            return 0.0, {}  # gender, not boolean
        if len(vals) == 2:
            return 0.7, {"values": sorted(vals)}
    return 0.0, {}


def _is_email(as_str, sample, name) -> tuple[float, dict]:
    r = _ratio(as_str.apply(lambda x: bool(EMAIL_RE.match(x))))
    return (r if r > 0.7 else 0.0), {"match_ratio": round(r, 3)}


def _is_phone(as_str, sample, name) -> tuple[float, dict]:
    # Digits-heavy short strings
    def ok(x):
        digits = sum(c.isdigit() for c in x)
        return digits >= 7 and bool(PHONE_RE.match(x.replace(" ", "")))
    r = _ratio(as_str.apply(ok))
    return (r if r > 0.7 else 0.0), {"match_ratio": round(r, 3)}


def _is_uuid(as_str, sample, name) -> tuple[float, dict]:
    r = _ratio(as_str.apply(lambda x: bool(UUID_RE.match(x))))
    return (r if r > 0.8 else 0.0), {"match_ratio": round(r, 3)}


def _is_id(as_str, sample, name) -> tuple[float, dict]:
    # High uniqueness + name hint or uuid-like / sequential
    unique_ratio = as_str.nunique() / max(len(as_str), 1)
    looks_id = unique_ratio > 0.95
    name_id = any(k in name for k in ("id", "uuid", "key", "code", "pk"))
    if looks_id and (name_id or unique_ratio > 0.99):
        conf = 0.85 if name_id else 0.65
        return conf, {"unique_ratio": round(unique_ratio, 3)}
    return 0.0, {}


def _is_lat_lon(as_str, sample, kind: str, name: str = "") -> tuple[float, dict]:
    nums = pd.to_numeric(as_str.str.replace(",", "", regex=False), errors="coerce")
    valid = nums.notna()
    if valid.mean() < 0.8:
        return 0.0, {}
    vals = nums.dropna()
    hints = ("lat", "latitude") if kind == "lat" else ("lon", "lng", "long", "longitude")
    name_boost = 0.15 if any(k in name for k in hints) else 0.0
    if kind == "lat" and vals.between(-90, 90).all():
        return min(0.95, 0.75 + name_boost), {"min": float(vals.min()), "max": float(vals.max())}
    if kind == "lon" and vals.between(-180, 180).all():
        return min(0.95, 0.75 + name_boost), {"min": float(vals.min()), "max": float(vals.max())}
    return 0.0, {}


def _is_currency(as_str, sample, name) -> tuple[float, dict]:
    r = _ratio(as_str.apply(lambda x: bool(CURRENCY_RE.match(x.replace(" ", "")))))
    has_symbol = as_str.str.contains(r"[$€£¥₹]", regex=True).mean()
    if r > 0.7 or (has_symbol > 0.5 and pd.to_numeric(
        as_str.str.replace(r"[^\d.\-]", "", regex=True), errors="coerce"
    ).notna().mean() > 0.8):
        return max(r, 0.8), {"symbol_ratio": round(float(has_symbol), 3)}
    return 0.0, {}


def _is_date(as_str, sample, name) -> tuple[float, dict]:
    if pd.api.types.is_datetime64_any_dtype(sample):
        return 0.99, {}
    parsed = pd.to_datetime(as_str, errors="coerce", format="mixed")
    r = float(parsed.notna().mean())
    hint = _ratio(as_str.apply(lambda x: bool(DATE_HINTS.search(x))))
    conf = r if r > 0.7 else (hint if hint > 0.7 else 0.0)
    return conf, {"parse_ratio": round(r, 3)}


def _is_time(as_str, sample, name) -> tuple[float, dict]:
    r = _ratio(as_str.apply(lambda x: bool(TIME_RE.match(x))))
    return (r if r > 0.8 else 0.0), {"match_ratio": round(r, 3)}


def _is_integer(as_str, sample, name) -> tuple[float, dict]:
    nums = pd.to_numeric(as_str.str.replace(",", "", regex=False), errors="coerce")
    valid = nums.notna()
    if valid.mean() < 0.85:
        return 0.0, {}
    vals = nums.dropna()
    if len(vals) and (vals % 1 == 0).all():
        # Prefer integer over continuous
        return 0.9, {"min": float(vals.min()), "max": float(vals.max())}
    return 0.0, {}


def _is_continuous(as_str, sample, name) -> tuple[float, dict]:
    nums = pd.to_numeric(as_str.str.replace(",", "", regex=False), errors="coerce")
    if nums.notna().mean() < 0.85:
        return 0.0, {}
    vals = nums.dropna()
    if len(vals) < 2:
        return 0.5, {}
    # Has decimals or many unique values
    has_float = not (vals % 1 == 0).all()
    unique_ratio = vals.nunique() / len(vals)
    if has_float or unique_ratio > 0.3:
        return 0.85, {"unique_ratio": round(unique_ratio, 3)}
    return 0.4, {}


def _is_ordinal(as_str, sample, name) -> tuple[float, dict]:
    vals = set(as_str.str.lower().unique())
    if not vals or len(vals) > 15:
        return 0.0, {}
    overlap = vals & ORDINAL_HINTS
    if len(overlap) >= 2 or (len(vals) <= 7 and overlap):
        return 0.8, {"values": sorted(vals)}
    # Likert 1-5
    nums = pd.to_numeric(as_str, errors="coerce").dropna()
    if len(nums) and set(nums.astype(int)) <= {1, 2, 3, 4, 5, 6, 7} and nums.nunique() <= 7:
        if "rating" in name or "score" in name or "likert" in name or nums.nunique() <= 5:
            return 0.7, {"scale": sorted(nums.unique().tolist())}
    return 0.0, {}


def _is_nominal(as_str, sample, name) -> tuple[float, dict]:
    # Fallback categorical
    nunique = as_str.nunique()
    if nunique <= max(50, len(as_str) * 0.5):
        return 0.5, {"nunique": int(nunique)}
    return 0.3, {"nunique": int(nunique)}


def _suggested_pandas_dtype(semantic: str) -> Optional[str]:
    return {
        "Boolean": "bool",
        "Integer": "Int64",
        "Continuous": "float64",
        "Currency": "float64",
        "Latitude": "float64",
        "Longitude": "float64",
        "Date": "datetime64[ns]",
        "Time": "string",
        "Email": "string",
        "Phone Number": "string",
        "ID": "string",
        "UUID": "string",
        "Ordinal": "category",
        "Nominal": "category",
        "Empty": None,
    }.get(semantic, "string")


def _needs_cast(storage: str, semantic: str, sample: pd.Series) -> bool:
    if semantic in ("Integer",) and not pd.api.types.is_integer_dtype(sample):
        return True
    if semantic in ("Continuous", "Currency", "Latitude", "Longitude") and not pd.api.types.is_float_dtype(sample):
        if pd.api.types.is_integer_dtype(sample) and semantic == "Continuous":
            return False
        return not pd.api.types.is_numeric_dtype(sample)
    if semantic == "Boolean" and not pd.api.types.is_bool_dtype(sample):
        return True
    if semantic == "Date" and not pd.api.types.is_datetime64_any_dtype(sample):
        return True
    return False


def _summarize(results: dict) -> dict:
    counts: dict[str, int] = {}
    needs_cast = []
    for col, info in results.items():
        t = info["semantic_type"]
        counts[t] = counts.get(t, 0) + 1
        if info["needs_cast"]:
            needs_cast.append(col)
    return {"type_counts": counts, "columns_needing_cast": needs_cast}


def apply_type_casts(df: pd.DataFrame, type_report: dict) -> pd.DataFrame:
    """Optionally cast columns to suggested dtypes. Returns a copy."""
    out = df.copy()
    for col, info in type_report.get("columns", {}).items():
        if col not in out.columns or not info.get("needs_cast"):
            continue
        semantic = info["semantic_type"]
        try:
            if semantic == "Integer":
                out[col] = pd.to_numeric(out[col], errors="coerce").astype("Int64")
            elif semantic in ("Continuous", "Currency", "Latitude", "Longitude"):
                cleaned = out[col].astype(str).str.replace(r"[^\d.\-]", "", regex=True)
                out[col] = pd.to_numeric(cleaned, errors="coerce")
            elif semantic == "Boolean":
                out[col] = out[col].astype(str).str.lower().str.strip().map({
                    "true": True, "t": True, "yes": True, "y": True, "1": True,
                    "false": False, "f": False, "no": False, "n": False, "0": False,
                })
            elif semantic == "Date":
                out[col] = pd.to_datetime(out[col], errors="coerce", format="mixed")
            elif semantic in ("Ordinal", "Nominal"):
                out[col] = out[col].astype("category")
        except Exception:
            continue
    return out
