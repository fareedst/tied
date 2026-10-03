/**
 * [REQ-TIED_TWO_FOLDER_LAYOUT] project config loader tests.
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import yaml from "js-yaml";
import {
  loadProjectConfig,
  normalizeLegacyRootYamlToProjectRecord,
  PROJECT_CONFIG_SCHEMA_V1,
  resolveProjectConfigPath,
  writeProjectConfig,
} from "./project-config.mjs";
import { assertConfigKeyOwnership, mergeTiedConfig } from "./merge-tied-config.mjs";
import { BUNDLE_DIR_NAME, PROJECT_DIR_NAME } from "./layout.mjs";

function mkdtemp(prefix) {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

describe("resolveProjectConfigPath", () => {
  it("prefers tied-project/config.yaml over legacy root file", () => {
    const root = mkdtemp("tfl-cfg-");
    fs.mkdirSync(path.join(root, PROJECT_DIR_NAME), { recursive: true });
    fs.writeFileSync(
      path.join(root, PROJECT_DIR_NAME, "config.yaml"),
      `schema: ${PROJECT_CONFIG_SCHEMA_V1}\nyaml:\n  scalar_style: wrapped\n`,
    );
    fs.writeFileSync(path.join(root, "tied-project/config.yaml"), "scalar_style: unwrapped\n");
    const resolved = resolveProjectConfigPath(root);
    assert.equal(resolved?.source, "project-config-v1");
    assert.match(resolved.path, /tied-project[/\\]config\.yaml$/);
  });

  it("falls back to legacy .tied-yaml.yaml for store layout", () => {
    const root = mkdtemp("tfl-legacy-cfg-");
    fs.mkdirSync(path.join(root, "tied"), { recursive: true });
    fs.writeFileSync(path.join(root, ".tied-yaml.yaml"), "scalar_style: wrapped\n");
    const resolved = resolveProjectConfigPath(root);
    assert.equal(resolved?.source, "legacy-root-yaml");
  });
});

describe("loadProjectConfig + ownership", () => {
  it("normalizes legacy yaml to v1 record shape", () => {
    const raw = { scalar_style: "wrapped", jev: { plan_skills: true } };
    const norm = normalizeLegacyRootYamlToProjectRecord(raw);
    assert.equal(norm.schema, PROJECT_CONFIG_SCHEMA_V1);
    assert.equal(norm.yaml.scalar_style, "wrapped");
    assert.equal(norm.jev.plan_skills, true);
  });

  it("CONFIG_KEY_OWNERSHIP_VIOLATION when install holds jev", () => {
    assert.throws(
      () =>
        assertConfigKeyOwnership({ schema: PROJECT_CONFIG_SCHEMA_V1 }, { schema: "tied-install.v2", jev: {} }),
      (e) => e.code === "CONFIG_KEY_OWNERSHIP_VIOLATION",
    );
  });

  it("mergeTiedConfig overlays install_defaults with install actual", () => {
    const project = {
      schema: PROJECT_CONFIG_SCHEMA_V1,
      install_defaults: { mode: "linked", harness: "cursor" },
    };
    const install = { schema: "tied-install.v2", mode: "full", harness: "both", store: "/s" };
    const merged = mergeTiedConfig(project, install);
    assert.equal(merged.install.mode, "full");
    assert.equal(merged.install.harness, "both");
  });

  it("writeProjectConfig creates tied-project/config.yaml", () => {
    const root = mkdtemp("tfl-write-cfg-");
    fs.mkdirSync(path.join(root, BUNDLE_DIR_NAME), { recursive: true });
    const { configPath } = writeProjectConfig(root, {
      yaml: { scalar_style: "unwrapped" },
      jev: { plan_skills: true },
    });
    assert.match(configPath, /tied-project[/\\]config\.yaml$/);
    const loaded = loadProjectConfig(root);
    assert.equal(loaded?.record.jev.plan_skills, true);
    assert.equal(yaml.load(fs.readFileSync(configPath, "utf8")).schema, PROJECT_CONFIG_SCHEMA_V1);
  });
});
