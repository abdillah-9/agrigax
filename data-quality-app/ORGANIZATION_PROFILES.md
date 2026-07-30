# Organization Profiles

For statisticians who receive the **same ministry/NGO template every month**.

**Implemented.** Profiles are stored under `organizations/profiles/` and merged on top of generic + Knowledge Pack config.

---

## Why this exists

Example:

```
Ministry of Health
  └── monthly Excel with the same columns
        moh_january.csv
        moh_february.csv
        moh_march.csv
```

After you teach January, February should be recognized automatically:

- Expected columns  
- Required fields  
- Terminology that org usually needs  
- Linked domain (e.g. healthcare)  
- Common problems seen before  

---

## Commands

### Teach a template

```bash
python main.py analyze moh_january.csv \
  --learn-org "Ministry of Health" \
  --clean safe
```

Creates/updates:

```
organizations/profiles/ministry_of_health.yaml
organizations/profiles/ministry_of_health.json
```

### Use / match a profile

```bash
# Auto-match by column fingerprint or high overlap
python main.py analyze moh_february.csv

# Force by name
python main.py analyze moh_february.csv --org "Ministry of Health"
```

### List profiles

```bash
python main.py orgs
```

---

## What is stored

| Field | Meaning |
|-------|---------|
| `id` / `name` | Profile identity (`ministry_of_health`) |
| `domain` | Linked Knowledge Pack if known |
| `column_fingerprint` | Hash of sorted column names |
| `expected_columns` | Columns seen in the template |
| `required_columns` | Columns that were nearly complete when learned |
| `terminology` | Maps harvested from formatting/domain terms |
| `ranges` / `rules` | Optional org-specific overrides (editable by hand) |
| `common_problems` | Recurring issues observed |
| `seen_count` | How many times this profile was learned/updated |

---

## Matching logic

Priority:

1. **Named** — `--org "Ministry of Health"`  
2. **Exact fingerprint** — same columns, same order-normalized set (~98% confidence)  
3. **Overlap** — ≥80% column overlap with a same-domain profile  

If required columns are missing on a later file, the app adds **Never Automatic** recommendations — it will not invent columns/data.

---

## Merge order

```
config/default_rules.yaml     (generic)
        ↓
knowledge/<domain>/           (Knowledge Pack)
        ↓
organizations/profiles/*.yaml (organization)
```

Organization wins on conflicts for the same rule id / range / term.

---

## Manual edits

You can open `organizations/profiles/ministry_of_health.yaml` and add:

```yaml
ranges:
  temperature:
    min: 35
    max: 42
rules:
  - id: moh_custom_rule
    name: "MoH custom check"
    description: "..."
    condition:
      all:
        - column: ward
          op: eq
          value: ""
    severity: warning
```

Re-run analyze; the merged config will pick them up.

---

## Code map

| File | Role |
|------|------|
| `dq/domain/organization.py` | Learn, match, validate profiles |
| `dq/domain/packs.py` | `merge_pack_into_config(..., org_profile)` |
| `dq/pipeline.py` | Wires `--learn-org` / `--org` into the run |

See [ARCHITECTURE.md](ARCHITECTURE.md) and [KNOWLEDGE_PACKS.md](KNOWLEDGE_PACKS.md).
