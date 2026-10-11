/**
 * [IMPL-METHODOLOGY-LEARNING-COHORT-EXPORT] [ARCH-METHODOLOGY-LEARNING-COHORT-EXPORT]
 * [REQ-METHODOLOGY-LEARNING-COHORT-EXPORT]
 */

import fs from "node:fs";
import path from "node:path";

import yaml from "js-yaml";

import { isForbiddenIntentPath } from "../fidelity-research/evidence-chain-profile.js";
import {
  generateEvidenceChainStatisticsReport,
  REPORT_INPUT_SCHEMA,
  type EvidenceChainStatisticsReport,
} from "../fidelity-research/evidence-chain-report.js";
import {
  EXPORT_GENERATOR,
  EXPORT_GENERATOR_VERSION,
  EXPORT_PROOF_BOUNDARY,
  EXPORT_SCHEMA_VERSION,
  type CohortExportDiagnostic,
} from "./constants.js";
import { resolveExperimentsForExport } from "./experiments.js";
import { loadCohortExportManifest, parseCohortExportManifestObject, type NormalizedCohortExportManifest } from "./manifest.js";
import { evaluateExportPolicyExpiry } from "./policy.js";
import { redactEvidenceChainReportForShareable } from "./redact.js";

export type RunCohortExportInput = {
  manifestPath?: string;
  manifest?: unknown;
  yamlOut: string;
  basePath?: string;
  cwd?: string;
  projectRoot?: string;
  now?: Date | string;
};

export type MethodologyLearningCohortExport = {
  schema_version: typeof EXPORT_SCHEMA_VERSION;
  generated_at: string;
  generator: typeof EXPORT_GENERATOR;
  generator_version: typeof EXPORT_GENERATOR_VERSION;
  proof_boundary: string;
  privacy_tier: "shareable_hashed";
  policy: NormalizedCohortExportManifest["policy"];
  experiments: Array<{ experiment_id: string; profile_paths: string[] }>;
  evidence_chain_report: EvidenceChainStatisticsReport;
  diagnostics: CohortExportDiagnostic[];
};

export type RunCohortExportResult =
  | { ok: true; export: MethodologyLearningCohortExport; yaml_path: string }
  | { ok: false; diagnostics: CohortExportDiagnostic[]; exit_code: 1 | 2 };

function resolveNow(input?: Date | string): Date {
  if (input instanceof Date) return input;
  if (typeof input === "string") return new Date(input);
  return new Date();
}

function buildReportInputsYaml(profilePaths: string[]): string {
  const unique = [...new Set(profilePaths)].sort();
  const lines = [`schema_version: ${REPORT_INPUT_SCHEMA}`, "inputs:"];
  for (const profile_path of unique) {
    lines.push(`  - profile_path: ${profile_path}`);
  }
  lines.push("");
  return lines.join("\n");
}

export function runMethodologyLearningCohortExport(input: RunCohortExportInput): RunCohortExportResult {
  const cwd = input.cwd ?? process.cwd();
  const projectRoot = input.projectRoot ?? cwd;
  const yamlOut = path.resolve(cwd, input.yamlOut);
  if (isForbiddenIntentPath(yamlOut, projectRoot)) {
    return {
      ok: false,
      exit_code: 1,
      diagnostics: [{ code: "output_path_forbidden", message: "yamlOut path is forbidden", path: yamlOut }],
    };
  }

  let manifestResult:
    | { ok: true; manifest: NormalizedCohortExportManifest }
    | { ok: false; diagnostics: CohortExportDiagnostic[] };
  if (input.manifest !== undefined) {
    manifestResult = parseCohortExportManifestObject(input.manifest);
  } else if (input.manifestPath) {
    manifestResult = loadCohortExportManifest(input.manifestPath);
  } else {
    return {
      ok: false,
      exit_code: 1,
      diagnostics: [{ code: "invalid_manifest", message: "Provide manifestPath or manifest object" }],
    };
  }
  if (!manifestResult.ok) {
    return { ok: false, exit_code: 1, diagnostics: manifestResult.diagnostics };
  }
  const manifest = manifestResult.manifest;

  const expiryDiag = evaluateExportPolicyExpiry(manifest, resolveNow(input.now));
  if (expiryDiag) {
    return { ok: false, exit_code: 1, diagnostics: [expiryDiag] };
  }

  const resolved = resolveExperimentsForExport(manifest.experiments, input.basePath);
  if (!resolved.ok) {
    return { ok: false, exit_code: 1, diagnostics: resolved.diagnostics };
  }

  const profilePaths = resolved.resolved.flatMap((row) => row.profile_paths);
  for (const rel of profilePaths) {
    const abs = path.resolve(cwd, rel);
    if (!fs.existsSync(abs)) {
      return {
        ok: false,
        exit_code: 1,
        diagnostics: [{ code: "missing_profile_artifact", message: `Profile not found: ${rel}`, path: rel }],
      };
    }
  }

  const reportInputsPath = path.join(cwd, ".cohort-export-report-inputs.yaml");
  fs.writeFileSync(reportInputsPath, buildReportInputsYaml(profilePaths), "utf8");
  const reportYaml = path.join(cwd, ".cohort-export-w4-report.yaml");
  const reportMd = path.join(cwd, ".cohort-export-w4-report.md");

  const w4 = generateEvidenceChainStatisticsReport({
    inputsPath: reportInputsPath,
    yamlOut: reportYaml,
    markdownOut: reportMd,
    modeOverride: manifest.report_mode,
    reportVersion: manifest.report_version,
    cwd,
    projectRoot,
    now: input.now,
  });

  if (!w4.ok) {
    return {
      ok: false,
      exit_code: w4.exit_code,
      diagnostics: [
        {
          code: "w4_report_failure",
          message: w4.error,
        },
      ],
    };
  }

  const redacted = redactEvidenceChainReportForShareable(w4.report);
  if (!redacted.ok) {
    return {
      ok: false,
      exit_code: 1,
      diagnostics: [{ code: redacted.code, message: redacted.message }],
    };
  }

  const generatedAt = resolveNow(input.now).toISOString();
  const exportDoc: MethodologyLearningCohortExport = {
    schema_version: EXPORT_SCHEMA_VERSION,
    generated_at: generatedAt,
    generator: EXPORT_GENERATOR,
    generator_version: EXPORT_GENERATOR_VERSION,
    proof_boundary: EXPORT_PROOF_BOUNDARY,
    privacy_tier: "shareable_hashed",
    policy: manifest.policy,
    experiments: manifest.experiments.map((row) => ({
      experiment_id: row.experiment_id,
      profile_paths: row.profile_paths,
    })),
    evidence_chain_report: redacted.report,
    diagnostics: [],
  };

  fs.mkdirSync(path.dirname(yamlOut), { recursive: true });
  fs.writeFileSync(yamlOut, yaml.dump(exportDoc, { lineWidth: 120 }), "utf8");

  console.debug("TRACE: [IMPL-METHODOLOGY-LEARNING-COHORT-EXPORT] wrote export", { yamlOut });

  return { ok: true, export: exportDoc, yaml_path: yamlOut };
}
