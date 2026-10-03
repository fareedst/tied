#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_STATIC_ANALYSIS] Identity-bound inquiry for DOC-PSA-LAYER-C-CLOSEOUT.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { allTools } from "../../mcp-server/dist/tools/index.js";
import { resolveBlockIdentity } from "../../mcp-server/dist/adversarial-inquiry/core.js";
import {
  discoverSidecarProcedures,
  extractProcedureSemanticContent,
} from "../../mcp-server/dist/adversarial-inquiry/scope-validation.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../..");
const REQ = "REQ-PSEUDOCODE_STATIC_ANALYSIS";
const BLOCK_NAME = "BOOTSTRAP_TIED";
const SOURCE_REVISION = "doc-psa-lc-closeout-20260911";

const PHASES = [
  { phase: "pre_implementation", run_id: "doc-psa-lc-pre-20260911" },
  { phase: "verification", run_id: "doc-psa-lc-verify-20260911" },
  { phase: "close_out", run_id: "doc-psa-lc-closeout-20260911" },
];

function toolHandler(name) {
  const tool = allTools.find((candidate) => candidate.name === name);
  if (!tool) throw new Error(`missing MCP tool ${name}`);
  return tool.handler;
}

function parseToolResult(result) {
  return JSON.parse(result.content[0]?.text ?? "{}");
}

function resolveBlockId() {
  const sidecarPath = path.join(
    REPO,
    "tied/implementation-decisions/IMPL-TIED_FILES-pseudocode.md",
  );
  const sidecar = fs.readFileSync(sidecarPath, "utf8");
  const procedures = discoverSidecarProcedures(sidecar);
  const semantic = extractProcedureSemanticContent(sidecar, BLOCK_NAME, procedures);
  return resolveBlockIdentity({
    implementationToken: "IMPL-TIED_FILES",
    blockName: BLOCK_NAME,
    semanticContent: semantic,
    sourceRevision: SOURCE_REVISION,
  }).id;
}

function buildModeAPayload(phase, runId, blockId) {
  const stdout = execFileSync(
    "ruby",
    [
      path.join(REPO, "scripts/build_adversarial_inquiry_from_tied.rb"),
      "--project-root",
      REPO,
      "--tied-base-path",
      path.join(REPO, "tied"),
      "--request-token",
      REQ,
      "--block-id",
      blockId,
      "--source-revision",
      SOURCE_REVISION,
      "--test-path",
      "mcp-server/src/checklist-pseudocode-gate.test.ts",
      "--test-path",
      "mcp-server/dist/checklist-pseudocode-gate.test.js",
      "--production-path",
      "scripts/backfill-pseudocode-analysis.mjs",
      "--scope",
      blockId,
      "--emit-mode-a",
      "--run-id",
      runId,
      "--phase",
      phase,
    ],
    { cwd: REPO, encoding: "utf8" },
  );
  return JSON.parse(stdout);
}

async function main() {
  const inquiryHandler = toolHandler("tied_adversarial_inquiry_run");
  const collectHandler = toolHandler("tied_checklist_activation_collect");
  const results = [];
  const blockId = resolveBlockId();

  for (const { phase, run_id } of PHASES) {
    const payload = buildModeAPayload(phase, run_id, blockId);
    const inquiry = parseToolResult(await inquiryHandler(payload));
    if (!inquiry.ok) {
      console.error(`inquiry failed phase=${phase} run_id=${run_id}`, inquiry);
      process.exit(1);
    }

    const phaseDir = path.join(REPO, "working", REQ, "adversarial-inquiry", `phase-${phase}`);
    for (const name of [
      "obligation-report.json",
      "finding-ledger.jsonl",
      "gate-result.json",
      "evidence-provenance.json",
    ]) {
      if (!fs.existsSync(path.join(phaseDir, name))) {
        console.error(`missing artifact ${path.join(phaseDir, name)}`);
        process.exit(1);
      }
    }

    const collected = parseToolResult(
      await collectHandler({
        request_token: REQ,
        phase,
        run_id,
        project_root: REPO,
      }),
    );
    if (!collected.ok) {
      console.error(`activation collect failed phase=${phase}`, collected);
      process.exit(1);
    }

    results.push({
      phase,
      run_id,
      verdict: inquiry.verdict ?? inquiry.gate?.status,
      artifacts: phaseDir,
      metrics_match: collected.metrics_match ?? true,
    });
    console.log(JSON.stringify({ phase, run_id, ok: true, verdict: inquiry.verdict }));
  }

  fs.writeFileSync(
    path.join(REPO, "working", REQ, "evidence", "doc-psa-lc-inquiry-phases-result.json"),
    `${JSON.stringify({ ok: true, phases: results }, null, 2)}\n`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
