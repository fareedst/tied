/**
 * [IMPL-FLEET_G4_MAINTENANCE] [ARCH-PSEUDOCODE_FLEET_G4_MAINTENANCE]
 * [REQ-PSEUDOCODE_FLEET_G4_MAINTENANCE] [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION]
 * How: Post–Track B G4 maintenance wrapper — status refresh, receipt envelope, optional unit tests.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

import { runFleetG4CiChecks } from "./fleet-g4-ci-checks.mjs";
import { REPO_ROOT } from "./audit-grammar-v2-default.mjs";

export const DEFAULT_PROGRAM_STATUS_REL =
  "working/fleet-constraint-v2/program-status.v1.yaml";
export const DEFAULT_RECEIPT_REL =
  "working/fleet-constraint-v2/g4-maintenance/last-run.v1.json";
export const DEFAULT_UNIT_TEST_FILES = [
  "scripts/fleet-g4-ci-checks.test.mjs",
  "scripts/fleet-g4-maintenance.test.mjs",
  "scripts/validate-feat-spawned-envelope-policy.test.mjs",
];

/**
 * @param {Record<string, unknown>} statusDoc
 * @param {{ g4Report: { ok?: boolean }; generatedAt: string }} input
 */
export function applyProgramStatusG4Fields(statusDoc, { g4Report, generatedAt }) {
  return {
    ...statusDoc,
    last_g4_ci_at: generatedAt,
    last_g4_ci_ok: g4Report.ok === true,
    updated_at: generatedAt,
  };
}

/**
 * @param {Record<string, unknown>} statusDoc
 * @param {{ g4Report: { ok?: boolean }; testsOk: boolean; generatedAt: string }} input
 */
export function applyProgramStatusAfterMaintenanceRun(statusDoc, { g4Report, testsOk, generatedAt }) {
  const checksOk = g4Report.ok === true;
  const overallOk = checksOk && testsOk;
  return {
    ...statusDoc,
    last_g4_ci_at: generatedAt,
    last_g4_ci_ok: overallOk,
    updated_at: generatedAt,
  };
}

/**
 * @param {object} g4Report
 * @param {{ maintenanceCommand: string; skipTests: boolean; programStatusPath: string; testsOk: boolean; generatedAt: string }} meta
 */
export function buildMaintenanceRunEnvelope(g4Report, meta) {
  const checksOk = g4Report.ok === true;
  const overallOk = checksOk && meta.testsOk;
  return {
    schema_version: "fleet-g4-maintenance-run.v1",
    generated_at: meta.generatedAt,
    ok: overallOk,
    maintenance_command: meta.maintenanceCommand,
    skip_tests: meta.skipTests,
    program_status_path: meta.programStatusPath,
    unit_tests_ok: meta.testsOk,
    g4_report: g4Report,
  };
}

/**
 * @param {string} programStatusPath
 */
export function loadProgramStatusYaml(programStatusPath) {
  const raw = fs.readFileSync(programStatusPath, "utf8");
  const parsed = execFileSync(
    "python3",
    [
      "-c",
      "import yaml,json,sys; print(json.dumps(yaml.safe_load(open(sys.argv[1]))))",
      programStatusPath,
    ],
    { encoding: "utf8" },
  );
  return { raw, doc: JSON.parse(parsed) };
}

/**
 * @param {string} programStatusPath
 * @param {Record<string, unknown>} doc
 */
export function writeProgramStatusYaml(programStatusPath, doc) {
  const tmpIn = path.join(path.dirname(programStatusPath), `.g4-maint-in-${process.pid}.json`);
  const tmpOut = `${tmpIn}.yaml`;
  fs.writeFileSync(tmpIn, `${JSON.stringify(doc)}\n`, "utf8");
  execFileSync(
    "python3",
    [
      "-c",
      "import json,yaml,sys; doc=json.load(open(sys.argv[1])); yaml.dump(doc, open(sys.argv[2],'w'), sort_keys=False, default_flow_style=False)",
      tmpIn,
      tmpOut,
    ],
    { encoding: "utf8" },
  );
  fs.renameSync(tmpOut, programStatusPath);
  fs.unlinkSync(tmpIn);
}

/**
 * @param {string} receiptPath
 * @param {object} envelope
 */
export function writeMaintenanceReceipt(receiptPath, envelope) {
  fs.mkdirSync(path.dirname(receiptPath), { recursive: true });
  fs.writeFileSync(receiptPath, `${JSON.stringify(envelope, null, 2)}\n`, "utf8");
}

/**
 * @param {string} repoRoot
 * @param {string[]} testFiles
 */
export function runG4MaintenanceUnitTests(repoRoot, testFiles = DEFAULT_UNIT_TEST_FILES) {
  const args = ["--test", ...testFiles.map((f) => path.join(repoRoot, f))];
  try {
    execFileSync(process.execPath, args, {
      cwd: repoRoot,
      encoding: "utf8",
      stdio: "pipe",
    });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      detail: String(err.stderr ?? err.stdout ?? err).slice(0, 2000),
    };
  }
}

/**
 * @param {{
 *   repoRoot?: string;
 *   programStatusPath?: string;
 *   receiptPath?: string;
 *   skipTests?: boolean;
 *   maintenanceCommand?: string;
 *   runG4Checks?: typeof runFleetG4CiChecks;
 *   runUnitTests?: typeof runG4MaintenanceUnitTests;
 * }} [options]
 */
export function runFleetG4Maintenance(options = {}) {
  const repoRoot = options.repoRoot ?? REPO_ROOT;
  const programStatusPath =
    options.programStatusPath ?? path.join(repoRoot, DEFAULT_PROGRAM_STATUS_REL);
  const receiptPath = options.receiptPath ?? path.join(repoRoot, DEFAULT_RECEIPT_REL);
  const skipTests = options.skipTests === true;
  const maintenanceCommand =
    options.maintenanceCommand ?? "node scripts/run-fleet-g4-maintenance.mjs";
  const runG4Checks = options.runG4Checks ?? runFleetG4CiChecks;
  const runUnitTests = options.runUnitTests ?? runG4MaintenanceUnitTests;

  const generatedAt = new Date().toISOString();
  const g4Report = runG4Checks({ repoRoot });

  let testsOk = true;
  if (g4Report.ok !== true) {
    testsOk = false;
  } else if (!skipTests) {
    testsOk = runUnitTests(repoRoot).ok === true;
  }

  const envelope = buildMaintenanceRunEnvelope(g4Report, {
    maintenanceCommand,
    skipTests,
    programStatusPath: programStatusPath.replace(`${repoRoot}/`, ""),
    testsOk,
    generatedAt,
  });

  const { doc } = loadProgramStatusYaml(programStatusPath);
  const nextDoc = applyProgramStatusAfterMaintenanceRun(doc, { g4Report, testsOk, generatedAt });
  if (nextDoc.maintenance_command !== maintenanceCommand) {
    nextDoc.maintenance_command = maintenanceCommand;
  }
  writeProgramStatusYaml(programStatusPath, nextDoc);
  writeMaintenanceReceipt(receiptPath, envelope);

  return {
    ok: envelope.ok === true,
    envelope,
    g4Report,
    testsOk,
  };
}
