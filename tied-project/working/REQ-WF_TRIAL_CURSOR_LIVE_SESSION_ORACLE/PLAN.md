# PLAN — [REQ-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE]

**Trial context:** TIED store repo (`stdd`); field case disposable client `1794179357-wf-agentstream-wf-01-cursor-grok47med`.

**Phase:** close-out complete · `plan_phase: close-out-ready` · traceable commit recorded in [close-out-handoff.md](./evidence/close-out-handoff.md).

**Request token:** `REQ-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE`  
**Workflow:** `debug` → `@refine-plan` → `@build-plan` → `@close-out`  
**Parallel track (facilitator):** `@record-wf-trial` for client `1794179357` (store docs only; may run before or after build-plan).

**Trigger:** WF-01 grok-4.7-medium-fast Cursor agentstream run aborted after turn 1 (`exit_code: 1`) with `RetriableError: WritableIterable is closed` and no `session_id=` stderr line, while add-feature artifacts for `REQ-SEMVER_COMPARATOR` on the disposable client were valid.

---

## Sponsor remainder (resolved)

1. **Primary:** Harden **agentstream** Cursor live path so four-phase batches either capture a resume **session oracle** or fail with structured **DIAGNOSTIC** after bounded retry — not silent turn-1 stop with good disk artifacts.
2. **Secondary:** Publish facilitator readout for field case `1794179357` (first grok47-med WF-01 Cursor agentstream cell).
3. **Rejected:** Continuing chained turns without `session_id`; fixing Cursor product WritableIterable root cause; changing add-feature / refine skill contracts.

---

## Problem statement (locked)

| Mechanism | Current behavior | Desired behavior |
| --- | --- | --- |
| **`executor-run.runAgent`** | Sets `sessionId` when any NDJSON line has top-level `session_id` | Shared **cursor-stream** extractor: `system`/`init`, `type: session`, and legacy top-level (SC-CURSOR-SESSION-01) |
| **WritableIterable stderr** | Forwarded; batch may end with exit 1 and empty session | **Bounded retry** (max 2 retries → 3 attempts) when session empty and retriable signature seen (SC-CURSOR-SESSION-02) |
| **`live-executor` turn end** | Generic `No session_id in stream` | **DIAGNOSTIC: cursor_live_session_oracle** with `exit_code`, `session_captured`, `retriable_stderr_seen`, `attempt_count` (SC-CURSOR-SESSION-03) |
| **Facilitator matrix** | Correlation only in readouts | Optional harness-turn-trace fields for matrices |

**Evidence:** Client logs under `/Users/fareed/Documents/dev/test/1794179357-wf-agentstream-wf-01-cursor-grok47med/tied-project/working/wf-trial-orchestrator-run/evidence/`; cohort [1794044147](docs/demos/trial-readout-PROMPT-WF-01-composer25-1794044147-wf-agentstream-wf-01-cursor-composer25.md), success [1794048393](docs/demos/trial-readout-PROMPT-WF-01-composer25-1794048393-wf-agentstream-wf-01-cursor-composer25.md).

**Not this REQ:** Shell `expanded_batch` / exit propagation — [REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT](../REQ-WF_TRIAL_FOUR_PHASE_SHELL_EXIT/PLAN.md) (implemented).

---

## Scope

| In | Out |
| --- | --- |
| `mcp-server/packages/agentstream/src/cursor-stream.ts` (new) | Cursor CLI product fix |
| `executor-run.ts`, `live-executor.ts` | `scripts/run-traditional-four-phase-agentstream.sh` |
| `harness-turn-trace.ts` (optional fields) | Mandatory green grok matrix in CI |
| `cursor-stream.test.ts`, `executor-run` / live composition tests | Disposable client product code |
| `docs/demos/trial-readout-*-1794179357-*.md` (facilitator track) | `REQ-SEMVER_COMPARATOR` implementation |

---

## Locked decisions (refine-plan)

| ID | Decision | Rationale |
| --- | --- | --- |
| **D-RETRY** | `CURSOR_TURN_RETRY_MAX = 2` (constant in module; no new operator env) | Reversible; matches sponsor plan default; avoids [REQ-TIED_ENVIRONMENT_VARIABLE_POLICY] churn |
| **D-FAIL-CLOSED** | Never advance batch without non-empty `session_id` | Costly to waive; preserves `--resume` chain integrity |
| **D-RETRY-GATE** | Retry only when `session_id` empty AND (`exitCode !== 0` OR retriable WritableIterable stderr) | Avoid retry on successful turns with session |
| **D-MODULE** | **cursor-stream.ts** mirrors claude-stream session oracle subset | Single parser module; testable without live Cursor |
| **D-INVESTIGATE** | build-plan may run one live NDJSON capture (grok vs composer) **before** GREEN if RED fixtures insufficient | Resolves shape drift; operator-costly — optional sub-step in build-plan |
| **D-FACILITATOR** | Readout is **optional** parallel step; not blocking build-plan gate | Sponsor chose "both" tracks |
| **D-DEPTH** | `depth_tier: minimal`, `gate_policy: advisory` | Harness unit/composition tests; no integrated adversarial inquiry |

---

## Proposed implementation (`@build-plan` executes)

| Step | Change |
| --- | --- |
| B1 | Add `cursor-stream.ts` + `cursor-stream.test.ts` (session line fixtures) |
| B2 | Wire `executor-run.ts` line handler through extractor |
| B3 | Add `runCursorTurnWithRetry` (or inline loop in live binding) + wire `live-executor.ts` |
| B4 | **RED → GREEN:** T-LIVE-SESSION-01, T-LIVE-SESSION-02 per [test-strategy.md](./evidence/test-strategy.md) |
| B5 | `node --test mcp-server/packages/agentstream` |
| B6 | Optional: `@record-wf-trial` + catalog row for `1794179357` |
| B7 | Optional sponsor replay: fresh disposable `workflow-trial-agentstream wf-01` `MODEL_CONFIG=grok47-med` |

**Tokens:** [REQ-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE](../../requirements/REQ-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE.yaml) · [ARCH-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE](../../architecture-decisions/ARCH-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE.yaml) · [IMPL-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE](../../implementation-decisions/IMPL-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE.yaml)

---

## Acceptance criteria mapping

| ID | Verification |
| --- | --- |
| SC-CURSOR-SESSION-01 | `cursor-stream.test.ts` fixtures for `system`/`init` and `type: session` |
| SC-CURSOR-SESSION-02 | T-LIVE-SESSION-02 fake spawn: WritableIterable stderr + delayed session line → success after retry |
| SC-CURSOR-SESSION-03 | T-LIVE-SESSION-01 failure path asserts DIAGNOSTIC substring |
| SC-CURSOR-SESSION-04 | Full agentstream package test run green |

---

## Test strategy

See [evidence/test-strategy.md](./evidence/test-strategy.md).

---

## Risk / depth

| Field | Value |
| --- | --- |
| `depth_tier` | minimal |
| `gate_policy` | advisory |
| Consequence ladder | Retry cap **reversible** (constant edit); live matrix replay **costly** (sponsor-only) |

---

## Do next

Optional **`@close-out`** — traceable commit + verification envelope when sponsor requests.
