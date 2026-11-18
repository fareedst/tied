/**
 * [IMPL-TIED_AS_OPERATED_BASELINE] [ARCH-TIED_AS_OPERATED_BASELINE] [REQ-TIED_AS_OPERATED_BASELINE]
 */

import path from "node:path";

import type { GatePhase } from "../checklist-validator.js";
import { listChecklistTrackerSteps } from "../checklist-validator.js";
import { validateSnapshotA, validateSnapshotB } from "./snapshot-minimums.js";

export const AS_OPERATED_MODES = ["follow_up_only", "active"] as const;
export type AsOperatedMode = (typeof AS_OPERATED_MODES)[number];

export type AsOperatedBaselineFacet = {
  mode?: AsOperatedMode;
  working_root?: string;
  snapshot_gates?: Array<{ slug?: string; receipt?: string }>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function identityValue(value: unknown): string | undefined {
  if (typeof value === "string" && value.trim()) return value.trim();
  return undefined;
}

// [IMPL-TIED_AS_OPERATED_BASELINE] — How: read tracker.as_operated_baseline section.
export function readAsOperatedBaseline(tracker: unknown): AsOperatedBaselineFacet | undefined {
  if (!isRecord(tracker)) return undefined;
  const section = tracker.as_operated_baseline;
  if (!isRecord(section)) return undefined;
  return section as AsOperatedBaselineFacet;
}

function receiptForSlug(facet: AsOperatedBaselineFacet, slug: string): string | undefined {
  const gates = facet.snapshot_gates;
  if (!Array.isArray(gates)) return undefined;
  for (const gate of gates) {
    if (!isRecord(gate)) continue;
    if (identityValue(gate.slug) === slug) {
      const receipt = gate.receipt;
      return typeof receipt === "string" ? receipt : undefined;
    }
  }
  return undefined;
}

function resolveWorkingRoot(
  facet: AsOperatedBaselineFacet,
  tracker: unknown,
  projectRoot: string,
): string {
  const raw = facet.working_root?.trim();
  if (raw) {
    return path.isAbsolute(raw) ? raw : path.join(projectRoot, raw);
  }
  const token = isRecord(tracker) && isRecord(tracker.execution_evidence)
    ? identityValue((tracker.execution_evidence as Record<string, unknown>).request)
    : undefined;
  if (token) {
    return path.join(projectRoot, "tied-project/working", token, "replacement-discovery");
  }
  return path.join(projectRoot, "tied-project/working/REQ-UNKNOWN/replacement-discovery");
}

function stepCompleted(tracker: unknown, slug: string): boolean {
  for (const step of listChecklistTrackerSteps(tracker)) {
    if (identityValue(step.slug) !== slug) continue;
    return identityValue(step.disposition) === "completed";
  }
  return false;
}

// [IMPL-TIED_AS_OPERATED_BASELINE] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: reject unknown facet modes.
export function validateAsOperatedBaselineFacetShape(tracker: unknown): { ok: boolean; diagnostics: string[] } {
  const facet = readAsOperatedBaseline(tracker);
  if (!facet) return { ok: true, diagnostics: [] };
  const mode = facet.mode ?? "follow_up_only";
  if (!AS_OPERATED_MODES.includes(mode as AsOperatedMode)) {
    return { ok: false, diagnostics: ["invalid_as_operated_mode"] };
  }
  return { ok: true, diagnostics: [] };
}

// [IMPL-TIED_AS_OPERATED_BASELINE] — How: enforce Snapshot-A/B when mode active at checklist progression slugs.
export function validateAsOperatedBaselineProgression(input: {
  tracker: unknown;
  phase: GatePhase;
  projectRoot?: string;
  requiredStepSlugs?: readonly string[];
}): { ok: boolean; diagnostics: string[] } {
  const facet = readAsOperatedBaseline(input.tracker);
  if (!facet) return { ok: true, diagnostics: [] };
  const mode = facet.mode ?? "follow_up_only";
  if (mode === "follow_up_only") return { ok: true, diagnostics: [] };
  if (mode !== "active") {
    return { ok: false, diagnostics: ["invalid_as_operated_mode"] };
  }
  if (input.phase === "pre_implementation") {
    return { ok: true, diagnostics: [] };
  }
  if (!input.projectRoot?.trim()) {
    return { ok: false, diagnostics: ["missing_project_root_for_as_operated_snapshot"] };
  }

  const projectRoot = path.resolve(input.projectRoot);
  const workingRoot = resolveWorkingRoot(facet, input.tracker, projectRoot);
  const diagnostics: string[] = [];

  const needsComposition = input.requiredStepSlugs?.includes("composition-integration")
    || stepCompleted(input.tracker, "composition-integration");
  const needsVerification = input.phase === "verification"
    || input.phase === "close_out"
    || input.requiredStepSlugs?.includes("verification-gate")
    || stepCompleted(input.tracker, "verification-gate");

  if (needsComposition) {
    const receipt = receiptForSlug(facet, "composition-integration");
    const result = validateSnapshotA(workingRoot, projectRoot, receipt);
    if (!result.ok) {
      diagnostics.push(...result.diagnostics);
      if (!result.diagnostics.includes("missing_snapshot_composition_integration")) {
        diagnostics.push("missing_snapshot_composition_integration");
      }
    }
  }

  if (needsVerification) {
    const receipt = receiptForSlug(facet, "verification-gate");
    const result = validateSnapshotB(workingRoot, projectRoot, receipt);
    if (!result.ok) {
      diagnostics.push(...result.diagnostics);
      if (!result.diagnostics.includes("missing_snapshot_pre_verification")) {
        diagnostics.push("missing_snapshot_pre_verification");
      }
    }
  }

  return { ok: diagnostics.length === 0, diagnostics: [...new Set(diagnostics)] };
}