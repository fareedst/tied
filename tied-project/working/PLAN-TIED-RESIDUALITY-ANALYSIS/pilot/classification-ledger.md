# Classification ledger (W2)

**Change ID:** `PLAN-TIED-RESIDUALITY-ANALYSIS`  
**Status:** Build-plan W2 complete (2026-09-27) — 25/25 rows classified; no project REQ/ARCH/IMPL YAML mutation.  
**Pilot batch:** Integrated depth (same as W1 workshop).

## Authority

Discovery output only. A row does **not** mutate project REQ/ARCH/IMPL YAML. Only **desirable** `candidate_requirement` and reviewed **harmful →** `architecture_constraint` rows may enter W3 after sponsor review and a **separate** behavior-changing CITDP. Harmful residues are never auto-promoted as positive REQs.

**Contrast:** **residue** (system remainder after stressor) ≠ **accepted_residual_risk** (quality-assurance disposition label).

**Holdout:** Validation stressors remain **W4** only — design stressors in this ledger are not holdout proof.

## Disposition enum (`disposition.status`)

| Status | Count |
|--------|------:|
| `candidate_requirement` | 8 |
| `architecture_constraint` | 6 |
| `finding` | 10 |
| `accepted_residual_risk` | 1 |
| `not_applicable` | 0 |
| `unresolved` | 0 |

## Disposition reference

| Status | Meaning |
|--------|---------|
| `candidate_requirement` | Desirable residue → candidate REQ/ARCH input for W3 |
| `architecture_constraint` | Harmful coupling/attractor → ARCH constraint or remediation target |
| `finding` | Implementation or test gap (may cite existing IMPL/tests) |
| `accepted_residual_risk` | Harm/control gap accepted with explicit proof boundary (QA term) |
| `not_applicable` | Outside pilot claim surface |
| `unresolved` | Research / needs sponsor decision |

Assurance tags when applicable: `stateful-reliability`, `data-integrity-migration`, `performance-scale-cost`, `external-input-security`.

---

## Cluster 1 — Task recovery (`REQ-FEAT_TASK_EXECUTION_RECOVERY`)

| Stressor ID | Residue class (W1) | Residue summary | disposition.status | Assurance | proof_boundary | tied_refs | W3 / follow-up notes |
|-------------|-------------------|-----------------|--------------------|-----------|----------------|-----------|----------------------|
| S-T02 | desirable | Crash mid-write leaves non-terminal state; retry can append new attempt | `finding` | stateful-reliability | Discovery maps stressor to IMPL transaction seam; does not prove crash-safe composition without W4 fault injection | REQ-FEAT_TASK_EXECUTION_RECOVERY, ARCH-FEAT_TASK_EXECUTION_STATE, IMPL-FEAT_TASK_EXECUTION_STATE | W4 composition fault (mid-write); no W3 REQ text change unless LEAP finds gap after tests |
| S-T05 | desirable | Dependents never unlock on failed predecessor; out-of-order completion does not unlock early | `candidate_requirement` | stateful-reliability | Classifies need for explicit ordering semantics; does not prove queue behavior under all reorder patterns | REQ-FEAT_TASK_EXECUTION_RECOVERY, ARCH-FEAT_TASK_EXECUTION_STATE | **W3 LEAP:** name message-order / completion-order invariant or ARCH constraint on dependency evaluation |
| S-T06 | desirable | STALE_INPUT; dependents locked until explicit stale recovery | `finding` | stateful-reliability | Confirms alignment with existing satisfaction criteria and RESUME pseudo-code; not runtime proof | REQ-FEAT_TASK_EXECUTION_RECOVERY, IMPL-FEAT_TASK_EXECUTION_STATE | W4 bind stale-resume; stack **covered** per gap-list |
| S-T12 | harmful | Duplicate evidence rows vs single logical attempt (ordering-key defect) | `architecture_constraint` | stateful-reliability, data-integrity-migration | Identifies audit integrity risk; does not prove deduplication without tests | REQ-FEAT_TASK_EXECUTION_RECOVERY, IMPL-FEAT_TASK_EXECUTION_STATE | **W3 LEAP:** ARCH/IMPL constraint for attempt idempotency key or dedup policy (**separate row from S-T01**) |
| S-T13 | desirable | At most one satisfying completion under split claim | `finding` | stateful-reliability | Claim semantics largely outside pilot IMPL token set; discovery only | REQ-FEAT_TASK_EXECUTION_RECOVERY, ARCH-FEAT_TASK_EXECUTION_STATE | W4 split-claim composition; scheduler/executor scope may need future CITDP |
| S-T14 | desirable | Terminal failure reason stable; dependents locked; operator can inspect evidence | `candidate_requirement` | stateful-reliability | Surfaces max-retry / poison-message policy gap; does not prove retry cap behavior | REQ-FEAT_TASK_EXECUTION_RECOVERY | **W3 LEAP:** explicit max-retry or terminal-failure policy in REQ/ARCH |
| S-T15 | desirable | Explicit write failure; task not marked success; ops alert path | `candidate_requirement` | stateful-reliability | IO failure enumeration absent from REQ satisfaction criteria today | REQ-FEAT_TASK_EXECUTION_RECOVERY, IMPL-FEAT_TASK_EXECUTION_STATE | **W3 LEAP:** surface store IO failures in REQ criteria or ARCH failure taxonomy |
| S-T16 | accidental | Clients may see lagging status; bounded stale reads or documented consistency model | `candidate_requirement` | stateful-reliability, performance-scale-cost | Does not prove partition behavior or read-your-writes; W4 holdout separate | ARCH-FEAT_TASK_EXECUTION_STATE, REQ-FEAT_TASK_EXECUTION_RECOVERY | **W3 LEAP:** consistency model / bounded staleness (**in scope**, not deferred) |
| S-O01 | desirable | Dependents blocked until explicit recovery; cancel reason deterministic | `finding` | stateful-reliability | Matches CANCELLATION_NOT_RESUMABLE IMPL path; discovery confirmation | REQ-FEAT_TASK_EXECUTION_RECOVERY, IMPL-FEAT_TASK_EXECUTION_STATE | W4 operator cancel path; **covered** |
| S-O02 | harmful | Override rejected or fully audited — no silent graph corruption (desirable preserved behavior in worksheet) | `architecture_constraint` | stateful-reliability | Human override tooling absent from pilot stack; does not prove audit if tooling built ad hoc | REQ-FEAT_TASK_EXECUTION_RECOVERY | **W3 LEAP:** ARCH constraint for audited override vs hard reject (**harmful risk label accepted**) |
| S-O03 | desirable | Human can explain task_id, last outcome, and safe retry from store state | `accepted_residual_risk` | stateful-reliability | Deterministic status/reason sufficient for pilot; full support UX/runbook not elevated to REQ in this batch | REQ-FEAT_TASK_EXECUTION_RECOVERY | Operational runbook notes only unless sponsor reopens §0 open item #2 |
| S-O04 | desirable | System rejects unsafe resume; operator sees explicit stale error | `finding` | stateful-reliability | Aligns with stale criterion; discovery confirmation | REQ-FEAT_TASK_EXECUTION_RECOVERY, IMPL-FEAT_TASK_EXECUTION_STATE | W4 bad-runbook retry; **covered** |
| S-O06 | harmful | Wide dependent lock blast radius visible; recovery requires explicit passes (desirable visibility in worksheet) | `architecture_constraint` | stateful-reliability | REQ locks dependents correctly; bulk operator preview/recovery not specified | REQ-FEAT_TASK_EXECUTION_RECOVERY | **W3 LEAP:** operator tooling / blast-radius visibility constraint (**A5 case-by-case**) |

---

## Cluster 2 — Idempotent create (`REQ-FEAT_IDEMPOTENT_CREATION`)

| Stressor ID | Residue class (W1) | Residue summary | disposition.status | Assurance | proof_boundary | tied_refs | W3 / follow-up notes |
|-------------|-------------------|-----------------|--------------------|-----------|----------------|-----------|----------------------|
| S-T07 | desirable | Exactly one feature under concurrent identical create; same reference to callers | `finding` | data-integrity-migration | Satisfaction criterion 2 explicit; discovery confirms stack intent | REQ-FEAT_IDEMPOTENT_CREATION, ARCH-FEAT_IDEMPOTENT_CREATION, IMPL-FEAT_IDEMPOTENT_CREATE | W4 concurrent create; **covered** |
| S-T08 | desirable | No readable partial feature; reservation cleaned; retry can succeed | `finding` | data-integrity-migration | PUBLISH_FAILED + criterion 2; discovery confirmation | REQ-FEAT_IDEMPOTENT_CREATION, IMPL-FEAT_IDEMPOTENT_CREATE | W4 partial publish fault; **covered** |
| S-T10 | desirable | Fail fast on lock loss; no dual allocation after coordinator recovery | `architecture_constraint` | data-integrity-migration, stateful-reliability | Lock TTL/fencing implied in ARCH approach details, not satisfaction criteria | ARCH-FEAT_IDEMPOTENT_CREATION, REQ-FEAT_IDEMPOTENT_CREATION | **W3 LEAP:** fencing / lock-loss semantics (**ambiguous** — sponsor review) |
| S-T17 | desirable | REQUEST_KEY_REQUIRED; no store mutation | `finding` | external-input-security | IMPL PRE matches; discovery confirmation | REQ-FEAT_IDEMPOTENT_CREATION, IMPL-FEAT_IDEMPOTENT_CREATE | W4 missing-key path; **covered** |
| S-T18 | desirable | After TTL, another creator proceeds; metadata remains authoritative | `architecture_constraint` | data-integrity-migration | TTL not explicit in satisfaction criteria | ARCH-FEAT_IDEMPOTENT_CREATION, IMPL-FEAT_IDEMPOTENT_CREATE | **W3 LEAP:** lock TTL + authoritative metadata check in ARCH/REQ |
| S-O05 | desirable | COLLISION stable; client must use new key — not silent merge | `finding` | stateful-reliability | REQ error semantics covered; support communication is operational | REQ-FEAT_IDEMPOTENT_CREATION, ARCH-FEAT_IDEMPOTENT_CREATION | W4 collision path; operational comms not W3 REQ unless sponsor expands |
| S-O07 | accidental | Observable lock holders and age; no mystery blocking past TTL (desirable in worksheet) | `candidate_requirement` | stateful-reliability | Operational observability gap; does not prove metrics without implementation | ARCH-FEAT_IDEMPOTENT_CREATION | **W3 LEAP:** lock-holder visibility / handoff observability (**A5 case-by-case**) |

---

## Cluster 3 — Cross-cutting (both pilot REQs)

| Stressor ID | Residue class (W1) | Residue summary | disposition.status | Assurance | proof_boundary | tied_refs | W3 / follow-up notes |
|-------------|-------------------|-----------------|--------------------|-----------|----------------|-----------|----------------------|
| S-T01 | desirable | Second delivery does not fork identity; evidence shows duplicate attempt or existing feature | `candidate_requirement` | stateful-reliability, data-integrity-migration | Duplicate-delivery idempotency key for evidence not explicit in REQ text | REQ-FEAT_TASK_EXECUTION_RECOVERY, REQ-FEAT_IDEMPOTENT_CREATION, IMPL-FEAT_TASK_EXECUTION_STATE, IMPL-FEAT_IDEMPOTENT_CREATE | **W3 LEAP:** explicit cross-path idempotency for duplicate delivery (**separate from S-T12**) |
| S-T03 | desirable | Explicit failure on store unavailable; no silent success; lock recoverable | `finding` | data-integrity-migration, stateful-reliability | PUBLISH_FAILED on create path clear; execution store mapping less explicit | REQ-FEAT_IDEMPOTENT_CREATION, IMPL-FEAT_IDEMPOTENT_CREATE, REQ-FEAT_TASK_EXECUTION_RECOVERY | W4 store-unavailable composition; **ambiguous** execution mapping |
| S-T04 | desirable | Safe retry after unknown returns same outcome without duplicate allocation | `candidate_requirement` | stateful-reliability, data-integrity-migration | Client-visible unknown-outcome guidance not a satisfaction criterion | REQ-FEAT_IDEMPOTENT_CREATION, REQ-FEAT_TASK_EXECUTION_RECOVERY | **W3 LEAP:** client retry / unknown-outcome guidance in REQ |
| S-T09 | harmful | Deterministic errors (collision, ILLEGAL_TRANSITION) rather than silent corruption under schema/skew | `candidate_requirement` | data-integrity-migration | No REQ for version compatibility or rollout safety today; not accepted-risk-only blanket | REQ-FEAT_IDEMPOTENT_CREATION, REQ-FEAT_TASK_EXECUTION_RECOVERY | **W3 LEAP:** schema/version negotiation or safe rollout (**sponsor: arch/REQ follow-up**) |
| S-T11 | accidental | Graceful degradation under retry storm; idempotency holds; no unbounded lock wait | `architecture_constraint` | performance-scale-cost | performance-scale-cost profile silent in pilot REQ text | REQ-FEAT_IDEMPOTENT_CREATION, REQ-FEAT_TASK_EXECUTION_RECOVERY | **W3 LEAP:** backpressure, rate limits, degradation (**in scope**; **A5 case-by-case**) |

---

## W3 eligibility summary

### Flagged for W3 LEAP (`candidate_requirement` — desirable elevation)

| Stressor | Primary tied_refs | Notes |
|----------|-------------------|-------|
| S-T01 | REQ-FEAT_TASK_EXECUTION_RECOVERY, REQ-FEAT_IDEMPOTENT_CREATION | Duplicate delivery idempotency across execute + create |
| S-T04 | REQ-FEAT_IDEMPOTENT_CREATION, REQ-FEAT_TASK_EXECUTION_RECOVERY | Unknown-outcome client retry guidance |
| S-T05 | REQ-FEAT_TASK_EXECUTION_RECOVERY | Message/completion ordering vs dependency unlock |
| S-T09 | REQ-FEAT_IDEMPOTENT_CREATION, REQ-FEAT_TASK_EXECUTION_RECOVERY | Version/schema skew — **not** defer to accepted-risk-only |
| S-T14 | REQ-FEAT_TASK_EXECUTION_RECOVERY | Max-retry / terminal poison policy |
| S-T15 | REQ-FEAT_TASK_EXECUTION_RECOVERY | Store IO failure surfacing |
| S-T16 | ARCH-FEAT_TASK_EXECUTION_STATE, REQ-FEAT_TASK_EXECUTION_RECOVERY | Consistency / bounded stale reads |
| S-O07 | ARCH-FEAT_IDEMPOTENT_CREATION | Lock holder visibility |

### Flagged for W3 LEAP (`architecture_constraint` — reviewed harmful → constraint)

| Stressor | Primary tied_refs | Notes |
|----------|-------------------|-------|
| S-T10 | ARCH-FEAT_IDEMPOTENT_CREATION | Lock loss / fencing |
| S-T11 | REQ-FEAT_IDEMPOTENT_CREATION, REQ-FEAT_TASK_EXECUTION_RECOVERY | Retry storm / backpressure |
| S-T12 | REQ-FEAT_TASK_EXECUTION_RECOVERY, IMPL-FEAT_TASK_EXECUTION_STATE | Evidence dedup / attempt key (**harmful** residue) |
| S-T18 | ARCH-FEAT_IDEMPOTENT_CREATION | Lock TTL authority |
| S-O02 | REQ-FEAT_TASK_EXECUTION_RECOVERY | Audited override vs reject |
| S-O06 | REQ-FEAT_TASK_EXECUTION_RECOVERY | Bulk cancel blast-radius tooling |

### `accepted_residual_risk` (operational / QA — not W3 REQ promotion)

| Stressor | Notes |
|----------|-------|
| S-O03 | Support explainability beyond deterministic status deferred as accepted risk for pilot |

### W4 / operational notes only (`finding` — no W3 stack elevation in this batch)

S-T02, S-T06, S-T13, S-O01, S-O04, S-T07, S-T08, S-T17, S-O05, S-T03 — primarily composition-fault binding and stack confirmation; gap-list **covered** or **partial** with existing IMPL carrying detail.

---

## Sponsor review bullets (ambiguous / case-by-case)

1. **S-T10** — Lock-loss fencing lives in ARCH approach details; W3 should confirm whether constraint elevation or IMPL-only test gap is sufficient.
2. **S-T12 vs S-T01** — Kept separate: delivery idempotency (desirable REQ candidate) vs harmful duplicate evidence rows (ARCH constraint).
3. **S-T03** — Create-path store failure clear; execution-path mapping flagged **ambiguous** in gap-list — W4 may split faults before W3.
4. **A5 cluster** — Dispositions vary by row (not one bucket): S-T09/T16/T11/O02/O06/O07 each classified independently per sponsor 2026-09-27.

## Exit evidence (W2 → W3)

- All 25 rows: disposition + proof_boundary + tied_refs.
- W3 entry requires sponsor review of all `candidate_requirement` and `architecture_constraint` rows and a **new** behavior-changing CITDP (not this planning record).
- Machine mirror: `classification-ledger.jsonl`.
