/**
 * [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
 * How: Assert RUN_NEW_TIED_CLIENT_PIPELINE order, unix-seconds disposable paths, and lint integration.
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert";
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

function runBootstrapModuleEval(scriptBody: string): string {
  return execFileSync(process.execPath, ["--input-type=module", "-e", scriptBody], {
    cwd: repoRoot,
    encoding: "utf8",
  });
}

describe("new-tied-client pipeline", () => {
  it("uses unix seconds not milliseconds for disposable timestamp [REQ-TIED_SETUP] [IMPL-TIED_FILES]", () => {
    const output = runBootstrapModuleEval(`
      import {
        createDisposableClientDir,
        unixSecondsTimestamp,
      } from "./tools/bootstrap/lib/new-tied-client-pipeline.mjs";
      const fixedMs = 1700000000123;
      const ts = unixSecondsTimestamp(fixedMs);
      if (ts !== "1700000000") throw new Error("bad timestamp: " + ts);
      if (!/^\\d{10}$/.test(ts)) throw new Error("expected 10 digits");
      const { clientDir, timestamp } = createDisposableClientDir("/tmp/test-root", fixedMs);
      if (timestamp !== "1700000000") throw new Error("bad dir timestamp");
      if (!clientDir.endsWith("1700000000")) throw new Error("bad clientDir: " + clientDir);
      console.log("ok");
    `);
    assert.match(output, /ok/);
  });

  it("parseBootstrapToolFlags and parseNewTiedClientArgs handle full-tools [REQ-TIED_SETUP] [IMPL-TIED_FILES]", () => {
    const output = runBootstrapModuleEval(`
      import { parseBootstrapToolFlags } from "./tools/bootstrap/lib/client-tool-use-bootstrap.mjs";
      import { parseNewTiedClientArgs } from "./tools/bootstrap/new-tied-client.mjs";
      const { profile } = parseBootstrapToolFlags(["--full-tools"], { TIED_BOOTSTRAP_WITH_JEV: "1" });
      if (!profile.jev || !profile.dae || !profile.bbce) throw new Error("full-tools profile");
      const parsed = parseNewTiedClientArgs(["--with-jev", "--disposable", "--skip-git"], {});
      if (!parsed.toolUseProfile.jev) throw new Error("jev flag");
      if (!parsed.disposable) throw new Error("disposable");
      console.log("ok");
    `);
    assert.match(output, /ok/);
  });

  it("forwards full-tools to copy_files spawn args [IMPL-TIED_FILES]", () => {
    const output = runBootstrapModuleEval(`
      import { runNewTiedClientPipeline } from "./tools/bootstrap/lib/new-tied-client-pipeline.mjs";
      import path from "node:path";
      import os from "node:os";
      const calls = [];
      const mockSpawn = (cmd, args, options) => {
        calls.push({ cmd, args: [...args], cwd: options.cwd });
        return { status: 0 };
      };
      const clientDir = path.join(os.tmpdir(), "tied-full-tools-forward");
      const sourceRoot = ${JSON.stringify(repoRoot)};
      const result = runNewTiedClientPipeline({
        clientDir,
        sourceRoot,
        skipMcpEnable: true,
        skipGit: true,
        skipLint: true,
        skipOnboardingAudit: true,
        toolUseProfile: { fullTools: true, jev: true, dae: true, bbce: true, forceToolConfig: false },
        spawn: mockSpawn,
      });
      if (!result.ok) throw new Error("pipeline failed");
      if (!calls[0].args.includes("--full-tools")) throw new Error("missing --full-tools: " + JSON.stringify(calls[0].args));
      console.log("ok");
    `);
    assert.match(output, /ok/);
  });

  it("parseNewTiedClientArgs handles disposable and skip flags [IMPL-TIED_FILES]", () => {
    const output = runBootstrapModuleEval(`
      import { parseNewTiedClientArgs } from "./tools/bootstrap/new-tied-client.mjs";
      import path from "node:path";
      const parsed = parseNewTiedClientArgs([
        "--disposable",
        "--skip-lint",
        "--skip-git",
        "--source-root",
        "C:\\\\tied",
      ]);
      if (!parsed.disposable || !parsed.skipLint || !parsed.skipGit) throw new Error("flags missing");
      if (parsed.sourceRoot !== path.resolve("C:\\\\tied")) throw new Error("source root mismatch");
      console.log("ok");
    `);
    assert.match(output, /ok/);
  });

  it("parseNewTiedClientArgs maps claude harness flags [REQ-TIED_CLAUDE_BOOTSTRAP_OPS] [IMPL-TIED_CLAUDE_BOOTSTRAP_OPS]", () => {
    const output = runBootstrapModuleEval(`
      import { parseNewTiedClientArgs } from "./tools/bootstrap/new-tied-client.mjs";
      const parsed = parseNewTiedClientArgs([
        "--claude-first",
        "--skip-claude-validation",
        "--no-agentstream-dry-run",
      ]);
      if (parsed.harnessProfile !== "claude") throw new Error("harness");
      if (!parsed.skipClaudeValidation) throw new Error("skip validation");
      if (parsed.withAgentstreamDryRun !== false) throw new Error("dry run");
      console.log("ok");
    `);
    assert.match(output, /ok/);
  });

  it("resolveCursorAgentCli prefers agent when on PATH and honors TIED_CURSOR_AGENT_CMD and CURSOR_CLI_NAME [IMPL-TIED_FILES] [REQ-TIED_SETUP]", () => {
    const output = runBootstrapModuleEval(`
      import { resolveCursorAgentCli } from "./tools/bootstrap/lib/new-tied-client-pipeline.mjs";
      const bothOnPath = (cmd, args) => {
        if (cmd === "where" || cmd === "where.exe" || cmd === "which") {
          const target = args[0];
          if (target === "agent" || target === "cursor") return { status: 0 };
          return { status: 1 };
        }
        return { status: 0 };
      };
      const resolvedDefault = resolveCursorAgentCli({}, bothOnPath);
      if (resolvedDefault !== "agent") throw new Error("expected agent default, got " + resolvedDefault);
      const resolvedCursorPref = resolveCursorAgentCli({ CURSOR_CLI_NAME: "cursor" }, bothOnPath);
      if (resolvedCursorPref !== "cursor") throw new Error("expected cursor pref, got " + resolvedCursorPref);
      const onlyCursor = (cmd, args) => {
        if (cmd === "where" || cmd === "where.exe" || cmd === "which") {
          const target = args[0];
          if (target === "cursor") return { status: 0 };
          return { status: 1 };
        }
        return { status: 0 };
      };
      const resolvedOnlyCursor = resolveCursorAgentCli({}, onlyCursor);
      if (resolvedOnlyCursor !== "cursor") throw new Error("expected cursor only, got " + resolvedOnlyCursor);
      const noneOnPath = (cmd, args) => {
        if (cmd === "where" || cmd === "where.exe" || cmd === "which") return { status: 1 };
        return { status: 0 };
      };
      const resolvedFallback = resolveCursorAgentCli({}, noneOnPath);
      if (resolvedFallback !== "agent") throw new Error("expected agent fallback, got " + resolvedFallback);
      const overridden = resolveCursorAgentCli({ TIED_CURSOR_AGENT_CMD: "my-agent" }, bothOnPath);
      if (overridden !== "my-agent") throw new Error("expected override");
      console.log("ok");
    `);
    assert.match(output, /ok/);
  });

  it("mcp enable step uses resolved Cursor agent CLI [IMPL-TIED_FILES]", () => {
    const output = runBootstrapModuleEval(`
      import { runNewTiedClientPipeline } from "./tools/bootstrap/lib/new-tied-client-pipeline.mjs";
      import path from "node:path";
      import os from "node:os";
      const calls = [];
      const mockSpawn = (cmd, args, options) => {
        calls.push({ cmd, args: [...args], cwd: options.cwd });
        return { status: 0 };
      };
      const clientDir = path.join(os.tmpdir(), "tied-mcp-cli-test");
      const sourceRoot = ${JSON.stringify(repoRoot)};
      const result = runNewTiedClientPipeline({
        clientDir,
        sourceRoot,
        skipLint: true,
        skipOnboardingAudit: true,
        skipGit: true,
        cursorAgentCli: "cursor",
        stdinIsTTY: true,
        forceMcpEnable: true,
        spawn: mockSpawn,
      });
      if (!result.ok) throw new Error("pipeline failed");
      const mcpCall = calls.find((c) => {
        const joined = [c.cmd, ...c.args].join(" ");
        return joined.includes("cursor") && joined.includes("mcp") && joined.includes("enable");
      });
      if (!mcpCall) throw new Error("missing mcp enable call: " + JSON.stringify(calls));
      if (mcpCall.cwd !== clientDir) throw new Error("cwd mismatch");
      console.log("ok");
    `);
    assert.match(output, /ok/);
  });

  it("claude harness skips mcp enable and invokes validation after audit [REQ-TIED_CLAUDE_BOOTSTRAP_OPS] [IMPL-TIED_CLAUDE_BOOTSTRAP_OPS]", () => {
    const output = runBootstrapModuleEval(`
      import { runNewTiedClientPipeline } from "./tools/bootstrap/lib/new-tied-client-pipeline.mjs";
      import path from "node:path";
      import os from "node:os";
      const calls = [];
      let validationInvoked = false;
      const mockSpawn = (cmd, args, options) => {
        calls.push({ cmd, args: [...args], cwd: options.cwd });
        return { status: 0 };
      };
      const clientDir = path.join(os.tmpdir(), "tied-claude-pipeline-order");
      const sourceRoot = ${JSON.stringify(repoRoot)};
      const result = runNewTiedClientPipeline({
        clientDir,
        sourceRoot,
        harnessProfile: "claude",
        skipGit: true,
        skipLint: true,
        skipOnboardingAudit: true,
        claudeValidation: { withAgentstreamDryRun: false },
        runClaudeClientValidationFn: () => {
          validationInvoked = true;
          return { ok: true, checks: [], reportPath: path.join(clientDir, "working", "tied-claude-client-validation.v1.json") };
        },
        spawn: mockSpawn,
      });
      if (!result.ok) throw new Error("pipeline failed: " + JSON.stringify(result));
      if (!validationInvoked) throw new Error("expected claude validation hook");
      const mcpCall = calls.find((c) => {
        const joined = [c.cmd, ...c.args].join(" ");
        return joined.includes("mcp") && joined.includes("enable");
      });
      if (mcpCall) throw new Error("mcp enable must be skipped for claude harness");
      console.log("ok");
    `);
    assert.match(output, /ok/);
  });

  it("records pipeline step order via injectable spawn [IMPL-TIED_FILES]", () => {
    const output = runBootstrapModuleEval(`
      import { runNewTiedClientPipeline } from "./tools/bootstrap/lib/new-tied-client-pipeline.mjs";
      import path from "node:path";
      import os from "node:os";
      const calls = [];
      const mockSpawn = (cmd, args, options) => {
        calls.push({ cmd, args: [...args], cwd: options.cwd });
        return { status: 0 };
      };
      const clientDir = path.join(os.tmpdir(), "tied-pipeline-order-test");
      const sourceRoot = ${JSON.stringify(repoRoot)};
      const result = runNewTiedClientPipeline({
        clientDir,
        sourceRoot,
        skipMcpEnable: true,
        skipGit: true,
        skipLint: true,
        skipOnboardingAudit: true,
        spawn: mockSpawn,
      });
      if (!result.ok) throw new Error("pipeline failed");
      if (calls.length < 1) throw new Error("no spawn calls");
      const copyCall = calls[0];
      if (!copyCall.cmd.endsWith("copy_files.cmd") && !copyCall.cmd.endsWith("copy_files.sh")) {
        throw new Error("expected copy_files entry, got " + copyCall.cmd);
      }
      if (copyCall.cwd !== clientDir) throw new Error("copy_files cwd mismatch");
      console.log("ok");
    `);
    assert.match(output, /ok/);
  });
});

describe("new-tied-client integration", () => {
  let tempDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-new-client-e2e-"));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it("bootstraps client with lint when MCP and git skipped [REQ-TIED_SETUP] [IMPL-TIED_FILES]", () => {
    const canonicalizer = path.join(repoRoot, "mcp-server", "dist", "cli", "yaml-canonicalizer.js");
    assert.ok(fs.existsSync(canonicalizer), "yaml-canonicalizer must be built for lint step");

    const clientDir = path.join(tempDir, "explicit-client");
    const output = runBootstrapModuleEval(`
      import { runNewTiedClientPipeline } from "./tools/bootstrap/lib/new-tied-client-pipeline.mjs";
      import { collectYamlFiles } from "./tools/bootstrap/lib/lint-client-yaml.mjs";
      import fs from "node:fs";
      import path from "node:path";
      import { spawnSync } from "node:child_process";
      const clientDir = ${JSON.stringify(clientDir)};
      const sourceRoot = ${JSON.stringify(repoRoot)};
      const result = runNewTiedClientPipeline({
        clientDir,
        sourceRoot,
        skipMcpEnable: true,
        skipGit: true,
        spawn: spawnSync,
      });
      if (!result.ok) {
        console.error("pipeline failed at", result.step);
        process.exit(result.code ?? 1);
      }
      if (!fs.existsSync(path.join(clientDir, "tied", "requirements.yaml"))) {
        throw new Error("requirements.yaml missing");
      }
      const sarDoc = path.join(clientDir, "tied", "docs", "sponsor-agent-relationship.md");
      const sarVocab = path.join(
        clientDir,
        "tied",
        "methodology",
        "vocab",
        "sponsor-agent-relationship.md",
      );
      if (!fs.existsSync(sarDoc)) throw new Error("missing tied/docs/sponsor-agent-relationship.md");
      if (!fs.existsSync(sarVocab)) {
        throw new Error("missing tied/methodology/vocab/sponsor-agent-relationship.md");
      }
      const yamlFiles = collectYamlFiles(clientDir);
      if (yamlFiles.length === 0) throw new Error("expected tied yaml files");
      const auditReport = path.join(clientDir, "working", "tied-new-client-audit.v1.json");
      if (!fs.existsSync(auditReport)) throw new Error("missing onboarding audit report");
      const audit = JSON.parse(fs.readFileSync(auditReport, "utf8"));
      if (audit.ok !== true || audit.schema_version !== "tied-new-client-audit.v1") {
        throw new Error("onboarding audit not ok: " + JSON.stringify(audit));
      }
      console.log("ok");
    `);
    assert.match(output, /ok/);
  });

  it("runs disposable CLI with skip flags [IMPL-TIED_FILES]", () => {
    const testRoot = path.join(tempDir, "disposable-root");
    fs.mkdirSync(testRoot, { recursive: true });

    const cli = path.join(repoRoot, "tools", "bootstrap", "new-tied-client.mjs");
    const output = spawnSync(
      process.execPath,
      [cli, "--disposable", "--test-root", testRoot, "--skip-mcp-enable", "--skip-git"],
      {
        cwd: repoRoot,
        encoding: "utf8",
        env: { ...process.env, TIED_SOURCE_ROOT: repoRoot },
      }
    );

    assert.strictEqual(output.status, 0, output.stderr || output.stdout);
    assert.match(output.stdout, /Disposable TIED client:/);
    const entries = fs.readdirSync(testRoot);
    assert.strictEqual(entries.length, 1);
    assert.match(entries[0], /^\d{10}$/, `expected unix-seconds dir, got ${entries[0]}`);
    const clientPath = path.join(testRoot, entries[0]);
    assert.ok(fs.existsSync(path.join(clientPath, "tied", "requirements.yaml")));
    const auditReport = path.join(clientPath, "working", "tied-new-client-audit.v1.json");
    assert.ok(fs.existsSync(auditReport), "expected tied-new-client-audit.v1.json after disposable bootstrap");
  });

  it("disposable --full-tools seeds jev, dae, and BBCE starters [REQ-TIED_SETUP] [IMPL-TIED_FILES]", () => {
    const testRoot = path.join(tempDir, "full-tools-root");
    fs.mkdirSync(testRoot, { recursive: true });

    const cli = path.join(repoRoot, "tools", "bootstrap", "new-tied-client.mjs");
    const output = spawnSync(
      process.execPath,
      [
        cli,
        "--disposable",
        "--full-tools",
        "--test-root",
        testRoot,
        "--skip-mcp-enable",
        "--skip-git",
        "--skip-onboarding-audit",
      ],
      {
        cwd: repoRoot,
        encoding: "utf8",
        env: { ...process.env, TIED_SOURCE_ROOT: repoRoot },
      }
    );

    assert.strictEqual(output.status, 0, output.stderr || output.stdout);
    const entries = fs.readdirSync(testRoot);
    const clientPath = path.join(testRoot, entries[0]);
    const yamlText = fs.readFileSync(path.join(clientPath, ".tied-yaml.yaml"), "utf8");
    assert.match(yamlText, /plan_skills:\s*true/);
    assert.match(yamlText, /crap_threshold:\s*30/);
    assert.doesNotMatch(yamlText, /agentstream_gate_check/);
    assert.ok(fs.existsSync(path.join(clientPath, "tied", "analysis", "slice-map.yaml")));
  });

  it("disposable bootstrap sets MCP metrics client to timestamp dir not inherited shell label [REQ-TIED_SETUP] [REQ-MCP_USAGE_METRICS] [IMPL-TIED_FILES]", () => {
    const testRoot = path.join(tempDir, "metrics-client-root");
    fs.mkdirSync(testRoot, { recursive: true });

    const cli = path.join(repoRoot, "tools", "bootstrap", "new-tied-client.mjs");
    const output = spawnSync(
      process.execPath,
      [
        cli,
        "--disposable",
        "--test-root",
        testRoot,
        "--skip-mcp-enable",
        "--skip-git",
        "--skip-onboarding-audit",
        "--skip-lint",
      ],
      {
        cwd: repoRoot,
        encoding: "utf8",
        env: {
          ...process.env,
          TIED_SOURCE_ROOT: repoRoot,
          TIED_MCP_COLLECT_METRICS: "1",
          TIED_MCP_METRICS_CLIENT: "stdd-dev",
        },
      },
    );

    assert.strictEqual(output.status, 0, output.stderr || output.stdout);
    const entries = fs.readdirSync(testRoot);
    assert.match(entries[0], /^\d{10}$/);
    const clientId = entries[0];
    const clientPath = path.join(testRoot, clientId);
    const cursorMcp = JSON.parse(
      fs.readFileSync(path.join(clientPath, ".cursor", "mcp.json"), "utf8"),
    ) as { mcpServers: { "tied-yaml": { env: Record<string, string> } } };
    const claudeMcp = JSON.parse(fs.readFileSync(path.join(clientPath, ".mcp.json"), "utf8")) as {
      mcpServers: { "tied-yaml": { env: Record<string, string> } };
    };
    assert.strictEqual(cursorMcp.mcpServers["tied-yaml"].env.TIED_MCP_METRICS_CLIENT, clientId);
    assert.strictEqual(claudeMcp.mcpServers["tied-yaml"].env.TIED_MCP_METRICS_CLIENT, clientId);
  });
});
