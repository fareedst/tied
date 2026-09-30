/**
 * [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [ARCH-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY]
 * [REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
 * W4: HOOK_CHECKLIST_GATE_VALIDATE + standalone diagnostic MCP tool.
 */

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { z } from "zod";
import type { AdversarialDepth, GatePhase } from "../checklist-validator.js";
import {
  derivePreGateTargetSlugs,
  evaluatePreGateTargetSlug,
  extractGateEvidenceState,
  resolveChecklistEvidenceSufficiencyConfig,
  runChecklistEvidenceSufficiencyPreGate,
  type JevDecideFn,
  type PreGateDisposition,
} from "../jev/checklist-evidence-sufficiency.js";
import { textContent } from "../types.js";
import { getBasePath } from "../yaml-loader.js";

let decideFnForTests: JevDecideFn | undefined;

/** Test-only injection for mocked Jev in MCP composition tests. */
export function setChecklistEvidenceSufficiencyDecideFnForTests(fn: JevDecideFn | undefined): void {
  decideFnForTests = fn;
}

function resolveProjectRoot(projectRoot?: string): string {
  return projectRoot ? path.resolve(projectRoot) : path.resolve(getBasePath(), "..");
}

function loadTracker(input: {
  tracker?: Record<string, unknown>;
  tracker_path?: string;
  projectRoot: string;
}): Record<string, unknown> {
  if (input.tracker_path) {
    const trackerAbsolute = path.isAbsolute(input.tracker_path)
      ? input.tracker_path
      : path.join(input.projectRoot, input.tracker_path);
    return yaml.load(fs.readFileSync(trackerAbsolute, "utf8")) as Record<string, unknown>;
  }
  if (input.tracker) return input.tracker;
  throw new Error("missing tracker or tracker_path");
}

// [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] HOOK_CHECKLIST_GATE_VALIDATE
export async function hookChecklistGateEvidenceSufficiencyPreGate(input: {
  projectRoot: string;
  phase: GatePhase;
  tracker: unknown;
  citdp: unknown;
  requiredStepSlugs?: readonly string[];
  env?: NodeJS.ProcessEnv;
  decideFn?: JevDecideFn;
}): Promise<PreGateDisposition | null> {
  const pre = await runChecklistEvidenceSufficiencyPreGate({
    projectRoot: input.projectRoot,
    phase: input.phase,
    tracker: input.tracker,
    citdp: input.citdp,
    requiredStepSlugs: input.requiredStepSlugs,
    env: input.env,
    decideFn: input.decideFn ?? decideFnForTests,
  });
  if (!pre.ok) return pre.disposition;
  return null;
}

export type ChecklistEvidenceSufficiencyDiagnosticResult = {
  ok: boolean;
  enabled: boolean;
  phase: GatePhase;
  target_slugs: string[];
  results: Array<{
    slug: string;
    disposition?: string;
    pre_gate_ok: boolean;
    reasons: string[];
    remediation_hints: string[];
    jev_observation?: Record<string, unknown>;
    skipped?: boolean;
  }>;
};

// [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] standalone read-only diagnostic
export async function runChecklistEvidenceSufficiencyDiagnostic(input: {
  projectRoot: string;
  phase: GatePhase;
  tracker: unknown;
  citdp?: unknown;
  depthTier?: AdversarialDepth;
  requiredStepSlugs?: readonly string[];
  env?: NodeJS.ProcessEnv;
  decideFn?: JevDecideFn;
}): Promise<ChecklistEvidenceSufficiencyDiagnosticResult> {
  const env = input.env ?? process.env;
  const config = resolveChecklistEvidenceSufficiencyConfig(input.projectRoot, env);
  const slugs = derivePreGateTargetSlugs({
    citdp: input.citdp,
    depthTier: input.depthTier,
    phase: input.phase,
    requiredStepSlugs: input.requiredStepSlugs,
  });

  if (!config.enabled) {
    return {
      ok: true,
      enabled: false,
      phase: input.phase,
      target_slugs: slugs,
      results: slugs.map((slug) => ({
        slug,
        pre_gate_ok: true,
        reasons: [],
        remediation_hints: [],
        skipped: true,
      })),
    };
  }

  const decideFn = input.decideFn ?? decideFnForTests;
  const results: ChecklistEvidenceSufficiencyDiagnosticResult["results"] = [];
  let aggregateOk = true;

  for (const slug of slugs) {
    const evidenceState = extractGateEvidenceState({ tracker: input.tracker, slug });
    const evaluation = await evaluatePreGateTargetSlug({
      featureEnabled: true,
      phase: input.phase,
      tracker: input.tracker,
      slug,
      decideFn,
    });
    if (!evaluation.ok) {
      aggregateOk = false;
      results.push({
        slug,
        disposition: evidenceState?.disposition,
        pre_gate_ok: false,
        reasons: evaluation.reasons,
        remediation_hints: evaluation.remediation_hints,
      });
    } else {
      results.push({
        slug,
        disposition: evidenceState?.disposition,
        pre_gate_ok: true,
        reasons: [],
        remediation_hints: [],
        skipped: evaluation.jev_fail_open ? true : undefined,
        jev_observation: evaluation.jev_fail_open ? { jev_fail_open: true } : undefined,
      });
    }
  }

  return {
    ok: aggregateOk,
    enabled: true,
    phase: input.phase,
    target_slugs: slugs,
    results,
  };
}

const gatePhaseSchema = z.enum(["pre_implementation", "verification", "close_out"]);

export const checklistEvidenceSufficiencyTools = [
  {
    name: "tied_jev_checklist_evidence_sufficiency",
    config: {
      description:
        "[REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] Read-only Blueprint C evidence sufficiency check for gate target slugs. Never emits gate_receipt or workflow allowed.",
      inputSchema: z.object({
        project_root: z.string().optional(),
        tracker: z.record(z.unknown()).optional(),
        tracker_path: z.string().optional(),
        phase: gatePhaseSchema,
        required_step_slugs: z.array(z.string()).optional(),
        citdp: z.record(z.unknown()).optional(),
        depth_tier: z.enum(["minimal", "integrated", "strict_candidate"]).optional(),
      }),
    },
    handler: async (args: {
      project_root?: string;
      tracker?: Record<string, unknown>;
      tracker_path?: string;
      phase: GatePhase;
      required_step_slugs?: string[];
      citdp?: Record<string, unknown>;
      depth_tier?: AdversarialDepth;
    }) => {
      try {
        const projectRoot = resolveProjectRoot(args.project_root);
        const tracker = loadTracker({
          tracker: args.tracker,
          tracker_path: args.tracker_path,
          projectRoot,
        });
        const payload = await runChecklistEvidenceSufficiencyDiagnostic({
          projectRoot,
          phase: args.phase,
          tracker,
          citdp: args.citdp,
          depthTier: args.depth_tier,
          requiredStepSlugs: args.required_step_slugs,
        });
        return textContent(JSON.stringify(payload, null, 2));
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        return textContent(JSON.stringify({ ok: false, error: msg }, null, 2));
      }
    },
  },
];
