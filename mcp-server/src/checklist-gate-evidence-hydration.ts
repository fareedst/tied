/**
 * [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
 * Auto-hydrate gate evidence from identity-bound activation artifacts at verification/close_out.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

import type { ChecklistGateEvidenceInput, GatePhase } from "./checklist-validator.js";
import { getClientProjectRoot } from "./yaml-loader.js";

const HYDRATION_PHASES = new Set<GatePhase>(["verification", "close_out"]);
const HYDRATION_ARTIFACTS = {
  "evidence-provenance.json": "provenance" as const,
  "gate-result.json": "gateResult" as const,
  "finding-ledger.jsonl": "findingLedger" as const,
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function artifactPath(artifact: unknown, projectRoot: string): string | null {
  if (!isRecord(artifact)) return null;
  const raw = artifact.path;
  if (typeof raw !== "string" || !raw.trim()) return null;
  return path.isAbsolute(raw) ? raw : path.join(projectRoot, raw);
}

export type HydrateGateEvidenceInput = {
  phase: GatePhase;
  activation?: {
    artifacts?: unknown;
  };
  evidence?: ChecklistGateEvidenceInput;
  projectRoot?: string;
};

export type HydrateGateEvidenceResult = {
  evidence: ChecklistGateEvidenceInput;
  hydrated: string[];
  diagnostics: string[];
};

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: load phase inquiry artifacts into gate evidence when activation supplies paths.
export async function hydrateGateEvidenceFromActivation(
  input: HydrateGateEvidenceInput,
): Promise<HydrateGateEvidenceResult> {
  const diagnostics: string[] = [];
  const hydrated: string[] = [];
  const evidence: ChecklistGateEvidenceInput = { ...(input.evidence ?? {}) };

  if (!HYDRATION_PHASES.has(input.phase)) {
    return { evidence, hydrated, diagnostics };
  }

  const artifacts = input.activation?.artifacts;
  if (!isRecord(artifacts)) {
    return { evidence, hydrated, diagnostics };
  }

  const projectRoot = input.projectRoot?.trim() || getClientProjectRoot();

  for (const [filename, field] of Object.entries(HYDRATION_ARTIFACTS)) {
    const descriptor = artifacts[filename];
    const filePath = artifactPath(descriptor, projectRoot);
    if (!filePath) {
      diagnostics.push(`hydration_missing_path:${filename}`);
      continue;
    }
    try {
      const contents = await fs.readFile(filePath, "utf8");
      if (field === "provenance") {
        evidence.provenance = JSON.parse(contents) as unknown;
      } else if (field === "gateResult") {
        evidence.gateResult = JSON.parse(contents) as unknown;
      } else {
        evidence.findingLedger = contents;
      }
      hydrated.push(filename);
    } catch {
      diagnostics.push(`hydration_read_failed:${filename}`);
    }
  }

  return { evidence, hydrated, diagnostics };
}
