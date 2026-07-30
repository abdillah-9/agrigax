"""
Phase 16 — Audit Log

Every applied change records:
  original value → new value, reason, timestamp, rule.
When value_changes[] are provided, each cell change gets its own entry.
"""

from __future__ import annotations

import json
from datetime import datetime
from pathlib import Path
from typing import Any, Optional


class AuditLog:
    """Append-only audit trail of all data quality operations."""

    def __init__(self, source: Optional[str] = None):
        self.source = source
        self.started_at = datetime.now().isoformat(timespec="seconds")
        self.entries: list[dict[str, Any]] = []
        self._seq = 0

    def record(
        self,
        *,
        action: str,
        reason: str,
        rule: str = "",
        column: Optional[str] = None,
        original: Any = None,
        new: Any = None,
        rows_affected: int = 0,
        row: Any = None,
        safety_class: Optional[str] = None,
        why_detected: Optional[str] = None,
        extra: Optional[dict] = None,
    ) -> dict:
        self._seq += 1
        now = datetime.now()
        entry = {
            "seq": self._seq,
            "time": now.strftime("%H:%M:%S"),
            "timestamp": now.isoformat(timespec="seconds"),
            "column": column,
            "row": row,
            "action": action,
            "original": _stringify(original),
            "new": _stringify(new),
            "reason": reason,
            "rule": rule,
            "rows_affected": rows_affected,
            "safety_class": safety_class,
            "why_detected": why_detected,
        }
        if extra:
            entry["extra"] = extra
        self.entries.append(entry)
        return entry

    def record_action(self, action: dict) -> list[dict]:
        """
        Record a cleaning action. If value_changes exist, write one audit
        entry per cell change (original → new, reason, timestamp, rule).
        """
        recorded = []
        value_changes = action.get("value_changes") or []
        reason = action.get("reason") or ""
        rule = action.get("rule") or ""
        why = action.get("why_detected")
        safety = action.get("safety_class")
        act = action.get("action", "change")

        if value_changes:
            for vc in value_changes:
                recorded.append(self.record(
                    action=act,
                    reason=reason,
                    rule=rule,
                    column=vc.get("column", action.get("column")),
                    original=vc.get("original"),
                    new=vc.get("new"),
                    row=vc.get("row"),
                    rows_affected=1,
                    safety_class=safety,
                    why_detected=why,
                    extra={"id": action.get("id")} if action.get("id") else None,
                ))
            # Also a summary line
            recorded.append(self.record(
                action=f"SUMMARY: {act}",
                reason=reason,
                rule=rule,
                column=action.get("column"),
                original=action.get("original"),
                new=action.get("new"),
                rows_affected=action.get("rows_affected", len(value_changes)),
                safety_class=safety,
                why_detected=why,
                extra={"id": action.get("id"), "detail_entries": len(value_changes)},
            ))
        else:
            recorded.append(self.record(
                action=act,
                reason=reason,
                rule=rule,
                column=action.get("column"),
                original=action.get("original"),
                new=action.get("new"),
                rows_affected=action.get("rows_affected", 0),
                safety_class=safety,
                why_detected=why,
                extra={"id": action.get("id")} if action.get("id") else None,
            ))
        return recorded

    def record_many(self, actions: list[dict]) -> None:
        for a in actions:
            self.record_action(a)

    def to_dict(self) -> dict[str, Any]:
        return {
            "source": self.source,
            "started_at": self.started_at,
            "finished_at": datetime.now().isoformat(timespec="seconds"),
            "entry_count": len(self.entries),
            "entries": self.entries,
        }

    def to_markdown(self) -> str:
        lines = [
            "# Audit Log",
            "",
            f"- Source: `{self.source or '—'}`",
            f"- Started: {self.started_at}",
            f"- Entries: {len(self.entries)}",
            "",
            "Every applied change records **original → new**, **reason**, **timestamp**, and **rule**.",
            "",
            "| # | Timestamp | Column | Row | Original | → | New | Reason | Rule | Class |",
            "|---|-----------|--------|-----|----------|---|-----|--------|------|-------|",
        ]
        for e in self.entries:
            lines.append(
                f"| {e['seq']} | {e.get('timestamp') or e['time']} | "
                f"{e.get('column') or '—'} | {e.get('row') if e.get('row') is not None else '—'} | "
                f"{_md_cell(e.get('original'))} | ↓ | {_md_cell(e.get('new'))} | "
                f"{_md_cell(e.get('reason'))} | {_md_cell(e.get('rule'))} | "
                f"{_md_cell(e.get('safety_class') or '—')} |"
            )
        if not self.entries:
            lines.append(
                "| — | — | — | — | — | — | — | No changes recorded | — | — |"
            )
        return "\n".join(lines) + "\n"

    def save_json(self, path: str) -> str:
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        Path(path).write_text(
            json.dumps(self.to_dict(), indent=2, default=str),
            encoding="utf-8",
        )
        return path

    def save_markdown(self, path: str) -> str:
        Path(path).parent.mkdir(parents=True, exist_ok=True)
        Path(path).write_text(self.to_markdown(), encoding="utf-8")
        return path

    def print_recent(self, n: int = 20) -> None:
        for e in self.entries[-n:]:
            row_bit = "" if e.get("row") is None else f" row={e.get('row')}"
            print(
                f"  [{e.get('timestamp') or e['time']}] "
                f"{e.get('column') or 'dataset'}{row_bit}: "
                f"{e.get('original')} → {e.get('new')} "
                f"| reason={e.get('reason')} | rule={e.get('rule')}"
            )


def _stringify(v: Any) -> str:
    if v is None:
        return "—"
    s = str(v)
    if len(s) > 80:
        return s[:77] + "..."
    return s


def _md_cell(v: Any) -> str:
    return _stringify(v).replace("|", "\\|").replace("\n", " ")
