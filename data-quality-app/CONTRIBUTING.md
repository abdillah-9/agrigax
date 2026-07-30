# Contributing

Thanks for helping improve the Data Quality App.

---

## Setup

```bash
cd data-quality-app
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python main.py analyze sample_data/healthcare_sample.csv
```

---

## Where to contribute

| Area | Start here |
|------|------------|
| Generic quality logic | `dq/*.py` (phases 1–17) |
| Domain detection / packs | `dq/domain/`, `knowledge/` |
| Organization learning | `dq/domain/organization.py` |
| CLI | `main.py` |
| Docs | `README.md`, `ARCHITECTURE.md`, … |

Read [ARCHITECTURE.md](ARCHITECTURE.md) first.

---

## Adding a Knowledge Pack (no code)

1. Copy `knowledge/healthcare/` → `knowledge/your_domain/`  
2. Edit the six YAML files (especially distinctive `signals.yaml`)  
3. Add a small sample under `sample_data/`  
4. Verify:

```bash
python main.py domains
python main.py analyze sample_data/your_sample.csv
```

Details: [KNOWLEDGE_PACKS.md](KNOWLEDGE_PACKS.md).

---

## Changing cleaning / safety policy

- Recommendations + classes: `dq/recommendations.py`  
- Apply logic: `dq/auto_clean.py`  
- Audit format: `dq/audit.py`  

Keep the contract:

1. Explain **why**  
2. Classify **Safe / Needs Approval / Never Automatic**  
3. Never auto-apply Never Automatic  
4. Audit original → new + reason + timestamp + rule  

---

## Tests to run before a PR

```bash
# Domain auto-detect
python main.py analyze sample_data/healthcare_sample.csv
python main.py analyze sample_data/education_sample.csv
python main.py analyze sample_data/finance_sample.csv

# Terminology
# (healthcare sample should map HTN → Hypertension under --clean safe)

# Org learning
python main.py analyze sample_data/healthcare_sample.csv --learn-org "Test Org"
python main.py orgs
python main.py analyze sample_data/healthcare_sample.csv
```

---

## Style

- Prefer small, focused modules  
- Don’t expand scope beyond the request  
- Update the relevant doc when behavior changes  
- Keep the user README short; put deep detail in the linked docs  

---

## Questions

Open an issue describing:

- Dataset type (domain)  
- What you expected  
- What happened  
- Command you ran  
