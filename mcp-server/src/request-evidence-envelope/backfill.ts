/**
 * [IMPL-REQUEST_EVIDENCE_ENVELOPE] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE]
 * BACKFILL_REQUEST_EVIDENCE_ENVELOPE — legacy migration write path for timestamp client repos.
 */

import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { resolveWorkingPath } from "../working-root.js";

import { buildRequestEvidenceEnvelope } from "./build.js";
import { resolveDepthTierForBackfill } from "./citdp-envelope-context.js";
import { normalizeEnvelope, serializeEnvelope } from "./normalize.js";
import type {
  BackfillRequestEvidenceEnvelopeInput,
  BackfillRequestEvidenceEnvelopeResult,
  DepthTier,
  GatePhase,
} from "./types.js";
import { validateRequestEvidenceEnvelope } from "./validate.js";

export const BACKFILL_GENERATOR = "request_evidence_envelope_backfill" as const;
export const NOT_APPLICABLE_RECEIPT_SCHEMA = "not-applicable-receipt.v1" as const;

const INQUIRY_PHASES: GatePhase[] = ["pre_implementation", "verification", "close_out"];
const INQUIRY_ARTIFACTS = [
  "evidence-provenance.json",
  "obligation-report.json",
  "gate-result.json",
  "finding-ledger.jsonl",
] as const;

export {
  resolveCitdpContext,
  resolveDepthTierForBackfill,
} from "./citdp-envelope-context.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function relPath(projectRoot: string, absolute: string): string {
  return path.relative(projectRoot, absolute).split(path.sep).join("/");
}

function contentHashHex(contents: string): string {
  const hash = createHash("sha256").update(contents).digest("hex");
  return `sha256:${hash}`;
}

async function readOptional(filePath: string): Promise<string | null> {
  try {
    return await fs.readFile(filePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return null;
    throw error;
  }
}

async function phaseHasInquiryArtifacts(workingRoot: string, phase: GatePhase): Promise<boolean> {
  const phaseDir = path.join(workingRoot, "adversarial-inquiry", `phase-${phase}`);
  for (const filename of INQUIRY_ARTIFACTS) {
    if (await readOptional(path.join(phaseDir, filename))) return true;
  }
  return false;
}

export type NotApplicableReceiptDocument = {
  schema_version: typeof NOT_APPLICABLE_RECEIPT_SCHEMA;
  request_token: string;
  artifact_kind: "adversarial_inquiry";
  depth_tier: DepthTier;
  phases: GatePhase[];
  reason: string;
  generated_at: string;
  source: typeof BACKFILL_GENERATOR;
};

export function buildNotApplicableReceipt(input: {
  requestToken: string;
  depthTier: DepthTier;
  phases: GatePhase[];
  generatedAt: string;
}): NotApplicableReceiptDocument {
  return {
    schema_version: NOT_APPLICABLE_RECEIPT_SCHEMA,
    request_token: input.requestToken,
    artifact_kind: "adversarial_inquiry",
    depth_tier: input.depthTier,
    phases: [...input.phases].sort(),
    reason: "Adversarial inquiry not applicable at minimal depth_tier",
    generated_at: input.generatedAt,
    source: BACKFILL_GENERATOR,
  };
}

export async function writeNotApplicableReceiptIfNeeded(input: {
  projectRoot: string;
  requestToken: string;
  depthTier: DepthTier;
  generatedAt: string;
  writeReceipts: boolean;
}): Promise<{ path: string | null; phases: GatePhase[] }> {
  if (!input.writeReceipts || input.depthTier !== "minimal") {
    return { path: null, phases: [] };
  }

  const workingRoot = resolveWorkingPath(input.projectRoot, input.requestToken);
  const missingPhases: GatePhase[] = [];
  for (const phase of INQUIRY_PHASES) {
    if (!(await phaseHasInquiryArtifacts(workingRoot, phase))) {
      missingPhases.push(phase);
    }
  }
  if (missingPhases.length === 0) {
    return { path: null, phases: [] };
  }

  const receiptPath = path.join(workingRoot, "evidence", "not-applicable-receipt.v1.json");
  const existing = await readOptional(receiptPath);
  if (existing) {
    return { path: relPath(input.projectRoot, receiptPath), phases: missingPhases };
  }

  const receipt = buildNotApplicableReceipt({
    requestToken: input.requestToken,
    depthTier: input.depthTier,
    phases: missingPhases,
    generatedAt: input.generatedAt,
  });
  await fs.mkdir(path.dirname(receiptPath), { recursive: true });
  await fs.writeFile(receiptPath, `${JSON.stringify(receipt, null, 2)}\n`, "utf8");
  console.debug("DEBUG: [IMPL-REQUEST_EVIDENCE_ENVELOPE] wrote not-applicable-receipt", {
    request_token: input.requestToken,
    phases: missingPhases,
    path: relPath(input.projectRoot, receiptPath),
  });
  return { path: relPath(input.projectRoot, receiptPath), phases: missingPhases };
}

export function summarizeEnvelopeGaps(gapCodes: string[]): Record<string, number> {
  const summary: Record<string, number> = {};
  for (const code of gapCodes) {
    summary[code] = (summary[code] ?? 0) + 1;
  }
  return summary;
}

export async function backfillRequestEvidenceEnvelope(
  input: BackfillRequestEvidenceEnvelopeInput,
): Promise<BackfillRequestEvidenceEnvelopeResult> {
  const projectRoot = path.resolve(input.project_root);
  const resolvedTied = path.resolve(input.tied_base_path);
  const confirmed = path.resolve(input.confirmed_tied_base_path);
  if (resolvedTied !== confirmed) {
    return { ok: false, stage: "identity", error: "WrongTiedBasePath" };
  }

  const generatedAt = input.generated_at ?? new Date().toISOString();
  const writeReceipts = input.write_not_applicable_receipts !== false;
  const depthContext = await resolveDepthTierForBackfill({
    projectRoot,
    requestToken: input.request_token,
    override: input.depth_tier,
  });

  const receiptWrite = await writeNotApplicableReceiptIfNeeded({
    projectRoot,
    requestToken: input.request_token,
    depthTier: depthContext.depthTier,
    generatedAt,
    writeReceipts,
  });

  const envelopePath = path.join(
    projectRoot,
    "working",
    input.request_token,
    "evidence",
    "request-evidence-envelope.v1.json",
  );
  await fs.unlink(envelopePath).catch((error: NodeJS.ErrnoException) => {
    if (error.code !== "ENOENT") throw error;
  });

  const build = await buildRequestEvidenceEnvelope({
    request_token: input.request_token,
    project_root: projectRoot,
    tied_base_path: resolvedTied,
    confirmed_tied_base_path: confirmed,
    depth_tier: depthContext.depthTier,
    gate_policy: input.gate_policy ?? depthContext.gatePolicy ?? "advisory",
    output_mode: "file",
    generated_at: generatedAt,
  });
  if (!build.ok) {
    return { ok: false, stage: build.stage, error: build.error };
  }

  let envelope = normalizeEnvelope({
    ...build.envelope,
    envelope_meta: {
      ...build.envelope.envelope_meta,
      generator: BACKFILL_GENERATOR,
    },
    cross_links: {
      ...build.envelope.cross_links,
      citdp_path: depthContext.citdpPath ?? build.envelope.cross_links.citdp_path,
    },
  });

  await fs.mkdir(path.dirname(envelopePath), { recursive: true });
  await fs.writeFile(envelopePath, serializeEnvelope(envelope), "utf8");

  const validation = await validateRequestEvidenceEnvelope({
    envelope_path: relPath(projectRoot, envelopePath),
    project_root: projectRoot,
  });
  if (!validation.ok || !validation.envelope) {
    return {
      ok: false,
      stage: "validate",
      error: validation.diagnostics.join("; ") || "EnvelopeValidationFailed",
    };
  }
  envelope = validation.envelope;

  const gapCodes = envelope.gaps.map((gap) => gap.code);
  return {
    ok: true,
    envelope,
    envelope_path: relPath(projectRoot, envelopePath),
    not_applicable_receipt_path: receiptWrite.path,
    depth_tier: depthContext.depthTier,
    gaps_summary: summarizeEnvelopeGaps(gapCodes),
    gap_codes: [...new Set(gapCodes)].sort(),
    legacy_json_in_json_wrapper: gapCodes.includes("legacy_json_in_json_wrapper"),
    not_applicable_receipt_hash: receiptWrite.path
      ? contentHashHex(await fs.readFile(path.join(projectRoot, receiptWrite.path), "utf8"))
      : null,
  };
}
