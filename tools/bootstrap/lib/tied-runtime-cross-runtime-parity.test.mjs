/**
 * [REQ-TIED_RUNTIME_DISK_CONFIG] SC-RDC-FIXTURE-PARITY
 */
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { resolveTiedRuntimeConfig } from "./tied-runtime-config.mjs";
import {
  listSharedParityFixtureCases,
  materializeTiedRuntimeFixture,
  normalizeResolveSnapshot,
  resolveStoreRepoRootFromLoader,
} from "./tied-runtime-fixture-loader.mjs";

const repoRoot = resolveStoreRepoRootFromLoader();
const probeScript = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../fixtures/tied-runtime/tied-runtime-fixture-probe.ts",
);

describe("tied-runtime cross-runtime parity [SC-RDC-FIXTURE-PARITY]", () => {
  for (const spec of listSharedParityFixtureCases()) {
    it(`bootstrap and agentstream agree for fixture ${spec.id}`, () => {
      const materialized = materializeTiedRuntimeFixture(spec);
      try {
        const mjsCfg = resolveTiedRuntimeConfig({
          cwd: materialized.workspaceRoot,
          processEnv: materialized.processEnv,
        });
        const mjsSnapshot = normalizeResolveSnapshot(mjsCfg);

        const stdout = execFileSync(
          "npx",
          ["tsx", probeScript, materialized.workspaceRoot],
          {
            cwd: repoRoot,
            encoding: "utf8",
            env: { ...process.env, ...materialized.processEnv },
          },
        ).trim();

        const tsSnapshot = JSON.parse(stdout);
        assert.deepEqual(tsSnapshot, mjsSnapshot);
      } finally {
        materialized.cleanup();
      }
    });
  }
});
