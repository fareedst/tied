/**
 * [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
 * How: Exercise bootstrap and refresh behavior while preserving client-owned project YAML, documentation, vocabulary, and unrelated content.
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execSync } from "node:child_process";
import {
  clearBasePathCache,
  loadIndex,
  getRecord,
  resolveIndexPath,
} from "../yaml-loader.js";

describe("e2e: bootstrap and load", () => {
  let tempDir: string;
  let repoRoot: string;

  beforeEach(() => {
    clearBasePathCache();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-e2e-"));
    // When run from mcp-server (npm test), cwd is mcp-server; repo root is parent.
    repoRoot = path.resolve(process.cwd(), "..");
  });

  afterEach(() => {
    delete process.env.TIED_BASE_PATH;
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true });
    }
  });

  it("copy_files.sh populates tied/ and loader reads requirements index from it [IMPL]", () => {
    const copyScript = path.join(repoRoot, "copy_files.sh");
    assert.ok(fs.existsSync(copyScript), `copy_files.sh not found at ${copyScript}`);
    execSync(`bash "${copyScript}" "${tempDir}"`, {
      stdio: "pipe",
      cwd: repoRoot,
    });
    const tiedDir = path.join(tempDir, "tied");
    assert.ok(fs.existsSync(tiedDir), "tied/ should exist after copy_files.sh");
    const requirementsPath = path.join(tiedDir, "requirements.yaml");
    assert.ok(fs.existsSync(requirementsPath), "tied/requirements.yaml should exist");

    process.env.TIED_BASE_PATH = tiedDir;
    clearBasePathCache();

    const resolved = resolveIndexPath("requirements");
    assert.ok(
      resolved.includes("tied") && resolved.endsWith("requirements.yaml"),
      `resolveIndexPath should point into tied/; got ${resolved}`
    );

    const data = loadIndex("requirements");
    assert.ok(data !== null && typeof data === "object", "loadIndex(requirements) should return an object");
    assert.ok(
      "REQ-TIED_SETUP" in data,
      "Copied index should contain inherited token REQ-TIED_SETUP"
    );
    assert.ok(
      "REQ-MODULE_VALIDATION" in data,
      "Copied index should contain inherited token REQ-MODULE_VALIDATION"
    );

    const rec = getRecord("requirements", "REQ-TIED_SETUP");
    assert.ok(rec !== null && typeof rec === "object", "getRecord should return REQ-TIED_SETUP");
    const recObj = rec as Record<string, unknown>;
    assert.strictEqual(recObj.name, "TIED Methodology Setup");

    const tiedCli = path.join(tempDir, ".cursor", "skills", "tied-yaml", "scripts", "tied-cli.sh");
    assert.ok(
      fs.existsSync(tiedCli),
      "copy_files.sh should install the canonical tied-cli at .cursor/skills/tied-yaml/scripts/tied-cli.sh [IMPL-TIED_FILES]"
    );
    const tiedCliText = fs.readFileSync(tiedCli, "utf8");
    const tiedRepoRootReal = fs.realpathSync(repoRoot);
    assert.ok(
      tiedCliText.includes(`TIED_REPO_ROOT:=${tiedRepoRootReal}`),
      "installed tied-cli.sh should bake TIED_REPO_ROOT default from the TIED repo used for copy_files.sh"
    );
    assert.ok(
      !tiedCliText.includes('TIED_REPO_ROOT:=/ABSOLUTE/PATH/TO/TIED/SOURCE/DIR'),
      "installed tied-cli.sh should not leave the unsubstituted TIED_REPO_ROOT default"
    );
    const rootScriptsTiedCli = path.join(tempDir, "scripts", "tied-cli.sh");
    assert.ok(
      !fs.existsSync(rootScriptsTiedCli),
      "copy_files.sh should not create scripts/tied-cli.sh (single CLI path is under .cursor/skills/) [IMPL-TIED_FILES]"
    );

    const vocabIndex = path.join(tiedDir, "vocab", "domain-references.md");
    const vocabRouting = path.join(tiedDir, "vocab", "routing.md");
    const vocabMethodology = path.join(tiedDir, "vocab", "tied-methodology.md");
    assert.ok(
      fs.existsSync(vocabIndex),
      "copy_files.sh should seed tied/vocab/domain-references.md [IMPL-TIED_FILES] [PROC-VOCABULARY_INDEX]"
    );
    assert.ok(
      fs.existsSync(vocabRouting),
      "copy_files.sh should seed tied/vocab/routing.md [IMPL-TIED_FILES] [PROC-VOCABULARY_INDEX]"
    );
    assert.ok(
      fs.existsSync(vocabMethodology),
      "copy_files.sh should seed tied/vocab/tied-methodology.md [REQ-TIED_SETUP]"
    );

    const vocabStandards = path.join(tempDir, "tied", "docs", "vocabulary-index-analysis-and-standards.md");
    const pseudoFormat = path.join(tempDir, "tied", "docs", "pseudocode-format-and-practices.md");
    assert.ok(
      fs.existsSync(vocabStandards),
      "copy_files.sh should copy tied/docs/vocabulary-index-analysis-and-standards.md [IMPL-TIED_FILES] [PROC-VOCABULARY_INDEX]"
    );
    assert.ok(
      fs.existsSync(pseudoFormat),
      "copy_files.sh should copy tied/docs/pseudocode-format-and-practices.md [IMPL-TIED_FILES]"
    );

  });

  it("refreshes inherited methodology without overwriting client content [IMPL-TIED_FILES]", () => {
    // [IMPL-TIED_FILES] [ARCH-TIED_STRUCTURE] [REQ-TIED_SETUP]
    // How: Refresh the inherited methodology snapshot, add absent vocabulary files, and preserve client-owned content.
    const copyScript = path.join(repoRoot, "copy_files.sh");
    const tiedDir = path.join(tempDir, "tied");
    const projectRequirements = path.join(tiedDir, "requirements.yaml");
    const customRequirement = path.join(tiedDir, "requirements", "REQ-CLIENT_ONLY.yaml");
    const customDoc = path.join(tiedDir, "docs", "methodology-migration.md");
    const vocabDir = path.join(tiedDir, "vocab");
    const customRouting = path.join(vocabDir, "routing.md");
    const customVocab = path.join(vocabDir, "client-only.md");
    const unrelatedClientFile = path.join(tempDir, "client-notes.txt");

    fs.mkdirSync(path.dirname(projectRequirements), { recursive: true });
    fs.mkdirSync(path.dirname(customRequirement), { recursive: true });
    fs.mkdirSync(path.dirname(customDoc), { recursive: true });
    fs.mkdirSync(vocabDir, { recursive: true });
    fs.writeFileSync(projectRequirements, "# client project YAML sentinel\nCLIENT_PROJECT: preserved\n");
    fs.writeFileSync(customRequirement, "REQ-CLIENT_ONLY:\n  name: client sentinel\n");
    fs.writeFileSync(customDoc, "# Client migration notes\npreserve this customized document.\n");
    fs.writeFileSync(customRouting, "# Client routing glossary\npreserve this customized glossary.\n");
    fs.writeFileSync(customVocab, "# Client-only glossary\n");
    fs.writeFileSync(unrelatedClientFile, "unrelated client content\n");

    execSync(`bash "${copyScript}" "${tempDir}"`, { stdio: "pipe", cwd: repoRoot });

    const methodologyDir = path.join(tiedDir, "methodology");
    const staleMethodologyFile = path.join(
      methodologyDir,
      "implementation-decisions",
      "STALE-INHERITED.yaml"
    );
    const staleMethodologySidecar = path.join(
      methodologyDir,
      "implementation-decisions",
      "STALE-INHERITED-pseudocode.md"
    );
    fs.writeFileSync(staleMethodologyFile, "stale: true\n");
    fs.writeFileSync(staleMethodologySidecar, "# stale inherited sidecar\n");

    execSync(`bash "${copyScript}" --merge-vocab "${tempDir}"`, {
      stdio: "pipe",
      cwd: repoRoot,
    });

    assert.strictEqual(
      fs.readFileSync(projectRequirements, "utf8"),
      "# client project YAML sentinel\nCLIENT_PROJECT: preserved\n",
      "refresh must preserve client project YAML"
    );
    assert.strictEqual(
      fs.readFileSync(customRequirement, "utf8"),
      "REQ-CLIENT_ONLY:\n  name: client sentinel\n",
      "refresh must preserve client detail YAML"
    );
    assert.strictEqual(
      fs.readFileSync(customDoc, "utf8"),
      "# Client migration notes\npreserve this customized document.\n",
      "refresh must preserve customized client documentation"
    );
    assert.strictEqual(
      fs.readFileSync(customRouting, "utf8"),
      "# Client routing glossary\npreserve this customized glossary.\n",
      "merge must preserve customized routing vocabulary"
    );
    assert.ok(fs.existsSync(path.join(vocabDir, "quality-assurance.md")), "merge must add an absent canonical glossary");
    assert.ok(fs.existsSync(customVocab), "merge must preserve unrelated client vocabulary");
    assert.strictEqual(
      fs.readFileSync(unrelatedClientFile, "utf8"),
      "unrelated client content\n",
      "refresh must preserve unrelated client content"
    );
    assert.ok(
      !fs.existsSync(staleMethodologyFile) && !fs.existsSync(staleMethodologySidecar),
      "refresh must prune stale inherited methodology files"
    );

    const promotedQualityDetail = path.join(
      methodologyDir,
      "implementation-decisions",
      "IMPL-QUALITY_EVIDENCE_MANIFEST.yaml"
    );
    const promotedQualitySidecar = path.join(
      methodologyDir,
      "implementation-decisions",
      "IMPL-QUALITY_EVIDENCE_MANIFEST-pseudocode.md"
    );
    assert.ok(fs.existsSync(promotedQualityDetail), "refresh must install promoted quality detail YAML");
    assert.ok(fs.existsSync(promotedQualitySidecar), "refresh must install promoted quality pseudo-code sidecar");
    assert.match(
      fs.readFileSync(promotedQualitySidecar, "utf8"),
      /\[IMPL-QUALITY_EVIDENCE_MANIFEST\]/,
      "promoted quality sidecar must retain its literal token linkage"
    );

    const listRelativeFiles = (root: string): string[] => {
      const entries = fs.readdirSync(root, { withFileTypes: true });
      return entries.flatMap((entry) => {
        const absolute = path.join(root, entry.name);
        if (entry.isDirectory()) {
          return listRelativeFiles(absolute).map((nested) => path.join(entry.name, nested));
        }
        return [entry.name];
      });
    };
    const expectedMethodologyFiles = [
      "requirements.yaml",
      "architecture-decisions.yaml",
      "implementation-decisions.yaml",
      "semantic-tokens.yaml",
      ...["requirements", "architecture-decisions", "implementation-decisions"].flatMap((directory) =>
        listRelativeFiles(path.join(repoRoot, "templates", directory)).map((file) => path.join(directory, file))
      ),
    ].sort();
    assert.deepStrictEqual(
      listRelativeFiles(methodologyDir).sort(),
      expectedMethodologyFiles,
      "refreshed methodology must match the current template file set exactly"
    );
  });

  it("loader reads semantic-tokens index from bootstrapped tied/ [IMPL]", () => {
    const copyScript = path.join(repoRoot, "copy_files.sh");
    execSync(`bash "${copyScript}" "${tempDir}"`, {
      stdio: "pipe",
      cwd: repoRoot,
    });
    const tiedDir = path.join(tempDir, "tied");
    process.env.TIED_BASE_PATH = tiedDir;
    clearBasePathCache();

    const data = loadIndex("semantic-tokens");
    assert.ok(data !== null && typeof data === "object", "loadIndex(semantic-tokens) should return an object");
    assert.ok(
      Object.keys(data).some((k) => k.startsWith("REQ-") || k.startsWith("ARCH-") || k.startsWith("IMPL-") || k.startsWith("PROC-")),
      "semantic-tokens index should contain token keys"
    );

    delete process.env.TIED_BASE_PATH;
  });
});
