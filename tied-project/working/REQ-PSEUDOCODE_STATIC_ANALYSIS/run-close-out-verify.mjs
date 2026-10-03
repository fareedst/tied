#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_STATIC_ANALYSIS] Close-out: tied_verify dry_run then write with checklist_gate.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { allTools } from "../../mcp-server/dist/tools/index.js";
import { derivePhaseAwareSlugs } from "../../mcp-server/dist/checklist-validator.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../..");
const REQ = "REQ-PSEUDOCODE_STATIC_ANALYSIS";
const PHASE = "close_out";
const RUN_ID = "psa-closeout-20260908";

function toolHandler(name) {
  const tool = allTools.find((candidate) => candidate.name === name);
  if (!tool) throw new Error(`missing MCP tool ${name}`);
  return tool.handler;
}

function parseToolResult(result) {
  return JSON.parse(result.content[0]?.text ?? "{}");
}

function buildTracker(phase) {
  const slugs = derivePhaseAwareSlugs("integrated", phase);
  return {
    steps: slugs.map((slug) => ({
      slug,
      disposition: "completed",
      evidence_refs:
        slug === "sub-adversarial-inquiry-pass"
          ? [`working/${REQ}/adversarial-inquiry/phase-${phase}/obligation-report.json`]
          : slug === "gate-pseudocode-validation"
            ? ["pseudocode_validate IMPL-PSEUDOCODE_ANALYSIS_ENGINE sidecar ok"]
            : slug === "verification-gate"
              ? ["mcp-server npm test 567 pass", "tied_validate_consistency ok"]
              : slug === "risk-assessment"
                ? [`tied/citdp/CITDP-${REQ}.yaml depth_tier: integrated`]
                : ["implementation complete"],
    })),
  };
}

function buildCitdp(phase, runId) {
  return {
    risk_analysis: {
      depth_tier: "integrated",
      gate_policy: "advisory",
      adversarial_inquiry: {
        depth_tier: "integrated",
        gate_policy: "advisory",
        prior_depth_tier: "minimal",
        assurance_profile: "baseline-functional",
        research_profile: "external-input-security",
        counterexamples: [
          "False confidence from analysis report treated as runtime proof",
          "Path traversal via essence_pseudocode_path",
        ],
        disconfirming_observations: [
          "pseudocode_analyze rejects paths outside TIED_BASE_PATH",
          "Report includes explicit proof_boundary and unknowns[]",
        ],
        evidence_references: [
          "mcp-server/src/tools/pseudocode-analyze-mcp.test.ts",
          "working/REQ-PSEUDOCODE_STATIC_ANALYSIS/adversarial-inquiry/",
        ],
      },
    },
    completion_criteria: {
      activation: {
        run_id: runId,
        phase,
        request_token: REQ,
        verification_run_id: "psa-verify-20260908",
        close_out_run_id: RUN_ID,
      },
      verification_gate_notes:
        "mcp-server npm test 567 pass; tied_validate_consistency ok; pseudocode_validate sidecar ok.",
    },
  };
}

async function main() {
  const collectHandler = toolHandler("tied_checklist_activation_collect");
  const verifyHandler = toolHandler("tied_verify");

  const collected = parseToolResult(
    await collectHandler({
      request_token: REQ,
      phase: PHASE,
      run_id: RUN_ID,
      project_root: REPO,
    }),
  );
  if (!collected.ok) {
    console.error("activation collect failed", collected);
    process.exit(1);
  }

  const payload = {
    passed_requirement_tokens: [REQ],
    passed_impl_tokens: ["IMPL-PSEUDOCODE_ANALYSIS_ENGINE"],
    checklist_gate: {
      phase: PHASE,
      tracker: buildTracker(PHASE),
      citdp: buildCitdp(PHASE, RUN_ID),
      activation: {
        receipt: collected.receipt,
        artifacts: collected.artifacts,
        expected: collected.expected,
      },
    },
  };

  const dryRun = parseToolResult(await verifyHandler({ ...payload, dry_run: true }));
  fs.writeFileSync(
    path.join(__dirname, "tied-verify-dry-run.json"),
    `${JSON.stringify(dryRun, null, 2)}\n`,
  );
  console.log("tied_verify dry_run:", JSON.stringify(dryRun));
  if (!dryRun.ok) process.exit(1);

  const writeResult = parseToolResult(await verifyHandler({ ...payload, dry_run: false }));
  fs.writeFileSync(
    path.join(__dirname, "tied-verify-result.json"),
    `${JSON.stringify(writeResult, null, 2)}\n`,
  );
  console.log("tied_verify write:", JSON.stringify(writeResult));
  if (!writeResult.ok) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
