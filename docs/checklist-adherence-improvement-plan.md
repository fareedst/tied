# Checklist Adherence Improvement Plan

**Status:** Stages G–L complete (2026-08-25); Stages M–N complete (2026-08-25 post–Stage L backlog); Stage O complete (2026-08-25). The original G–L improvement sequence is closed; remaining deferred work (Stages P–Q) lives in [`docs/checklist-adherence-remaining-work-plan.md`](checklist-adherence-remaining-work-plan.md).
**Scope:** Producer-side Tracker state and its integration with existing TIED checklist gates
**Primary tokens:** `[REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]`, `[ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT]`, `[IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT]`, `[REQ-TIED_ADVERSARIAL_INQUIRY]`, `[ARCH-TIED_ADVERSARIAL_INQUIRY]`, `[IMPL-TIED_ADVERSARIAL_INQUIRY]`, `[IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST]`, `[PROC-AGENT_REQ_CHECKLIST]`, `[PROC-TIED_VERIFICATION_GATED]`, `[PROC-TOKEN_AUDIT]`, `[PROC-TOKEN_VALIDATION]`
**Motivation:** Client `1787626480` claimed checklist completion, but the authoritative checklist evidence gate returned `tracker_sparse` and `missing_required_step:sub-adversarial-inquiry-pass`.

## 0. Refine and plan gates

### Resolved terms

| Sponsor wording | Canonical meaning |
|---|---|
| tracker | **Authoritative Tracker**: a persisted, per-request state artifact supplied to `tied_checklist_gate_validate`; not the canonical checklist definition and not a synthetic projection |
| tracker writer | **Tracker writer**: the agentstream component that validates a **Tracker completion receipt** and atomically updates exactly one per-request Tracker step |
| checklist completion | A non-pending **Tracker disposition** with its disposition-specific evidence contract; `execution_evidence.completed` is only a derived compatibility summary |
| gate result | Raw output from the **checklist evidence gate**; distinct from the adversarial inquiry phase artifact named `gate-result.json` |
| activation evidence | **Integrated activation evidence**: one successful inquiry receipt paired with all four identity-bound artifacts for the same request, project, run, phase, scope, and hashes |
| phase artifacts | Exactly the four bounded files under a **phase artifact directory**: `obligation-report.json`, `finding-ledger.jsonl`, `gate-result.json`, and `evidence-provenance.json` |
| advisory | Finding policy only; it never permits missing Tracker dispositions, missing activation pairing, stale evidence, or status mutation before a successful checklist gate |
| adherence ledger | Append-only `agent-adherence-event.v1` JSONL storing six lifecycle event classes; distinct from **evidence chain profile** |
| adherence event class | One of `instruction_rendered`, `agent_acknowledged`, `action_attempted`, `outcome_verified`, `gate_decided`, `status_mutated`; governed by non-implication rules |
| instruction binding | Per-turn `instruction_nonce` + `instruction_hash` tying rendered prompt bytes to Tracker completion receipt |
| evidence ref resolution | **`RESOLVE_EVIDENCE_REFS`**: machine verification of each `evidence_refs[]` entry before accepting a `completed` disposition; distinct from gate-time optional validators |
| resolved evidence ref | One successfully resolved entry with recorded `artifact_hash`; input ref string plus kind and hash stored for ledger correlation |
| generic prose ref | Non-path evidence string matching denylist patterns (e.g. "tests passed", "build ok", single words without path separators); fails with `unresolved_evidence_ref` |
| outcome_verified event | Adherence ledger row (`event_class: outcome_verified`) appended after successful ref resolution; records `artifact_ref` + `artifact_hash` per resolved ref |
| manifest ref | `evidence_refs[]` entry pointing to a file with `schema_version: verification-evidence-manifest.v1`; all `command_results[].exit_code` must be `0` |

Vocabulary ownership and names are defined in `tied/vocab/agentstream.md`, `tied/vocab/fidelity-research.md`, and `tied/vocab/quality-assurance.md`. No new REQ/ARCH/IMPL token is required for this plan: the producer behavior completes the existing machine-enforced checklist evidence contract; the evidence-chain blocks extend `[IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT]`. Stages G–L are complete; optional integrations remain deferred.

### Depth and gate policy

| Context | `depth_tier` | `gate_policy` | `profile_depth` | Reason |
|---|---|---|---|---|
| This Stage H refine-plan pass (documentation only) | `minimal` | `advisory` | `not_measured` | Expands plan doc and vocabulary; no production code |
| Stage G build-plan (committed) | `integrated` | `advisory` | Selected independently if measured | Instruction binding, FinalText separation, adherence ledger `instruction_rendered` / `agent_acknowledged` |
| **Stage H build-plan (committed)** | **`integrated`** | **`advisory`** | Selected independently if measured | **`RESOLVE_EVIDENCE_REFS`**, `outcome_verified` ledger rows, fake-agent fixture hardening |
| Stages I–L build-plans (after H) | `integrated` | `advisory` | Selected independently if measured | Tracker hardening, gate/status receipts, reconciliation, pilot; J/K depend on H resolved refs |

For this refine pass, `sub-adversarial-inquiry-pass` is `not_applicable` with policy and rationale in the per-request Tracker. The Stage H build-plan must run distinct integrated inquiry passes at `pre_implementation`, `verification`, and `close_out`.

### Workflow artifacts

- Per-request Tracker (Stage H refine-plan): `working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/stage-h-evidence-resolution-refine_20260825.yaml`
- Per-request Tracker (Stage H build-plan, at build-plan time): `working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/stage-h-evidence-resolution_YYYYMMDD.yaml`
- Per-request Tracker (Stage G build-plan, committed): `working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/stage-g-instruction-binding_20260825.yaml`
- CITDP (extend at Stage H build-plan): `working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/CITDP-REQ-TIED_CHECKLIST_GATE_ENFORCEMENT-stage-h.yaml` (new or extend tracker-writer draft with evidence-resolution change definition)
- Prior CITDP draft: `working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/CITDP-REQ-TIED_CHECKLIST_GATE_ENFORCEMENT-tracker-writer-draft.yaml`
- Refine-plan gate receipt (this pass): `working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/gate-stage-h-refine-pre-implementation.json`
- Stage H build-plan must run `tied_checklist_gate_validate` with `phase: pre_implementation` at **`integrated`** depth before RED tests.

### Refine-plan gate result (2026-08-25, Stage H refine)

Raw `tied_checklist_gate_validate` output for `phase: pre_implementation` with the Stage H refine Tracker and CITDP draft:

- `allowed: true`, `blocking: false`, `depth: minimal`, `diagnostics: []`
- Receipt: `working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/gate-stage-h-refine-pre-implementation.json`
- At minimal depth the gate auto-requires only `sub-adversarial-inquiry-pass` (as `not_applicable` with policy/rationale); pending implementation steps such as `unit-test-red` are out of scope for this documentation-only pass and do not block pre-implementation progression.
- Vocabulary RECORD/VALIDATE: Stage H terms in §0 recorded in `tied/vocab/agentstream.md` and `tied/vocab/quality-assurance.md`; no new REQ/ARCH/IMPL token required.

## 1. Current state and confirmed gap

### Already implemented — consumer side

- `mcp-server/src/checklist-validator.ts` reads `steps`, accepts only `pending`, `completed`, `not_applicable`, or `waived`, requires evidence by disposition, derives phase-aware slugs, rejects sparse/synthetic Trackers, and validates activation pairing.
- `mcp-server/src/verify.ts` rejects status updates without `checklist_gate` and calls `validateChecklistGate` before writing REQ/IMPL status.
- `mcp-server/src/feature-orchestration/commands.ts` blocks gated lifecycle commands when the shared validator rejects their evidence.
- Existing acceptance tests prove `tracker_sparse`, `tracker_not_authoritative`, activation, provenance, finding, freshness, waiver, and close-out diagnostics (A6/A7 in `checklist-validator.test.ts`; A9 in `verify.test.ts`).

### Already implemented — producer side (Tracker writer Stages B–E)

| Capability | Status | Evidence |
|---|---|---|
| Authoritative Tracker materialization incl. `sub-adversarial-inquiry-pass` | **done** | `tools/agentstream/checklist/tracker.go` — `MaterializeAuthoritativeTracker`, `EnsureTracker` |
| Strict `agentstream_tracker` receipt parse (latest fenced JSON wins) | **done** | `tools/agentstream/checklist/tracker_receipt.go` |
| Atomic disposition write + idempotent/conflicting replay | **done** | `tools/agentstream/checklist/tracker_writer.go` — `ApplyTrackerDisposition` |
| Loop-back downstream invalidation on `goto` | **done** | `InvalidateTrackerDownstream`, wired in `tools/agentstream/cmd/agentstream/main.go` |
| Runner blocks turn N+1 without valid receipt | **done** | `main.go`, `tools/agentstream/cmd/agentstream/tracker_composition_test.go` |
| Go→TS gate fixture composition | **done** | `tools/agentstream/checklist/tracker_gate_fixture_test.go` + TypeScript tests |

### Remaining producer/test gaps — **historical (superseded by G–L, 2026-08-25)**

The rows below predated Stages G–L and are retained for archaeology only. Stage I closed identity-mismatch, `not_applicable`/`waived` writer, and goto invalidation test debt; Stage G closed thinking-stream receipt separation.

| Former gap claim | Superseded by |
|---|---|
| `ValidateTrackerIdentity` request-token mismatch untested | Stage I — identity mismatch tests |
| `ApplyTrackerDisposition` for `not_applicable` / `waived` writer untested | Stage I — writer apply tests |
| `clearCloseOutGateSummaries` on loop-back untested | Stage I — goto composition test |
| No E2E for `goto` invalidation | Stage I — `fake_tracker_goto_agent.rb` composition |
| Receipt scans combined thinking + assistant transcript | Stage G — `FinalText` separation (A14) |
| No adversarial-inquiry sub turn | **Open — optional Stage Q** (remaining-work plan) |

### Remaining evidence-chain gaps — **historical (superseded by G–L + M–N, 2026-08-25)**

The six stage names below were **design targets** before Stages G–L shipped. They are **orthogonal** to `[REQ-EVIDENCE_CHAIN_PROFILE]` / `evidence-chain-profile.v1`. Post–Stage M/N, live `action_attempted` capture and operator reconcile CLI/MCP are **done**; see remaining-work plan for Stage O–Q deferrals.

```mermaid
flowchart LR
  IR[instruction_rendered] --> AA[agent_acknowledged]
  AA --> AT[action_attempted]
  AT --> OV[outcome_verified]
  OV --> GD[gate_decided]
  GD --> SM[status_mutated]
  IR -.->|"non-implication"| AA
  AA -.->|"non-implication"| AT
  AT -.->|"non-implication"| OV
  OV -.->|"non-implication"| GD
  GD -.->|"non-implication"| SM
```

| Stage | Former gap (pre–G–L) | Status after G–L / M–N |
|---|---|---|
| `instruction_rendered` | No instruction hash persisted | **Done** — Stage G `RENDER_INSTRUCTION_EVIDENCE` |
| `agent_acknowledged` | No machine verification | **Done** — Stage G ledger + receipt binding |
| `action_attempted` | Hooks not wired; no attempt ledger | **Done** — Stage M live capture + hook bridge |
| `outcome_verified` | `RESOLVE_EVIDENCE_REFS` not wired | **Done** — Stage H resolution + ledger rows |
| `gate_decided` | Gate JSON not auto-persisted | **Done** — Stage J `PERSIST_GATE_DECISION_RECEIPT` |
| `status_mutated` | No post-mutation receipt | **Done** — Stage J `PERSIST_STATUS_MUTATION_RECEIPT` |

Operator reconcile: **Done** — Stage K library + Stage N CLI/MCP (`tied_adherence_reconcile_run`). Migration preview and operator doc: **Done** — Stage O (`PreviewTrackerMigration`, [`docs/checklist-adherence-remaining-work-plan.md`](checklist-adherence-remaining-work-plan.md)). Optional deferrals: evidence hardening (Stage P), rollout depth (Stage Q).

## 2. Change definition

### Achieved behavior (Tracker producer Stages B–E)

For each lead-checklist Turn, agentstream now:

1. materializes or validates a per-request **Authoritative Tracker** including `sub-adversarial-inquiry-pass`;
2. renders a strict **Tracker completion receipt** contract in the turn prompt;
3. parses the receipt from the captured assistant transcript;
4. validates slug, disposition contract, and replay identity;
5. atomically updates exactly one Tracker step;
6. refuses to advance when the receipt is missing, malformed, stale, mismatched, or unsupported;
7. clears downstream dispositions and evidence on a validated `goto`;
8. produces Tracker state consumable by the existing checklist evidence gate and `tied_verify` without a synthetic adapter.

### Remaining evidence controls (Stages G–L)

1. **Instruction binding** — hash rendered turn bytes, issue per-turn `instruction_nonce`, append `instruction_rendered` events before subprocess.
2. **Final-text separation** — parse receipts from final assistant text only; exclude thinking stream.
3. **Receipt hardening** — bind `instruction_nonce`, `instruction_hash`, `request_token`, and `run_id` in `agentstream_tracker` schema.
4. **Evidence ref resolution** — resolve `evidence_refs[]` to files, manifests, or command receipts before accepting `completed`.
5. **Durable gate/status receipts** — persist `tied_checklist_gate_validate` and `tied_verify` mutation receipts with input hashes.
6. **Adherence ledger and reconciliation** — append-only `agent-adherence-event.v1` JSONL and read-only reconciliation findings.

### Current behavior (pre-evidence-chain)

A lead-checklist run can still advance on a valid receipt without proving that observed actions match declared evidence, that gate decisions were persisted, or that status mutations reference the gate chain. Operators may supply generic prose in `evidence_refs` that the writer accepts but the evidence chain cannot verify.

### Unchanged behavior

- The canonical checklist remains a read-only procedure definition.
- `agentstream_control` remains the routing protocol; completion state is a separate envelope.
- The shared TypeScript validator remains the authority for progression.
- `tied_verify` remains the only status-promotion writer and revalidates its `checklist_gate` payload before mutation.
- Advisory inquiry does not mutate canonical TIED YAML and only confirmed findings may trigger LEAP.
- Legacy full checklist copies and Trackers without adherence events remain readable during migration.

### Non-goals

- Reimplementing activation pairing, evidence provenance, or finding lifecycle in Go.
- Treating `execution_evidence.completed`, token presence, TIED consistency, or prose as completion evidence.
- Automatically marking a step complete from subprocess exit code alone.
- Making every adversarial finding blocking.
- Adding UI/E2E coverage where unit and process-composition tests can prove the behavior.
- Retrofitting or promoting statuses in existing client Trackers.
- Merging `agent-adherence-event.v1` into `evidence-chain-profile.v1`.
- Elevating hook transport success to product/checklist success.
- Editing Stages G–L production code in this build-plan pass.

## 3. Authoritative contracts

### 3.1 Checklist definition versus Authoritative Tracker

The canonical file `tied/docs/agent-req-implementation-checklist.yaml` is the checklist definition. A generated per-request Tracker is the mutable state artifact.

The Tracker uses a top-level `steps` collection containing one unique row for every executable main step and every gate-governed sub-procedure. In particular, `sub-adversarial-inquiry-pass` must be materialized as a state row even though its procedure body remains under `sub_procedures` in the definition.

Each Tracker step must contain:

- `slug`;
- `kind` (`main` or `sub_procedure`);
- `disposition` (`pending`, `completed`, `not_applicable`, or `waived`);
- `evidence_refs` for `completed`;
- `policy` and `rationale` for `not_applicable`;
- `owner`, `expiry`, `approval`, and `residual_risk` for `waived`;
- `updated_at`, source turn identity, and receipt hash for audit/replay protection.

`execution_evidence.completed` may be regenerated from `steps` for compatibility, but it is never an input to disposition authority. New writer output uses `disposition`; the gate may continue accepting legacy `status` and `tracking.status` during the migration window.

### 3.2 Tracker completion receipt

Each successful lead-checklist Turn must end with one strict fenced JSON envelope:

```json
{
  "agentstream_tracker": {
    "schema_version": 1,
    "slug": "change-definition",
    "disposition": "completed",
    "evidence_refs": ["working/REQ-X/change-definition.md"],
    "instruction_nonce": "550e8400-e29b-41d4-a716-446655440000",
    "instruction_hash": "sha256:…",
    "request_token": "REQ-X",
    "run_id": "20260824-pre-implementation"
  }
}
```

**Schema v1 (current):** `schema_version`, `slug`, `disposition`, and disposition-specific evidence fields.

**Schema v1 extension (design; Stage G):** add required `instruction_nonce`, `instruction_hash`, `request_token`, and `run_id` with a migration window where v1 without binding fields remains accepted for legacy runs only.

Rules:

- prose and subprocess success never imply completion;
- the receipt slug must equal the current `StepStub`;
- `completed`, `not_applicable`, and `waived` use the same evidence contracts as `validateTracker`;
- generic `skipped` is invalid;
- unknown fields are rejected for schema version 1;
- a byte-equivalent replay is idempotent; a conflicting replay for the same turn identity fails;
- when `agentstream_control.action` is `goto`, the runner applies loop-back invalidation and does not require the current step to be marked complete;
- **receipt parse source (Stage G):** parse from **final assistant text only**; receipts found only in the thinking stream are rejected;
- **binding rejection (Stage G):** reject missing receipt, multiple valid receipts, stale `instruction_nonce`, copied `instruction_hash` from a prior turn, or binding fields that do not match the issued instruction for the current turn.

**Executor separation (design only):**

```go
// tools/agentstream/executor/executor.go — proposed RunResult buckets
type RunResult struct {
  SessionID    string
  FinalText    string // assistant message.content text only — receipt scan target
  ThinkingText string // optional; excluded from receipt scan
  Transcript   string // full audit trail
}
```

### 3.3 Tracker writer

The writer must:

1. refuse the canonical checklist path as a writable target;
2. materialize a per-request Tracker from the canonical definition when explicitly requested;
3. initialize every step to `pending` and clear inherited completion/gate evidence;
4. merge the validated receipt into exactly one matching step;
5. append bounded state history without duplicating an idempotent replay;
6. write through a same-directory temporary file, `fsync`/close, and atomic rename;
7. leave the prior Tracker byte-valid and unchanged on parse, validation, or write failure;
8. preserve unrelated Tracker fields;
9. recompute any compatibility summary only after the authoritative step write succeeds.

### 3.4 Loop-back invalidation

`loop_back_clearance.<target>.clear_slugs` governs state invalidation. A validated `goto` sets every listed Tracker row to `pending` and clears disposition evidence, waiver fields, gate receipts, and downstream derived summaries before the queue is replaced.

The checklist definition is never mutated. A missing clear target, missing state row, or failed atomic write blocks routing.

### 3.5 Gate and status ordering

The completion pipeline order is:

1. unit and composition tests;
2. language-specific build and lint;
3. integrated inquiry for the current phase when selected;
4. activation collection from the matching phase directory;
5. `tied_checklist_gate_validate` for `verification`;
6. `tied_verify` with the same current Tracker/CITDP/activation inputs so it revalidates before status mutation;
7. `tied_validate_consistency`;
8. vocabulary and token audit;
9. distinct close-out inquiry or valid close-out inquiry waiver;
10. `tied_checklist_gate_validate` for `close_out`;
11. close-out publication.

This corrects the earlier order that placed `tied_verify` before checklist validation.

### 3.6 Integrated activation and persisted evidence

For each integrated phase, use a distinct `run_id`. Persist only these four files inside:

`working/{REQ-TOKEN}/adversarial-inquiry/phase-{phase}/`

- `obligation-report.json`
- `finding-ledger.jsonl`
- `gate-result.json`
- `evidence-provenance.json`

The activation collector output and raw checklist evidence gate output are receipts outside the phase artifact directory, for example under `working/{REQ-TOKEN}/gates/`. The inquiry `gate-result.json` is not the checklist evidence gate receipt.

The root `adversarial-inquiry/` projection is convenience-only and cannot satisfy phase pairing. Receipt identity, phase, scope, scope hash, and artifact hashes must match. Verification evidence cannot be reused as close-out activation.

### 3.7 Advisory versus blocking

The checklist evidence gate always fails closed for malformed or missing process evidence, regardless of `gate_policy`.

Under advisory policy:

- valid process evidence may carry non-blocking findings;
- every finding must be triaged to a lifecycle state and either dismissed, deferred/routed with owner, accepted as residual risk with approval/expiry, or confirmed;
- only confirmed findings route through the owning checklist step and can trigger LEAP;
- warning labels are not proof of successful activation.

Strict blocking remains limited to strict-eligible, explicitly approved scope.

### 3.8 Evidence lifecycle (provable controls)

Before each checklist turn in `tools/agentstream/cmd/agentstream/main.go`:

1. **Instruction binding** — hash rendered `t.Parts` → `instruction_hash`; issue per-turn `instruction_nonce`; append `instruction_rendered` event to `working/{REQ-TOKEN}/adherence/events.jsonl`.
2. **Receipt hardening** — extend `agentstream_tracker` with binding fields (§3.2); parse from `FinalText` only.
3. **Evidence ref resolution** — when disposition is `completed`, resolve each `evidence_refs[]` entry:
   - **File path** → must exist; hash recorded in `outcome_verified`.
   - **Manifest reference** → must match `verification-evidence-manifest.v1` (`tied/docs/quality-evidence-manifest.md`); `exit_code != 0` rejected.
   - **Generic prose** ("tests passed") → reject at writer or pre-gate validator.
   Reuse gate helpers: `validateCommandEvidence`, `validateProvenanceComplete`, `validateEvidenceFreshness` in `mcp-server/src/checklist-validator.ts`.
4. **Gate and status receipts** — persist raw `tied_checklist_gate_validate` JSON to `working/{REQ-TOKEN}/gates/{phase}-{timestamp}.json` with input Tracker/CITDP hash; persist `tied_verify` dry_run/apply result with `previous_status` → `next_status` map and gate receipt pointer; reconciliation compares ledger `status_mutated` rows to canonical TIED YAML indexes.
5. **Hook integration (reference only, bounded proof)** — document proof boundaries for `.cursor/hooks/log.rb`:
   - `postToolUse` / `afterShellExecution` / `afterMCPExecution` → candidate `action_attempted` sources.
   - Hook transport success ≠ product success.
   - Hooks are **supplementary**; runner-observed commands remain authoritative for checklist evidence.

## 4. Module boundaries and impact

| Module | Responsibility | Files | Independent validation |
|---|---|---|---|
| Tracker materializer | Convert checklist definition to clean per-request state; include gate-governed sub-procedures | `tools/agentstream/checklist/tracker.go` | Go unit tests — **done** |
| Receipt parser | Parse and validate `agentstream_tracker` without changing routing semantics | `tools/agentstream/checklist/tracker_receipt.go` | Table and binding tests — **done** (Stage G) |
| Atomic Tracker writer | Apply one receipt or loop-back invalidation without corrupting state | `tools/agentstream/checklist/tracker_writer.go` | Temp-directory, disposition, and invalidation tests — **done** |
| Runner composition | Connect executor transcript → receipt parser → writer before advancing; route `goto` through Tracker invalidation | `tools/agentstream/cmd/agentstream/main.go`, `tools/agentstream/config/` | Fake-agent composition and goto invalidation — **done** |
| Gate compatibility | Prove writer output is accepted/rejected by the existing shared gate and by `tied_verify` dry-run | `mcp-server/src/checklist-validator.test.ts`, `mcp-server/src/verify.test.ts` | TypeScript contract tests — **done** |
| Executor | Separate final vs thinking text for receipt scan | `tools/agentstream/executor/executor.go` | `executor_test.go` — **done** (Stage G) |
| Adherence ledger | Append-only JSONL writer for six event classes | **new** `tools/agentstream/checklist/adherence_ledger.go` | Instruction, outcome, and acknowledgment rows — **done**; reconciliation — **done** |
| Evidence resolver | Resolve refs → manifests/artifacts | **new** `tools/agentstream/checklist/evidence_resolve.go` + TS hook in validator | Writer + validator rejection — **done** (Stage H) |
| Reconciliation | Read-only adherence chain report | **new** `tools/agentstream/checklist/adherence_reconcile.go` or MCP read tool | Table-driven finding codes and pilot report — **done** (Stage K/L) |
| Gate/status receipts | Persist gate and verify decisions | extend `mcp-server/src/verify.ts`, gate callers | `verify.test.ts` fixtures and durable receipts — **done** (Stage J) |
| Procedure and operator docs | Define Tracker path, receipt contract, adherence ledger, migration | `tools/agentstream/README.md`, this plan | Static contract tests — Stage F partial |
| TIED logic | Producer + evidence-chain Active blocks | `[IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT]` pseudo-code sidecar/detail | `pseudocode_validate`, `tied_validate_consistency` |
| Vocabulary | RECORD adherence ledger and event-class terms | `tied/vocab/agentstream.md`, `tied/vocab/quality-assurance.md` | `[PROC-VOCABULARY_INDEX]` VALIDATE |

No UI boundary exists; E2E is not required. The fake `cursor agent` subprocess test is a process-composition test, not UI E2E.

## 5. Implementation sequence

### Stage A — LEAP and pseudo-code gate (**complete for producer; extended for evidence chain**)

1. Extend `[IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT]` with token-commented Active blocks:
   - Producer (implemented): `MATERIALIZE_AUTHORITATIVE_TRACKER`, `PARSE_TRACKER_COMPLETION_RECEIPT`, `APPLY_TRACKER_DISPOSITION`, `INVALIDATE_TRACKER_DOWNSTREAM`, `COMPOSE_TRACKER_WITH_CHECKLIST_GATE`
   - Evidence chain (this build-plan): `RENDER_INSTRUCTION_EVIDENCE`, `SEPARATE_FINAL_ASSISTANT_TEXT`, `BIND_RECEIPT_TO_INSTRUCTION`, `RESOLVE_EVIDENCE_REFS`, `PERSIST_GATE_DECISION_RECEIPT`, `PERSIST_STATUS_MUTATION_RECEIPT`, `RECONCILE_ADHERENCE_CHAIN`
2. Add PRE/POST/EFFECTS, failure modes, state transitions, and termination contracts.
3. Update IMPL code locations/tests through TIED YAML tooling.
4. RECORD finalized names in vocabulary.
5. Run pseudo-code validation. **Stage G RED unblocked after pseudocode_validate passes.**

### Stage B — RED: materializer and receipt parser (**complete**)

Implemented with Go unit tests: materialization inventory, path refusal, receipt schema/disposition table tests, idempotent/conflicting replay.

**Residual test debt:** ~~see Stage I~~ — **Stage I complete (2026-08-25).**

### Stage C — RED: atomic write and loop-back state (**complete**)

Implemented with temp-directory tests, idempotency, write-failure doubles, and loop-back invalidation code.

**Residual test debt:** ~~`not_applicable`/`waived` writer tests; `clearCloseOutGateSummaries` test — see Stage I~~ — **Stage I complete (2026-08-25).**

### Stage D — RED: runner composition (**complete**)

Fake-agent composition tests prove receipt-before-turn-N+1, malformed receipt exit, and canonical checklist byte preservation.

**Residual test debt:** ~~goto invalidation composition — see Stage I~~ — **Stage I complete (2026-08-25).**

### Stage E — RED: shared gate/status composition (**complete**)

Go-emitted Tracker fixtures consumed by TypeScript `validateChecklistGate` and `tied_verify` dry-run tests.

### Stage F — Documentation, rollout, and verification (**partial**)

1. Writable Tracker argument documented in `tools/agentstream/README.md` — **done**.
2. Legacy gate reads of `status`/`tracking.status` preserved — **done**.
3. Materialize/migrate preview for old copies — **partial**.
4. Controlled-client pilot — **done** (Stage L).
5. Methodology refresh via `copy_files.sh` — ongoing operator step.
6. Full test/lint/validation — **done** for Stages G–L.
7. Stop rollout conditions defined — see Stage L.

### Stage G — complete: instruction render + receipt binding (committed)

**Committed baseline (2026-08-25):**

- `tools/agentstream/checklist/adherence_ledger.go`: `AppendInstructionRendered`, `AppendAgentAcknowledged`
- `tools/agentstream/executor/executor.go`: `RunResult` with `FinalText` / `ThinkingText` / `Transcript`
- `tools/agentstream/checklist/tracker_receipt.go`: binding fields + `ValidateReceiptBinding`
- `tools/agentstream/cmd/agentstream/main.go` `handleTrackerTurn`: binding before `ApplyTrackerDisposition`; **no evidence ref resolution yet**
- `tools/agentstream/checklist/evidence_resolve.go`: **does not exist** (planned in IMPL pseudo-code only)
- Pseudo-code `RESOLVE_EVIDENCE_REFS` exists in `tied/implementation-decisions/IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT-pseudocode.md`

**Tests (RED → GREEN, committed):**

- `tools/agentstream/executor/executor_binding_test.go`: thinking excluded from receipt scan; receipt in thinking-only stream fails.
- `tools/agentstream/checklist/tracker_receipt_test.go`: nonce/hash mismatch, stale nonce, missing binding fields.
- `tools/agentstream/cmd/agentstream/tracker_composition_test.go`: `instruction_rendered` JSONL row written before subprocess.

Evidence-supported acceptance rows: **A13, A14, and A15 complete.** **A16 complete** (Stage H, 2026-08-25).

### Stage H — complete: evidence ref resolution (2026-08-25)

#### Change definition

| Aspect | Detail |
|---|---|
| **Current** | `completed` dispositions accept any non-empty `evidence_refs[]` string. Parser requires non-empty refs but does not verify existence or content. Fake agent emits paths like `working/REQ-TEST/step.md` without creating files. Writer tests use placeholder paths that need not exist on disk. |
| **Desired** | `RESOLVE_EVIDENCE_REFS` runs after `BIND_RECEIPT_TO_INSTRUCTION` and before `APPLY_TRACKER_DISPOSITION` when disposition is `completed`. Each ref is classified, resolved, and hashed. On success append `outcome_verified` ledger rows. On failure return error **before** Tracker write. Generic prose and unresolvable refs fail with `unresolved_evidence_ref`. |
| **Unchanged** | Shared TypeScript gate remains progression authority for phase-aware slugs, activation pairing, and disposition contracts. Non-`completed` dispositions skip ref resolution. Instruction binding and receipt parse order from Stage G unchanged. |
| **Non-goals (Stage H)** | Full `command_evidence` JSON-in-string resolution (document boundary; defer complex cases). TS-side duplicate resolution in `validateTracker` (Option A below). Reconciliation report (Stage K). Gate/status receipt persistence (Stage J). |

#### Ref kind taxonomy (normative)

| Ref kind | Pattern / detection | Resolution rule |
|---|---|---|
| `file_path` | Relative path under workspace root; contains `/` or file extension; not whitespace-only prose | Must exist on disk relative to workspace; record `sha256:` content hash |
| `manifest_ref` | Path ending in `.json` or `.yaml` whose parsed document has `schema_version: verification-evidence-manifest.v1` | Parse manifest; every `command_results[].exit_code` must be `0`; record manifest file hash |
| `command_evidence` | JSON object or structured map embedded in ref (e.g. fenced JSON or `command_evidence:` prefix) | Align with `validateCommandEvidence` semantics: `claimed_success: true` requires `manifest_ref`, output ref, and `exit_code`. **Stage H boundary:** defer inline JSON refs unless trivially detectable; document as follow-up if RED tests do not require them |
| `generic_prose` | Denylist patterns: case-insensitive phrases such as `tests passed`, `build ok`, `done`, `success`; single tokens without `/`; strings with only spaces | Reject with `unresolved_evidence_ref`; never write Tracker or ledger |

Detection order: trim ref → if matches generic prose denylist → reject; else if path exists and parses as manifest → `manifest_ref`; else if path exists → `file_path`; else if structured command evidence → `command_evidence` (deferred boundary); else → `unresolved_evidence_ref`.

#### Wire point (`main.go`)

In `handleTrackerTurn`, after `ValidateReceiptBinding` and **before** `ApplyTrackerDisposition`:

```go
if receipt.Disposition == "completed" {
    resolved, err := checklist.ResolveEvidenceRefs(receipt, cfg.Workspace)
    if err != nil {
        return err // blocks turn; Tracker unchanged
    }
    if strings.TrimSpace(cfg.AdherenceLedger) != "" {
        for _, r := range resolved {
            if err := checklist.AppendOutcomeVerified(cfg.AdherenceLedger, correlation, r); err != nil {
                return err
            }
        }
    }
}
// then ApplyTrackerDisposition ...
// then AppendAgentAcknowledged (existing Stage G)
```

Ordering invariant: `instruction_rendered` (pre-subprocess) → receipt parse + binding → **evidence resolution + `outcome_verified`** → Tracker write → `agent_acknowledged`.

#### New Go module: `tools/agentstream/checklist/evidence_resolve.go`

```go
type ResolvedRef struct {
    Ref          string // original evidence_refs entry
    Kind         string // file_path | manifest_ref | command_evidence
    ArtifactHash string // sha256:… of resolved artifact or manifest file
}

func ResolveEvidenceRefs(receipt CompletionReceipt, workspace string) ([]ResolvedRef, error)
```

Reuse manifest shape from `tied/docs/quality-evidence-manifest.md`. Failure modes align with IMPL pseudo-code: `unresolved_evidence_ref`, `manifest_exit_nonzero`, `missing_artifact`.

#### New ledger method: `AppendOutcomeVerified`

Add to `tools/agentstream/checklist/adherence_ledger.go`:

- `event_class: outcome_verified`
- Correlation: existing `InstructionCorrelation` fields plus `receipt_hash` when available
- Payload: `artifact_ref` (original ref or resolved path), `artifact_hash`, `ref_kind`
- Append-only; same `appendLedgerRow` path as Stage G events

#### TypeScript boundary (Stage H)

**Option A (preferred):** Go producer rejects bad refs before Tracker write. `validateTracker` in `mcp-server/src/checklist-validator.ts` remains unchanged for path-string `evidence_refs` (non-empty check only). Gate composition test proves Go-emitted Tracker whose refs were resolved at write time still passes the shared gate. Rationale: single authoritative resolution at producer boundary avoids duplicate filesystem logic in TS and matches fail-closed writer semantics.

**Option B (deferred):** Add `validateTrackerEvidenceRefs` in `checklist-validator.ts` mirroring Go taxonomy. Only choose if composition tests show gate accepts unresolved refs from non-agentstream producers. Document choice in CITDP at build-plan time.

Existing TS helpers remain gate-time optional validators only: `validateCommandEvidence`, `validateProvenanceComplete`, `validateEvidenceFreshness` — not invoked for per-step `evidence_refs[]` strings today.

#### Fake agent update

`tools/agentstream/cmd/agentstream/testdata/fake_tracker_agent.rb` must emit `evidence_refs` pointing to **real** files:

- Composition test creates temp evidence files under the test workspace before subprocess.
- Or use a checked-in manifest fixture at e.g. `tools/agentstream/checklist/testdata/verification-evidence-manifest-pass.json` with `schema_version: verification-evidence-manifest.v1` and all `exit_code: 0`.

Remove reliance on non-existent `working/REQ-TEST/#{step}.md` paths without fixture creation.

#### Stage H test matrix (RED first)

| Test file | Target | Cases |
|---|---|---|
| `tools/agentstream/checklist/evidence_resolve_test.go` | `ResolveEvidenceRefs` table | `file_path` ok + missing file; `manifest_ref` ok + nonzero exit; `generic_prose` rejected (`tests passed`, `build ok`, single word); empty workspace-relative path |
| `tools/agentstream/checklist/tracker_writer_test.go` or `main` integration | Write guard | `completed` with unresolvable ref fails **before** Tracker mutation; prior Tracker bytes unchanged |
| `tools/agentstream/checklist/adherence_ledger_test.go` | `AppendOutcomeVerified` | Schema: `event_class`, correlation fields, `artifact_ref`, `artifact_hash`, `ref_kind` |
| `tools/agentstream/cmd/agentstream/tracker_composition_test.go` | End-to-end slice | Temp evidence file + manifest fixture; subprocess completes; ledger contains `outcome_verified` row with matching hash |
| `tools/agentstream/checklist/tracker_gate_fixture_test.go` | Go→TS composition | Go-emitted Tracker with resolved refs passes `validateChecklistGate` minimal fixture |
| `mcp-server/src/checklist-validator.test.ts` | Optional (Option B only) | Fixture proving TS-side ref resolution if Option B selected |

**RED command targets:**

```bash
go test ./tools/agentstream/checklist/ -run 'TestResolveEvidenceRefs|TestAppendOutcomeVerified'
go test ./tools/agentstream/cmd/agentstream/ -run 'TestAgentstream.*Composition|TestTracker'
```

#### Stage H acceptance

**A16** (see §6): no `completed` disposition with unresolved `evidence_refs`; proven by unit + composition tests above.

#### Stage H build-plan entry

1. Copy Tracker template to `working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/stage-h-evidence-resolution_YYYYMMDD.yaml`.
2. Extend or create `CITDP-REQ-TIED_CHECKLIST_GATE_ENFORCEMENT-stage-h.yaml` with evidence-resolution change definition.
3. Run `tied_checklist_gate_validate` `phase: pre_implementation` at **`integrated`** depth with identity-bound activation before RED.
4. RED tests per matrix → implement `evidence_resolve.go`, `AppendOutcomeVerified`, `main.go` wire point, fake-agent fixture.
5. GREEN + composition + `tied_validate_consistency`; LEAP only if IMPL pseudo-code drift discovered.

### Stage I — complete: Tracker hardening (2026-08-25)

Closed residual producer test debt from Stages B–D:

| Test | File | Coverage |
|---|---|---|
| `request_token` mismatch | `tracker_test.go` | `ValidateTrackerIdentity`, `EnsureTracker` |
| `not_applicable` / `waived` apply | `tracker_writer_test.go` | `ApplyTrackerDisposition` field contracts |
| `clearCloseOutGateSummaries` | `tracker_writer_test.go` | `InvalidateTrackerDownstream` clears `close_out_evidence.gates` |
| goto composition invalidation | `tracker_composition_test.go` + `fake_tracker_goto_agent.rb` | `main.go` calls `InvalidateTrackerDownstream` on tracker-mode goto |

**Stage I complete:** Stages J–L build work followed with durable receipts, reconciliation, and controlled-client pilot validation.

### Stage J — complete: gate/status durable receipts (2026-08-25)

Persist raw gate JSON and `tied_verify` mutation receipts. Reconciliation (Stage K) compares gate input hashes to current Tracker — resolved ref hashes from Stage H improve `gate_without_current_evidence` signal quality.

- `mcp-server/src/gate-receipt.ts` persists atomic gate receipts with Tracker/CITDP input hashes.
- `mcp-server/src/adherence-ledger.ts` records `gate_decided` and `status_mutated` rows.
- `mcp-server/src/verify.ts` wires receipt persistence for `tied_verify` dry-run/apply.
- Tests: `gate-receipt.test.ts`, `adherence-ledger.test.ts`, and `verify.test.ts` cover A17/A18.

### Stage K — complete: adherence ledger + reconciliation report (2026-08-25)

- `adherence_reconcile.go` implements read-only `RECONCILE_ADHERENCE_CHAIN` with all seven deterministic finding codes.
- Table-driven tests validate malformed chains, stale gate evidence, missing verification receipts, and the six-class linked fixture.
- A18 is validated through the `status_mutated` to gate receipt chain; A19 is completed by the controlled-client pilot in Stage L.

### Stage L — Controlled-client pilot + rollout stop conditions (after H–K) — **complete (2026-08-25)**

**Dependency order:** H → I (parallel-safe with J after H) → J → K → L.

- Pilot one client at `depth_tier: integrated` with distinct phase `run_id`s (`stage-l-pre-implementation-20260825`, `stage-l-verification-20260825`, `stage-l-close-out-20260825`).
- **Stop rollout if:** writer corrupts Tracker; turn advances without bound receipt; reconciliation shows `status_change_without_verification_receipt` or `completed_with_unresolved_evidence`; canonical checklist bytes change.
- Go: `rollout_stop.go` (`EvaluateRolloutStop`), `adherence_pilot.go` (`RunControlledClientPilot`, `BuildPilotControlledClientFixture`); controlled-client artifact `working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/pilot-report.json` and ledger `adherence/pilot-events.jsonl`; isolated gate receipts under `gates/pilot/`.
- Tests: `rollout_stop_test.go`, `adherence_pilot_test.go`, `TestReconcileAdherenceChain_gotoClearsCompletedWithUnresolvedFinding` (A20).

## 6. Objective acceptance matrix

| ID | Acceptance | Required evidence |
|---|---|---|
| A1 | Fresh materialization produces a non-sparse Tracker with all main slugs plus `sub-adversarial-inquiry-pass` | Go unit fixture and semantic YAML assertion |
| A2 | No checklist Turn advances without a valid current-step receipt bound to issued instruction | Fake-agent composition test; instruction_nonce/hash table test |
| A3 | Every non-pending disposition satisfies its evidence contract | Parser/writer table tests and shared validator fixture |
| A4 | Loop-back invalidates all configured downstream state before rerouting | Go composition test and before/after Tracker fixture |
| A5 | Canonical checklist bytes never change | Snapshot/hash assertion |
| A6 | Writer output passes the existing minimal pre-implementation gate | Raw `tied_checklist_gate_validate` result |
| A7 | Integrated writer output without activation fails under advisory policy | TypeScript gate test with `integrated_depth_requires_pairing` |
| A8 | Each integrated phase uses a distinct identity-bound run and four phase-local artifacts | Three activation receipts plus artifact hashes |
| A9 | Verification gate runs before and inside `tied_verify`; invalid input causes no status diff | `tied_verify` dry-run rejection and unchanged index assertions |
| A10 | Completed step evidence names exact commands, reports, decisions, or resolvable artifact refs | Stage H: `ResolveEvidenceRefs` unit tests; generic prose and missing files rejected before write |
| A11 | No REQ/detail status drift after successful verification | `tied_verify` result followed by `tied_validate_consistency` |
| A12 | Vocabulary, pseudo-code, tests, and code retain token/name alignment | `[PROC-TOKEN_AUDIT]`, `[PROC-TOKEN_VALIDATION]`, vocabulary VALIDATE |
| A13 | Each checklist turn emits `instruction_rendered` before subprocess | ✅ Composition test + JSONL fixture |
| A14 | Receipt parsed only from final assistant text | ✅ `executor_test` with thinking+assistant streams |
| A15 | Receipt bound to issued nonce + instruction hash | ✅ `tracker_receipt` table test |
| A16 | No `completed` disposition with unresolved `evidence_refs` | **Stage H complete (2026-08-25).** Go `ResolveEvidenceRefs` rejects generic prose (`tests passed`, `build ok`, single-word refs) and missing files with `unresolved_evidence_ref`. Manifest refs require `verification-evidence-manifest.v1` and all `command_results[].exit_code == 0`. `handleTrackerTurn` calls resolution after binding and before `ApplyTrackerDisposition`; failure leaves Tracker unchanged. Ledger receives one `outcome_verified` row per resolved ref with `artifact_hash`. Evidence: `evidence_resolve_test.go`, writer/integration guard test, `adherence_ledger_test.go` `AppendOutcomeVerified`, composition test with temp file + manifest fixture. TS gate unchanged (Option A); `tracker_gate_fixture_test.go` proves resolved Go output passes shared validator. |
| A17 | Gate decision persisted with input hash | Gate JSON fixture + `verify.test` |
| A18 | Status mutation references gate receipt | `tied_verify` result + reconciliation pass |
| A19 | Reconciliation report links all six classes for pilot request | **Stage L complete (2026-08-25).** Controlled-client `pilot-report.json` + `adherence/pilot-events.jsonl` for `REQ-TIED_CHECKLIST_GATE_ENFORCEMENT`; `TestRunControlledClientPilot_sixClassesLinkedZeroBlocking`; static copy at `tools/agentstream/checklist/testdata/pilot_controlled_client/events.jsonl`. |
| A20 | Replay-safe loop-back clears adherence downstream hashes | **Stage L complete (2026-08-25).** `TestReconcileAdherenceChain_gotoClearsCompletedWithUnresolvedFinding` — after `InvalidateTrackerDownstream`, `completed_with_unresolved_evidence` absent for cleared slug; goto composition test unchanged. |

## 7. Required commands and proof boundaries

Planned build-plan verification:

- `go test ./tools/agentstream/...` — Go unit and process-composition behavior only.
- `go test ./tools/agentstream/checklist/...` — adherence ledger, evidence resolver, and reconciliation when implemented (Stages G–K).
- `npm run build --prefix mcp-server` — TypeScript build/type boundary.
- targeted Node test commands for checklist validator and verify composition — shared gate/status behavior only.
- `./scripts/validate_tokens.sh` — token existence/annotation consistency only.
- TIED YAML lint for changed structured records — YAML/schema formatting only.
- `pseudocode_validate` — IMPL pseudo-code structural validation only.
- `tied_validate_consistency` — REQ→ARCH→IMPL/detail/pseudo-code consistency only.
- `adherence-reconcile` (planned Go CLI or MCP read tool) — read-only reconciliation report; observational only.

None of these alone proves integrated activation; that requires the phase-specific inquiry receipt and four paired artifacts.

## 8. Build-plan entry contract

Use `--checklist-tracker-yaml PATH` for the explicit writable per-request Tracker. `--lead-checklist-yaml` continues to identify the read-only checklist definition. When the Tracker path does not exist, agentstream materializes `checklist-tracker.v1`; when it exists, agentstream validates its request/source identity before execution. Resolving both flags to the same file is an error.

**Proposed (Stage G, committed):** `--adherence-ledger PATH` defaulting to `working/{REQ-TOKEN}/adherence/events.jsonl`.

**Stage H build-plan entry contract:**

- Scope: `evidence_resolve.go`, `AppendOutcomeVerified`, `handleTrackerTurn` wire point, fake-agent fixture, test matrix in §5 Stage H.
- Tracker: `working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/stage-h-evidence-resolution_YYYYMMDD.yaml`
- CITDP: `working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/CITDP-REQ-TIED_CHECKLIST_GATE_ENFORCEMENT-stage-h.yaml`
- Pre-implementation gate: **`depth_tier: integrated`**, `gate_policy: advisory`, distinct identity-bound inquiry passes per phase before RED.
- Verification: `go test ./tools/agentstream/checklist/...`, composition test, optional `npm test --prefix mcp-server` for gate fixture only.
- Close-out: A16–A20 evidence recorded; optional command evidence, hook capture, and MCP reconcile CLI remain deferred.

Build-plan and close-out gates: **complete** — integrated inquiry activation and close-out gate allowed for the consolidated Stages I–L chain. Stages G–L are complete; optional integrations remain deferred.

## 9. Six-stage adherence evidence model

Store events in derived ledger **`agent-adherence-event.v1`** (append-only JSONL under `working/{REQ-TOKEN}/adherence/`). Each record is a **hash/reference edge**, not a copy of prompts, transcripts, Tracker YAML, manifests, or TIED indexes. **Do not conflate** with `[REQ-EVIDENCE_CHAIN_PROFILE]` / `evidence-chain-profile.v1`.

### Six non-interchangeable event classes

| Event class | Meaning | Authoritative source |
|---|---|---|
| `instruction_rendered` | Exact turn prompt bytes issued to agent | agentstream pre-`executor.Run` |
| `agent_acknowledged` | Agent attestation only (Tracker receipt) | `agentstream_tracker` fenced JSON |
| `action_attempted` | Runner/hook-observed tool/shell/MCP/command | Cursor hooks + optional runner capture |
| `outcome_verified` | Machine-verified result for an evidence ref | verification manifest, gate receipts, artifact hashes |
| `gate_decided` | Checklist evidence gate decision | persisted `tied_checklist_gate_validate` output |
| `status_mutated` | REQ/IMPL status promotion | `tied_verify` previous→next diff receipt |

### Non-implication rules (normative)

- Acknowledgment (`agent_acknowledged`) **never** proves action.
- Action (`action_attempted`) **never** proves success.
- Success (`outcome_verified`) **never** authorizes progression without a passing gate.
- Gate pass (`gate_decided`) **never** proves status mutation occurred.
- Status mutation (`status_mutated`) **never** retroactively validates earlier missing links.

### Correlation contract (required on every ledger row)

Bind these across all six classes (hash or stable ID where bodies are excluded):

- `request_token`, `project_id`, `run_id`, `phase`, `turn_index`, `step_slug`
- `session_id_hash`, `instruction_hash`, `receipt_hash`, `tool_use_id` (when applicable)
- `source_revision` (git commit or `dirty:<hash>`)
- `artifact_ref` + `artifact_hash` (pointer into existing files, not inline bodies)

### Ledger row shape (sketch)

```yaml
schema_version: agent-adherence-event.v1
event_class: instruction_rendered | agent_acknowledged | action_attempted | outcome_verified | gate_decided | status_mutated
correlation:
  request_token: REQ-TIED_CHECKLIST_GATE_ENFORCEMENT
  run_id: "~"
  turn_index: 1
  step_slug: change-definition
  instruction_hash: sha256:…
source:
  kind: agentstream | cursor_hook | mcp_gate | tied_verify
  path: working/REQ-X/adherence/events.jsonl
  line: 42
proof_boundary:
  - "Does not prove agent followed unstated instructions"
```

**Privacy:** store hashed session/project identities; keep prompt/response bodies outside the ledger; ledger rows reference hook YAML paths and line offsets only.

## 10. Monitoring, reconciliation, retention, and migration

**Post–Stage O (2026-08-25):** Operator reconcile (Stage N) and migration preview/docs (Stage O) are live. Acceptance A26–A31 satisfied. Deferred backlog (Stages P–Q): optional `command_evidence` hardening, optional inquiry sub-turn rollout — tracked in [`docs/checklist-adherence-remaining-work-plan.md`](checklist-adherence-remaining-work-plan.md).

### Deterministic reconciliation findings (read-only)

`adherence-reconcile` CLI and `tied_adherence_reconcile_run` MCP tool emit diagnostics:

| Finding code | Meaning |
|---|---|
| `rendered_without_acknowledgment` | `instruction_rendered` exists; no matching `agent_acknowledged` for turn/slug |
| `acknowledged_without_attempt` | receipt present; no observed action for declared `evidence_refs` |
| `attempt_without_verified_outcome` | hook/runner action logged; no manifest/hash match |
| `completed_with_unresolved_evidence` | Tracker `completed` but ref resolution failed |
| `gate_without_current_evidence` | gate receipt hashes stale vs current Tracker |
| `status_change_without_verification_receipt` | TIED status changed without matching gate+verify chain |
| `legacy_no_adherence_chain` | Tracker predates adherence ledger; non-blocking during migration window |

The report is **observational** — it cannot mutate Tracker or TIED YAML.

### Retention policy

- Ledger + gate receipts: immutable append-only for request lifetime.
- Tracker `state_history`: bounded (e.g. last N turns); prune only unreferenced rows.
- Hook YAML: follow existing `~/.cursor/logs/` rotation; ledger stores path+hash only.

### Migration

- Legacy Trackers without adherence events remain valid; reconciliation marks `legacy_no_adherence_chain` (non-blocking during window).
- Schema v1 receipts without binding fields accepted for legacy runs only during migration window.
- Do not retroactively claim adherence for legacy client Trackers.

### Controlled-client pilot stop conditions (Stage L)

Stop rollout if: writer corrupts Tracker; turn advances without bound receipt; reconciliation shows `status_change_without_verification_receipt` or `completed_with_unresolved_evidence`; canonical checklist bytes change. Implemented in Go `EvaluateRolloutStop` (`rollout_stop.go`); observational only.
