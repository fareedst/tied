/**
 * [REQ-TIED_EDPC_COMPREHENSION] [IMPL-TIED_LAYERED_CLIENT_INSTALL]
 * How: EDPC methodology doc must live under tied-bundle/docs and ship via DOCS_TO_COPY.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { loadManifest } from "./constants.mjs";
import { TIED_REPO_ROOT } from "./constants.mjs";

const bundleDocs = path.join(TIED_REPO_ROOT, "tied-bundle", "docs");

describe("EDPC methodology bundle [REQ-TIED_EDPC_COMPREHENSION]", () => {
  it("DOCS_TO_COPY includes EDPC_Methodology_and_Workflows.md", () => {
    const manifest = loadManifest();
    assert.ok(manifest.DOCS_TO_COPY.includes("EDPC_Methodology_and_Workflows.md"));
  });

  it("canonical methodology file exists under tied-bundle/docs", () => {
    const canon = path.join(bundleDocs, "EDPC_Methodology_and_Workflows.md");
    assert.ok(fs.existsSync(canon));
    const text = fs.readFileSync(canon, "utf8");
    assert.match(text, /Evidence-Driven Program Comprehension/);
    assert.match(text, /Software Comprehension Model/);
  });

  it("tied-bundle docs reference in-bundle EDPC paths (not docs/methodologies)", () => {
    for (const name of ["processes.md", "brownfield-intent-elevation.md", "client-development-index.md"]) {
      const text = fs.readFileSync(path.join(bundleDocs, name), "utf8");
      assert.ok(
        !text.includes("../../docs/methodologies/EDPC_Methodology"),
        `${name} still links outside tied-bundle for EDPC methodology`
      );
    }
    const processes = fs.readFileSync(path.join(bundleDocs, "processes.md"), "utf8");
    assert.match(processes, /\[PROC-EDPC_COMPREHENSION\]/);
    assert.match(processes, /\.\/EDPC_Methodology_and_Workflows\.md/);
  });

  it("EDPC_METHODOLOGY_REQUIRED_FILES resolve under tied-bundle", () => {
    const required = loadManifest().EDPC_METHODOLOGY_REQUIRED_FILES ?? [];
    assert.ok(required.length >= 4);
    for (const rel of required) {
      const p = path.join(TIED_REPO_ROOT, "tied-bundle", rel);
      assert.ok(fs.existsSync(p), `missing ${rel}`);
    }
    const processes = fs.readFileSync(
      path.join(TIED_REPO_ROOT, "tied-bundle", "docs", "processes.md"),
      "utf8"
    );
    assert.match(processes, /\[PROC-EDPC_COMPREHENSION\]/);
  });
});
