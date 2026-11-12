# [IMPL-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT] [ARCH-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT] [REQ-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT] — Dual-stream turn operator lines in agentstream live executor

Grammar-Version: v2

## Turn operator line classifier

- [IMPL-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT] [ARCH-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT] [REQ-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT] How: distinguish operator transcript lines from texture stderr so only banners and session_id use dual-stream emission per REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE.
- Contract:
  - INPUT: `text: string` (single line or line including trailing `\n`)
  - PRE: `text` is non-empty after trim OR `text` ends with `\n` when non-empty
  - OUTPUT: `is_turn_operator_line: boolean`
  - POST: on success, returns true when `text` matches turn banner pattern or session_id operator prefix pattern
  - DATA_TRANSITION: N/A
  - FAILURE_MODES: N/A (pure predicate)
  - EFFECTS: pure
procedure IS_TURN_OPERATOR_LINE:
  # [IMPL-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT] [ARCH-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT] [REQ-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT] How: pattern gate before dual-stream IO
  Contract:
    INPUT: text
    OUTPUT: boolean
    PRE: text is string
    POST: result matches operator vocabulary in tied-project/vocab/agentstream.md
    DATA_TRANSITION: N/A
    FAILURE_MODES: N/A
    EFFECTS: pure
  RETURN whether text matches turn banner regex OR session_id prefix regex

## emitTurnOperatorLine

Source: `mcp-server/packages/agentstream/src/live-executor.ts` (integration); exported helper for unit tests.

- [IMPL-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT] [ARCH-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT] [REQ-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT] How: mirror turn markers to stdout transcript and flush stderr immediately; operator bytes never enter exit stderrAcc (SC-WF-SPT-01..03).
- Contract:
  - INPUT: `line: string`; mutable state `stdoutAcc`, `stderrAcc` (caller-owned); Node `process.stdout` / `process.stderr` (or injectable stream fd 1/2 for tests)
  - PRE: `IS_TURN_OPERATOR_LINE(line)` is true; `line` ends with `\n` (caller normalizes)
  - OUTPUT: success OR error flush_failed with detail string
  - POST:
    - on success: stdoutAcc appended line; fd 1 and fd 2 received full line via synchronous write; stderrAcc unchanged
    - on flush_failed: partial writes may have occurred; caller may append DIAGNOSTIC texture line to stderrAcc only
  - FAILURE_MODES: flush_failed on EIO or fd not writable
  - DATA: `stdoutAcc` grows with operator mirror only; `stderrAcc` excludes operator lines entirely
  - DATA_TRANSITION: stdoutAcc before→after includes line; stderrAcc unchanged on success
  - EFFECTS: IO
  - TERMINATION: total
  - CONTROL: synchronous `writeSync` on fds 1 and 2 required for SC-WF-SPT-02 (no defer until event-loop drain before next `runTurn`)
procedure EMIT_TURN_OPERATOR_LINE:
  # [IMPL-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT] [ARCH-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT] [REQ-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT] How: dual-stream operator emission
  Contract:
    INPUT: line, stdoutAcc ref, stderrAcc ref
    OUTPUT: success OR error flush_failed
    PRE: IS_TURN_OPERATOR_LINE(line)
    POST: on success stdoutAcc and live stdout contain line; live stderr contains line; stderrAcc excludes line
    FAILURE_MODES: flush_failed
    EFFECTS: IO
  NORMALIZE line to end with single `\n`
  APPEND line to stdoutAcc
  CALL writeSync(fd=1, line)
  CALL writeSync(fd=2, line)
  ON write failure THEN
    RETURN error flush_failed
  RETURN success

## executeLiveRun integration

- [IMPL-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT] [ARCH-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT] [REQ-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT] How: replace direct `stderrAcc +=` for turn banner and `session_id=` with EMIT_TURN_OPERATOR_LINE; keep all DEBUG/DIAGNOSTIC/agentstream errors on stderrAcc-only path.
- Contract:
  - INPUT: `DryRunConfig`, turn loop state
  - PRE: qualifiesForTsNativeLiveRun
  - OUTPUT: `LiveRunStreams { stdout, stderr, exitCode }`
  - POST:
    - on success exit 0: returned stdout equals stdoutAcc; returned stderr equals stderrAcc with no operator banner or session_id lines
    - on early error exit: same de-dup invariant; operator lines already on live fds from EMIT before failure
  - FAILURE_MODES: tracker failure, control parse failure, driver exit non-zero (unchanged live-executor modes)
  - EFFECTS: IO | Async
  - TERMINATION: total per turn count
procedure EXECUTE_LIVE_RUN_TURN_MARKER_HOOKS:
  # [IMPL-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT] [ARCH-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT] [REQ-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT] How: wire EMIT at banner and session_id sites
  Contract:
    FAILURE_MODES: tracker failure, control parse failure, driver exit non-zero
    EFFECTS: IO Async
  BEFORE each runTurn:
    BUILD banner line (existing label/stub formatting)
    CALL EMIT_TURN_OPERATOR_LINE(banner) — not stderrAcc +=
  AFTER successful session capture:
    BUILD session_id line with captured id and trailing newline
    CALL EMIT_TURN_OPERATOR_LINE(session_id line) — not stderrAcc +=
  ALL other stderrAcc appends unchanged (preflight, DIAGNOSTIC, ERROR, harness trace)

## finalizeLiveRunStreams (exit de-dup)

- [IMPL-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT] [ARCH-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT] [REQ-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT] How: index.ts exit write must not duplicate tee-captured operator stderr (SC-WF-SPT-03).
- Contract:
  - INPUT: `stdoutAcc`, `stderrAcc`
  - PRE: operator lines only entered via EMIT_TURN_OPERATOR_LINE (stderrAcc never held them)
  - OUTPUT: `{ stdout: string, stderr: string }`
  - POST: stderr string contains no `^--- turn ` lines and no `^session_id=` lines that were emitted live; stdout string includes all mirrored operator lines
  - EFFECTS: pure
procedure FINALIZE_LIVE_RUN_STREAMS:
  RETURN { stdout: stdoutAcc, stderr: stderrAcc }
  # Invariant: omission-by-construction — no strip pass required if EMIT never appends operator text to stderrAcc

## Orchestrator tee seam (unchanged)

- [IMPL-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT] [ARCH-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG] [REQ-WF_TRIAL_ORCHESTRATOR_PROCESS_LOG] How: wf_trial_process_log_bind_workspace tee captures live fd 1/2; no manifest schema change for SPT wave.
- Contract:
  - INPUT: orchestrator `exec > >(tee stdout_log) 2> >(tee stderr_log)`
  - POST: live EMIT writes interleave turn markers into process.stdout.log with agent stdout chunks; live operator stderr interleaves into process.stderr.log; exit bulk stderr write adds only non-operator texture
  - EFFECTS: IO (shell)

## Abort classifier alignment (build-plan optional)

- [IMPL-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] [ARCH-WF_TRIAL_SEQUENTIAL_PROCESS_TRANSCRIPT] [REQ-WF_TRIAL_FOUR_PHASE_ABORT_SIGNAL] How: SC-WF-ABS-02 continues to scan process.stderr.log; live operator flush populates stderr log before exit so turn_missing_session_id timing improves without stdout scanner in wave 1.
- CONTROL: extend wf_trial_abort_signal_detect_missing_session_turn to accept stdout log only if fixtures prove stderr-only gap after SPT
