/**
 * [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [IMPL-PSEUDOCODE_MIGRATION_TOOLING]
 * [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT]
 * [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION]
 * How: Compose G4 ci_expectations (gate-promotion G4) into a single stdd-local CI report.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import { REPO_ROOT, runGrammarV2DefaultAudit } from "./audit-grammar-v2-default.mjs";

export const G4_CI_EXPECTATIONS = [
  "header_and_contract_defaults_for_new_clients",
  "stale_waiver_checks",
];

const ENROLLED_TRACK_CHECK = "enrolled_track_regression";

/**
 * @param {unknown} clients
 * @returns {{ ok: boolean, enrolled_count: number, failures: { client_id: string, aggregate_migration_state: string }[] }}
 */
export function evaluateEnrolledOdP4Inventory(clients) {
  if (!Array.isArray(clients)) {
    return { ok: false, enrolled_count: 0, failures: [{ client_id: "(invalid)", aggregate_migration_state: "clients_not_array" }] };
  }
  const enrolled = clients.filter((row) => row?.phase_4_enrollment === "enrolled_phase_4");
  const failures = enrolled
    .filter((row) => row.aggregate_migration_state !== "fleet-migrated-client")
    .map((row) => ({
      client_id: String(row.client_id ?? "unknown"),
      aggregate_migration_state: String(row.aggregate_migration_state ?? "missing"),
    }));
  return {
    ok: failures.length === 0 && enrolled.length > 0,
    enrolled_count: enrolled.length,
    failures,
  };
}

/**
 * @param {string} manifestPath
 */
export function loadInventoryClientsFromManifest(manifestPath) {
  const parsed = execFileSync("yq", ["eval", "-o=json", ".clients", manifestPath], {
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
  });
  return JSON.parse(parsed);
}

/**
 * @param {string} gateStagesPath
 */
export function loadG4StageExpectations(gateStagesPath) {
  const id = execFileSync("yq", ['eval', '.stages[] | select(.id == "G4") | .id', gateStagesPath], {
    encoding: "utf8",
  }).trim();
  if (id !== "G4") {
    throw new Error(`G4 stage not found in ${gateStagesPath}`);
  }
  const expectationsJson = execFileSync(
    "yq",
    ['eval', '-o=json', '.stages[] | select(.id == "G4") | .ci_expectations', gateStagesPath],
    { encoding: "utf8" },
  ).trim();
  const expectations = JSON.parse(expectationsJson);
  return { gate_stage: "G4", ci_expectations: expectations };
}

/**
 * @param {string} repoRoot
 */
export function runStaleWaiverRegistryCheck(repoRoot) {
  const script = path.join(
    repoRoot,
    "working/PSEUDOCODE-CONSTRAINT-STUDY/qualification/scripts/run-fleet-waiver-registry-check.ts",
  );
  try {
    const stdout = execFileSync(
      "node",
      ["--experimental-strip-types", script],
      { cwd: repoRoot, encoding: "utf8", maxBuffer: 2 * 1024 * 1024 },
    );
    const payload = JSON.parse(stdout.trim());
    return { ok: payload.ok === true, detail: payload };
  } catch (err) {
    const stderr = err.stderr?.toString?.() ?? String(err);
    return { ok: false, detail: { error: stderr.slice(0, 500) } };
  }
}

/**
 * @param {string} clientRoot
 */
export function runHeaderAndContractDefaultsCheck(clientRoot) {
  const report = runGrammarV2DefaultAudit(clientRoot, { gateStage: "G4" });
  return {
    ok: report.ok === true,
    schema_version: report.schema_version,
    dimensions: {
      grammar_v2_header: report.dimensions?.grammar_v2_header,
      bootstrap_enforcement: report.dimensions?.bootstrap_enforcement,
      layer_b_ok: report.dimensions?.layer_b?.ok,
      layer_c_ok: report.dimensions?.layer_c?.ok,
      constraint_flow: report.dimensions?.constraint_flow,
    },
    note: "P5-F constraint-enforced-v2 bootstrap policy (G4 gateStage audit).",
  };
}

/**
 * @param {{ repoRoot?: string, manifestPath?: string, gateStagesPath?: string, clientRoot?: string }} [options]
 */
export function runFleetG4CiChecks(options = {}) {
  const repoRoot = options.repoRoot ?? REPO_ROOT;
  const manifestPath =
    options.manifestPath ?? path.join(repoRoot, "working/fleet-constraint-v2/client-inventory-manifest.v1.yaml");
  const gateStagesPath =
    options.gateStagesPath ?? path.join(repoRoot, "working/fleet-constraint-v2/gate-promotion-stages.v1.yaml");
  const clientRoot = options.clientRoot ?? repoRoot;

  const g4 = loadG4StageExpectations(gateStagesPath);
  const checks = [];

  if (g4.ci_expectations.includes("header_and_contract_defaults_for_new_clients")) {
    checks.push({
      id: "header_and_contract_defaults_for_new_clients",
      ...runHeaderAndContractDefaultsCheck(clientRoot),
    });
  }

  if (g4.ci_expectations.includes("stale_waiver_checks")) {
    checks.push({
      id: "stale_waiver_checks",
      ...runStaleWaiverRegistryCheck(repoRoot),
    });
  }

  const clients = loadInventoryClientsFromManifest(manifestPath);
  const enrolled = evaluateEnrolledOdP4Inventory(clients);
  checks.push({
    id: ENROLLED_TRACK_CHECK,
    ok: enrolled.ok,
    enrolled_count: enrolled.enrolled_count,
    failures: enrolled.failures,
  });

  const ok = checks.every((c) => c.ok === true);
  return {
    schema_version: "fleet-g4-ci-checks.v1",
    gate_stage: g4.gate_stage,
    ci_expectations: g4.ci_expectations,
    checks,
    ok,
    generated_at: new Date().toISOString(),
  };
}
