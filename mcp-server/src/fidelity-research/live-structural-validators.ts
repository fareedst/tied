/**
 * [IMPL-EVIDENCE_CHAIN_PROFILE] [ARCH-EVIDENCE_CHAIN_PROFILE] [REQ-EVIDENCE_CHAIN_PROFILE]
 * Live structural validator callbacks for evidence chain profile generation.
 */
import { validateBindingInventory } from "../analysis/binding-inventory.js";
import { validateEssencePseudocode } from "../analysis/pseudocode-validator.js";
import { runScopedAnalysis } from "../analysis/scoped-analysis.js";
import { validateConsistency } from "../consistency-validator.js";
import { loadDetail } from "../detail-loader.js";
import {
  buildImplementationGraph,
  buildRequirementGraph,
  findCycles,
} from "../dependency-graph.js";
import { validateTestAdequacyPlan } from "../quality-adequacy.js";
import { listTokens } from "../yaml-loader.js";
import type { StructuralAnalysisInput } from "./structural-analysis.js";

export type LiveStructuralValidatorScope = {
  requirement_tokens?: string[];
  architecture_tokens?: string[];
  implementation_tokens?: string[];
  impl_tokens_for_pseudocode?: string[];
  binding_rows?: Record<string, unknown>[];
  quality_plan?: { selected_profiles: string[]; checks: Record<string, unknown>[] };
  config_path?: string;
  ignore_file?: string;
  roots?: string[];
};

function parseBindingRows(rows: Record<string, unknown>[] | undefined) {
  return (rows ?? []).map((row, index) => {
    const id = typeof row.id === "string" ? row.id : `binding-${index + 1}`;
    return {
      id,
      trigger: String(row.trigger ?? ""),
      callee: String(row.callee ?? ""),
      arguments: String(row.arguments ?? ""),
      effect: String(row.effect ?? ""),
      ordering: String(row.ordering ?? ""),
      failure_behavior: String(row.failure_behavior ?? ""),
      composition_test: typeof row.composition_test === "string" ? row.composition_test : undefined,
      e2e_only: typeof row.e2e_only === "boolean" ? row.e2e_only : undefined,
      e2e_only_reason: typeof row.e2e_only_reason === "string" ? row.e2e_only_reason : undefined,
    };
  });
}

// [IMPL-EVIDENCE_CHAIN_PROFILE] [ARCH-EVIDENCE_CHAIN_PROFILE] [REQ-EVIDENCE_CHAIN_PROFILE]
// How: Build live validator callbacks from existing MCP analysis modules without mutating project YAML.
export function createLiveStructuralValidators(
  scope?: LiveStructuralValidatorScope,
): StructuralAnalysisInput["validators"] {
  const knownTokens = listTokens("semantic-tokens");
  const traceabilityArgs = {
    mode: "traceability_gap_report" as const,
    roots: scope?.roots,
    config_path: scope?.config_path,
    ignore_file: scope?.ignore_file,
    traceability_requirement_tokens: scope?.requirement_tokens,
    traceability_implementation_tokens: scope?.implementation_tokens,
  };

  return {
    tiedConsistency: () => {
      const report = validateConsistency({
        include_detail_files: true,
        include_pseudocode: true,
        require_detail_record: true,
      });
      return { ok: report.ok };
    },
    pseudocode: (token: string) => {
      if (!token.startsWith("IMPL-")) return { ok: true };
      try {
        const detail = loadDetail(token) as { essence_pseudocode?: string } | null;
        const pseudocode = detail?.essence_pseudocode;
        if (typeof pseudocode !== "string" || !pseudocode.trim()) {
          return { ok: false };
        }
        const report = validateEssencePseudocode({
          token,
          pseudocode,
          known_tokens: knownTokens,
        });
        return { ok: report.ok === true };
      } catch {
        return { ok: false };
      }
    },
    traceability: () => {
      try {
        const result = runScopedAnalysis(traceabilityArgs);
        const exitCode = result.traceability_gap_report?.exit_policy?.suggested_exit_code;
        return { ok: result.ok === true && exitCode === 0 };
      } catch {
        return { ok: false };
      }
    },
    cycles: () => {
      const reqCycles = findCycles(buildRequirementGraph());
      const implCycles = findCycles(buildImplementationGraph());
      return { ok: reqCycles.length === 0 && implCycles.length === 0 };
    },
    bindingInventory: () => {
      const report = validateBindingInventory(parseBindingRows(scope?.binding_rows));
      return { ok: report.ok };
    },
    testAdequacy: () => {
      const plan = scope?.quality_plan ?? { selected_profiles: ["baseline-functional"], checks: [] };
      const report = validateTestAdequacyPlan({
        selected_profiles: plan.selected_profiles,
        checks: plan.checks as Parameters<typeof validateTestAdequacyPlan>[0]["checks"],
      });
      return { ok: report.ok };
    },
  };
}
