import fs from "node:fs";
import path from "node:path";

import { runClaimsEvidenceReview } from "./run-claims-evidence-review.js";
import type { EvidenceStub } from "./types.js";

export const DEFAULT_REQUEST_TOKEN = "REQ-TIED_CLAIMS_EVIDENCE_REVIEW";

export type RunClaimsEvidencePilotInput = {
  projectRoot: string;
  fixtureRoot: string;
  outputDir: string;
  requestToken?: string;
  runId?: string;
};

// [IMPL-TIED_CLAIMS_EVIDENCE_REVIEW] [ARCH-TIED_CLAIMS_EVIDENCE_REVIEW] [REQ-TIED_CLAIMS_EVIDENCE_REVIEW]
// Run static_only pilot using tied-generated fixture layout.
export function runClaimsEvidencePilot(input: RunClaimsEvidencePilotInput) {
  const requestToken = input.requestToken ?? DEFAULT_REQUEST_TOKEN;
  const runId = input.runId ?? "pilot-from-tied";
  const claimSurfacePath = path.join(input.fixtureRoot, "claim-surface.v1.json");
  const stubsPath = path.join(input.fixtureRoot, "evidence-stubs.json");
  const stubs = JSON.parse(fs.readFileSync(stubsPath, "utf8")) as EvidenceStub[];

  return runClaimsEvidenceReview({
    projectRoot: input.projectRoot,
    claimSurfacePath,
    inputBoundaryRoot: input.fixtureRoot,
    outputDir: input.outputDir,
    evidenceStubs: stubs,
    executionPolicy: "static_only",
    requestToken,
    runId,
    includePilotSamples: true,
  });
}
