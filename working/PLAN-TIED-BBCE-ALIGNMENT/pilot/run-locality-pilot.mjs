#!/usr/bin/env node
/**
 * W1 pilot runner — read-only git replay + declared surface compare.
 * Usage: node working/PLAN-TIED-BBCE-ALIGNMENT/pilot/run-locality-pilot.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

import {
  runChangeLocalityPilotFromGitRange,
  parseSliceMap,
  parseDeclaredChangeSurface,
} from "../../../mcp-server/dist/analysis/change-locality-pilot.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../..");
const PILOT_DIR = __dirname;

function loadYaml(name) {
  return yaml.load(fs.readFileSync(path.join(PILOT_DIR, name), "utf8"));
}

const sliceMap = parseSliceMap(loadYaml("slice-map.yaml"));

const scenarios = [
  {
    declared_file: "declared-change-surface-claude-live.v1.yaml",
    base_ref: "d5ea688^",
    head_ref: "d5ea688",
    path_prefix: "mcp-server/packages/agentstream/",
  },
  {
    declared_file: "declared-change-surface-phase3b-wide.v1.yaml",
    base_ref: "fbe65e1",
    head_ref: "d5ea688",
    path_prefix: "mcp-server/packages/agentstream/",
  },
];

const runs = scenarios.map((s) => {
  const declared = parseDeclaredChangeSurface(loadYaml(s.declared_file));
  const report = runChangeLocalityPilotFromGitRange({
    repo_root: REPO_ROOT,
    base_ref: s.base_ref,
    head_ref: s.head_ref,
    path_prefix: s.path_prefix,
    declared,
    slice_map: sliceMap,
  });
  return {
    declared_file: s.declared_file,
    git_range: report.git_range,
    changed_paths: report.changed_paths,
    report: {
      schema_version: report.schema_version,
      scenario_id: report.scenario_id,
      owning_slice_req: report.owning_slice_req,
      metrics: report.metrics,
      unexpected_paths: report.unexpected_paths,
      shared_mechanism_touches: report.shared_mechanism_touches,
      slice_crossings: report.slice_crossings,
      proof_boundary: report.proof_boundary,
    },
  };
});

const out = {
  schema_version: "bbce-locality-run.v1",
  generated_at: new Date().toISOString(),
  change_id: "PLAN-TIED-BBCE-ALIGNMENT",
  proof_boundary: "Metrics prove diff-scope discipline only — not REQ satisfaction.",
  slice_map_ref: "working/PLAN-TIED-BBCE-ALIGNMENT/pilot/slice-map.yaml",
  runs,
};

const outPath = path.join(PILOT_DIR, "locality-run.json");
fs.writeFileSync(outPath, `${JSON.stringify(out, null, 2)}\n`, "utf8");
console.log(`Wrote ${outPath} (${runs.length} scenarios)`);
