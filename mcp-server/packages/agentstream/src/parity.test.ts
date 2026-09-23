import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  checklistTestdataDirFromModule,
  oracleFixturesDirFromModule,
  repoRootFromModule,
} from "./paths.js";
import {
  normalizeDryRunOutput,
  readOracleFixture,
} from "./fixture-oracle.js";
import { Status, analyze } from "./tiedpreflight.js";

// [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
describe("@tied/agentstream frozen oracle parity [REQ-TIED_UNIFIED_TOOLCHAIN]", () => {
  const repoRoot = repoRootFromModule(import.meta.url);
  const testdata = checklistTestdataDirFromModule(import.meta.url);
  const oracleDir = oracleFixturesDirFromModule(import.meta.url);

  it("oracle freeze records last Go commit (RISK-UNIFIED-007)", () => {
    const commitPath = path.join(oracleDir, "go-oracle-commit.txt");
    assert.ok(fs.existsSync(commitPath), commitPath);
    const commit = fs.readFileSync(commitPath, "utf8").trim();
    assert.match(commit, /^[0-9a-f]{7,40}$/);
  });

  it("checklist testdata gate-writer-minimal-tracker references gate fixture", () => {
    const trackerPath = path.join(testdata, "gate-writer-minimal-tracker.yaml");
    assert.ok(fs.existsSync(trackerPath), trackerPath);
    const text = fs.readFileSync(trackerPath, "utf8");
    assert.match(
      text,
      /gate-fixture-checklist\.yaml/,
      "golden tracker must reference gate-fixture checklist",
    );
  });

  it("TS preview-checklist-tracker JSON matches frozen oracle", () => {
    const def = path.join(testdata, "gate-fixture-checklist.yaml");
    const track = path.join(testdata, "gate-writer-minimal-tracker.yaml");
    const entry = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "index.js",
    );
    assert.ok(fs.existsSync(entry));
    const tsOut = execFileSync(
      process.execPath,
      [entry, "-c", def, "--checklist-tracker-preview", track],
      { encoding: "utf8", cwd: repoRoot },
    );
    const oracle = readOracleFixture(import.meta.url, "tracker-preview-gate-writer.json");
    assert.equal(tsOut, oracle);
  });

  function dryRunViaTsEntry(extraArgs: string[] = []): string {
    const ws = fs.mkdtempSync(path.join(os.tmpdir(), "as-dry-ts-"));
    const checklist = path.join(testdata, "gate-fixture-checklist.yaml");
    const entry = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "index.js",
    );
    assert.ok(fs.existsSync(entry));
    return execFileSync(
      process.execPath,
      [
        entry,
        "-d",
        "-w",
        ws,
        "-c",
        checklist,
        "--lead-checklist-skip-sub",
        "--skip-tied-mcp-preflight",
        ...extraArgs,
      ],
      { encoding: "utf8", cwd: repoRoot },
    );
  }

  function dryRunViaTiedCli(extraArgs: string[] = []): string {
    const ws = fs.mkdtempSync(path.join(os.tmpdir(), "as-dry-t-"));
    const checklist = path.join(testdata, "gate-fixture-checklist.yaml");
    const cliEntry = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "../../cli/dist/index.js",
    );
    assert.ok(fs.existsSync(cliEntry));
    return execFileSync(
      process.execPath,
      [
        cliEntry,
        "agentstream",
        "-d",
        "-w",
        ws,
        "-c",
        checklist,
        "--lead-checklist-skip-sub",
        "--skip-tied-mcp-preflight",
        ...extraArgs,
      ],
      {
        encoding: "utf8",
        cwd: repoRoot,
        env: { ...process.env, TIED_AGENTSTREAM_IMPL: "ts" },
      },
    );
  }

  it("executor dry-run: TS entry matches frozen oracle for gate fixture", () => {
    const oracle = normalizeDryRunOutput(
      readOracleFixture(import.meta.url, "dry-run-gate-fixture.txt"),
    );
    const tsOut = normalizeDryRunOutput(dryRunViaTsEntry());
    assert.equal(tsOut, oracle);
  });

  it("executor dry-run: tied agentstream TIED_AGENTSTREAM_IMPL=ts matches frozen oracle", () => {
    const oracle = normalizeDryRunOutput(
      readOracleFixture(import.meta.url, "dry-run-gate-fixture.txt"),
    );
    const tiedOut = normalizeDryRunOutput(dryRunViaTiedCli());
    assert.doesNotMatch(tiedOut, /forwarding to Go agentstream/);
    assert.equal(tiedOut, oracle);
  });

  it("executor dry-run: --verify-session matches frozen oracle", () => {
    const oracle = normalizeDryRunOutput(
      readOracleFixture(import.meta.url, "dry-run-verify-session.txt"),
    );
    const tsOut = normalizeDryRunOutput(dryRunViaTsEntry(["--verify-session"]));
    assert.equal(tsOut, oracle);
    assert.match(tsOut, /what was the most recent prompt/);
  });

  it("pipeline batch dry-run: TS matches frozen oracle", () => {
    const ws = fs.mkdtempSync(path.join(os.tmpdir(), "as-batch-"));
    const checklist = path.join(testdata, "gate-fixture-checklist.yaml");
    const batch = path.join(ws, "batch.yaml");
    const preload = path.join(ws, "preload.txt");
    fs.writeFileSync(
      batch,
      `- order: 1
  feature_name: feat
  goal: batch goal line
  behavior: |
    PIPELINE_BATCH_TS_MARKER
`,
    );
    fs.writeFileSync(preload, "PRELOAD_BODY\n");
    const baseArgs = [
      "-d",
      "-w",
      ws,
      "-c",
      checklist,
      "--lead-checklist-skip-sub",
      "--skip-tied-mcp-preflight",
      "-p",
      preload,
      "-b",
      batch,
    ];
    const oracle = normalizeDryRunOutput(
      readOracleFixture(import.meta.url, "pipeline-batch-dry-run.txt"),
    );
    const entry = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "index.js",
    );
    const tsOut = normalizeDryRunOutput(
      execFileSync(process.execPath, [entry, ...baseArgs], {
        encoding: "utf8",
        cwd: repoRoot,
      }),
    );
    assert.equal(tsOut, oracle);
    assert.match(tsOut, /PIPELINE_BATCH_TS_MARKER/);
  });

  it("checklist render preview: TS matches frozen oracle (gate fixture)", () => {
    const checklist = path.join(testdata, "gate-fixture-checklist.yaml");
    const entry = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "index.js",
    );
    const tsOut = execFileSync(
      process.execPath,
      [entry, "-c", checklist, "--preview-lead-checklist", "--lead-checklist-skip-sub"],
      { encoding: "utf8", cwd: repoRoot },
    );
    const oracle = readOracleFixture(import.meta.url, "checklist-preview-gate-fixture.txt");
    assert.equal(tsOut, oracle);
    assert.match(tsOut, /=== prompt 1\//);
    assert.match(tsOut, /## Step session-bootstrap:/);
  });

  it("preview feature-spec batch: TS matches frozen oracle", () => {
    const batch = path.join(oracleDir, "feature-batch.yaml");
    assert.ok(fs.existsSync(batch));
    const args = ["--preview-feature-spec-batch-yaml", batch];
    const entry = path.join(
      path.dirname(fileURLToPath(import.meta.url)),
      "index.js",
    );
    const tsOut = execFileSync(process.execPath, [entry, ...args], {
      encoding: "utf8",
      cwd: repoRoot,
    });
    const oracle = readOracleFixture(import.meta.url, "feature-spec-batch-preview.txt");
    assert.equal(tsOut, oracle);
  });

  it("tiedpreflight TS analyze returns OK for valid mcp.json layout", () => {
    const w = fs.mkdtempSync(path.join(os.tmpdir(), "tpf-par-"));
    const tied = path.join(w, "tied");
    fs.mkdirSync(tied, { recursive: true });
    fs.writeFileSync(path.join(tied, "requirements.yaml"), "requirements: {}\n");
    const cursorDir = path.join(w, ".cursor");
    fs.mkdirSync(cursorDir, { recursive: true });
    const mcp = path.join(cursorDir, "mcp.json");
    fs.writeFileSync(
      mcp,
      JSON.stringify({
        mcpServers: {
          "tied-yaml": {
            command: "node",
            args: ["/srv/index.js"],
            env: { TIED_BASE_PATH: tied },
          },
        },
      }),
    );

    const tsRes = analyze(w, mcp);
    assert.equal(tsRes.status, Status.OK);
  });
});
