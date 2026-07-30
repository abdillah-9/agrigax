# Architecture

How the Data Quality App is structured.

**Everything described here is implemented** in `dq/` + `knowledge/` + `organizations/`.

---

## Two brains

```
Dataset
   │
   ▼
┌──────────────────────────────────────┐
│  Brain 1 — Generic Data Quality      │
│  Loader → Profile → Types → Missing   │
│  Dupes → Formatting → Ranges → Rules │
│  Outliers → Stats → Score → Recs     │
│  Clean (controlled) → Audit → Report │
└──────────────────────────────────────┘
   │
   ▼
┌──────────────────────────────────────┐
│  Brain 2 — Domain Intelligence       │
│  Domain Detector → Knowledge Pack    │
│  → Organization Profile              │
└──────────────────────────────────────┘
   │
   ▼
Recommendations (with why + safety class)
   │
   ▼
User chooses fixes → Audit Log → Reports
```

Brain 1 works on **any** dataset.  
Brain 2 makes it behave like a **statistician who knows the sector**.

---

## Brain 1 — Generic engine (Phases 1–17)

| Phase | Module | Role |
|------:|--------|------|
| 1 | `dq/loader.py` | CSV/Excel/TSV/JSON/SPSS/Stata/SQLite/Postgres → DataFrame |
| 2 | `dq/profiler.py` | Rows, missing %, unique %, top values, problems |
| 3 | `dq/type_detector.py` | Semantic types (int, date, email, lat/lon, …) |
| 4 | `dq/missing.py` | NULL / empty / N/A / 999 + impute advice |
| 5 | `dq/duplicates.py` | Exact, case/whitespace, fuzzy |
| 6 | `dq/formatting.py` | male/MALE/M → Male; date normalize |
| 7 | `dq/range_validation.py` | Out-of-range values |
| 8 | `dq/business_rules.py` | Configurable YAML logic |
| 9 | `dq/outliers.py` | IQR, Z-score, Isolation Forest, DBSCAN, LOF |
| 10 | `dq/text_cleaning.py` | Trim, unicode, emoji, spell hints |
| 11 | `dq/encoding.py` | Encoding detect + mojibake repair |
| 12 | `dq/statistics.py` | Mean/median/skew/normality/correlation |
| 13 | `dq/quality_score.py` | Score % + stars + severity counts |
| 14 | `dq/recommendations.py` | Why + fix + confidence + safety class |
| 15 | `dq/auto_clean.py` | Apply only what user allows |
| 16 | `dq/audit.py` | Original → new, reason, timestamp, rule |
| 17 | `dq/report.py` | MD / HTML / PDF / JSON |

Orchestrator: `dq/pipeline.py`.

### Safety classes

| Class | Engine behavior |
|-------|-----------------|
| Safe | May auto-apply (`--clean safe`) |
| Needs Approval | Only with user OK (`--clean ask` / `--clean all`) |
| Never Automatic | Report only — never applied |

---

## Brain 2 — Domain intelligence (Phase 18)

### Domain detector (`dq/domain/detector.py`)

Scores each Knowledge Pack from column-name signals:

- **strong_columns** (high weight)  
- **weak_columns**  
- **keywords**  
- **exclude_columns** (penalty)

Picks the best pack above a confidence threshold.  
Override with `--domain healthcare` or skip with `--no-domain`.

### Knowledge Packs (`knowledge/<domain>/`)

See [KNOWLEDGE_PACKS.md](KNOWLEDGE_PACKS.md).

Loaded pack contributes:

- Extra business rules  
- Domain ranges (e.g. temperature 34–43)  
- Terminology maps (`HTN` → `Hypertension`)  
- Domain recommendations (“possible causes…”)

### Organization profiles (`organizations/profiles/`)

See [ORGANIZATION_PROFILES.md](ORGANIZATION_PROFILES.md).

Remembers recurring ministry/NGO Excel templates (columns, required fields, terminology).

---

## Config merge order

At runtime, configuration is merged as:

```
generic (config/default_rules.yaml)
   ↓
Knowledge Pack (knowledge/<domain>/)
   ↓
Organization profile (organizations/profiles/)
```

Later layers override earlier ones for the same rule id / range / term.

---

## Cleaning & audit flow

1. Analyze (Brain 1 + optional Brain 2)  
2. Show recommendations with **Why detected** + safety class  
3. User chooses (`ask` / `safe` / `all` / `none`)  
4. Apply selected Safe / Needs Approval fixes only  
5. Write cell-level audit entries + reports + cleaned CSV  

CLI entry: `main.py` → `run_pipeline` → optional `apply_cleaning`.

---

## Data flow (one sentence)

**Load once → profile & detect → enrich with domain/org knowledge → recommend with explanations → clean only what is allowed → leave a full audit trail.**
