/**
 * Append-only BBCE locality event JSONL (W2 longitudinal spike).
 */

import fs from "node:fs";
import path from "node:path";

import { type BbceLocalityEventV1, validateLocalityEvent } from "./bbce-schemas.js";
import type { ChangeLocalityReportV1 } from "./change-locality-pilot.js";

type LocalityReport = ChangeLocalityReportV1;

export function buildLocalityEventFromReport(args: {
  source: BbceLocalityEventV1["source"];
  report: LocalityReport;
  declared_change_surface_ref?: string;
  slice_map_ref?: string;
  attempt_id?: string;
  timestamp?: string;
}): BbceLocalityEventV1 {
  const event: BbceLocalityEventV1 = {
    schema_version: "bbce-locality-event.v1",
    timestamp: args.timestamp ?? new Date().toISOString(),
    source: args.source,
    attempt_id: args.attempt_id,
    scenario_id: args.report.scenario_id,
    owning_slice_req: args.report.owning_slice_req,
    declared_change_surface_ref: args.declared_change_surface_ref,
    slice_map_ref: args.slice_map_ref,
    metrics: { ...args.report.metrics },
    unexpected_paths_count: args.report.unexpected_paths.length,
    shared_mechanism_touches_count: args.report.shared_mechanism_touches.length,
    slice_crossings_count: args.report.slice_crossings.length,
    proof_boundary: args.report.proof_boundary,
  };
  const check = validateLocalityEvent(event);
  if (check.ok === false) {
    throw new Error(`Invalid locality event: ${JSON.stringify(check.issues)}`);
  }
  return event;
}

export function appendLocalityEventJsonl(fileAbs: string, event: BbceLocalityEventV1): void {
  const validated = validateLocalityEvent(event);
  if (validated.ok === false) {
    throw new Error(`Refusing to append invalid locality event: ${JSON.stringify(validated.issues)}`);
  }
  const dir = path.dirname(fileAbs);
  fs.mkdirSync(dir, { recursive: true });
  fs.appendFileSync(fileAbs, `${JSON.stringify(event)}\n`, { encoding: "utf8" });
}

/** Compact summary for plumb audit v2 log lines (no full path dumps). */
export function compactLocalitySummaryFromReport(report: ChangeLocalityReportV1): {
  scenario_id: string;
  owning_slice_req: string;
  change_locality: number;
  total_changed_files: number;
  unexpected_paths_count: number;
  shared_mechanism_touches_count: number;
  slice_crossings_count: number;
} {
  return {
    scenario_id: report.scenario_id,
    owning_slice_req: report.owning_slice_req,
    change_locality: report.metrics.change_locality,
    total_changed_files: report.metrics.total_changed_files,
    unexpected_paths_count: report.unexpected_paths.length,
    shared_mechanism_touches_count: report.shared_mechanism_touches.length,
    slice_crossings_count: report.slice_crossings.length,
  };
}
