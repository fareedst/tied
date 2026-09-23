import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";
import { describe, it } from "node:test";

import { yamlCanonicalizerCliFromYamlCliModule } from "./paths.js";

// [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_YAML_CANONICALIZATION]
describe("@tied/yaml-cli parity [REQ-TIED_UNIFIED_TOOLCHAIN]", () => {
  const yamlCliEntry = path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    "index.js",
  );

  it("lint --check matches direct yaml-canonicalizer after canonicalize", () => {
    const canonicalizer = yamlCanonicalizerCliFromYamlCliModule(import.meta.url);
    assert.ok(fs.existsSync(canonicalizer), `build MCP first: ${canonicalizer}`);

    const source = path.join(
      mcpWorkspaceRootFromTest(import.meta.url),
      "fixtures",
      "record-list-sort",
      "tie-break.input.yaml",
    );
    assert.ok(fs.existsSync(source), source);

    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-yaml-lint-"));
    const fileA = path.join(tmpDir, "a.yaml");
    const fileB = path.join(tmpDir, "b.yaml");
    fs.copyFileSync(source, fileA);
    fs.copyFileSync(source, fileB);

    execFileSync(process.execPath, [canonicalizer, fileA]);
    execFileSync(process.execPath, [yamlCliEntry, "canonicalize", fileB]);
    assert.equal(fs.readFileSync(fileA, "utf8"), fs.readFileSync(fileB, "utf8"));

    execFileSync(process.execPath, [canonicalizer, "--check", fileA], { stdio: "inherit" });
    execFileSync(process.execPath, [yamlCliEntry, "lint", fileB], { stdio: "inherit" });
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("canonicalize rewrites a temp file like yaml-canonicalizer", () => {
    const canonicalizer = yamlCanonicalizerCliFromYamlCliModule(import.meta.url);
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-yaml-cli-"));
    const fileA = path.join(tmpDir, "a.yaml");
    const fileB = path.join(tmpDir, "b.yaml");
    const sample = "z: 1\nnames: [zeta, alpha]\n";
    fs.writeFileSync(fileA, sample);
    fs.copyFileSync(fileA, fileB);

    execFileSync(process.execPath, [canonicalizer, fileA]);
    execFileSync(process.execPath, [yamlCliEntry, "canonicalize", fileB]);

    assert.equal(fs.readFileSync(fileA, "utf8"), fs.readFileSync(fileB, "utf8"));
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });
});

function mcpWorkspaceRootFromTest(moduleUrl: string): string {
  const here = fileURLToPath(moduleUrl);
  return path.resolve(path.dirname(here), "../../..");
}
