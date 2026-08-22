import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { loadProjectScope } from "./project-scope-loader.js";

const fixtureRoot = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../../test/fixtures/adversarial-inquiry-mode-b/mini-project",
);

const baseInput = {
  projectRoot: fixtureRoot,
  tiedBasePath: path.join(fixtureRoot, "tied"),
  requestToken: "REQ-FIXTURE-ADVERSARIAL",
  implToken: "IMPL-FIXTURE-ADVERSARIAL",
  testPath: "test/sample_divide_good_test.rb",
  productionPath: "lib/sample_divide.rb",
  productionEvidencePath: "production-evidence/sample-divide-good.json",
};

describe("BUILD_PROJECT_INQUIRY_INPUT project scope loader REQ-TIED_ADVERSARIAL_INQUIRY", () => {
  // [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: validate an explicit project boundary, load declared read-only inputs, and normalize one supported Ruby Minitest fixture into the existing inquiry core.
  it("loads an explicit project scope without using the process TIED_BASE_PATH", async () => {
    const canonicalPaths = [
      path.join(fixtureRoot, "tied/requirements.yaml"),
      path.join(fixtureRoot, "tied/architecture-decisions.yaml"),
      path.join(fixtureRoot, "tied/implementation-decisions.yaml"),
      path.join(fixtureRoot, "tied/semantic-tokens.yaml"),
    ];
    const before = canonicalPaths.map((filePath) => fs.readFileSync(filePath, "utf8"));
    const previous = process.env.TIED_BASE_PATH;
    process.env.TIED_BASE_PATH = path.join(os.tmpdir(), "wrong-tied-base");
    try {
      const result = await loadProjectScope(baseInput);
      assert.equal(result.ok, true);
      if (result.ok) {
        assert.equal(result.scope.manifest.tiedBasePath, baseInput.tiedBasePath);
        assert.match(result.scope.testSource, /assert_equal/);
        assert.match(result.scope.implementationPseudocode, /BUILD_PROJECT_INQUIRY_INPUT/);
        assert.equal((result.scope.productionEvidence as unknown[] | undefined)?.length, 1);
      }
    } finally {
      if (previous === undefined) delete process.env.TIED_BASE_PATH;
      else process.env.TIED_BASE_PATH = previous;
    }
    assert.deepEqual(canonicalPaths.map((filePath) => fs.readFileSync(filePath, "utf8")), before);
  });

  it("rejects traversal before reading a declared source path", async () => {
    const result = await loadProjectScope({
      ...baseInput,
      testPath: "../outside.rb",
    });

    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error.code, "UNSAFE_PATH");
  });

  it("rejects absolute source paths", async () => {
    const result = await loadProjectScope({
      ...baseInput,
      productionPath: path.join(os.tmpdir(), "outside.rb"),
    });

    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error.code, "UNSAFE_PATH");
  });

  it("rejects symlinked source paths that resolve outside the project", async () => {
    const outsideRoot = fs.mkdtempSync(path.join(os.tmpdir(), "adversarial-inquiry-outside-"));
    const outsideFile = path.join(outsideRoot, "outside.rb");
    const link = path.join(fixtureRoot, "test", "symlink_escape_test.rb");
    fs.writeFileSync(outsideFile, "assert true\n", "utf8");
    try {
      fs.symlinkSync(outsideFile, link);
      const result = await loadProjectScope({
        ...baseInput,
        testPath: "test/symlink_escape_test.rb",
      });

      assert.equal(result.ok, false);
      if (!result.ok) assert.equal(result.error.code, "UNSAFE_PATH");
    } finally {
      fs.rmSync(link, { force: true });
      fs.rmSync(outsideRoot, { recursive: true, force: true });
    }
  });

  it("rejects a TIED base path that is not projectRoot/tied", async () => {
    const result = await loadProjectScope({
      ...baseInput,
      tiedBasePath: path.join(os.tmpdir(), "other-project", "tied"),
    });

    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error.code, "WRONG_TIED_BASE_PATH");
  });

  it("returns a stable missing-file diagnostic", async () => {
    const result = await loadProjectScope({
      ...baseInput,
      testPath: "test/missing_test.rb",
    });

    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error.code, "MISSING_FILE");
      assert.equal(result.error.path, "test/missing_test.rb");
    }
  });
});
