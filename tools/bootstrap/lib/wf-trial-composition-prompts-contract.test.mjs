/**
 * [REQ-WF_TRIAL_COMPOSITION_PROMPTS] [SC-CATALOG-09-12]
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const CATALOG = path.join(REPO_ROOT, "docs/demos/catalog-traditional-workflow-trial-prompts.md");

function extractPromptBlock(md, wfNum) {
  const hdr = `### PROMPT-WF-${wfNum}`;
  const lines = md.split("\n");
  let inSec = false;
  let inText = false;
  const out = [];
  for (const line of lines) {
    if (line === hdr) {
      inSec = true;
      continue;
    }
    if (inSec && /^### PROMPT-WF-/.test(line)) {
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
  return out.join("\n");
}

describe("wf-trial-composition-prompts-contract", () => {
  const md = fs.readFileSync(CATALOG, "utf8");

  it("has twelve prompt headers [SC-CATALOG-09-12]", () => {
    for (let n = 1; n <= 12; n++) {
      const pad = String(n).padStart(2, "0");
      assert.match(md, new RegExp(`### PROMPT-WF-${pad}\\b`));
    }
  });

  it("facilitator index includes WF-09 through WF-12", () => {
    for (const n of ["09", "10", "11", "12"]) {
      assert.match(md, new RegExp(`\\| PROMPT-WF-${n} \\|`));
    }
  });

  it("WF-09 remainder mentions concurrent workers [SC-WF-EXTRACT-09]", () => {
    const block = extractPromptBlock(md, "09");
    assert.ok(block.length > 40, "WF-09 block missing");
    assert.match(block, /concurrent workers/i);
    assert.match(block, /module binding/i);
  });

  it("prompts 09-12 require binding or wiring language", () => {
    for (const n of ["09", "10", "11", "12"]) {
      const block = extractPromptBlock(md, n);
      assert.match(block, /unit tests/i);
      assert.match(block, /graphical UI|without graphical UI/i);
    }
  });

  it("documents composition evidence grading sub-check", () => {
    assert.match(md, /Composition evidence/i);
  });
});
