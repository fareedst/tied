/**
 * [IMPL-REQUEST_EVIDENCE_ENVELOPE] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE]
 * VALIDATE_REQUEST_EVIDENCE_ENVELOPE
 */

import { promises as fs } from "node:fs";
import path from "node:path";

import { normalizeEnvelope } from "./normalize.js";
import type {
  RequestEvidenceEnvelope,
  ValidateRequestEvidenceEnvelopeInput,
  ValidateRequestEvidenceEnvelopeResult,
} from "./types.js";
import { ENVELOPE_SCHEMA_VERSION } from "./types.js";

const FORBIDDEN_FIELDS = ["maturity_score", "maturity", "ranking", "client_rank"];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function collectForbiddenFields(value: unknown, prefix = "", out: string[] = []): string[] {
  if (Array.isArray(value)) {
    value.forEach((item, index) => collectForbiddenFields(item, `${prefix}[${index}]`, out));
    return out;
  }
  if (!isRecord(value)) return out;
  for (const [key, nested] of Object.entries(value)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (FORBIDDEN_FIELDS.includes(key)) out.push(fullKey);
    collectForbiddenFields(nested, fullKey, out);
  }
  return out;
}

function validateShape(envelope: RequestEvidenceEnvelope): string[] {
  const diagnostics: string[] = [];
  if (envelope.schema_version !== ENVELOPE_SCHEMA_VERSION) {
    diagnostics.push("envelope_schema_invalid:schema_version");
  }
  if (!envelope.identity?.request_token?.startsWith("REQ-")) {
    diagnostics.push("envelope_schema_invalid:identity.request_token");
  }
  if (!envelope.envelope_meta?.generator) {
    diagnostics.push("envelope_schema_invalid:envelope_meta.generator");
  }
  if (typeof envelope.envelope_meta?.revision !== "number") {
    diagnostics.push("envelope_schema_invalid:envelope_meta.revision");
  }
  if (!Array.isArray(envelope.artifacts)) {
    diagnostics.push("envelope_schema_invalid:artifacts");
  }
  for (const artifact of Array.isArray(envelope.artifacts) ? envelope.artifacts : []) {
    if (!artifact.kind || !artifact.path || !artifact.content_hash) {
      diagnostics.push("envelope_schema_invalid:artifacts[]");
      break;
    }
    if (!artifact.content_hash.startsWith("sha256:")) {
      diagnostics.push("envelope_schema_invalid:artifacts[].content_hash");
      break;
    }
  }
  if (!Array.isArray(envelope.gaps)) {
    diagnostics.push("envelope_schema_invalid:gaps");
  }
  for (const gap of Array.isArray(envelope.gaps) ? envelope.gaps : []) {
    if (!gap.code || !gap.severity) {
      diagnostics.push("envelope_schema_invalid:gaps[]");
      break;
    }
  }
  diagnostics.push(...collectForbiddenFields(envelope).map((field) => `envelope_schema_invalid:forbidden_field:${field}`));
  return diagnostics;
}

export async function validateRequestEvidenceEnvelope(
  input: ValidateRequestEvidenceEnvelopeInput,
): Promise<ValidateRequestEvidenceEnvelopeResult> {
  let envelope = input.envelope;
  const diagnostics: string[] = [];

  if (!envelope && input.envelope_path) {
    const projectRoot = input.project_root ? path.resolve(input.project_root) : process.cwd();
    const absolute = path.isAbsolute(input.envelope_path)
      ? input.envelope_path
      : path.join(projectRoot, input.envelope_path);
    if (input.project_root && !absolute.startsWith(projectRoot)) {
      return { ok: false, diagnostics: ["envelope_schema_invalid:path_outside_project"] };
    }
    try {
      const raw = await fs.readFile(absolute, "utf8");
      envelope = JSON.parse(raw) as RequestEvidenceEnvelope;
    } catch {
      return { ok: false, diagnostics: ["envelope_schema_invalid:read_failed"] };
    }
  }

  if (!envelope) {
    return { ok: false, diagnostics: ["envelope_schema_invalid:missing_envelope"] };
  }

  diagnostics.push(...validateShape(envelope));
  if (diagnostics.length > 0) {
    return { ok: false, diagnostics };
  }

  const normalized = normalizeEnvelope(envelope);
  const errorGaps = normalized.gaps.filter((gap) => gap.severity === "error");
  const warnGaps = normalized.gaps.filter((gap) => gap.severity === "warn");
  const blockingGapCount = errorGaps.length;
  const advisoryGapCount = warnGaps.length;

  if (input.fail_on_error_gaps && blockingGapCount > 0) {
    return {
      ok: false,
      envelope: normalized,
      diagnostics: [
        ...diagnostics,
        ...errorGaps.map((gap) => `envelope_blocking_gap:${gap.code}`),
      ],
      blocking_gap_count: blockingGapCount,
      advisory_gap_count: advisoryGapCount,
    };
  }

  return {
    ok: true,
    envelope: normalized,
    diagnostics,
    blocking_gap_count: blockingGapCount,
    advisory_gap_count: advisoryGapCount,
  };
}
