/**
 * Unit tests for token rename. [PROC-YAML_DB_OPERATIONS] [IMPL-TIED_FILES] [REQ-TIED_SETUP]
 * - [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP] How: tied_token_rename supports extra_globs/extra_extensions anchored at client project root for substitution outside default TIED rename scope.
 * Verifies dry_run and actual rename across YAML indexes, detail file, and extra substitution targets.
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { clearBasePathCache, getClientProjectRoot } from "./yaml-loader.js";
import { renameSemanticToken, collectExtraSubstitutionPaths } from "./token-rename.js";

let tempDir: string;
let clientRoot: string;

beforeEach(() => {
  clearBasePathCache();
});

afterEach(() => {
  if (clientRoot && fs.existsSync(clientRoot)) {
    fs.rmSync(clientRoot, { recursive: true });
  }
  delete process.env.TIED_BASE_PATH;
  clearBasePathCache();
});

function setupTiedTree(withRequirementDetail: boolean): string {
  clientRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tied-rename-"));
  tempDir = path.join(clientRoot, "tied");
  fs.mkdirSync(tempDir, { recursive: true });
  process.env.TIED_BASE_PATH = tempDir;

  const semanticTokens = `
REQ-TEST_OLD:
  type: REQ
  name: Test Old
  status: Active
  description: Old token for rename test
  cross_references:
    - ARCH-TIED_STRUCTURE
  source_index: requirements.yaml
  detail_file: requirements/REQ-TEST_OLD.yaml
  metadata:
    registered: "2026-01-01"
    last_updated: "2026-01-01"
`;
  fs.writeFileSync(path.join(tempDir, "semantic-tokens.yaml"), semanticTokens.trim(), "utf8");

  const requirements = `
REQ-TEST_OLD:
  name: Test Old
  status: Implemented
  detail_file: requirements/REQ-TEST_OLD.yaml
`;
  fs.writeFileSync(path.join(tempDir, "requirements.yaml"), requirements.trim(), "utf8");

  if (withRequirementDetail) {
    const reqDir = path.join(tempDir, "requirements");
    fs.mkdirSync(reqDir, { recursive: true });
    const detailContent = `
REQ-TEST_OLD:
  name: Test Old
  traceability:
    architecture:
      - ARCH-TIED_STRUCTURE
`;
    fs.writeFileSync(path.join(reqDir, "REQ-TEST_OLD.yaml"), detailContent.trim(), "utf8");
  }

  clearBasePathCache();
  return tempDir;
}

describe("collectExtraSubstitutionPaths", () => {
  it("resolves globs and extensions from client project root", () => {
    clientRoot = fs.mkdtempSync(path.join(os.tmpdir(), "tied-extra-"));
    fs.writeFileSync(path.join(clientRoot, "CHANGELOG.md"), "# REQ-TEST_OLD", "utf8");
    fs.mkdirSync(path.join(clientRoot, "Sources"), { recursive: true });
    fs.writeFileSync(path.join(clientRoot, "Sources", "App.swift"), "// REQ-TEST_OLD", "utf8");
    fs.mkdirSync(path.join(clientRoot, "node_modules", "pkg"), { recursive: true });
    fs.writeFileSync(path.join(clientRoot, "node_modules", "pkg", "index.swift"), "REQ-TEST_OLD", "utf8");

    const paths = collectExtraSubstitutionPaths(clientRoot, ["./*.md"], ["swift"]);
    assert.ok(paths.some((p) => p.endsWith("CHANGELOG.md")));
    assert.ok(paths.some((p) => p.endsWith("Sources/App.swift")));
    assert.ok(!paths.some((p) => p.includes("node_modules")));
  });
});

describe("getClientProjectRoot", () => {
  it("returns parent of TIED base path", () => {
    setupTiedTree(false);
    assert.strictEqual(getClientProjectRoot(), clientRoot);
  });
});

describe("renameSemanticToken", () => {
  it("returns error when old_token not in semantic-tokens", () => {
    setupTiedTree(false);
    const result = renameSemanticToken("REQ-NONEXISTENT", "REQ-NEW", { dryRun: true });
    assert.strictEqual(result.ok, false);
    assert.ok(result.errors?.some((e) => e.includes("not found")));
  });

  it("returns error when new_token already exists", () => {
    setupTiedTree(false);
    fs.writeFileSync(
      path.join(tempDir, "semantic-tokens.yaml"),
      `
REQ-TEST_OLD:
  type: REQ
  name: Old
  status: Active
  detail_file: null
  source_index: requirements.yaml
  metadata: {}
REQ-TEST_NEW:
  type: REQ
  name: New
  status: Active
  detail_file: null
  source_index: requirements.yaml
  metadata: {}
`.trim(),
      "utf8"
    );
    clearBasePathCache();
    const result = renameSemanticToken("REQ-TEST_OLD", "REQ-TEST_NEW", { dryRun: true });
    assert.strictEqual(result.ok, false);
    assert.ok(result.errors?.some((e) => e.includes("already exists")));
  });

  it("returns error when prefix does not match", () => {
    setupTiedTree(false);
    const result = renameSemanticToken("REQ-TEST_OLD", "ARCH-TEST_NEW", { dryRun: true });
    assert.strictEqual(result.ok, false);
    assert.ok(result.errors?.some((e) => e.includes("prefix") || e.includes("match")));
  });

  it("dry_run reports files_modified and file_renamed", () => {
    setupTiedTree(true);
    const result = renameSemanticToken("REQ-TEST_OLD", "REQ-TEST_NEW", { dryRun: true });
    assert.strictEqual(result.ok, true);
    assert.ok(Array.isArray(result.files_modified));
    assert.ok(result.files_modified!.length >= 1);
    assert.ok(result.files_modified!.some((p) => p.includes("semantic-tokens.yaml")));
    assert.ok(result.files_modified!.some((p) => p.includes("requirements.yaml")));
    assert.ok(result.file_renamed);
    assert.ok(result.file_renamed!.endsWith("REQ-TEST_NEW.yaml"));
    assert.strictEqual(result.dry_run, true);
  });

  it("actually renames token and detail file", () => {
    setupTiedTree(true);
    const result = renameSemanticToken("REQ-TEST_OLD", "REQ-TEST_NEW", { dryRun: false });
    assert.strictEqual(result.ok, true);
    assert.ok(Array.isArray(result.files_modified));
    assert.ok(result.file_renamed);
    assert.ok(result.file_renamed!.endsWith("REQ-TEST_NEW.yaml"));

    const semPath = path.join(tempDir, "semantic-tokens.yaml");
    const semContent = fs.readFileSync(semPath, "utf8");
    assert.ok(!semContent.includes("REQ-TEST_OLD"));
    assert.ok(semContent.includes("REQ-TEST_NEW"));

    const reqPath = path.join(tempDir, "requirements.yaml");
    const reqContent = fs.readFileSync(reqPath, "utf8");
    assert.ok(!reqContent.includes("REQ-TEST_OLD"));
    assert.ok(reqContent.includes("REQ-TEST_NEW"));

    const detailNew = path.join(tempDir, "requirements", "REQ-TEST_NEW.yaml");
    const detailOld = path.join(tempDir, "requirements", "REQ-TEST_OLD.yaml");
    assert.ok(fs.existsSync(detailNew), "new detail file should exist");
    assert.ok(!fs.existsSync(detailOld), "old detail file should be gone");
    const detailContent = fs.readFileSync(detailNew, "utf8");
    assert.ok(!detailContent.includes("REQ-TEST_OLD"));
    assert.ok(detailContent.includes("REQ-TEST_NEW"));
  });

  it("dry_run reports extra_globs and extra_extensions targets", () => {
    setupTiedTree(false);
    fs.writeFileSync(path.join(clientRoot, "CHANGELOG.md"), "tracks REQ-TEST_OLD", "utf8");
    fs.mkdirSync(path.join(clientRoot, "Tests"), { recursive: true });
    fs.writeFileSync(path.join(clientRoot, "Tests", "FooTests.swift"), "// REQ-TEST_OLD", "utf8");
    fs.mkdirSync(path.join(tempDir, "vocab"), { recursive: true });
    fs.writeFileSync(path.join(tempDir, "vocab", "topic.md"), "REQ-TEST_OLD", "utf8");

    const result = renameSemanticToken("REQ-TEST_OLD", "REQ-TEST_NEW", {
      dryRun: true,
      extraGlobs: ["./*.md", "tied/vocab/**/*.md"],
      extraExtensions: ["swift"],
    });
    assert.strictEqual(result.ok, true);
    assert.ok(result.files_modified!.some((p) => p.endsWith("CHANGELOG.md")));
    assert.ok(result.files_modified!.some((p) => p.endsWith("FooTests.swift")));
    assert.ok(result.files_modified!.some((p) => p.endsWith("topic.md")));
  });

  it("substitutes in extra targets when not dry_run", () => {
    setupTiedTree(false);
    fs.writeFileSync(path.join(clientRoot, "TODO.md"), "REQ-TEST_OLD todo", "utf8");

    const result = renameSemanticToken("REQ-TEST_OLD", "REQ-TEST_NEW", {
      dryRun: false,
      extraGlobs: ["./*.md"],
    });
    assert.strictEqual(result.ok, true);
    const todoContent = fs.readFileSync(path.join(clientRoot, "TODO.md"), "utf8");
    assert.ok(!todoContent.includes("REQ-TEST_OLD"));
    assert.ok(todoContent.includes("REQ-TEST_NEW"));
  });

  it("include_markdown still updates processes.md additively", () => {
    setupTiedTree(false);
    const docsDir = path.join(tempDir, "docs");
    fs.mkdirSync(docsDir, { recursive: true });
    fs.writeFileSync(path.join(docsDir, "processes.md"), "See REQ-TEST_OLD in [PROC-LEAP]", "utf8");

    const result = renameSemanticToken("REQ-TEST_OLD", "REQ-TEST_NEW", {
      dryRun: false,
      includeMarkdown: true,
    });
    assert.strictEqual(result.ok, true);
    const procContent = fs.readFileSync(path.join(docsDir, "processes.md"), "utf8");
    assert.ok(!procContent.includes("REQ-TEST_OLD"));
    assert.ok(procContent.includes("REQ-TEST_NEW"));
  });
});
