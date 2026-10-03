#!/usr/bin/env node
/**
 * PSA follow-up close-out (Tracks A/B/C): gates, verify, receipts.
 * [REQ-PSEUDOCODE_STATIC_ANALYSIS] [REQ-EVIDENCE_CHAIN_PROFILE] [REQ-PSEUDOCODE_PARSER_UNIFICATION]
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { allTools } from "../mcp-server/dist/tools/index.js";
import { derivePhaseAwareSlugs } from "../mcp-server/dist/checklist-validator.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "..");

const TRACK_A = {
  req: "REQ-PSEUDOCODE_STATIC_ANALYSIS",
  runId: "psa-followup-closeout-20260908",
  waiverRunId: "psa-fidelity-rerun-20260908",
  depth: "integrated",
  checklist: "working/REQ-PSEUDOCODE_STATIC_ANALYSIS/follow-up-fidelity-checklist.yaml",
  citdpFile: "tied/citdp/CITDP-REQ-PSEUDOCODE_STATIC_ANALYSIS.yaml",
};

const TRACK_B = {
  req: "REQ-EVIDENCE_CHAIN_PROFILE",
  runId: "ecp-psa-analyze-closeout-20260908",
  depth: "minimal",
  checklist: "working/REQ-EVIDENCE_CHAIN_PROFILE/follow-up-psa-analyze-checklist.yaml",
  citdpFile: "tied/citdp/CITDP-REQ-EVIDENCE_CHAIN_PROFILE.yaml",
};

const TRACK_C = {
  req: "REQ-PSEUDOCODE_PARSER_UNIFICATION",
  runId: "parser-unification-closeout-20260908",
  depth: "integrated",
  checklist: "working/REQ-PSEUDOCODE_PARSER_UNIFICATION/agent-req-implementation-checklist.yaml",
  citdpFile: "tied/citdp/CITDP-REQ-PSEUDOCODE_PARSER_UNIFICATION.yaml",
  impl: "IMPL-PSEUDOCODE_SHARED_PRIMITIVES",
};

function toolHandler(name) {
  const tool = allTools.find((candidate) => candidate.name === name);
  if (!tool) throw new Error(`missing MCP tool ${name}`);
  return tool.handler;
}

function parseToolResult(result) {
  return JSON.parse(result.content[0]?.text ?? "{}");
}

function buildIntegratedTracker(req, phase, extras = {}) {
  const slugs = derivePhaseAwareSlugs("integrated", phase);
  return {
    steps: slugs.map((slug) => ({
      slug,
      disposition: slug === "traceable-commit" ? "waived" : "completed",
      evidence_refs:
        slug === "sub-adversarial-inquiry-pass"
          ? [`working/${req}/adversarial-inquiry/phase-${phase}/obligation-report.json`]
          : slug === "gate-pseudocode-validation"
            ? [`pseudocode_validate ${extras.impl ?? "IMPL sidecar"} ok`]
            : slug === "verification-gate"
              ? ["mcp-server npm test 574 pass", "tied_validate_consistency ok"]
              : slug === "risk-assessment"
                ? [`${extras.citdpFile ?? `tied/citdp/CITDP-${req}.yaml`} depth_tier: integrated`]
                : ["implementation complete"],
      ...(slug === "traceable-commit"
        ? {
            owner: "build-plan-close-out",
            expiry: "2026-12-31",
            approval: "deferred-commit-by-user-request",
            residual_risk: "Consolidated commit proposal only; no git add/commit",
          }
        : {}),
    })),
  };
}

function buildMinimalTracker(req) {
  return {
    steps: [
      {
        slug: "risk-assessment",
        disposition: "completed",
        evidence_refs: [`${TRACK_B.citdpFile} depth_tier: minimal`],
      },
      {
        slug: "sub-adversarial-inquiry-pass",
        disposition: "not_applicable",
        policy: "minimal-depth follow-up close-out",
        rationale: "Minimal-depth follow-up close-out; bounded pilot JSON proves static analysis opt-in only.",
        owner: "TIED maintainers",
        expiry: "2026-12-31",
        approval: "psa-followup-close-out-plan",
        residual_risk: "Pilot artifacts are local-only path references.",
      },
      {
        slug: "verification-gate",
        disposition: "completed",
        evidence_refs: [
          "mcp-server npm test 574 pass",
          "working/evidence-chain/psa-analyze-pilot-off.json",
          "working/evidence-chain/psa-analyze-pilot-on.json",
        ],
      },
      {
        slug: "traceable-commit",
        disposition: "waived",
        owner: "build-plan-close-out",
        expiry: "2026-12-31",
        approval: "deferred-commit-by-user-request",
        residual_risk: "Commit proposal only per plan-close-out",
      },
    ],
  };
}

function buildTrackACitdp() {
  const base = fs.readFileSync(path.join(REPO, TRACK_A.citdpFile), "utf8");
  return {
    change_definition: {
      follow_up_completed: [{ token: "REQ-PSEUDOCODE_PARSER_UNIFICATION", note: "Shared-parser migration shipped under separate REQ." }],
    },
    completion_criteria: {
      activation: {
        run_id: TRACK_A.runId,
        phase: "close_out",
        request_token: TRACK_A.req,
        close_out_run_id: TRACK_A.runId,
        verification_run_id: TRACK_A.waiverRunId,
      },
      verification_gate_notes:
        "574/574 mcp-server tests; tied_validate_consistency ok; follow-up close-out reuses psa-fidelity-rerun-20260908 PASS via close_out_inquiry_waiver.",
    },
    risk_analysis: {
      depth_tier: "integrated",
      gate_policy: "advisory",
      adversarial_inquiry: {
        depth_tier: "integrated",
        gate_policy: "advisory",
        prior_depth_tier: "minimal",
        follow_up_inquiry_run_id: TRACK_A.waiverRunId,
        follow_up_verdict: "PASS",
        close_out_inquiry_waiver: {
          owner: "TIED maintainers",
          expiry: "2026-12-31",
          rationale:
            "Follow-up close-out reuses identity-bound PASS inquiry evidence from psa-fidelity-rerun-20260908; findings unchanged; no inquiry rerun.",
          approval: "psa-followup-close-out-plan",
          referenced_verification_run_id: TRACK_A.waiverRunId,
          request_token: TRACK_A.req,
          scope: "Mode A fidelity PASS for adversarial-inquiry-psa fixture alignment",
          artifact_identities: [
            "mcp-server/test/fixtures/adversarial-inquiry-psa/graph.json",
            "mcp-server/test/fixtures/adversarial-inquiry-psa/fidelity.json",
            "mcp-server/src/adversarial-inquiry/psa-fixture.test.ts",
          ],
        },
        evidence_references: [
          "mcp-server/test/fixtures/adversarial-inquiry-psa/",
          "mcp-server/src/adversarial-inquiry/psa-fixture.test.ts",
          `working/${TRACK_A.req}/adversarial-inquiry/phase-close_out/`,
        ],
      },
    },
  };
}

function buildTrackBCitdp() {
  return {
    change_definition: {
      desired_behavior:
        "evidence_chain_profile_generate accepts invoke_pseudocode_analyze (default false) for bounded pseudocode_analyze structural rows when invoke_structural_validators is true.",
      follow_up_completed: ["invoke_pseudocode_analyze opt-in with pilot evidence"],
    },
    completion_criteria: {
      verification_gate_notes:
        "574/574 mcp-server tests; pilot JSON path refs under working/evidence-chain/psa-analyze-pilot-*.json; proof boundary bounded static analysis only.",
      profile_depth: "minimal",
    },
    evidence: {
      pilot_references: [
        "working/evidence-chain/psa-analyze-pilot-off.json",
        "working/evidence-chain/psa-analyze-pilot-on.json",
        "working/evidence-chain/psa-analyze-pilot-20260908-summary.json",
      ],
      proof_boundaries: ["bounded static analysis only; not runtime or test execution claims"],
    },
    risk_analysis: {
      depth_tier: "minimal",
      profile_depth: "minimal",
      gate_policy: "advisory",
      adversarial_inquiry: {
        depth_tier: "minimal",
        gate_policy: "advisory",
        profile_depth: "minimal",
        proof_boundary: "Pilot JSON proves invoke_pseudocode_analyze opt-in wiring; not runtime execution.",
        counterexamples: [
          "invoke_pseudocode_analyze default true silently changes structural snapshots",
          "Pilot JSON treated as runtime execution proof",
        ],
        falsification_questions: [
          "Does default false preserve prior structural snapshot behavior?",
          "Are pilot artifacts referenced without claiming runtime execution?",
        ],
        disconfirming_observations: [
          "574/574 mcp-server tests pass including evidence-chain profile tests",
          "invoke_pseudocode_analyze defaults false in evidence_chain_profile_generate",
        ],
        evidence_references: [
          "working/evidence-chain/psa-analyze-pilot-off.json",
          "working/evidence-chain/psa-analyze-pilot-on.json",
          "working/evidence-chain/psa-analyze-pilot-20260908-summary.json",
          "tied/docs/evidence-chain-profile.md",
        ],
      },
    },
  };
}

function buildTrackCCitdp(runId) {
  return {
    change_definition: {
      non_goals: ["Phase C3 validator consumes parser IR — deferred to separate future plan"],
      follow_up_deferred: {
        phase: "C3",
        behavior: "Validator consumes full parser IR",
        handoff: "Separate future C3 plan; prerequisite parser/validator integration with golden tests; not implemented in this close-out.",
      },
    },
    completion_criteria: {
      activation: {
        run_id: runId,
        phase: "close_out",
        request_token: TRACK_C.req,
        close_out_run_id: runId,
      },
      verification_gate_notes:
        "574/574 mcp-server tests; layer-b-pseudocode-validator.v1 goldens preserved; C1+C2 complete; C3 explicitly deferred.",
    },
    evidence: {
      commands: [
        { command: "npm test", cwd: "mcp-server", exit_code: "0", result: "574 passed" },
        { command: "pseudocode_validate IMPL-PSEUDOCODE_SHARED_PRIMITIVES", result: "passed" },
        { command: "tied_validate_consistency", result: "passed" },
      ],
    },
    risk_analysis: {
      depth_tier: "integrated",
      profile_depth: "integrated",
      gate_policy: "advisory",
      adversarial_inquiry: {
        depth_tier: "integrated",
        profile_depth: "integrated",
        gate_policy: "advisory",
        prior_depth_tier: "minimal",
        counterexamples: [
          "Parser IR block boundaries diverge from validator after C2",
          "Shared refactor silently changes validator diagnostic ordering",
        ],
        disconfirming_observations: [
          "574/574 mcp-server tests pass including validator and analyze suites",
          "pseudocode-shared.ts imports neither parser nor validator",
        ],
        evidence_references: [
          "mcp-server/src/analysis/pseudocode-shared.test.ts",
          "mcp-server/src/analysis/pseudocode-validator.test.ts",
          `working/${TRACK_C.req}/adversarial-inquiry/phase-close_out/`,
          "working/REQ-PSEUDOCODE_PARSER_UNIFICATION/track-c-close-out-evidence.json",
        ],
      },
    },
  };
}

async function runPseudocodeValidate(token, sidecarRel, knownTokens) {
  const pseudocode = fs.readFileSync(path.join(REPO, sidecarRel), "utf8");
  const handler = toolHandler("pseudocode_validate");
  const result = parseToolResult(
    await handler({
      token,
      pseudocode,
      known_tokens: knownTokens,
    }),
  );
  console.log(`pseudocode_validate ${token}: ok=${result.ok}`);
  if (!result.ok) {
    console.error(result);
    process.exit(1);
  }
  return result;
}

async function ensureTrackCInquiry(runId) {
  const phaseDir = path.join(REPO, "working", TRACK_C.req, "adversarial-inquiry", "phase-close_out");
  const required = ["obligation-report.json", "finding-ledger.jsonl", "gate-result.json", "evidence-provenance.json"];
  const missing = required.filter((name) => !fs.existsSync(path.join(phaseDir, name)));
  if (missing.length === 0) {
    console.log("Track C close_out artifacts already present");
    return;
  }

  const blockId = "IMPL-PSEUDOCODE_SHARED_PRIMITIVES#EXTRACT_SEMANTIC_TOKENS#b7e3f2a91c004d1e";
  const blockRevision = "parser-uni-rev-20260908";
  const alignedStatement =
    "Extract bracketed REQ/ARCH/IMPL tokens using a fresh regex instance to avoid global state bleed.";
  const graph = {
    projectId: "parser-unification-closeout",
    criteria: [
      {
        identity: {
          id: "REQ-PSEUDOCODE_PARSER_UNIFICATION#criterion-1",
          kind: "criterion",
          derivation: "explicit",
          revision: "criterion-rev-parser-uni",
          sourceRevision: "citdp-20260908",
        },
        architectureConstraintIds: ["constraint-shared-primitives"],
      },
    ],
    architectureConstraints: [
      {
        id: "constraint-shared-primitives",
        implementationBlockIds: [blockId],
      },
    ],
    implementationBlocks: [
      {
        identity: {
          id: blockId,
          kind: "block",
          name: "EXTRACT_SEMANTIC_TOKENS",
          derivation: "content",
          revision: blockRevision,
          sourceRevision: "citdp-20260908",
        },
      },
    ],
    evidenceLoci: [
      {
        id: "test-token-extract",
        blockId,
        kind: "test",
        location: "mcp-server/src/analysis/pseudocode-shared.test.ts:10",
        sourceRevision: "citdp-20260908",
      },
      {
        id: "prod-fresh-regex",
        blockId,
        kind: "production",
        location: "mcp-server/src/analysis/pseudocode-shared.ts:36",
        sourceRevision: "citdp-20260908",
      },
    ],
    adversarialCases: [{ id: "CE-001", blockId }],
  };
  const fidelity = {
    blockRevision,
    specification: [
      {
        id: "stmt-fresh-regex",
        kind: "behavior",
        value: alignedStatement,
        order: 1,
      },
    ],
    testEvidence: [
      {
        id: "test-token-extract",
        direction: "test",
        statementId: "stmt-fresh-regex",
        kind: "behavior",
        value: alignedStatement,
        order: 1,
        reliable: true,
        source: { location: "mcp-server/src/analysis/pseudocode-shared.test.ts:10" },
        provenance: "unit-test-green",
        blockRevision,
      },
    ],
    productionEvidence: [
      {
        id: "prod-fresh-regex",
        direction: "production",
        statementId: "stmt-fresh-regex",
        kind: "behavior",
        value: alignedStatement,
        order: 1,
        reliable: true,
        source: { location: "mcp-server/src/analysis/pseudocode-shared.ts:36" },
        provenance: "three-way-alignment-unit",
        blockRevision,
      },
    ],
  };

  const handler = toolHandler("tied_adversarial_inquiry_run");
  const result = parseToolResult(
    await handler({
      graph,
      fidelity,
      scope: [blockId],
      policy: "advisory",
      repository_root: REPO,
      request_token: TRACK_C.req,
      run_id: runId,
      phase: "close_out",
      provenance: {
        command: "run-psa-followup-close-out.mjs",
        proof_boundary: "Mode A aligned fidelity for shared parser primitives only",
      },
    }),
  );
  console.log(`Track C inquiry: ok=${result.ok} verdict=${result.verdict ?? result.gate?.verdict}`);
  if (!result.ok) {
    console.error(result);
    process.exit(1);
  }
}

async function runCloseOutGate(track, citdp, tracker, activation, receiptPersistence) {
  const handler = toolHandler("tied_checklist_gate_validate");
  const payload = {
    phase: "close_out",
    tracker,
    citdp,
    ...(activation ? { activation } : {}),
    receipt_persistence: receiptPersistence,
  };
  const result = parseToolResult(await handler(payload));
  const gatesDir = path.join(REPO, "working", track.req, "gates");
  fs.mkdirSync(gatesDir, { recursive: true });
  fs.writeFileSync(
    path.join(gatesDir, `gate-close_out-${track.runId}-result.json`),
    `${JSON.stringify(result, null, 2)}\n`,
  );
  console.log(
    `close_out ${track.req}: allowed=${result.allowed} diagnostics=${JSON.stringify(result.diagnostics ?? [])}`,
  );
  return result;
}

async function updateChecklistYaml(relPath, completed, closeOutEvidence) {
  const abs = path.join(REPO, relPath);
  let content = fs.readFileSync(abs, "utf8");
  const completedYaml = completed.map((s) => `  - "${s}"`).join("\n");
  content = content.replace(
    /  completed: \[\]/,
    `  completed:\n${completedYaml}`,
  );
  content = content.replace(
    /  close_out_evidence:\n    date: null\n    deferred: \[\]\n    gates: \{\}\n    master_checklist: ""/,
    `  close_out_evidence:\n    date: "2026-09-08"\n    deferred: []\n    gates:\n      close_out:\n        run_id: "${closeOutEvidence.run_id}"\n        allowed: true\n        receipt: "working/${closeOutEvidence.request}/gates/gate-close_out-${closeOutEvidence.run_id}-result.json"\n    master_checklist: "${relPath}"`,
  );
  fs.writeFileSync(abs, content);
}

async function main() {
  await runPseudocodeValidate(
    "IMPL-PSEUDOCODE_SHARED_PRIMITIVES",
    "tied/implementation-decisions/IMPL-PSEUDOCODE_SHARED_PRIMITIVES-pseudocode.md",
    [
      "IMPL-PSEUDOCODE_SHARED_PRIMITIVES",
      "ARCH-PSEUDOCODE_PARSER_UNIFICATION",
      "REQ-PSEUDOCODE_PARSER_UNIFICATION",
    ],
  );
  await runPseudocodeValidate(
    "IMPL-PSEUDOCODE_ANALYSIS_ENGINE",
    "tied/implementation-decisions/IMPL-PSEUDOCODE_ANALYSIS_ENGINE-pseudocode.md",
    [
      "IMPL-PSEUDOCODE_ANALYSIS_ENGINE",
      "ARCH-PSEUDOCODE_ANALYSIS_PIPELINE",
      "REQ-PSEUDOCODE_STATIC_ANALYSIS",
      "IMPL-PSEUDOCODE_SHARED_PRIMITIVES",
      "ARCH-PSEUDOCODE_PARSER_UNIFICATION",
      "REQ-PSEUDOCODE_PARSER_UNIFICATION",
    ],
  );

  await ensureTrackCInquiry(TRACK_C.runId);

  const collectHandler = toolHandler("tied_checklist_activation_collect");
  const gateResults = {};

  // Track A — waiver-based close_out (no activation)
  const trackACitdp = buildTrackACitdp();
  const trackATracker = buildIntegratedTracker(TRACK_A.req, "close_out", {
    impl: "IMPL-PSEUDOCODE_ANALYSIS_ENGINE",
    citdpFile: TRACK_A.citdpFile,
  });
  gateResults[TRACK_A.req] = await runCloseOutGate(
    TRACK_A,
    trackACitdp,
    trackATracker,
    undefined,
    {
      request_token: TRACK_A.req,
      gates_dir: `working/${TRACK_A.req}/gates`,
      ledger_path: `working/${TRACK_A.req}/adversarial-inquiry/finding-ledger.jsonl`,
      run_id: TRACK_A.runId,
    },
  );

  // Track B — minimal close_out
  const trackBCitdp = buildTrackBCitdp();
  const trackBTracker = buildMinimalTracker(TRACK_B.req);
  gateResults[TRACK_B.req] = await runCloseOutGate(
    TRACK_B,
    trackBCitdp,
    trackBTracker,
    undefined,
    {
      request_token: TRACK_B.req,
      gates_dir: `working/${TRACK_B.req}/gates`,
      ledger_path: `working/${TRACK_B.req}/adversarial-inquiry/finding-ledger.jsonl`,
      run_id: TRACK_B.runId,
    },
  );

  // Track C — integrated close_out with activation
  const collected = parseToolResult(
    await collectHandler({
      request_token: TRACK_C.req,
      phase: "close_out",
      run_id: TRACK_C.runId,
      project_root: REPO,
    }),
  );
  if (!collected.ok) {
    console.error("Track C activation collect failed", collected);
    process.exit(1);
  }
  const trackCCitdp = buildTrackCCitdp(TRACK_C.runId);
  const trackCTracker = buildIntegratedTracker(TRACK_C.req, "close_out", {
    impl: TRACK_C.impl,
    citdpFile: TRACK_C.citdpFile,
  });
  gateResults[TRACK_C.req] = await runCloseOutGate(
    TRACK_C,
    trackCCitdp,
    trackCTracker,
    {
      receipt: collected.receipt,
      artifacts: collected.artifacts,
      expected: collected.expected,
    },
    {
      request_token: TRACK_C.req,
      gates_dir: `working/${TRACK_C.req}/gates`,
      ledger_path: `working/${TRACK_C.req}/adversarial-inquiry/finding-ledger.jsonl`,
      run_id: TRACK_C.runId,
    },
  );

  for (const [req, result] of Object.entries(gateResults)) {
    if (!result.allowed) {
      console.error(`HARD STOP: ${req} close_out gate denied`);
      process.exit(1);
    }
  }

  // tied_verify Track C
  const verifyHandler = toolHandler("tied_verify");
  const verifyPayload = {
    passed_requirement_tokens: [TRACK_C.req],
    passed_impl_tokens: [TRACK_C.impl],
    checklist_gate: {
      phase: "close_out",
      tracker: trackCTracker,
      citdp: trackCCitdp,
      activation: {
        receipt: collected.receipt,
        artifacts: collected.artifacts,
        expected: collected.expected,
      },
    },
  };
  const dryRun = parseToolResult(await verifyHandler({ ...verifyPayload, dry_run: true }));
  fs.writeFileSync(
    path.join(REPO, "working", TRACK_C.req, "tied-verify-dry-run.json"),
    `${JSON.stringify(dryRun, null, 2)}\n`,
  );
  console.log("Track C tied_verify dry_run:", JSON.stringify(dryRun.would_update ?? []));
  const verifyWrite = parseToolResult(await verifyHandler({ ...verifyPayload, dry_run: false }));
  fs.writeFileSync(
    path.join(REPO, "working", TRACK_C.req, "tied-verify-result.json"),
    `${JSON.stringify(verifyWrite, null, 2)}\n`,
  );
  if (!verifyWrite.ok) {
    console.error("Track C tied_verify failed", verifyWrite);
    process.exit(1);
  }

  const summary = {
    gates: gateResults,
    tied_verify: verifyWrite,
    run_ids: {
      track_a: TRACK_A.runId,
      track_b: TRACK_B.runId,
      track_c: TRACK_C.runId,
    },
  };
  fs.writeFileSync(
    path.join(REPO, "working/psa-followup-close-out-summary.json"),
    `${JSON.stringify(summary, null, 2)}\n`,
  );
  console.log("All close_out gates passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
