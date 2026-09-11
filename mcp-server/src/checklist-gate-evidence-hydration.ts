/**
 * [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
 * Auto-hydrate gate evidence from identity-bound activation artifacts at verification/close_out.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

import type { ChecklistGateEvidenceInput, EnvelopeGapEvidence, GatePhase } from "./checklist-validator.js";
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

  const projectRoot = input.projectRoot?.trim() || getClientProjectRoot();
  const artifacts = input.activation?.artifacts;
  if (isRecord(artifacts)) {
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
  }

  const envelopeHydration = await hydrateEnvelopeGapsFromDisk({
    phase: input.phase,
    projectRoot,
    requestToken: evidence.requestToken,
    existingGaps: evidence.envelopeGaps,
  });
  if (envelopeHydration.envelopeGaps) {
    evidence.envelopeGaps = envelopeHydration.envelopeGaps;
  }
  hydrated.push(...envelopeHydration.hydrated);
  diagnostics.push(...envelopeHydration.diagnostics);

  const psaHydration = await hydratePseudocodeReportsFromDisk({
    phase: input.phase,
    projectRoot,
    requestToken: evidence.requestToken,
    existingReports: evidence.pseudocodeReports,
  });
  if (Object.keys(psaHydration.pseudocodeReports).length > 0) {
    evidence.pseudocodeReports = psaHydration.pseudocodeReports;
  }
  hydrated.push(...psaHydration.hydrated);
  diagnostics.push(...psaHydration.diagnostics);

  return { evidence, hydrated, diagnostics };
}

const IMPL_TOKEN_RE = /^IMPL-[A-Z0-9][A-Z0-9_-]*$/u;

function implTokenFromPsaFilename(name: string): string | null {
  const canonical = name.match(/^(IMPL-[A-Z0-9][A-Z0-9_-]*)\.v1\.json$/u);
  if (canonical) return canonical[1];
  const alias = name.match(/^psa-(IMPL-[A-Z0-9][A-Z0-9_-]*)\.json$/u);
  if (alias) return alias[1];
  return null;
}

async function readJsonFile(filePath: string): Promise<unknown | null> {
  try {
    const contents = await fs.readFile(filePath, "utf8");
    return JSON.parse(contents) as unknown;
  } catch {
    return null;
  }
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-PSEUDOCODE_STATIC_ANALYSIS] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: W8-D1 auto-load Layer C PSA from canonical paths before validatePseudocodeAnalysisEvidence.
export async function hydratePseudocodeReportsFromDisk(input: {
  phase: GatePhase;
  projectRoot: string;
  requestToken?: string;
  existingReports?: Record<string, unknown>;
}): Promise<{ pseudocodeReports: Record<string, unknown>; hydrated: string[]; diagnostics: string[] }> {
  const hydrated: string[] = [];
  const diagnostics: string[] = [];
  const reports: Record<string, unknown> = { ...(input.existingReports ?? {}) };

  if (!HYDRATION_PHASES.has(input.phase)) {
    return { pseudocodeReports: reports, hydrated, diagnostics };
  }

  const token = input.requestToken?.trim();
  if (!token) {
    diagnostics.push("hydration_psa_missing_request_token");
    return { pseudocodeReports: reports, hydrated, diagnostics };
  }

  const workingRoot = path.join(input.projectRoot, "working", token);
  const scanDirs = [
    path.join(workingRoot, "pseudocode-analysis"),
    path.join(workingRoot, "evidence"),
  ];

  for (const dir of scanDirs) {
    let names: string[];
    try {
      names = await fs.readdir(dir);
    } catch {
      continue;
    }
    for (const name of names) {
      const implToken = implTokenFromPsaFilename(name);
      if (!implToken || !IMPL_TOKEN_RE.test(implToken)) continue;
      if (implToken in reports) continue;
      const parsed = await readJsonFile(path.join(dir, name));
      if (parsed === null) {
        diagnostics.push(`hydration_psa_read_failed:${implToken}`);
        continue;
      }
      reports[implToken] = parsed;
      hydrated.push(`${path.relative(input.projectRoot, path.join(dir, name))}:${implToken}`);
    }
  }

  return { pseudocodeReports: reports, hydrated, diagnostics };
}

function envelopeGapFromRecord(value: unknown): EnvelopeGapEvidence | null {
  if (!isRecord(value)) return null;
  const code = typeof value.code === "string" ? value.code.trim() : "";
  if (!code) return null;
  const gap: EnvelopeGapEvidence = { code };
  if (typeof value.artifact_kind === "string") gap.artifact_kind = value.artifact_kind;
  if (typeof value.severity === "string") gap.severity = value.severity;
  return gap;
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-REQUEST_EVIDENCE_ENVELOPE] — How: W7-D5 cross-read envelope gaps at verification/close_out when request token is known.
export async function hydrateEnvelopeGapsFromDisk(input: {
  phase: GatePhase;
  projectRoot: string;
  requestToken?: string;
  existingGaps?: readonly EnvelopeGapEvidence[];
}): Promise<{ envelopeGaps?: EnvelopeGapEvidence[]; hydrated: string[]; diagnostics: string[] }> {
  const hydrated: string[] = [];
  const diagnostics: string[] = [];
  if (!HYDRATION_PHASES.has(input.phase)) {
    return { envelopeGaps: input.existingGaps ? [...input.existingGaps] : undefined, hydrated, diagnostics };
  }
  if (input.existingGaps && input.existingGaps.length > 0) {
    return { envelopeGaps: [...input.existingGaps], hydrated, diagnostics };
  }
  const token = input.requestToken?.trim();
  if (!token) {
    return { hydrated, diagnostics };
  }
  const envelopePath = path.join(
    input.projectRoot,
    "working",
    token,
    "evidence",
    "request-evidence-envelope.v1.json",
  );
  try {
    const contents = await fs.readFile(envelopePath, "utf8");
    const doc = JSON.parse(contents) as Record<string, unknown>;
    const gapsRaw = doc.gaps;
    const gaps: EnvelopeGapEvidence[] = [];
    if (Array.isArray(gapsRaw)) {
      for (const item of gapsRaw) {
        const gap = envelopeGapFromRecord(item);
        if (gap) gaps.push(gap);
      }
    }
    hydrated.push("request-evidence-envelope.v1.json:gaps");
    return { envelopeGaps: gaps, hydrated, diagnostics };
  } catch {
    diagnostics.push("hydration_envelope_gaps_missing");
    return { hydrated, diagnostics };
  }
}
