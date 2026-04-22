/**
 * Tests for tied_verify / updateStatusFromPassedTokens.
 */

import { describe, it, beforeEach } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { updateStatusFromPassedTokens } from "./verify.js";
import { clearBasePathCache } from "./yaml-loader.js";

beforeEach(() => {
  clearBasePathCache();
});

describe("updateStatusFromPassedTokens dry_run", () => {
  it("returns would_update without writing when dry_run true", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-verify-"));
    const reqPath = path.join(dir, "requirements.yaml");
    const implPath = path.join(dir, "implementation-decisions.yaml");
    fs.writeFileSync(
      reqPath,
      `REQ-ONE:
  status: Planned
  name: One
REQ-TWO:
  status: Implemented
  name: Two
`,
      "utf8"
    );
    fs.writeFileSync(
      implPath,
      `IMPL-ONE:
  status: Planned
  name: I1
`,
      "utf8"
    );
    try {
      process.env.TIED_BASE_PATH = dir;
      clearBasePathCache();

      const r = updateStatusFromPassedTokens({
        dry_run: true,
        passed_requirement_tokens: ["REQ-ONE", "REQ-TWO"],
        passed_impl_tokens: ["IMPL-ONE"],
      });

      assert.strictEqual(r.ok, true);
      assert.strictEqual(r.dry_run, true);
      assert.ok(Array.isArray(r.would_update));
      const reqOne = r.would_update!.find((c) => c.token === "REQ-ONE");
      assert.ok(reqOne);
      assert.strictEqual(reqOne!.next_status, "Implemented");
      assert.strictEqual(reqOne!.previous_status, "Planned");
      const reqTwo = r.would_update!.find((c) => c.token === "REQ-TWO");
      assert.strictEqual(reqTwo, undefined, "already Implemented — no row");
      const implOne = r.would_update!.find((c) => c.token === "IMPL-ONE");
      assert.ok(implOne);
      assert.strictEqual(implOne!.next_status, "Active");

      const disk = fs.readFileSync(reqPath, "utf8");
      assert.ok(disk.includes("status: Planned"), "disk unchanged");
    } finally {
      delete process.env.TIED_BASE_PATH;
      clearBasePathCache();
      fs.rmSync(dir, { recursive: true });
    }
  });

  it("dry_run with empty passed lists returns empty would_update and unchanged disk", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-verify-empty-"));
    const reqPath = path.join(dir, "requirements.yaml");
    fs.writeFileSync(
      reqPath,
      `REQ-ONE:
  status: Planned
  name: One
`,
      "utf8"
    );
    try {
      process.env.TIED_BASE_PATH = dir;
      clearBasePathCache();

      const r = updateStatusFromPassedTokens({
        dry_run: true,
        passed_requirement_tokens: [],
        passed_impl_tokens: [],
      });

      assert.strictEqual(r.ok, true);
      assert.strictEqual(r.dry_run, true);
      assert.deepStrictEqual(r.would_update, []);

      const disk = fs.readFileSync(reqPath, "utf8");
      assert.ok(disk.includes("status: Planned"));
    } finally {
      delete process.env.TIED_BASE_PATH;
      clearBasePathCache();
      fs.rmSync(dir, { recursive: true });
    }
  });
});
