#!/usr/bin/env node
/**
 * W2 re-run — repo slice map vs W1 working pilot map.
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

function loadYamlAbs(abs) {
  return yaml.load(fs.readFileSync(abs, "utf8"));
}

const sliceMaps = [
  { ref: "working/PLAN-TIED-BBCE-ALIGNMENT/pilot/slice-map.yaml", abs: path.join(PILOT_DIR, "slice-map.yaml") },
  { ref: "tied/analysis/agentstream-slice-map.yaml", abs: path.join(REPO_ROOT, "tied/analysis/agentstream-slice-map.yaml") },
];

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

const runs = [];
for (const sm of sliceMaps) {
  const sliceMap = parseSliceMap(loadYamlAbs(sm.abs));
  for (const s of scenarios) {
    const declared = parseDeclaredChangeSurface(loadYamlAbs(path.join(PILOT_DIR, s.declared_file)));
    const report = runChangeLocalityPilotFromGitRange({
      repo_root: REPO_ROOT,
      base_ref: s.base_ref,
      head_ref: s.head_ref,
      path_prefix: s.path_prefix,
      declared,
      slice_map: sliceMap,
    });
    runs.push({
      slice_map_ref: sm.ref,
      declared_file: s.declared_file,
      git_range: report.git_range,
      change_locality: report.metrics.change_locality,
      metrics: report.metrics,
      drift_vs_w1: null,
    });
  }
}

const w1 = JSON.parse(fs.readFileSync(path.join(PILOT_DIR, "locality-run.json"), "utf8"));
for (const run of runs) {
  if (run.slice_map_ref.includes("pilot/slice-map")) continue;
  const w1Match = w1.runs.find((r) => r.declared_file === run.declared_file);
  if (w1Match) {
    const delta = run.change_locality - w1Match.report.metrics.change_locality;
    run.drift_vs_w1 = {
      w1_slice_map_ref: w1.slice_map_ref,
      w1_change_locality: w1Match.report.metrics.change_locality,
      delta,
      note: delta === 0 ? "identical metrics — repo map matches W1 working encoding" : "investigate slice map diff",
    };
  }
}

const out = {
  schema_version: "bbce-locality-run.v1",
  generated_at: new Date().toISOString(),
  change_id: "PLAN-TIED-BBCE-ALIGNMENT",
  wave: "W2",
  proof_boundary: "Metrics prove diff-scope discipline only — not REQ satisfaction.",
  runs,
};

const outPath = path.join(PILOT_DIR, "w2-locality-run.json");
fs.writeFileSync(outPath, `${JSON.stringify(out, null, 2)}\n`, "utf8");
console.log(`Wrote ${outPath}`);
