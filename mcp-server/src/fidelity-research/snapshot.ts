import crypto from "node:crypto";

export interface SnapshotArtifactInput {
  path: string;
  kind: string;
  content: string;
}

export interface SnapshotInput {
  manifest: {
    projectRoot: string;
    tiedBasePath: string;
  };
  changeId: string;
  priorRevision: string;
  currentRevision: string;
  artifacts: readonly SnapshotArtifactInput[];
}

export interface SnapshotArtifact extends SnapshotArtifactInput {
  sha256: string;
}

export interface ArtifactSnapshot {
  projectRoot: string;
  tiedBasePath: string;
  changeId: string;
  priorRevision: string;
  currentRevision: string;
  artifacts: SnapshotArtifact[];
}

export type SnapshotResult =
  | { ok: true; snapshot: ArtifactSnapshot }
  | { ok: false; error: "MissingArtifact" };

// [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
// Captures immutable evidence and preserves the audited project read-only boundary.
export function snapshotChange(input: SnapshotInput): SnapshotResult {
  if (
    input.artifacts.length === 0 ||
    input.artifacts.some(
      (artifact) => artifact.path.length === 0 || artifact.kind.length === 0,
    )
  ) {
    return { ok: false, error: "MissingArtifact" };
  }

  return {
    ok: true,
    snapshot: {
      projectRoot: input.manifest.projectRoot,
      tiedBasePath: input.manifest.tiedBasePath,
      changeId: input.changeId,
      priorRevision: input.priorRevision,
      currentRevision: input.currentRevision,
      artifacts: input.artifacts.map((artifact) => ({
        ...artifact,
        sha256: crypto
          .createHash("sha256")
          .update(artifact.content, "utf8")
          .digest("hex"),
      })),
    },
  };
}
