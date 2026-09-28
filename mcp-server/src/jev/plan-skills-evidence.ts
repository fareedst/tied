/**
 * [IMPL-TIED_JEV_DECISION_COPROCESSOR] [REQ-TIED_JEV_DECISION_COPROCESSOR]
 */

import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { isValidWorkingRequestToken } from "../working-request-token.js";

const RUN_ID_RE = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;

export function generatePlanSkillsRunId(now = new Date()): string {
  const compact = now.toISOString().replace(/[-:.]/g, "").slice(0, 15);
  const hex = crypto.randomBytes(4).toString("hex");
  return `ps-${compact}-${hex}`;
}

export function normalizePlanSkillsRunId(supplied: string | undefined): string | { error: "invalid_run_id" } {
  if (supplied === undefined || supplied.trim() === "") {
    return generatePlanSkillsRunId();
  }
  if (!RUN_ID_RE.test(supplied)) {
    return { error: "invalid_run_id" };
  }
  return supplied;
}

export function resolvePlanSkillsEvidenceDir(
  projectRoot: string,
  requestToken: string,
  runId: string,
): { dir: string; artifact_relpath: string } | { error: "invalid_request_token" | "unsafe_evidence_path" } {
  if (!isValidWorkingRequestToken(requestToken)) {
    return { error: "invalid_request_token" };
  }
  const anchor = path.resolve(projectRoot, "working", requestToken, "jev", "plan-skills");
  const dir = path.resolve(anchor, runId);
  const rel = path.relative(anchor, dir);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    return { error: "unsafe_evidence_path" };
  }
  const artifact_relpath = path.join(
    "working",
    requestToken,
    "jev",
    "plan-skills",
    runId,
    "vocab-shadow.v1.json",
  );
  return { dir, artifact_relpath };
}

export function writeVocabShadowEvidence(
  projectRoot: string,
  requestToken: string,
  runId: string,
  payload: Record<string, unknown>,
): { artifact_relpath: string } | { error: "invalid_request_token" | "unsafe_evidence_path" } {
  const resolved = resolvePlanSkillsEvidenceDir(projectRoot, requestToken, runId);
  if ("error" in resolved) {
    return resolved;
  }
  fs.mkdirSync(resolved.dir, { recursive: true });
  const filePath = path.join(resolved.dir, "vocab-shadow.v1.json");
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return { artifact_relpath: resolved.artifact_relpath };
}

export function writeTriagePilotEvidence(
  projectRoot: string,
  requestToken: string,
  runId: string,
  payload: Record<string, unknown>,
): { artifact_relpath: string } | { error: "invalid_request_token" | "unsafe_evidence_path" } {
  const resolved = resolvePlanSkillsEvidenceDir(projectRoot, requestToken, runId);
  if ("error" in resolved) {
    return resolved;
  }
  fs.mkdirSync(resolved.dir, { recursive: true });
  const filePath = path.join(resolved.dir, "adversarial-triage-pilot.v1.json");
  const artifact_relpath = path.join(
    "working",
    requestToken,
    "jev",
    "plan-skills",
    runId,
    "adversarial-triage-pilot.v1.json",
  );
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
  return { artifact_relpath };
}
