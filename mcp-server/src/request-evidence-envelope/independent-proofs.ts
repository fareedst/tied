/**
 * [IMPL-REQUEST_EVIDENCE_ENVELOPE] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE]
 * Append or update independent_proofs[] on request-evidence-envelope.v1.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

import { resolveWorkingPath } from "../working-root.js";
import { buildRequestEvidenceEnvelope } from "./build.js";
import { normalizeEnvelope, serializeEnvelope } from "./normalize.js";
import type {
  IndependentProofRecord,
  PatchIndependentProofInput,
  PatchIndependentProofResult,
  RequestEvidenceEnvelope,
} from "./types.js";

function envelopePathFor(projectRoot: string, requestToken: string): string {
  return resolveWorkingPath(
    projectRoot,
    requestToken,
    "evidence",
    "request-evidence-envelope.v1.json",
  );
}

function relPath(projectRoot: string, absolute: string): string {
  return path.relative(projectRoot, absolute).split(path.sep).join("/");
}

async function loadOrBootstrapEnvelope(
  input: PatchIndependentProofInput,
): Promise<RequestEvidenceEnvelope | { ok: false; error: string }> {
  const projectRoot = path.resolve(input.project_root);
  const envelopePath = envelopePathFor(projectRoot, input.request_token);
  try {
    const raw = await fs.readFile(envelopePath, "utf8");
    return JSON.parse(raw) as RequestEvidenceEnvelope;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  const tiedBasePath = path.join(projectRoot, "tied-project");
  const built = await buildRequestEvidenceEnvelope({
    request_token: input.request_token,
    project_root: projectRoot,
    tied_base_path: tiedBasePath,
    confirmed_tied_base_path: tiedBasePath,
    output_mode: "json",
    generated_at: input.generated_at,
  });
  if (!built.ok) {
    return { ok: false, error: built.error };
  }
  return {
    ...built.envelope,
    envelope_meta: {
      ...built.envelope.envelope_meta,
      revision: 0,
      generator: "request_evidence_envelope_independent_proof_patch",
    },
  };
}

function mergeIndependentProof(
  envelope: RequestEvidenceEnvelope,
  proof: IndependentProofRecord,
): RequestEvidenceEnvelope {
  const proofs = [...(envelope.independent_proofs ?? [])];
  const index = proofs.findIndex((entry) => entry.proof_id === proof.proof_id);
  if (index >= 0) {
    proofs[index] = proof;
  } else {
    proofs.push(proof);
  }
  proofs.sort((a, b) => a.proof_id.localeCompare(b.proof_id));
  return { ...envelope, independent_proofs: proofs };
}

export async function patchIndependentProof(
  input: PatchIndependentProofInput,
): Promise<PatchIndependentProofResult> {
  const projectRoot = path.resolve(input.project_root);
  const loaded = await loadOrBootstrapEnvelope(input);
  if ("ok" in loaded && loaded.ok === false) {
    return { ok: false, gaps: [], error: loaded.error };
  }
  let envelope = loaded as RequestEvidenceEnvelope;

  if (
    input.expected_revision != null
    && envelope.envelope_meta.revision !== input.expected_revision
  ) {
    return {
      ok: false,
      gaps: [
        {
          code: "envelope_revision_conflict",
          artifact_kind: "unknown",
          phase: null,
          detail: `expected revision ${input.expected_revision} but found ${envelope.envelope_meta.revision}`,
          severity: "error",
          source: "patch",
        },
      ],
    };
  }

  envelope = mergeIndependentProof(envelope, input.proof);
  const nextRevision = (envelope.envelope_meta.revision ?? 0) + 1;
  envelope = normalizeEnvelope({
    ...envelope,
    envelope_meta: {
      ...envelope.envelope_meta,
      revision: nextRevision,
      generated_at: input.generated_at ?? new Date().toISOString(),
      generator: "request_evidence_envelope_independent_proof_patch",
    },
  });

  const envelopePath = envelopePathFor(projectRoot, input.request_token);
  await fs.mkdir(path.dirname(envelopePath), { recursive: true });
  await fs.writeFile(envelopePath, serializeEnvelope(envelope), "utf8");

  return {
    ok: true,
    envelope,
    revision: nextRevision,
    envelope_path: relPath(projectRoot, envelopePath),
  };
}
