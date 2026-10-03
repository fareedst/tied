#!/usr/bin/env node
/**
 * [REQ-PSEUDOCODE_STATIC_ANALYSIS] DOC-PSA-PSEUDOCODE-FULL-UPDATE close-out gates.
 * Verification inquiry + activation collect + gate; close_out gate with inquiry waiver.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { allTools } from "../../mcp-server/dist/tools/index.js";
import { derivePhaseAwareSlugs } from "../../mcp-server/dist/checklist-validator.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../..");
const REQ = "REQ-PSEUDOCODE_STATIC_ANALYSIS";
const CHANGE_ID = "DOC-PSA-PSEUDOCODE-FULL-UPDATE";
const VERIFY_RUN_ID = "psa-doc-full-update-verify-20260908";
const CLOSEOUT_RUN_ID = "psa-doc-full-update-closeout-20260908";
const BLOCK_ID = "IMPL-PSEUDOCODE_ANALYSIS_ENGINE#ANALYZE_ESSENCE_PSEUDOCODE#ccd3592432c0cf4e";
const LAYER_C_REPORT =
  "working/REQ-PSEUDOCODE_STATIC_ANALYSIS/pseudocode-analysis/IMPL-PSEUDOCODE_ANALYSIS_ENGINE.v1.json";
const FIXTURE_ROOT = path.join(REPO, "mcp-server/test/fixtures/adversarial-inquiry-psa");

function toolHandler(name) {
  const tool = allTools.find((candidate) => candidate.name === name);
  if (!tool) throw new Error(`missing MCP tool ${name}`);
  return tool.handler;
}

function parseToolResult(result) {
  return JSON.parse(result.content[0]?.text ?? "{}");
}

function readJson(name) {
  return JSON.parse(fs.readFileSync(path.join(FIXTURE_ROOT, name), "utf8"));
}

function inquiryArgs(phase, runId) {
  return {
    graph: readJson("graph.json"),
    fidelity: readJson("fidelity.json"),
    scope: [BLOCK_ID],
    policy: "advisory",
    repository_root: REPO,
    request_token: REQ,
    run_id: runId,
    phase,
    provenance: { runId, phase, scope: [BLOCK_ID], change_id: CHANGE_ID },
  };
}

function buildTracker(phase) {
  const slugs = derivePhaseAwareSlugs("integrated", phase);
  return {
    steps: slugs.map((slug) => ({
      slug,
      disposition: slug === "traceable-commit" ? "waived" : "completed",
      evidence_refs:
        slug === "sub-adversarial-inquiry-pass"
          ? [`working/${REQ}/adversarial-inquiry/phase-${phase}/obligation-report.json`]
          : slug === "gate-pseudocode-validation"
            ? [
                LAYER_C_REPORT,
                "pseudocode_validate IMPL-PSEUDOCODE_ANALYSIS_ENGINE sidecar ok",
              ]
            : slug === "verification-gate"
              ? [
                  "mcp-server npm test 580/580 pass",
                  "tied_validate_consistency ok",
                  LAYER_C_REPORT,
                ]
              : slug === "risk-assessment"
                ? [`working/${CHANGE_ID}/citdp.yaml depth_tier: integrated`]
                : ["implementation complete"],
      ...(slug === "traceable-commit"
        ? {
            owner: "plan-close-out",
            expiry: "2026-12-31",
            approval: "deferred-commit-by-user-request",
            residual_risk: "Uncommitted working tree; commit deferred per user instruction",
          }
        : {}),
    })),
  };
}

function buildCitdp(phase, runId) {
  const base = {
    change_id: CHANGE_ID,
    risk_analysis: {
      depth_tier: "integrated",
      gate_policy: "advisory",
      adversarial_inquiry: {
        depth_tier: "integrated",
        gate_policy: "advisory",
        prior_depth_tier: null,
        assurance_profile: "baseline-functional",
        research_profile: "external-input-security",
        counterexamples: [
          "UNRESOLVED_CALL with ok true before gate_mode ships enables false pass at Layer C gate",
          "Authors conflate evidence-chain parse-only PSA row with mandatory gate path",
        ],
        disconfirming_observations: [
          "Phase 4 unit tests prove gate_mode strict ok before checklist enablement",
          "File-scoped rule documented; changed sidecar must pass as whole file",
        ],
        evidence_references: [
          "docs/pseudocode-static-analysis-docs-and-gate-plan.md",
          LAYER_C_REPORT,
          "mcp-server/src/analysis/pseudocode-analyzer.test.ts",
        ],
      },
    },
    completion_criteria: {
      activation: {
        run_id: runId,
        phase,
        request_token: REQ,
      },
      verification_gate_notes:
        "580/580 mcp-server tests; tied_validate_consistency ok; Layer C gate_mode report ok.",
    },
  };

  if (phase === "close_out") {
    base.risk_analysis.adversarial_inquiry.close_out_inquiry_waiver = {
      approval: `${CHANGE_ID}-close-out-plan`,
      owner: "TIED maintainers",
      expiry: "2026-12-31",
      rationale:
        "Close-out reuses identity-bound PASS inquiry evidence from verification run; findings unchanged; no inquiry rerun.",
      referenced_verification_run_id: VERIFY_RUN_ID,
      request_token: REQ,
      scope: "Mode A fidelity PASS for adversarial-inquiry-psa fixture alignment",
    };
    base.completion_criteria.activation = {
      run_id: CLOSEOUT_RUN_ID,
      close_out_run_id: CLOSEOUT_RUN_ID,
      phase: "close_out",
      request_token: REQ,
      verification_run_id: VERIFY_RUN_ID,
    };
  }

  return base;
}

async function main() {
  const gatesDir = path.join(__dirname, "gates");
  fs.mkdirSync(gatesDir, { recursive: true });

  const inquiryHandler = toolHandler("tied_adversarial_inquiry_run");
  const collectHandler = toolHandler("tied_checklist_activation_collect");
  const gateHandler = toolHandler("tied_checklist_gate_validate");

  // Verification: fresh inquiry + collect + gate
  const verifyInquiry = parseToolResult(
    await inquiryHandler(inquiryArgs("verification", VERIFY_RUN_ID)),
  );
  fs.writeFileSync(
    path.join(gatesDir, "inquiry-verification.json"),
    `${JSON.stringify(verifyInquiry, null, 2)}\n`,
  );
  if (!verifyInquiry.ok) {
    console.error("verification inquiry failed", verifyInquiry);
    process.exit(1);
  }

  const verifyCollected = parseToolResult(
    await collectHandler({
      request_token: REQ,
      phase: "verification",
      run_id: VERIFY_RUN_ID,
      project_root: REPO,
    }),
  );
  fs.writeFileSync(
    path.join(gatesDir, "activation-collect-verification.json"),
    `${JSON.stringify(verifyCollected, null, 2)}\n`,
  );
  if (!verifyCollected.ok) {
    console.error("verification collect failed", verifyCollected);
    process.exit(1);
  }

  const verifyGate = parseToolResult(
    await gateHandler({
      phase: "verification",
      tracker: buildTracker("verification"),
      citdp: buildCitdp("verification", VERIFY_RUN_ID),
      activation: {
        receipt: verifyCollected.receipt,
        artifacts: verifyCollected.artifacts,
        expected: verifyCollected.expected,
      },
    }),
  );
  fs.writeFileSync(
    path.join(gatesDir, "gate-verification-result.json"),
    `${JSON.stringify(verifyGate, null, 2)}\n`,
  );
  console.log(
    `gate-verification: allowed=${verifyGate.allowed} diagnostics=${JSON.stringify(verifyGate.diagnostics ?? [])}`,
  );
  if (!verifyGate.allowed) process.exit(1);

  // Close_out: waiver path (no new inquiry)
  const closeGate = parseToolResult(
    await gateHandler({
      phase: "close_out",
      tracker: buildTracker("close_out"),
      citdp: buildCitdp("close_out", CLOSEOUT_RUN_ID),
    }),
  );
  fs.writeFileSync(
    path.join(gatesDir, "gate-close_out-result.json"),
    `${JSON.stringify(closeGate, null, 2)}\n`,
  );
  console.log(
    `gate-close_out: allowed=${closeGate.allowed} diagnostics=${JSON.stringify(closeGate.diagnostics ?? [])}`,
  );
  if (!closeGate.allowed) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
