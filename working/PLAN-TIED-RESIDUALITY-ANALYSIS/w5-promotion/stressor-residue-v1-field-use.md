# stressor-residue.v1 — field-use justification (W5 refine)

**Change ID:** `PLAN-TIED-RESIDUALITY-ANALYSIS`  
**Schema reference:** `working/PLAN-TIED-RESIDUALITY-ANALYSIS/schemas/stressor-residue.v1.example.yaml`

## Pilot field use

| Artifact | Count | Notes |
|----------|-------|-------|
| Worksheets (markdown) | 25 | Primary human discovery input |
| Classification ledger (jsonl) | 25 | Disposition + proof_boundary authoritative for W2–W3 |
| Machine `stressor-residue.v1` records | 4 | `pilot/records/S-T01.yaml`, `S-T07.yaml`, `S-T08.yaml`, `S-O02.yaml` |

## Fields exercised in machine records

- **baseline** — objective + naïve summary (from `pilot/baseline.md`)
- **stressor** — id, category, description
- **impact_path** — functions, data, dependencies, bindings
- **residue** — class desirable/harmful + description
- **disposition** — status + `tied_refs`
- **evidence.proof_boundary** — present on high-value rows

## Fields lightly or unused in pilot

- **attractor** — documented in matrix markdown, rarely in YAML
- **validation_stressor** — holdouts live in `validation-stressors.md` instead
- **business_priority** — worksheet-only for most rows

## Recommendation (refine)

| Question | Refine answer |
|----------|---------------|
| Stable schema warranted? | **Not yet** — defer canonical JSON Schema / `lint_yaml` hook |
| When promote? | Sponsor **SD-W5-SCHEMA-LINT** or **≥10** machine records across a second pilot |
| Interim pattern | Keep example YAML + optional records; prefer **jsonl ledger** for automation |

**Disposition:** **Defer** stable lint in W5 build default; **Adopt (revise)** example file as documentation-only under `working/` or `docs/` excerpt without MCP validator.
