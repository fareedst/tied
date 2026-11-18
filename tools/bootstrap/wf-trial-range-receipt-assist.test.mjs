// [REQ-WF_TRIAL_RANGE_VERIFICATION_RECEIPT_ASSIST]
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const BUILD_COMMANDS = path.join(REPO_ROOT, "scripts/build-commands.sh");
const CLI_GUIDE = path.join(REPO_ROOT, "scripts/_build_commands_cli_guide.inc.sh");
const HELP_INC = path.join(REPO_ROOT, "scripts/lib/wf-trial-agentstream-help.inc.sh");

describe("wf-trial-range-receipt-assist [REQ-WF_TRIAL_RANGE_VERIFICATION_RECEIPT_ASSIST]", () => {
  it("SC-WVR-01: workflow_trial_range exports verification receipt assist by default", () => {
    const text = fs.readFileSync(BUILD_COMMANDS, "utf8");
    assert.match(text, /export WF_TRIAL_VERIFICATION_RECEIPT_ASSIST=1/);
  });

  it("SC-WVR-02: skip env branch in workflow_trial_range", () => {
    const text = fs.readFileSync(BUILD_COMMANDS, "utf8");
    assert.match(text, /WF_TRIAL_SKIP_VERIFICATION_RECEIPT_ASSIST/);
    assert.match(text, /unset WF_TRIAL_VERIFICATION_RECEIPT_ASSIST/);
  });

  it("SC-WVR-03: build-commands usage documents assist default line", () => {
    const text = fs.readFileSync(BUILD_COMMANDS, "utf8");
    assert.match(text, /WF_TRIAL_VERIFICATION_RECEIPT_ASSIST=1/);
    assert.match(text, /WF_TRIAL_SKIP_VERIFICATION_RECEIPT_ASSIST=1/);
  });

  it("SC-WVR-06: CLI guide mentions range default assist + skip", () => {
    const text = fs.readFileSync(CLI_GUIDE, "utf8");
    assert.match(text, /WF_TRIAL_VERIFICATION_RECEIPT_ASSIST=1/);
    assert.match(text, /WF_TRIAL_SKIP_VERIFICATION_RECEIPT_ASSIST=1/);
  });

  it("SC-WVR-05: orchestrator help keeps single-cell opt-in assist note", () => {
    const text = fs.readFileSync(HELP_INC, "utf8");
    assert.match(text, /Verification receipt assist opt-in · WF_TRIAL_VERIFICATION_RECEIPT_ASSIST=1/);
    const batchBlock = text.slice(text.indexOf('Batch helper'), text.indexOf("Environment"));
    assert.match(batchBlock, /WF_TRIAL_VERIFICATION_RECEIPT_ASSIST=1/);
  });
});