/**
 * [REQ-TIED_DURABLE_CHECKLIST_CONTROLLER] agentstream resume apply
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import yaml from "js-yaml";

import { applyResumeFromTracker } from "./apply-resume-from-tracker.js";
import type { DryRunConfig } from "./dry-run-config.js";
import type { Turn } from "./checklist-load-turns.js";

function baseCfg(trackerPath: string): DryRunConfig {
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
    resumeFromTracker: true,
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
    checklistTrackerYaml: trackerPath,
    adherenceLedger: "",
    runID: "",
    enforceEnvelope: false,
    allowMissingEnvelope: false,
    integratedDepth: false,
    featureSpecBatchExplicit: false,
    orderFilterRaw: "",
  };
}

describe("applyResumeFromTracker [REQ-TIED_DURABLE_CHECKLIST_CONTROLLER]", () => {
  it("sets firstTurn and session from tracker", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "resume-"));
    const trackerPath = path.join(dir, "tracker.yaml");
    fs.writeFileSync(
      trackerPath,
      yaml.dump({
        schema_version: "checklist-tracker.v1",
        steps: [
          { slug: "a", disposition: "completed", kind: "main" },
          { slug: "b", disposition: "pending", kind: "main" },
        ],
        state_history: [
          {
            turn_identity: "turn=2:stub=a:session=sess-abc",
            receipt_hash: "h1",
          },
        ],
      }),
      "utf8",
    );
    const cfg = baseCfg(trackerPath);
    const turns: Turn[] = [
      { parts: ["a"], chainFromPrevious: false, stepStub: "a" },
      { parts: ["b"], chainFromPrevious: true, stepStub: "b" },
    ];
    const out = applyResumeFromTracker(cfg, turns);
    assert.equal(out.ok, true);
    if (out.ok) {
      assert.equal(cfg.firstTurn, 2);
      assert.equal(cfg.sessionId, "sess-abc");
      assert.equal(out.next_step_slug, "b");
    }
  });
});
