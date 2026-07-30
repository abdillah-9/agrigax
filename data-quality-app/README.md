# Data Quality App

CLI tool that cleans messy datasets the way a regional statistician would — with explanations, controlled fixes, audit trails, and domain intelligence.

**Status: implemented and working** (not a roadmap). Brain 1 (generic quality engine) + Brain 2 (Knowledge Packs + organization learning) are both live.

---

## What it does

| Capability | Example |
|------------|---------|
| Load many formats | CSV, Excel, TSV, JSON, SPSS, Stata, SQLite, Postgres |
| Find problems | Missing values, duplicates, bad formatting, outliers, rule breaks |
| Explain why | Every issue includes a **Why detected** reason |
| Classify fixes | **Safe** / **Needs Approval** / **Never Automatic** |
| Let you choose | Interactive menu or `--clean safe` / `--clean all` |
| Audit everything | Original → new, reason, timestamp, rule |
| Auto-detect domain | Healthcare, Education, Finance, Survey, … |
| Learn org templates | `--learn-org "Ministry of Health"` remembers monthly Excel shapes |

---

## Installation

```bash
cd data-quality-app
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

---

## Quick start

```bash
source .venv/bin/activate

# Analyze a dirty generic sample
python main.py analyze sample_data/sample.csv

# Healthcare — auto-detects domain (~95%), no --domain needed
python main.py analyze sample_data/healthcare_sample.csv

# Choose which fixes to apply
python main.py analyze sample_data/healthcare_sample.csv --clean ask

# Safe auto-clean + remember this as a ministry template
python main.py analyze sample_data/healthcare_sample.csv --clean safe \
  --learn-org "Ministry of Health"
```

Outputs land in `output/`:

- `dq_report_*.html` — open in a browser  
- `audit_log.md` — every change  
- `cleaned_dataset.csv` — cleaned data  

---

## Common commands

```bash
python main.py analyze FILE.csv                 # auto domain + analysis
python main.py analyze FILE.csv --clean ask     # you choose fixes
python main.py analyze FILE.csv --clean safe    # apply Safe fixes only
python main.py analyze FILE.csv --domain healthcare   # force a pack
python main.py analyze FILE.csv --learn-org "MoH"     # teach a template
python main.py analyze FILE.csv --org "MoH"           # use a saved profile
python main.py analyze FILE.csv --no-domain           # generic only

python main.py domains                          # list Knowledge Packs
python main.py orgs                             # list org profiles
python main.py profile FILE.csv
python main.py score FILE.csv
python main.py info FILE.csv
```

---

## Examples that should “just work”

| File | Expected |
|------|----------|
| `sample_data/healthcare_sample.csv` | Domain **Healthcare** (~95%), `HTN`→`Hypertension` |
| `sample_data/education_sample.csv` | Domain **Education** |
| `sample_data/finance_sample.csv` | Domain **Finance** |
| Re-run healthcare after `--learn-org` | Matches **Ministry of Health** profile |

```bash
python main.py analyze sample_data/healthcare_sample.csv
python main.py analyze sample_data/education_sample.csv
python main.py analyze sample_data/finance_sample.csv
```

---

## Fix safety classes

| Class | Meaning |
|-------|---------|
| **Safe** | Low risk (casing, encoding, terminology, exact dupes, …) |
| **Needs Approval** | Changes meaning (impute, null out-of-range, …) |
| **Never Automatic** | Human review only (business rules, fuzzy merges, outliers) |

---

## Documentation

| Doc | For |
|-----|-----|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Brain 1 / Brain 2 design |
| [KNOWLEDGE_PACKS.md](KNOWLEDGE_PACKS.md) | How domains & packs work / how to add one |
| [ORGANIZATION_PROFILES.md](ORGANIZATION_PROFILES.md) | `--learn-org`, `--org`, merge order |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to extend the project |
| [knowledge/README.md](knowledge/README.md) | Pack folder overview |

---

## Project layout (short)

```
data-quality-app/
├── main.py                 # CLI
├── dq/                     # Engine (phases 1–17 + domain/)
├── knowledge/              # Healthcare, Education, Finance, …
├── organizations/profiles/ # Learned ministry templates
├── sample_data/
├── config/default_rules.yaml
└── output/
```

---

## License / intent

Built as a serious data-quality toolkit for statisticians who clean health, education, survey, finance, and other regional datasets — not a toy CRUD demo.
