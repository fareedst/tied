/**
 * [IMPL-TIED_DAE_VERIFICATION_CHARTER] [REQ-TIED_DAE_VERIFICATION_CHARTER] — W4a mutation cache.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { buildMutationCacheReport, mutationCacheBlocksVerification } from "./mutation-cache.js";

describe("mutation-cache [REQ-TIED_DAE_VERIFICATION_CHARTER]", () => {
  it("skips when charter off (default clients unchanged)", () => {
    const report = buildMutationCacheReport({
      request_token: "REQ-TIED_DAE_VERIFICATION_CHARTER",
      project_root: process.cwd(),
      citdp: { record_identity: { verification_charter: false } },
      diff_paths: ["src/example.ts"],
      cache_dir: ".cache/mutation",
      hook_slug: "verification-gate",
    });
    assert.equal(report.action, "skipped");
    assert.equal(report.enabled, false);
    assert.equal(mutationCacheBlocksVerification(report), false);
  });

  it("fails verification-gate on cache miss (score below threshold)", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "mutation-cache-"));
    const report = buildMutationCacheReport({
      request_token: "REQ-TIED_DAE_VERIFICATION_CHARTER",
      project_root: root,
      citdp: {
        record_identity: {
          verification_charter: true,
          mutation_cache: true,
          mutation_cache_threshold: 0.75,
        },
      },
      diff_paths: ["src/module-a.ts"],
      cache_dir: path.join(root, "cache"),
      hook_slug: "verification-gate",
      timestamp: "2026-09-24T00-00-00Z",
    });
    assert.equal(report.enabled, true);
    assert.equal(report.score, 0);
    assert.equal(report.action, "fail");
    assert.equal(mutationCacheBlocksVerification(report), true);
  });
});
