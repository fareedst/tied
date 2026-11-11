/**
 * [REQ-WF_TRIAL_PROOF_MANIFEST_LITE] [IMPL-WF_TRIAL_PROOF_MANIFEST_LITE]
 */

import type { ProofFacet, ProofSubtype } from "./proof-test-classify.js";

export const PROOF_FACET_MANIFEST_SCHEMA_VERSION = "proof-facet-manifest.v1";

export type ProofFacetManifestFileRow = {
  path: string;
  proof_facet: ProofFacet;
  proof_subtype: ProofSubtype;
  colocated_unit?: boolean;
  tags?: string[];
  e2e_only_reason?: string;
};

export type ProofFacetManifestBindingRow = {
  id: string;
  trigger: string;
  callee: string;
  test_files: string[];
  proof_subtype?: ProofSubtype;
};

export type ProofFacetManifestV1 = {
  schema_version: typeof PROOF_FACET_MANIFEST_SCHEMA_VERSION;
  prompt_id: string;
  proof_boundary: string;
  bindings?: ProofFacetManifestBindingRow[];
  files?: ProofFacetManifestFileRow[];
};
