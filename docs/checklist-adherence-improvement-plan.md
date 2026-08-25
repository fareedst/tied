# Checklist Adherence Improvement Plan

**Status:** Refined implementation plan (2026-08-24)
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

Vocabulary ownership and names are defined in `tied/vocab/agentstream.md`, `tied/vocab/fidelity-research.md`, and `tied/vocab/quality-assurance.md`. No new REQ/ARCH/IMPL token is required for this plan: the producer behavior completes the existing machine-enforced checklist evidence contract.

### Depth and gate policy

| Context | `depth_tier` | `gate_policy` | `profile_depth` | Reason |
|---|---|---|---|---|
| This documentation-only refine-plan pass | `minimal` | `advisory` | `not_measured` | No runtime behavior, persistence schema, production code, or status changes are implemented in this pass |
| Later behavior-changing build-plan | `integrated` | `advisory` | Selected independently if measured | Agent output is external input, the writer mutates persistent workflow state, and the change protects strict verification/close-out boundaries |

For this pass, `sub-adversarial-inquiry-pass` is `not_applicable` with policy and rationale in the per-request Tracker. The later build-plan must run distinct integrated inquiry passes at `pre_implementation`, `verification`, and `close_out`.

### Workflow artifacts

- Per-request Tracker: `working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT_checklist-adherence-plan-refinement_20260824.yaml`
- CITDP draft: `working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/CITDP-REQ-TIED_CHECKLIST_GATE_ENFORCEMENT-tracker-writer-draft.yaml`
- Refine-plan gate receipt: `working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/gate-checklist-adherence-plan-refinement-pre-implementation.json`
- CITDP persistence is deferred until the behavior-changing build-plan, per `tied/docs/citdp-policy.md`.

### Refine-plan gate result (2026-08-24)

Raw `tied_checklist_gate_validate` output for `phase: pre_implementation` with the Tracker and CITDP above:

- `allowed: true`, `blocking: false`, `depth: minimal`, `diagnostics: []`
- At minimal depth the gate auto-requires only `sub-adversarial-inquiry-pass` (as `not_applicable` or `waived` with policy/rationale); pending implementation steps such as `unit-test-red` are out of scope for this documentation-only pass and do not block pre-implementation progression.
- Vocabulary RECORD/VALIDATE: terms in §0 resolved terms align with `tied/vocab/agentstream.md` and `tied/vocab/fidelity-research.md`; no new REQ/ARCH/IMPL token required.

## 1. Current state and confirmed gap

The validator and status boundary already enforce the consumer side:

- `mcp-server/src/checklist-validator.ts` reads `steps`, accepts only `pending`, `completed`, `not_applicable`, or `waived`, requires evidence by disposition, derives phase-aware slugs, rejects sparse/synthetic Trackers, and validates activation pairing.
- `mcp-server/src/verify.ts` rejects status updates without `checklist_gate` and calls `validateChecklistGate` before writing REQ/IMPL status.
- `mcp-server/src/feature-orchestration/commands.ts` blocks gated lifecycle commands when the shared validator rejects their evidence.
- Existing acceptance tests prove `tracker_sparse`, `tracker_not_authoritative`, activation, provenance, finding, freshness, waiver, and close-out diagnostics.

The missing producer contract is in `tools/agentstream`:

1. `checklist.LoadTurns` renders the canonical checklist but does not materialize a separate state-only Tracker.
2. `executor.Run` returns captured assistant text, but the runner parses only `agentstream_control` routing.
3. No strict completion receipt records the current step disposition and evidence.
4. `ApplyLoopBackClearance` clears legacy comment markers in the checklist file; it does not reset dispositions and evidence in an authoritative Tracker.
5. The canonical `sub-adversarial-inquiry-pass` is a `sub_procedures` entry, while the gate reads the Tracker's top-level `steps`. A raw checklist copy can therefore omit the gate-required state row.
6. `execution_evidence.completed` can describe intent, but it cannot substitute for step records and their evidence contracts.

The first implementation target is therefore the producer and composition seam, not another validator rewrite.

## 2. Change definition

### Current behavior

A lead-checklist run can advance after a successful agent subprocess without producing machine-readable completion state. Operators may manually edit a copied checklist or populate `execution_evidence.completed`, creating a sparse Tracker that the existing gate correctly rejects.

### Desired behavior

For each lead-checklist Turn, agentstream must:

1. render a strict **Tracker completion receipt** contract;
2. parse the receipt from the captured assistant text;
3. validate that its slug is the current `StepStub` and that its disposition contract is complete;
4. atomically update the per-request **Authoritative Tracker**;
5. refuse to advance when the receipt is missing, malformed, stale, mismatched, or unsupported;
6. clear downstream dispositions and evidence on a validated `goto`;
7. produce Tracker state that the existing checklist evidence gate and `tied_verify` consume without a synthetic adapter.

### Unchanged behavior

- The canonical checklist remains a read-only procedure definition.
- `agentstream_control` remains the routing protocol; completion state is a separate envelope.
- The shared TypeScript validator remains the authority for progression.
- `tied_verify` remains the only status-promotion writer and revalidates its `checklist_gate` payload before mutation.
- Advisory inquiry does not mutate canonical TIED YAML and only confirmed findings may trigger LEAP.
- Legacy full checklist copies remain readable during migration.

### Non-goals

- Reimplementing activation pairing, evidence provenance, or finding lifecycle in Go.
- Treating `execution_evidence.completed`, token presence, TIED consistency, or prose as completion evidence.
- Automatically marking a step complete from subprocess exit code alone.
- Making every adversarial finding blocking.
- Adding UI/E2E coverage where unit and process-composition tests can prove the behavior.
- Retrofitting or promoting statuses in existing client Trackers.
- Editing production code in this refine-plan pass.

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
    "evidence_refs": ["working/REQ-X/change-definition.md"]
  }
}
```

Rules:

- prose and subprocess success never imply completion;
- the receipt slug must equal the current `StepStub`;
- `completed`, `not_applicable`, and `waived` use the same evidence contracts as `validateTracker`;
- generic `skipped` is invalid;
- unknown fields are rejected for schema version 1;
- a byte-equivalent replay is idempotent; a conflicting replay for the same turn identity fails;
- when `agentstream_control.action` is `goto`, the runner applies loop-back invalidation and does not require the current step to be marked complete.

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

## 4. Module boundaries and impact

| Module | Responsibility | Planned files | Independent validation |
|---|---|---|---|
| Tracker materializer | Convert checklist definition to clean per-request state; include gate-governed sub-procedures | `tools/agentstream/checklist/tracker.go` | Go unit tests for slug inventory, clean state, path refusal, legacy import |
| Receipt parser | Parse and validate `agentstream_tracker` without changing routing semantics | `tools/agentstream/checklist/tracker_receipt.go` | Table tests for malformed, mismatched, disposition-specific, unknown-field, and replay cases |
| Atomic Tracker writer | Apply one receipt or loop-back invalidation without corrupting state | `tools/agentstream/checklist/tracker_writer.go` | Temp-directory tests, write-failure test doubles, idempotency and preservation tests |
| Runner composition | Connect executor transcript → receipt parser → writer before advancing; route `goto` through Tracker invalidation | `tools/agentstream/cmd/agentstream/main.go`, `tools/agentstream/config/` | Fake-agent process composition tests |
| Gate compatibility | Prove writer output is accepted/rejected by the existing shared gate and by `tied_verify` dry-run | `mcp-server/src/checklist-validator.test.ts`, `mcp-server/src/verify.test.ts`, shared fixtures | TypeScript contract/composition tests; no duplicate validator implementation |
| Procedure and operator docs | Define explicit Tracker path, receipt contract, migration, and evidence locations | `tools/agentstream/README.md`, canonical checklist docs, prompt-shared contracts if needed | Static contract tests and YAML lint |
| TIED logic | Add producer blocks and code/test locations before RED | `[IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT]` pseudo-code sidecar/detail | `pseudocode_validate`, token audit, `tied_validate_consistency` |

No UI boundary exists; E2E is not required. The fake `cursor agent` subprocess test is a process-composition test, not UI E2E.

## 5. Implementation sequence

### Stage A — LEAP and pseudo-code gate

1. Extend `[IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT]` with token-commented Active blocks:
   - `MATERIALIZE_AUTHORITATIVE_TRACKER`
   - `PARSE_TRACKER_COMPLETION_RECEIPT`
   - `APPLY_TRACKER_DISPOSITION`
   - `INVALIDATE_TRACKER_DOWNSTREAM`
   - `COMPOSE_TRACKER_WITH_CHECKLIST_GATE`
2. Add PRE/POST/EFFECTS, failure modes, state transitions, and termination contracts.
3. Update IMPL code locations/tests and any required architecture wording through the TIED YAML tooling.
4. RECORD the finalized names in vocabulary.
5. Run pseudo-code validation. Do not start RED until it passes.

### Stage B — RED: materializer and receipt parser

Write failing Go tests first:

- materialization includes every main slug and `sub-adversarial-inquiry-pass`;
- duplicate slugs or a missing gate-governed sub-procedure fail;
- canonical definition path cannot be a writer target;
- copy hygiene clears inherited dispositions, evidence, gates, and request identity;
- valid `completed`, `not_applicable`, and `waived` receipts parse;
- missing evidence, generic `skipped`, wrong slug, unsupported schema, and unknown fields fail;
- missing receipt blocks advancement;
- identical replay is idempotent; conflicting replay fails.

Then implement the minimum parser/materializer code to make those tests green and run Go lint/test checks.

### Stage C — RED: atomic write and loop-back state

Write failing Go tests first:

- exactly one step changes for a valid receipt;
- unrelated fields remain semantically equal;
- failed validation or simulated write failure leaves the original file unchanged;
- a `goto` clears all configured downstream dispositions, evidence, waivers, and gate summaries;
- routing does not proceed if clearance persistence fails;
- `execution_evidence.completed` is derived after the authoritative write and cannot override it.

Then implement the minimum writer/invalidation code and validate the module independently.

### Stage D — RED: runner composition

Use a fake `cursor agent` executable and temporary Tracker:

- valid receipt updates the current `StepStub` before turn N+1;
- absent/malformed/mismatched receipt exits non-zero before turn N+1;
- valid `goto` invalidates Tracker state before replacing the remaining queue;
- non-checklist Turns do not require Tracker receipts;
- the canonical checklist remains byte-identical;
- resume/replay does not duplicate state history.

Then wire `executor.Run` transcript output to the parser/writer in `main.go`.

### Stage E — RED: shared gate/status composition

Create one language-neutral Tracker fixture emitted by the Go writer and consume it in TypeScript tests:

- sparse legacy summary without step rows returns `tracker_sparse`;
- writer output with `sub-adversarial-inquiry-pass: pending` fails;
- minimal output with policy-backed `not_applicable` passes the pre-implementation gate;
- integrated output without activation fails even under advisory policy;
- integrated output with phase-matched pairing passes;
- `tied_verify` dry-run rejects invalid Tracker input and reports no `would_update`;
- `tied_verify` dry-run accepts valid gate input and reports only the expected status changes.

Do not add a second Go gate evaluator. The composition seam ends at the existing TIED YAML MCP/TypeScript authority.

### Stage F — Documentation, rollout, and verification

1. Document an explicit writable Tracker argument/path; never infer that the canonical checklist is writable.
2. Preserve legacy gate reads of `status` and `tracking.status` for one migration window; new writer output uses `disposition`.
3. Provide an explicit materialize/migrate preview for old full checklist copies; do not rewrite existing client state automatically.
4. Pilot on one controlled client at integrated depth with distinct phase runs.
5. Refresh client methodology with `copy_files.sh`; do not edit client methodology snapshots.
6. Run full Go and TypeScript tests, build/lint, token validation, vocabulary validation, verification gate, and `tied_validate_consistency`.
7. Stop rollout if the writer corrupts a Tracker, advances without a receipt, changes the canonical checklist, or produces output rejected by the shared gate.

## 6. Objective acceptance matrix

| ID | Acceptance | Required evidence |
|---|---|---|
| A1 | Fresh materialization produces a non-sparse Tracker with all main slugs plus `sub-adversarial-inquiry-pass` | Go unit fixture and semantic YAML assertion |
| A2 | No checklist Turn advances without a valid current-step receipt | Fake-agent composition test with turn-N+1 sentinel absent |
| A3 | Every non-pending disposition satisfies its evidence contract | Parser/writer table tests and shared validator fixture |
| A4 | Loop-back invalidates all configured downstream state before rerouting | Go composition test and before/after Tracker fixture |
| A5 | Canonical checklist bytes never change | Snapshot/hash assertion |
| A6 | Writer output passes the existing minimal pre-implementation gate | Raw `tied_checklist_gate_validate` result |
| A7 | Integrated writer output without activation fails under advisory policy | TypeScript gate test with `integrated_depth_requires_pairing` |
| A8 | Each integrated phase uses a distinct identity-bound run and four phase-local artifacts | Three activation receipts plus artifact hashes |
| A9 | Verification gate runs before and inside `tied_verify`; invalid input causes no status diff | `tied_verify` dry-run rejection and unchanged index assertions |
| A10 | Completed step evidence names exact commands, reports, decisions, or tool receipts | Tracker fixture audit; generic “test/build evidence” rejected by policy test |
| A11 | No REQ/detail status drift after successful verification | `tied_verify` result followed by `tied_validate_consistency` |
| A12 | Vocabulary, pseudo-code, tests, and code retain token/name alignment | `[PROC-TOKEN_AUDIT]`, `[PROC-TOKEN_VALIDATION]`, vocabulary VALIDATE |

## 7. Required commands and proof boundaries

Planned build-plan verification:

- `go test ./tools/agentstream/...` — Go unit and process-composition behavior only.
- `npm run build --prefix mcp-server` — TypeScript build/type boundary.
- targeted Node test commands for checklist validator and verify composition — shared gate/status behavior only.
- `./scripts/validate_tokens.sh` — token existence/annotation consistency only.
- TIED YAML lint for changed structured records — YAML/schema formatting only.
- `tied_validate_consistency` — REQ→ARCH→IMPL/detail/pseudo-code consistency only.

None of these alone proves integrated activation; that requires the phase-specific inquiry receipt and four paired artifacts.

## 8. Build-plan entry contract

Use `--checklist-tracker-yaml PATH` for the explicit writable per-request Tracker. `--lead-checklist-yaml` continues to identify the read-only checklist definition. When the Tracker path does not exist, agentstream materializes `checklist-tracker.v1`; when it exists, agentstream validates its request/source identity before execution. Resolving both flags to the same file is an error.

Refine-plan pre-implementation gate: `allowed: true` at minimal depth (receipt path above). **Stage A (build-plan) is unblocked.** Production code remains out of scope for this refine-plan pass; build-plan must select `depth_tier: integrated` and run distinct inquiry passes per phase.
