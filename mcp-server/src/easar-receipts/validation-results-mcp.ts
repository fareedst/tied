/**
 * [IMPL-TIED_EASAR_RECEIPTS] [ARCH-TIED_EASAR_ARTIFACT_MODEL] [REQ-TIED_EASAR_RECOVERY]
 * MCP handler: RUN_EASAR_VALIDATION_SUITE_V1 + optional write validation-results.v1.json.
 */

import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

import { getClientProjectRoot } from "../yaml-loader.js";
import { tryPatchArtifactFile } from "../request-evidence-envelope/hooks.js";
import { parseValidationCasesYaml } from "./validation-cases-v1.js";
import { VALIDATION_RESULTS_V1_SCHEMA, type ValidationResultsV1 } from "./validation-results-v1.js";
import { runEasarValidationSuiteV1 } from "./validation-suite.js";

export type RunEasarValidationSuiteInput = {
  request_token: string;
  cases_path: string;
  project_root?: string;
  git_rev?: string;
  evidence_refs?: string[];
  output_path?: string;
  min_cases?: number;
};

export type RunEasarValidationSuiteResult = {
  ok: true;
  schema_version: typeof VALIDATION_RESULTS_V1_SCHEMA;
  results: ValidationResultsV1;
  written_path?: string;
};

function resolveGitRev(projectRoot: string, override?: string): string {
  if (override?.trim()) {
    return override.trim();
  }
  try {
    return execSync("git rev-parse HEAD", { cwd: projectRoot, encoding: "utf8" }).trim();
  } catch {
    return "unknown-git-rev";
  }
}

// [IMPL-TIED_EASAR_RECEIPTS] [REQ-TIED_EASAR_RECOVERY] — BUILD_EASAR_VALIDATION_RESULTS_MCP
export function runEasarValidationSuiteMcp(
  input: RunEasarValidationSuiteInput,
): RunEasarValidationSuiteResult | { ok: false; error: string } {
  const projectRoot = path.resolve(input.project_root ?? getClientProjectRoot());
  const casesRelative = input.cases_path.replace(/\\/g, "/");
  const casesAbsolute = path.isAbsolute(casesRelative)
    ? casesRelative
    : path.join(projectRoot, casesRelative);
  if (!fs.existsSync(casesAbsolute)) {
    return { ok: false, error: "cases_load_failed" };
  }
  const parsed = parseValidationCasesYaml(fs.readFileSync(casesAbsolute, "utf8"), {
    min_cases: input.min_cases ?? 8,
  });
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }
  if (parsed.document.request_token !== input.request_token) {
    return { ok: false, error: "request_token_mismatch" };
  }

  const results = runEasarValidationSuiteV1({
    document: parsed.document,
    project_root: projectRoot,
    cases_path: path.relative(projectRoot, casesAbsolute).split(path.sep).join("/"),
    git_rev: resolveGitRev(projectRoot, input.git_rev ?? parsed.document.git_rev),
    evidence_refs: input.evidence_refs,
  });

  let written_path: string | undefined;
  if (input.output_path?.trim()) {
    const relative = input.output_path.replace(/\\/g, "/");
    const absolute = path.isAbsolute(relative)
      ? relative
      : path.join(projectRoot, relative);
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    fs.writeFileSync(absolute, `${JSON.stringify(results, null, 2)}\n`, "utf8");
    written_path = path.relative(projectRoot, absolute).split(path.sep).join("/");
    void tryPatchArtifactFile({
      request_token: input.request_token,
      project_root: projectRoot,
      absolute_path: absolute,
      kind: "unknown",
      phase: "verification",
      schema_version: VALIDATION_RESULTS_V1_SCHEMA,
      proof_boundaries: [
        "read-only-tied-yaml",
        "observed-matrix-rows-not-req-authority",
      ],
    });
  }

  return {
    ok: true,
    schema_version: VALIDATION_RESULTS_V1_SCHEMA,
    results,
    written_path,
  };
}
