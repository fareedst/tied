/**
 * [REQ-TIED_SPONSOR_TWO_LANE_DELIVERY] SC-TLD-002 — sponsor-two-lane-delivery.md + client-development-index link.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import { loadManifest } from "./constants.mjs";

const REPO_ROOT = path.resolve(import.meta.dirname, "../../..");
const DOC = path.join(REPO_ROOT, "tied-bundle/docs/sponsor-two-lane-delivery.md");
const INDEX = path.join(REPO_ROOT, "tied-bundle/docs/client-development-index.md");

describe("sponsor-two-lane-delivery doc contract [REQ-TIED_SPONSOR_TWO_LANE_DELIVERY]", () => {
  it("DOCS_TO_COPY includes sponsor-two-lane-delivery.md", () => {
    const manifest = loadManifest();
    assert.ok(manifest.DOCS_TO_COPY.includes("sponsor-two-lane-delivery.md"));
  });

  it("guide documents charter lane, selection lane, and proof boundary", () => {
    const text = fs.readFileSync(DOC, "utf8");
    assert.match(text, /Charter lane/i);
    assert.match(text, /Selection lane/i);
    assert.match(text, /Proof boundary/i);
  });

  it("client-development-index links the guide", () => {
    const index = fs.readFileSync(INDEX, "utf8");
    assert.match(index, /sponsor-two-lane-delivery\.md/);
  });
});
