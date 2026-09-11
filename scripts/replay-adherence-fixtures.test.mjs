import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import yaml from "js-yaml";

import { grammarV2HeaderExpectPass } from "./lib/corpus-grammar-v2-replay.mjs";

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT] W8-D6 replay fixture contract tests.
describe("replay-adherence-fixtures corpus registration [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]", () => {
  const corpusPath = path.resolve("working/evaluation/evaluation-corpus.v1.yaml");
  const corpus = yaml.load(readFileSync(corpusPath, "utf8"));
  const aliases = ["1789147101", "1789136889", "1789087315", "1789069630"];

  it("treats grammar_v2_header_expect pass as enforceable cohort dimension", () => {
    assert.equal(grammarV2HeaderExpectPass({ grammar_v2_header_expect: "pass" }), true);
    assert.equal(grammarV2HeaderExpectPass({ grammar_v2_header_expect: "not_measured" }), false);
  });

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
