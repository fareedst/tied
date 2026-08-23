/**
 * Composition: usage metrics and evidence-chain profile share project identity.
 * - [IMPL-TIED_PROJECT_IDENTITY] [ARCH-TIED_PROJECT_IDENTITY] [REQ-MCP_USAGE_METRICS] [REQ-EVIDENCE_CHAIN_PROFILE]
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, it } from "node:test";
import { generateEvidenceChainProfile, type EvidenceChainProfileAdapters } from "./fidelity-research/evidence-chain-profile.js";
import { resolveProjectIdentity } from "./project-identity.js";
import { wrapToolHandler } from "./usage-metrics.js";
import { clearBasePathCache } from "./yaml-loader.js";
import type { ProjectManifestResult } from "./fidelity-research/manifest.js";

const ENV_KEYS = [
  "TIED_MCP_COLLECT_METRICS",
  "TIED_MCP_METRICS_PATH",
  "TIED_MCP_PROJECT_ID",
  "TIED_BASE_PATH",
] as const;

function saveEnv(): Record<string, string | undefined> {
  const saved: Record<string, string | undefined> = {};
  for (const k of ENV_KEYS) saved[k] = process.env[k];
  return saved;
}

function restoreEnv(saved: Record<string, string | undefined>): void {
  for (const k of ENV_KEYS) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
}

function minimalAdapters(): EvidenceChainProfileAdapters {
  return {
    resolveManifest: (input): ProjectManifestResult => ({
      ok: true,
      manifest: {
        projectRoot: input.projectRoot,
        tiedBasePath: input.tiedBasePath,
        version: input.version,
        languages: [...input.languages],
        testClassifiers: [...input.testClassifiers],
        ignoreRules: [...input.ignoreRules],
      },
    }),
    runStructuralAnalysis: () => ({
      evidence: [],
      proofBoundary: "traceability_structure",
    }),
    auditImplFidelity: () => ({ inventory: [], findings: [], verdicts: {} }),
    analyzeBindingEvidence: () => ({
      kind: "composition-evidence",
      proofBoundary: "UI-free binding evidence only; not unit behavior proof.",
    }),
    analyzeSpecificationState: () => ({ classification: "Unresolved" }),
  };
}

describe("project identity composition [IMPL-TIED_PROJECT_IDENTITY]", () => {
  let tempDir: string;
  let metricsFile: string;
  let saved: Record<string, string | undefined>;

  afterEach(() => {
    restoreEnv(saved);
    clearBasePathCache();
    if (tempDir && fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });

  it("metrics JSONL and profile share project_id for configured env", async () => {
    saved = saveEnv();
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "tied-identity-compose-"));
    const tiedBasePath = path.join(tempDir, "tied");
    fs.mkdirSync(tiedBasePath, { recursive: true });
    metricsFile = path.join(tempDir, "metrics.jsonl");
    process.env.TIED_MCP_COLLECT_METRICS = "1";
    process.env.TIED_MCP_METRICS_PATH = metricsFile;
    process.env.TIED_BASE_PATH = tiedBasePath;
    process.env.TIED_MCP_PROJECT_ID = "shared-compose-id";
    clearBasePathCache();

    const profileResult = generateEvidenceChainProfile({
      project_root: tempDir,
      tied_base_path: tiedBasePath,
      confirmed_tied_base_path: tiedBasePath,
      profile_depth: "integrated",
      adapters: minimalAdapters(),
    });
    assert.equal(profileResult.ok, true);

    const handler = wrapToolHandler("yaml_index_read", async () => ({
      content: [{ type: "text", text: "{}" }],
    }));
    await handler({ index: "requirements" });

    const row = JSON.parse(fs.readFileSync(metricsFile, "utf8").trim()) as { project_id?: string };
    const expected = resolveProjectIdentity(tiedBasePath).project_id;
    assert.equal(row.project_id, expected);
    if (profileResult.ok) {
      assert.equal(profileResult.profile.identity.project_id, expected);
      assert.equal(profileResult.profile.identity.identity_source, "configured");
    }
  });
});
