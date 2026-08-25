# Checklist Adherence — Remaining Work Plan

**Baseline:** Stages G–L complete (2026-08-25). Stages M–Q complete (2026-08-25). This plan is **closed**.

**Parent plan (closed G–L sequence):** [`docs/checklist-adherence-improvement-plan.md`](checklist-adherence-improvement-plan.md)

**Authoritative Cursor plan:** [checklist_adherence_remaining_eb852d26.plan.md](/Users/fareed/.cursor/plans/checklist_adherence_remaining_eb852d26.plan.md)

**Primary tokens:** `[REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]`, `[IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT]`, `[PROC-AGENT_REQ_CHECKLIST]`

---

## 1. Executive summary

The checklist adherence producer (Stages G–L) and post–Stage L backlog (Stages M–Q) are **done**. Acceptance **A1–A34** satisfied.

| Priority | Stage | Scope | Status |
|----------|-------|-------|--------|
| **P1** | M | Live `action_attempted` capture | **Complete** |
| **P2** | N | Go CLI + MCP reconcile (subprocess) | **Complete** |
| **P3** | O | Migration preview + doc hygiene | **Complete** (A29–A31) |
| **P4** | P | Evidence ref / TS hardening | **Complete** (A32; trigger fired) |
| **P5** | Q | Inquiry sub-turn + client rollout | **Complete** (A33–A34) |

Stages M–Q are **complete**; the post–Stage L remaining-work plan is **closed** (2026-08-25). Do not treat parent plan §1 pre–G–L gap rows as open work.

---

## 2. Operator runbook

### Active-turn marker

During each checklist turn with `--checklist-tracker-yaml` and `--adherence-ledger`, agentstream writes a short-lived marker at:

`working/{REQ-TOKEN}/adherence/active-turn.json`

Schema: `active-turn-marker.v1`. Written **after** `instruction_rendered`, cleared after `handleTrackerTurn` completes. Hooks read this file to correlate ledger rows without parsing prompts.

### Hook bridge (append-only)

**Components:**

- `.cursor/hooks/log.rb` — maps allowlisted hook events to bounded `evidence_refs`
- `scripts/adherence_append_action_attempted.rb` — appends one `action_attempted` JSONL row

**Behavior:** Fail-silent when the active-turn marker is absent (non-checklist sessions unaffected). Never rewrites prior ledger rows. Ledger stores `hook_log_ref` `{ path, line }` only — no prompt bodies, tool payloads, or shell output.

**Allowlisted hook events → evidence refs:**

| Hook event | Bounded ref |
|---|---|
| `postToolUse` | `tool:{tool_name}` |
| `afterShellExecution` | `shell:sha256:{digest}` |
| `afterMCPExecution` | `mcp:{server}.{tool_name}` |

**Turn lifecycle order (normative):** `instruction_rendered` → *(subprocess; hooks append `action_attempted`)* → `outcome_verified` *(completed only)* → `agent_acknowledged`.

### Reconcile CLI

```bash
# Build once
cd tools/agentstream && go build -o adherence-reconcile ./cmd/adherence-reconcile

# Read-only reconcile report on stdout (exit 0 even when findings present)
./adherence-reconcile \
  --ledger working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/adherence/pilot-events.jsonl \
  --tracker working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/stage-l-controlled-pilot_20260825.yaml \
  --gates working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/gates \
  --workspace /path/to/stdd
```

### Reconcile MCP

Tool: **`tied_adherence_reconcile_run`** — spawns the Go binary; **no TypeScript port** of finding logic.

Input (representative):

```json
{
  "ledger_path": "working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/adherence/pilot-events.jsonl",
  "tracker_path": "working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/stage-l-controlled-pilot_20260825.yaml",
  "gates_dir": "working/REQ-TIED_CHECKLIST_GATE_ENFORCEMENT/gates",
  "workspace": "/path/to/stdd"
}
```

Output: `ReconcileReport` with `read_only: true` and closed-set finding codes.

### Tracker migration preview

Read-only slug diff between checklist definition and an existing Tracker — **no automatic rewrite**:

```bash
agentstream \
  -c tied/docs/agent-req-implementation-checklist.yaml \
  --checklist-tracker-preview working/REQ-EXAMPLE/REQ-EXAMPLE_tracker.yaml
```

Emits `tracker-migration-preview.v1` JSON (`missing_in_tracker`, `extra_in_tracker`, `stale_dispositions`, `read_only: true`).

---

## 3. Acceptance checklist (A21–A34)

| ID | Acceptance | Stage | Status |
|---|---|---|---|
| A21 | Live `action_attempted` during turn subprocess | M | **Done** |
| A22 | Hook bridge fail-silent without marker | M | **Done** |
| A23 | `AppendActionAttempted` validation + append-only | M | **Done** |
| A24 | `hook_log_ref` present; no bodies in ledger | M | **Done** |
| A25 | Live fixture: no `acknowledged_without_attempt` | M | **Done** |
| A26 | Go CLI `reconcile-adherence` parity | N | **Done** |
| A27 | MCP `tied_adherence_reconcile_run` parity | N | **Done** |
| A28 | Pilot reconcile zero blocking findings | N | **Done** |
| A29 | `PreviewTrackerMigration` slug diff; Tracker unchanged | O | **Done** |
| A30 | Parent §1 historical annotation + link here | O | **Done** |
| A31 | README runbook + flag contract test | O | **Done** |
| A32 | (Optional) `command_evidence` refs in Go | P | **Done** |
| A33 | (Optional) Inquiry sub-turn composition | Q | **Done** |
| A34 | (Optional) Second client pilot | Q | **Done** |

A1–A20 remain satisfied from Stages G–L.

---

## 4. Verification commands

```bash
go test ./tools/agentstream/checklist/... -run PreviewTrackerMigration -count=1
go test ./tools/agentstream/config/... -run READMEDocuments -count=1
go test ./tools/agentstream/checklist/...
go test ./tools/agentstream/cmd/agentstream/...
go test ./tools/agentstream/cmd/adherence-reconcile/... -count=1
npm run build --prefix mcp-server
node --test mcp-server/dist/tools/adherence-reconcile-mcp.test.js
./scripts/validate_tokens.sh
# TIED: pseudocode_validate, tied_validate_consistency via tied-yaml MCP
```

---

## 5. Explicit deferrals and stop conditions

### Stage P (optional) — closed 2026-08-25

**Trigger fired:** composition test `A32 trigger fires when gate accepts manual Tracker with nonexistent evidence_refs` proved the shared gate accepts unresolved refs from non-agentstream writers. Go producer extended with inline `command_evidence` JSON resolution; TS Option B deferred.

### Stage Q (optional) — closed 2026-08-25

**Scope:** Subprocess adversarial-inquiry turn composition (`TestTrackerComposition_inquirySubTurn`); second controlled-client pilot (`pilot-report-stage-q.json`, `pilot_client: stdd-stage-q`); `EvaluateRolloutStop` pass with stage-q run_ids.

**Methodology refresh (operator action):** After merging Stage Q, run `./copy_files.sh /path/to/client` from the TIED source repository to refresh methodology snapshots (`tied/methodology/`) in client projects. This step is **not automated** in the Stage Q build — operators run it when publishing methodology updates to downstream clients.

### Rollout stop conditions (`EvaluateRolloutStop`)

Observational stop reasons from `tools/agentstream/checklist/rollout_stop.go`:

| Stop reason | Trigger |
|---|---|
| `writer_corrupts_tracker` | Invalid schema, identity mismatch, or writer corruption |
| `turn_advances_without_bound_receipt` | `rendered_without_acknowledgment` reconcile finding |
| `status_change_without_verification_receipt` | TIED status change without `status_mutated` ledger row |
| `completed_with_unresolved_evidence` | Completed step with failed evidence resolution |
| `canonical_checklist_bytes_changed` | Checklist definition hash drift vs baseline |

**Non-goals (explicit):** Auto-migrating Trackers; reopening G–L gate validator; making hook success equivalent to gate pass; TypeScript port of `ReconcileAdherenceChain`.
