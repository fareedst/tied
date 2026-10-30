/**
 * [REQ-TIED_PROJECT_IDENTITY_WRITE_BINDING] [IMPL-TIED_PROJECT_IDENTITY_WRITE_BINDING]
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";
import { resolveProjectIdentity } from "./project-identity.js";
import {
  IdentityWriteBindingError,
  PROJECT_IDENTITY_MARKER_BASENAME,
  assertBindingAtStartup,
  assertBindingForWrite,
  bindingStatus,
  ensureProjectIdentityMarker,
  getMarkerFilePath,
  isMarkerBootstrapPath,
  isWriteBindingEnforced,
  resetWriteBindingStateForTests,
} from "./project-identity-write-binding.js";

function tempTiedProject(): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "tied-binding-"));
  const tied = path.join(root, "tied-project");
  fs.mkdirSync(tied, { recursive: true });
  fs.writeFileSync(path.join(tied, "requirements.yaml"), "{}\n");
  fs.writeFileSync(
    path.join(tied, "config.yaml"),
    "schema: tied-project-config.v1\nyaml:\n  scalar_style: wrapped\n",
  );
  return tied;
}

afterEach(() => {
  resetWriteBindingStateForTests();
});

describe("project-identity-write-binding [IMPL-TIED_PROJECT_IDENTITY_WRITE_BINDING]", () => {
  it("defaults enforce to true when identity section absent", () => {
    const tied = tempTiedProject();
    assert.equal(isWriteBindingEnforced(tied), true);
  });

  it("ensureProjectIdentityMarker creates marker when missing", () => {
    const tied = tempTiedProject();
    const env = {};
    ensureProjectIdentityMarker(tied, env);
    const markerPath = getMarkerFilePath(tied);
    assert.ok(fs.existsSync(markerPath));
    const id = resolveProjectIdentity(tied, env);
    const raw = fs.readFileSync(markerPath, "utf8");
    assert.match(raw, new RegExp(id.project_id));
  });

  it("assertBindingAtStartup throws when marker writable_root disagrees with live base", () => {
    const tied = tempTiedProject();
    ensureProjectIdentityMarker(tied, {});
    const markerPath = getMarkerFilePath(tied);
    fs.writeFileSync(
      markerPath,
      "project_id: abcdef0123456789\nwritable_root: /tmp/wrong-tied-project\nidentity_source: path_fallback\n",
      "utf8",
    );
    resetWriteBindingStateForTests();
    assert.throws(
      () => assertBindingAtStartup(tied, {}),
      (err: unknown) => err instanceof IdentityWriteBindingError,
    );
  });

  it("assertBindingForWrite throws when marker project_id was tampered", () => {
    const tied = tempTiedProject();
    ensureProjectIdentityMarker(tied, {});
    const markerPath = getMarkerFilePath(tied);
    fs.writeFileSync(
      markerPath,
      "project_id: deadbeefdeadbeef\nwritable_root: " +
        tied +
        "\nidentity_source: path_fallback\n",
      "utf8",
    );
    resetWriteBindingStateForTests();
    assert.throws(
      () => assertBindingForWrite(path.join(tied, "requirements.yaml"), tied, {}),
      IdentityWriteBindingError,
    );
  });

  it("marker bootstrap path is exempt from assertBindingForWrite", () => {
    const tied = tempTiedProject();
    const marker = getMarkerFilePath(tied);
    assert.ok(isMarkerBootstrapPath(marker, tied));
    assert.doesNotThrow(() => assertBindingForWrite(marker, tied, {}));
  });

  it("bindingStatus reports disabled when config opts out", () => {
    const tied = tempTiedProject();
    fs.writeFileSync(
      path.join(tied, "config.yaml"),
      "schema: tied-project-config.v1\nidentity:\n  write_binding: false\nyaml:\n  scalar_style: wrapped\n",
    );
    assert.equal(isWriteBindingEnforced(tied), false);
    assert.equal(bindingStatus(tied, {}), "disabled");
  });

  it("bindingStatus ok after valid marker", () => {
    const tied = tempTiedProject();
    ensureProjectIdentityMarker(tied, {});
    assert.equal(bindingStatus(tied, {}), "ok");
  });
});
