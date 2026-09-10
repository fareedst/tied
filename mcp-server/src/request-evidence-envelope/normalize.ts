/**
 * [IMPL-REQUEST_EVIDENCE_ENVELOPE] [ARCH-REQUEST_EVIDENCE_ENVELOPE] [REQ-REQUEST_EVIDENCE_ENVELOPE]
 */

import type { EnvelopeArtifact, EnvelopeGap, RequestEvidenceEnvelope } from "./types.js";

function artifactSortKey(artifact: EnvelopeArtifact): string {
  return `${artifact.kind}\0${artifact.phase ?? ""}\0${artifact.path}`;
}

function gapSortKey(gap: EnvelopeGap): string {
  return `${gap.code}\0${gap.phase ?? ""}\0${gap.artifact_kind ?? ""}\0${gap.detail}`;
}

export function normalizeEnvelope(envelope: RequestEvidenceEnvelope): RequestEvidenceEnvelope {
  return {
    ...envelope,
    artifacts: [...envelope.artifacts].sort((a, b) => artifactSortKey(a).localeCompare(artifactSortKey(b))),
    gaps: [...envelope.gaps].sort((a, b) => gapSortKey(a).localeCompare(gapSortKey(b))),
    runs: [...envelope.runs].sort((a, b) => `${a.phase}\0${a.run_id}`.localeCompare(`${b.phase}\0${b.run_id}`)),
  };
}

export function serializeEnvelope(envelope: RequestEvidenceEnvelope): string {
  return `${JSON.stringify(normalizeEnvelope(envelope), null, 2)}\n`;
}
