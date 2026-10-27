/**
 * [REQ-TIED_LAYERED_CLIENT_INSTALL] BATCH-UNIT-001/002 — install targets list.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import {
  dedupeInstallTargets,
  expandHomePath,
  extractTargetsListFromYamlDocument,
  filterInstallTargets,
  loadInstallTargetsYaml,
  normalizeInstallTargetEntry,
} from "./install-targets-list.mjs";

describe("install-targets-list [BATCH-UNIT-001]", () => {
  it("extractTargetsListFromYamlDocument accepts list or targets wrapper", () => {
    assert.deepEqual(extractTargetsListFromYamlDocument(["/a", "/b"]), ["/a", "/b"]);
    assert.deepEqual(extractTargetsListFromYamlDocument({ targets: ["/c"] }), ["/c"]);
    assert.throws(() => extractTargetsListFromYamlDocument({ clients: [] }), /TARGETS_YAML_INVALID/);
  });

  it("normalizeInstallTargetEntry resolves relative to baseDir", () => {
    const base = "/tmp/list-dir";
    assert.equal(normalizeInstallTargetEntry("../client", base), path.resolve(base, "../client"));
    assert.equal(normalizeInstallTargetEntry({ path: "./x" }, base), path.resolve(base, "./x"));
  });

  it("expandHomePath expands tilde", () => {
    assert.equal(expandHomePath("~"), os.homedir());
    assert.equal(expandHomePath("~/clients"), path.join(os.homedir(), "clients"));
  });

  it("loadInstallTargetsYaml reads file relative to yaml directory", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-targets-"));
    const child = path.join(dir, "client-a");
    fs.mkdirSync(child);
    const listPath = path.join(dir, "clients.yaml");
    fs.writeFileSync(listPath, "- ./client-a\n");
    const loaded = loadInstallTargetsYaml(listPath);
    assert.deepEqual(loaded, [path.resolve(dir, "client-a")]);
  });

  it("loadInstallTargetsYaml reads stdin when source is -", () => {
    const loaded = loadInstallTargetsYaml("-", {
      baseDir: "/tmp/base",
      readStdin: () => "- /abs/one\n",
    });
    assert.deepEqual(loaded, ["/abs/one"]);
  });

  it("dedupeInstallTargets preserves order", () => {
    const a = path.resolve("/tmp/a");
    assert.deepEqual(dedupeInstallTargets([a, a, "/tmp/b"]), [a, path.resolve("/tmp/b")]);
  });
});

describe("install-targets-list filters [BATCH-UNIT-002]", () => {
  it("filterInstallTargets applies include and exclude globs", () => {
    const paths = ["/fleet/alpha", "/fleet/beta", "/other/gamma"];
    const { paths: kept } = filterInstallTargets(paths, {
      includeGlob: "/fleet/**",
      excludeGlob: "**/beta",
      existsSync: () => true,
    });
    assert.deepEqual(kept, ["/fleet/alpha"]);
  });

  it("filterInstallTargets skipMissing drops absent dirs", () => {
    const { paths: kept } = filterInstallTargets(["/exists", "/gone"], {
      skipMissing: true,
      existsSync: (p) => p === "/exists",
    });
    assert.deepEqual(kept, ["/exists"]);
  });

  it("filterInstallTargets onlyInstalled keeps manifest paths", () => {
    const { paths: kept } = filterInstallTargets(["/a", "/b"], {
      existsSync: () => true,
      onlyInstalled: true,
      readManifest: (p) => (p === "/a" ? { mode: "linked" } : null),
    });
    assert.deepEqual(kept, ["/a"]);
  });

  it("filterInstallTargets throws TARGETS_FILTER_EMPTY when nothing left", () => {
    assert.throws(
      () => filterInstallTargets(["/a"], { existsSync: () => false, skipMissing: true }),
      /TARGETS_FILTER_EMPTY/,
    );
  });
});
