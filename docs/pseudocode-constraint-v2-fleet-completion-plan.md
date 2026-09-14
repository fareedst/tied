# Fleet constraint v2 — completion plan (Track B + grading)

**Purpose:** Historical plan for Track B migration batches (NB-1..NB-4) and **ongoing G4 grading**. Track B migration is **complete**; active ops are [REQ-PSEUDOCODE_FLEET_G4_MAINTENANCE](../tied/requirements/REQ-PSEUDOCODE_FLEET_G4_MAINTENANCE.yaml).

**Canonical program:** [`pseudocode-constraint-v2-fleet-program.md`](pseudocode-constraint-v2-fleet-program.md) · **G4 ops:** [`pseudocode-constraint-v2-fleet-g4-maintenance-runbook.md`](pseudocode-constraint-v2-fleet-g4-maintenance-runbook.md) · **Hygiene / tracks:** [`pseudocode-grammar-v2-and-hygiene-plan.md`](pseudocode-grammar-v2-and-hygiene-plan.md)

**Baseline (2026-09-13 post–Track B):** [`program-status.v1.yaml`](../working/fleet-constraint-v2/program-status.v1.yaml) — **18/18** not_enrolled **fleet-migrated-client**; gate stage **G4**; orchestrator REQ **closed**; maintenance via `node scripts/run-fleet-g4-maintenance.mjs`.

---

## 1. What “complete” means (two grading lenses)

(Unchanged definitions — see program doc.)

**Track B program exit:** **Achieved** 2026-09-13 (incl. post-NB-4 `tied-win-diff` with documented bypass).

**Falsification:** G4 maintenance green → does **not** imply full-manifest Track B re-proof.

### 1.2 Gate-stage grading (methodology)

| Stage | Role today |
|-------|------------|
| **G3** | Historical fleet waves (NB-* batches) |
| **G4** | **Continuous** — [`run-fleet-g4-maintenance.mjs`](../scripts/run-fleet-g4-maintenance.mjs) |

**Continuous grading command (G4):**

```bash
node scripts/run-fleet-g4-maintenance.mjs
```

---

## 2. Inventory snapshot (post–Track B)

| Cohort | Count | Migration grading |
|--------|-------|-------------------|
| Enrolled OD-P4-3 | **5** | **fleet-migrated-client** (G4 enrolled regression) |
| Not enrolled (Track B) | **18** | **fleet-migrated-client** |

Manifest: [`client-inventory-manifest.v1.yaml`](../working/fleet-constraint-v2/client-inventory-manifest.v1.yaml).

---

## 3. Workstreams

| WS | Status | Notes |
|----|--------|-------|
| **WS-0** Continuous G4 | **Active** | `run-fleet-g4-maintenance.mjs`; receipt under `g4-maintenance/` |
| **WS-1..WS-4** NB-1..NB-4 + Track B exit | **Complete** | 2026-09-13 |
| **WS-5** Post-fleet hygiene | **Optional** | OD-P5-1 v1 parser; doc sync |

---

## 4–7. NB retrospective / open decisions / commands

NB batch sections remain in git history and [`pseudocode-constraint-v2-fleet-nb*-plan.md`](pseudocode-constraint-v2-fleet-nb4-plan.md) files for audit. **Do not** start NB-5 without a new sponsor REQ.

| Situation | Action |
|-----------|--------|
| Maintenance | `node scripts/run-fleet-g4-maintenance.mjs` |
| Check-only | `--skip-tests` |
| **New client strict adherence (design)** | [`pseudocode-new-client-tied-adherence-plan.md`](pseudocode-new-client-tied-adherence-plan.md) — refine/build in follow-on session |
| New migration scope | New REQ + sponsor gate — not this plan |

---

## Traceability

[REQ-PSEUDOCODE_FLEET_G4_MAINTENANCE](../tied/requirements/REQ-PSEUDOCODE_FLEET_G4_MAINTENANCE.yaml) · [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION](../tied/requirements/REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION.yaml) (closed)
