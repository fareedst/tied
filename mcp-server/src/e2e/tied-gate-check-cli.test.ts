import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";

// [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — How: CLI spawn composes MCP gate validate (exit 0/1/2).

describe("tied gate check CLI e2e [REQ-TIED_DAE_INCORPORATION]", () => {
  const mcpRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
  const repoRoot = path.resolve(mcpRoot, "..");
  const tiedCli = path.join(mcpRoot, "packages/cli/dist/index.js");
  const tiedBase = path.join(repoRoot, "tied");

  it("spawn gate check with fixture tracker and mocked gate via real MCP", () => {
    if (!fs.existsSync(tiedCli)) {
      console.log("skip: tied cli not built");
      return;
    }
    const tracker = path.join(
      repoRoot,
      "working/REQ-TIED_DAE_INCORPORATION/fixtures/trackers/gate-blocked-minimal.yaml",
    );
    const citdp = path.join(
      repoRoot,
      "working/REQ-TIED_DAE_INCORPORATION/fixtures/citdp/w1-gate-check-minimal.yaml",
    );
    const r = spawnSync(
      process.execPath,
      [
        tiedCli,
        "gate",
        "check",
        "--request-token",
        "REQ-TIED_DAE_INCORPORATION",
        "--phase",
        "pre_implementation",
        "--tracker",
        tracker,
        "--citdp",
        citdp,
        "--project-root",
        repoRoot,
        "--json-only",
      ],
      {
        encoding: "utf8",
        env: { ...process.env, TIED_BASE_PATH: tiedBase },
        maxBuffer: 4 * 1024 * 1024,
      },
    );
    assert.ok(r.status === 0 || r.status === 1, `unexpected exit ${r.status} stderr=${r.stderr}`);
    const line = r.stdout.trim().split("\n")[0];
    const payload = JSON.parse(line) as { exit_code: number; allowed: boolean };
    assert.ok([0, 1].includes(payload.exit_code));
    assert.equal(typeof payload.allowed, "boolean");
  });

  it("exit 2 when citdp path missing", () => {
    if (!fs.existsSync(tiedCli)) {
      return;
    }
    const r = spawnSync(
      process.execPath,
      [
        tiedCli,
        "gate",
        "check",
        "--request-token",
        "REQ-TIED_DAE_INCORPORATION",
        "--phase",
        "pre_implementation",
        "--tracker",
        path.join(repoRoot, "working/REQ-TIED_DAE_INCORPORATION/fixtures/trackers/gate-blocked-minimal.yaml"),
        "--citdp",
        path.join(repoRoot, "missing-citdp.yaml"),
        "--project-root",
        repoRoot,
        "--json-only",
      ],
      {
        encoding: "utf8",
        env: { ...process.env, TIED_BASE_PATH: tiedBase },
      },
    );
    assert.equal(r.status, 2);
  });
});
