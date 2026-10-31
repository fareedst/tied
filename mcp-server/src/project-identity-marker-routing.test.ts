/**
 * [REQ-TIED_PROJECT_IDENTITY_MARKER_ROUTING] [IMPL-TIED_PROJECT_IDENTITY_MARKER_ROUTING]
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";
import { ensureProjectIdentityMarker } from "./project-identity-write-binding.js";
import { tryResolveMarkerOnlyBaseFromCwd } from "./project-identity-marker-routing.js";
import { clearBasePathCache, getBasePath, getBasePathResolutionMetadata } from "./yaml-loader.js";
function writeMarkerOnlyClient(root: string, opts?: { markerWritableRoot?: string }): string {
  const tied = path.join(root, "tied-project");
  fs.mkdirSync(tied, { recursive: true });
  fs.writeFileSync(path.join(tied, "requirements.yaml"), "{}\n");
  fs.writeFileSync(
    path.join(tied, "config.yaml"),
    "schema: tied-project-config.v1\nidentity:\n  routing: marker_only\nyaml:\n  scalar_style: wrapped\n",
  );
  ensureProjectIdentityMarker(tied, {});
  if (opts?.markerWritableRoot) {
    const markerPath = path.join(tied, "project-identity.v1.yaml");
    fs.writeFileSync(
      markerPath,
      `project_id: abcdef0123456789\nwritable_root: ${opts.markerWritableRoot}\nidentity_source: path_fallback\n`,
      "utf8",
    );
  }
  return tied;
}

afterEach(() => {
  clearBasePathCache();
});

describe("project-identity-marker-routing [IMPL-TIED_PROJECT_IDENTITY_MARKER_ROUTING]", () => {
  it("tryResolveMarkerOnlyBaseFromCwd returns null when routing is env_dual_read", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "tied-path3-"));
    const tied = path.join(root, "tied-project");
    fs.mkdirSync(tied, { recursive: true });
    fs.writeFileSync(path.join(tied, "requirements.yaml"), "{}\n");
    fs.writeFileSync(
      path.join(tied, "config.yaml"),
      "schema: tied-project-config.v1\nyaml:\n  scalar_style: wrapped\n",
    );
    const hit = tryResolveMarkerOnlyBaseFromCwd(root);
    assert.equal(hit, null);
    fs.rmSync(root, { recursive: true });
  });

  it("getBasePath ignores wrong env when marker_only and cwd is in client repo", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "tied-path3-"));
    const tied = writeMarkerOnlyClient(root);
    const wrong = fs.mkdtempSync(path.join(os.tmpdir(), "tied-path3-wrong-"));
    fs.mkdirSync(wrong, { recursive: true });
    const origCwd = process.cwd();
    try {
      process.chdir(root);
      process.env.TIED_CLIENT_PROJECT_PATH = wrong;
      clearBasePathCache();
      assert.strictEqual(getBasePath(), path.resolve(tied));
      const meta = getBasePathResolutionMetadata();
      assert.strictEqual(meta.routing_mode, "marker_only");
      assert.strictEqual(meta.base_path_source, "marker");
      assert.equal(meta.env_project_path_ignored, true);
    } finally {
      process.chdir(origCwd);
      delete process.env.TIED_CLIENT_PROJECT_PATH;
      fs.rmSync(root, { recursive: true });
      fs.rmSync(wrong, { recursive: true });
    }
  });

  it("uses marker writable_root when it differs from tied-project dir but index exists", () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), "tied-path3-alt-"));
    const tied = path.join(root, "tied-project");
    const alt = path.join(root, "alt-tied-project");
    fs.mkdirSync(tied, { recursive: true });
    fs.mkdirSync(alt, { recursive: true });
    fs.writeFileSync(path.join(alt, "requirements.yaml"), "{}\n");
    fs.writeFileSync(
      path.join(tied, "config.yaml"),
      "schema: tied-project-config.v1\nidentity:\n  routing: marker_only\nyaml:\n  scalar_style: wrapped\n",
    );
    fs.writeFileSync(
      path.join(tied, "project-identity.v1.yaml"),
      `project_id: abcdef0123456789\nwritable_root: ${alt}\nidentity_source: path_fallback\n`,
      "utf8",
    );
    const hit = tryResolveMarkerOnlyBaseFromCwd(root);
    assert.ok(hit);
    assert.strictEqual(hit.writableRoot, path.resolve(alt));
    assert.strictEqual(hit.basePathSource, "marker");
    fs.rmSync(root, { recursive: true });
  });
});
