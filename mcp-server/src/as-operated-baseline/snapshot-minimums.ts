/**
 * [IMPL-TIED_AS_OPERATED_BASELINE] [ARCH-TIED_AS_OPERATED_BASELINE] [REQ-TIED_AS_OPERATED_BASELINE]
 */

import fs from "node:fs";
import path from "node:path";

import yaml from "js-yaml";

export type ValidationResult = { ok: boolean; diagnostics: string[] };

const ARTIFACTS_00_09 = [
  "00-mission-boundary-and-assumptions.md",
  "01-users-outcomes-and-domain.md",
  "02-capabilities-and-workflows.md",
  "03-contracts-and-observed-behavior.md",
  "04-as-built-and-as-operated.md",
  "05-data-state-and-integrations.md",
  "06-quality-operations-security.md",
  "07-failure-risk-and-historical-decisions.md",
  "08-verification-and-characterization.md",
  "09-evidence-uncertainties-and-questions.md",
];

const REGISTRY_FILES = [
  "actors.yaml",
  "outcomes.yaml",
  "capabilities.yaml",
  "workflows.yaml",
  "contracts.yaml",
  "data.yaml",
  "integrations.yaml",
  "quality.yaml",
  "failures.yaml",
  "evidence.yaml",
  "gaps.yaml",
  "verification.yaml",
  "topology.yaml",
];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// [IMPL-TIED_AS_OPERATED_BASELINE] — How: count registry records whose id starts with prefix.
export function countRegistryRecords(registryFile: string, idPrefix: string): number {
  if (!fs.existsSync(registryFile)) return 0;
  let doc: unknown;
  try {
    doc = yaml.load(fs.readFileSync(registryFile, "utf8"));
  } catch {
    return 0;
  }
  if (!isRecord(doc)) return 0;
  const records = doc.records;
  if (!Array.isArray(records)) return 0;
  return records.filter((row) => {
    if (!isRecord(row)) return false;
    const id = row.id;
    return typeof id === "string" && id.startsWith(idPrefix);
  }).length;
}

function registryPath(root: string, name: string): string {
  return path.join(root, "registry", name);
}

// [IMPL-TIED_AS_OPERATED_BASELINE] [REQ-TIED_AS_OPERATED_BASELINE] — PRE: mission file path; POST: G-0 charter checks.
export function validateMissionG0(missionPath: string): ValidationResult {
  const diagnostics: string[] = [];
  if (!fs.existsSync(missionPath)) {
    return { ok: false, diagnostics: ["missing_mission_00"] };
  }
  const text = fs.readFileSync(missionPath, "utf8");
  const lower = text.toLowerCase();
  if (!/(git revision|revision|charter)/i.test(text)) {
    diagnostics.push("mission_missing_git_revision");
  }
  if (!/8/.test(text) || !/(11|deferr)/i.test(lower)) {
    diagnostics.push("mission_missing_phase_8_11_deferral");
  }
  return { ok: diagnostics.length === 0, diagnostics };
}

function validateReceipt(projectRoot: string, receiptRel: string | undefined): ValidationResult {
  if (!receiptRel?.trim()) {
    return { ok: false, diagnostics: ["missing_snapshot_receipt_path"] };
  }
  const abs = path.isAbsolute(receiptRel) ? receiptRel : path.join(projectRoot, receiptRel);
  if (!fs.existsSync(abs)) {
    return { ok: false, diagnostics: ["missing_snapshot_receipt_file"] };
  }
  return { ok: true, diagnostics: [] };
}

// [IMPL-TIED_AS_OPERATED_BASELINE] — Snapshot-A at composition-integration (PLAN partial gates).
export function validateSnapshotA(workingRoot: string, projectRoot: string, receiptRel?: string): ValidationResult {
  const diagnostics: string[] = [];
  if (!fs.existsSync(workingRoot)) {
    return { ok: false, diagnostics: ["missing_snapshot_composition_integration"] };
  }

  diagnostics.push(...validateMissionG0(path.join(workingRoot, "00-mission-boundary-and-assumptions.md")).diagnostics);

  if (countRegistryRecords(registryPath(workingRoot, "actors.yaml"), "ACT-") < 1) {
    diagnostics.push("snapshot_a_insufficient_ACT");
  }
  if (countRegistryRecords(registryPath(workingRoot, "capabilities.yaml"), "CAP-") < 3) {
    diagnostics.push("snapshot_a_insufficient_CAP");
  }
  if (countRegistryRecords(registryPath(workingRoot, "contracts.yaml"), "CON-") < 5) {
    diagnostics.push("snapshot_a_insufficient_CON");
  }
  if (countRegistryRecords(registryPath(workingRoot, "integrations.yaml"), "INT-") < 2) {
    diagnostics.push("snapshot_a_insufficient_INT");
  }
  if (!fs.existsSync(path.join(workingRoot, "registry", "topology.yaml"))) {
    diagnostics.push("snapshot_a_missing_topology");
  }
  if (countRegistryRecords(registryPath(workingRoot, "evidence.yaml"), "EV-") < 3) {
    diagnostics.push("snapshot_a_insufficient_EV");
  }
  if (countRegistryRecords(registryPath(workingRoot, "data.yaml"), "DAT-") < 1) {
    diagnostics.push("snapshot_a_insufficient_DAT");
  }

  diagnostics.push(...validateReceipt(projectRoot, receiptRel).diagnostics);

  const unique = [...new Set(diagnostics)];
  return { ok: unique.length === 0, diagnostics: unique };
}

// [IMPL-TIED_AS_OPERATED_BASELINE] — Snapshot-B before verification-gate (analysis G-0–G-7, G-9).
export function validateSnapshotB(workingRoot: string, projectRoot: string, receiptRel?: string): ValidationResult {
  const diagnostics: string[] = [];
  if (!fs.existsSync(workingRoot)) {
    return { ok: false, diagnostics: ["missing_snapshot_pre_verification"] };
  }

  diagnostics.push(...validateMissionG0(path.join(workingRoot, "00-mission-boundary-and-assumptions.md")).diagnostics);

  for (const artifact of ARTIFACTS_00_09) {
    if (!fs.existsSync(path.join(workingRoot, artifact))) {
      diagnostics.push(`snapshot_b_missing_artifact:${artifact}`);
    }
  }

  for (const reg of REGISTRY_FILES) {
    if (!fs.existsSync(registryPath(workingRoot, reg))) {
      diagnostics.push(`snapshot_b_missing_registry:${reg}`);
    }
  }

  if (countRegistryRecords(registryPath(workingRoot, "actors.yaml"), "ACT-") < 3) {
    diagnostics.push("snapshot_b_insufficient_ACT");
  }
  if (countRegistryRecords(registryPath(workingRoot, "outcomes.yaml"), "OUT-") < 5) {
    diagnostics.push("snapshot_b_insufficient_OUT");
  }
  if (countRegistryRecords(registryPath(workingRoot, "capabilities.yaml"), "CAP-") < 10) {
    diagnostics.push("snapshot_b_insufficient_CAP");
  }
  if (countRegistryRecords(registryPath(workingRoot, "contracts.yaml"), "CON-") < 15) {
    diagnostics.push("snapshot_b_insufficient_CON");
  }
  if (countRegistryRecords(registryPath(workingRoot, "data.yaml"), "DAT-") < 1) {
    diagnostics.push("snapshot_b_insufficient_DAT");
  }
  if (countRegistryRecords(registryPath(workingRoot, "integrations.yaml"), "INT-") < 1) {
    diagnostics.push("snapshot_b_insufficient_INT");
  }
  if (countRegistryRecords(registryPath(workingRoot, "failures.yaml"), "FAIL-") < 1
    && countRegistryRecords(registryPath(workingRoot, "gaps.yaml"), "GAP-") < 1) {
    diagnostics.push("snapshot_b_insufficient_FAIL_or_GAP");
  }
  if (countRegistryRecords(registryPath(workingRoot, "verification.yaml"), "VER-") < 1) {
    diagnostics.push("snapshot_b_insufficient_VER");
  }

  diagnostics.push(...validateReceipt(projectRoot, receiptRel).diagnostics);

  const unique = [...new Set(diagnostics)];
  return { ok: unique.length === 0, diagnostics: unique };
}