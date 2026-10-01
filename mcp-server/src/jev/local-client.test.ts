/**
 * [REQ-TIED_JEV_LOCAL_DECISION_PROVIDER] local subprocess bridge
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DEFAULT_LOCAL_MODEL, resolveLocalProviderConfig } from "./decision-provider.js";
import {
  invokeLocalDecisionBridge,
  normalizeLocalBridgeResponse,
  validateJevAnswers,
} from "./local-client.js";

describe("REQ-TIED_JEV_LOCAL_DECISION_PROVIDER local-client", () => {
  it("validateJevAnswers rejects out-of-range noul", () => {
    assert.equal(
      validateJevAnswers({ q: { type: "noul", noul: 1.5 } }),
      "invalid_noul:q",
    );
  });

  it("normalizeLocalBridgeResponse maps success", () => {
    const result = normalizeLocalBridgeResponse({
      schema: "jev-local-bridge-response.v1",
      ok: true,
      response: {
        model: "m",
        answers: { urgent: { type: "noul", noul: 0.2 } },
      },
    });
    assert.equal(result.ok, true);
  });

  it("invokeLocalDecisionBridge uses injected runner", async () => {
    const cfg = resolveLocalProviderConfig({
      TIED_JEV_LOCAL_BRIDGE: "/abs/fake.py",
      TIED_JEV_LOCAL_MODEL: DEFAULT_LOCAL_MODEL,
    });
    const result = await invokeLocalDecisionBridge({
      config: cfg,
      state: "hello",
      questions: { urgent: { type: "noul", instructions: "?" } },
      runner: async () => ({
        exitCode: 0,
        stdout: JSON.stringify({
          schema: "jev-local-bridge-response.v1",
          ok: true,
          response: {
            model: DEFAULT_LOCAL_MODEL,
            answers: { urgent: { type: "noul", noul: 0.5 } },
          },
        }),
        stderr: "",
        timedOut: false,
      }),
    });
    assert.equal(result.ok, true);
  });

  it("invokeLocalDecisionBridge maps timeout to local_timeout", async () => {
    const cfg = resolveLocalProviderConfig({
      TIED_JEV_LOCAL_BRIDGE: "/abs/fake.py",
    });
    const result = await invokeLocalDecisionBridge({
      config: cfg,
      state: "x",
      questions: { q: { type: "noul", instructions: "?" } },
      runner: async () => ({
        exitCode: 1,
        stdout: "",
        stderr: "",
        timedOut: true,
      }),
    });
    assert.equal(result.ok, false);
    if (!result.ok && result.skipped) {
      assert.equal(result.reason, "local_timeout");
    }
  });
});
