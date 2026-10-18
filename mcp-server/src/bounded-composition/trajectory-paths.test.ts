/**
 * [IMPL-TIED_BOUNDED_TRAJECTORY_EVIDENCE] [REQ-TIED_BOUNDED_COMPOSITION]
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import {
  assertTiedBasePathMatchesProject,
  resolveLocalTrajectoryPath,
} from "./trajectory-paths.js";
import { classifyWorkingRelativePath } from "../working-root.js";

describe("trajectory working-root classification", () => {
  it("routes trajectories/ to local working root", () => {
    assert.equal(classifyWorkingRelativePath("trajectories/run-1/summary.json"), "local");
  });
});

describe("resolveLocalTrajectoryPath", () => {
  it("places trajectories under tied-bundle/working when divided", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "bc-traj-"));
    fs.mkdirSync(path.join(root, "tied-project", "working"), { recursive: true });
    fs.mkdirSync(path.join(root, "tied-bundle", "working"), { recursive: true });
    fs.writeFileSync(path.join(root, "tied-project", "requirements.yaml"), "requirements: {}\n");
    try {
      const resolved = resolveLocalTrajectoryPath(root, "REQ-TIED_BOUNDED_COMPOSITION", "run-1");
      assert.equal("absolute" in resolved, true);
      if (!("absolute" in resolved)) return;
      assert.match(resolved.absolute, /tied-bundle[/\\]working[/\\]REQ-TIED_BOUNDED_COMPOSITION[/\\]trajectories[/\\]run-1$/);
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });

  it("rejects path traversal segments", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "bc-traj-bad-"));
    fs.mkdirSync(path.join(root, "tied-project", "working"), { recursive: true });
    fs.mkdirSync(path.join(root, "tied-bundle", "working"), { recursive: true });
    fs.writeFileSync(path.join(root, "tied-project", "requirements.yaml"), "requirements: {}\n");
    try {
      const resolved = resolveLocalTrajectoryPath(root, "REQ-TIED_BOUNDED_COMPOSITION", "..", "etc");
      assert.equal(resolved.code, "WrongBasePath");
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});

describe("assertTiedBasePathMatchesProject", () => {
  it("fails closed on wrong TIED_BASE_PATH", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "bc-base-"));
    try {
      const err = assertTiedBasePathMatchesProject(root, path.join(root, "other-tied-project"));
      assert.ok(err);
      assert.equal(err?.code, "WrongBasePath");
    } finally {
      fs.rmSync(root, { recursive: true, force: true });
    }
  });
});
