import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import yaml from "js-yaml";

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] W8-D6 replay fixture contract tests (static corpus + expectations).
describe("replay-adherence-fixtures corpus registration [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]", () => {
  const corpusPath = path.resolve("working/evaluation/evaluation-corpus.v1.yaml");
  const corpus = yaml.load(readFileSync(corpusPath, "utf8"));
  const aliases = ["1789147101", "1789136889", "1789087315", "1789069630"];

  it("registers four Wave 8 cohort rows with project_root and request_token", () => {
    for (const alias of aliases) {
      const row = (corpus.projects ?? []).find((item) => item.client_alias === alias);
      assert.ok(row, `missing corpus row for ${alias}`);
      assert.ok(row.project_root, `${alias} missing project_root`);
      assert.ok(row.request_token, `${alias} missing request_token`);
      assert.equal(row.envelope_require_mode, "require_envelope");
    }
  });
});
