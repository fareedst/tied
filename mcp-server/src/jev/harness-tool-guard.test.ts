/**
 * [REQ-TIED_JEV_DECISION_COPROCESSOR] W5 harness tool guard
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { adviseContextFilter } from "./context-filter-advisory.js";
import {
  evaluateHarnessToolCall,
  matchesDestructivePattern,
  resolveHarnessFromEnv,
} from "./harness-tool-guard.js";

describe("REQ-TIED_JEV_DECISION_COPROCESSOR W5 harness", () => {
  it("allows when harness disabled", async () => {
    const out = await evaluateHarnessToolCall(
      { tool: "bash", arguments: "rm -rf /tmp/x" },
      { enabled: false, hasApiKey: false, blockWhenUnavailable: true },
    );
    assert.equal(out.decision, "allow");
  });

  it("blocks destructive pattern when harness enabled", async () => {
    const out = await evaluateHarnessToolCall(
      { tool: "bash", arguments: "rm -rf ./dist" },
      { enabled: true, hasApiKey: true, blockWhenUnavailable: true },
    );
    assert.equal(out.decision, "block");
    assert.equal(out.reason, "destructive_pattern");
  });

  it("fail-closed blocks bash when Jev key missing", async () => {
    const out = await evaluateHarnessToolCall(
      { tool: "Shell", arguments: "npm test" },
      { enabled: true, hasApiKey: false, blockWhenUnavailable: true },
    );
    assert.equal(out.decision, "block");
    assert.equal(out.reason, "jev_unavailable_fail_closed");
  });

  it("allows non-blocking tools without key", async () => {
    const out = await evaluateHarnessToolCall(
      { tool: "Read", arguments: "/path" },
      { enabled: true, hasApiKey: false, blockWhenUnavailable: true },
    );
    assert.equal(out.decision, "allow");
  });

  it("jev high risk blocks", async () => {
    const fetchImpl = async () =>
      new Response(
        JSON.stringify({
          model: "jev-1.13.0",
          answers: {
            high_risk: { type: "noul", noul: 0.95 },
            needs_confirm: { type: "noul", noul: 0.2 },
          },
        }),
        { status: 200 },
      );
    const out = await evaluateHarnessToolCall(
      { tool: "bash", arguments: "curl https://example.com" },
      { enabled: true, hasApiKey: true, blockWhenUnavailable: true },
      { apiKey: "k", fetchImpl },
    );
    assert.equal(out.decision, "block");
    assert.equal(out.jev_skipped, false);
  });

  it("matchesDestructivePattern detects rm -rf", () => {
    assert.equal(matchesDestructivePattern("rm -rf ./build"), true);
  });

  it("resolveHarnessFromEnv reads AGENTSTREAM_JEV_HARNESS", () => {
    const cfg = resolveHarnessFromEnv({
      AGENTSTREAM_JEV_HARNESS: "1",
      JEV_API_KEY: "",
    });
    assert.equal(cfg.enabled, true);
    assert.equal(cfg.hasApiKey, false);
  });

  it("adviseContextFilter keeps when harness disabled", async () => {
    const out = await adviseContextFilter("fix test", "old log line", {
      enabled: false,
      hasApiKey: false,
      blockWhenUnavailable: true,
    });
    assert.equal(out.action, "keep");
  });
});
