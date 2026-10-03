# W3 build-plan LEAP summary (P0 batch)

**Change ID:** `PLAN-TIED-RESIDUALITY-ANALYSIS`  
**CITDP:** `CITDP-RESIDUALITY-PILOT-W3-LEAP.yaml`  
**Date:** 2026-09-27  
**Batch:** build-plan W3 — sponsor-approved P0 (7 rows)

## Validation

| Check | Result |
|-------|--------|
| `pseudocode_validate` IMPL-FEAT_TASK_EXECUTION_STATE | `ok: true` (gate_mode) |
| `pseudocode_validate` IMPL-FEAT_IDEMPOTENT_CREATE | `ok: true` (gate_mode) |
| `tied_validate_consistency` | `ok: true` |
| Verification gate | `allowed: true` — `gates/verification-2026-09-27T05-52-35-881Z.json` (advisory: finding_unresolved) |

## Per stressor (P0)

### S-T01 — candidate_requirement

- **REQ-FEAT_TASK_EXECUTION_RECOVERY:** satisfaction criterion for redelivered execution deduplication + `residuality_facet`
- **REQ-FEAT_IDEMPOTENT_CREATION:** satisfaction criterion for redelivered create deduplication + facet
- **ARCH-FEAT_TASK_EXECUTION_STATE:** constraint bullet (idempotency/attempt key at boundary)
- **ARCH-FEAT_IDEMPOTENT_CREATION:** constraint bullet (shared dedup semantics at seams)
- **IMPL-FEAT_TASK_EXECUTION_STATE:** `APPEND_EVIDENCE` block; APPLY_EXECUTION_OUTCOME calls it
- **IMPL-FEAT_IDEMPOTENT_CREATE:** CREATE path returns existing on redelivery

### S-T04 — candidate_requirement

- **REQ-FEAT_TASK_EXECUTION_RECOVERY:** unknown-outcome retry/resume criterion + facet
- **REQ-FEAT_IDEMPOTENT_CREATION:** unknown-outcome retry criterion + facet
- **IMPL-FEAT_TASK_EXECUTION_STATE:** RESUME_EXECUTION unknown_outcome_flag branch
- **IMPL-FEAT_IDEMPOTENT_CREATE:** store consult before re-allocate on in-progress reservation

### S-T05 — candidate_requirement

- **REQ-FEAT_TASK_EXECUTION_RECOVERY:** dependency order vs message order criterion + facet
- **ARCH-FEAT_TASK_EXECUTION_STATE:** broker-order independence constraint
- **IMPL-FEAT_TASK_EXECUTION_STATE:** `EVALUATE_DEPENDENCIES` block; APPLY_EXECUTION_OUTCOME step 4

### S-T12 — architecture_constraint (harmful — **no positive REQ**)

- **REQ:** none
- **ARCH-FEAT_TASK_EXECUTION_STATE:** evidence dedup / audit integrity constraint
- **IMPL-FEAT_TASK_EXECUTION_STATE:** APPEND_EVIDENCE dedup + `EVIDENCE_DUPLICATE_REJECTED`

### S-T14 — candidate_requirement

- **REQ-FEAT_TASK_EXECUTION_RECOVERY:** max-retry terminal failure criterion + facet
- **ARCH-FEAT_TASK_EXECUTION_STATE:** explicit max-retry policy constraint
- **IMPL-FEAT_TASK_EXECUTION_STATE:** `RECORD_TERMINAL_FAILURE_AFTER_MAX_RETRIES` block

### S-T15 — candidate_requirement

- **REQ-FEAT_TASK_EXECUTION_RECOVERY:** store write failure surfacing criterion + facet
- **ARCH-FEAT_TASK_EXECUTION_STATE:** IO failure taxonomy constraint
- **IMPL-FEAT_TASK_EXECUTION_STATE:** APPEND_EVIDENCE `STORE_WRITE_FAILED`; summary FAILURE_MODES extended

### S-T18 — architecture_constraint

- **REQ-FEAT_IDEMPOTENT_CREATION:** lock TTL / stale lock holder criterion + facet (disposition architecture_constraint)
- **ARCH-FEAT_IDEMPOTENT_CREATION:** lock TTL + metadata check constraint
- **IMPL-FEAT_IDEMPOTENT_CREATE:** `HANDLE_LOCK_TTL` block; lock expiry on acquire path

## Deferred (not promoted this batch)

- **P1:** S-T09, S-T10, S-T11, S-T16, S-O02, S-O06, S-O07
- **W4 / finding:** S-T03
- **Operational:** S-O03, all finding rows

## Files touched (project YAML)

- `tied/requirements/REQ-FEAT_TASK_EXECUTION_RECOVERY.yaml`
- `tied/requirements/REQ-FEAT_IDEMPOTENT_CREATION.yaml`
- `tied/architecture-decisions/ARCH-FEAT_TASK_EXECUTION_STATE.yaml`
- `tied/architecture-decisions/ARCH-FEAT_IDEMPOTENT_CREATION.yaml`
- `tied/implementation-decisions/IMPL-FEAT_TASK_EXECUTION_STATE.yaml`
- `tied/implementation-decisions/IMPL-FEAT_IDEMPOTENT_CREATE.yaml`
- `tied/implementation-decisions/IMPL-FEAT_TASK_EXECUTION_STATE-pseudocode.md`
- `tied/implementation-decisions/IMPL-FEAT_IDEMPOTENT_CREATE-pseudocode.md`

## Next

W4 executable test strategy (RED/composition faults) per elevated criteria; close-out **deferred**.
