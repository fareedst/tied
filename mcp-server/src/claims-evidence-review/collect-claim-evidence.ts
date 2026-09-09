import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import type { CollectedEvidence, EvidenceStub, ProofBoundary } from "./types.js";

function isWithinBoundary(resolved: string, boundaryRoot: string): boolean {
  const normalizedBoundary = path.resolve(boundaryRoot);
  const normalizedTarget = path.resolve(resolved);
  const relative = path.relative(normalizedBoundary, normalizedTarget);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function hashFile(filePath: string): string | undefined {
  try {
    const contents = fs.readFileSync(filePath);
    return crypto.createHash("sha256").update(contents).digest("hex");
  } catch {
    return undefined;
  }
}

// [IMPL-TIED_CLAIMS_EVIDENCE_REVIEW] [ARCH-TIED_CLAIMS_EVIDENCE_REVIEW] [REQ-TIED_CLAIMS_EVIDENCE_REVIEW]
// Collect bounded static reads with provenance; reject path traversal.
export function collectClaimEvidence(input: {
  stub: EvidenceStub;
  projectRoot: string;
}): CollectedEvidence | { kind: "PathTraversalRejected" } {
  const { stub, projectRoot } = input;
  const proofBoundary: ProofBoundary = stub.proofBoundary ?? "static_analysis";
  if (!stub.path) {
    return {
      claimId: stub.claimId,
      proofBoundary,
      found: false,
    };
  }
  const resolved = path.resolve(projectRoot, stub.path);
  if (!isWithinBoundary(resolved, projectRoot)) {
    return { kind: "PathTraversalRejected" };
  }
  if (!fs.existsSync(resolved)) {
    return {
      claimId: stub.claimId,
      proofBoundary,
      path: stub.path,
      found: false,
    };
  }
  const contentHash = hashFile(resolved);
  return {
    claimId: stub.claimId,
    proofBoundary,
    path: stub.path,
    contentHash,
    found: true,
    command: stub.validatorCommand,
  };
}

export function collectAllEvidence(input: {
  stubs: readonly EvidenceStub[];
  projectRoot: string;
}): { evidence: CollectedEvidence[]; rejected: boolean } {
  const evidence: CollectedEvidence[] = [];
  for (const stub of input.stubs) {
    const result = collectClaimEvidence({ stub, projectRoot: input.projectRoot });
    if ("kind" in result && result.kind === "PathTraversalRejected") {
      return { evidence: [], rejected: true };
    }
    evidence.push(result as CollectedEvidence);
  }
  return { evidence, rejected: false };
}
