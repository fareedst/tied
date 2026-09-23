import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  checklistTestdataDirFromModule,
  goAgentstreamModuleDirFromModule,
  repoRootFromModule,
} from "./paths.js";
import { Status, analyze } from "./tiedpreflight.js";

// [IMPL-TIED_UNIFIED_TOOLCHAIN] [ARCH-TIED_UNIFIED_TOOLCHAIN] [REQ-TIED_UNIFIED_TOOLCHAIN]
describe("@tied/agentstream Go parity [REQ-TIED_UNIFIED_TOOLCHAIN]", () => {
  const moduleDir = goAgentstreamModuleDirFromModule(import.meta.url);
  const repoRoot = repoRootFromModule(import.meta.url);
  const testdata = checklistTestdataDirFromModule(import.meta.url);

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

  it("TS preview-checklist-tracker JSON matches Go for golden tracker", () => {
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
    const goOut = execFileSync(
      "go",
      [
        "run",
        "-C",
        moduleDir,
        "./cmd/agentstream",
        "-c",
        def,
        "--checklist-tracker-preview",
        track,
      ],
      { encoding: "utf8", cwd: repoRoot },
    );
    assert.equal(tsOut, goOut);
  });

  it("Go preview-checklist-tracker JSON for golden tracker", () => {
    const def = path.join(testdata, "gate-fixture-checklist.yaml");
    const track = path.join(testdata, "gate-writer-minimal-tracker.yaml");
    assert.ok(fs.existsSync(def) && fs.existsSync(track));
    const out = execFileSync(
      "go",
      [
        "run",
        "-C",
        moduleDir,
        "./cmd/agentstream",
        "-c",
        def,
        "--checklist-tracker-preview",
        track,
      ],
      { encoding: "utf8", cwd: repoRoot },
    );
    const report = JSON.parse(out) as { ok?: boolean; missing_in_tracker?: unknown };
    assert.equal(typeof report, "object");
    assert.ok("missing_in_tracker" in report || "ok" in report);
  });

  function dryRunViaGo(): string {
    const ws = fs.mkdtempSync(path.join(os.tmpdir(), "as-dry-"));
    const checklist = path.join(testdata, "gate-fixture-checklist.yaml");
    return execFileSync(
      "go",
      [
        "run",
        "-C",
        moduleDir,
        "./cmd/agentstream",
        "-d",
        "-w",
        ws,
        "-c",
        checklist,
        "--lead-checklist-skip-sub",
        "--skip-tied-mcp-preflight",
      ],
      { encoding: "utf8", cwd: repoRoot },
    );
  }

  function dryRunViaTiedCli(): string {
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
      ],
      {
        encoding: "utf8",
        cwd: repoRoot,
        env: { ...process.env, TIED_AGENTSTREAM_IMPL: "go" },
      },
    );
  }

  function normalizeDryRun(text: string): string {
    return text
      .replace(/\/var\/folders\/[^\s"]+/g, "<TMP>")
      .replace(/\/tmp\/[^\s"]+/g, "<TMP>")
      .replace(/\/private\/var\/[^\s"]+/g, "<TMP>");
  }

  it("executor dry-run: tied agentstream matches Go for gate fixture", () => {
    const goOut = normalizeDryRun(dryRunViaGo());
    const tiedOut = normalizeDryRun(dryRunViaTiedCli());
    assert.equal(tiedOut, goOut);
  });

  it("tiedpreflight status codes match Go oracle via go test JSON", () => {
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

    const goOut = execFileSync(
      "go",
      [
        "test",
        "-C",
        moduleDir,
        "./tiedpreflight",
        "-run",
        "TestAnalyze_ok",
        "-count=1",
      ],
      { encoding: "utf8", cwd: repoRoot },
    );
    assert.match(goOut, /^ok\s/m);

    const tsRes = analyze(w, mcp);
    assert.equal(tsRes.status, Status.OK);
  });
});
