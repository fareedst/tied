# Async methodology glossary

**Scope:** TIED methodology terms for **asynchronous logic documentation** — not host-language async runtimes or product application features. Canonical source lives in `tied/vocab/`; clients receive a read-only snapshot under `tied/methodology/vocab/` via `copy_files.sh`.

**Traceability:** [REQ-TIED_ASYNC_METHODOLOGY], [REQ-ASYNC_REQ_ARCH_TEMPLATES], [REQ-ASYNC_PSEUDOCODE_CONTRACTS], [REQ-ASYNC_CHECKLIST_CATALOG], [ARCH-ASYNC_REQ_ARCH_CONTRACT], [ARCH-ASYNC_CONTRACT_GRAMMAR], [ARCH-ASYNC_CHECKLIST_INTEGRATION], [IMPL-ASYNC_VOCABULARY], [IMPL-ASYNC_REQ_ARCH_GUIDANCE], [IMPL-ASYNC_PSEUDOCODE_GRAMMAR], [IMPL-ASYNC_CHECKLIST_DISPOSITIONS].

**Proof boundary (mandatory):** TIED documents and statically checks **structural** async contracts (declared boundaries, contract rows, shared DATA declarations, termination claims). TIED does **not** prove freedom from deadlock, livelock, data races, fairness, or complete happens-before ordering unless a separately approved formal-methods scope exists.

**Related glossaries:** [pseudocode-and-citdp.md](pseudocode-and-citdp.md) (domain vocab vs IMPL grammar), [quality-assurance.md](quality-assurance.md) (evidence matrices, proof boundaries).

---

## Preferred terms vs synonyms

| Preferred | Demoted synonym | Notes |
|-----------|-----------------|-------|
| **async boundary** | async point, yield point | Where control may yield before completion |
| **async seam** | integration async, temporal decoupling | Composition binding with decoupled trigger/effect |
| **async contract** | async spec, concurrency notes | PRE/POST/EFFECTS/FAILURE_MODES/CONTROL/DATA_TRANSITION plus optional v1 rows |
| **await sequencing** | promise chain, step order | Documented order of awaited steps — not global scheduling |
| **message/event delivery** | pub/sub, IPC, callback | SEND, handlers, streams — not exactly-once unless proven elsewhere |
| **open wait** | long poll, subscription loop | Waits without fixed upper bound; requires TERMINATION or `may_diverge` |
| **pre-async-contract** | legacy async grace | N/A rationale for untouched legacy blocks without optional async rows |

---

## Seven semantic classes

Each class is a **distinct obligation**. One must never be inferred from another.

### 1. Await sequencing

| Field | Value |
|-------|-------|
| **Definition** | Which awaited operations must complete (success or named failure) before a later step runs, including continuation paths. |
| **Preferred IMPL rows** | `SEQUENCING:`, `CONTROL: ordering`, `AWAIT` steps, `EFFECTS: Async` |
| **REQ example** | "Subprocess stdout parsing shall complete before exit-code handling." |
| **ARCH example** | "Caller awaits spawn completion before reading session id from stream." |
| **Naming bridge** | REQ block `async_await_sequencing`; IMPL procedure steps; catalog column `Termination/order` (W2) |
| **Non-claim** | Does not prove global scheduling, fairness, or race-freedom. |

### 2. Message/event delivery

| Field | Value |
|-------|-------|
| **Definition** | Trigger, channel, delivery assumption, handler completion/ack behavior, duplicate/loss policy. |
| **Preferred IMPL rows** | `MESSAGE_CONTRACT:`, `SEND`, `ON` / `WHEN` handlers |
| **REQ example** | "NDJSON lines may arrive more than once; handler deduplicates by line identity." |
| **ARCH example** | "Subprocess stdout is at-least-once line delivery; parse errors log and continue." |
| **Naming bridge** | REQ `async_delivery`; IMPL `MESSAGE_CONTRACT`; composition `async_semantics` (W5) |
| **Non-claim** | Does not prove exactly-once delivery unless an independent runtime contract proves it. |

### 3. Cancellation

| Field | Value |
|-------|-------|
| **Definition** | Who may request cancellation and the DATA/POST outcome after cancellation. |
| **Preferred IMPL rows** | `CANCELLATION:`, cancellation POST in contract |
| **REQ example** | "Caller context cancel discards partial stream output." |
| **ARCH example** | "Context cancel propagates to subprocess; stderr goroutine joins on wait." |
| **Naming bridge** | REQ `async_cancellation`; IMPL `CANCELLATION:` row |
| **Non-claim** | Does not guarantee an already-running external operation can be physically stopped. |

### 4. Timeout

| Field | Value |
|-------|-------|
| **Definition** | Deadline, named failure mode, and whether timeout causes cancellation, retry, fallback, or return. |
| **Preferred IMPL rows** | `TIMEOUT:`, `FAILURE_MODES` |
| **REQ example** | "Agent subprocess shall fail with TIMEOUT_EXCEEDED after 30s." |
| **ARCH example** | "Wall-clock deadline applies to full executor_Run; no partial success POST on timeout." |
| **Naming bridge** | REQ `async_timeout`; IMPL `TIMEOUT: … → FAILURE_MODE` |
| **Non-claim** | Does not guarantee the provider honors the deadline. |

### 5. Retry/idempotency

| Field | Value |
|-------|-------|
| **Definition** | Retry count/backoff and idempotency or deduplication obligation for repeated execution or delivery. |
| **Preferred IMPL rows** | `RETRY:`, `IDEMPOTENCY:` |
| **REQ example** | "At-most two retries on timeout only; duplicate request_id must not double-charge DATA." |
| **ARCH example** | "Exponential backoff; idempotency key request_id with POST: one DATA transition." |
| **Naming bridge** | REQ `async_retry_idempotency`; IMPL `RETRY` + `IDEMPOTENCY` |
| **Non-claim** | Retries are not safe merely because they are declared — deduplication outcome must be named. |

### 6. Shared DATA

| Field | Value |
|-------|-------|
| **Definition** | DATA ownership, reads/writes across yields, DATA_TRANSITION, documented ordering edges. |
| **Preferred IMPL rows** | `DATA:`, `DATA_TRANSITION:`, `SEQUENCING:` / `CONTROL: ordering` |
| **REQ example** | "session_id captured from stream before process exit is visible to caller POST." |
| **ARCH example** | "Mutable session_id written only after first valid JSON line; DATA_TRANSITION named." |
| **Naming bridge** | REQ `async_shared_data`; cross-IMPL collision at Phase B |
| **Non-claim** | Does not prove absence of races or atomicity without runtime evidence. |

### 7. Termination/open wait

| Field | Value |
|-------|-------|
| **Definition** | Completion condition, unsubscribe/close path, or explicit `TERMINATION: may_diverge` rationale. |
| **Preferred IMPL rows** | `TERMINATION:`, stream close steps, unsubscribe |
| **REQ example** | "Stream read terminates when process exits; no indefinite open wait." |
| **ARCH example** | "Open read until process exit; TERMINATION: total on executor_Run." |
| **Naming bridge** | REQ `async_termination`; IMPL `TERMINATION:` row |
| **Non-claim** | Does not prove liveness, deadlock-freedom, or eventual delivery. |

---

## Optional v1 async contract rows (W1)

| Row | Purpose | Example shape |
|-----|---------|---------------|
| `ASYNC_BOUNDARY:` | Boundary kind | `ASYNC_BOUNDARY: await` |
| `TIMEOUT:` | Deadline → failure | `TIMEOUT: 30s → TIMEOUT_EXCEEDED` |
| `CANCELLATION:` | Actor → outcome | `CANCELLATION: caller → CANCELLED; POST: no state change` |
| `SEQUENCING:` | Documented local order | `SEQUENCING: PERSIST before NOTIFY` |
| `MESSAGE_CONTRACT:` | Delivery category | `MESSAGE_CONTRACT: at-least-once; handler deduplicates` |
| `RETRY:` | Retry policy | `RETRY: 2 attempts; timeout only; exponential backoff` |
| `IDEMPOTENCY:` | Dedup key / POST | `IDEMPOTENCY: request_id; POST: one DATA transition` |

`DATA`, `DATA_TRANSITION`, and `TERMINATION` remain authoritative for shared state and completion; optional rows **supplement** them.

**CONTROL: ordering** is the primary v1 vehicle when `SEQUENCING:` is omitted. A sequencing row documents an assumption; it does not establish global happens-before.

---

## Migration: pre-async-contract

Untouched legacy Active IMPL blocks without optional async rows remain valid. Authors may document Layer B N/A rationale **`pre-async-contract`** (parallel to `pre-contract-grammar`) until the block is next edited. New or changed async-marked blocks must declare applicable rows or explicit N/A per semantic class.

---

## Ownership

| Artifact | Owner layer |
|----------|-------------|
| This glossary | Methodology source `tied/vocab/` → client `tied/methodology/vocab/` |
| Project async REQ criteria | Client project `tied/requirements/` |
| IMPL async contract rows | Client project `tied/implementation-decisions/` sidecars |

---

## Checklist terms (W2)

| Preferred term | Meaning | Checklist slug |
|----------------|---------|----------------|
| **async_in_scope** | Tracker disposition: true when async detected in impact-discovery; records matched semantic classes; candidate trigger only — not inquiry activation | `impact-discovery` |
| **catalog-async-boundaries** | Phase B sub-procedure: closed eight-column catalog table per async-marked block | `catalog-pseudocode-contracts` |
| **flag-async-contradictions** | Async-specific insufficiency/contradiction flags; routes to `resolve-pseudocode` before RED | `flag-insufficient-specs`, `flag-contradictory-specs` |

---

## Cross-references

- Checklist: [agent-req-implementation-checklist.md](../docs/agent-req-implementation-checklist.md) § catalog-async-boundaries, flag-async-contradictions
- Authoring: [requirements.md](../docs/requirements.md) § Async acceptance criteria
- Architecture prompts: [architecture-decisions.md](../docs/architecture-decisions.md) § Async architecture decisions
- Grammar: [pseudocode-format-and-practices.md](../docs/pseudocode-format-and-practices.md) § Optional async contract rows
- Plan: [tied-async-methodology-plan.md](../../docs/tied-async-methodology-plan.md)
