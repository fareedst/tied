import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { loadProjectScope, resolveModeBManifestProfile } from "./project-scope-loader.js";

const fixtureRoot = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../../test/fixtures/adversarial-inquiry-go-mode-b/mini-project",
);

const baseInput = {
  projectRoot: fixtureRoot,
  tiedBasePath: path.join(fixtureRoot, "tied"),
  requestToken: "REQ-FIXTURE-ADVERSARIAL",
  implToken: "IMPL-FIXTURE-ADVERSARIAL",
  testPath: "internal/divide/divide_test.go",
  productionPath: "internal/divide/divide.go",
  productionEvidencePath: "production-evidence/sample-divide-good.json",
};

describe("BUILD_PROJECT_INQUIRY_INPUT Go project scope loader REQ-TIED_ADVERSARIAL_INQUIRY", () => {
  // [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY] How: validate Go _test.go paths with realpath confinement and read-only TIED loads.
  it("loads an explicit Go project scope with go-test manifest profile", async () => {
    const result = await loadProjectScope(baseInput);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.deepEqual(result.scope.manifest.languages, ["go"]);
      assert.deepEqual(result.scope.manifest.testClassifiers, ["go-test"]);
      assert.match(result.scope.testSource, /t\.Errorf/);
      assert.match(result.scope.productionSource, /func Divide/);
    }
  });

  it("rejects unsupported test_path extensions before reading", async () => {
    const result = await loadProjectScope({
      ...baseInput,
      testPath: "internal/divide/divide.spec.ts",
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error.code, "INVALID_INPUT");
  });

  it("rejects traversal before reading a declared Go source path", async () => {
    const result = await loadProjectScope({
      ...baseInput,
      testPath: "../outside_test.go",
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error.code, "UNSAFE_PATH");
  });

  it("rejects absolute Go source paths", async () => {
    const result = await loadProjectScope({
      ...baseInput,
      productionPath: path.join(os.tmpdir(), "outside.go"),
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error.code, "UNSAFE_PATH");
  });

  it("rejects symlinked Go paths that resolve outside the project", async () => {
    const outsideRoot = fs.mkdtempSync(path.join(os.tmpdir(), "adversarial-inquiry-go-outside-"));
    const outsideFile = path.join(outsideRoot, "outside_test.go");
    const link = path.join(fixtureRoot, "internal", "divide", "symlink_escape_test.go");
    fs.writeFileSync(outsideFile, "func TestX(t *testing.T) {}\n", "utf8");
    try {
      fs.symlinkSync(outsideFile, link);
      const result = await loadProjectScope({
        ...baseInput,
        testPath: "internal/divide/symlink_escape_test.go",
      });
      assert.equal(result.ok, false);
      if (!result.ok) assert.equal(result.error.code, "UNSAFE_PATH");
    } finally {
      fs.rmSync(link, { force: true });
      fs.rmSync(outsideRoot, { recursive: true, force: true });
    }
  });

  it("returns a stable missing-file diagnostic for Go tests", async () => {
    const result = await loadProjectScope({
      ...baseInput,
      testPath: "internal/divide/missing_test.go",
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error.code, "MISSING_FILE");
      assert.equal(result.error.path, "internal/divide/missing_test.go");
    }
  });

  it("selects go-test classifier for _test.go paths", () => {
    assert.deepEqual(resolveModeBManifestProfile("internal/divide/divide_test.go"), {
      languages: ["go"],
      testClassifiers: ["go-test"],
    });
  });
});
