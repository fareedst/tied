/**
 * [IMPL-TIED_NEW_CLIENT_ONBOARDING] [ARCH-TIED_NEW_CLIENT_ADHERENCE]
 * [REQ-TIED_NEW_CLIENT_ADHERENCE] [REQ-TIED_SETUP] [IMPL-TIED_FILES]
 * How: Fail-closed Layer A audit after bootstrap — spawn run-tied-new-client-audit.mjs from source root.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

export function defaultOnboardingAuditReportPath(clientDir) {
  return path.join(clientDir, "working", "tied-new-client-audit.v1.json");
}

export function shouldSkipNewClientOnboardingAudit(env = process.env, options = {}) {
  if (options.skipOnboardingAudit === true) {
    return true;
  }
  const flag = env.TIED_SKIP_NEW_CLIENT_AUDIT;
  return flag === "1" || flag === "true";
}

/**
 * @param {{
 *   clientDir: string;
 *   sourceRoot: string;
 *   nodeExec?: string;
 *   spawn?: typeof spawnSync;
 *   skipOnboardingAudit?: boolean;
 *   env?: NodeJS.ProcessEnv;
 * }} options
 */
export function runNewClientOnboardingAudit(options) {
  const {
    clientDir,
    sourceRoot,
    nodeExec = process.execPath,
    spawn = spawnSync,
    env = process.env,
  } = options;

  if (shouldSkipNewClientOnboardingAudit(env, options)) {
    return { ok: true, code: 0, step: "onboarding_audit", skipped: true };
  }

  const script = path.join(sourceRoot, "scripts", "run-tied-new-client-audit.mjs");
  if (!fs.existsSync(script)) {
    return {
      ok: false,
      code: 1,
      step: "onboarding_audit",
      stderr: `Onboarding audit script not found: ${script}`,
    };
  }

  const reportPath = defaultOnboardingAuditReportPath(clientDir);
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });

  const result = spawn(
    nodeExec,
    [script, "--client-root", clientDir, "--json-out", reportPath],
    {
      cwd: sourceRoot,
      encoding: "utf8",
      stdio: "pipe",
    },
  );

  return {
    ok: result.status === 0,
    code: result.status ?? 1,
    step: "onboarding_audit",
    stderr: result.stderr,
    stdout: result.stdout,
    reportPath,
  };
}
