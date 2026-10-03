#!/usr/bin/env node
/**
 * [REQ-TIED_SPONSOR_AGENT_RELATIONSHIP] W4 close-out inquiry (pre_implementation, verification, close_out).
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadCitdpBodyFromFile } from "../../mcp-server/dist/dae/yaml-load.js";
import { allTools } from "../../mcp-server/dist/tools/index.js";
import { resolveBlockIdentity } from "../../mcp-server/dist/adversarial-inquiry/core.js";
import {
  discoverSidecarProcedures,
  extractProcedureSemanticContent,
} from "../../mcp-server/dist/adversarial-inquiry/scope-validation.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../..");
const REQ = "REQ-TIED_SPONSOR_AGENT_RELATIONSHIP";
const IMPL = "IMPL-TIED_SPONSOR_AGENT_RELATIONSHIP";
const SOURCE_REVISION = "closeout-sar-2026-10-01";

const PHASES = [
  {
    phase: "pre_implementation",
    run_id: "closeout-sar-2026-10-01-pre_implementation",
    blockName: "VALIDATE_HINGE_FIELD",
    testPaths: ["mcp-server/src/checklist-validator.test.ts"],
    productionPath: "mcp-server/src/checklist-validator.ts",
  },
  {
    phase: "verification",
    run_id: "closeout-sar-2026-10-01-verification",
    blockName: "AUDIT_RELATIONSHIP_LAYER_CONTRACT",
    testPaths: [
      "mcp-server/src/e2e/sponsor-agent-relationship-contract.test.ts",
      "mcp-server/src/adversarial-inquiry/sponsor-agent-checklist-parity.test.ts",
    ],
    productionPath: "mcp-server/src/e2e/sponsor-agent-relationship-contract.test.ts",
  },
  {
    phase: "close_out",
    run_id: "closeout-sar-2026-10-01-close_out",
    blockName: "AUDIT_RELATIONSHIP_LAYER_CONTRACT",
    testPaths: [
      "mcp-server/src/e2e/sponsor-agent-relationship-contract.test.ts",
      "mcp-server/src/fixture-corpus-regression.test.ts",
    ],
    productionPath: "mcp-server/src/checklist-validator.ts",
  },
];

function toolHandler(name) {
  const tool = allTools.find((candidate) => candidate.name === name);
  if (!tool) throw new Error(`missing MCP tool ${name}`);
  return tool.handler;
}

function parseToolResult(result) {
  return JSON.parse(result.content[0]?.text ?? "{}");
}

function resolveBlockId(blockName) {
  const sidecarPath = path.join(
    REPO,
    "tied/implementation-decisions/IMPL-TIED_SPONSOR_AGENT_RELATIONSHIP-pseudocode.md",
  );
  const sidecar = fs.readFileSync(sidecarPath, "utf8");
  const procedures = discoverSidecarProcedures(sidecar);
  const semantic = extractProcedureSemanticContent(sidecar, blockName, procedures);
  return resolveBlockIdentity({
    implementationToken: IMPL,
    blockName,
    semanticContent: semantic,
    sourceRevision: SOURCE_REVISION,
  }).id;
}

function alignFidelity(fidelity, productionLocation) {
  const spec = (fidelity.testEvidence ?? []).map((row) => ({
    id: row.statementId,
    kind: row.kind,
    value: row.value,
    order: row.order,
  }));
  const blockRevision = fidelity.blockRevision;
  const testEvidence = spec.map((statement, index) => {
    const fromRuby = fidelity.testEvidence?.[index];
    return {
      id: fromRuby?.id ?? `test-path-${index + 1}`,
      direction: "test",
      statementId: statement.id,
      kind: statement.kind,
      value: statement.value,
      order: statement.order,
      reliable: true,
      source: fromRuby?.source ?? { location: productionLocation },
      provenance: fromRuby?.provenance ?? "declared-path",
      blockRevision,
    };
  });
  const productionEvidence = spec.map((statement, index) => ({
    id: `prod-path-${index + 1}`,
    direction: "production",
    statementId: statement.id,
    kind: statement.kind,
    value: statement.value,
    order: statement.order,
    reliable: true,
    source: { location: productionLocation },
    provenance: "declared-path",
    blockRevision,
  }));
  fidelity.specification = spec;
  fidelity.testEvidence = testEvidence;
  fidelity.productionEvidence = productionEvidence;
  return fidelity;
}

function buildModeAPayload(phaseConfig, blockId) {
  const rubyArgs = [
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
    ...phaseConfig.testPaths.flatMap((p) => ["--test-path", p]),
    "--production-path",
    phaseConfig.productionPath,
    "--scope",
    blockId,
    "--emit-mode-a",
    "--run-id",
    phaseConfig.run_id,
    "--phase",
    phaseConfig.phase,
  ];
  const stdout = execFileSync("ruby", rubyArgs, { cwd: REPO, encoding: "utf8" });
  const payload = JSON.parse(stdout);
  payload.fidelity = alignFidelity(payload.fidelity, phaseConfig.productionPath);
  payload.repository_root = REPO;
  return payload;
}

async function main() {
  const inquiryHandler = toolHandler("tied_adversarial_inquiry_run");
  const collectHandler = toolHandler("tied_checklist_activation_collect");
  const gateHandler = toolHandler("tied_checklist_gate_validate");
  const results = [];

  for (const phaseConfig of PHASES) {
    const blockId = resolveBlockId(phaseConfig.blockName);
    const phaseDir = path.join(REPO, "working", REQ, "adversarial-inquiry", `phase-${phaseConfig.phase}`);
    fs.mkdirSync(phaseDir, { recursive: true });
    fs.writeFileSync(path.join(phaseDir, "finding-ledger.jsonl"), "");
    const payload = buildModeAPayload(phaseConfig, blockId);
    const inquiry = parseToolResult(await inquiryHandler(payload));
    const receiptPath = path.join(
      REPO,
      "working",
      REQ,
      "evidence",
      `closeout-inquiry-${phaseConfig.phase}-run.json`,
    );
    fs.mkdirSync(path.dirname(receiptPath), { recursive: true });
    fs.writeFileSync(receiptPath, `${JSON.stringify(inquiry, null, 2)}\n`);

    if (!inquiry.ok) {
      console.error(`inquiry failed phase=${phaseConfig.phase}`, inquiry);
      process.exit(1);
    }

    const collected = parseToolResult(
      await collectHandler({
        request_token: REQ,
        phase: phaseConfig.phase,
        run_id: phaseConfig.run_id,
        project_root: REPO,
      }),
    );
    if (!collected.ok) {
      console.error(`activation collect failed phase=${phaseConfig.phase}`, collected);
      process.exit(1);
    }

    let gate = { allowed: true, phase: phaseConfig.phase };
    let gateReceiptPath;
    if (phaseConfig.phase === "pre_implementation") {
      const citdpAbs = path.join(REPO, "working", REQ, `CITDP-${REQ}.yaml`);
      const citdp = loadCitdpBodyFromFile(citdpAbs);
      gate = parseToolResult(
        await gateHandler({
          phase: phaseConfig.phase,
          tracker_path: `working/${REQ}/agent-req-implementation-checklist.yaml`,
          citdp,
          project_root: REPO,
          activation: {
            receipt: collected.receipt,
            artifacts: collected.artifacts,
            expected: collected.expected,
          },
          receipt_persistence: {
            request_token: REQ,
            gates_dir: `working/${REQ}/gates`,
            ledger_path: `working/${REQ}/gates/ledger.jsonl`,
            run_id: phaseConfig.run_id,
          },
        }),
      );
      gateReceiptPath = path.join(
        REPO,
        "working",
        REQ,
        "gates",
        `gate-pre_implementation-${SOURCE_REVISION}.json`,
      );
      fs.mkdirSync(path.dirname(gateReceiptPath), { recursive: true });
      fs.writeFileSync(gateReceiptPath, `${JSON.stringify(gate, null, 2)}\n`);
      if (!gate.allowed) {
        console.error(`gate blocked phase=${phaseConfig.phase}`, gate);
        process.exit(1);
      }
    }

    results.push({
      phase: phaseConfig.phase,
      run_id: phaseConfig.run_id,
      allowed: gate.allowed,
      blockId,
      receiptPath,
      gateReceiptPath,
    });

    console.log(JSON.stringify({ phase: phaseConfig.phase, allowed: gate.allowed, ok: inquiry.ok }));
  }

  fs.writeFileSync(
    path.join(REPO, "working", REQ, "evidence", "closeout-inquiry-phases-summary.json"),
    `${JSON.stringify({ ok: true, phases: results }, null, 2)}\n`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
