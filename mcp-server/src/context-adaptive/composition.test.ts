/**
 * [REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING] composition — library → profile → select
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import yaml from "js-yaml";
import { loadPracticeLibraryV1 } from "./contracts.js";
import { validateContextProfileV1 } from "./profile.js";
import { selectPracticesDeterministicV1 } from "./selector.js";
import { reassessContextV1 } from "./reassess.js";
import { CONTEXT_PROFILE_SCHEMA, PRACTICE_CONTRACT_SCHEMA } from "./constants.js";

const SEED_DIR = path.resolve(
  import.meta.dirname,
  "../../../tied-bundle/resources/context-adaptive/practices",
);

function loadSeedPracticeLibrary() {
  const files = fs
    .readdirSync(SEED_DIR)
    .filter((f) => f.endsWith(".yaml"))
    .sort();
  const documents = files.map((f) => yaml.load(fs.readFileSync(path.join(SEED_DIR, f), "utf8")));
  return loadPracticeLibraryV1(documents);
}

describe("context-adaptive composition [REQ-TIED_CONTEXT_ADAPTIVE_ENGINEERING]", () => {
  it("seed library loads from tied-bundle/resources", () => {
    const library = loadSeedPracticeLibrary();
    assert.equal(library.ok, true, JSON.stringify(library.diagnostics));
    assert.ok((library.library?.contracts.length ?? 0) >= 5);
  });

  it("profile validate → select happy path for dogfood-like profile", () => {
    const library = loadSeedPracticeLibrary();
    assert.equal(library.ok, true);
    const profile = validateContextProfileV1({
      schema_version: CONTEXT_PROFILE_SCHEMA,
      objective: "EASAR CASE dogfood slice",
      dimensions: {
        uncertainty: "HIGH",
        criticality: "UNKNOWN",
        environmental: "HIGH",
        security: "UNKNOWN",
      },
    });
    assert.equal(profile.ok, true);
    const receipt = selectPracticesDeterministicV1({
      library: library.library!,
      profile: profile.profile!,
    });
    assert.ok(receipt.selected_practice_ids.length > 0);
    assert.ok(!receipt.selected_practice_ids.includes("PRACTICE-LOW-CRITICALITY-ONLY"));
    assert.equal(receipt.proof_boundary.length > 0, true);
  });

  it("incompatible practice pair rejects with rule id incompatible", () => {
    const docs = [
      {
        schema_version: PRACTICE_CONTRACT_SCHEMA,
        id: "PRACTICE-A",
        name: "A",
        applicability: { criticality: ["HIGH", "UNKNOWN"] },
      },
      {
        schema_version: PRACTICE_CONTRACT_SCHEMA,
        id: "PRACTICE-B",
        name: "B",
        applicability: { criticality: ["HIGH", "UNKNOWN"] },
        incompatible_with: ["PRACTICE-A"],
      },
    ];
    const library = loadPracticeLibraryV1(docs);
    assert.equal(library.ok, true);
    const profile = validateContextProfileV1({
      schema_version: CONTEXT_PROFILE_SCHEMA,
      dimensions: { criticality: "HIGH" },
    }).profile!;
    const receipt = selectPracticesDeterministicV1({ library: library.library!, profile });
    const rejectedB = receipt.rejected_practice_ids.find((r) => r.id === "PRACTICE-B");
    assert.ok(rejectedB);
    assert.equal(rejectedB?.rule_id, "incompatible");
  });

  it("reassessment on increased risk yields loop_back", () => {
    const prior = validateContextProfileV1({
      schema_version: CONTEXT_PROFILE_SCHEMA,
      dimensions: { criticality: "MEDIUM", rate_of_change: "LOW" },
    }).profile!;
    const revised = validateContextProfileV1({
      schema_version: CONTEXT_PROFILE_SCHEMA,
      dimensions: { criticality: "HIGH", rate_of_change: "HIGH" },
    }).profile!;
    const library = loadSeedPracticeLibrary();
    const priorReceipt = selectPracticesDeterministicV1({ library: library.library!, profile: prior });
    const result = reassessContextV1({
      prior_profile: prior,
      revised_profile: revised,
      prior_receipt: priorReceipt,
    });
    assert.equal(result.action, "loop_back");
    assert.notEqual(result.prior_context_hash, result.revised_context_hash);
  });
});
