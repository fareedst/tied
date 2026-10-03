/**
 * [REQ-TIED_SETUP] [IMPL-TIED_FILES] — PARSE_BOOTSTRAP_TOOL_FLAGS / APPLY_CLIENT_TOOL_USE_PROFILE
 */
import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import yaml from "js-yaml";
import {
  parseBootstrapToolFlags,
  applyClientToolUseBootstrapOptions,
} from "./client-tool-use-bootstrap.mjs";
import { TIED_REPO_ROOT } from "./constants.mjs";
import { PROJECT_CONFIG_SCHEMA_V1 } from "./project-config.mjs";
import { PROJECT_DIR_NAME, resolveTiedLayout } from "./layout.mjs";

describe("parseBootstrapToolFlags [REQ-TIED_SETUP] [IMPL-TIED_FILES]", () => {
  it("maps --full-tools and granular flags", () => {
    const { profile } = parseBootstrapToolFlags(["--full-tools", "--force-tool-config"], {});
    assert.equal(profile.fullTools, true);
    assert.equal(profile.jev, true);
    assert.equal(profile.dae, true);
    assert.equal(profile.bbce, true);
    assert.equal(profile.forceToolConfig, true);
  });

  it("CLI overrides env mirrors", () => {
    const env = { TIED_BOOTSTRAP_FULL_TOOLS: "1", TIED_BOOTSTRAP_WITH_JEV: "0" };
    const { profile } = parseBootstrapToolFlags(["--with-dae"], env);
    assert.equal(profile.fullTools, false);
    assert.equal(profile.jev, false);
    assert.equal(profile.dae, true);
  });

  it("parses --tools list case-insensitively", () => {
    const { profile, argv } = parseBootstrapToolFlags(["--tools", "JEV,BBCE", "/tmp/client"], {});
    assert.equal(profile.jev, true);
    assert.equal(profile.bbce, true);
    assert.equal(profile.dae, false);
    assert.deepEqual(argv, ["/tmp/client"]);
  });
});

describe("applyClientToolUseBootstrapOptions [REQ-TIED_SETUP] [IMPL-TIED_FILES]", () => {
  let tmpDir;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-tool-bootstrap-"));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it("merges jev and dae into tied-project/config.yaml when present", () => {
    fs.mkdirSync(path.join(tmpDir, PROJECT_DIR_NAME), { recursive: true });
    const configPath = path.join(tmpDir, PROJECT_DIR_NAME, "config.yaml");
    fs.writeFileSync(
      configPath,
      yaml.dump({
        schema: PROJECT_CONFIG_SCHEMA_V1,
        yaml: { scalar_style: "unwrapped" },
        jev: { plan_skills: false },
      }),
      "utf8",
    );
    applyClientToolUseBootstrapOptions(
      tmpDir,
      { jev: true, dae: true, bbce: false, fullTools: false, forceToolConfig: false },
      { tiedRepoRoot: TIED_REPO_ROOT, projectConfigPreExisting: false },
    );
    const doc = yaml.load(fs.readFileSync(configPath, "utf8"));
    assert.equal(doc.schema, PROJECT_CONFIG_SCHEMA_V1);
    assert.equal(doc.jev.plan_skills, true);
    assert.equal(doc.dae.crap_threshold, 30);
    assert.equal(doc.yaml.scalar_style, "unwrapped");
  });

  it("merges jev and dae on fresh tied-project/config.yaml", () => {
    const yamlPath = path.join(tmpDir, "tied-project/config.yaml");
    fs.writeFileSync(
      yamlPath,
      yaml.dump({ scalar_style: "unwrapped", jev: { plan_skills: false } }),
      "utf8"
    );
    applyClientToolUseBootstrapOptions(
      tmpDir,
      { jev: true, dae: true, bbce: false, fullTools: false, forceToolConfig: false },
      { tiedRepoRoot: TIED_REPO_ROOT, tiedYamlPreExisting: false }
    );
    const doc = yaml.load(fs.readFileSync(yamlPath, "utf8"));
    assert.equal(doc.jev.plan_skills, true);
    assert.equal(doc.dae.crap_threshold, 30);
    assert.equal(doc.dae.branch_check, undefined);
    assert.equal(doc.dae.agentstream_gate_check, undefined);
    assert.equal(doc.scalar_style, "unwrapped");
  });

  it("skips YAML merge when file pre-existed without force", () => {
    const yamlPath = path.join(tmpDir, "tied-project/config.yaml");
    const sentinel = "custom:\n  kept: true\njev:\n  plan_skills: false\n";
    fs.writeFileSync(yamlPath, sentinel, "utf8");
    applyClientToolUseBootstrapOptions(
      tmpDir,
      { jev: true, dae: false, bbce: false, fullTools: false, forceToolConfig: false },
      { tiedRepoRoot: TIED_REPO_ROOT, tiedYamlPreExisting: true }
    );
    assert.equal(fs.readFileSync(yamlPath, "utf8"), sentinel);
  });

  it("force merge preserves unrelated keys", () => {
    const yamlPath = path.join(tmpDir, "tied-project/config.yaml");
    fs.writeFileSync(
      yamlPath,
      yaml.dump({ custom: { kept: true }, jev: { plan_skills: false } }),
      "utf8"
    );
    applyClientToolUseBootstrapOptions(
      tmpDir,
      { jev: true, dae: true, bbce: false, fullTools: false, forceToolConfig: true },
      { tiedRepoRoot: TIED_REPO_ROOT, tiedYamlPreExisting: true }
    );
    const doc = yaml.load(fs.readFileSync(yamlPath, "utf8"));
    assert.equal(doc.custom.kept, true);
    assert.equal(doc.jev.plan_skills, true);
    assert.equal(doc.dae.crap_threshold, 30);
  });

  it("copies BBCE starter files additively", () => {
    fs.writeFileSync(path.join(tmpDir, "tied-project/config.yaml"), "scalar_style: unwrapped\n", "utf8");
    const { analysisFilesCopied } = applyClientToolUseBootstrapOptions(
      tmpDir,
      { jev: false, dae: false, bbce: true, fullTools: false, forceToolConfig: false },
      { tiedRepoRoot: TIED_REPO_ROOT, tiedYamlPreExisting: false }
    );
    assert.ok(analysisFilesCopied >= 3);
    const { tiedDir } = resolveTiedLayout(tmpDir);
    assert.ok(fs.existsSync(path.join(tiedDir, "analysis", "slice-map.yaml")));
    assert.ok(fs.existsSync(path.join(tiedDir, "analysis", "README.md")));
  });
});
