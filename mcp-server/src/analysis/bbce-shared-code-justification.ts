/**
 * BBCE Mechanism B — shared-code change justification (advisory pilot).
 *
 * Proof boundary: review-gated evidence for shared touches — does not block LEAP or commits.
 */

import {
  type SliceMapV1,
  type SharedCodeJustificationV1,
  type SharedCodeTriggerV1,
} from "./bbce-schemas.js";
import {
  matchPathAgainstGlobs,
  type DeclaredChangeSurfaceV1,
  parseDeclaredChangeSurface,
  parseSliceMap,
} from "./change-locality-pilot.js";

export type ImplCodeLocationsEntry = {
  files: string[];
};

/** IMPL token → declared code_locations.files (from plumb preview or IMPL detail). */
export type ImplCodeLocationsLookup = Record<string, ImplCodeLocationsEntry>;

export type DetectSharedCodeTriggersArgs = {
  changed_paths: string[];
  slice_map: SliceMapV1;
  declared?: DeclaredChangeSurfaceV1;
  impl_code_locations?: ImplCodeLocationsLookup;
  /** IMPL tokens extracted from diff (e.g. plumb-diff-impact-preview). */
  plumb_touched_impl_tokens?: string[];
};

function normalizePaths(paths: string[]): string[] {
  return [...new Set(paths.map((p) => p.split("\\").join("/")))].sort();
}

function pathsForSharedMechanismGlobs(changed: string[], sliceMap: SliceMapV1): SharedCodeTriggerV1[] {
  const triggers: SharedCodeTriggerV1[] = [];
  for (const glob of sliceMap.shared_mechanism_globs) {
    const touched = changed.filter((p) => matchPathAgainstGlobs(p, [glob]));
    if (touched.length === 0) continue;
    triggers.push({
      kind: "shared_mechanism_glob",
      matched_glob: glob,
      touched_paths: touched,
    });
  }
  return triggers;
}

function pathsOutsideDeclaredSurface(
  changed: string[],
  declared: DeclaredChangeSurfaceV1
): SharedCodeTriggerV1 | null {
  const outside = changed.filter((p) => !matchPathAgainstGlobs(p, declared.expected_path_globs));
  if (outside.length === 0) return null;
  return {
    kind: "outside_declared_surface",
    touched_paths: outside,
  };
}

function pathsOutsideImplCodeLocations(args: {
  changed: string[];
  impl_code_locations: ImplCodeLocationsLookup;
  plumb_touched_impl_tokens: string[];
}): SharedCodeTriggerV1 | null {
  const allowed = new Set<string>();
  for (const token of args.plumb_touched_impl_tokens) {
    const entry = args.impl_code_locations[token];
    if (!entry) continue;
    for (const f of entry.files) allowed.add(f.split("\\").join("/"));
  }
  if (allowed.size === 0) return null;
  const outside = args.changed.filter((p) => !allowed.has(p));
  if (outside.length === 0) return null;
  return {
    kind: "outside_impl_code_locations",
    touched_paths: outside,
    impl_tokens: [...args.plumb_touched_impl_tokens],
  };
}

export function detectSharedCodeTriggers(raw: DetectSharedCodeTriggersArgs): SharedCodeTriggerV1[] {
  const sliceMap = parseSliceMap(raw.slice_map);
  const changed = normalizePaths(raw.changed_paths);
  const declared = raw.declared ? parseDeclaredChangeSurface(raw.declared) : undefined;

  const triggers: SharedCodeTriggerV1[] = [];
  triggers.push(...pathsForSharedMechanismGlobs(changed, sliceMap));

  if (declared) {
    const surface = pathsOutsideDeclaredSurface(changed, declared);
    if (surface) triggers.push(surface);
  }

  if (raw.impl_code_locations && raw.plumb_touched_impl_tokens?.length) {
    const impl = pathsOutsideImplCodeLocations({
      changed,
      impl_code_locations: raw.impl_code_locations,
      plumb_touched_impl_tokens: raw.plumb_touched_impl_tokens,
    });
    if (impl) triggers.push(impl);
  }

  return triggers;
}

export function inferSharedMechanismConsumers(args: {
  slice_map: SliceMapV1;
}): Array<{ binding_id: string; owning_slice_req: string }> {
  const sliceMap = parseSliceMap(args.slice_map);
  return sliceMap.bindings.map((b) => ({
    binding_id: b.binding_id,
    owning_slice_req: b.owning_slice_req,
  }));
}

export function buildSharedCodeJustificationRecord(args: {
  change_id: string;
  scenario_id: string;
  owning_slice_req: string;
  triggers: SharedCodeTriggerV1[];
  consumers: Array<{ binding_id: string; owning_slice_req?: string }>;
  declared_change_surface_ref?: string;
  timestamp: string;
  waiver_ref?: string | null;
  local_alternative_considered?: string;
  blast_radius_summary?: string;
}): SharedCodeJustificationV1 {
  if (args.triggers.length === 0) {
    throw new Error("DEBUG: buildSharedCodeJustificationRecord requires at least one trigger");
  }

  return {
    schema_version: "bbce-shared-code-justification.v1",
    timestamp: args.timestamp,
    change_id: args.change_id,
    scenario_id: args.scenario_id,
    owning_slice_req: args.owning_slice_req,
    declared_change_surface_ref: args.declared_change_surface_ref,
    triggers: args.triggers,
    consumers: args.consumers.map((c) => ({
      binding_id: c.binding_id,
      owning_slice_req: c.owning_slice_req,
    })),
    blast_radius_summary:
      args.blast_radius_summary ??
      "Shared mechanism paths may affect multiple agentstream bindings; review consumers before LEAP to shared IMPL.",
    local_alternative_considered:
      args.local_alternative_considered ??
      "Per-slice duplication rejected for path helpers — prefer explicit waiver when cross-binding change is required.",
    waiver_ref: args.waiver_ref ?? null,
    review_status: "pending_human",
    proof_boundary:
      "Justification record is review-gated evidence; does not block LEAP to shared IMPL without explicit waiver.",
  };
}
