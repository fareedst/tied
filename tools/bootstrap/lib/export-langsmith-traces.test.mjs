/**
 * [REQ-TIED_HARNESS_LANGSMITH_COMPOSE] export-langsmith-traces.mjs CLI contract (no network).
 */
import assert from "node:assert/strict";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { parseExportCli, missingApiKeyMessage } from "../../bundled-prompt-type-skills/harness-trace-langsmith-compose/scripts/export-langsmith-traces.mjs";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");

describe("export-langsmith-traces [REQ-TIED_HARNESS_LANGSMITH_COMPOSE]", () => {
  it("parseExportCli accepts run ids and output directory", () => {
    const parsed = parseExportCli([
      "--out",
      "/tmp/htol-traces",
      "--run-id",
      "11111111-1111-1111-1111-111111111111",
      "--run-id",
      "22222222-2222-2222-2222-222222222222",
    ]);
    assert.equal(parsed.outDir, "/tmp/htol-traces");
    assert.deepEqual(parsed.runIds, [
      "11111111-1111-1111-1111-111111111111",
      "22222222-2222-2222-2222-222222222222",
    ]);
    assert.equal(parsed.apiKey, undefined);
  });

  it("parseExportCli reads LANGSMITH_API_KEY from env when --api-key-env set", () => {
    const prev = process.env.LANGSMITH_API_KEY;
    process.env.LANGSMITH_API_KEY = "test-key";
    try {
      const parsed = parseExportCli(["--out", ".", "--run-id", "abc", "--api-key-env", "LANGSMITH_API_KEY"]);
      assert.equal(parsed.apiKey, "test-key");
    } finally {
      if (prev === undefined) delete process.env.LANGSMITH_API_KEY;
      else process.env.LANGSMITH_API_KEY = prev;
    }
  });

  it("missingApiKeyMessage names LANGSMITH_API_KEY", () => {
    assert.match(missingApiKeyMessage(), /LANGSMITH_API_KEY/);
  });

  it("export script file exists under bundled skill path", () => {
    const scriptPath = path.join(
      repoRoot,
      "tools",
      "bundled-prompt-type-skills",
      "harness-trace-langsmith-compose",
      "scripts",
      "export-langsmith-traces.mjs"
    );
    assert.ok(scriptPath.startsWith(repoRoot));
  });
});
