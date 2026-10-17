// [IMPL-TIED_LAYERED_CLIENT_INSTALL] [REQ-TIED_LAYERED_CLIENT_INSTALL] [REQ-TIED_BROWNFIELD_INTENT_ELEVATION]
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const REPO_ROOT = path.resolve(import.meta.dirname, "../../..");

function read(rel: string): string {
  return fs.readFileSync(path.join(REPO_ROOT, rel), "utf8");
}

describe("AUDIT_BROWNFIELD_CLIENT_DOC_STACK [REQ-TIED_LAYERED_CLIENT_INSTALL]", () => {
  it("manifest lists brownfield methodology docs and matrix template", () => {
    const manifest = JSON.parse(read("tools/bootstrap/manifest.json")) as {
      DOCS_TO_COPY: string[];
      METHODOLOGY_TEMPLATES_TO_COPY: string[];
    };
    assert.ok(manifest.DOCS_TO_COPY.includes("brownfield-intent-elevation.md"));
    assert.ok(manifest.DOCS_TO_COPY.includes("working-artifact-placement.md"));
    assert.ok(
      manifest.METHODOLOGY_TEMPLATES_TO_COPY.includes("brownfield-evidence-to-intent-matrix.md"),
    );
    assert.ok(
      fs.existsSync(path.join(REPO_ROOT, "tied-bundle/docs/brownfield-intent-elevation.md")),
    );
    assert.ok(
      fs.existsSync(path.join(REPO_ROOT, "tied-bundle/docs/working-artifact-placement.md")),
    );
    assert.ok(
      fs.existsSync(
        path.join(REPO_ROOT, "tied-bundle/templates/brownfield-evidence-to-intent-matrix.md"),
      ),
    );
  });
});
