import assert from "node:assert/strict";
import { mkdtemp, readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { runDeclaredQualityCommands } from "./quality-command-runner.js";

describe("RUN_DECLARED_QUALITY_COMMANDS [REQ-QUALITY_ASSURANCE_EVIDENCE]", () => {
  it("captures passed and failed argv commands with bounded artifacts", async () => {
    // [IMPL-QUALITY_EVIDENCE_COMMAND_RUNNER] [ARCH-QUALITY_ASSURANCE_PROFILES] [REQ-QUALITY_ASSURANCE_EVIDENCE]
    // Summary: Execute declared quality commands and capture bounded reproducible evidence.
    const artifactDir = await mkdtemp(path.join(os.tmpdir(), "tied-quality-runner-"));
    const results = await runDeclaredQualityCommands({
      commands: [
        {
          id: "pass",
          argv: [process.execPath, "-e", "process.stdout.write('ok')"],
          cwd: process.cwd(),
          artifact_dir: artifactDir,
          tool_version_argv: [process.execPath, "--version"],
          tool_version_name: "node",
        },
        {
          id: "fail",
          argv: [process.execPath, "-e", "process.stderr.write('bad'); process.exit(3)"],
          cwd: process.cwd(),
          artifact_dir: artifactDir,
        },
      ],
    });

    assert.deepEqual(results.map((result) => [result.id, result.exit_code, result.result]), [
      ["pass", 0, "passed"],
      ["fail", 3, "failed"],
    ]);
    assert.equal(results[0]?.tool_versions?.node?.startsWith("v"), true);
    assert.equal(await readFile(results[0]!.artifacts![0]!, "utf8"), "ok");
    assert.equal(await readFile(results[1]!.artifacts![1]!, "utf8"), "bad");
  });

  it("rejects shell-shaped declarations before spawning", async () => {
    await assert.rejects(
      () =>
        runDeclaredQualityCommands({
          commands: [
            {
              id: "invalid",
              argv: [],
              cwd: process.cwd(),
              artifact_dir: process.cwd(),
            },
          ],
        }),
      /INVALID_DECLARATION/,
    );
  });

  it("turns timeout and output-limit breaches into failed evidence", async () => {
    const artifactDir = await mkdtemp(path.join(os.tmpdir(), "tied-quality-limits-"));
    const results = await runDeclaredQualityCommands({
      commands: [
        {
          id: "timeout",
          argv: [process.execPath, "-e", "setTimeout(() => {}, 1000)"],
          cwd: process.cwd(),
          artifact_dir: artifactDir,
          timeout_ms: 20,
        },
        {
          id: "output",
          argv: [process.execPath, "-e", "process.stdout.write('0123456789abcdefghij')"],
          cwd: process.cwd(),
          artifact_dir: artifactDir,
          max_output_bytes: 10,
        },
      ],
    });

    assert.equal(results[0]?.result, "failed");
    assert.equal(results[0]?.diagnostics?.includes("TIMEOUT"), true);
    assert.equal(results[1]?.result, "failed");
    assert.equal(results[1]?.diagnostics?.includes("OUTPUT_LIMIT:10"), true);
  });

  it("records a failed spawn with a diagnostic instead of throwing", async () => {
    const artifactDir = await mkdtemp(path.join(os.tmpdir(), "tied-quality-spawn-"));
    const results = await runDeclaredQualityCommands({
      commands: [
        {
          id: "missing-executable",
          argv: [path.join(artifactDir, "does-not-exist")],
          cwd: process.cwd(),
          artifact_dir: artifactDir,
        },
      ],
    });

    assert.equal(results[0]?.result, "failed");
    assert.ok(results[0]?.diagnostics?.some((diagnostic) => diagnostic.startsWith("SPAWN_FAILED:")));
  });
});
