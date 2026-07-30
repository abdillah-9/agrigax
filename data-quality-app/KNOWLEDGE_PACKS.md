# Knowledge Packs

Domain intelligence for the Data Quality App.

Packs live under `knowledge/`. They are **implemented and auto-loaded** when the detector recognizes a dataset.

---

## Installed packs

| Domain | Typical columns | What the pack adds |
|--------|-----------------|--------------------|
| `healthcare` | patient_id, diagnosis, temperature, pulse, bp | Clinical ranges, HTN/DM/TB terms, pregnancy rules |
| `education` | student_id, school_id, exam_score, attendance | Score/attendance ranges, grade aliases |
| `agriculture` | farm_id, crop, yield, hectare | Yield/land rules, crop synonyms |
| `finance` | account_id, debit, credit, invoice, tax | DR/CR terms, tax_rate bounds |
| `survey` | respondent_id, enumerator, likert, stratum | Survey sentinels 999/-99/98/97/96 |
| `census` | household_id, enumeration_area, dwelling | Household size / relationship checks |
| `business` | business_id, tin, vat, turnover | Enterprise reporting rules |
| `water` | waterpoint_id, borehole, sanitation | Depth/distance / functionality |
| `livestock` | herd_id, cattle, goat, poultry | Herd count rules |
| `environment` | aqi, pm25, pollutant, emission | Air-quality ranges |

List them anytime:

```bash
python main.py domains
```

---

## Pack folder layout

```
knowledge/healthcare/
├── pack.yaml              # display_name, description
├── signals.yaml           # how auto-detection finds this domain
├── rules.yaml             # business rules
├── ranges.yaml            # numeric min/max
├── terminology.yaml       # HTN → Hypertension, M → Male
└── recommendations.yaml   # possible causes + advice
```

### `signals.yaml` (detection)

```yaml
strong_columns:
  - patient_id
  - diagnosis
  - temperature
weak_columns:
  - facility
  - ward
keywords:
  - health
  - clinical
exclude_columns:
  - student_id      # lowers score if these appear
  - account_id
```

### `ranges.yaml`

```yaml
ranges:
  temperature:
    min: 34
    max: 43
  pulse:
    min: 30
    max: 220
```

### `terminology.yaml`

```yaml
synonyms:                 # applied broadly to text-like columns
  m: Male
  f: Female
maps:
  diagnosis:
    HTN: Hypertension
    DM: Diabetes
    TB: Tuberculosis
  gender:
    M: Male
    F: Female
```

### `recommendations.yaml`

```yaml
temperature:
  possible_causes:
    - Typing error
    - Wrong unit (F vs C)
    - Equipment error
  recommendation: Verify original patient record.
```

When temperature is out of range, the app appends these causes to **Why detected**.

### `rules.yaml`

Same schema as `config/default_rules.yaml` (`condition` / `op` / `severity`).

---

## How detection works

1. Read column names from the loaded DataFrame  
2. Score every pack using its `signals.yaml`  
3. If best score ≥ threshold → load that pack  
4. Merge pack rules/ranges/terminology into the run  

```bash
# Auto
python main.py analyze hospital.csv

# Force
python main.py analyze hospital.csv --domain healthcare

# Skip Brain 2
python main.py analyze hospital.csv --no-domain
```

---

## How to add a new pack

1. Create `knowledge/my_domain/`  
2. Add the six YAML files (copy `healthcare/` as a template)  
3. Fill distinctive `strong_columns` so it doesn’t collide with other packs  
4. Run:

```bash
python main.py domains
python main.py analyze your_file.csv
# or
python main.py analyze your_file.csv --domain my_domain
```

No Python code changes required for a pure YAML pack.

Optional code hooks live in `dq/domain/` if you need custom detection later.

---

## Code map

| File | Role |
|------|------|
| `dq/domain/detector.py` | Score packs / pick winner |
| `dq/domain/packs.py` | Load + merge pack config |
| `dq/domain/apply.py` | Apply terminology + enrich recommendations |
| `knowledge/*/…` | Pack content |

See also [ARCHITECTURE.md](ARCHITECTURE.md) and [ORGANIZATION_PROFILES.md](ORGANIZATION_PROFILES.md).
