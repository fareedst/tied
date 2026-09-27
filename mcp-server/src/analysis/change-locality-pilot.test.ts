import { describe, it } from "node:test";
import assert from "node:assert";

import {
  classifyChangedPaths,
  gitNameOnlyForRevisionRange,
  matchPathAgainstGlobs,
  type DeclaredChangeSurfaceV1,
  type SliceMapV1,
} from "./change-locality-pilot.js";
import {
  validateDeclaredChangeSurface,
  validateLocalityEvent,
  validateSliceMap,
} from "./bbce-schemas.js";

const SLICE_MAP: SliceMapV1 = {
  schema_version: "bbce-slice-map.v1",
  change_id: "PLAN-TIED-BBCE-ALIGNMENT",
  shared_mechanism_globs: ["mcp-server/packages/agentstream/src/paths.ts"],
  bindings: [
    {
      binding_id: "CLI→pipeline build",
      owning_slice_req: "REQ-GOAGENT-PIPELINE-CHAIN",
      path_globs: [
        "mcp-server/packages/agentstream/src/index.ts",
        "mcp-server/packages/agentstream/src/pipeline-build.ts",
      ],
    },
    {
      binding_id: "pipeline→executor run",
      owning_slice_req: "REQ-GOAGENT-AGENT-EXECUTOR",
      path_globs: [
        "mcp-server/packages/agentstream/src/live-executor.ts",
        "mcp-server/packages/agentstream/src/executor-run.ts",
      ],
    },
  ],
};

describe("change locality pilot (BBCE mechanism A)", () => {
  it("matches repo-relative paths against globs", () => {
    assert.strictEqual(
      matchPathAgainstGlobs("mcp-server/packages/agentstream/src/index.ts", ["mcp-server/packages/agentstream/src/*.ts"]),
      true
    );
    assert.strictEqual(matchPathAgainstGlobs("other/foo.ts", ["mcp-server/**"]), false);
  });

  it("computes locality, unexpected paths, shared mechanism, and slice crossings", () => {
    const declared: DeclaredChangeSurfaceV1 = {
      schema_version: "bbce-declared-change-surface.v1",
      scenario_id: "synthetic-locality",
      owning_slice_req: "REQ-GOAGENT-PIPELINE-CHAIN",
      binding_ids: ["CLI→pipeline build"],
      expected_path_globs: [
        "mcp-server/packages/agentstream/src/index.ts",
        "mcp-server/packages/agentstream/src/pipeline-build.ts",
      ],
      proof_boundary: "diff-scope discipline only — not behavioral correctness",
    };

    const changed = [
      "mcp-server/packages/agentstream/src/index.ts",
      "mcp-server/packages/agentstream/src/pipeline-build.ts",
      "mcp-server/packages/agentstream/src/paths.ts",
      "mcp-server/packages/agentstream/README.md",
    ];

    const report = classifyChangedPaths({ changed_paths: changed, declared, slice_map: SLICE_MAP });

    assert.strictEqual(report.metrics.total_changed_files, 4);
    assert.strictEqual(report.metrics.in_declared_surface_files, 2);
    assert.strictEqual(report.metrics.change_locality, 0.5);
    assert.deepStrictEqual(report.unexpected_paths.sort(), [
      "mcp-server/packages/agentstream/README.md",
      "mcp-server/packages/agentstream/src/paths.ts",
    ]);
    assert.deepStrictEqual(report.shared_mechanism_touches, ["mcp-server/packages/agentstream/src/paths.ts"]);
    assert.ok(report.slice_crossings.length >= 1, "README should not map to declared owning slice");
  });

  it("lists files for a revision range in this repository (read-only replay)", () => {
    const repoRoot = process.cwd().endsWith("mcp-server")
      ? `${process.cwd()}/..`
      : process.cwd();
    const files = gitNameOnlyForRevisionRange({
      repo_root: repoRoot,
      base_ref: "fbe65e1",
      head_ref: "d5ea688",
      path_prefix: "mcp-server/packages/agentstream/",
    });
    assert.ok(files.length > 5, "historical agentstream range should include multiple files");
    assert.ok(files.every((f) => f.startsWith("mcp-server/packages/agentstream/")));
  });

  it("validates bbce-declared-change-surface.v1 and locality event schemas (W2)", () => {
    const declared = validateDeclaredChangeSurface({
      schema_version: "bbce-declared-change-surface.v1",
      scenario_id: "unit-minimal",
      owning_slice_req: "REQ-EXAMPLE",
      expected_path_globs: ["src/**/*.ts"],
      proof_boundary: "diff-scope only",
      behavior: "Example behavior",
      public_behavioral_boundary: "CLI only",
    });
    assert.strictEqual(declared.ok, true);

    const sm = validateSliceMap({
      schema_version: "bbce-slice-map.v1",
      change_id: "PLAN-X",
      bindings: [{ binding_id: "b1", owning_slice_req: "REQ-A", path_globs: ["src/**"] }],
    });
    assert.strictEqual(sm.ok, true);

    const ev = validateLocalityEvent({
      schema_version: "bbce-locality-event.v1",
      timestamp: new Date().toISOString(),
      source: "locality-pilot",
      scenario_id: "s1",
      owning_slice_req: "REQ-A",
      metrics: { total_changed_files: 1, in_declared_surface_files: 1, change_locality: 1 },
      unexpected_paths_count: 0,
      shared_mechanism_touches_count: 0,
      slice_crossings_count: 0,
      proof_boundary: "diff-scope only",
    });
    assert.strictEqual(ev.ok, true);
  });
});
