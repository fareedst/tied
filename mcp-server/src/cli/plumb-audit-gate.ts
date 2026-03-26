#!/usr/bin/env node
/**
 * CLI wrapper for plumb audit gate.
 *
 * Default policy: warn-only (voluntary gate). Use --policy strict to block on gap failures.
 */

import path from "node:path";
import os from "node:os";
import child_process from "node:child_process";
import fs from "node:fs";
import { runPlumbAuditGate, type PlumbAuditGatePolicy, type PlumbAuditGateSource } from "../analysis/plumb-audit-gate.js";

function usage(): void {
  // eslint-disable-next-line no-console
  console.log(`Usage: plumb-audit-gate [options]

Options:
  --policy warn-only|strict              Default: warn-only
  --source pre-commit|ci|manual        Default: manual
  --selection staged|unstaged|both     Default: staged
  --diff-base REF                      Optional CI-only: compare against REF by building a temp index from REF (git read-tree), so staged-diff preview sees the base..HEAD delta.
  --paths a,b,c                        Optional explicit path list restriction
  --include-removed true|false         Default: true
  --max-files N
  --max-patch-bytes N
  --max-total-patch-bytes N
  --audit-log-path PATH               Default: plumb-audit/audit-log.jsonl
  --attempt-id ID                     Optional override for attempt_id
  --traceability-strict true|false    Default: true (used for gap exit_policy fields)
  --override                           Force allow in strict mode (also supports PLUMB_AUDIT_GATE_OVERRIDE=1)
  --help
`);
}

function parseBool(s: string | undefined): boolean | undefined {
  if (s === undefined) return undefined;
  const v = s.trim().toLowerCase();
  if (v === "true" || v === "1" || v === "yes" || v === "on") return true;
  if (v === "false" || v === "0" || v === "no" || v === "off") return false;
  return undefined;
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  if (argv.includes("--help") || argv.includes("-h")) {
    usage();
    process.exit(0);
  }

  const getValue = (flag: string): string | undefined => {
    const idx = argv.indexOf(flag);
    if (idx < 0) return undefined;
    const v = argv[idx + 1];
    if (!v || v.startsWith("--")) return undefined;
    return v;
  };

  const policyRaw = getValue("--policy");
  const policy: PlumbAuditGatePolicy = (policyRaw === "strict" ? "strict" : "warn-only");
  const sourceRaw = getValue("--source");
  const source: PlumbAuditGateSource = (sourceRaw === "pre-commit" || sourceRaw === "ci" ? sourceRaw : "manual");

  const selectionRaw = getValue("--selection");
  const selection = (selectionRaw === "unstaged" || selectionRaw === "both" ? selectionRaw : "staged") as
    | "staged"
    | "unstaged"
    | "both";

  const pathsRaw = getValue("--paths");
  const paths = pathsRaw
    ? pathsRaw
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : undefined;

  const includeRemoved = parseBool(getValue("--include-removed"));
  const maxFiles = Number(getValue("--max-files") ?? "");
  const maxPatchBytes = Number(getValue("--max-patch-bytes") ?? "");
  const maxTotalPatchBytes = Number(getValue("--max-total-patch-bytes") ?? "");

  const traceabilityStrict = parseBool(getValue("--traceability-strict"));
  const attemptId = getValue("--attempt-id");
  const diffBase = getValue("--diff-base");

  const auditLogPathRaw = getValue("--audit-log-path");
  const auditLogPath = auditLogPathRaw
    ? path.isAbsolute(auditLogPathRaw)
      ? auditLogPathRaw
      : path.resolve(process.cwd(), auditLogPathRaw)
    : path.resolve(process.cwd(), "plumb-audit", "audit-log.jsonl");

  const overrideApplied = argv.includes("--override");

  let tempIndexFile: string | null = null;
  const oldIndexFile = process.env.GIT_INDEX_FILE;

  try {
    if (diffBase) {
      // CI mode: make staged-diff preview behave like "diff-base..HEAD" by swapping the git index.
      tempIndexFile = path.join(
        os.tmpdir(),
        `plumb-audit-gate-index-${Date.now()}-${process.pid}.idx`
      );
      process.env.GIT_INDEX_FILE = tempIndexFile;
      child_process.execFileSync("git", ["read-tree", diffBase], {
        stdio: ["ignore", "ignore", "ignore"],
        env: { ...process.env },
      });
    }

    const res = await runPlumbAuditGate({
      policy,
      source,
      selection,
      paths,
      include_removed: includeRemoved,
      max_files: Number.isFinite(maxFiles) && maxFiles > 0 ? maxFiles : undefined,
      max_patch_bytes: Number.isFinite(maxPatchBytes) && maxPatchBytes > 0 ? maxPatchBytes : undefined,
      max_total_patch_bytes:
        Number.isFinite(maxTotalPatchBytes) && maxTotalPatchBytes > 0 ? maxTotalPatchBytes : undefined,
      traceability_strict: traceabilityStrict,
      override_applied: overrideApplied,
      audit_log_path: auditLogPath,
      attempt_id: attemptId,
    });

    const gapId = res.gap_summary_ref?.id;
    if (res.tool_error) {
      // eslint-disable-next-line no-console
      console.error(`Plumb audit gate: ERROR (${res.fail_reason ?? "tool_error"}).`);
      // eslint-disable-next-line no-console
      console.error(`Attempt: ${res.attempt_id}`);
      // eslint-disable-next-line no-console
      console.error(`Audit log: ${auditLogPath}`);
      process.exit(res.blocked ? 1 : 0);
      return;
    }

    if (res.pass) {
      // eslint-disable-next-line no-console
      console.log(`Plumb audit gate: PASS (attempt ${res.attempt_id}). Audit log: ${auditLogPath}`);
      process.exit(0);
      return;
    }

    if (res.blocked) {
      // eslint-disable-next-line no-console
      console.error(`Plumb audit gate: FAIL (gap summary ${gapId ?? "n/a"}). Commit blocked under --policy strict.`);
      // eslint-disable-next-line no-console
      console.error(`Fix: add required [REQ-*] test/production marker references, then retry.`);
      // eslint-disable-next-line no-console
      console.error(`Override: set PLUMB_AUDIT_GATE_OVERRIDE=1 to allow this commit attempt.`);
      // eslint-disable-next-line no-console
      console.error(`Attempt: ${res.attempt_id}`);
      // eslint-disable-next-line no-console
      console.error(`Audit log: ${auditLogPath}`);
      process.exit(1);
      return;
    }

    // Warn-only
    // eslint-disable-next-line no-console
    console.warn(`Plumb audit gate: WARN (gap summary ${gapId ?? "n/a"}). No commit blocked (policy ${policy}).`);
    // eslint-disable-next-line no-console
    console.warn(`Attempt: ${res.attempt_id}`);
    // eslint-disable-next-line no-console
    console.warn(`Audit log: ${auditLogPath}`);
    process.exit(0);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`Plumb audit gate: fatal error: ${e instanceof Error ? e.message : String(e)}`);
    process.exit(1);
  } finally {
    // Restore prior git env even when gate fails.
    if (oldIndexFile === undefined) delete process.env.GIT_INDEX_FILE;
    else process.env.GIT_INDEX_FILE = oldIndexFile;
    if (tempIndexFile && fs.existsSync(tempIndexFile)) {
      try {
        fs.rmSync(tempIndexFile, { force: true });
      } catch {
        // ignore
      }
    }
  }
}

main();

