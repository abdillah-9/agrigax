"""
Phase 1 — Dataset Loader

Supports: CSV, Excel, TSV, JSON, SPSS (.sav), Stata (.dta), SQLite, Postgres.
Everything downstream receives a standardized pandas DataFrame.
"""

from __future__ import annotations

import os
import sqlite3
from pathlib import Path
from typing import Any, Optional
from urllib.parse import urlparse

import pandas as pd


SUPPORTED_EXTENSIONS = {
    ".csv": "csv",
    ".tsv": "tsv",
    ".txt": "csv",
    ".xlsx": "excel",
    ".xls": "excel",
    ".json": "json",
    ".sav": "spss",
    ".dta": "stata",
    ".db": "sqlite",
    ".sqlite": "sqlite",
    ".sqlite3": "sqlite",
}


class LoadError(Exception):
    """Raised when a dataset cannot be loaded."""


def detect_source_type(source: str) -> str:
    """Infer loader type from path or connection string."""
    lower = source.lower().strip()
    if lower.startswith("postgresql://") or lower.startswith("postgres://"):
        return "postgres"
    if lower.startswith("sqlite://"):
        return "sqlite"

    path = Path(source.split("?")[0])
    ext = path.suffix.lower()
    if ext in SUPPORTED_EXTENSIONS:
        return SUPPORTED_EXTENSIONS[ext]

    raise LoadError(
        f"Unsupported source: {source!r}. "
        f"Supported: {', '.join(sorted(SUPPORTED_EXTENSIONS))} "
        "or postgres/sqlite connection strings."
    )


def load_dataset(
    source: str,
    *,
    sheet_name: Optional[str | int] = 0,
    table: Optional[str] = None,
    query: Optional[str] = None,
    encoding: Optional[str] = None,
    sep: Optional[str] = None,
    **kwargs: Any,
) -> pd.DataFrame:
    """
    Load any supported source into a single standardized DataFrame.

    Parameters
    ----------
    source : file path or DB connection URL
    sheet_name : Excel sheet (name or index)
    table : SQLite/Postgres table name
    query : SQL query (overrides table)
    encoding : text encoding override (CSV/TSV/JSON)
    sep : delimiter override
    """
    source_type = detect_source_type(source)

    loaders = {
        "csv": _load_csv,
        "tsv": _load_tsv,
        "excel": _load_excel,
        "json": _load_json,
        "spss": _load_spss,
        "stata": _load_stata,
        "sqlite": _load_sqlite,
        "postgres": _load_postgres,
    }

    df = loaders[source_type](
        source,
        sheet_name=sheet_name,
        table=table,
        query=query,
        encoding=encoding,
        sep=sep,
        **kwargs,
    )

    if not isinstance(df, pd.DataFrame):
        raise LoadError("Loader did not return a DataFrame")

    # Standardize: reset index, strip column names
    df = df.copy()
    df.columns = [str(c).strip() for c in df.columns]
    df = df.reset_index(drop=True)
    return df


def _load_csv(source: str, encoding=None, sep=None, **kwargs) -> pd.DataFrame:
    enc = encoding or _detect_file_encoding(source)
    delimiter = sep or ","
    return pd.read_csv(source, encoding=enc, sep=delimiter, **{
        k: v for k, v in kwargs.items()
        if k not in ("sheet_name", "table", "query")
    })


def _load_tsv(source: str, encoding=None, sep=None, **kwargs) -> pd.DataFrame:
    enc = encoding or _detect_file_encoding(source)
    delimiter = sep or "\t"
    return pd.read_csv(source, encoding=enc, sep=delimiter, **{
        k: v for k, v in kwargs.items()
        if k not in ("sheet_name", "table", "query")
    })


def _load_excel(source: str, sheet_name=0, **kwargs) -> pd.DataFrame:
    return pd.read_excel(source, sheet_name=sheet_name)


def _load_json(source: str, encoding=None, **kwargs) -> pd.DataFrame:
    enc = encoding or _detect_file_encoding(source)
    try:
        return pd.read_json(source, encoding=enc)
    except ValueError:
        # Nested / lines-delimited JSON
        return pd.read_json(source, lines=True, encoding=enc)


def _load_spss(source: str, **kwargs) -> pd.DataFrame:
    try:
        import pyreadstat
    except ImportError as e:
        raise LoadError("pyreadstat is required for SPSS (.sav) files") from e
    df, _meta = pyreadstat.read_sav(source)
    return df


def _load_stata(source: str, **kwargs) -> pd.DataFrame:
    try:
        return pd.read_stata(source)
    except Exception:
        try:
            import pyreadstat
            df, _meta = pyreadstat.read_dta(source)
            return df
        except ImportError as e:
            raise LoadError("Could not load Stata (.dta) file") from e


def _load_sqlite(
    source: str,
    table: Optional[str] = None,
    query: Optional[str] = None,
    **kwargs,
) -> pd.DataFrame:
    path = source
    if source.startswith("sqlite:///"):
        path = source.replace("sqlite:///", "", 1)
    elif source.startswith("sqlite://"):
        path = source.replace("sqlite://", "", 1)

    if not os.path.exists(path) and not source.startswith("sqlite:"):
        # might be bare .db path
        path = source

    conn = sqlite3.connect(path)
    try:
        if query:
            return pd.read_sql_query(query, conn)
        if table:
            return pd.read_sql_query(f'SELECT * FROM "{table}"', conn)
        # Auto-pick first user table
        tables = pd.read_sql_query(
            "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'",
            conn,
        )
        if tables.empty:
            raise LoadError("SQLite database has no tables")
        first = tables.iloc[0]["name"]
        return pd.read_sql_query(f'SELECT * FROM "{first}"', conn)
    finally:
        conn.close()


def _load_postgres(
    source: str,
    table: Optional[str] = None,
    query: Optional[str] = None,
    **kwargs,
) -> pd.DataFrame:
    try:
        from sqlalchemy import create_engine
    except ImportError as e:
        raise LoadError("sqlalchemy is required for Postgres") from e

    engine = create_engine(source)
    try:
        if query:
            return pd.read_sql_query(query, engine)
        if table:
            return pd.read_sql_query(f'SELECT * FROM "{table}"', engine)
        raise LoadError("Postgres load requires --table or --query")
    finally:
        engine.dispose()


def _detect_file_encoding(path: str, sample_size: int = 50000) -> str:
    """Best-effort encoding detection via chardet."""
    try:
        import chardet
        with open(path, "rb") as f:
            raw = f.read(sample_size)
        result = chardet.detect(raw)
        enc = result.get("encoding") or "utf-8"
        # Normalize common aliases
        if enc.lower() in ("ascii", "us-ascii"):
            return "utf-8"
        return enc
    except Exception:
        return "utf-8"


def describe_source(source: str) -> dict:
    """Return metadata about a source without fully loading large files."""
    source_type = detect_source_type(source)
    info = {"source": source, "type": source_type}
    if source_type in ("csv", "tsv", "json", "excel", "spss", "stata", "sqlite"):
        path = Path(source.replace("sqlite:///", "").replace("sqlite://", ""))
        if path.exists():
            info["size_bytes"] = path.stat().st_size
            info["exists"] = True
        else:
            info["exists"] = False
    return info
