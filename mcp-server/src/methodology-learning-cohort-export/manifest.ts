/**
 * [IMPL-METHODOLOGY-LEARNING-COHORT-EXPORT] [REQ-METHODOLOGY-LEARNING-COHORT-EXPORT]
 */

import fs from "node:fs";
import path from "node:path";

import yaml from "js-yaml";

import {
  MANIFEST_SCHEMA_VERSION,
  PILOT_STDD,
  type CohortExportDiagnostic,
} from "./constants.js";

export type NormalizedExperimentRow = {
  experiment_id: string;
  profile_paths: string[];
};

export type NormalizedCohortExportManifest = {
  schema_version: typeof MANIFEST_SCHEMA_VERSION;
  privacy_tier: "shareable_hashed";
  policy: {
    redaction_owner: string;
    expiry: string;
    pilot: typeof PILOT_STDD | string;
  };
  report_mode: "strict" | "partial";
  report_version: "v1" | "v2";
  experiments: NormalizedExperimentRow[];
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function pushInvalid(diagnostics: CohortExportDiagnostic[], message: string, at?: string): void {
  diagnostics.push({ code: "invalid_manifest", message, path: at });
}

function isSafeRelativePath(value: string): boolean {
  if (path.isAbsolute(value)) return false;
  const normalized = path.normalize(value);
  if (normalized.startsWith("..") || normalized.includes(`${path.sep}..${path.sep}`)) return false;
  return normalized.length > 0;
}

export function parseCohortExportManifestObject(
  doc: unknown,
): { ok: true; manifest: NormalizedCohortExportManifest } | { ok: false; diagnostics: CohortExportDiagnostic[] } {
  const diagnostics: CohortExportDiagnostic[] = [];
  if (!isRecord(doc)) {
    pushInvalid(diagnostics, "Manifest must be a mapping", "$");
    return { ok: false, diagnostics };
  }
  if (doc.schema_version !== MANIFEST_SCHEMA_VERSION) {
    pushInvalid(diagnostics, `schema_version must be ${MANIFEST_SCHEMA_VERSION}`, "schema_version");
  }
  if (doc.privacy_tier !== "shareable_hashed") {
    pushInvalid(diagnostics, "privacy_tier must be shareable_hashed for this export", "privacy_tier");
  }
  const policy = doc.policy;
  if (!isRecord(policy)) {
    pushInvalid(diagnostics, "policy mapping is required", "policy");
  } else {
    if (typeof policy.redaction_owner !== "string" || !policy.redaction_owner.trim()) {
      diagnostics.push({
        code: "redaction_owner_missing",
        message: "policy.redaction_owner is required",
        path: "policy.redaction_owner",
      });
    }
    if (typeof policy.expiry !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(policy.expiry)) {
      pushInvalid(diagnostics, "policy.expiry must be YYYY-MM-DD", "policy.expiry");
    }
    if (policy.pilot !== PILOT_STDD) {
      diagnostics.push({
        code: "pilot_scope_violation",
        message: `policy.pilot must be ${PILOT_STDD} until sponsor broadens scope`,
        path: "policy.pilot",
      });
    }
  }
  const reportMode = doc.report_mode === "partial" ? "partial" : doc.report_mode === "strict" ? "strict" : undefined;
  if (!reportMode) {
    pushInvalid(diagnostics, "report_mode must be strict or partial", "report_mode");
  }
  const reportVersion = doc.report_version === "v2" ? "v2" : doc.report_version === "v1" ? "v1" : undefined;
  if (!reportVersion) {
    pushInvalid(diagnostics, "report_version must be v1 or v2", "report_version");
  }
  const experimentsRaw = doc.experiments;
  if (!Array.isArray(experimentsRaw) || experimentsRaw.length === 0) {
    pushInvalid(diagnostics, "experiments must be a non-empty array", "experiments");
  }
  const experiments: NormalizedExperimentRow[] = [];
  const seenIds = new Set<string>();
  if (Array.isArray(experimentsRaw)) {
    for (let i = 0; i < experimentsRaw.length; i++) {
      const row = experimentsRaw[i];
      if (!isRecord(row)) {
        pushInvalid(diagnostics, "experiment row must be a mapping", `experiments[${i}]`);
        continue;
      }
      const experimentId = typeof row.experiment_id === "string" ? row.experiment_id.trim() : "";
      if (!experimentId) {
        pushInvalid(diagnostics, "experiment_id is required", `experiments[${i}].experiment_id`);
        continue;
      }
      if (seenIds.has(experimentId)) {
        diagnostics.push({
          code: "duplicate_experiment",
          message: `Duplicate experiment_id ${experimentId}`,
          path: `experiments[${i}].experiment_id`,
        });
        continue;
      }
      seenIds.add(experimentId);
      const pathsRaw = row.profile_paths;
      if (!Array.isArray(pathsRaw) || pathsRaw.length === 0) {
        pushInvalid(diagnostics, "profile_paths must be a non-empty array", `experiments[${i}].profile_paths`);
        continue;
      }
      const profile_paths: string[] = [];
      for (let j = 0; j < pathsRaw.length; j++) {
        const p = pathsRaw[j];
        if (typeof p !== "string" || !isSafeRelativePath(p)) {
          pushInvalid(diagnostics, "profile_paths entries must be safe relative paths", `experiments[${i}].profile_paths[${j}]`);
          continue;
        }
        profile_paths.push(path.normalize(p));
      }
      if (profile_paths.length === 0) continue;
      profile_paths.sort();
      experiments.push({ experiment_id: experimentId, profile_paths });
    }
  }
  experiments.sort((a, b) => a.experiment_id.localeCompare(b.experiment_id));
  if (diagnostics.length > 0) {
    return { ok: false, diagnostics };
  }
  const pol = policy as Record<string, unknown>;
  return {
    ok: true,
    manifest: {
      schema_version: MANIFEST_SCHEMA_VERSION,
      privacy_tier: "shareable_hashed",
      policy: {
        redaction_owner: String(pol.redaction_owner).trim(),
        expiry: String(pol.expiry),
        pilot: PILOT_STDD,
      },
      report_mode: reportMode!,
      report_version: reportVersion!,
      experiments,
    },
  };
}

export function loadCohortExportManifest(manifestPath: string):
  | { ok: true; manifest: NormalizedCohortExportManifest }
  | { ok: false; diagnostics: CohortExportDiagnostic[] } {
  if (!fs.existsSync(manifestPath)) {
    return {
      ok: false,
      diagnostics: [{ code: "invalid_manifest", message: "Manifest file not found", path: manifestPath }],
    };
  }
  try {
    const parsed = yaml.load(fs.readFileSync(manifestPath, "utf8")) as unknown;
    return parseCohortExportManifestObject(parsed);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, diagnostics: [{ code: "invalid_manifest", message, path: manifestPath }] };
  }
}
