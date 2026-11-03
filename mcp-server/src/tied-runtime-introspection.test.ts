/**
 * [REQ-TIED_RUNTIME_DISK_CONFIG] SC-RDC-MCP-INTROSPECTION
 */
import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";

import { pathsSameResolved, resolveRuntimeIntrospection } from "./tied-runtime-introspection.js";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");

async function loadFixtureHelpers() {
  const href = pathToFileURL(
    path.join(repoRoot, "tools/bootstrap/lib/tied-runtime-fixture-loader.mjs"),
  ).href;
  return import(href) as Promise<{
    getTiedRuntimeFixtureCase: (id: string) => { id: string; layout: string };
    materializeTiedRuntimeFixture: (spec: unknown) => {
      workspaceRoot: string;
      storeRoot: string;
      processEnv: Record<string, string>;
      cleanup: () => void;
    };
    normalizeResolveSnapshot: (cfg: Record<string, unknown> | null | undefined) => Record<
      string,
      string
    > | null;
  }>;
}

async function loadBootstrapResolver() {
  const href = pathToFileURL(
    path.join(repoRoot, "tools/bootstrap/lib/tied-runtime-config.mjs"),
  ).href;
  const mod = await import(href);
  return mod.resolveTiedRuntimeConfig as (params: {
    cwd: string;
    mode: string;
    requireDistExists: boolean;
    processEnv: Record<string, string>;
  }) => Record<string, unknown>;
}

describe("tied-runtime-introspection [SC-RDC-MCP-INTROSPECTION]", () => {
  for (const caseId of ["monolithic-mcp", "linked-client"] as const) {
    it(`matches bootstrap resolver for fixture ${caseId}`, async () => {
      const { getTiedRuntimeFixtureCase, materializeTiedRuntimeFixture, normalizeResolveSnapshot } =
        await loadFixtureHelpers();
      const resolveTiedRuntimeConfig = await loadBootstrapResolver();
      const spec = getTiedRuntimeFixtureCase(caseId);
      const materialized = materializeTiedRuntimeFixture(spec);
      const savedEnv: Record<string, string | undefined> = {};
      const mergedEnv = {
        ...process.env,
        ...materialized.processEnv,
        TIED_MCP_TEST_REPO_ROOT: repoRoot,
      };
      for (const key of Object.keys(materialized.processEnv)) {
        savedEnv[key] = process.env[key];
        process.env[key] = materialized.processEnv[key];
      }
      try {
        const bootstrapCfg = resolveTiedRuntimeConfig({
          cwd: materialized.workspaceRoot,
          mode: "auto",
          requireDistExists: false,
          processEnv: mergedEnv as Record<string, string>,
        });
        const expected = normalizeResolveSnapshot(bootstrapCfg);
        const snapshot = await resolveRuntimeIntrospection(materialized.workspaceRoot, mergedEnv);
        assert.equal(snapshot.runtime_introspection_status, "ok");
        assert.ok(snapshot.config_sources.length > 0);
        assert.ok(snapshot.store_root);
        assert.ok(snapshot.mcp_dist_path);
        assert.ok(
          pathsSameResolved(snapshot.store_root!, expected!.storeRoot!),
          "store_root mismatch",
        );
        assert.ok(
          pathsSameResolved(snapshot.mcp_dist_path!, expected!.mcpDistPath!),
          "mcp_dist_path mismatch",
        );
      } finally {
        for (const [key, value] of Object.entries(savedEnv)) {
          if (value === undefined) delete process.env[key];
          else process.env[key] = value;
        }
        materialized.cleanup();
      }
    });
  }

  it("returns unavailable when bootstrap module missing", async () => {
    const snapshot = await resolveRuntimeIntrospection("/nonexistent/tied-client-root", {});
    assert.equal(snapshot.runtime_introspection_status, "unavailable");
    assert.equal(snapshot.store_root, null);
  });
});
