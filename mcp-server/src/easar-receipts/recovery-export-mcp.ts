/**
 * [IMPL-TIED_EASAR_RECEIPTS] [REQ-TIED_EASAR_RECOVERY]
 * MCP handler: BUILD_EASAR_RECOVERY_EXPORT_MCP
 */

import fs from "node:fs";
import path from "node:path";

import { getClientProjectRoot } from "../yaml-loader.js";
import { tryPatchArtifactFile } from "../request-evidence-envelope/hooks.js";
import {
  buildRecoveryExportManifestV1,
  loadRecoveryPortableMapFromFile,
  RECOVERY_EXPORT_MANIFEST_V1_SCHEMA,
  type RecoveryExportManifestV1,
} from "./recovery-export-v1.js";

export type BuildEasarRecoveryExportInput = {
  request_token: string;
  map_path: string;
  project_root?: string;
  working_root?: string;
  git_rev?: string;
  output_dir?: string;
  manifest_output_path?: string;
};

export type BuildEasarRecoveryExportResult = {
  ok: true;
  schema_version: typeof RECOVERY_EXPORT_MANIFEST_V1_SCHEMA;
  manifest: RecoveryExportManifestV1;
  written_manifest_path?: string;
  written_export_files?: string[];
};

// [IMPL-TIED_EASAR_RECEIPTS] [REQ-TIED_EASAR_RECOVERY] — BUILD_EASAR_RECOVERY_EXPORT_MCP
export function buildEasarRecoveryExport(
  input: BuildEasarRecoveryExportInput,
): BuildEasarRecoveryExportResult | { ok: false; error: string } {
  const projectRoot = path.resolve(input.project_root ?? getClientProjectRoot());
  const mapRelative = input.map_path.replace(/\\/g, "/");
  const mapAbsolute = path.isAbsolute(mapRelative)
    ? mapRelative
    : path.join(projectRoot, mapRelative);

  const loaded = loadRecoveryPortableMapFromFile(mapAbsolute);
  if (!loaded.ok) {
    return loaded;
  }
  if (loaded.map.request_token !== input.request_token) {
    return { ok: false, error: "request_token_map_mismatch" };
  }

  const workingRoot =
    input.working_root?.trim() ??
    `tied-project/working/${input.request_token}`;

  const built = buildRecoveryExportManifestV1({
    map: loaded.map,
    map_path: mapRelative,
    project_root: projectRoot,
    working_root: workingRoot,
    git_rev: input.git_rev,
    output_dir: input.output_dir,
  });
  if (!built.ok) {
    return built;
  }

  let written_manifest_path: string | undefined;
  if (input.manifest_output_path?.trim()) {
    const rel = input.manifest_output_path.replace(/\\/g, "/");
    const absolute = path.isAbsolute(rel) ? rel : path.join(projectRoot, rel);
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    fs.writeFileSync(absolute, `${JSON.stringify(built.manifest, null, 2)}\n`, "utf8");
    written_manifest_path = path.relative(projectRoot, absolute).split(path.sep).join("/");
    void tryPatchArtifactFile({
      request_token: input.request_token,
      project_root: projectRoot,
      absolute_path: absolute,
      kind: "unknown",
      phase: "verification",
      schema_version: RECOVERY_EXPORT_MANIFEST_V1_SCHEMA,
      proof_boundaries: [
        "read-only-tied-yaml",
        "regenerable-local-inquiry-artifacts",
        "observed-matrix-rows-not-req-authority",
      ],
    });
  }

  return {
    ok: true,
    schema_version: RECOVERY_EXPORT_MANIFEST_V1_SCHEMA,
    manifest: built.manifest,
    written_manifest_path,
    written_export_files: built.written_files,
  };
}
