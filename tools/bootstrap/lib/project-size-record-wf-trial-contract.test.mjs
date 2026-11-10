// [REQ-TIED_PROJECT_SIZE_LAYERS] Contract: record-wf-trial reference documents size layers appendix.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

const TIED_REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const WF_REF = path.join(TIED_REPO_ROOT, "tools/bundled-record-wf-trial-skill/reference.md");

describe("record-wf-trial project size contract [REQ-TIED_PROJECT_SIZE_LAYERS]", () => {
  it("reference documents size layers appendix and JSONL path", () => {
    const text = readFileSync(WF_REF, "utf8");
    assert.match(text, /## Project size layers/);
    assert.match(text, /tied_project_size_snapshot/);
    assert.match(text, /wf-trial-cohort\/runs\.jsonl/);
    assert.match(text, /project-size-metrics\.registry\.yaml/);
    assert.match(text, /proof_boundary/);
  });
});
