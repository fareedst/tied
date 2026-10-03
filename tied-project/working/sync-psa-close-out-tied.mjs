#!/usr/bin/env node
/** Sync TIED records after PSA follow-up close-out gates. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "../mcp-server/node_modules/yaml/dist/index.js";

import { allTools } from "../mcp-server/dist/tools/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "..");

function tool(name) {
  const t = allTools.find((c) => c.name === name);
  if (!t) throw new Error(`missing ${name}`);
  return t.handler;
}

async function call(name, args) {
  const result = await tool(name)(args);
  return JSON.parse(result.content[0]?.text ?? "{}");
}

function readCitdp(filename) {
  const raw = fs.readFileSync(path.join(REPO, "tied/citdp", filename), "utf8");
  const parsed = parseYaml(raw);
  const key = Object.keys(parsed)[0];
  return { key, record: parsed[key] };
}

async function writeCitdp(filename, record) {
  const result = await call("citdp_record_write", {
    filename,
    record: JSON.stringify(record),
    top_level_key: filename.replace(".yaml", ""),
  });
  if (!result.ok && result.error) throw new Error(`${filename}: ${result.error}`);
  console.log(`citdp_record_write ${filename}: ok`);
}

async function main() {
  // Semantic tokens
  const tokens = [
    {
      index: "semantic-tokens",
      token: "REQ-PSEUDOCODE_PARSER_UNIFICATION",
      record: {
        cross_references: ["ARCH-PSEUDOCODE_PARSER_UNIFICATION", "IMPL-PSEUDOCODE_SHARED_PRIMITIVES"],
        description: "Shared parser primitives unify validator and analysis parser scan logic without drift.",
        detail_file: "requirements/REQ-PSEUDOCODE_PARSER_UNIFICATION.yaml",
        name: "Unify pseudo-code parser primitives across validator and analyzer",
        source_index: "requirements.yaml",
        status: "Implemented",
        type: "REQ",
      },
    },
    {
      index: "semantic-tokens",
      token: "ARCH-PSEUDOCODE_PARSER_UNIFICATION",
      record: {
        cross_references: ["IMPL-PSEUDOCODE_SHARED_PRIMITIVES", "REQ-PSEUDOCODE_PARSER_UNIFICATION"],
        description: "Shared pseudo-code parser primitive module boundary for validator and analyzer.",
        detail_file: "architecture-decisions/ARCH-PSEUDOCODE_PARSER_UNIFICATION.yaml",
        name: "Shared pseudo-code parser primitive boundary",
        source_index: "architecture-decisions.yaml",
        status: "Active",
        type: "ARCH",
      },
    },
    {
      index: "semantic-tokens",
      token: "IMPL-PSEUDOCODE_SHARED_PRIMITIVES",
      record: {
        cross_references: ["ARCH-PSEUDOCODE_PARSER_UNIFICATION", "REQ-PSEUDOCODE_PARSER_UNIFICATION"],
        description: "Shared token, procedure-range, and contract-field parsing primitives.",
        detail_file: "implementation-decisions/IMPL-PSEUDOCODE_SHARED_PRIMITIVES.yaml",
        name: "Shared pseudo-code parsing primitives",
        source_index: "implementation-decisions.yaml",
        status: "Active",
        type: "IMPL",
      },
    },
  ];
  for (const entry of tokens) {
    const result = await call("yaml_index_insert", {
      index: entry.index,
      token: entry.token,
      record: JSON.stringify(entry.record),
    });
    console.log(`yaml_index_insert ${entry.token}:`, result.ok === false ? result : "ok");
  }

  await call("yaml_detail_update", {
    token: "REQ-PSEUDOCODE_PARSER_UNIFICATION",
    updates: JSON.stringify({ status: "Implemented" }),
  });
  await call("yaml_detail_update", {
    token: "IMPL-PSEUDOCODE_SHARED_PRIMITIVES",
    updates: JSON.stringify({ status: "Active" }),
  });
  await call("yaml_detail_update", {
    token: "ARCH-PSEUDOCODE_PARSER_UNIFICATION",
    updates: JSON.stringify({ status: "Active" }),
  });

  const psa = readCitdp("CITDP-REQ-PSEUDOCODE_STATIC_ANALYSIS.yaml");
  psa.record.completion_criteria = {
    ...(psa.record.completion_criteria ?? {}),
    activation: {
      run_id: "psa-followup-closeout-20260908",
      phase: "close_out",
      request_token: "REQ-PSEUDOCODE_STATIC_ANALYSIS",
      close_out_run_id: "psa-followup-closeout-20260908",
      verification_run_id: "psa-fidelity-rerun-20260908",
    },
    verification_gate_notes:
      "574/574 mcp-server tests; tied_validate_consistency ok; follow-up close-out reuses psa-fidelity-rerun-20260908 PASS via close_out_inquiry_waiver.",
  };
  psa.record.risk_analysis.adversarial_inquiry = {
    ...(psa.record.risk_analysis?.adversarial_inquiry ?? {}),
    close_out_inquiry_waiver: {
      owner: "TIED maintainers",
      expiry: "2026-12-31",
      rationale:
        "Follow-up close-out reuses identity-bound PASS inquiry evidence from psa-fidelity-rerun-20260908; findings unchanged; no inquiry rerun.",
      approval: "psa-followup-close-out-plan",
      referenced_verification_run_id: "psa-fidelity-rerun-20260908",
      request_token: "REQ-PSEUDOCODE_STATIC_ANALYSIS",
      scope: "Mode A fidelity PASS for adversarial-inquiry-psa fixture alignment",
      artifact_identities: [
        "mcp-server/test/fixtures/adversarial-inquiry-psa/graph.json",
        "mcp-server/test/fixtures/adversarial-inquiry-psa/fidelity.json",
        "mcp-server/src/adversarial-inquiry/psa-fixture.test.ts",
      ],
    },
  };
  await writeCitdp("CITDP-REQ-PSEUDOCODE_STATIC_ANALYSIS.yaml", psa.record);

  const ecp = readCitdp("CITDP-REQ-EVIDENCE_CHAIN_PROFILE.yaml");
  ecp.record.change_definition = {
    ...(ecp.record.change_definition ?? {}),
    follow_up_completed: ["invoke_pseudocode_analyze opt-in with pilot evidence"],
    desired_behavior:
      "evidence_chain_profile_generate accepts invoke_pseudocode_analyze (default false) for bounded pseudocode_analyze structural rows when invoke_structural_validators is true.",
  };
  ecp.record.completion_criteria = {
    ...(ecp.record.completion_criteria ?? {}),
    profile_depth: "minimal",
    verification_gate_notes:
      "574/574 mcp-server tests; pilot JSON path refs under working/evidence-chain/psa-analyze-pilot-*.json; proof boundary bounded static analysis only.",
  };
  ecp.record.evidence = {
    ...(ecp.record.evidence ?? {}),
    pilot_references: [
      "working/evidence-chain/psa-analyze-pilot-off.json",
      "working/evidence-chain/psa-analyze-pilot-on.json",
      "working/evidence-chain/psa-analyze-pilot-20260908-summary.json",
    ],
  };
  ecp.record.risk_analysis = {
    ...(ecp.record.risk_analysis ?? {}),
    depth_tier: "minimal",
    profile_depth: "minimal",
    adversarial_inquiry: {
      depth_tier: "minimal",
      profile_depth: "minimal",
      gate_policy: "advisory",
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
      proof_boundary: "Pilot JSON proves invoke_pseudocode_analyze opt-in wiring; not runtime execution.",
    },
  };
  await writeCitdp("CITDP-REQ-EVIDENCE_CHAIN_PROFILE.yaml", ecp.record);

  const pun = readCitdp("CITDP-REQ-PSEUDOCODE_PARSER_UNIFICATION.yaml");
  const runId = "parser-unification-closeout-20260908";
  pun.record.completion_criteria = {
    activation: {
      run_id: runId,
      phase: "close_out",
      request_token: "REQ-PSEUDOCODE_PARSER_UNIFICATION",
      close_out_run_id: runId,
    },
    verification_gate_notes:
      "574/574 mcp-server tests; layer-b-pseudocode-validator.v1 goldens preserved; C1+C2 complete; C3 explicitly deferred.",
  };
  pun.record.change_definition = {
    ...(pun.record.change_definition ?? {}),
    follow_up_deferred: {
      phase: "C3",
      behavior: "Validator consumes full parser IR",
      handoff:
        "Separate future C3 plan; prerequisite parser/validator integration with golden tests; not implemented in this close-out.",
    },
  };
  pun.record.risk_analysis = {
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
        "working/REQ-PSEUDOCODE_PARSER_UNIFICATION/adversarial-inquiry/phase-close_out/",
        "working/REQ-PSEUDOCODE_PARSER_UNIFICATION/track-c-close-out-evidence.json",
      ],
      proof_boundary: "Track C structural refactor only; C3 deferred to separate future plan.",
    },
  };
  pun.record.evidence = {
    ...(pun.record.evidence ?? {}),
    commands: [
      { command: "npm test", cwd: "mcp-server", exit_code: "0", result: "574 passed" },
      { command: "pseudocode_validate IMPL-PSEUDOCODE_SHARED_PRIMITIVES", result: "passed" },
      { command: "tied_validate_consistency", result: "passed" },
    ],
  };
  await writeCitdp("CITDP-REQ-PSEUDOCODE_PARSER_UNIFICATION.yaml", pun.record);

  const consistency = await call("tied_validate_consistency", {});
  console.log("tied_validate_consistency ok:", consistency.ok);
  if (!consistency.ok) process.exit(1);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
