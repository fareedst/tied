/**
 * [REQ-TIED_LAYERED_CLIENT_INSTALL] BATCH-COMP-001 / BATCH-UNIT-003 — batch CLI.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import {
  parseInstallLayersArgs,
  runInstallBatch,
} from "./install-layers.mjs";

describe("parseInstallLayersArgs batch [BATCH-UNIT-003]", () => {
  it("loads targets from --targets file", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-parse-targets-"));
    const client = path.join(dir, "c1");
    fs.mkdirSync(client);
    const list = path.join(dir, "list.yaml");
    fs.writeFileSync(list, `- ${client}\n`);
    const parsed = parseInstallLayersArgs(["--targets", list]);
    assert.deepEqual(parsed.targets, [path.resolve(client)]);
  });

  it("uses TIED_INSTALL_TARGETS when --targets omitted", () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-env-targets-"));
    const client = path.join(dir, "c1");
    fs.mkdirSync(client);
    const list = path.join(dir, "list.yaml");
    fs.writeFileSync(list, `- ${client}\n`);
    const parsed = parseInstallLayersArgs([], { TIED_INSTALL_TARGETS: list });
    assert.deepEqual(parsed.targets, [path.resolve(client)]);
  });

  it("rejects positional with --targets", () => {
    assert.throws(
      () => parseInstallLayersArgs(["--targets", "/tmp/x.yaml", "/tmp/client"]),
      /Cannot combine a positional client directory with --targets/,
    );
  });

  it("rejects --targets-plan without list source", () => {
    assert.throws(
      () => parseInstallLayersArgs(["--targets-plan"]),
      /--targets-plan requires --targets or TIED_INSTALL_TARGETS/,
    );
  });
});

describe("runInstallBatch [BATCH-COMP-001]", () => {
  it("fail-fast stops after first failing target", async () => {
    const calls = [];
    const parsed = {
      targets: ["/a", "/b", "/c"],
      targetsPlan: false,
      targetsContinueOnError: false,
    };
    const code = await runInstallBatch(parsed, {
      runOne: async (p) => {
        calls.push(p.target);
        return p.target === "/b" ? 1 : 0;
      },
    });
    assert.equal(code, 1);
    assert.deepEqual(calls, ["/a", "/b"]);
  });

  it("continue-on-error runs all targets", async () => {
    const calls = [];
    const parsed = {
      targets: ["/a", "/b"],
      targetsPlan: false,
      targetsContinueOnError: true,
    };
    const code = await runInstallBatch(parsed, {
      runOne: async (p) => {
        calls.push(p.target);
        return p.target === "/b" ? 1 : 0;
      },
    });
    assert.equal(code, 1);
    assert.deepEqual(calls, ["/a", "/b"]);
  });

  it("targets-plan prints paths without runOne", async () => {
    const lines = [];
    const origLog = console.log;
    console.log = (line) => lines.push(line);
    try {
      const code = await runInstallBatch(
        { targets: ["/x", "/y"], targetsPlan: true, targetsContinueOnError: false },
        {
          runOne: async () => {
            throw new Error("should not run");
          },
        },
      );
      assert.equal(code, 0);
      assert.deepEqual(lines, ["/x", "/y"]);
    } finally {
      console.log = origLog;
    }
  });
});
