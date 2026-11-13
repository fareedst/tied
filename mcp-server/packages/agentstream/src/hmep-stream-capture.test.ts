import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";

import {
  appendHmepStreamJsonLine,
  hmepStreamCaptureEnabled,
  resolveHmepStreamJsonPath,
} from "./hmep-stream-capture.js";

describe("hmep-stream-capture [REQ-WF_TRIAL_RANGE_HMEP_AUTO_INGEST]", () => {
  const prev: Record<string, string | undefined> = {};

  afterEach(() => {
    for (const k of Object.keys(prev)) {
      if (prev[k] === undefined) {
        delete process.env[k];
      } else {
        process.env[k] = prev[k];
      }
    }
  });

  function setEnv(key: string, value: string | undefined) {
    prev[key] ??= process.env[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }

  it("SC-WRH-01: enabled when WF_TRIAL_HMEP_CAPTURE=1 and skip unset", () => {
    setEnv("WF_TRIAL_SKIP_HMEP_CAPTURE", undefined);
    setEnv("WF_TRIAL_HMEP_CAPTURE", "1");
    assert.equal(hmepStreamCaptureEnabled(), true);
  });

  it("SC-WRH-04: skip env disables capture", () => {
    setEnv("WF_TRIAL_HMEP_CAPTURE", "1");
    setEnv("WF_TRIAL_SKIP_HMEP_CAPTURE", "1");
    assert.equal(hmepStreamCaptureEnabled(), false);
  });

  it("SC-WRH-05: default off without capture env", () => {
    setEnv("WF_TRIAL_SKIP_HMEP_CAPTURE", undefined);
    setEnv("WF_TRIAL_HMEP_CAPTURE", undefined);
    setEnv("AGENTSTREAM_HMEP_STREAM_CAPTURE", undefined);
    assert.equal(hmepStreamCaptureEnabled(), false);
  });

  it("resolves turn-003 path under orchestrator evidence", () => {
    const ws = "/tmp/wf-client";
    const p = resolveHmepStreamJsonPath(ws, 3);
    assert.match(
      p,
      /wf-trial-orchestrator-run\/evidence\/stream-json\/turn-003\.jsonl$/,
    );
  });

  it("append writes NDJSON line when enabled", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "hmep-cap-"));
    setEnv("WF_TRIAL_SKIP_HMEP_CAPTURE", undefined);
    setEnv("WF_TRIAL_HMEP_CAPTURE", "1");
    appendHmepStreamJsonLine(dir, 1, '{"type":"result","usage":{}}');
    const out = resolveHmepStreamJsonPath(dir, 1);
    assert.ok(fs.existsSync(out));
    const text = fs.readFileSync(out, "utf8");
    assert.match(text, /"type":"result"/);
  });
});
