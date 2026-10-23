/**
 * [IMPL-TIED_EASAR_RECEIPTS] [ARCH-TIED_EASAR_ARTIFACT_MODEL] [REQ-TIED_EASAR_RECOVERY]
 * MCP handler: build claim-matrix-map.v1 from claim_id ↔ matrix row pairs.
 */

import fs from "node:fs";
import path from "node:path";

import { safeStringifyJson } from "../storage-dump.js";
import { getClientProjectRoot } from "../yaml-loader.js";
import { tryPatchArtifactFile } from "../request-evidence-envelope/hooks.js";
import {
  CLAIM_MATRIX_MAP_SCHEMA,
  buildClaimMatrixMap,
  type ClaimMatrixEntry,
  type ClaimMatrixMap,
} from "./claim-matrix-map.js";

export type BuildEasarClaimMatrixMapInput = {
  request_token: string;
  entries: ClaimMatrixEntry[];
  project_root?: string;
  output_path?: string;
};

export type BuildEasarClaimMatrixMapResult = {
  ok: true;
  schema_version: typeof CLAIM_MATRIX_MAP_SCHEMA;
  map: ClaimMatrixMap;
  written_path?: string;
};

// [IMPL-TIED_EASAR_RECEIPTS] [REQ-TIED_EASAR_RECOVERY] — PRE: request_token + entries; POST: sorted unique map.
export function buildEasarClaimMatrixMap(
  input: BuildEasarClaimMatrixMapInput,
): BuildEasarClaimMatrixMapResult | { ok: false; error: string } {
  if (!input.entries?.length) {
    return { ok: false, error: "empty_entries" };
  }
  const built = buildClaimMatrixMap({
    request_token: input.request_token,
    entries: input.entries,
  });
  if (!built.ok) {
    return built;
  }

  const projectRoot = path.resolve(input.project_root ?? getClientProjectRoot());
  let written_path: string | undefined;
  if (input.output_path?.trim()) {
    const relative = input.output_path.replace(/\\/g, "/");
    const absolute = path.isAbsolute(relative)
      ? relative
      : path.join(projectRoot, relative);
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    fs.writeFileSync(absolute, safeStringifyJson(built.map), "utf8");
    written_path = path.relative(projectRoot, absolute).split(path.sep).join("/");
    void tryPatchArtifactFile({
      request_token: input.request_token,
      project_root: projectRoot,
      absolute_path: absolute,
      kind: "unknown",
      phase: "verification",
      schema_version: CLAIM_MATRIX_MAP_SCHEMA,
      proof_boundaries: ["read-only-tied-yaml", "observed-matrix-rows-not-req-authority"],
    });
  }

  return {
    ok: true,
    schema_version: CLAIM_MATRIX_MAP_SCHEMA,
    map: built.map,
    written_path,
  };
}
