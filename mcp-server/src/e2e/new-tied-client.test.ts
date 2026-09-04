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

  it("resolveCursorAgentCli prefers cursor when on PATH and honors TIED_CURSOR_AGENT_CMD [IMPL-TIED_FILES]", () => {
    const output = runBootstrapModuleEval(`
      import { resolveCursorAgentCli } from "./tools/bootstrap/lib/new-tied-client-pipeline.mjs";
      const mockSpawn = (cmd, args) => {
        if (cmd === "where" || cmd === "where.exe" || cmd === "which") {
          const target = args[0];
          if (target === "cursor") return { status: 0 };
          return { status: 1 };
        }
        return { status: 0 };
      };
      const resolved = resolveCursorAgentCli({}, mockSpawn);
      if (resolved !== "cursor") throw new Error("expected cursor, got " + resolved);
      const overridden = resolveCursorAgentCli({ TIED_CURSOR_AGENT_CMD: "my-agent" }, mockSpawn);
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
      const yamlFiles = collectYamlFiles(clientDir);
      if (yamlFiles.length === 0) throw new Error("expected tied yaml files");
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
    assert.ok(fs.existsSync(path.join(testRoot, entries[0], "tied", "requirements.yaml")));
  });
});
