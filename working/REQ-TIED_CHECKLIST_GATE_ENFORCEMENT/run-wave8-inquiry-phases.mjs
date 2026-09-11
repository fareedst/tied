#!/usr/bin/env node
/**
 * [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] Wave 8 close-out: fresh inquiry for all gated phases.
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
const REQ = "REQ-TIED_CHECKLIST_GATE_ENFORCEMENT";
const BLOCK_NAME = "VALIDATE_CHECKLIST_GATE";
const SOURCE_REVISION = "wave8-adherence-realignment-closeout-20260911";
const RUN_ID = "wave8-closeout-20260911";

const PHASES = ["pre_implementation", "verification", "close_out"];

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
    "tied/implementation-decisions/IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT-pseudocode.md",
  );
  const sidecar = fs.readFileSync(sidecarPath, "utf8");
  const procedures = discoverSidecarProcedures(sidecar);
  const semantic = extractProcedureSemanticContent(sidecar, BLOCK_NAME, procedures);
  return resolveBlockIdentity({
    implementationToken: "IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT",
    blockName: BLOCK_NAME,
    semanticContent: semantic,
    sourceRevision: SOURCE_REVISION,
  }).id;
}

function buildModeAPayload(phase, blockId) {
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
      "mcp-server/src/checklist-validator.test.ts",
      "--test-path",
      "mcp-server/src/checklist-gate-evidence-hydration.test.ts",
      "--test-path",
      "mcp-server/src/tools/checklist-gate-mcp.test.ts",
      "--test-path",
      "mcp-server/src/request-evidence-envelope/process-adherence-gaps.test.ts",
      "--test-path",
      "tools/agentstream/checklist/adherence_ledger_test.go",
      "--test-path",
      "tools/agentstream/checklist/traceable_commit_envelope_test.go",
      "--test-path",
      "scripts/replay-adherence-fixtures.test.mjs",
      "--production-path",
      "mcp-server/src/checklist-validator.ts",
      "--production-path",
      "mcp-server/src/checklist-gate-evidence-hydration.ts",
      "--production-path",
      "tools/bootstrap/templates/sync-tracker-dispositions.mjs",
      "--production-path",
      "tools/bootstrap/templates/run-close-out-gates.mjs",
      "--scope",
      blockId,
      "--emit-mode-a",
      "--run-id",
      RUN_ID,
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

  for (const phase of PHASES) {
    const payload = buildModeAPayload(phase, blockId);
    const inquiry = parseToolResult(await inquiryHandler(payload));

    if (!inquiry.ok) {
      console.error(`inquiry failed phase=${phase} run_id=${RUN_ID}`, inquiry);
      process.exit(1);
    }

    const phaseDir = path.join(REPO, "working", REQ, "adversarial-inquiry", `phase-${phase}`);
    const required = [
      "obligation-report.json",
      "finding-ledger.jsonl",
      "gate-result.json",
      "evidence-provenance.json",
    ];
    for (const name of required) {
      const artifactPath = path.join(phaseDir, name);
      if (!fs.existsSync(artifactPath)) {
        console.error(`missing artifact ${artifactPath}`);
        process.exit(1);
      }
    }

    const collected = parseToolResult(
      await collectHandler({
        request_token: REQ,
        phase,
        run_id: RUN_ID,
        project_root: REPO,
      }),
    );
    if (!collected.ok) {
      console.error(`activation collect failed phase=${phase}`, collected);
      process.exit(1);
    }

    results.push({
      phase,
      run_id: RUN_ID,
      verdict: inquiry.verdict ?? inquiry.gate?.status,
      artifacts: phaseDir,
      metrics_match: collected.metrics_match ?? true,
    });
    console.log(JSON.stringify({ phase, run_id: RUN_ID, ok: true, verdict: inquiry.verdict }));
  }

  fs.writeFileSync(
    path.join(REPO, "working", REQ, "evidence", "wave8-inquiry-phases-result.json"),
    `${JSON.stringify({ ok: true, phases: results }, null, 2)}\n`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
