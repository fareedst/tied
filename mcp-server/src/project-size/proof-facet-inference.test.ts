import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { analyzeTestFileInference } from "./proof-facet-inference.js";
import { resolveProofSubtypeForFile } from "./proof-label-resolve.js";

describe("proof-facet-inference [REQ-TIED_PROJECT_SIZE_PROOF_FACET_INFERENCE]", () => {
  it("binding_inferred when two impl imports [SC-INF-02]", () => {
    const src = `
import { a } from "./helpers/a.js";
import { b } from "./helpers/b.js";
import { it } from "node:test";
it("x", () => {});
`;
    const r = analyzeTestFileInference(src);
    assert.equal(r.binding_inferred, true);
    assert.deepEqual(r.imported_impl_basenames, ["a", "b"]);
  });

  it("PROOF_LABEL overrides path subtype [SC-INF-04]", () => {
    const src = `// PROOF_LABEL: composition.integration\nimport { it } from "node:test";\nit("t", () => {});\n`;
    assert.equal(resolveProofSubtypeForFile("src/plain.test.ts", src), "composition.integration");
  });
});
