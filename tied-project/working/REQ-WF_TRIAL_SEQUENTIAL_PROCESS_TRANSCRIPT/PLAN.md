# PLAN — REQ-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT (dual-stream turn transcript)

**Status:** close-out complete (2026-11-12)  
**Parent context:** [REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL](../REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL/PLAN.md) (commit `3b9ea925`) · incident context **not registered** (1794504138)  
**Request token:** `REQ-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT`  
**plan_phase:** `close-out`  
**profile_depth:** `minimal` · **gate_policy:** `advisory`

**CITDP (draft):** [citdp-draft.md](./citdp-draft.md)  
**Test strategy:** [test-strategy.md](./test-strategy.md)  
**CITDP YAML (working):** [CITDP-REQ-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT.yaml](./CITDP-REQ-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT.yaml)

---

## 1. Refine (RESOLVE) — locked

| # | Term | Resolution |
| --- | --- | --- |
| R1 | **Primary failure mode** | `live-executor.ts` appends turn banners and `session_id=` only to `stderrAcc`; returned at process exit. Orchestrator tees **agent stdout** to `process.stdout.log` and **agentstream stderr** to `process.stderr.log` → transcripts are **time-disjoint**; abort classifier rules that need turn boundaries in stdout cannot see markers until after exit (too late for live ops). |
| R2 | **Operator pain** | Live terminal shows no turn progress between turns; `process.stderr.log` lacks agent text; facilitator cannot grade sequential friction from stdout alone. |
| R3 | **Sponsor decision (both streams)** | **Turn operator lines** (`--- turn N/M … ---`, `session_id=…`) emit **(a)** a **stdout mirror copy** for evidence transcript and **(b)** an **immediate stderr write + flush** for the live terminal. |
| R4 | **`emitTurnOperatorLine`** | Exported helper (unit-testable): **only** turn banner (`--- turn N/M … ---`) and `session_id=…` lines. Append to `stdoutAcc`; **`fs.writeSync(1, line)`** and **`fs.writeSync(2, line)`** before `liveBinding.runTurn`; **do not** append operator text to `stderrAcc`. On `flush_failed`, caller appends `DIAGNOSTIC: turn operator flush failed: …` to `stderrAcc` only (texture path). |
| R5 | **stderr de-dup at exit** | **Omission-by-construction:** `index.ts` exit `process.stderr.write(result.stderr)` must not contain operator lines because `stderrAcc` never held them; live tee already captured operator stderr via synchronous fd 2 writes. No byte-count strip pass. |
| R6 | **Downstream seams** | `wf-trial-process-log.inc.sh` **unchanged** (tee on fds 1/2). `wf-trial-abort-signal.inc.sh` **unchanged in wave 1** — live stderr flush populates `process.stderr.log` during the run so SC-WF-ABS-02 still scans stderr; optional stdout scanner deferred unless post-SPT fixtures show a gap. |
| R7 | **Texture constraint** | Keep ERROR/DIAGNOSTIC on stderr per `REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE`; stdout mirror is **operator transcript** copies only (not merging all stderr into stdout). |
| R8 | **Out of scope** | Single-stream-only agentstream; merging entire stderr into stdout; registering disposable run `1794504138`. |

### 1.1 `emitTurnOperatorLine` contract (locked)

| Field | Value |
| --- | --- |
| **Sites** | `executeLiveRun`: closure `emitOperatorLine` (~L299) called at turn banner (~L375) and post-turn `session_id=` (~L549) in `live-executor.ts` |
| **PRE** | Line matches turn banner or `session_id=` operator patterns; normalized to end with `\n` |
| **POST (success)** | `stdoutAcc` includes line; fd 1 and fd 2 each received full line synchronously; `stderrAcc` unchanged |
| **POST (failure)** | `flush_failed` → `{ ok: false, reason, detail }`; caller may append single DIAGNOSTIC line to `stderrAcc` |
| **Out of scope for EMIT** | Preflight, DEBUG, DIAGNOSTIC, ERROR, harness trace — remain `stderrAcc +=` and exit bulk write only |

**Build outcome:** `executeLiveRun` returns `{ stdout: stdoutAcc, stderr: stderrAcc, exitCode }` on all exit paths (agent chunks still stream directly to fd 1; `stdoutAcc` holds operator mirror only).

---

## 2. Scope

### refine-plan (complete)

| ID | Deliverable | Status |
| --- | --- | --- |
| RP.1 | `emitTurnOperatorLine` API + flush semantics | Done — IMPL pseudo-code + code |
| RP.2 | stderr de-dup strategy | Done — omission-by-construction |
| RP.3 | Abort-signal alignment | Done — wave 1 stderr-only sufficient after live flush |

### build-plan (complete)

| ID | Deliverable | Path / module | Status |
| --- | --- | --- | --- |
| W1.1 | `emitTurnOperatorLine` + dual-stream wiring | `mcp-server/packages/agentstream/src/live-executor.ts` | Shipped |
| W1.2 | Unit tests | `mcp-server/packages/agentstream/src/live-executor-turn-operator.test.ts` | 130/130 agentstream |
| W1.3 | Abort classifier (optional) | `wf-trial-abort-signal.inc.sh` | Skipped (wave 1) |
| W1.4 | Bootstrap composition | `tools/bootstrap/workflow-trial-agentstream-sh.test.mjs` — SC-WF-SPT-* | 60/60 bootstrap |
| W1.5 | IMPL pseudo-code sidecar | `tied-project/implementation-decisions/IMPL-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT-pseudocode.md` | `pseudocode_validate` ok |
| W1.6 | Vocab RECORD | `tied-project/vocab/agentstream.md` | dual-stream term recorded |

---

## 3. Token stack

| Layer | Token | Role |
| --- | --- | --- |
| REQ | `REQ-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT` | SC-WF-SPT-01..04 |
| ARCH | `ARCH-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT` | stdout mirror + live stderr flush + exit de-dup |
| IMPL | `IMPL-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT` | `emitTurnOperatorLine`, live-executor integration |

**depends_on:** `REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG`, `REQ-GOAGENT-FEATURESPEC-BATCH`, `REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL`, `REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE`

---

## 4. Acceptance criteria

| ID | Criterion | Verification signal |
| --- | --- | --- |
| SC-WF-SPT-01 | Multi-turn WF trial with process log enabled: `process.stdout.log` contains at least one `--- turn ` banner and matching `session_id=` **between** agent stdout chunks (not only appended after exit). | Unit `executeLiveRun` dry-run + bootstrap SC-WF-SPT-04 contract |
| SC-WF-SPT-02 | For each turn: banner on fd 2 (and fd 1 mirror) **before** driver mock/`runTurn` proceeds; after success, `session_id=` emitted on fd 2 before next banner. | Unit test: spy `writeSync` call order vs `runTurn` |
| SC-WF-SPT-03 | `executeLiveRun` return `stderr` contains **no** lines matching `^--- turn ` or `^session_id=` when those lines were EMITted; orchestrator `process.stderr.log` still has them from live fd 2 tee. | `assertNoOperatorLinesInStderr` in unit tests |
| SC-WF-SPT-04 | `workflow-trial-agentstream-sh.test.mjs` adds SC-WF-SPT-* cases; all SC-WF-ABS-* remain green. | Bootstrap 60/60 (2026-11-12) |

---

## 5. Verification

```bash
cd mcp-server/packages/agentstream && npm test
node --test tools/bootstrap/workflow-trial-agentstream-sh.test.mjs
```

**Recorded (build-plan):** agentstream **130/130**; bootstrap **60/60**.

---

## 6. Close-out prep

| Item | Notes |
| --- | --- |
| `tied_verify` | Deferred until `verification` / `close_out` gate envelope hydration |
| Live WF-10 | Optional after session limit reset; confirms live dual-stream markers (do **not** register 1794504138) |
| CITDP persist | Promote working YAML → `tied-project/citdp/` at close-out per policy |

---

## Do next

Program rollup optional; push `main` when sponsor ready.
