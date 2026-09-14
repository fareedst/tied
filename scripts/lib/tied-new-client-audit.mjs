/**
 * [IMPL-TIED_NEW_CLIENT_ONBOARDING] [ARCH-TIED_NEW_CLIENT_ADHERENCE]
 * [REQ-TIED_NEW_CLIENT_ADHERENCE] [REQ-PSEUDOCODE_GRAMMAR_V2_DEFAULT]
 * How: Client-root G4 onboarding audit — compose grammar audit, optional consistency, persist report.
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { runGrammarV2DefaultAudit, REPO_ROOT } from "./audit-grammar-v2-default.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const SCHEMA_VERSION = "tied-new-client-audit.v1";
export const PROOF_BOUNDARY =
  "onboarding-adherent bootstrap only; not fleet-migrated-client without G3 receipts";
export const CLIENT_TEMPLATE_REL = path.join("templates", "impl-essence-pseudocode-template.md");
export const DEFAULT_AUDIT_COMMAND = "node scripts/run-tied-new-client-audit.mjs";

/**
 * @param {string} clientRoot
 */
export function resolveClientRoot(clientRoot) {
  const resolved = path.resolve(clientRoot);
  if (!fs.existsSync(resolved)) {
    throw new Error(`CLIENT_ROOT_INVALID: directory not found: ${resolved}`);
  }
  const tiedDir = path.join(resolved, "tied");
  if (!fs.existsSync(tiedDir)) {
    throw new Error(`CLIENT_ROOT_INVALID: missing tied/ under ${resolved}`);
  }
  const templatePath = path.join(resolved, CLIENT_TEMPLATE_REL);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`CLIENT_ROOT_INVALID: missing ${CLIENT_TEMPLATE_REL}`);
  }
  return resolved;
}

/**
 * @param {{
 *   clientRoot: string;
 *   grammarAudit: object;
 *   withConsistency?: boolean;
 *   consistencyResult?: { ok?: boolean; skipped?: boolean; detail?: string };
 *   generatedAt?: string;
 *   auditCommand?: string;
 * }} input
 */
export function buildOnboardingAuditReport(input) {
  const withConsistency = input.withConsistency === true;
  const generatedAt = input.generatedAt ?? new Date().toISOString();
  const consistency = withConsistency
    ? (input.consistencyResult ?? { ok: false, detail: "consistency not run" })
    : { skipped: true };

  let consistencyOk = true;
  if (withConsistency) {
    consistencyOk = input.consistencyResult?.ok === true;
  }

  const grammarOk = input.grammarAudit?.ok === true;
  return {
    schema_version: SCHEMA_VERSION,
    generated_at: generatedAt,
    client_root: input.clientRoot,
    ok: grammarOk && consistencyOk,
    gate_stage: "G4",
    with_consistency: withConsistency,
    proof_boundary: PROOF_BOUNDARY,
    grammar_audit: input.grammarAudit,
    consistency,
    audit_command: input.auditCommand ?? DEFAULT_AUDIT_COMMAND,
  };
}

/**
 * @param {string} reportPath
 * @param {object} report
 */
export function writeOnboardingAuditReport(reportPath, report) {
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
}

/**
 * @param {string} clientRoot
 * @param {{ tiedCliPath?: string; repoRoot?: string }} [options]
 */
export function runTiedValidateConsistency(clientRoot, options = {}) {
  const repoRoot = options.repoRoot ?? REPO_ROOT;
  const tiedCli =
    options.tiedCliPath ??
    path.join(repoRoot, ".cursor/skills/tied-yaml/scripts/tied-cli.sh");
  const tiedBase = path.join(path.resolve(clientRoot), "tied");
  if (!fs.existsSync(tiedCli)) {
    return { ok: false, detail: `CONSISTENCY_TOOL_UNAVAILABLE: ${tiedCli}` };
  }
  try {
    const out = execFileSync("bash", [tiedCli, "tied_validate_consistency", "{}"], {
      cwd: repoRoot,
      encoding: "utf8",
      env: { ...process.env, TIED_BASE_PATH: tiedBase },
      stdio: "pipe",
    });
    const parsed = JSON.parse(out);
    const indexOk =
      parsed?.index?.requirements?.valid !== false &&
      parsed?.index?.architecture?.valid !== false &&
      parsed?.index?.implementation?.valid !== false;
    const detailIssues = parsed?.detail_issues ?? parsed?.issues ?? [];
    const ok = parsed?.ok === true || (indexOk && detailIssues.length === 0);
    return { ok: ok === true, detail: ok ? undefined : out.slice(0, 2000) };
  } catch (err) {
    const text = String(err.stderr ?? err.stdout ?? err).slice(0, 2000);
    return { ok: false, detail: text };
  }
}

/**
 * @param {{
 *   clientRoot: string;
 *   withConsistency?: boolean;
 *   reportPath?: string;
 *   auditCommand?: string;
 *   generatedAt?: string;
 *   runGrammarAudit?: (clientRoot: string) => object;
 *   runConsistency?: (clientRoot: string) => { ok?: boolean; skipped?: boolean; detail?: string };
 *   repoRoot?: string;
 * }} options
 */
export function runTiedNewClientAudit(options) {
  const clientRoot = resolveClientRoot(options.clientRoot);
  const runGrammarAudit =
    options.runGrammarAudit ??
    ((root) => runGrammarV2DefaultAudit(root, { gateStage: "G4" }));

  const grammarAudit = runGrammarAudit(clientRoot);
  let consistencyResult = { skipped: true };
  if (options.withConsistency) {
    consistencyResult =
      options.runConsistency?.(clientRoot) ??
      runTiedValidateConsistency(clientRoot, { repoRoot: options.repoRoot });
  }

  const report = buildOnboardingAuditReport({
    clientRoot,
    grammarAudit,
    withConsistency: options.withConsistency,
    consistencyResult,
    generatedAt: options.generatedAt,
    auditCommand: options.auditCommand,
  });

  if (options.reportPath) {
    writeOnboardingAuditReport(options.reportPath, report);
  }

  return { ok: report.ok === true, report, grammarAudit, consistencyResult };
}
