/**
 * [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] [ARCH-PSEUDOCODE_FLEET_MIGRATION_GOVERNANCE]
 * [REQ-REQUEST_EVIDENCE_ENVELOPE]
 * How: Assert Phase 5 FEAT-spawned checklist YAML carries integrated depth, envelope_path, and gate phases.
 */
import { execFileSync } from "node:child_process";
import fs from "node:fs";

const REQUIRED_GATE_PHASES = ["pre_implementation", "verification", "close_out"];
const REQUIRED_INQUIRY_ARTIFACTS = [
  "evidence-provenance.json",
  "finding-ledger.jsonl",
  "gate-result.json",
  "obligation-report.json",
];

/**
 * @param {string} checklistPath
 * @returns {Record<string, unknown>}
 */
export function loadChecklistYamlAsJson(checklistPath) {
  if (!fs.existsSync(checklistPath)) {
    throw new Error(`checklist not found: ${checklistPath}`);
  }
  const json = execFileSync("yq", ["eval", "-o=json", ".", checklistPath], {
    encoding: "utf8",
    maxBuffer: 8 * 1024 * 1024,
  });
  return JSON.parse(json);
}

/**
 * @param {unknown} checklist
 * @returns {{ ok: boolean; violations: { code: string; message: string }[] }}
 */
export function validateFeatSpawnedEnvelopePolicyFields(checklist) {
  /** @type {{ code: string; message: string }[]} */
  const violations = [];
  const execution = checklist?.execution_evidence;
  if (!execution || typeof execution !== "object") {
    violations.push({ code: "missing_execution_evidence", message: "execution_evidence block required" });
    return { ok: false, violations };
  }

  const envelopePath = execution.envelope_path;
  if (typeof envelopePath !== "string" || !envelopePath.includes("request-evidence-envelope.v1.json")) {
    violations.push({
      code: "missing_envelope_path",
      message: "execution_evidence.envelope_path must point at request-evidence-envelope.v1.json",
    });
  } else if (!envelopePath.includes("working/") || !envelopePath.includes("evidence/")) {
    violations.push({
      code: "envelope_path_layout",
      message: "envelope_path must follow working/{REQ-TOKEN}/evidence/ client copy pattern",
    });
  }

  const operator = execution.operator_evidence;
  if (!operator || typeof operator !== "object") {
    violations.push({ code: "missing_operator_evidence", message: "execution_evidence.operator_evidence required" });
  } else {
    if (operator.depth_tier !== "integrated") {
      violations.push({
        code: "depth_tier_not_integrated",
        message: `operator_evidence.depth_tier must be integrated (got ${String(operator.depth_tier)})`,
      });
    }
    if (typeof operator.gate_policy !== "string" || !operator.gate_policy.trim()) {
      violations.push({
        code: "missing_gate_policy",
        message: "operator_evidence.gate_policy required (advisory default unless sponsor tightens)",
      });
    }
    const pilot = operator.integrated_pilot_template;
    if (typeof pilot !== "string" || !pilot.includes("tied_checklist_activation_collect")) {
      violations.push({
        code: "missing_integrated_pilot_template",
        message: "operator_evidence.integrated_pilot_template must document collect + gate sequence",
      });
    }
  }

  const gateContract = checklist?.gate_contract;
  if (!gateContract || typeof gateContract !== "object") {
    violations.push({ code: "missing_gate_contract", message: "gate_contract block required" });
  } else {
    const phases = Array.isArray(gateContract.phases) ? gateContract.phases : [];
    for (const phase of REQUIRED_GATE_PHASES) {
      if (!phases.includes(phase)) {
        violations.push({
          code: "missing_gate_phase",
          message: `gate_contract.phases must include ${phase}`,
        });
      }
    }
    const requiredArtifacts = Array.isArray(gateContract.required_artifacts)
      ? gateContract.required_artifacts
      : [];
    for (const artifact of REQUIRED_INQUIRY_ARTIFACTS) {
      if (!requiredArtifacts.includes(artifact)) {
        violations.push({
          code: "missing_inquiry_artifact",
          message: `gate_contract.required_artifacts must include ${artifact}`,
        });
      }
    }
  }

  return { ok: violations.length === 0, violations };
}

/**
 * @param {string} checklistPath
 */
export function validateFeatSpawnedEnvelopePolicy(checklistPath) {
  const checklist = loadChecklistYamlAsJson(checklistPath);
  return validateFeatSpawnedEnvelopePolicyFields(checklist);
}
