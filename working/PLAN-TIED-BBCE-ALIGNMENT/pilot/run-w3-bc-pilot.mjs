#!/usr/bin/env node
/**
 * W3 pilot — Mechanisms B + C dry-run (paths.ts scenario, advisory).
 * Usage: node working/PLAN-TIED-BBCE-ALIGNMENT/pilot/run-w3-bc-pilot.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

import { parseSliceMap, parseDeclaredChangeSurface } from "../../../mcp-server/dist/analysis/change-locality-pilot.js";
import {
  buildSharedCodeJustificationRecord,
  detectSharedCodeTriggers,
  inferSharedMechanismConsumers,
} from "../../../mcp-server/dist/analysis/bbce-shared-code-justification.js";
import { buildBoundaryViolationReport } from "../../../mcp-server/dist/analysis/bbce-boundary-violation-report.js";
import {
  validateBoundaryViolationReport,
  validateSharedCodeJustification,
} from "../../../mcp-server/dist/analysis/bbce-schemas.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../..");
const PILOT_DIR = __dirname;
const SCENARIO_ID = "dry-run-paths-ts-touch";
const PATHS_TS = "mcp-server/packages/agentstream/src/paths.ts";

function loadYamlAbs(relFromRepo) {
  return yaml.load(fs.readFileSync(path.join(REPO_ROOT, relFromRepo), "utf8"));
}

const sliceMap = parseSliceMap(loadYamlAbs("tied/analysis/agentstream-slice-map.yaml"));
const declared = parseDeclaredChangeSurface(
  loadYamlAbs("working/PLAN-TIED-BBCE-ALIGNMENT/pilot/declared-change-surface-claude-live.v1.yaml")
);

const changed_paths = [PATHS_TS];
const timestamp = new Date().toISOString();

const triggers = detectSharedCodeTriggers({
  changed_paths,
  slice_map: sliceMap,
  declared,
});

const justification = buildSharedCodeJustificationRecord({
  change_id: "PLAN-TIED-BBCE-ALIGNMENT",
  scenario_id: SCENARIO_ID,
  owning_slice_req: declared.owning_slice_req,
  triggers,
  consumers: inferSharedMechanismConsumers({ slice_map: sliceMap }),
  declared_change_surface_ref:
    "working/PLAN-TIED-BBCE-ALIGNMENT/pilot/declared-change-surface-claude-live.v1.yaml",
  timestamp,
  blast_radius_summary:
    "Path resolution shared across agentstream bindings; defect may affect multiple slices.",
  local_alternative_considered:
    "Duplicate path helpers per slice — rejected (BBCE duplication over premature coupling).",
});

const boundary = buildBoundaryViolationReport({
  change_id: "PLAN-TIED-BBCE-ALIGNMENT",
  scenario_id: SCENARIO_ID,
  declared_owning_slice_req: declared.owning_slice_req,
  slice_map: sliceMap,
  slice_map_ref: "tied/analysis/agentstream-slice-map.yaml",
  changed_paths,
  timestamp,
});

const jVal = validateSharedCodeJustification(justification);
const bVal = validateBoundaryViolationReport(boundary);
if (!jVal.ok || !bVal.ok) {
  console.error("Schema validation failed", { jVal, bVal });
  process.exit(1);
}

const justificationPath = path.join(PILOT_DIR, "w3-shared-code-justification.json");
const boundaryPath = path.join(PILOT_DIR, "w3-boundary-violation-report.json");
fs.writeFileSync(justificationPath, `${JSON.stringify(justification, null, 2)}\n`, "utf8");
fs.writeFileSync(boundaryPath, `${JSON.stringify(boundary, null, 2)}\n`, "utf8");

const jsonlDir = path.join(REPO_ROOT, "working/PLAN-TIED-BBCE-ALIGNMENT/change-locality");
fs.mkdirSync(jsonlDir, { recursive: true });
const jsonlPath = path.join(jsonlDir, "w3-bc-pilot-events.jsonl");
const lines = [
  JSON.stringify({ ...justification, record_kind: "bbce-shared-code-justification.v1" }),
  JSON.stringify({ ...boundary, record_kind: "bbce-boundary-violation.v1" }),
];
fs.appendFileSync(jsonlPath, `${lines.join("\n")}\n`, "utf8");

console.log(`W3 pilot B triggers: ${triggers.length} (${triggers.map((t) => t.kind).join(", ")})`);
console.log(
  `W3 pilot C crossings: ${boundary.crossings.length}, suppressed: ${boundary.suppressed.length}`
);
console.log(`Wrote ${justificationPath}`);
console.log(`Wrote ${boundaryPath}`);
console.log(`Appended ${lines.length} lines to ${jsonlPath}`);
