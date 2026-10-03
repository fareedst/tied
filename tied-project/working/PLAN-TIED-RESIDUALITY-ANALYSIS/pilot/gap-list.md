# Gap list — discovery vs existing TIED stack (W1)

**Method:** Compare worksheet residues to satisfaction criteria and ARCH/IMPL contracts (detail YAML read-only, 2026-09-27).

**Summary:** 25 stressors — **covered** 6 · **partial** 11 · **gap** 6 · **ambiguous** 2

**Sponsor review (2026-09-27):** Human labels OK; S-T11+S-T16 in scope; keep S-T01+S-T12; W2 order = recovery REQ → idempotent REQ → cross-cutting; S-T09 → W3 arch/REQ candidate; A5 classified case-by-case.

## Top gaps (sponsor review priority)

1. **Version/skew (S-T09)** — Pilot REQs assume compatible normalization; no explicit REQ for schema/version negotiation or safe rollout.
2. **Retry storm / backpressure (S-T11)** — Idempotency prevents duplicate features but REQ stack silent on lock contention, rate limits, and graceful degradation under load.
3. **Read consistency under partition (S-T16)** — Execution status visibility to API clients during partition not specified.
4. **On-call override audit (S-O02)** — Policy bypass could corrupt graph if tooling exists; no ARCH constraint for audited override vs reject.
5. **Bulk cancel blast radius (S-O06)** — REQ locks dependents correctly; operator tooling for preview/recovery not in stack.
6. **Operational observability (S-O07, S-O03 partial)** — Support/on-call need lock age and in-flight create visibility — not satisfaction criteria today.

## Attractor-linked clusters

- **A5 (ops/scale/version):** S-T09, S-T11, S-T16, S-O02, S-O06, S-O07 → W2 classification likely mixes `architecture_constraint`, `accepted_residual_risk`, and operational notes.
- **A1–A4:** Mostly **partial** or **covered** — residuality confirms TIED stack intent; W4 composition faults should bind to S-T01, S-T07, S-T13, S-T06.

---

## Per-stressor entries

```text
stressor_id: S-T01
  residue_summary: Duplicate delivery preserves identity and observable attempts
  tied_refs: [REQ-FEAT_TASK_EXECUTION_RECOVERY, REQ-FEAT_IDEMPOTENT_CREATION, IMPL-FEAT_TASK_EXECUTION_STATE, IMPL-FEAT_IDEMPOTENT_CREATE]
  existing_coverage: partial
  notes: REQ criteria imply behavior; duplicate-delivery idempotency key for evidence not explicit in REQ text
  proof_boundary: discovery only
```

```text
stressor_id: S-T02
  residue_summary: Crash mid-write leaves non-terminal state; retry appends
  tied_refs: [REQ-FEAT_TASK_EXECUTION_RECOVERY, ARCH-FEAT_TASK_EXECUTION_STATE, IMPL-FEAT_TASK_EXECUTION_STATE]
  existing_coverage: partial
  notes: Transaction boundary between side effect and evidence append is IMPL detail; composition fault target W4
  proof_boundary: discovery only
```

```text
stressor_id: S-T03
  residue_summary: Explicit failure; cleanup on create path
  tied_refs: [REQ-FEAT_IDEMPOTENT_CREATION, IMPL-FEAT_IDEMPOTENT_CREATE, REQ-FEAT_TASK_EXECUTION_RECOVERY]
  existing_coverage: ambiguous
  notes: PUBLISH_FAILED cleanup in IMPL; execution path store failure mapping less explicit in pseudo-code
  proof_boundary: discovery only
```

```text
stressor_id: S-T04
  residue_summary: Retry after unknown returns stable outcome
  tied_refs: [REQ-FEAT_IDEMPOTENT_CREATION, REQ-FEAT_TASK_EXECUTION_RECOVERY]
  existing_coverage: partial
  notes: Client-visible "unknown outcome" guidance not a satisfaction criterion
  proof_boundary: discovery only
```

```text
stressor_id: S-T05
  residue_summary: Dependency unlock independent of message order
  tied_refs: [REQ-FEAT_TASK_EXECUTION_RECOVERY, ARCH-FEAT_TASK_EXECUTION_STATE]
  existing_coverage: partial
  notes: ARCH states failed tasks do not satisfy deps; queue ordering not named
  proof_boundary: discovery only
```

```text
stressor_id: S-T06
  residue_summary: STALE_INPUT; dependents locked
  tied_refs: [REQ-FEAT_TASK_EXECUTION_RECOVERY, IMPL-FEAT_TASK_EXECUTION_STATE]
  existing_coverage: covered
  notes: Matches satisfaction criteria 2–3 and RESUME_EXECUTION pseudo-code
  proof_boundary: discovery only
```

```text
stressor_id: S-T07
  residue_summary: Single feature under concurrent identical create
  tied_refs: [REQ-FEAT_IDEMPOTENT_CREATION, ARCH-FEAT_IDEMPOTENT_CREATION, IMPL-FEAT_IDEMPOTENT_CREATE]
  existing_coverage: covered
  notes: Satisfaction criterion 2 explicit
  proof_boundary: discovery only
```

```text
stressor_id: S-T08
  residue_summary: No partial publish; reservation cleaned
  tied_refs: [REQ-FEAT_IDEMPOTENT_CREATION, IMPL-FEAT_IDEMPOTENT_CREATE]
  existing_coverage: covered
  notes: Satisfaction criterion 2 + IMPL PUBLISH_FAILED path
  proof_boundary: discovery only
```

```text
stressor_id: S-T09
  residue_summary: Skew causes deterministic errors not silent corruption
  tied_refs: [REQ-FEAT_IDEMPOTENT_CREATION, REQ-FEAT_TASK_EXECUTION_RECOVERY]
  existing_coverage: gap
  notes: No REQ for version compatibility or rollout safety
  proof_boundary: discovery only
```

```text
stressor_id: S-T10
  residue_summary: Fail fast on lock loss; no dual winner after recovery
  tied_refs: [ARCH-FEAT_IDEMPOTENT_CREATION, REQ-FEAT_IDEMPOTENT_CREATION]
  existing_coverage: ambiguous
  notes: Lock TTL/fencing implied by ARCH approach details, not satisfaction criteria
  proof_boundary: discovery only
```

```text
stressor_id: S-T11
  residue_summary: Graceful degradation under retry storm
  tied_refs: [REQ-FEAT_IDEMPOTENT_CREATION, REQ-FEAT_TASK_EXECUTION_RECOVERY]
  existing_coverage: gap
  notes: performance-scale-cost profile not in pilot REQ text
  proof_boundary: discovery only
```

```text
stressor_id: S-T12
  residue_summary: Evidence deduplication or single logical attempt
  tied_refs: [REQ-FEAT_TASK_EXECUTION_RECOVERY, IMPL-FEAT_TASK_EXECUTION_STATE]
  existing_coverage: ambiguous
  notes: POST says append once per outcome application; idempotency key for attempt not in REQ
  proof_boundary: discovery only
```

```text
stressor_id: S-T13
  residue_summary: Single winning completion under split claim
  tied_refs: [REQ-FEAT_TASK_EXECUTION_RECOVERY, ARCH-FEAT_TASK_EXECUTION_STATE]
  existing_coverage: partial
  notes: Claim semantics live in scheduler/executor IMPL outside this pilot token set
  proof_boundary: discovery only
```

```text
stressor_id: S-T14
  residue_summary: Terminal failure reason stable; deps locked
  tied_refs: [REQ-FEAT_TASK_EXECUTION_RECOVERY]
  existing_coverage: partial
  notes: Max-retry policy not in REQ; deterministic reason is
  proof_boundary: discovery only
```

```text
stressor_id: S-T15
  residue_summary: Write failure surfaced; no false success
  tied_refs: [REQ-FEAT_TASK_EXECUTION_RECOVERY, IMPL-FEAT_TASK_EXECUTION_STATE]
  existing_coverage: partial
  notes: IO failure modes not enumerated in REQ satisfaction criteria
  proof_boundary: discovery only
```

```text
stressor_id: S-T16
  residue_summary: Bounded stale reads or documented consistency model
  tied_refs: [ARCH-FEAT_TASK_EXECUTION_STATE]
  existing_coverage: gap
  notes: Consistency model not in pilot REQ/ARCH detail loaded
  proof_boundary: discovery only
```

```text
stressor_id: S-T17
  residue_summary: REQUEST_KEY_REQUIRED
  tied_refs: [REQ-FEAT_IDEMPOTENT_CREATION, IMPL-FEAT_IDEMPOTENT_CREATE]
  existing_coverage: covered
  notes: IMPL PRE matches
  proof_boundary: discovery only
```

```text
stressor_id: S-T18
  residue_summary: Lock expires; metadata remains authoritative
  tied_refs: [ARCH-FEAT_IDEMPOTENT_CREATION, IMPL-FEAT_IDEMPOTENT_CREATE]
  existing_coverage: partial
  notes: TTL not explicit in satisfaction criteria
  proof_boundary: discovery only
```

```text
stressor_id: S-O01
  residue_summary: Cancel locks dependents; deterministic reason
  tied_refs: [REQ-FEAT_TASK_EXECUTION_RECOVERY, IMPL-FEAT_TASK_EXECUTION_STATE]
  existing_coverage: covered
  notes: CANCELLATION_NOT_RESUMABLE in IMPL
  proof_boundary: discovery only
```

```text
stressor_id: S-O02
  residue_summary: Override audited or rejected
  tied_refs: [REQ-FEAT_TASK_EXECUTION_RECOVERY]
  existing_coverage: gap
  notes: Human override tooling not in pilot stack
  proof_boundary: discovery only
```

```text
stressor_id: S-O03
  residue_summary: Support can read evidence and advise safe retry
  tied_refs: [REQ-FEAT_TASK_EXECUTION_RECOVERY]
  existing_coverage: partial
  notes: Deterministic status helps; UX/runbook requirements absent
  proof_boundary: discovery only
```

```text
stressor_id: S-O04
  residue_summary: STALE_INPUT on bad runbook retry
  tied_refs: [REQ-FEAT_TASK_EXECUTION_RECOVERY, IMPL-FEAT_TASK_EXECUTION_STATE]
  existing_coverage: covered
  notes: Aligns with stale criterion
  proof_boundary: discovery only
```

```text
stressor_id: S-O05
  residue_summary: Stable COLLISION semantics
  tied_refs: [REQ-FEAT_IDEMPOTENT_CREATION, ARCH-FEAT_IDEMPOTENT_CREATION]
  existing_coverage: partial
  notes: REQ covers error; support communication is operational
  proof_boundary: discovery only
```

```text
stressor_id: S-O06
  residue_summary: Wide dependent lock visible; explicit recovery needed
  tied_refs: [REQ-FEAT_TASK_EXECUTION_RECOVERY]
  existing_coverage: gap
  notes: Bulk operator tooling not specified
  proof_boundary: discovery only
```

```text
stressor_id: S-O07
  residue_summary: Lock holder visibility for handoff
  tied_refs: [ARCH-FEAT_IDEMPOTENT_CREATION]
  existing_coverage: gap
  notes: Operational observability gap
  proof_boundary: discovery only
```

## Exit

Completed gap list is input to **W2** `classification-ledger.md` (deferred to `w1-exit-w2-handoff`).
