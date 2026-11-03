/**
 * [REQ-TIED_CONFIG_REPORT] SC-CR-MCP-PARITY
 */
import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

import { resolveTiedConfigReport } from "./tied-config-report.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

async function loadFixtureHelpers() {
  const href = pathToFileURL(
    path.join(repoRoot, "tools/bootstrap/lib/tied-runtime-fixture-loader.mjs"),
  ).href;
  return import(href) as Promise<{
    materializeTiedRuntimeFixtureById: (id: string) => {
      workspaceRoot: string;
      processEnv: Record<string, string>;
      cleanup: () => void;
    };
  }>;
}

function stripVolatile(report: Record<string, unknown>) {
  const copy = JSON.parse(JSON.stringify(report)) as Record<string, unknown>;
  delete copy.generated_at;
  return copy;
}

describe("tied-config-report MCP wrapper [SC-CR-MCP-PARITY]", () => {
  it("matches bootstrap builder for linked-client fixture", async () => {
    const { materializeTiedRuntimeFixtureById } = await loadFixtureHelpers();
    const mat = materializeTiedRuntimeFixtureById("linked-client");
    const mergedEnv = {
      ...process.env,
      ...mat.processEnv,
      TIED_MCP_TEST_REPO_ROOT: repoRoot,
    } as NodeJS.ProcessEnv;
    try {
      const mcpResult = await resolveTiedConfigReport(mat.workspaceRoot, mergedEnv);
      assert.equal(mcpResult.status, "ok");
      const mod = await import(
        pathToFileURL(path.join(repoRoot, "tools/bootstrap/lib/tied-config-report.mjs")).href
      );
      const direct = mod.buildTiedConfigReport({
        cwd: mat.workspaceRoot,
        processEnv: mergedEnv,
      });
      assert.deepEqual(stripVolatile(mcpResult.report!), stripVolatile(direct));
    } finally {
      mat.cleanup();
    }
  });
});
