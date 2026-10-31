/**
 * [REQ-TIED_DURABLE_CHECKLIST_CONTROLLER] config-driven resume apply
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, it } from "node:test";

import {
  RESUME_FROM_TRACKER_DISABLED_BY_CONFIG,
  shouldApplyResumeFromTracker,
} from "./checklist-resume-config.js";
import type { DryRunConfig } from "./dry-run-config.js";

function minimalCfg(overrides: Partial<DryRunConfig>): DryRunConfig {
  return {
    dryRun: true,
    sessionId: "",
    workspace: os.tmpdir(),
    model: "Auto",
    agentPath: "",
    agentHarness: "cursor",
    leadChecklistYaml: "/def.yaml",
    leadChecklistSkipSub: true,
    leadChecklistStepFromId: "",
    leadChecklistStepToId: "",
    leadChecklistBeforeFeatureSpec: false,
    firstTurn: 1,
    resumeFromTracker: false,
    firstTurnExplicit: false,
    checklistVars: {},
    checklistVarStrict: false,
    skipTiedMcpPreflight: true,
    assumeTiedMcpYes: false,
    mcpJsonPath: "",
    argvWords: [],
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
    checklistTrackerYaml: "/tracker.yaml",
    adherenceLedger: "",
    runID: "",
    enforceEnvelope: false,
    allowMissingEnvelope: false,
    integratedDepth: false,
    featureSpecBatchExplicit: false,
    orderFilterRaw: "",
    ...overrides,
  };
}

describe("checklist-resume-config [REQ-TIED_DURABLE_CHECKLIST_CONTROLLER]", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "resume-cfg-"));
    fs.mkdirSync(path.join(tempDir, "tied-project"), { recursive: true });
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("CLI-only when config key absent", () => {
    fs.writeFileSync(path.join(tempDir, "tied-project/config.yaml"), "schema: tied-project-config.v1\n");
    assert.equal(
      shouldApplyResumeFromTracker(
        minimalCfg({ workspace: tempDir, resumeFromTracker: false }),
      ),
      false,
    );
    assert.equal(
      shouldApplyResumeFromTracker(
        minimalCfg({ workspace: tempDir, resumeFromTracker: true }),
      ),
      true,
    );
  });

  it("auto-applies when checklist.resume_from_tracker is true", () => {
    fs.writeFileSync(
      path.join(tempDir, "tied-project/config.yaml"),
      "checklist:\n  resume_from_tracker: true\n",
    );
    assert.equal(
      shouldApplyResumeFromTracker(
        minimalCfg({ workspace: tempDir, resumeFromTracker: false }),
      ),
      true,
    );
  });

  it("fail closed when disabled and CLI flag set", () => {
    fs.writeFileSync(
      path.join(tempDir, "tied-project/config.yaml"),
      "checklist:\n  resume_from_tracker: false\n",
    );
    assert.throws(
      () =>
        shouldApplyResumeFromTracker(
          minimalCfg({ workspace: tempDir, resumeFromTracker: true }),
        ),
      (err: Error) => err.message.includes(RESUME_FROM_TRACKER_DISABLED_BY_CONFIG),
    );
  });
});
