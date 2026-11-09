/**
 * [REQ-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE] T-LIVE-SESSION-01, T-LIVE-SESSION-02
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatCursorLiveSessionOracleDiagnostic } from "./cursor-stream.js";
import {
  runCursorTurnWithRetry,
  type RunCursorAgentOnce,
} from "./cursor-turn-retry.js";
import type { RunResult } from "./executor-run.js";

const emptyResult = (): RunResult => ({
  sessionId: "",
  finalText: "",
  thinkingText: "",
  transcript: "",
});

describe("RUN_CURSOR_TURN_WITH_RETRY [REQ-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE]", () => {
  it("T-LIVE-SESSION-01 fails closed with empty session after attempts", async () => {
    let calls = 0;
    const runOnce: RunCursorAgentOnce = async () => {
      calls++;
      return {
        result: { ...emptyResult(), finalText: "done" },
        exitCode: 1,
        agentStderr: "",
      };
    };
    const out = await runCursorTurnWithRetry(runOnce, ["agent"], [], 1);
    assert.equal(calls, 2);
    assert.equal(out.result.sessionId, "");
    assert.equal(out.attemptCount, 2);
    const diag = formatCursorLiveSessionOracleDiagnostic({
      exit_code: out.exitCode,
      session_captured: false,
      retriable_stderr_seen: out.retriableStderrSeen,
      attempt_count: out.attemptCount,
    });
    assert.match(diag, /DIAGNOSTIC: cursor_live_session_oracle/);
    assert.match(diag, /session_captured=false/);
  });

  it("T-LIVE-SESSION-02 retries after WritableIterable then succeeds", async () => {
    let calls = 0;
    const runOnce: RunCursorAgentOnce = async () => {
      calls++;
      if (calls === 1) {
        return {
          result: emptyResult(),
          exitCode: 1,
          agentStderr: "RetriableError: WritableIterable is closed\n",
        };
      }
      return {
        result: { ...emptyResult(), sessionId: "retry-session-abc" },
        exitCode: 0,
        agentStderr: "",
      };
    };
    const out = await runCursorTurnWithRetry(runOnce, ["agent"], [], 2);
    assert.equal(calls, 2);
    assert.equal(out.result.sessionId, "retry-session-abc");
    assert.equal(out.exitCode, 0);
    assert.equal(out.retriableStderrSeen, true);
    assert.equal(out.attemptCount, 2);
  });

  it("T-LIVE-SESSION-03 normalizes exit 0 when session and deliverable but agent exit 1", async () => {
    const runOnce: RunCursorAgentOnce = async () => ({
      result: {
        ...emptyResult(),
        sessionId: "field-206e418f",
        finalText: "**[REQ-PRODUCER_CONSUMER_WIRING]** refine-plan complete.",
        transcript: "handoff complete",
      },
      exitCode: 1,
      agentStderr: "",
    });
    const out = await runCursorTurnWithRetry(runOnce, ["agent"], [], 0);
    assert.equal(out.exitCode, 0);
    assert.equal(out.result.sessionId, "field-206e418f");
    assert.equal(out.exitNormalized, true);
    assert.equal(out.attemptCount, 1);
  });

  it("T-LIVE-SESSION-04 normalizes exit 0 when session, retriable stderr, and exit 1", async () => {
    const runOnce: RunCursorAgentOnce = async () => ({
      result: { ...emptyResult(), sessionId: "sess-writable" },
      exitCode: 1,
      agentStderr: "RetriableError: WritableIterable is closed\n",
    });
    const out = await runCursorTurnWithRetry(runOnce, ["agent"], [], 0);
    assert.equal(out.exitCode, 0);
    assert.equal(out.exitNormalized, true);
    assert.equal(out.retriableStderrSeen, true);
  });
});
