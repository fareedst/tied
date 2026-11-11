import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { classifyTestFile, classifyTestFileFine } from "./proof-test-classify.js";
import { parseProofHeadersFromSource } from "./proof-label-parse.js";

describe("proof-test-classify [REQ-TIED_PROJECT_SIZE_PROOF_PATH_SEMANTICS] [IMPL-TIED_PROJECT_SIZE_PROOF_PATH_SEMANTICS]", () => {
  it("classifyTestFileFine maps subtype suffixes [SC-PPS-01]", () => {
    assert.deepEqual(classifyTestFileFine("src/a.integration.test.ts"), {
      facet: "composition",
      subtype: "composition.integration",
    });
    assert.deepEqual(classifyTestFileFine("src/a.binding.test.ts"), {
      facet: "composition",
      subtype: "composition.wiring",
    });
    assert.deepEqual(classifyTestFileFine("src/a.contract.test.ts"), {
      facet: "composition",
      subtype: "composition.contract",
    });
    assert.deepEqual(classifyTestFileFine("src/cli.test.ts"), {
      facet: "unit",
      subtype: "unit.default",
    });
  });

  it("classifyTestFile coarse tiers match fine facet [SC-PPS-02]", () => {
    assert.equal(classifyTestFile("src/cli.test.ts"), "unit");
    assert.equal(classifyTestFile("src/a.integration.test.ts"), "composition");
    assert.equal(classifyTestFile("src/binding-inventory/foo.test.ts"), "binding");
  });

  it("parseProofHeadersFromSource [SC-PPS-04]", () => {
    const src = `// PROOF_LABEL: composition.integration\nimport { test } from "node:test";\n`;
    assert.equal(parseProofHeadersFromSource(src).proof_label, "composition.integration");
    const kind = `// PROOF_KIND: composition\n`;
    assert.equal(parseProofHeadersFromSource(kind).proof_kind, "composition");
  });
});
