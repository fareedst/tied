/**
 * [IMPL-TIED_PROJECT_SIZE_PROOF_FACET_TEST_CASES] [REQ-TIED_PROJECT_SIZE_PROOF_FACET_TEST_CASES]
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { countTestCasesInSource } from "./test-case-count.js";

describe("countTestCasesInSource [IMPL-TIED_PROJECT_SIZE_PROOF_FACET_TEST_CASES]", () => {
  it("counts a single it()", () => {
    assert.equal(countTestCasesInSource('it("a", () => {});'), 1);
  });

  it("counts multiple it blocks", () => {
    const src = `
      it("one", () => {});
      it("two", () => {});
      it.skip("three", () => {});
    `;
    assert.equal(countTestCasesInSource(src), 3);
  });

  it("counts test() alias", () => {
    assert.equal(countTestCasesInSource('test("x", async () => {});'), 1);
  });

  it("ignores it( in line comments", () => {
    const src = "// it('fake', () => {})\nit('real', () => {});";
    assert.equal(countTestCasesInSource(src), 1);
  });

  it("ignores it( inside string literals", () => {
    const src = 'const s = "it("; it("real", () => {});';
    assert.equal(countTestCasesInSource(src), 1);
  });
});
