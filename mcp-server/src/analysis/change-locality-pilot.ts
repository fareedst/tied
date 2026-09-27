/**
 * BBCE Mechanism A pilot — declared change surface vs actual diff footprint.
 *
 * Proof boundary: metrics prove diff-scope discipline only — not REQ satisfaction
 * or runtime correctness.
 */

import { execFileSync } from "node:child_process";

import {
  parseDeclaredChangeSurface,
  parseSliceMap,
  type DeclaredChangeSurfaceV1,
  type SliceMapV1,
  SliceBindingSchema,
} from "./bbce-schemas.js";
import { z } from "zod";

export type { DeclaredChangeSurfaceV1, SliceMapV1 } from "./bbce-schemas.js";
export { parseDeclaredChangeSurface, parseSliceMap } from "./bbce-schemas.js";

export type ChangeLocalityReportV1 = {
  schema_version: "bbce-change-locality-report.v1";
  scenario_id: string;
  owning_slice_req: string;
  metrics: {
    total_changed_files: number;
    in_declared_surface_files: number;
    change_locality: number;
  };
  unexpected_paths: string[];
  shared_mechanism_touches: string[];
  slice_crossings: Array<{
    path: string;
    matched_binding_ids: string[];
    matched_owning_slices: string[];
  }>;
  proof_boundary: string;
};

/** Minimal glob: `*`, `**`, and literal `/` segments (sufficient for pilot slice maps). */
function globToRegExp(glob: string): RegExp {
  const parts = glob.split("**").map((segment, i, arr) => {
    const escaped = segment
      .split("*")
      .map((p) => p.replace(/[.+?^${}()|[\]\\]/g, "\\$&"))
      .join("[^/]*");
    if (i === 0 && segment.startsWith("**")) return escaped;
    if (i < arr.length - 1) return `${escaped}.*`;
    return escaped;
  });
  const body = parts.join("");
  return new RegExp(`^${body}$`);
}

export function matchPathAgainstGlobs(repoRelativePath: string, globs: string[]): boolean {
  const normalized = repoRelativePath.split("\\").join("/");
  return globs.some((g) => globToRegExp(g).test(normalized));
}

type SliceBinding = z.infer<typeof SliceBindingSchema>;

function bindingsForPath(path: string, sliceMap: SliceMapV1): SliceBinding[] {
  return sliceMap.bindings.filter((b) => matchPathAgainstGlobs(path, b.path_globs));
}

export function classifyChangedPaths(args: {
  changed_paths: string[];
  declared: DeclaredChangeSurfaceV1;
  slice_map: SliceMapV1;
}): ChangeLocalityReportV1 {
  const declared = parseDeclaredChangeSurface(args.declared);
  const sliceMap = parseSliceMap(args.slice_map);
  const changed = [...new Set(args.changed_paths.map((p) => p.split("\\").join("/")))].sort();

  const inDeclared = changed.filter((p) => matchPathAgainstGlobs(p, declared.expected_path_globs));
  const unexpected = changed.filter((p) => !matchPathAgainstGlobs(p, declared.expected_path_globs));
  const sharedTouches = changed.filter((p) => matchPathAgainstGlobs(p, sliceMap.shared_mechanism_globs));

  const slice_crossings = changed
    .map((path) => {
      const matched = bindingsForPath(path, sliceMap);
      const bindingIds = matched.map((m) => m.binding_id);
      const slices = [...new Set(matched.map((m) => m.owning_slice_req))];
      const crosses =
        bindingIds.length > 1 ||
        (slices.length === 1 && slices[0] !== declared.owning_slice_req) ||
        (slices.length === 0 && !matchPathAgainstGlobs(path, declared.expected_path_globs));
      if (!crosses && bindingIds.length <= 1 && slices.length <= 1) {
        if (slices.length === 0 && matchPathAgainstGlobs(path, declared.expected_path_globs)) {
          return null;
        }
        if (slices.length === 1 && slices[0] === declared.owning_slice_req) return null;
      }
      return { path, matched_binding_ids: bindingIds, matched_owning_slices: slices };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const total = changed.length;
  const inCount = inDeclared.length;
  const locality = total === 0 ? 1 : inCount / total;

  return {
    schema_version: "bbce-change-locality-report.v1",
    scenario_id: declared.scenario_id,
    owning_slice_req: declared.owning_slice_req,
    metrics: {
      total_changed_files: total,
      in_declared_surface_files: inCount,
      change_locality: Math.round(locality * 10000) / 10000,
    },
    unexpected_paths: unexpected,
    shared_mechanism_touches: sharedTouches,
    slice_crossings,
    proof_boundary: declared.proof_boundary,
  };
}

export function gitNameOnlyForRevisionRange(args: {
  repo_root: string;
  base_ref: string;
  head_ref: string;
  path_prefix?: string;
}): string[] {
  const diffArgs = ["diff", "--name-only", "--diff-filter=ACMRTUB", `${args.base_ref}..${args.head_ref}`];
  if (args.path_prefix) diffArgs.push("--", args.path_prefix);
  const raw = execFileSync("git", diffArgs, {
    cwd: args.repo_root,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  return raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .sort();
}

export function runChangeLocalityPilotFromGitRange(args: {
  repo_root: string;
  base_ref: string;
  head_ref: string;
  path_prefix?: string;
  declared: DeclaredChangeSurfaceV1;
  slice_map: SliceMapV1;
}): ChangeLocalityReportV1 & { changed_paths: string[]; git_range: string } {
  const changed = gitNameOnlyForRevisionRange({
    repo_root: args.repo_root,
    base_ref: args.base_ref,
    head_ref: args.head_ref,
    path_prefix: args.path_prefix,
  });
  const report = classifyChangedPaths({
    changed_paths: changed,
    declared: args.declared,
    slice_map: args.slice_map,
  });
  return {
    ...report,
    changed_paths: changed,
    git_range: `${args.base_ref}..${args.head_ref}`,
  };
}
