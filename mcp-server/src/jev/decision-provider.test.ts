/**
 * [REQ-TIED_JEV_LOCAL_DECISION_PROVIDER] provider routing config
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  assessDecisionBackendReady,
  assessLocalBackendReady,
  resolveLocalProviderConfig,
} from "./decision-provider.js";

describe("REQ-TIED_JEV_LOCAL_DECISION_PROVIDER decision-provider", () => {
  it("defaults provider to remote", () => {
    const cfg = resolveLocalProviderConfig({});
    assert.equal(cfg.provider, "remote");
    assert.equal(cfg.localFallback, "skip");
  });

  it("rejects relative bridge paths", () => {
    const cfg = resolveLocalProviderConfig({
      TIED_JEV_DECISION_PROVIDER: "local",
      TIED_JEV_LOCAL_BRIDGE: "scripts/bridge.py",
    });
    assert.equal(assessLocalBackendReady(cfg).ready, false);
  });

  it("SC-LOCAL-NO-EGRESS: local backend ready without JEV_API_KEY", () => {
    const cfg = resolveLocalProviderConfig({
      TIED_JEV_DECISION_PROVIDER: "local",
      TIED_JEV_LOCAL_BRIDGE: "/tmp/abs-bridge.py",
    });
    assert.equal(assessLocalBackendReady(cfg).ready, true);
    assert.equal(
      assessDecisionBackendReady({
        TIED_JEV_DECISION_PROVIDER: "local",
        TIED_JEV_LOCAL_BRIDGE: "/tmp/abs-bridge.py",
      }),
      true,
    );
  });

  it("auto backend ready when local or remote available", () => {
    assert.equal(
      assessDecisionBackendReady({
        TIED_JEV_DECISION_PROVIDER: "auto",
        TIED_JEV_LOCAL_BRIDGE: "/tmp/b.py",
      }),
      true,
    );
    assert.equal(
      assessDecisionBackendReady({
        TIED_JEV_DECISION_PROVIDER: "auto",
        JEV_API_KEY: "jv_live_x",
      }),
      true,
    );
    assert.equal(
      assessDecisionBackendReady({
        TIED_JEV_DECISION_PROVIDER: "auto",
        JEV_API_KEY: "",
      }),
      false,
    );
  });
});
