import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";

import yaml from "js-yaml";

import type { DryRunConfig } from "./dry-run-config.js";
import {
  jevAgentstreamHarnessEnabled,
  runJevHarnessPreflight,
  runJevHarnessPreflightLive,
} from "./jev-harness-preflight.js";

// [IMPL-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR]

function minimalCfg(overrides: Partial<DryRunConfig> = {}): DryRunConfig {
  return {
    dryRun: false,
    sessionId: "",
    workspace: process.cwd(),
    model: "Auto",
    agentPath: "",
    agentHarness: "cursor",
    leadChecklistYaml: "",
    leadChecklistSkipSub: false,
    leadChecklistStepFromId: "",
    leadChecklistStepToId: "",
    leadChecklistBeforeFeatureSpec: false,
    firstTurn: 1,
    checklistVars: {},
    checklistVarStrict: false,
    skipTiedMcpPreflight: false,
    assumeTiedMcpYes: false,
    mcpJsonPath: "",
    argvWords: ["build-plan", "W5"],
    promptFiles: [],
    promptsFiles: [],
    tddYamls: [],
    featureSpecBatchYamls: [],
    previewFeatureSpecBatchYaml: "",
    previewLeadChecklist: false,
    previewChecklistTrackerYaml: "",
    verifySession: false,
    nonCompactHtml: false,
    nonCompactHtmlStableIndent: 0,
    checklistTrackerYaml: "",
    adherenceLedger: "",
    runID: "",
    enforceEnvelope: false,
    allowMissingEnvelope: false,
    integratedDepth: false,
    featureSpecBatchExplicit: true,
    orderFilterRaw: "",
    ...overrides,
  };
}

describe("jev harness preflight [REQ-TIED_JEV_DECISION_COPROCESSOR]", () => {
  let tempDir = "";
  let prevHarness = "";
  let prevKey = "";

  afterEach(() => {
    if (tempDir) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      tempDir = "";
    }
    if (prevHarness === "") {
      delete process.env.AGENTSTREAM_JEV_HARNESS;
    } else {
      process.env.AGENTSTREAM_JEV_HARNESS = prevHarness;
    }
    if (prevKey === "") {
      delete process.env.JEV_API_KEY;
    } else {
      process.env.JEV_API_KEY = prevKey;
    }
  });

  it("is disabled by default", () => {
    delete process.env.AGENTSTREAM_JEV_HARNESS;
    const cfg = minimalCfg();
    const out = runJevHarnessPreflight(cfg);
    assert.equal(out.exitCode, 0);
    assert.equal(out.stderr, "");
  });

  it("reads enablement from .tied-yaml.yaml jev.agentstream_harness", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "jev-harness-"));
    fs.writeFileSync(
      path.join(tempDir, ".tied-yaml.yaml"),
      yaml.dump({ jev: { agentstream_harness: true } }),
    );
    assert.equal(jevAgentstreamHarnessEnabled(tempDir), true);
  });

  it("warns fail-closed when enabled without JEV_API_KEY", () => {
    prevHarness = process.env.AGENTSTREAM_JEV_HARNESS ?? "";
    prevKey = process.env.JEV_API_KEY ?? "";
    process.env.AGENTSTREAM_JEV_HARNESS = "1";
    delete process.env.JEV_API_KEY;
    const out = runJevHarnessPreflight(minimalCfg());
    assert.match(out.stderr, /fail-closed/);
  });

  it("live preflight runs mock Jev integration smoke via injected deps", async () => {
    prevHarness = process.env.AGENTSTREAM_JEV_HARNESS ?? "";
    process.env.AGENTSTREAM_JEV_HARNESS = "1";
    const out = await runJevHarnessPreflightLive(minimalCfg(), {
      evaluateSampleTool: async () => ({
        decision: "block",
        reason: "mock_high_risk",
      }),
      adviseSampleContext: async () => ({
        action: "truncate",
        reason: "mock_truncate",
      }),
    });
    assert.equal(out.exitCode, 0);
    assert.match(out.stderr, /sample tool eval: decision=block/);
    assert.match(out.stderr, /sample context filter: action=truncate/);
  });
});
