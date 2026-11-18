/**
 * [REQ-TIED_HACKERNOON_OBSERVABILITY_CONTRACT_WAVE3]
 * Opt-in validator: closed enrolled REQ folders must carry verify manifests + handoff receipts.
 * Not a substitute for tied_checklist_gate_validate / tied_verify.
 */
import fs from "node:fs";
import path from "node:path";

const CLOSED_PLAN_RE = /plan_phase:\s*closed/i;
const HANDOFF_RECEIPT_RE =
  /verification-evidence-manifest\.v1\.json|gates\/|non-tied-close|doc-only exception/i;

/**
 * @param {string} repoRoot Repository root containing `tied-project/working/`
 * @param {string} enrollmentPath Path to implement-complete-receipt-enrollment.v1.json
 * @returns {{ ok: boolean, violations?: string[] }}
 */
export function validateEnrolledCloseout(repoRoot, enrollmentPath) {
  const violations = [];

  if (!fs.existsSync(enrollmentPath)) {
    return { ok: false, violations: [`missing enrollment: ${enrollmentPath}`] };
  }

  let enrollment;
  try {
    enrollment = JSON.parse(fs.readFileSync(enrollmentPath, "utf8"));
  } catch (err) {
    return { ok: false, violations: [`invalid enrollment JSON: ${err.message}`] };
  }

  const tokens = enrollment.enrolled_request_tokens;
  if (!Array.isArray(tokens) || tokens.length === 0) {
    return { ok: false, violations: ["enrollment enrolled_request_tokens must be non-empty array"] };
  }

  for (const token of tokens) {
    const workingDir = path.join(repoRoot, "tied-project", "working", token);
    const planPath = path.join(workingDir, "PLAN.md");
    if (!fs.existsSync(planPath)) {
      violations.push(`${token}: missing PLAN.md under ${workingDir}`);
      continue;
    }

    const planText = fs.readFileSync(planPath, "utf8");
    if (!CLOSED_PLAN_RE.test(planText)) {
      continue;
    }

    const manifestPath = path.join(workingDir, "evidence", "verification-evidence-manifest.v1.json");
    if (!fs.existsSync(manifestPath)) {
      violations.push(`${token}: plan_phase closed but missing ${manifestPath}`);
      continue;
    }

    let manifest;
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
    } catch (err) {
      violations.push(`${token}: invalid manifest JSON: ${err.message}`);
      continue;
    }

    const commands = manifest.commands ?? [];
    const validCommand = commands.some(
      (entry) =>
        entry &&
        typeof entry.command === "string" &&
        entry.command.length > 0 &&
        typeof entry.exit_code === "number",
    );
    if (!validCommand) {
      violations.push(`${token}: manifest must include ≥1 commands[] entry with command + exit_code`);
    }

    const handoffPath = path.join(workingDir, "evidence", "session-handoff.md");
    if (!fs.existsSync(handoffPath)) {
      violations.push(`${token}: plan_phase closed but missing session-handoff.md`);
      continue;
    }
    const handoffText = fs.readFileSync(handoffPath, "utf8");
    if (!HANDOFF_RECEIPT_RE.test(handoffText)) {
      violations.push(
        `${token}: session-handoff must reference manifest, gates/, non-tied-close, or doc-only exception`,
      );
    }
  }

  return violations.length === 0 ? { ok: true } : { ok: false, violations };
}