/**
 * [IMPL-TIED_EASAR_RECEIPTS] [ARCH-TIED_EASAR_ARTIFACT_MODEL] [REQ-TIED_EASAR_RECOVERY]
 * MCP handler: build reflexion-report.v1 (export-only synthesis).
 */

import fs from "node:fs";
import path from "node:path";

import { safeStringifyJson } from "../storage-dump.js";
import { getClientProjectRoot } from "../yaml-loader.js";
import { tryPatchArtifactFile } from "../request-evidence-envelope/hooks.js";
import {
  REFLEXION_REPORT_V1_SCHEMA,
  synthesizeReflexionReportV1FromInputs,
  type ReflexionDivergence,
  type ReflexionReportV1,
} from "./reflexion-report-v1.js";

export type BuildEasarReflexionReportInput = {
  request_token: string;
  inquiry_run_id: string;
  gate_allowed: boolean;
  obligation_report_ref: string;
  adversarial_ledger_ref?: string;
  divergences?: ReflexionDivergence[];
  project_root?: string;
  output_path?: string;
};

export type BuildEasarReflexionReportResult = {
  ok: true;
  schema_version: typeof REFLEXION_REPORT_V1_SCHEMA;
  report: ReflexionReportV1;
  written_path?: string;
};

// [IMPL-TIED_EASAR_RECEIPTS] [REQ-TIED_EASAR_RECOVERY] — BUILD_EASAR_REFLEXION_REPORT_MCP
export function buildEasarReflexionReport(
  input: BuildEasarReflexionReportInput,
): BuildEasarReflexionReportResult | { ok: false; error: string } {
  const built = synthesizeReflexionReportV1FromInputs(input);
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
    fs.writeFileSync(absolute, safeStringifyJson(built.report), "utf8");
    written_path = path.relative(projectRoot, absolute).split(path.sep).join("/");
    void tryPatchArtifactFile({
      request_token: input.request_token,
      project_root: projectRoot,
      absolute_path: absolute,
      kind: "unknown",
      phase: "verification",
      schema_version: REFLEXION_REPORT_V1_SCHEMA,
      proof_boundaries: [
        "read-only-tied-yaml",
        "regenerable-local-inquiry-artifacts",
        "observed-matrix-rows-not-req-authority",
      ],
    });
  }

  return {
    ok: true,
    schema_version: REFLEXION_REPORT_V1_SCHEMA,
    report: built.report,
    written_path,
  };
}
