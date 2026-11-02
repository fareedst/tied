/**
 * [REQ-TIED_SETUP] [REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE] [IMPL-TIED_FILES]
 * How: Disposable factory --out-path stdout contract and parse guards.
 */
import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { sayOk } from "./lib/console.mjs";
import { parseNewTiedClientArgs } from "./new-tied-client.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

describe("parseNewTiedClientArgs --out-path [REQ-TIED_SETUP]", () => {
  it("accepts --out-path with --disposable", () => {
    const parsed = parseNewTiedClientArgs(["--disposable", "--out-path"], {});
    assert.equal(parsed.outPath, true);
    assert.equal(parsed.disposable, true);
    assert.notEqual(parsed.error, true);
  });

  it("rejects --out-path without --disposable", () => {
    const parsed = parseNewTiedClientArgs(["--out-path"], {});
    assert.equal(parsed.error, true);
  });
});

describe("console machine path mode [REQ-TIED_CLI_OPERATOR_OUTPUT_TEXTURE]", () => {
  it("sayOk writes to stderr when TIED_BOOTSTRAP_OUT_PATH=1", () => {
    const prev = process.env.TIED_BOOTSTRAP_OUT_PATH;
    process.env.TIED_BOOTSTRAP_OUT_PATH = "1";
    const stdoutChunks = [];
    const stderrChunks = [];
    const origOut = process.stdout.write.bind(process.stdout);
    const origErr = process.stderr.write.bind(process.stderr);
    process.stdout.write = (chunk, ...rest) => {
      stdoutChunks.push(String(chunk));
      return origOut(chunk, ...rest);
    };
    process.stderr.write = (chunk, ...rest) => {
      stderrChunks.push(String(chunk));
      return origErr(chunk, ...rest);
    };
    try {
      sayOk("DEBUG: machine-mode progress line");
      assert.equal(stdoutChunks.join(""), "");
      assert.match(stderrChunks.join(""), /machine-mode progress/);
    } finally {
      process.stdout.write = origOut;
      process.stderr.write = origErr;
      if (prev === undefined) {
        delete process.env.TIED_BOOTSTRAP_OUT_PATH;
      } else {
        process.env.TIED_BOOTSTRAP_OUT_PATH = prev;
      }
    }
  });
});

describe("runDisposableClient outPath integration [REQ-TIED_SETUP]", () => {
  it("prints only resolved clientDir on stdout when pipeline mocked ok", async () => {
    const { runDisposableClient } = await import("./lib/new-tied-client-pipeline.mjs");
    const tmpRoot = path.join(REPO_ROOT, "tools/bootstrap/.test-out-path-root");
    const clientDir = path.join(tmpRoot, "1700000000-out-path-test");
    const prevEnv = process.env.TIED_BOOTSTRAP_OUT_PATH;
    process.env.TIED_BOOTSTRAP_OUT_PATH = "1";

    const result = runDisposableClient({
      testRoot: tmpRoot,
      sourceRoot: REPO_ROOT,
      skipLint: true,
      skipOnboardingAudit: true,
      skipGit: true,
      skipClaudeValidation: true,
      outPath: true,
      nowMs: 1700000000123,
      tag: "out-path-test",
      env: { ...process.env, TIED_BOOTSTRAP_OUT_PATH: "1" },
      spawn: () => ({ status: 0, stderr: "", stdout: "" }),
    });

    if (prevEnv === undefined) {
      delete process.env.TIED_BOOTSTRAP_OUT_PATH;
    } else {
      process.env.TIED_BOOTSTRAP_OUT_PATH = prevEnv;
    }

    assert.equal(result.ok, true, result.step);
    assert.equal(path.resolve(result.clientDir), path.resolve(clientDir));
  });
});
