/**
 * [IMPL-TIED_CLAUDE_BOOTSTRAP_OPS] [REQ-TIED_CLAUDE_BOOTSTRAP_OPS] [REQ-TIED_CLAUDE_HARNESS]
 * How: unit tests for RUN_CLAUDE_CLIENT_VALIDATION report shape and fail-fast ordering.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import {
  SCHEMA_VERSION,
  CHECK_ORDER,
  buildClaudeClientValidationReport,
  assertMcpJsonHarnessContract,
  runClaudeClientValidation,
  runClaudeCodeInteractiveSmoke,
  resolveClientTiedCliPath,
} from "./claude-client-validation.mjs";
import { TIED_REPO_ROOT } from "./constants.mjs";
import { initializeClaudeMcpConfig } from "./mcp-config.mjs";
import { installClaudeSkills } from "./skills.mjs";
import { manifestPaths } from "./constants.mjs";
import { assertMcpPrerequisite } from "./mcp-config.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function tempClient() {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "tied-claude-validation-"));
  fs.mkdirSync(path.join(root, "tied"), { recursive: true });
  return root;
}

function bootstrapMinimalClaudeClient(clientRoot) {
  assertMcpPrerequisite(TIED_REPO_ROOT);
  const paths = manifestPaths();
  paths.tiedRepoRoot = TIED_REPO_ROOT;
  installClaudeSkills(clientRoot, paths, {});
  initializeClaudeMcpConfig(clientRoot, TIED_REPO_ROOT, { harnessLabel: "claude" });
}

describe("buildClaudeClientValidationReport [REQ-TIED_CLAUDE_BOOTSTRAP_OPS]", () => {
  it("uses tied-claude-client-validation.v1 schema_version", () => {
    const report = buildClaudeClientValidationReport({
      clientRoot: "/tmp/client",
      ok: true,
      checks: [{ id: "mcp_dist_prerequisite", status: "pass", detail: null, duration_ms: 1 }],
      withAgentstreamDryRun: true,
    });
    assert.equal(report.schema_version, SCHEMA_VERSION);
    assert.equal(report.harness_profile, "claude");
    assert.equal(report.with_agentstream_dry_run, true);
    assert.equal(report.with_consistency, false);
  });
});

describe("assertMcpJsonHarnessContract [REQ-TIED_CLAUDE_BOOTSTRAP_OPS]", () => {
  it("passes when harness and TIED_BASE_PATH match client tied/", () => {
    const clientRoot = tempClient();
    bootstrapMinimalClaudeClient(clientRoot);
    const result = assertMcpJsonHarnessContract(clientRoot);
    assert.equal(result.ok, true);
  });

  it("fails when TIED_MCP_HARNESS is not claude", () => {
    const clientRoot = tempClient();
    bootstrapMinimalClaudeClient(clientRoot);
    const mcpPath = path.join(clientRoot, ".mcp.json");
    const cfg = JSON.parse(fs.readFileSync(mcpPath, "utf8"));
    cfg.mcpServers["tied-yaml"].env.TIED_MCP_HARNESS = "cursor";
    fs.writeFileSync(mcpPath, `${JSON.stringify(cfg, null, 2)}\n`, "utf8");
    const result = assertMcpJsonHarnessContract(clientRoot);
    assert.equal(result.ok, false);
  });
});

describe("runClaudeCodeInteractiveSmoke [REQ-TIED_CLAUDE_BOOTSTRAP_OPS]", () => {
  it("skips when claude CLI is not on PATH", () => {
    const clientRoot = tempClient();
    bootstrapMinimalClaudeClient(clientRoot);
    const mockSpawn = (cmd) => {
      if (cmd === "which") {
        return { status: 1, stdout: "", stderr: "" };
      }
      throw new Error(`unexpected spawn: ${cmd}`);
    };
    const result = runClaudeCodeInteractiveSmoke(clientRoot, mockSpawn);
    assert.equal(result.ok, true);
    assert.equal(result.skipped, true);
  });

  it("passes when claude returns expected base_path", () => {
    const clientRoot = tempClient();
    bootstrapMinimalClaudeClient(clientRoot);
    const expected = path.join(clientRoot, "tied");
    const mockSpawn = (cmd, args) => {
      if (cmd === "which") {
        return { status: 0, stdout: "/usr/bin/claude\n", stderr: "" };
      }
      if (cmd === "claude") {
        assert.ok(args.includes("--strict-mcp-config"));
        return { status: 0, stdout: `${expected}\n`, stderr: "" };
      }
      throw new Error(`unexpected spawn: ${cmd}`);
    };
    const result = runClaudeCodeInteractiveSmoke(clientRoot, mockSpawn);
    assert.equal(result.ok, true);
    assert.notEqual(result.skipped, true);
  });
});

describe("runClaudeClientValidation fail-fast [REQ-TIED_CLAUDE_BOOTSTRAP_OPS]", () => {
  it("stops after mcp_json failure without tied-cli smoke", () => {
    const clientRoot = tempClient();
    bootstrapMinimalClaudeClient(clientRoot);
    const mcpPath = path.join(clientRoot, ".mcp.json");
    const cfg = JSON.parse(fs.readFileSync(mcpPath, "utf8"));
    cfg.mcpServers["tied-yaml"].env.TIED_MCP_HARNESS = "cursor";
    fs.writeFileSync(mcpPath, `${JSON.stringify(cfg, null, 2)}\n`, "utf8");

    const spawnCalls = [];
    const mockSpawn = (cmd, args, opts) => {
      spawnCalls.push({ cmd, args });
      return { status: 0, stdout: "{}", stderr: "" };
    };

    const result = runClaudeClientValidation(clientRoot, TIED_REPO_ROOT, {
      withAgentstreamDryRun: false,
      spawn: mockSpawn,
    });
    assert.equal(result.ok, false);
    const ids = result.checks.map((c) => c.id);
    assert.deepEqual(ids, ["mcp_dist_prerequisite", "claude_bootstrap_asserts", "mcp_json_harness_contract"]);
    assert.equal(spawnCalls.length, 0);
  });

  it("honors reroot tied-cli path when skills reroot enabled", () => {
    const clientRoot = tempClient();
    const rerootSkills = path.join(clientRoot, "skills");
    fs.mkdirSync(path.join(rerootSkills, "tied-yaml", "scripts"), { recursive: true });
    fs.writeFileSync(path.join(rerootSkills, "tied-yaml", "scripts", "tied-cli.sh"), "#!/bin/bash\n");
    const resolved = resolveClientTiedCliPath(clientRoot, true);
    assert.ok(resolved.includes(`${path.sep}skills${path.sep}tied-yaml`));
  });

  it("records check order constants aligned with implementation", () => {
    assert.deepEqual(CHECK_ORDER[0], "mcp_dist_prerequisite");
    assert.ok(CHECK_ORDER.includes("agentstream_dry_run"));
  });
});
