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
import {
  formatHarnessDistMissingMessage,
  isHarnessDistBuilt,
  jevHarnessMissingDistAbortMessage,
} from "./jev-harness-shared.js";

// [IMPL-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR]
// JEV-HARNESS-DIST-2C: missing-dist hard stop (sponsor 2C)

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
  let prevDecisionProvider = "";
  let prevLocalBridge = "";

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
    if (prevDecisionProvider === "") {
      delete process.env.TIED_JEV_DECISION_PROVIDER;
    } else {
      process.env.TIED_JEV_DECISION_PROVIDER = prevDecisionProvider;
    }
    if (prevLocalBridge === "") {
      delete process.env.TIED_JEV_LOCAL_BRIDGE;
    } else {
      process.env.TIED_JEV_LOCAL_BRIDGE = prevLocalBridge;
    }
  });

  it("is disabled by default", () => {
    delete process.env.AGENTSTREAM_JEV_HARNESS;
    const cfg = minimalCfg();
    const out = runJevHarnessPreflight(cfg);
    assert.equal(out.exitCode, 0);
    assert.equal(out.stderr, "");
  });

  it("reads enablement from tied-project/config.yaml jev.agentstream_harness", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "jev-harness-"));
    fs.mkdirSync(path.join(tempDir, "tied-project"), { recursive: true });
    fs.writeFileSync(
      path.join(tempDir, "tied-project/config.yaml"),
      yaml.dump({
        schema: "tied-project-config.v1",
        yaml: { scalar_style: "unwrapped" },
        jev: { agentstream_harness: true },
      }),
    );
    assert.equal(jevAgentstreamHarnessEnabled(tempDir), true);
  });

  it("warns fail-closed when enabled without JEV_API_KEY", () => {
    prevHarness = process.env.AGENTSTREAM_JEV_HARNESS ?? "";
    prevKey = process.env.JEV_API_KEY ?? "";
    prevDecisionProvider = process.env.TIED_JEV_DECISION_PROVIDER ?? "";
    prevLocalBridge = process.env.TIED_JEV_LOCAL_BRIDGE ?? "";
    process.env.AGENTSTREAM_JEV_HARNESS = "1";
    delete process.env.JEV_API_KEY;
    process.env.TIED_JEV_DECISION_PROVIDER = "remote";
    delete process.env.TIED_JEV_LOCAL_BRIDGE;
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

  it("G2/2C: sync preflight hard-stops when harness on and dist missing", () => {
    prevHarness = process.env.AGENTSTREAM_JEV_HARNESS ?? "";
    process.env.AGENTSTREAM_JEV_HARNESS = "1";
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "jev-harness-nodist-"));
    // Seed checklist so findRepoRootFromPath pins to tempDir (no cwd fallback).
    fs.mkdirSync(path.join(tempDir, "tied", "docs"), { recursive: true });
    fs.writeFileSync(
      path.join(tempDir, "tied", "docs", "agent-req-implementation-checklist.yaml"),
      "description: fixture\n",
    );
    assert.equal(isHarnessDistBuilt(tempDir), false);
    const out = runJevHarnessPreflight(minimalCfg({ workspace: tempDir }));
    assert.equal(out.exitCode, 1);
    assert.equal(out.stderr.includes(formatHarnessDistMissingMessage().trim()), true);
  });

  it("G2/2C: live preflight hard-stops when harness on and dist missing", async () => {
    prevHarness = process.env.AGENTSTREAM_JEV_HARNESS ?? "";
    process.env.AGENTSTREAM_JEV_HARNESS = "1";
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "jev-harness-nodist-live-"));
    fs.mkdirSync(path.join(tempDir, "tied", "docs"), { recursive: true });
    fs.writeFileSync(
      path.join(tempDir, "tied", "docs", "agent-req-implementation-checklist.yaml"),
      "description: fixture\n",
    );
    const out = await runJevHarnessPreflightLive(
      minimalCfg({ workspace: tempDir }),
    );
    assert.equal(out.exitCode, 1);
    assert.match(out.stderr, /mcp-server\/dist\/jev not built/);
    assert.match(out.stderr, /npm run build/);
  });

  it("G2/2C: injected deps bypass missing-dist hard stop", async () => {
    prevHarness = process.env.AGENTSTREAM_JEV_HARNESS ?? "";
    process.env.AGENTSTREAM_JEV_HARNESS = "1";
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "jev-harness-deps-bypass-"));
    const out = await runJevHarnessPreflightLive(
      minimalCfg({ workspace: tempDir }),
      {
        evaluateSampleTool: async () => ({
          decision: "allow",
          reason: "mock",
        }),
      },
    );
    assert.equal(out.exitCode, 0);
    assert.match(out.stderr, /sample tool eval: decision=allow/);
    assert.doesNotMatch(out.stderr, /not built/);
  });

  it("G2/2C: live-executor belt aborts when harness enabled and gate null", () => {
    const msg = jevHarnessMissingDistAbortMessage(true, true);
    assert.equal(msg, formatHarnessDistMissingMessage());
    assert.equal(jevHarnessMissingDistAbortMessage(false, true), null);
    assert.equal(jevHarnessMissingDistAbortMessage(true, false), null);
  });
});
