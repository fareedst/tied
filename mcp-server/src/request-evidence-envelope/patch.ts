/**
 * [IMPL-REQUEST_EVIDENCE_ENVELOPE] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE]
 * PATCH_REQUEST_EVIDENCE_ENVELOPE — append-only producer patch with monotonic revision.
 */

import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";

import { buildRequestEvidenceEnvelope } from "./build.js";
import { normalizeEnvelope, serializeEnvelope } from "./normalize.js";
import type {
  EnvelopeArtifact,
  EnvelopeGap,
  EnvelopeRun,
  PatchArtifactEntry,
  PatchRequestEvidenceEnvelopeInput,
  PatchRequestEvidenceEnvelopeResult,
  RequestEvidenceEnvelope,
} from "./types.js";

function artifactMergeKey(artifact: Pick<EnvelopeArtifact, "kind" | "phase" | "path">): string {
  return `${artifact.kind}\0${artifact.phase ?? ""}\0${artifact.path}`;
}

function envelopePathFor(projectRoot: string, requestToken: string): string {
  return path.join(projectRoot, "working", requestToken, "evidence", "request-evidence-envelope.v1.json");
}

function relPath(projectRoot: string, absolute: string): string {
  return path.relative(projectRoot, absolute).split(path.sep).join("/");
}

function revisionConflictGap(
  artifact: PatchArtifactEntry,
  existingHash: string,
  incomingHash: string,
): EnvelopeGap {
  return {
    code: "envelope_revision_conflict",
    artifact_kind: artifact.kind,
    phase: artifact.phase ?? null,
    detail: `content_hash mismatch for ${artifact.path}: existing=${existingHash} incoming=${incomingHash}`,
    severity: "error",
    source: "patch",
  };
}

function toEnvelopeArtifact(entry: PatchArtifactEntry): EnvelopeArtifact {
  return {
    kind: entry.kind,
    schema_version: entry.schema_version ?? null,
    path: entry.path,
    content_hash: entry.content_hash,
    phase: entry.phase ?? null,
    status: entry.status ?? "present",
    proof_boundaries: entry.proof_boundaries ?? ["artifact_presence_only"],
  };
}

function mergeRun(existing: EnvelopeRun[], incoming: EnvelopeRun | undefined): EnvelopeRun[] {
  if (!incoming) return existing;
  const key = `${incoming.phase}\0${incoming.run_id}`;
  if (existing.some((run) => `${run.phase}\0${run.run_id}` === key)) return existing;
  return [...existing, incoming];
}

async function loadOrBootstrapEnvelope(
  input: PatchRequestEvidenceEnvelopeInput,
): Promise<RequestEvidenceEnvelope | { ok: false; error: string }> {
  const envelopePath = envelopePathFor(input.project_root, input.request_token);
  try {
    const raw = await fs.readFile(envelopePath, "utf8");
    return JSON.parse(raw) as RequestEvidenceEnvelope;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  const built = await buildRequestEvidenceEnvelope({
    request_token: input.request_token,
    project_root: input.project_root,
    tied_base_path: input.tied_base_path,
    confirmed_tied_base_path: input.confirmed_tied_base_path,
    depth_tier: input.depth_tier,
    gate_policy: input.gate_policy,
    generated_at: input.generated_at,
    output_mode: "json",
  });
  if (!built.ok) {
    return { ok: false, error: built.error };
  }
  return {
    ...built.envelope,
    envelope_meta: {
      ...built.envelope.envelope_meta,
      revision: 0,
      generator: "request_evidence_envelope_patch",
    },
  };
}

function mergeArtifact(
  envelope: RequestEvidenceEnvelope,
  incoming: PatchArtifactEntry,
): { ok: true; envelope: RequestEvidenceEnvelope } | { ok: false; gaps: EnvelopeGap[] } {
  const normalized: Pick<EnvelopeArtifact, "kind" | "phase" | "path"> = {
    kind: incoming.kind,
    phase: incoming.phase ?? null,
    path: incoming.path,
  };
  const key = artifactMergeKey(normalized);
  const nextArtifact = toEnvelopeArtifact(incoming);
  const artifacts = [...envelope.artifacts];
  const index = artifacts.findIndex((artifact) => artifactMergeKey(artifact) === key);
  if (index >= 0) {
    const existing = artifacts[index]!;
    if (existing.content_hash !== incoming.content_hash) {
      return {
        ok: false,
        gaps: [revisionConflictGap(incoming, existing.content_hash, incoming.content_hash)],
      };
    }
    artifacts[index] = { ...existing, ...nextArtifact, content_hash: existing.content_hash };
  } else {
    artifacts.push(nextArtifact);
  }
  return {
    ok: true,
    envelope: {
      ...envelope,
      artifacts,
    },
  };
}

export function contentHashHex(contents: string | Buffer): string {
  const hash = createHash("sha256").update(contents).digest("hex");
  return `sha256:${hash}`;
}

export async function patchRequestEvidenceEnvelope(
  input: PatchRequestEvidenceEnvelopeInput,
): Promise<PatchRequestEvidenceEnvelopeResult> {
  const projectRoot = path.resolve(input.project_root);
  const artifactPath = path.resolve(projectRoot, input.artifact.path);
  if (!artifactPath.startsWith(projectRoot)) {
    return {
      ok: false,
      gaps: [],
      error: "PatchOutsideProject",
    };
  }

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
          artifact_kind: input.artifact.kind,
          phase: input.artifact.phase ?? null,
          detail: `expected revision ${input.expected_revision} but found ${envelope.envelope_meta.revision}`,
          severity: "error",
          source: "patch",
        },
      ],
    };
  }

  const merged = mergeArtifact(envelope, input.artifact);
  if (!merged.ok) {
    return merged;
  }
  envelope = merged.envelope;

  const nextRevision = (envelope.envelope_meta.revision ?? 0) + 1;
  envelope = normalizeEnvelope({
    ...envelope,
    envelope_meta: {
      ...envelope.envelope_meta,
      revision: nextRevision,
      generated_at: input.generated_at ?? new Date().toISOString(),
      generator: "request_evidence_envelope_patch",
    },
    runs: mergeRun(envelope.runs, input.run),
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
