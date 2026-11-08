# Test strategy — [REQ-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE]

**Phase:** design only (refine-plan). **No RED files** in this turn.

**Modules:** `mcp-server/packages/agentstream` (`cursor-stream`, `executor-run`, `live-executor`, optional `harness-turn-trace`).

**Verify command:** `node --test mcp-server/packages/agentstream`

---

## Unit

| ID | File (planned) | Assertion |
| --- | --- | --- |
| **T-CURSOR-STREAM-01** | `src/cursor-stream.test.ts` | `system`/`init` line with `session_id` → extracted |
| **T-CURSOR-STREAM-02** | same | `type: session` line → extracted |
| **T-CURSOR-STREAM-03** | same | assistant-only line → no session |
| **T-CURSOR-STREAM-04** | same | malformed JSON line → no throw |

---

## Composition / RED (build-plan)

| ID | File (planned) | Assertion |
| --- | --- | --- |
| **T-LIVE-SESSION-01** | `src/cursor-live-session-oracle.test.ts` or extend existing live driver tests | Stub stdout: text without `session_id` → `sessionId === ""`; live-executor path emits `DIAGNOSTIC: cursor_live_session_oracle` on fail-closed |
| **T-LIVE-SESSION-02** | same | Stub: stderr contains `WritableIterable is closed`, stdout delivers `session_id` on attempt 2 → batch turn succeeds with `sessionId` set |
| **T-LIVE-SESSION-03** | optional bootstrap | Document-only crosswalk helper for facilitator stderr linter (non-blocking; defer unless build-plan needs it) |

**Fake spawn pattern:** Follow `live-driver-bind.test.ts` and `jev-harness-live-tool-gate.test.ts` (subprocess echo NDJSON).

---

## Operator (non-CI)

| ID | When | Pass |
| --- | --- | --- |
| **T-OP-REPLAY-01** | Sponsor requests | New disposable client, `workflow-trial-agentstream wf-01`, `MODEL_CONFIG=grok47-med`, manifest `exit_code: 0`, four `session_id=` lines in stderr |

---

## Security

No network in unit/composition tests. Live capture sub-step uses existing disposable-client policy only.
