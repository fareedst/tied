/**
 * BBCE Mechanism C — boundary violation report (advisory pilot).
 *
 * Static path/slice heuristics only — distinct from traceability_gap_report (no REQ/token dimensions).
 *
 * False-positive policy: working/PLAN-TIED-BBCE-ALIGNMENT/w3-refine/false-positive-policy.md
 * - expected_test_surface: fixture and *.test.ts paths often expected for declared slice
 * - traceability gaps excluded entirely (use plumb / consistency tools)
 */

import {
  type BoundaryCrossingV1,
  type BoundarySuppressedV1,
  type BoundaryViolationReportV1,
  type SliceMapV1,
} from "./bbce-schemas.js";
import { matchPathAgainstGlobs, parseSliceMap } from "./change-locality-pilot.js";
import { SliceBindingSchema } from "./bbce-schemas.js";
import { z } from "zod";

type SliceBinding = z.infer<typeof SliceBindingSchema>;

function normalizePaths(paths: string[]): string[] {
  return [...new Set(paths.map((p) => p.split("\\").join("/")))].sort();
}

function bindingsForPath(path: string, sliceMap: SliceMapV1): SliceBinding[] {
  return sliceMap.bindings.filter((b) => matchPathAgainstGlobs(path, b.path_globs));
}

function isSharedMechanismPath(path: string, sliceMap: SliceMapV1): boolean {
  return matchPathAgainstGlobs(path, sliceMap.shared_mechanism_globs);
}

/** False-positive policy: test/fixture surfaces tied to declared owning slice. */
function trySuppressExpectedTestSurface(args: {
  path: string;
  declared_owning_slice_req: string;
  bindings: SliceBinding[];
}): BoundarySuppressedV1 | null {
  const isTestPath =
    args.path.includes("/fixtures/") ||
    args.path.endsWith(".test.ts") ||
    args.path.endsWith(".test.js");
  if (!isTestPath) return null;

  const ownedByDeclared = args.bindings.some((b) => b.owning_slice_req === args.declared_owning_slice_req);
  if (!ownedByDeclared && args.bindings.length > 0) return null;

  return {
    path: args.path,
    suppression_class: "expected_test_surface",
    reason: "Test or fixture path under declared slice binding — advisory suppress per W3 false-positive policy.",
  };
}

function classifyPath(args: {
  path: string;
  sliceMap: SliceMapV1;
  declared_owning_slice_req: string;
}): { crossing: BoundaryCrossingV1 | null; suppressed: BoundarySuppressedV1 | null } {
  const bindings = bindingsForPath(args.path, args.sliceMap);

  const suppressed = trySuppressExpectedTestSurface({
    path: args.path,
    declared_owning_slice_req: args.declared_owning_slice_req,
    bindings,
  });
  if (suppressed) return { crossing: null, suppressed };

  if (isSharedMechanismPath(args.path, args.sliceMap)) {
    return {
      crossing: {
        path: args.path,
        kind: "shared_mechanism_touch",
        classified_as: "shared_mechanism",
        confidence: "high",
        owning_slice_req: null,
        note: "Shared mechanism glob — counted separately from import-based crossing (Mechanism B may also fire).",
      },
      suppressed: null,
    };
  }

  const foreign = bindings.filter((b) => b.owning_slice_req !== args.declared_owning_slice_req);
  if (foreign.length > 0) {
    const primary = foreign[0]!;
    return {
      crossing: {
        path: args.path,
        kind: "slice_crossing",
        classified_as: "foreign_slice",
        confidence: "medium",
        owning_slice_req: primary.owning_slice_req,
        note: "Path maps to binding outside declared owning slice.",
      },
      suppressed: null,
    };
  }

  if (bindings.length === 0) {
    return {
      crossing: {
        path: args.path,
        kind: "slice_crossing",
        classified_as: "unclassified",
        confidence: "low",
        owning_slice_req: null,
        note: "No slice binding matched — may be monorepo config or inventory drift.",
      },
      suppressed: null,
    };
  }

  return { crossing: null, suppressed: null };
}

export function buildBoundaryViolationReport(args: {
  change_id: string;
  scenario_id: string;
  declared_owning_slice_req: string;
  slice_map: SliceMapV1;
  slice_map_ref: string;
  changed_paths: string[];
  timestamp: string;
}): BoundaryViolationReportV1 {
  const sliceMap = parseSliceMap(args.slice_map);
  const changed = normalizePaths(args.changed_paths);

  const crossings: BoundaryCrossingV1[] = [];
  const suppressed: BoundarySuppressedV1[] = [];

  for (const path of changed) {
    const result = classifyPath({
      path,
      sliceMap,
      declared_owning_slice_req: args.declared_owning_slice_req,
    });
    if (result.crossing) crossings.push(result.crossing);
    if (result.suppressed) suppressed.push(result.suppressed);
  }

  return {
    schema_version: "bbce-boundary-violation.v1",
    timestamp: args.timestamp,
    change_id: args.change_id,
    scenario_id: args.scenario_id,
    declared_owning_slice_req: args.declared_owning_slice_req,
    slice_map_ref: args.slice_map_ref,
    traceability_gaps_excluded: true,
    import_heuristics: [],
    crossings,
    suppressed,
    proof_boundary: "Static path/slice heuristics only; distinct from traceability_gap_report.",
  };
}
