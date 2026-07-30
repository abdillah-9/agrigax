#!/usr/bin/env python3
"""
Data Quality App — CLI (Brain 1 generic + Brain 2 domain intelligence).

Usage:
  python main.py analyze hospital.csv                  # auto-detect domain
  python main.py analyze hospital.csv --domain healthcare
  python main.py analyze moh.csv --learn-org "Ministry of Health"
  python main.py domains
  python main.py orgs
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

import click
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich import box
from rich.text import Text

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from dq.pipeline import run_pipeline, apply_cleaning
from dq.loader import load_dataset, describe_source
from dq.profiler import profile_dataset, profile_summary_table
from dq.recommendations import SAFE, NEEDS_APPROVAL, NEVER_AUTOMATIC
from dq import __version__, __app_name__

console = Console()


@click.group()
@click.version_option(__version__, prog_name=__app_name__)
def cli():
    """Data Quality App — explain issues, classify fixes, choose, audit."""
    pass


@cli.command("analyze")
@click.argument("source", type=str)
@click.option("--output", "-o", default="output", show_default=True, help="Output directory")
@click.option("--rules", default=None, help="Path to base rules YAML (merged with knowledge pack)")
@click.option(
    "--clean",
    "clean_mode",
    type=click.Choice(["none", "ask", "safe", "all"], case_sensitive=False),
    default="none",
    show_default=True,
    help=(
        "none=analyze only | ask=you choose fixes | "
        "safe=apply all Safe | all=Safe+Needs Approval (never Never Automatic)"
    ),
)
@click.option(
    "--domain",
    default=None,
    help="Force a knowledge pack (healthcare, education, survey, …). Default: auto-detect",
)
@click.option(
    "--org",
    default=None,
    help="Match a saved organization profile by name (e.g. 'Ministry of Health')",
)
@click.option(
    "--learn-org",
    default=None,
    help="Save/update an organization profile from this file's template",
)
@click.option("--no-domain", is_flag=True, help="Skip domain detection (generic engine only)")
@click.option("--table", default=None, help="SQLite/Postgres table name")
@click.option("--query", default=None, help="SQL query")
@click.option("--sheet", default="0", help="Excel sheet name or index")
@click.option(
    "--format",
    "formats",
    multiple=True,
    type=click.Choice(["markdown", "html", "pdf", "json"], case_sensitive=False),
    help="Report formats (default: all)",
)
@click.option("--no-save-cleaned", is_flag=True, help="Do not write cleaned_dataset.csv")
def analyze_cmd(
    source, output, rules, clean_mode, domain, org, learn_org, no_domain,
    table, query, sheet, formats, no_save_cleaned,
):
    """Analyze SOURCE — auto-detects domain knowledge packs when possible."""
    sheet_name: str | int = int(sheet) if str(sheet).isdigit() else sheet
    fmt_list = list(formats) if formats else None
    clean_mode = clean_mode.lower()

    console.print(Panel.fit(
        f"[bold cyan]{__app_name__}[/] v{__version__}\n"
        f"Analyzing: [white]{source}[/]",
        border_style="cyan",
    ))

    with console.status("[bold green]Detecting domain + issues..."):
        result = run_pipeline(
            source,
            output_dir=output,
            rules_path=rules,
            clean_mode="none",
            report_formats=fmt_list,
            table=table,
            query=query,
            sheet_name=sheet_name,
            save_cleaned=False,
            defer_clean_choice=True,
            domain=domain,
            org=org,
            learn_org=learn_org,
            no_domain=no_domain,
        )

    _print_domain(result)
    _print_quality(result.get("quality") or {})
    _print_profile_table(result["findings"].get("profile"))
    _print_recommendations_classified(result.get("recommendations") or {})

    if clean_mode != "none":
        console.print()
        console.print(Panel.fit(
            f"[bold]Cleaning mode:[/] {clean_mode}\n"
            f"Safe = auto-ok · Needs Approval = must choose · "
            f"Never Automatic = report only",
            border_style="yellow",
        ))
        result.setdefault("_meta", {})["save_cleaned"] = not no_save_cleaned
        result = apply_cleaning(
            result,
            clean_mode=clean_mode,
            interactive=(clean_mode == "ask"),
        )
        if result.get("quality_after"):
            console.print("\n[bold]After cleaning:[/]")
            _print_quality(result["quality_after"])
        _print_audit_summary(result.get("audit") or {})
    else:
        console.print(
            "\n[dim]Tip: --clean ask | --clean safe | --clean all · "
            "--domain healthcare · --learn-org 'Ministry of Health'[/]"
        )

    console.print("\n[bold]Reports written:[/]")
    for fmt, path in (result.get("report_paths") or {}).items():
        console.print(f"  • {fmt}: {path}")

    if result.get("cleaned_path"):
        console.print(f"\n[bold]Cleaned data:[/] {result['cleaned_path']}")
    console.print(f"[bold]Audit log:[/] {Path(output) / 'audit_log.md'}")
    learned = (result.get("organization") or {}).get("learned")
    if learned:
        console.print(
            f"[bold]Org profile saved:[/] {learned.get('name')} → {learned.get('path')} "
            f"(seen {learned.get('seen_count')}×)"
        )


@cli.command("profile")
@click.argument("source", type=str)
@click.option("--table", default=None)
@click.option("--sheet", default="0")
def profile_cmd(source, table, sheet):
    """Phase 2 only — profile a dataset."""
    sheet_name: str | int = int(sheet) if str(sheet).isdigit() else sheet
    df = load_dataset(source, table=table, sheet_name=sheet_name)
    profile = profile_dataset(df)
    ov = profile["overview"]
    console.print(Panel.fit(
        f"Rows: {ov['rows']}  Cols: {ov['columns']}  "
        f"Dup rows: {ov['duplicate_rows']} ({ov['duplicate_row_pct']}%)  "
        f"Memory: {ov['memory_human']}",
        title="Overview",
    ))
    _print_profile_table(profile)


@cli.command("score")
@click.argument("source", type=str)
@click.option("--rules", default=None)
@click.option("--table", default=None)
@click.option("--sheet", default="0")
def score_cmd(source, rules, table, sheet):
    """Quick quality score."""
    sheet_name: str | int = int(sheet) if str(sheet).isdigit() else sheet
    result = run_pipeline(
        source,
        output_dir="output",
        rules_path=rules,
        clean_mode="none",
        report_formats=["json"],
        table=table,
        sheet_name=sheet_name,
        save_cleaned=False,
        defer_clean_choice=True,
    )
    _print_quality(result.get("quality") or {})
    _print_recommendations_classified(result.get("recommendations") or {})


@cli.command("info")
@click.argument("source", type=str)
def info_cmd(source):
    """Show detected source type / file info."""
    info = describe_source(source)
    console.print_json(json.dumps(info, default=str))


@cli.command("domains")
def domains_cmd():
    """List installed Knowledge Packs."""
    from dq.domain.packs import list_packs, load_pack_file
    packs = list_packs()
    if not packs:
        console.print("[yellow]No knowledge packs found in knowledge/[/]")
        return
    table = Table(title="Knowledge Packs", box=box.SIMPLE_HEAVY)
    table.add_column("Domain")
    table.add_column("Display name")
    table.add_column("Description")
    for d in packs:
        meta = load_pack_file(d, "pack.yaml") or {}
        table.add_row(
            d,
            str(meta.get("display_name") or d),
            str(meta.get("description") or "")[:60],
        )
    console.print(table)
    console.print("\n[dim]Auto-used by: python main.py analyze file.csv[/]")
    console.print("[dim]Force with:  python main.py analyze file.csv --domain healthcare[/]")


@cli.command("orgs")
def orgs_cmd():
    """List learned organization profiles."""
    from dq.domain.organization import list_organization_profiles
    profiles = list_organization_profiles()
    if not profiles:
        console.print(
            "[yellow]No organization profiles yet.[/]\n"
            "[dim]Create one: python main.py analyze file.csv --learn-org 'Ministry of Health'[/]"
        )
        return
    table = Table(title="Organization Profiles", box=box.SIMPLE_HEAVY)
    table.add_column("ID")
    table.add_column("Name")
    table.add_column("Domain")
    table.add_column("Seen")
    table.add_column("Columns")
    for p in profiles:
        table.add_row(
            str(p.get("id")),
            str(p.get("name")),
            str(p.get("domain") or "—"),
            str(p.get("seen_count") or 0),
            str(len(p.get("expected_columns") or [])),
        )
    console.print(table)


def _print_domain(result: dict) -> None:
    det = result.get("domain_detection") or {}
    org = result.get("organization") or {}
    pack = result.get("knowledge_pack") or {}

    lines = []
    msg = det.get("message") or "Generic engine only"
    conf = det.get("confidence")
    if det.get("domain"):
        lines.append(
            f"[bold]Domain:[/] {det.get('display_name') or det['domain']}  "
            f"({conf:.0%})" if conf is not None else
            f"[bold]Domain:[/] {det.get('display_name') or det['domain']}"
        )
        lines.append(f"[bold]Knowledge Pack:[/] {det['domain']}")
        if det.get("matched_signals"):
            sigs = ", ".join(det["matched_signals"][:8])
            lines.append(f"[dim]Signals: {sigs}[/]")
    else:
        lines.append(f"[bold]Domain:[/] (none — generic engine)")
        lines.append(f"[dim]{msg}[/]")

    sources = pack.get("sources") or ["generic"]
    lines.append(f"[bold]Config layers:[/] {' → '.join(sources)}")

    profile = org.get("profile")
    validation = org.get("validation")
    if profile:
        lines.append(
            f"[bold]Organization:[/] {profile.get('name')} "
            f"({profile.get('match_type', 'saved')}, "
            f"{profile.get('match_confidence', 1):.0%})"
        )
        if validation and validation.get("missing_required_columns"):
            lines.append(
                f"[yellow]Missing required columns: "
                f"{', '.join(validation['missing_required_columns'])}[/]"
            )
    elif (org.get("learned")):
        lines.append(f"[bold]Learned org:[/] {org['learned'].get('name')}")

    console.print()
    console.print(Panel("\n".join(lines), title="Domain Intelligence", border_style="magenta"))


def _print_quality(q: dict) -> None:
    if not q:
        return
    console.print()
    console.print(Panel(
        f"[bold]Dataset Quality {q.get('score_label', '?')}[/]  {q.get('stars_display', '')}\n"
        f"Grade {q.get('grade', '?')}  •  Problems {q.get('problems_total', 0)}  •  "
        f"Critical {q.get('critical', 0)}  •  Warnings {q.get('warnings', 0)}  •  "
        f"Suggestions {q.get('suggestions', 0)}",
        title="Quality Score",
        border_style="green" if float(q.get("score", 0)) >= 75 else "yellow",
    ))


def _print_profile_table(profile: dict | None) -> None:
    if not profile:
        return
    rows = profile_summary_table(profile)
    table = Table(title="Column Profile", box=box.SIMPLE_HEAVY)
    for col in ("Column", "Type", "Unique", "Missing %", "Top Value", "Problems"):
        table.add_column(col)
    for r in rows:
        table.add_row(
            str(r["Column"]),
            str(r["Type"]),
            str(r["Unique"]),
            str(r["Missing %"]),
            str(r["Top Value"])[:40],
            str(r["Problems"])[:50],
        )
    console.print(table)


def _print_recommendations_classified(recs_wrap: dict) -> None:
    recs = recs_wrap.get("recommendations") or []
    if not recs:
        console.print("\n[dim]No recommendations.[/]")
        return

    console.print()
    console.print(Panel.fit(
        f"Fixes classified:  "
        f"[green]Safe {recs_wrap.get('safe_count', 0)}[/]  ·  "
        f"[yellow]Needs Approval {recs_wrap.get('needs_approval_count', 0)}[/]  ·  "
        f"[red]Never Automatic {recs_wrap.get('never_automatic_count', 0)}[/]",
        title="Fix Safety Classes",
        border_style="cyan",
    ))

    color = {
        SAFE: "green",
        NEEDS_APPROVAL: "yellow",
        NEVER_AUTOMATIC: "red",
    }

    for cls in (SAFE, NEEDS_APPROVAL, NEVER_AUTOMATIC):
        group = [r for r in recs if r.get("safety_class") == cls]
        if not group:
            continue
        table = Table(
            title=f"{cls}",
            box=box.SIMPLE_HEAVY,
            title_style=color.get(cls, "white"),
        )
        table.add_column("Column", style="bold")
        table.add_column("Issue")
        table.add_column("Recommendation")
        table.add_column("Conf.")
        table.add_column("Why detected", overflow="fold")
        for r in group:
            table.add_row(
                str(r.get("column") or "—"),
                str(r.get("issue") or "")[:40],
                str(r.get("recommendation") or "")[:36],
                f"{r.get('confidence', 0):.0f}%",
                str(r.get("why_detected") or "")[:120],
            )
        console.print(table)


def _print_audit_summary(audit: dict) -> None:
    entries = audit.get("entries") or []
    # Prefer non-SUMMARY detail lines for the count message
    detail = [e for e in entries if not str(e.get("action", "")).startswith("SUMMARY:")]
    load_entries = [e for e in detail if e.get("rule") == "Phase 1 — Loader"]
    change_entries = [e for e in detail if e not in load_entries]
    console.print()
    console.print(Panel.fit(
        f"[bold]Audit log:[/] {len(change_entries)} change(s) recorded "
        f"(original → new, reason, timestamp, rule).\n"
        f"See output/audit_log.md for the full trail.",
        title="Audit",
        border_style="green",
    ))
    # Show a few recent cell changes
    shown = 0
    for e in change_entries:
        if shown >= 8:
            break
        row_bit = "" if e.get("row") is None else f" row={e.get('row')}"
        console.print(
            f"  [{e.get('timestamp')}] "
            f"{e.get('column') or 'dataset'}{row_bit}: "
            f"[red]{e.get('original')}[/] → [green]{e.get('new')}[/]  "
            f"({e.get('reason')})  rule={e.get('rule')}"
        )
        shown += 1


if __name__ == "__main__":
    cli()
