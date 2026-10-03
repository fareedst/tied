/**
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [ARCH-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 * RUN_PLAN_SKILLS_TRIAGE_MCP
 */

import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import type { JevFetch } from "./client.js";
import { resolveJevConfig } from "./client.js";
import {
  runAdversarialTriagePilot,
  type AdversarialTriageCase,
  type AdversarialTriagePilotReport,
} from "./adversarial-triage-pilot.js";
import {
  normalizePlanSkillsRunId,
  resolvePlanSkillsEvidenceDir,
  writeTriagePilotEvidence,
} from "./plan-skills-evidence.js";
import { resolvePlanSkillsConfig, resolvePlanSkillsTimeoutMs } from "./plan-skills-config.js";
import { PLAN_SKILLS_PROOF_BOUNDARY } from "./plan-skills-types.js";
import { isPathUnderProjectWorking, workingPathRelativeToProject } from "../working-root.js";

export const MAX_TRIAGE_CASES = 24;

const triageCaseSchema = z.object({
  id: z.string().min(1).max(128),
  criterion_text: z.string().min(1).max(4000),
  pseudocode_excerpt: z.string().min(1).max(4000),
  test_excerpt: z.string().max(4000).optional(),
  labels: z
    .object({
      criterion_met: z.boolean(),
      spec_gap: z.boolean(),
      test_supports_claim: z.boolean(),
      implementation_drift: z.boolean(),
    })
    .optional(),
});

const casesArraySchema = z.array(triageCaseSchema).min(1).max(MAX_TRIAGE_CASES);

export type RunPlanSkillsTriageMcpInput = {
  projectRoot: string;
  request_token?: string;
  run_id?: string;
  record_evidence?: boolean;
  pre_implementation_gate_passed?: boolean;
  cases?: AdversarialTriageCase[];
  cases_path?: string;
  env?: NodeJS.ProcessEnv;
  fetchImpl?: JevFetch;
};

export type PlanSkillsTriageMcpResult = AdversarialTriagePilotReport & {
  proof_boundary?: string;
  error?: string;
  request_token?: string;
  run_id?: string;
  artifact_relpath?: string;
};

function withTimeoutFetch(fetchImpl: JevFetch, timeoutMs: number): JevFetch {
  return async (input, init) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      return await fetchImpl(input, { ...init, signal: controller.signal });
    } finally {
      clearTimeout(timer);
    }
  };
}

function resolveCasesFromPath(projectRoot: string, casesPath: string): AdversarialTriageCase[] | { error: string } {
  const abs = path.isAbsolute(casesPath)
    ? path.resolve(casesPath)
    : path.resolve(projectRoot, casesPath);
  if (!isPathUnderProjectWorking(projectRoot, abs)) {
    return { error: "cases_path_must_be_under_working" };
  }
  if (!fs.existsSync(abs)) {
    return { error: "cases_path_not_found" };
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(fs.readFileSync(abs, "utf8"));
  } catch {
    return { error: "cases_path_invalid_json" };
  }
  const root = parsed as { cases?: unknown };
  const validated = casesArraySchema.safeParse(root.cases ?? parsed);
  if (!validated.success) {
    return { error: "cases_schema_invalid" };
  }
  return validated.data as AdversarialTriageCase[];
}

export async function runPlanSkillsTriageMcp(
  input: RunPlanSkillsTriageMcpInput,
): Promise<PlanSkillsTriageMcpResult> {
  const proof_boundary = `${PLAN_SKILLS_PROOF_BOUNDARY} Triage pilot is observation-only; never checklist gate proof.`;

  if (!input.pre_implementation_gate_passed) {
    return {
      schema: "adversarial-triage-pilot.v1",
      jev_invoked: false,
      cases: [],
      agreement_rate: null,
      note: "Refused: triage must run only after pre_implementation gate (gate_ordering_violation).",
      proof_boundary,
      error: "gate_ordering_violation",
    };
  }

  let cases: AdversarialTriageCase[];
  if (input.cases !== undefined) {
    const validated = casesArraySchema.safeParse(input.cases);
    if (!validated.success) {
      return {
        schema: "adversarial-triage-pilot.v1",
        jev_invoked: false,
        cases: [],
        agreement_rate: null,
        note: "Invalid inline cases.",
        proof_boundary,
        error: "cases_schema_invalid",
      };
    }
    cases = validated.data as AdversarialTriageCase[];
  } else if (input.cases_path) {
    const loaded = resolveCasesFromPath(input.projectRoot, input.cases_path);
    if ("error" in loaded) {
      return {
        schema: "adversarial-triage-pilot.v1",
        jev_invoked: false,
        cases: [],
        agreement_rate: null,
        note: loaded.error,
        proof_boundary,
        error: loaded.error,
      };
    }
    cases = loaded;
  } else {
    return {
      schema: "adversarial-triage-pilot.v1",
      jev_invoked: false,
      cases: [],
      agreement_rate: null,
      note: "Missing cases or cases_path.",
      proof_boundary,
      error: "missing_cases",
    };
  }

  const env = input.env ?? process.env;
  const cfg = resolvePlanSkillsConfig(input.projectRoot, env);
  const timeout = resolvePlanSkillsTimeoutMs(env);
  const jevCfg = resolveJevConfig(env);

  const report = await runAdversarialTriagePilot(cases, {
    apiKey: cfg.enabled ? jevCfg.apiKey : undefined,
    apiBase: jevCfg.apiBase,
    model: jevCfg.model,
    fetchImpl: withTimeoutFetch(input.fetchImpl ?? globalThis.fetch, timeout.timeout_ms),
  });

  const result: PlanSkillsTriageMcpResult = {
    ...report,
    proof_boundary,
  };

  if (input.record_evidence && input.request_token) {
    const runNorm = normalizePlanSkillsRunId(input.run_id);
    if (typeof runNorm !== "string") {
      return { ...result, error: runNorm.error };
    }
    const written = writeTriagePilotEvidence(
      input.projectRoot,
      input.request_token,
      runNorm,
      result,
    );
    if ("error" in written) {
      return { ...result, error: written.error };
    }
    return {
      ...result,
      request_token: input.request_token,
      run_id: runNorm,
      artifact_relpath: written.artifact_relpath,
    };
  }

  return result;
}

/** Composition helper: gate-ordering guard for build-plan hook tests. */
export function assertTriageGateOrdering(preImplementationGatePassed: boolean): { ok: true } | { ok: false; error: "gate_ordering_violation" } {
  if (!preImplementationGatePassed) {
    return { ok: false, error: "gate_ordering_violation" };
  }
  return { ok: true };
}

export function resolveTriageEvidencePath(
  projectRoot: string,
  requestToken: string,
  runId: string,
): { artifact_relpath: string } | { error: "invalid_request_token" | "unsafe_evidence_path" } {
  const resolved = resolvePlanSkillsEvidenceDir(projectRoot, requestToken, runId);
  if ("error" in resolved) {
    return resolved;
  }
  const artifact_relpath = workingPathRelativeToProject(
    projectRoot,
    requestToken,
    "jev",
    "plan-skills",
    runId,
    "adversarial-triage-pilot.v1.json",
  );
  return { artifact_relpath };
}
