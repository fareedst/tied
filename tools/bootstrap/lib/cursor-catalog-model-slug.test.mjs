/**
 * [REQ-WF_TRIAL_MODEL_EFFORT] Cursor Grok catalog slug prefix canonicalization.
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  canonicalizeCursorAgentModelSlug,
  canonicalizeGrokCatalogBase,
} from "./cursor-catalog-model-slug.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const CLI = path.join(REPO_ROOT, "tools/bootstrap/lib/cursor-catalog-model-slug.mjs");

describe("cursor-catalog-model-slug [REQ-WF_TRIAL_MODEL_EFFORT]", () => {
  it("canonicalizeGrokCatalogBase 4.5/4.6 adds cursor- prefix", () => {
    assert.equal(canonicalizeGrokCatalogBase("grok-4.6"), "cursor-grok-4.6");
    assert.equal(canonicalizeGrokCatalogBase("cursor-grok-4.6"), "cursor-grok-4.6");
    assert.equal(canonicalizeGrokCatalogBase("grok-4.5"), "cursor-grok-4.5");
  });

  it("canonicalizeGrokCatalogBase 4.7+ strips cursor- prefix", () => {
    assert.equal(canonicalizeGrokCatalogBase("cursor-grok-4.7"), "grok-4.7");
    assert.equal(canonicalizeGrokCatalogBase("grok-4.7"), "grok-4.7");
  });

  it("canonicalizeCursorAgentModelSlug preserves tier and fast suffix", () => {
    assert.equal(
      canonicalizeCursorAgentModelSlug("grok-4.6-low-fast"),
      "cursor-grok-4.6-low-fast",
    );
    assert.equal(
      canonicalizeCursorAgentModelSlug("cursor-grok-4.7-medium-fast"),
      "grok-4.7-medium-fast",
    );
    assert.equal(
      canonicalizeCursorAgentModelSlug("grok-4.7-medium-fast"),
      "grok-4.7-medium-fast",
    );
  });

  it("leaves composer and luna slugs unchanged", () => {
    assert.equal(
      canonicalizeCursorAgentModelSlug("composer-2.5-fast"),
      "composer-2.5-fast",
    );
    assert.equal(
      canonicalizeCursorAgentModelSlug("gpt-5.6-luna-low-fast"),
      "gpt-5.6-luna-low-fast",
    );
    assert.equal(canonicalizeCursorAgentModelSlug("Auto"), "Auto");
  });

  it("CLI canonicalize prints one line", () => {
    const r = spawnSync(process.execPath, [CLI, "canonicalize", "grok-4.6-high-fast"], {
      cwd: REPO_ROOT,
      encoding: "utf8",
    });
    assert.equal(r.status, 0, r.stderr);
    assert.equal(r.stdout.trim(), "cursor-grok-4.6-high-fast");
  });
});
