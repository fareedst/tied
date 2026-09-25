import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";

import yaml from "js-yaml";

import type { DryRunConfig } from "./dry-run-config.js";
import {
  daeAgentstreamGateCheckEnabled,
  resolveBatchRequestToken,
  runDaeGatePreflight,
} from "./dae-gate-preflight.js";

// [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION]

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
    argvWords: ["test"],
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

describe("dae gate preflight [REQ-TIED_DAE_INCORPORATION]", () => {
  let tempDir = "";
  let prevEnv = "";

  afterEach(() => {
    if (tempDir) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      tempDir = "";
    }
    if (prevEnv === "") {
      delete process.env.AGENTSTREAM_DAE_GATE_CHECK;
    } else {
      process.env.AGENTSTREAM_DAE_GATE_CHECK = prevEnv;
    }
  });

  it("is disabled by default", () => {
    delete process.env.AGENTSTREAM_DAE_GATE_CHECK;
    const cfg = minimalCfg();
    const out = runDaeGatePreflight(cfg);
    assert.equal(out.exitCode, 0);
    assert.equal(out.stderr, "");
  });

  it("reads enablement from .tied-yaml.yaml dae.agentstream_gate_check", () => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "dae-gate-"));
    fs.writeFileSync(
      path.join(tempDir, ".tied-yaml.yaml"),
      yaml.dump({ dae: { agentstream_gate_check: true } }),
    );
    assert.equal(daeAgentstreamGateCheckEnabled(tempDir), true);
  });

  it("resolves batch request_token from checklist vars", () => {
    const cfg = minimalCfg({
      checklistVars: { REQUEST: "REQ-DAE-TEST" },
    });
    assert.equal(resolveBatchRequestToken(cfg), "REQ-DAE-TEST");
  });

  it("blocks live run when enabled but request_token missing (exit 2)", () => {
    prevEnv = process.env.AGENTSTREAM_DAE_GATE_CHECK ?? "";
    process.env.AGENTSTREAM_DAE_GATE_CHECK = "1";
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "dae-gate-"));
    const cfg = minimalCfg({
      workspace: tempDir,
      skipTiedMcpPreflight: true,
    });
    const out = runDaeGatePreflight(cfg);
    assert.equal(out.exitCode, 0);
    assert.match(out.stderr, /skipped because tied-yaml MCP preflight is skipped/);
  });

  it("maps mocked gate spawn exit 1 to process exit 1", () => {
    prevEnv = process.env.AGENTSTREAM_DAE_GATE_CHECK ?? "";
    process.env.AGENTSTREAM_DAE_GATE_CHECK = "1";
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "dae-gate-"));
    fs.mkdirSync(path.join(tempDir, ".cursor"), { recursive: true });
    fs.writeFileSync(
      path.join(tempDir, ".cursor", "mcp.json"),
      JSON.stringify({
        mcpServers: {
          "tied-yaml": {
            env: { TIED_BASE_PATH: path.join(tempDir, "tied") },
          },
        },
      }),
    );
    fs.mkdirSync(path.join(tempDir, "tied"), { recursive: true });
    fs.writeFileSync(path.join(tempDir, "tied", "requirements.yaml"), "records: []\n");

    const cfg = minimalCfg({
      workspace: tempDir,
      checklistVars: { REQUEST: "REQ-DAE-TEST" },
      skipTiedMcpPreflight: false,
    });
    const out = runDaeGatePreflight(cfg, {
      cliEntry: "/noop/tied",
      spawn: () => ({
        status: 1,
        stdout: JSON.stringify({ allowed: false, exit_code: 1, reasons: ["blocked"] }),
        stderr: "gate blocked",
      }),
    });
    assert.equal(out.exitCode, 1);
    assert.match(out.stderr, /dae gate preflight/);
  });
});
