"""
Phase 17 — Report Generator

Generate PDF, HTML, and Markdown reports with problems, fixes,
statistics, recommendations, quality score, and charts.
"""

from __future__ import annotations

import base64
import io
import json
from datetime import datetime
from pathlib import Path
from typing import Any, Optional


def generate_reports(
    result: dict[str, Any],
    output_dir: str,
    *,
    formats: Optional[list[str]] = None,
    title: str = "Data Quality Report",
) -> dict[str, str]:
    """
    Write reports to output_dir.
    formats: subset of markdown, html, pdf, json
    Returns map of format → path.
    """
    formats = formats or ["markdown", "html", "pdf", "json"]
    out = Path(output_dir)
    out.mkdir(parents=True, exist_ok=True)
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    paths: dict[str, str] = {}

    charts = _build_charts(result)

    if "json" in formats:
        path = out / f"dq_report_{stamp}.json"
        path.write_text(
            json.dumps(_json_safe(result), indent=2, default=str),
            encoding="utf-8",
        )
        paths["json"] = str(path)

    if "markdown" in formats:
        path = out / f"dq_report_{stamp}.md"
        path.write_text(render_markdown(result, title=title), encoding="utf-8")
        paths["markdown"] = str(path)

    if "html" in formats:
        path = out / f"dq_report_{stamp}.html"
        path.write_text(render_html(result, title=title, charts=charts), encoding="utf-8")
        paths["html"] = str(path)

    if "pdf" in formats:
        path = out / f"dq_report_{stamp}.pdf"
        try:
            render_pdf(result, str(path), title=title)
            paths["pdf"] = str(path)
        except Exception as e:
            # Fallback: note failure but don't crash pipeline
            paths["pdf_error"] = str(e)

    return paths


def render_markdown(result: dict[str, Any], title: str = "Data Quality Report") -> str:
    q = result.get("quality") or {}
    lines = [
        f"# {title}",
        "",
        f"Generated: {datetime.now().isoformat(timespec='seconds')}",
        f"Source: `{result.get('source', '—')}`",
        "",
        "## Quality Score",
        "",
        f"**{q.get('score_label', '?')}**  {q.get('stars_display', '')}  (Grade {q.get('grade', '?')})",
        "",
        f"- Problems: **{q.get('problems_total', 0)}**",
        f"- Critical: **{q.get('critical', 0)}**",
        f"- Warnings: **{q.get('warnings', 0)}**",
        f"- Suggestions: **{q.get('suggestions', 0)}**",
        "",
        q.get("summary_line", ""),
        "",
        "## Domain Intelligence",
        "",
    ]
    det = result.get("domain_detection") or {}
    if det.get("domain"):
        lines += [
            f"- **Domain:** {det.get('display_name') or det['domain']}",
            f"- **Confidence:** {float(det.get('confidence') or 0):.0%}",
            f"- **Knowledge Pack:** `{det['domain']}`",
            f"- **Message:** {det.get('message', '')}",
            "",
        ]
    else:
        lines += [f"- {det.get('message', 'Generic engine only')}", ""]
    org = result.get("organization") or {}
    if org.get("profile"):
        p = org["profile"]
        lines += [
            f"- **Organization profile:** {p.get('name')} "
            f"({p.get('match_type', 'saved')})",
            "",
        ]
    if org.get("learned"):
        lines += [
            f"- **Learned org profile:** {org['learned'].get('name')}",
            "",
        ]

    lines += [
        "## Dataset Overview",
        "",
    ]
    overview = (result.get("findings") or {}).get("profile", {}).get("overview") or {}
    if overview:
        lines += [
            f"- Rows: {overview.get('rows')}",
            f"- Columns: {overview.get('columns')}",
            f"- Duplicate rows: {overview.get('duplicate_rows')} ({overview.get('duplicate_row_pct')}%)",
            f"- Memory: {overview.get('memory_human')}",
            "",
        ]

    # Problems
    lines += ["## Problems", ""]
    problems = q.get("problems") or []
    if not problems:
        lines.append("_No problems detected._")
    else:
        lines += [
            "| Severity | Category | Column | Message |",
            "|----------|----------|--------|---------|",
        ]
        for p in problems:
            lines.append(
                f"| {p.get('severity')} | {p.get('category')} | "
                f"{p.get('column') or '—'} | {_esc(p.get('message'))} |"
            )
    lines.append("")

    # Recommendations
    lines += ["## Recommendations (by safety class)", ""]
    lines += [
        "Fixes are classified as **Safe**, **Needs Approval**, or **Never Automatic**.",
        "",
    ]
    recs = (result.get("recommendations") or {}).get("recommendations") or []
    if not recs:
        lines.append("_No recommendations._")
    else:
        lines += [
            "| Class | Column | Issue | Recommendation | Confidence | Why detected | Fix reason |",
            "|-------|--------|-------|----------------|------------|--------------|------------|",
        ]
        for r in recs:
            lines.append(
                f"| {r.get('safety_class')} | {r.get('column') or '—'} | "
                f"{_esc(r.get('issue'))} | {_esc(r.get('recommendation'))} | "
                f"{r.get('confidence')}% | {_esc(r.get('why_detected'))} | "
                f"{_esc(r.get('reason'))} |"
            )
    lines.append("")

    # Statistics
    lines += ["## Statistical Diagnostics", ""]
    stats = (result.get("findings") or {}).get("statistics", {}).get("columns") or {}
    if stats:
        lines += [
            "| Column | Mean | Median | Std | Skew | Normal? |",
            "|--------|------|--------|-----|------|---------|",
        ]
        for col, st in stats.items():
            norm = (st.get("normality") or {}).get("is_normal_alpha_05")
            lines.append(
                f"| {col} | {st.get('mean')} | {st.get('median')} | "
                f"{st.get('std')} | {st.get('skewness')} | {norm} |"
            )
    else:
        lines.append("_No numeric statistics._")
    lines.append("")

    # Mean vs median demo
    demo = (result.get("findings") or {}).get("statistics", {}).get("mean_vs_median_demo")
    if demo:
        lines += ["### Mean vs Median (outlier effect)", "", demo.get("description", ""), ""]
        for sc in demo.get("scenarios", []):
            lines.append(f"- **{sc['label']}**: mean={sc['mean']}, median={sc['median']} — {sc['message']}")
        lines.append("")

    # Audit
    audit = result.get("audit") or {}
    entries = audit.get("entries") or []
    lines += ["## Audit Log (fixes applied)", ""]
    lines += [
        "Each applied change records **original → new**, **reason**, **timestamp**, and **rule**.",
        "",
    ]
    if not entries:
        lines.append("_No changes applied._")
    else:
        lines += [
            "| Timestamp | Column | Row | Original | → | New | Reason | Rule | Class |",
            "|-----------|--------|-----|----------|---|-----|--------|------|-------|",
        ]
        for e in entries:
            if str(e.get("action", "")).startswith("SUMMARY:"):
                continue
            lines.append(
                f"| {e.get('timestamp') or e.get('time')} | {e.get('column') or '—'} | "
                f"{e.get('row') if e.get('row') is not None else '—'} | "
                f"{_esc(e.get('original'))} | ↓ | {_esc(e.get('new'))} | "
                f"{_esc(e.get('reason'))} | {_esc(e.get('rule'))} | "
                f"{_esc(e.get('safety_class') or '—')} |"
            )
    lines.append("")
    return "\n".join(lines)


def render_html(
    result: dict[str, Any],
    title: str = "Data Quality Report",
    charts: Optional[dict[str, str]] = None,
) -> str:
    q = result.get("quality") or {}
    charts = charts or {}
    md_body = render_markdown(result, title=title)

    # Simple HTML wrapper with embedded charts
    chart_html = ""
    for name, b64 in charts.items():
        chart_html += (
            f'<div class="chart"><h3>{name}</h3>'
            f'<img alt="{name}" src="data:image/png;base64,{b64}"/></div>\n'
        )

    # Convert markdown-ish to simple HTML (basic)
    body = _basic_md_to_html(md_body)

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>{title}</title>
<style>
  :root {{
    --bg: #f7f4ef;
    --ink: #1c1917;
    --accent: #0f766e;
    --critical: #b91c1c;
    --warning: #c2410c;
    --ok: #15803d;
  }}
  body {{
    font-family: "Source Serif 4", Georgia, "Times New Roman", serif;
    background: linear-gradient(165deg, #f7f4ef 0%, #e7eef0 50%, #dce8e6 100%);
    color: var(--ink);
    margin: 0; padding: 2rem;
    line-height: 1.55;
  }}
  main {{
    max-width: 960px; margin: 0 auto;
    background: rgba(255,255,255,0.72);
    padding: 2rem 2.5rem;
    border: 1px solid #d6d3d1;
  }}
  h1 {{ font-size: 2rem; color: var(--accent); margin-top: 0; }}
  h2 {{ border-bottom: 2px solid var(--accent); padding-bottom: 0.25rem; margin-top: 2rem; }}
  table {{ border-collapse: collapse; width: 100%; font-size: 0.92rem; margin: 1rem 0; }}
  th, td {{ border: 1px solid #d6d3d1; padding: 0.4rem 0.55rem; text-align: left; }}
  th {{ background: #ecfdf5; }}
  .score {{
    font-size: 1.6rem; font-weight: 700; color: var(--accent);
    margin: 1rem 0;
  }}
  .chart img {{ max-width: 100%; height: auto; }}
  code {{ background: #f5f5f4; padding: 0.1rem 0.3rem; }}
</style>
</head>
<body>
<main>
  <div class="score">Quality {q.get('score_label', '?')} {q.get('stars_display', '')}</div>
  {chart_html}
  {body}
</main>
</body>
</html>
"""


def render_pdf(result: dict[str, Any], path: str, title: str = "Data Quality Report") -> None:
    try:
        from reportlab.lib import colors
        from reportlab.lib.pagesizes import A4
        from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
        from reportlab.lib.units import inch
        from reportlab.platypus import (
            SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Preformatted
        )
    except ImportError as e:
        raise RuntimeError("reportlab is required for PDF export") from e

    q = result.get("quality") or {}
    doc = SimpleDocTemplate(path, pagesize=A4, title=title)
    styles = getSampleStyleSheet()
    styles.add(ParagraphStyle(name="DQTitle", parent=styles["Title"], textColor=colors.HexColor("#0f766e")))
    story = []

    story.append(Paragraph(title, styles["DQTitle"]))
    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph(
        f"Quality Score: <b>{q.get('score_label', '?')}</b> "
        f"(Grade {q.get('grade', '?')}) — "
        f"Problems {q.get('problems_total', 0)}, "
        f"Critical {q.get('critical', 0)}, "
        f"Warnings {q.get('warnings', 0)}, "
        f"Suggestions {q.get('suggestions', 0)}",
        styles["Normal"],
    ))
    story.append(Paragraph(f"Source: {result.get('source', '—')}", styles["Normal"]))
    story.append(Spacer(1, 0.25 * inch))

    story.append(Paragraph("Problems", styles["Heading2"]))
    problems = q.get("problems") or []
    if problems:
        data = [["Severity", "Category", "Column", "Message"]]
        for p in problems[:40]:
            data.append([
                str(p.get("severity", "")),
                str(p.get("category", "")),
                str(p.get("column") or "—"),
                str(p.get("message", ""))[:80],
            ])
        t = Table(data, colWidths=[70, 70, 80, 250])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#ecfdf5")),
            ("GRID", (0, 0), (-1, -1), 0.4, colors.grey),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
            ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ]))
        story.append(t)
    else:
        story.append(Paragraph("No problems detected.", styles["Normal"]))

    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph("Recommendations", styles["Heading2"]))
    recs = (result.get("recommendations") or {}).get("recommendations") or []
    if recs:
        data = [["Column", "Recommendation", "Conf.", "Reason"]]
        for r in recs[:30]:
            data.append([
                str(r.get("column") or "—"),
                str(r.get("recommendation", ""))[:50],
                f"{r.get('confidence', 0):.0f}%",
                str(r.get("reason", ""))[:60],
            ])
        t = Table(data, colWidths=[80, 150, 40, 200])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#ecfdf5")),
            ("GRID", (0, 0), (-1, -1), 0.4, colors.grey),
            ("FONTSIZE", (0, 0), (-1, -1), 8),
        ]))
        story.append(t)

    story.append(Spacer(1, 0.2 * inch))
    story.append(Paragraph("Audit Log", styles["Heading2"]))
    entries = (result.get("audit") or {}).get("entries") or []
    if entries:
        for e in entries[:40]:
            story.append(Paragraph(
                f"[{e.get('time')}] <b>{e.get('column') or 'dataset'}</b>: "
                f"{e.get('original')} → {e.get('new')} "
                f"({e.get('reason')}) <i>{e.get('rule')}</i>",
                styles["Normal"],
            ))
    else:
        story.append(Paragraph("No changes applied.", styles["Normal"]))

    doc.build(story)


def _build_charts(result: dict[str, Any]) -> dict[str, str]:
    """Return name → base64 PNG charts."""
    charts = {}
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
    except ImportError:
        return charts

    q = result.get("quality") or {}
    # Severity pie
    try:
        sizes = [q.get("critical", 0), q.get("warnings", 0), q.get("suggestions", 0)]
        if sum(sizes) > 0:
            fig, ax = plt.subplots(figsize=(4, 4))
            ax.pie(
                sizes,
                labels=["Critical", "Warnings", "Suggestions"],
                colors=["#b91c1c", "#c2410c", "#0f766e"],
                autopct="%1.0f%%",
            )
            ax.set_title("Problem Severity")
            charts["Problem Severity"] = _fig_to_b64(fig)
            plt.close(fig)
    except Exception:
        pass

    # Missing % bar
    try:
        missing_cols = (result.get("findings") or {}).get("missing", {}).get("columns") or []
        names = [c["name"] for c in missing_cols if c.get("missing_pct", 0) > 0][:12]
        vals = [c["missing_pct"] for c in missing_cols if c.get("missing_pct", 0) > 0][:12]
        if names:
            fig, ax = plt.subplots(figsize=(6, 3.5))
            ax.barh(names[::-1], vals[::-1], color="#0f766e")
            ax.set_xlabel("Missing %")
            ax.set_title("Missing Values by Column")
            fig.tight_layout()
            charts["Missing Values"] = _fig_to_b64(fig)
            plt.close(fig)
    except Exception:
        pass

    # Quality score gauge-like bar
    try:
        score = float(q.get("score", 0))
        fig, ax = plt.subplots(figsize=(5, 1.2))
        ax.barh([0], [score], color="#0f766e", height=0.5)
        ax.barh([0], [100], color="#e7e5e4", height=0.5, alpha=0.4)
        ax.set_xlim(0, 100)
        ax.set_yticks([])
        ax.set_xlabel("Quality Score %")
        ax.set_title(f"Dataset Quality {score:.0f}%")
        fig.tight_layout()
        charts["Quality Score"] = _fig_to_b64(fig)
        plt.close(fig)
    except Exception:
        pass

    return charts


def _fig_to_b64(fig) -> str:
    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=120, bbox_inches="tight")
    buf.seek(0)
    return base64.b64encode(buf.read()).decode("ascii")


def _esc(v: Any) -> str:
    return str(v or "").replace("|", "\\|").replace("\n", " ")


def _json_safe(obj: Any) -> Any:
    if isinstance(obj, dict):
        return {str(k): _json_safe(v) for k, v in obj.items()}
    if isinstance(obj, list):
        return [_json_safe(v) for v in obj]
    if hasattr(obj, "item"):
        try:
            return obj.item()
        except Exception:
            return str(obj)
    return obj


def _basic_md_to_html(md: str) -> str:
    """Very small markdown subset → HTML for report body."""
    import html as html_mod
    import re

    lines = md.splitlines()
    out = []
    in_table = False
    for line in lines:
        if line.startswith("# "):
            if in_table:
                out.append("</table>")
                in_table = False
            out.append(f"<h1>{html_mod.escape(line[2:])}</h1>")
        elif line.startswith("## "):
            if in_table:
                out.append("</table>")
                in_table = False
            out.append(f"<h2>{html_mod.escape(line[3:])}</h2>")
        elif line.startswith("### "):
            if in_table:
                out.append("</table>")
                in_table = False
            out.append(f"<h3>{html_mod.escape(line[4:])}</h3>")
        elif line.startswith("|") and "|" in line[1:]:
            cells = [c.strip() for c in line.strip("|").split("|")]
            if all(set(c) <= set("-: ") for c in cells):
                continue  # separator
            tag = "th" if not in_table else "td"
            if not in_table:
                out.append("<table>")
                in_table = True
                tag = "th"
            row = "".join(f"<{tag}>{html_mod.escape(c)}</{tag}>" for c in cells)
            out.append(f"<tr>{row}</tr>")
        elif line.startswith("- "):
            if in_table:
                out.append("</table>")
                in_table = False
            text = line[2:]
            text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", html_mod.escape(text))
            # undo escape inside b — simpler approach:
            text = line[2:]
            text = html_mod.escape(text)
            text = text.replace("&ast;&ast;", "")  # noop
            text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", line[2:])
            out.append(f"<li>{text}</li>")
        elif line.strip() == "":
            if in_table:
                out.append("</table>")
                in_table = False
            out.append("<br/>")
        else:
            if in_table:
                out.append("</table>")
                in_table = False
            text = html_mod.escape(line)
            text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
            text = re.sub(r"\*\*(.+?)\*\*", r"<b>\1</b>", line)
            out.append(f"<p>{text}</p>")
    if in_table:
        out.append("</table>")
    return "\n".join(out)
