/**
 * [REQ-HARNESS_EVAL_METERING_CANARY_WORKFLOW] [SC-HEMC-03] [SC-HEMC-04]
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const CATALOG = path.join(REPO_ROOT, "docs/agent-harness-evaluation/catalogs/catalog-harness-metering-lite-workflow.md");
const SUITE = path.join(REPO_ROOT, "docs/agent-harness-evaluation/harness-eval/suites/metering-canary-suite-v1.yaml");

function extractMeterPrompt(md) {
  const hdr = "### PROMPT-WF-METER-01";
  const lines = md.split("\n");
  let inSec = false;
  let inText = false;
  const out = [];
  for (const line of lines) {
    if (line === hdr) {
      inSec = true;
      continue;
    }
    if (inSec && /^### PROMPT-/.test(line)) {
      break;
    }
    if (inSec && line === "```text") {
      inText = true;
      continue;
    }
    if (inSec && inText && line === "```") {
      break;
    }
    if (inSec && inText) {
      out.push(line);
    }
  }
  return out.join("\n").trim();
}

describe("wf-trial-metering-catalog-contract", () => {
  it("SC-HEMC-03 catalog has budgets and meteringCanaryLabel remainder", () => {
    const md = fs.readFileSync(CATALOG, "utf8");
    assert.match(md, /Controlled budgets/i);
    assert.match(md, /≤ 45/);
    assert.match(md, /8–15 minutes|8-15 minutes/);
    const block = extractMeterPrompt(md);
    assert.match(block, /meteringCanaryLabel/);
    assert.match(block, /harness-meter-canary-v1/);
  });

  it("SC-HEMC-04 suite YAML lists wf-meter-01 four steps", () => {
    const raw = fs.readFileSync(SUITE, "utf8");
    assert.match(raw, /scenario_id:\s*wf-meter-01/);
    assert.match(raw, /prompt_workflow_ref:\s*PROMPT-WF-METER-01/);
    assert.match(raw, /prompt_ref:\s*add-feature/);
    assert.match(raw, /prompt_ref:\s*refine-plan/);
    assert.match(raw, /prompt_ref:\s*build-plan/);
    assert.match(raw, /prompt_ref:\s*close-out/);
  });
});
