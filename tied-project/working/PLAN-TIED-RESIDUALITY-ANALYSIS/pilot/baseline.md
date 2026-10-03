# Pilot baseline / naïve architecture

**Change ID:** `PLAN-TIED-RESIDUALITY-ANALYSIS` · **Wave:** W1 (build-plan workshop, 2026-09-27)

**Status:** Discovery baseline only — not canonical REQ/ARCH/IMPL.

## Candidate system boundary

- **Software:** Feature orchestration API (accepts create + task operations), task graph scheduler, durable queue, background worker pool, document store (task execution state, append-only evidence, request-key index, feature manifests).
- **Data:** Stable `task_id` per graph node; monotonic attempt/evidence ordering keys; explicit `request_key` + normalized fingerprint for idempotent create; source revision on each task tied to graph definition.
- **Human / operational (generic personas):** API client (automated retries), background worker (crash/restart), operator (cancel / inspect), on-call engineer (incident response), support (collision diagnosis, manual recovery guidance).

## Naïve architecture summary

A deliberately simple happy-path pipeline before full resilience hardening:

```text
API client ──► Orchestration API ──► Queue ──► Worker ──► Store
                     │                              │
                     └──────── read/write ──────────┘
Operators / support ──► read-only inspection + policy-gated cancel/recovery APIs
```

- **Create path:** Client supplies non-empty `request_key` → API acquires request-key lock → fingerprint normalized title + references → allocate feature id if absent → publish complete manifest → persist key metadata → release lock.
- **Execute path:** Scheduler marks tasks ready → worker claims message → loads task + source revision → runs side effects → **appends** evidence with outcome → updates execution status → dependency unlock only on satisfying completion predicate.
- **Retry path:** Client or scheduler re-delivers with same `task_id`; worker records new attempt without replacing prior evidence.
- **Assumed single region**, one primary store, client-driven retries, no cross-vendor contract stressors in this pilot scope.

## Assumptions (explicit)

1. Network partitions are rare; retries are client- or scheduler-driven with bounded backoff (not modeled in naïve form).
2. Store acknowledges durability on successful write; split-brain across two active writers is out of naïve scope but listed as a design stressor.
3. Operators and support can read evidence history and request-key metadata; manual recovery follows documented runbooks (quality of runbook is a human stressor).
4. Clocks are roughly synchronized; large skew is a listed stressor for evidence ordering.
5. Lock coordinator (request-key + task claims) is a dependency; its loss is a stressor, not hidden infrastructure.

## Read-only pilot REQ anchors

### `[REQ-FEAT_TASK_EXECUTION_RECOVERY]`

**Satisfaction criteria (summary):**

- Deterministic status and reason semantics per execution outcome.
- Retries/resumes preserve `task_id` and **append** evidence history.
- Stale input and cancellation **lock dependents** until explicit valid recovery.

**ARCH `[ARCH-FEAT_TASK_EXECUTION_STATE]`:** Versioned execution records; failed tasks do not satisfy dependencies; resume requires matching source revision or explicit stale recovery.

**IMPL `[IMPL-FEAT_TASK_EXECUTION_STATE]`:** `APPLY_EXECUTION_OUTCOME`, `RESUME_EXECUTION`; failure modes include `STALE_INPUT`, `ILLEGAL_TRANSITION`, `CANCELLATION_NOT_RESUMABLE`.

### `[REQ-FEAT_IDEMPOTENT_CREATION]`

**Satisfaction criteria (summary):**

- Reused request key + **different** normalized input → deterministic collision error.
- Concurrent creators serialize; **no partial manifest publish**.
- Same request key + same normalized request → existing feature without second allocation.

**ARCH `[ARCH-FEAT_IDEMPOTENT_CREATION]`:** Request-key lock, durable metadata, `REQUEST_KEY_COLLISION` on mismatch; depends on `[ARCH-FEAT_STORE_PERSISTENCE]`, `[ARCH-FEAT_IDENTIFIER_ALLOCATION]`.

**IMPL `[IMPL-FEAT_IDEMPOTENT_CREATE]`:** Lock → lookup → allocate → publish complete manifest → persist metadata; cleanup uncommitted reservation on publish failure.

## Capabilities derived for incidence matrix

| Capability ID | Description |
|---------------|-------------|
| C1 | Stable `task_id` across attempts |
| C2 | Append-only evidence history |
| C3 | Dependent lock on failure / stale / cancel |
| C4 | Deterministic status + reason |
| C5 | Request-key repeat (same fingerprint) |
| C6 | Request-key collision (divergent fingerprint) |
| C7 | Concurrent create serialization |
| C8 | Atomic manifest publication |
| C9 | Operator/support explainability (read evidence + key state) |

## Proof boundary (baseline doc)

This baseline supports **W1 discovery** only. It does not prove runtime behavior until W4 executable evidence and holdout validation stressors.
