/**
 * [REQ-WF_TRIAL_COMPOSITION_PROMPTS] [REQ-WF_TRIAL_COMPOSITION_GOAL_PROMPTS]
 * [SC-CATALOG-09-12] [SC-GOAL-NO-ARCH] [SC-GOAL-BEHAVIOR-09] [SC-GOAL-TYPESCRIPT] [SC-GOAL-NO-UI]
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const CATALOG = path.join(REPO_ROOT, "docs/demos/catalog-traditional-workflow-trial-prompts.md");

/** Architectural mandates forbidden in paste (facilitator grades binding from PLAN/tests). */
const FORBIDDEN_IN_PASTE = [
  /at least two modules/i,
  /separate wiring/i,
  /wiring layer/i,
  /module binding/i,
  /fourth module/i,
  /entry module that wires/i,
  /registers both handlers/i,
  /composition test/i,
  /binding test/i,
  /wiring together/i,
  /without spawning a subprocess/i,
];

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

  it("documents goal-first paste policy for WF-09-12", () => {
    assert.match(md, /goal-first paste/i);
    assert.match(md, /Composition evidence/i);
  });

  it("WF-09 stresses concurrent order preservation [SC-GOAL-BEHAVIOR-09]", () => {
    const block = extractPromptBlock(md, "09");
    assert.ok(block.length > 40, "WF-09 block missing");
    assert.match(block, /concurrent/i);
    assert.match(block, /same order as the input/i);
    assert.match(block, /deterministic delays/i);
  });

  it("prompts 09-12 are goal-first TypeScript with no UI [SC-GOAL-TYPESCRIPT] [SC-GOAL-NO-UI]", () => {
    for (const n of ["09", "10", "11", "12"]) {
      const block = extractPromptBlock(md, n);
      assert.match(block, /TypeScript/i);
      assert.match(block, /automated tests/i);
      assert.match(block, /no graphical UI/i);
    }
  });

  it("prompts 09-12 omit architectural mandates in paste [SC-GOAL-NO-ARCH]", () => {
    for (const n of ["09", "10", "11", "12"]) {
      const block = extractPromptBlock(md, n);
      for (const pattern of FORBIDDEN_IN_PASTE) {
        assert.doesNotMatch(
          block,
          pattern,
          `PROMPT-WF-${n} must not match forbidden paste pattern ${pattern}`,
        );
      }
    }
  });
});
