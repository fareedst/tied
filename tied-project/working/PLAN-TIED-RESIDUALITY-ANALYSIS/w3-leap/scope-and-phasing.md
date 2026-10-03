# W3 scope and phased promotion (refine-plan)

**Change ID:** `PLAN-TIED-RESIDUALITY-ANALYSIS`  
**Behavior-changing CITDP:** `working/PLAN-TIED-RESIDUALITY-ANALYSIS/CITDP-RESIDUALITY-PILOT-W3-LEAP.yaml`  
**Pilot stack tokens (mutation deferred to build-plan W3):** `REQ-FEAT_TASK_EXECUTION_RECOVERY`, `REQ-FEAT_IDEMPOTENT_CREATION` (+ linked ARCH/IMPL)  
**Date:** 2026-09-27  
**Status:** **Sponsor approved 2026-09-27** — P0 persisted batch 1; **P1 batch 2 persisted 2026-09-27** (build-plan W3 P1).

## Authority

- Source dispositions: `pilot/classification-ledger.md` (25/25 classified).
- W3-eligible dispositions: `candidate_requirement` (8) + `architecture_constraint` (6) = **14 rows**.
- **Harmful residues never become positive REQs.** Rows such as **S-T12** (harmful duplicate evidence) promote as **ARCH/IMPL constraints** only.
- **Stressor/residue** IDs appear as **facet references** in proposed traceability metadata — not parallel full specifications.
- Rows classified `finding`, `accepted_residual_risk`, or operational-only stay **out** of W3 stack elevation.

## Default phased promotion (refine-plan proposal)

Rationale: gap-list marks six **gap** and eleven **partial** items; P0 targets cross-cutting and recovery/idempotency **satisfaction-criteria holes** that block honest DoD item 8 mapping. P1 defers attractor **A5** ops/scale/version cluster and ambiguous rows so build-plan W3 can land a bounded first LEAP tranche before W4 fault injection.

### Phase P0 — build-plan W3 batch 1 (default **7** rows)

| Stressor | Ledger disposition | Primary tied_refs | Rationale |
|----------|-------------------|-------------------|-----------|
| S-T01 | candidate_requirement | REQ-FEAT_TASK_EXECUTION_RECOVERY, REQ-FEAT_IDEMPOTENT_CREATION | Cross-cutting duplicate delivery; gap-list **partial** — explicit idempotency for redelivery not in REQ text |
| S-T04 | candidate_requirement | REQ-FEAT_IDEMPOTENT_CREATION, REQ-FEAT_TASK_EXECUTION_RECOVERY | Client unknown-outcome retry guidance absent from satisfaction criteria |
| S-T05 | candidate_requirement | REQ-FEAT_TASK_EXECUTION_RECOVERY | Dependency unlock vs message/completion order — ARCH partial |
| S-T12 | architecture_constraint | REQ-FEAT_TASK_EXECUTION_RECOVERY, IMPL-FEAT_TASK_EXECUTION_STATE | **Harmful** duplicate evidence rows — audit integrity; **not** a positive REQ |
| S-T14 | candidate_requirement | REQ-FEAT_TASK_EXECUTION_RECOVERY | Max-retry / terminal poison policy gap |
| S-T15 | candidate_requirement | REQ-FEAT_TASK_EXECUTION_RECOVERY | Store IO failure surfacing absent from REQ criteria |
| S-T18 | architecture_constraint | ARCH-FEAT_IDEMPOTENT_CREATION | Lock TTL + authoritative metadata — data-integrity gap |

**Sponsor SD-W3-P0 (resolved):** **Approved** — P0 = 7 rows (S-T01, S-T04, S-T05, S-T12, S-T14, S-T15, S-T18).

### Phase P1 — defer to W3 batch 2 or post-pilot (default **7** rows)

| Stressor | Ledger disposition | Primary tied_refs | Defer rationale |
|----------|-------------------|-------------------|-------------------|
| S-T09 | candidate_requirement | REQ-FEAT_IDEMPOTENT_CREATION, REQ-FEAT_TASK_EXECUTION_RECOVERY | Version/skew negotiation — broad rollout scope; gap-list #1 |
| S-T10 | architecture_constraint | ARCH-FEAT_IDEMPOTENT_CREATION | **Ambiguous** — fencing in ARCH approach details vs IMPL W4 gap (**SD-W3-S-T10**) |
| S-T11 | architecture_constraint | REQ-FEAT_IDEMPOTENT_CREATION, REQ-FEAT_TASK_EXECUTION_RECOVERY | Retry storm / backpressure — performance-scale-cost; gap-list #2 |
| S-T16 | candidate_requirement | ARCH-FEAT_TASK_EXECUTION_STATE | Partition/read consistency — gap-list #3 |
| S-O02 | architecture_constraint | REQ-FEAT_TASK_EXECUTION_RECOVERY | On-call override audit — human tooling scope |
| S-O06 | architecture_constraint | REQ-FEAT_TASK_EXECUTION_RECOVERY | Bulk cancel blast-radius — operator tooling |
| S-O07 | candidate_requirement | ARCH-FEAT_IDEMPOTENT_CREATION | Lock-holder observability — ops gap; A5 case-by-case |

**Sponsor SD-W3-P1 (resolved):** **Accept P1 defer** — seven rows remain batch 2 (S-T09, S-T10, S-T11, S-T16, S-O02, S-O06, S-O07).

### Explicitly out of W3 stack elevation

| Stressor | disposition | Notes |
|----------|-------------|-------|
| S-T03 | finding | **Ambiguous** execution-path store mapping — default **W4 composition first** (**SD-W3-S-T03**) |
| S-O03 | accepted_residual_risk | Support explainability — operational runbook; not positive REQ |
| All `finding` rows (10 total) | finding | W4 composition / stack confirmation; gap-list **covered** or **partial** with existing IMPL |

## Sponsor decisions (resolved 2026-09-27)

| ID | Sponsor choice |
|----|----------------|
| SD-W3-TRIM | **7** in batch 1 (P0 only) |
| SD-W3-ROW-SET | **Accept** default P0/P1 split |
| SD-W3-S-T10 | **Defer P1** (lock-loss not in batch 1) |
| SD-W3-S-T03 | **W4 first** — no W3 stack elevation for S-T03 |
| SD-W3-HARMFUL | **Confirmed** — harmful rows do not become positive REQs (S-T12 = ARCH/IMPL constraint only) |

## Traceability facet pattern (normative for build-plan W3)

When persisting project YAML, each new or changed satisfaction criterion / ARCH constraint SHOULD carry metadata such as:

```yaml
# Example facet — not canonical until build-plan persist
residuality_facet:
  stressor_id: S-T01
  ledger_disposition: candidate_requirement
  proof_boundary: discovery only until W4 executable evidence
  source_ref: working/PLAN-TIED-RESIDUALITY-ANALYSIS/pilot/classification-ledger.md
```

## Next step

**W4+** — extend composition faults for P1 facets where needed; close-out **deferred**. W3 LEAP tranche complete for all 14 W3-eligible rows.
