import { describe, it } from "node:test";
import assert from "node:assert";

import {
  buildSharedCodeJustificationRecord,
  detectSharedCodeTriggers,
  inferSharedMechanismConsumers,
} from "./bbce-shared-code-justification.js";
import {
  validateSharedCodeJustification,
  type SliceMapV1,
} from "./bbce-schemas.js";
import type { DeclaredChangeSurfaceV1 } from "./change-locality-pilot.js";

const SLICE_MAP: SliceMapV1 = {
  schema_version: "bbce-slice-map.v1",
  change_id: "PLAN-TIED-BBCE-ALIGNMENT",
  shared_mechanism_globs: [
    "mcp-server/packages/agentstream/src/paths.ts",
    "mcp-server/packages/agentstream/src/repo-root.ts",
  ],
  bindings: [
    {
      binding_id: "Claude live driver (W1 replay anchor)",
      owning_slice_req: "REQ-TIED_CLAUDE_LIVE_DRIVER",
      path_globs: ["mcp-server/packages/agentstream/src/claude-driver.ts"],
    },
    {
      binding_id: "CLI→pipeline build",
      owning_slice_req: "REQ-GOAGENT-PIPELINE-CHAIN",
      path_globs: ["mcp-server/packages/agentstream/src/index.ts"],
    },
  ],
};

const DECLARED: DeclaredChangeSurfaceV1 = {
  schema_version: "bbce-declared-change-surface.v1",
  scenario_id: "synthetic-shared",
  owning_slice_req: "REQ-TIED_CLAUDE_LIVE_DRIVER",
  binding_ids: ["Claude live driver (W1 replay anchor)"],
  expected_path_globs: ["mcp-server/packages/agentstream/src/claude-driver.ts"],
  proof_boundary: "diff-scope discipline only — not behavioral correctness",
};

describe("bbce shared-code justification (Mechanism B)", () => {
  it("detects shared_mechanism_glob trigger for paths.ts", () => {
    const changed = ["mcp-server/packages/agentstream/src/paths.ts"];
    const triggers = detectSharedCodeTriggers({
      changed_paths: changed,
      slice_map: SLICE_MAP,
      declared: DECLARED,
    });
    assert.ok(triggers.some((t) => t.kind === "shared_mechanism_glob"));
    const shared = triggers.find((t) => t.kind === "shared_mechanism_glob")!;
    assert.strictEqual(shared.matched_glob, "mcp-server/packages/agentstream/src/paths.ts");
    assert.deepStrictEqual(shared.touched_paths, changed);
  });

  it("detects outside_declared_surface when path is not in expected globs", () => {
    const changed = ["mcp-server/packages/agentstream/README.md"];
    const triggers = detectSharedCodeTriggers({
      changed_paths: changed,
      slice_map: SLICE_MAP,
      declared: DECLARED,
    });
    assert.ok(triggers.some((t) => t.kind === "outside_declared_surface"));
  });

  it("detects outside_impl_code_locations for plumb-touched IMPL tokens", () => {
    const changed = ["mcp-server/packages/agentstream/src/extra-helper.ts"];
    const triggers = detectSharedCodeTriggers({
      changed_paths: changed,
      slice_map: SLICE_MAP,
      declared: DECLARED,
      impl_code_locations: {
        "IMPL-GOAGENT-PATHS": {
          files: ["mcp-server/packages/agentstream/src/paths.ts"],
        },
      },
      plumb_touched_impl_tokens: ["IMPL-GOAGENT-PATHS"],
    });
    assert.ok(triggers.some((t) => t.kind === "outside_impl_code_locations"));
  });

  it("builds bbce-shared-code-justification.v1 and validates", () => {
    const changed = ["mcp-server/packages/agentstream/src/paths.ts"];
    const triggers = detectSharedCodeTriggers({
      changed_paths: changed,
      slice_map: SLICE_MAP,
      declared: DECLARED,
    });
    const consumers = inferSharedMechanismConsumers({ slice_map: SLICE_MAP });
    const record = buildSharedCodeJustificationRecord({
      change_id: "PLAN-TIED-BBCE-ALIGNMENT",
      scenario_id: "unit-paths-ts",
      owning_slice_req: DECLARED.owning_slice_req,
      triggers,
      consumers,
      declared_change_surface_ref: "pilot/declared.yaml",
      timestamp: "2026-09-27T12:00:00.000Z",
    });
    const validated = validateSharedCodeJustification(record);
    assert.strictEqual(validated.ok, true);
    if (validated.ok) {
      assert.strictEqual(validated.value.schema_version, "bbce-shared-code-justification.v1");
      assert.strictEqual(validated.value.review_status, "pending_human");
      assert.ok(validated.value.triggers.length >= 1);
    }
  });
});
