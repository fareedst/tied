/**
 * Optional plumb-audit locality compare (W2 spike — default off).
 */

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

import { parseDeclaredChangeSurface, parseSliceMap } from "./bbce-schemas.js";
import { classifyChangedPaths, type ChangeLocalityReportV1 } from "./change-locality-pilot.js";
import {
  appendLocalityEventJsonl,
  buildLocalityEventFromReport,
  compactLocalitySummaryFromReport,
} from "./bbce-locality-event.js";

export function loadYamlFile(absPath: string): unknown {
  const raw = fs.readFileSync(absPath, "utf8");
  return yaml.load(raw);
}

export function runLocalityCompareFromPaths(args: {
  changed_paths: string[];
  declared_change_surface_path: string;
  slice_map_path: string;
}): ChangeLocalityReportV1 {
  const declared = parseDeclaredChangeSurface(loadYamlFile(args.declared_change_surface_path));
  const sliceMap = parseSliceMap(loadYamlFile(args.slice_map_path));
  return classifyChangedPaths({
    changed_paths: args.changed_paths,
    declared,
    slice_map: sliceMap,
  });
}

export function resolveRepoRelativePath(repoRoot: string, p: string): string {
  return path.isAbsolute(p) ? p : path.resolve(repoRoot, p);
}

export function maybeAppendLocalityEvent(args: {
  locality_event_jsonl_path?: string;
  report: ChangeLocalityReportV1;
  declared_change_surface_ref: string;
  slice_map_ref: string;
  attempt_id: string;
}): void {
  if (!args.locality_event_jsonl_path) return;
  const event = buildLocalityEventFromReport({
    source: "plumb-audit-gate",
    report: args.report,
    declared_change_surface_ref: args.declared_change_surface_ref,
    slice_map_ref: args.slice_map_ref,
    attempt_id: args.attempt_id,
  });
  appendLocalityEventJsonl(args.locality_event_jsonl_path, event);
}

export { compactLocalitySummaryFromReport };
