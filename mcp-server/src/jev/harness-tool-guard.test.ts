/**
 * [REQ-TIED_JEV_TOOL_SAFETY_GATING] [REQ-TIED_JEV_DECISION_COPROCESSOR] harness tool guard
 */

import assert from "node:assert/strict";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import {
  BLOCK_RISK_THRESHOLD,
  CONFIRM_RISK_THRESHOLD,
  buildBlueprintDQuestions,
  deriveWorkspaceScopeSignal,
  evaluateHarnessToolCall,
  matchesDestructivePattern,
  resolveHarnessFromEnv,
} from "./harness-tool-guard.js";

const harnessOn = { enabled: true, hasApiKey: true, blockWhenUnavailable: true };

function mockJevResponse(destructive: number, scope: number) {
  return async () =>
    new Response(
      JSON.stringify({
        model: "jev-1.13.0",
        answers: {
          noul_destructive_risk: { type: "noul", noul: destructive },
          noul_scope_violation: { type: "noul", noul: scope },
        },
      }),
      { status: 200 },
    );
}

describe("REQ-TIED_JEV_TOOL_SAFETY_GATING harness guard", () => {
  it("SC-W5-PRESERVED: allows when harness disabled", async () => {
    const out = await evaluateHarnessToolCall(
      { tool: "bash", arguments: "rm -rf /tmp/x" },
      { enabled: false, hasApiKey: false, blockWhenUnavailable: true },
    );
    assert.equal(out.decision, "allow");
  });

  it("SC-D-FAST-DENY: blocks destructive pattern before Jev", async () => {
    const out = await evaluateHarnessToolCall(
      { tool: "bash", arguments: "rm -rf ./dist" },
      harnessOn,
    );
    assert.equal(out.decision, "block");
    assert.equal(out.reason, "destructive_pattern");
    assert.equal(out.jev_skipped, true);
  });

  it("SC-D-FAST-DENY: safe near miss with rm in path does not hard-block", () => {
    assert.equal(matchesDestructivePattern("echo rm -rf is documented in README"), false);
    assert.equal(matchesDestructivePattern("npm run clean:dist"), false);
  });

  it("SC-D-FALLBACK: fail-closed blocks Shell when Jev key missing", async () => {
    const out = await evaluateHarnessToolCall(
      { tool: "Shell", arguments: "npm test" },
      { enabled: true, hasApiKey: false, blockWhenUnavailable: true },
    );
    assert.equal(out.decision, "block");
    assert.equal(out.reason, "jev_unavailable_fail_closed");
  });

  it("SC-D-FALLBACK: non-2xx Jev response fail-closed", async () => {
    const fetchImpl = async () => new Response("upstream error", { status: 503 });
    const out = await evaluateHarnessToolCall(
      { tool: "bash", arguments: "npm test" },
      harnessOn,
      { apiKey: "k", fetchImpl },
    );
    assert.equal(out.decision, "block");
    assert.equal(out.reason, "jev_error_fail_closed");
  });

  it("SC-D-FALLBACK: state-too-large skip fail-closed", async () => {
    const out = await evaluateHarnessToolCall(
      { tool: "bash", arguments: "x".repeat(50_000), goal: "y".repeat(50_000) },
      harnessOn,
      { apiKey: "k", maxStateChars: 100 },
    );
    assert.equal(out.decision, "block");
    assert.equal(out.reason, "jev_skip_fail_closed");
  });

  it("allows non-blocking tools without key", async () => {
    const out = await evaluateHarnessToolCall(
      { tool: "Read", arguments: "/path" },
      { enabled: true, hasApiKey: false, blockWhenUnavailable: true },
    );
    assert.equal(out.decision, "allow");
  });

  it("SC-D-QUESTIONS: uses Blueprint D answer keys", () => {
    const q = buildBlueprintDQuestions();
    assert.ok(q.noul_destructive_risk);
    assert.ok(q.noul_scope_violation);
    assert.match(q.noul_destructive_risk.instructions, /permanently delete/);
  });

  it("SC-D-THRESHOLDS: combined max blocks at 0.72", async () => {
    const out = await evaluateHarnessToolCall(
      { tool: "bash", arguments: "curl https://example.com" },
      harnessOn,
      { apiKey: "k", fetchImpl: mockJevResponse(0.95, 0.2) },
    );
    assert.equal(out.decision, "block");
    assert.equal(out.risk, 0.95);
    assert.equal(out.reason, "jev_high_risk");
  });

  it("SC-D-THRESHOLDS: confirm band uses combined max", async () => {
    const out = await evaluateHarnessToolCall(
      { tool: "Shell", arguments: "git status" },
      harnessOn,
      { apiKey: "k", fetchImpl: mockJevResponse(0.2, 0.55) },
    );
    assert.equal(out.decision, "confirm");
    assert.equal(out.risk, 0.55);
    assert.equal(out.reason, "jev_needs_confirm");
  });

  it("SC-D-THRESHOLDS: allow below 0.45 combined", async () => {
    const out = await evaluateHarnessToolCall(
      { tool: "bash", arguments: "bun test" },
      harnessOn,
      { apiKey: "k", fetchImpl: mockJevResponse(0.1, 0.2) },
    );
    assert.equal(out.decision, "allow");
    assert.ok(out.risk! < CONFIRM_RISK_THRESHOLD);
  });

  it("boundary: combined exactly 0.72 blocks", async () => {
    const out = await evaluateHarnessToolCall(
      { tool: "bash", arguments: "ls" },
      harnessOn,
      { apiKey: "k", fetchImpl: mockJevResponse(BLOCK_RISK_THRESHOLD, 0.1) },
    );
    assert.equal(out.decision, "block");
  });

  it("SC-D-SCOPE: out of workspace absolute path", () => {
    const ws = path.join(os.tmpdir(), "proj-a");
    const outside = path.join(os.tmpdir(), "other-b", "file.txt");
    const sig = deriveWorkspaceScopeSignal(`cat ${outside}`, ws);
    assert.equal(sig.scope_class, "out_of_scope");
  });

  it("SC-D-SCOPE: not_evaluated without workspace", () => {
    const sig = deriveWorkspaceScopeSignal("npm test", undefined);
    assert.equal(sig.scope_class, "not_evaluated");
  });

  it("SC-D-TRACE-PRIVACY: redacts secrets from vendor path via redactState in evaluate", async () => {
    let capturedBody = "";
    const fetchImpl = async (_url: RequestInfo, init?: RequestInit) => {
      capturedBody = String(init?.body ?? "");
      return mockJevResponse(0.1, 0.1)();
    };
    await evaluateHarnessToolCall(
      {
        tool: "bash",
        arguments: "export API_KEY=jv_live_secret123",
        workspace: "/Users/me/secret-project",
      },
      harnessOn,
      { apiKey: "k", fetchImpl },
    );
    assert.doesNotMatch(capturedBody, /jv_live_secret123/);
    assert.doesNotMatch(capturedBody, /\/Users\/me\/secret-project/);
    assert.match(capturedBody, /DECLARED_WORKSPACE/);
  });

  it("resolveHarnessFromEnv reads AGENTSTREAM_JEV_HARNESS", () => {
    const cfg = resolveHarnessFromEnv({
      AGENTSTREAM_JEV_HARNESS: "1",
      JEV_API_KEY: "",
    });
    assert.equal(cfg.enabled, true);
    assert.equal(cfg.hasApiKey, false);
  });
});
