import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, it } from "node:test";

import { firstPendingSlugInOrder, runTiedNext } from "../../../dist/dae/tied-next.js";
import { loadTrackerFromFile } from "../../../dist/dae/yaml-load.js";

// [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — How: W1b golden slug from next-slug-pending fixture.

describe("tied next [REQ-TIED_DAE_INCORPORATION]", () => {
  let tempDir: string;
  let repoRoot: string;

  beforeEach(() => {
    repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../../");
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-next-test-"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("returns unit-test-red as first pending slug from fixture", () => {
    const fixture = path.join(
      repoRoot,
      "working/REQ-TIED_DAE_INCORPORATION/fixtures/trackers/next-slug-pending.yaml",
    );
    const tracker = loadTrackerFromFile(fixture);
    assert.equal(firstPendingSlugInOrder(tracker), "unit-test-red");
  });

  it("golden stdout from temp working copy", () => {
    const projectRoot = tempDir;
    const working = path.join(projectRoot, "working", "REQ-FIXTURE");
    fs.mkdirSync(working, { recursive: true });
    fs.copyFileSync(
      path.join(
        repoRoot,
        "working/REQ-TIED_DAE_INCORPORATION/fixtures/trackers/next-slug-pending.yaml",
      ),
      path.join(working, "checklist-tracker.yaml"),
    );
    const result = runTiedNext({
      projectRoot,
      requestToken: "REQ-FIXTURE",
    });
    assert.equal(result.exit_code, 0);
    assert.equal(result.slug, "unit-test-red");
    assert.match(result.rationale, /unit-test-red/);
  });
});
