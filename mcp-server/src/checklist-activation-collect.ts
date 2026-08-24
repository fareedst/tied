import { promises as fs } from "node:fs";
import { createHash } from "node:crypto";

import {
  relativeArtifactPath,
  resolveArtifactPaths,
  type InquiryActivation,
  type InquiryActivationArtifacts,
  type InquiryActivationReceipt,
} from "./adversarial-inquiry/checklist-integration.js";
import {
  deriveExpectedFromReceipt,
  stableHash,
  type ActivationExpectedIdentity,
} from "./checklist-validator.js";
import { getClientProjectRoot } from "./yaml-loader.js";

const ARTIFACT_NAMES = [
  "obligation-report.json",
  "finding-ledger.jsonl",
  "gate-result.json",
  "evidence-provenance.json",
] as const;

const REQUEST_TOKEN_RE = /^REQ-[A-Z0-9][A-Z0-9_-]*$/u;

export type CollectChecklistActivationInput = {
  requestToken: string;
  phase: InquiryActivation["phase"];
  runId: string;
  projectRoot?: string;
  metricsPath?: string;
};

export type CollectChecklistActivationResult = {
  ok: boolean;
  receipt?: InquiryActivationReceipt;
  artifacts?: InquiryActivationArtifacts;
  expected?: ActivationExpectedIdentity;
  diagnostics: string[];
  metrics_match?: boolean;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function contentHash(value: string): string {
  return createHash("sha256").update(value, "utf8").digest("hex");
}

function sortedUniqueScope(scope: readonly string[]): string[] {
  return [...new Set(scope.map((item) => item.trim()).filter(Boolean))].sort();
}

function readProvenanceRunId(provenanceDoc: unknown): string | undefined {
  if (!isRecord(provenanceDoc)) return undefined;
  const envelope = isRecord(provenanceDoc.provenance) ? provenanceDoc.provenance : provenanceDoc;
  const runId = envelope.runId ?? envelope.run_id;
  return typeof runId === "string" && runId.trim() ? runId.trim() : undefined;
}

function readProvenancePhase(provenanceDoc: unknown): string | undefined {
  if (!isRecord(provenanceDoc)) return undefined;
  const envelope = isRecord(provenanceDoc.provenance) ? provenanceDoc.provenance : provenanceDoc;
  const phase = envelope.phase;
  return typeof phase === "string" && phase.trim() ? phase.trim() : undefined;
}

async function findMetricsRunMatch(
  metricsPath: string,
  runId: string,
): Promise<{ found: boolean; mismatch: boolean }> {
  let contents: string;
  try {
    contents = await fs.readFile(metricsPath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      return { found: false, mismatch: false };
    }
    throw error;
  }
  let found = false;
  for (const line of contents.split("\n").filter(Boolean)) {
    let record: Record<string, unknown>;
    try {
      record = JSON.parse(line) as Record<string, unknown>;
    } catch {
      continue;
    }
    if (record.tool !== "tied_adversarial_inquiry_run") continue;
    const summary = isRecord(record.args_summary) ? record.args_summary : undefined;
    const metricsRunId = summary && typeof summary.run_id === "string" ? summary.run_id.trim() : "";
    if (!metricsRunId) continue;
    if (metricsRunId === runId) {
      found = true;
      break;
    }
    if (metricsRunId !== runId && summary?.request_token) {
      // Another run for the same request is not a mismatch for this run_id.
      continue;
    }
  }
  return { found, mismatch: false };
}

// [IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT] [ARCH-TIED_CHECKLIST_GATE_ENFORCEMENT] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT] — How: read persisted phase artifacts and assemble gate activation payload without writing artifacts or mutating CITDP.
export async function collectChecklistActivation(
  input: CollectChecklistActivationInput,
): Promise<CollectChecklistActivationResult> {
  const diagnostics: string[] = [];
  const requestToken = input.requestToken.trim();
  const runId = input.runId.trim();
  const phase = input.phase;

  if (!REQUEST_TOKEN_RE.test(requestToken)) {
    return { ok: false, diagnostics: ["invalid_request_token"] };
  }
  if (!runId) {
    return { ok: false, diagnostics: ["missing_run_id"] };
  }

  const repositoryRoot = input.projectRoot?.trim()
    ? input.projectRoot.trim()
    : getClientProjectRoot();

  let paths;
  try {
    paths = resolveArtifactPaths({ repositoryRoot, requestToken, phase });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { ok: false, diagnostics: [message.includes("UNSAFE") ? "unsafe_artifact_path" : "invalid_scope"] };
  }

  try {
    await fs.access(paths.directory);
  } catch {
    return { ok: false, diagnostics: ["missing_phase_directory"] };
  }

  const filePaths = {
    "obligation-report.json": paths.obligationReport,
    "finding-ledger.jsonl": paths.findingLedger,
    "gate-result.json": paths.gateResult,
    "evidence-provenance.json": paths.evidenceProvenance,
  };

  const contents: Record<string, string> = {};
  for (const name of ARTIFACT_NAMES) {
    try {
      contents[name] = await fs.readFile(filePaths[name], "utf8");
    } catch {
      diagnostics.push(`missing_activation_artifact:${name}`);
    }
  }
  if (diagnostics.length > 0) {
    return { ok: false, diagnostics };
  }

  let report: Record<string, unknown>;
  try {
    report = JSON.parse(contents["obligation-report.json"]) as Record<string, unknown>;
  } catch {
    return { ok: false, diagnostics: ["malformed_obligation_report"] };
  }

  const projectId = typeof report.projectId === "string" && report.projectId.trim()
    ? report.projectId.trim()
    : (isRecord(report.graph) && typeof report.graph.projectId === "string"
      ? report.graph.projectId.trim()
      : "");
  const scopeRaw = report.scope;
  if (!projectId || !Array.isArray(scopeRaw) || !scopeRaw.every((item) => typeof item === "string")) {
    return { ok: false, diagnostics: ["malformed_obligation_report"] };
  }
  const scope = sortedUniqueScope(scopeRaw as string[]);
  const scopeHash = stableHash(scope);

  let provenanceDoc: unknown;
  try {
    provenanceDoc = JSON.parse(contents["evidence-provenance.json"]);
  } catch {
    return { ok: false, diagnostics: ["malformed_evidence_provenance"] };
  }

  const provenanceRunId = readProvenanceRunId(provenanceDoc);
  if (provenanceRunId && provenanceRunId !== runId) {
    return { ok: false, diagnostics: ["run_id_provenance_mismatch"] };
  }
  const provenancePhase = readProvenancePhase(provenanceDoc);
  if (provenancePhase && provenancePhase !== phase) {
    return { ok: false, diagnostics: ["phase_provenance_mismatch"] };
  }

  const supportingDiagnostics: string[] = [];
  let metricsMatch: boolean | undefined;
  if (input.metricsPath?.trim()) {
    const metrics = await findMetricsRunMatch(input.metricsPath.trim(), runId);
    metricsMatch = metrics.found;
    if (!metrics.found) {
      supportingDiagnostics.push("metrics_run_id_not_found");
    }
    if (metrics.mismatch) {
      return { ok: false, diagnostics: ["metrics_run_id_mismatch"] };
    }
  }

  const hashes: Record<string, string> = {};
  const activationArtifacts: InquiryActivationArtifacts = {};
  for (const name of ARTIFACT_NAMES) {
    const filePath = filePaths[name];
    const hash = contentHash(contents[name]);
    hashes[name] = hash;
    activationArtifacts[name] = {
      valid: true,
      request_token: requestToken,
      project_id: projectId,
      run_id: runId,
      phase,
      scope_hash: scopeHash,
      hash,
      path: relativeArtifactPath(repositoryRoot, filePath),
    };
  }

  const receipt: InquiryActivationReceipt = {
    success: true,
    tool: "tied_adversarial_inquiry_run",
    request_token: requestToken,
    project_id: projectId,
    run_id: runId,
    phase,
    scope,
    scope_hash: scopeHash,
    artifact_hashes: hashes,
  };

  const expected = deriveExpectedFromReceipt(receipt);
  if (!expected) {
    return { ok: false, diagnostics: ["missing_expected_identity"] };
  }

  const pairingDiagnostics: string[] = [];
  if (stableHash(expected.scope) !== expected.scope_hash) {
    pairingDiagnostics.push("expected_scope_hash_mismatch");
  }

  if (pairingDiagnostics.length > 0) {
    return { ok: false, diagnostics: pairingDiagnostics };
  }

  return {
    ok: true,
    receipt,
    artifacts: activationArtifacts,
    expected,
    diagnostics: supportingDiagnostics,
    ...(metricsMatch !== undefined ? { metrics_match: metricsMatch } : {}),
  };
}
