/**
 * [IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [ARCH-PSEUDOCODE_GRAMMAR_V2_DEFAULT] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT]
 * How: Cohort replay grammar_v2_header enforcement when corpus row expects pass.
 */
import fs from "node:fs";
import path from "node:path";

import { runGrammarV2DefaultAudit } from "./audit-grammar-v2-default.mjs";

export function corpusProjects(corpus) {
  return (corpus?.projects ?? corpus?.rows ?? []).filter(
    (row) => row?.project_root && row?.request_token,
  );
}

export function grammarV2HeaderExpectPass(row) {
  return String(row?.grammar_v2_header_expect ?? "").trim().toLowerCase() === "pass";
}

/**
 * @param {object} row
 * @param {string} stdRoot stdd repo root (operator artifact paths)
 */
export function resolveGrammarV2AuditArtifactPath(row, stdRoot) {
  const raw = row?.grammar_v2_audit_artifact;
  if (!raw || typeof raw !== "string" || !raw.trim()) {
    return null;
  }
  const trimmed = raw.trim();
  if (path.isAbsolute(trimmed)) {
    return trimmed;
  }
  return path.resolve(stdRoot, trimmed);
}

/**
 * @param {import("./audit-grammar-v2-default.mjs").runGrammarV2DefaultAudit extends (...args: any[]) => infer R ? R : never} report
 */
export function evaluateGrammarV2AuditReport(report) {
  const header = report?.dimensions?.grammar_v2_header ?? report?.audit?.dimensions?.grammar_v2_header;
  const failures = [];
  if (report?.ok !== true) {
    failures.push("audit.ok is not true");
  }
  if (header !== "pass") {
    failures.push(`dimensions.grammar_v2_header expected pass, got ${String(header)}`);
  }
  return failures.length === 0
    ? { ok: true, header, report }
    : { ok: false, failures, header, report };
}

/**
 * @param {object} row corpus row with project_root
 * @param {{ stdRoot: string, writeArtifact?: boolean }} options
 */
export function runCorpusGrammarV2Audit(row, options) {
  const projectRoot = path.resolve(String(row.project_root));
  if (!fs.existsSync(projectRoot)) {
    return { ok: false, error: "missing_project_root", projectRoot };
  }
  let report;
  try {
    report = runGrammarV2DefaultAudit(projectRoot);
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : String(error),
      projectRoot,
    };
  }

  const artifactPath = resolveGrammarV2AuditArtifactPath(row, options.stdRoot);
  if (options.writeArtifact !== false && artifactPath) {
    fs.mkdirSync(path.dirname(artifactPath), { recursive: true });
    fs.writeFileSync(artifactPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  }

  let readBackOk = true;
  if (artifactPath && fs.existsSync(artifactPath)) {
    try {
      const onDisk = JSON.parse(fs.readFileSync(artifactPath, "utf8"));
      readBackOk = onDisk?.ok === report.ok && onDisk?.schema_version === report.schema_version;
    } catch {
      readBackOk = false;
    }
  }

  const evaluation = evaluateGrammarV2AuditReport(report);
  if (!readBackOk && artifactPath) {
    evaluation.ok = false;
    evaluation.failures = [...(evaluation.failures ?? []), "grammar_v2_audit_artifact read-back mismatch"];
  }
  return {
    ...evaluation,
    artifactPath: artifactPath ?? undefined,
    projectRoot,
  };
}
