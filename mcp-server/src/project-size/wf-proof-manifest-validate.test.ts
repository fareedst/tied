import assert from "node:assert/strict";
import { describe, it } from "node:test";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildProjectSizeSnapshot } from "./snapshot-builder.js";
import { validateProofFacetManifestShape, validateWfProofManifest } from "./wf-proof-manifest-validate.js";
import { PROOF_BOUNDARY } from "./types.js";
import type { ProofFacetManifestV1 } from "./wf-proof-manifest-types.js";

const fixtureRoot = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../../test/fixtures/project-size/mini-client",
);

describe("wf-proof-manifest-validate [REQ-WF_TRIAL_PROOF_MANIFEST_LITE]", () => {
  it("rejects unknown proof_subtype [SC-MAN-02]", () => {
    const bad = {
      schema_version: "proof-facet-manifest.v1",
      prompt_id: "PROMPT-WF-09",
      proof_boundary: PROOF_BOUNDARY,
      files: [{ path: "src/a.test.ts", proof_facet: "unit", proof_subtype: "smoke.invalid" }],
    };
    const r = validateProofFacetManifestShape(bad);
    assert.equal(r.ok, false);
    assert.ok(r.errors.some((e) => e.code === "UNKNOWN_SUBTYPE"));
  });

  it("manifest override changes label_case_counts [SC-MAN-03]", async () => {
    const manifest: ProofFacetManifestV1 = {
      schema_version: "proof-facet-manifest.v1",
      prompt_id: "PROMPT-WF-10",
      proof_boundary: PROOF_BOUNDARY,
      files: [
        {
          path: "src/colocated-wiring.test.ts",
          proof_facet: "composition",
          proof_subtype: "composition.wiring",
        },
      ],
    };
    const without = await buildProjectSizeSnapshot({ repo_root: fixtureRoot });
    const withManifest = await buildProjectSizeSnapshot({
      repo_root: fixtureRoot,
      proof_facet_manifest: manifest,
    });
    assert.equal(without.layers.proof_facets.label_case_counts?.["unit.default"], 7);
    assert.equal(withManifest.layers.proof_facets.label_case_counts?.["unit.default"], 5);
    assert.ok(
      (withManifest.layers.proof_facets.label_case_counts?.["composition.wiring"] ?? 0) >= 3,
    );
    const v = await validateWfProofManifest({
      repo_root: fixtureRoot,
      manifest,
      blocking: false,
    });
    assert.equal(v.ok, true);
    assert.equal(v.advisory, true);
  });
});
