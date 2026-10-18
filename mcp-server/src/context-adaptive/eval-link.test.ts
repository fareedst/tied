/**
 * [REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING] [IMPL-TIED_CONTEXT_ADAPTIVE_EVAL_LINK]
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { buildMethodEffectivenessRefsV1 } from "./eval-link.js";
import { loadPracticeLibraryV1 } from "./contracts.js";
import { FIXTURE_PRACTICES } from "./fixtures.js";
import { validateContextProfileV1 } from "./profile.js";
import { selectPracticesDeterministicV1 } from "./selector.js";
import { CONTEXT_PROFILE_SCHEMA } from "./constants.js";

describe("context-adaptive eval-link [IMPL-TIED_CONTEXT_ADAPTIVE_EVAL_LINK]", () => {
  it("links selection receipt hash to conformance refs with observational proof boundary", () => {
    const library = loadPracticeLibraryV1(FIXTURE_PRACTICES);
    assert.equal(library.ok, true);
    const profile = validateContextProfileV1({
      schema_version: CONTEXT_PROFILE_SCHEMA,
      dimensions: { criticality: "UNKNOWN" },
    }).profile!;
    const receipt = selectPracticesDeterministicV1({ library: library.library!, profile });
    const refs = buildMethodEffectivenessRefsV1({
      selection_receipt: receipt,
      conformance_refs: ["gate:pre_implementation", "envelope:request-evidence-envelope.v1.json"],
    });
    assert.equal(refs.schema_version, "method-effectiveness-refs.v1");
    assert.equal(refs.selection_receipt_hash, receipt.context_hash);
    assert.deepEqual(refs.conformance_refs, [
      "gate:pre_implementation",
      "envelope:request-evidence-envelope.v1.json",
    ]);
    assert.match(refs.proof_boundary, /Observational/i);
    assert.match(refs.proof_boundary, /does not imply effectiveness/i);
  });

  it("does not mutate conformance_refs input array", () => {
    const library = loadPracticeLibraryV1(FIXTURE_PRACTICES);
    const profile = validateContextProfileV1({
      schema_version: CONTEXT_PROFILE_SCHEMA,
      dimensions: { criticality: "HIGH" },
    }).profile!;
    const receipt = selectPracticesDeterministicV1({ library: library.library!, profile });
    const inputRefs = ["ref-a"];
    const refs = buildMethodEffectivenessRefsV1({
      selection_receipt: receipt,
      conformance_refs: inputRefs,
    });
    inputRefs.push("ref-b");
    assert.deepEqual(refs.conformance_refs, ["ref-a"]);
  });
});
