/**
 * Tests for yaml_updates_apply batch merge helper.
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { applyYamlUpdates, parseYamlUpdateSteps } from "./yaml-updates-apply.js";
import { clearBasePathCache } from "./yaml-loader.js";

beforeEach(() => {
  clearBasePathCache();
});

describe("parseYamlUpdateSteps", () => {
  it("accepts detail and index steps", () => {
    const r = parseYamlUpdateSteps([
      { kind: "detail", token: "REQ-X", updates: { status: "Planned" } },
      { kind: "index", index: "requirements", token: "REQ-X", updates: { status: "Implemented" } },
    ]);
    assert.strictEqual(r.ok, true);
    if (r.ok) {
      assert.strictEqual(r.steps.length, 2);
      assert.strictEqual(r.steps[0]!.kind, "detail");
      assert.strictEqual(r.steps[1]!.kind, "index");
    }
  });

  it("rejects invalid kind", () => {
    const r = parseYamlUpdateSteps([{ kind: "other", token: "REQ-X", updates: {} }]);
    assert.strictEqual(r.ok, false);
  });
});

describe("applyYamlUpdates", () => {
  it("dry_run returns merged previews without writing", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-batch-"));
    const reqYaml = path.join(dir, "requirements.yaml");
    fs.writeFileSync(
      reqYaml,
      `REQ-ONE:
  status: Planned
  name: One
  detail_file: requirements/REQ-ONE.yaml
`,
      "utf8"
    );
    fs.mkdirSync(path.join(dir, "requirements"), { recursive: true });
    fs.writeFileSync(
      path.join(dir, "requirements", "REQ-ONE.yaml"),
      `REQ-ONE:
  name: One
  metadata:
    created: "2026-01-01"
`,
      "utf8"
    );
    try {
      process.env.TIED_BASE_PATH = dir;
      clearBasePathCache();

      const result = applyYamlUpdates({
        dry_run: true,
        steps: [
          {
            kind: "detail",
            token: "REQ-ONE",
            updates: { metadata: { last_updated: { reason: "dry" } } },
          },
        ],
      });

      assert.strictEqual(result.ok, true);
      assert.strictEqual(result.dry_run, true);
      assert.strictEqual(result.step_results.length, 1);
      const first = result.step_results[0]!;
      assert.strictEqual(first.ok, true);
      if (first.ok) {
        const meta = first.merged_preview.metadata as Record<string, unknown>;
        assert.strictEqual(meta.created, "2026-01-01");
        const lu = meta.last_updated as Record<string, unknown>;
        assert.strictEqual(lu.reason, "dry");
      }

      const disk = fs.readFileSync(path.join(dir, "requirements", "REQ-ONE.yaml"), "utf8");
      assert.ok(!disk.includes("reason: dry"), "disk unchanged in dry_run");
    } finally {
      delete process.env.TIED_BASE_PATH;
      clearBasePathCache();
      fs.rmSync(dir, { recursive: true });
    }
  });

  it("writes sequential steps on disk", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-batch-w-"));
    const reqYaml = path.join(dir, "requirements.yaml");
    fs.writeFileSync(
      reqYaml,
      `REQ-ONE:
  status: Planned
  name: One
  detail_file: requirements/REQ-ONE.yaml
`,
      "utf8"
    );
    fs.mkdirSync(path.join(dir, "requirements"), { recursive: true });
    fs.writeFileSync(
      path.join(dir, "requirements", "REQ-ONE.yaml"),
      `REQ-ONE:
  name: One
  metadata:
    created: "2026-01-01"
`,
      "utf8"
    );
    try {
      process.env.TIED_BASE_PATH = dir;
      clearBasePathCache();

      const result = applyYamlUpdates({
        dry_run: false,
        run_validate_consistency: false,
        steps: [
          {
            kind: "detail",
            token: "REQ-ONE",
            updates: { metadata: { last_updated: { reason: "step1" } } },
          },
          {
            kind: "index",
            index: "requirements",
            token: "REQ-ONE",
            updates: { status: "Implemented" },
          },
        ],
      });

      assert.strictEqual(result.ok, true);
      assert.strictEqual(result.applied_steps, 2);
      const disk = fs.readFileSync(path.join(dir, "requirements", "REQ-ONE.yaml"), "utf8");
      assert.ok(disk.includes("step1"), `expected step1 in detail YAML, got: ${disk}`);
      const idx = fs.readFileSync(reqYaml, "utf8");
      assert.ok(idx.includes("Implemented"), `expected Implemented in index YAML, got: ${idx}`);
    } finally {
      delete process.env.TIED_BASE_PATH;
      clearBasePathCache();
      fs.rmSync(dir, { recursive: true });
    }
  });
});
