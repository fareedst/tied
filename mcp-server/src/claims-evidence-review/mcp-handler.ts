import fs from "node:fs";
import path from "node:path";

import { DEFAULT_REQUEST_TOKEN, runClaimsEvidencePilot } from "./run-claims-evidence-pilot.js";

export type ClaimsEvidenceReviewMcpArgs = {
  tied_base_path: string;
  project_root?: string;
  request_token?: string;
  claim_surface_path?: string;
  fixture_root?: string;
  output_dir: string;
  execution_policy?: "static_only";
  run_id?: string;
};

export async function runClaimsEvidenceReviewMcp(args: ClaimsEvidenceReviewMcpArgs) {
  const projectRoot = args.project_root ?? path.dirname(args.tied_base_path);
  const requestToken = args.request_token ?? DEFAULT_REQUEST_TOKEN;
  const fixtureRoot = args.fixture_root
    ?? path.join(projectRoot, "mcp-server/test/fixtures/claims-evidence-review/tied-generated");
  const claimSurfacePath = args.claim_surface_path ?? path.join(fixtureRoot, "claim-surface.v1.json");
  const stubsPath = path.join(fixtureRoot, "evidence-stubs.json");
  const stubs = JSON.parse(fs.readFileSync(stubsPath, "utf8"));

  const { runClaimsEvidenceReview } = await import("./run-claims-evidence-review.js");
  const result = runClaimsEvidenceReview({
    projectRoot,
    claimSurfacePath,
    inputBoundaryRoot: fixtureRoot,
    outputDir: args.output_dir,
    evidenceStubs: stubs,
    executionPolicy: args.execution_policy ?? "static_only",
    requestToken,
    runId: args.run_id ?? "mcp-run",
    includePilotSamples: true,
  });

  if (!result.ok) {
    return { ok: false as const, error: result.error };
  }

  return {
    ok: true as const,
    request_token: requestToken,
    report: result.report,
    provenance: result.provenance,
    output_paths: result.outputPaths,
  };
}

export async function runClaimsEvidenceReviewMcpFromDefaults(args: {
  tied_base_path: string;
  output_dir: string;
  request_token?: string;
}) {
  const projectRoot = path.dirname(args.tied_base_path);
  return runClaimsEvidencePilot({
    projectRoot,
    fixtureRoot: path.join(projectRoot, "mcp-server/test/fixtures/claims-evidence-review/tied-generated"),
    outputDir: args.output_dir,
    requestToken: args.request_token,
  });
}
