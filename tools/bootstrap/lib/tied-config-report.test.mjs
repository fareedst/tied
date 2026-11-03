/**
 * [REQ-TIED_CONFIG_REPORT] SC-CR-*
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import { buildTiedConfigReport, REPORT_SCHEMA, SECRET_ENV_KEYS } from "./tied-config-report.mjs";
import { materializeTiedRuntimeFixtureById } from "./tied-runtime-fixture-loader.mjs";
import {
  OPERATOR_BOOL_MCP_FIELDS,
  OPERATOR_STRING_MCP_FIELDS,
} from "./tied-runtime-config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const storeTemplate = fs.readFileSync(
  path.join(__dirname, "../templates/.tied/store.yaml"),
  "utf8",
);

/**
 * @param {string} storeRoot
 */
function seedStoreYaml(storeRoot) {
  const tiedDir = path.join(storeRoot, ".tied");
  fs.mkdirSync(tiedDir, { recursive: true });
  fs.writeFileSync(path.join(tiedDir, "store.yaml"), storeTemplate);
}

/**
 * @param {unknown} report
 * @param {string} sectionId
 */
function sectionEntries(report, sectionId) {
  const section = report.sections.find((s) => s.id === sectionId);
  assert.ok(section, `missing section ${sectionId}`);
  return section.entries;
}

describe("tied-config-report [REQ-TIED_CONFIG_REPORT]", () => {
  it("monolithic-mcp emits schema and paths (SC-CR-CLI-STORE)", () => {
    const mat = materializeTiedRuntimeFixtureById("monolithic-mcp");
    seedStoreYaml(mat.storeRoot);
    try {
      const report = buildTiedConfigReport({
        cwd: mat.workspaceRoot,
        processEnv: { ...process.env, ...mat.processEnv },
        includeSecrets: false,
      });
      assert.equal(report.schema, REPORT_SCHEMA);
      assert.ok(report.paths.store_root);
      assert.ok(report.paths.mcp_dist_path);
      assert.ok(report.paths.config_sources.length > 0);
      assert.equal(report.layout_mode, "client");
    } finally {
      mat.cleanup();
    }
  });

  it("linked-client includes client_project_path (SC-CR-CLI-CLIENT)", () => {
    const mat = materializeTiedRuntimeFixtureById("linked-client");
    seedStoreYaml(mat.storeRoot);
    try {
      const report = buildTiedConfigReport({
        cwd: mat.workspaceRoot,
        processEnv: { ...process.env, ...mat.processEnv },
      });
      assert.ok(report.paths.client_project_path?.endsWith("tied-project"));
      const toggles = sectionEntries(report, "operator_toggles");
      assert.ok(
        toggles.length >= OPERATOR_BOOL_MCP_FIELDS.length + OPERATOR_STRING_MCP_FIELDS.length,
      );
      const sample = toggles.find((e) => e.key === "TIED_MCP_COLLECT_METRICS");
      assert.ok(sample);
      assert.ok(sample.source_kind);
      assert.ok(sample.source_ref);
      assert.ok(sample.configure_via);
    } finally {
      mat.cleanup();
    }
  });

  it("ignore-shell-path-env lists shell_ignored (SC-CR-IGNORE-SHELL)", () => {
    const mat = materializeTiedRuntimeFixtureById("ignore-shell-path-env");
    seedStoreYaml(mat.storeRoot);
    try {
      const report = buildTiedConfigReport({
        cwd: mat.workspaceRoot,
        processEnv: { ...process.env, ...mat.processEnv },
      });
      assert.ok(report.shell_ignored.length >= 1);
      assert.ok(report.shell_ignored.some((r) => r.key === "TIED_STORE_ROOT"));
    } finally {
      mat.cleanup();
    }
  });

  it("secrets redacted by default and opt-in reveals (SC-CR-SECRETS)", () => {
    const mat = materializeTiedRuntimeFixtureById("monolithic-mcp");
    seedStoreYaml(mat.storeRoot);
    const env = { ...process.env, ...mat.processEnv, JEV_API_KEY: "fixture-secret-value" };
    try {
      const redacted = buildTiedConfigReport({
        cwd: mat.workspaceRoot,
        processEnv: env,
        includeSecrets: false,
      });
      const secret = sectionEntries(redacted, "secrets").find((e) => e.key === "JEV_API_KEY");
      assert.ok(secret);
      assert.equal(secret.effective, null);
      assert.equal(secret.present, true);
      assert.equal(secret.redacted, true);
      assert.ok(!JSON.stringify(redacted).includes("fixture-secret-value"));

      const revealed = buildTiedConfigReport({
        cwd: mat.workspaceRoot,
        processEnv: env,
        includeSecrets: true,
      });
      const secret2 = sectionEntries(revealed, "secrets").find((e) => e.key === "JEV_API_KEY");
      assert.equal(secret2.effective, "fixture-secret-value");
      assert.equal(SECRET_ENV_KEYS.includes("JEV_API_KEY"), true);
    } finally {
      mat.cleanup();
    }
  });

  it("operator disk overlay wins over shell export for collect_metrics", () => {
    const mat = materializeTiedRuntimeFixtureById("linked-client");
    seedStoreYaml(mat.storeRoot);
    const localPath = path.join(mat.storeRoot, ".tied", "operator.local.yaml");
    fs.writeFileSync(
      localPath,
      yaml.dump({ mcp: { collect_metrics: true } }),
    );
    const env = {
      ...process.env,
      ...mat.processEnv,
      TIED_MCP_COLLECT_METRICS: "0",
    };
    try {
      const report = buildTiedConfigReport({ cwd: mat.workspaceRoot, processEnv: env });
      const entry = sectionEntries(report, "operator_toggles").find(
        (e) => e.key === "TIED_MCP_COLLECT_METRICS",
      );
      assert.equal(entry.effective, "1");
      assert.equal(entry.source_kind, "store_yaml");
    } finally {
      mat.cleanup();
    }
  });
});
