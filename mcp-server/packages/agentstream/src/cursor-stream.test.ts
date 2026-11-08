/**
 * [REQ-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE] T-CURSOR-STREAM-01..04
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  extractCursorSessionFromJsonLine,
  extractCursorSessionFromLine,
  stderrIndicatesWritableIterableClosed,
} from "./cursor-stream.js";

describe("EXTRACT_CURSOR_SESSION [REQ-WF_TRIAL_CURSOR_LIVE_SESSION_ORACLE]", () => {
  it("T-CURSOR-STREAM-01 extracts system/init session_id", () => {
    const sid = extractCursorSessionFromLine({
      type: "system",
      subtype: "init",
      session_id: "cursor-init-sess-1",
    });
    assert.equal(sid, "cursor-init-sess-1");
  });

  it("T-CURSOR-STREAM-02 extracts type session line", () => {
    const sid = extractCursorSessionFromLine({
      type: "session",
      session_id: "cursor-session-line-2",
    });
    assert.equal(sid, "cursor-session-line-2");
  });

  it("T-CURSOR-STREAM-03 assistant-only line has no session", () => {
    const line = JSON.stringify({
      type: "assistant",
      message: { content: [{ type: "text", text: "hello" }] },
    });
    assert.equal(extractCursorSessionFromJsonLine(line), "");
  });

  it("T-CURSOR-STREAM-04 malformed JSON returns empty", () => {
    assert.equal(extractCursorSessionFromJsonLine("{not json"), "");
  });

  it("detects WritableIterable retriable stderr", () => {
    assert.equal(
      stderrIndicatesWritableIterableClosed(
        "RetriableError: WritableIterable is closed\n",
      ),
      true,
    );
    assert.equal(stderrIndicatesWritableIterableClosed("normal stderr\n"), false);
  });
});
