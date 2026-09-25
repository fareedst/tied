import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import yaml from "js-yaml";

import { isRecord } from "./yaml-load.js";

/** [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION] — How: W2a git HEAD vs CITDP/Tracker branch with manifest/CITDP opt-out. */

export type BranchCheckResult = {
  ok: boolean;
  exit_code: 0 | 1 | 2;
  skipped?: boolean;
  current?: string;
  expected?: string;
  reasons: string[];
};

function readRepoTiedYaml(projectRoot: string): Record<string, unknown> | undefined {
  const configPath = path.join(projectRoot, ".tied-yaml.yaml");
  if (!fs.existsSync(configPath)) {
    return undefined;
  }
  try {
    const raw = yaml.load(fs.readFileSync(configPath, "utf8"));
    return isRecord(raw) ? raw : undefined;
  } catch {
    return undefined;
  }
}

export function branchCheckOptOut(projectRoot: string, citdp?: Record<string, unknown>): boolean {
  const repo = readRepoTiedYaml(projectRoot);
  const dae = repo && isRecord(repo.dae) ? repo.dae : undefined;
  if (dae?.branch_check === false) {
    return true;
  }
  if (citdp?.branch_check === "skip") {
    return true;
  }
  return false;
}

export function resolveExpectedBranch(
  citdp?: Record<string, unknown>,
  tracker?: Record<string, unknown>,
): string | undefined {
  const fromCitdp = citdp?.branch;
  if (typeof fromCitdp === "string" && fromCitdp.trim()) {
    return fromCitdp.trim();
  }
  const evidence = tracker?.execution_evidence;
  if (isRecord(evidence)) {
    const fromTracker = evidence.branch;
    if (typeof fromTracker === "string" && fromTracker.trim()) {
      return fromTracker.trim();
    }
  }
  return undefined;
}

export function gitCurrentBranch(projectRoot: string): { ok: true; branch: string } | { ok: false; reason: string } {
  try {
    const branch = execFileSync("git", ["rev-parse", "--abbrev-ref", "HEAD"], {
      cwd: projectRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
    if (!branch) {
      return { ok: false, reason: "git_empty_ref" };
    }
    return { ok: true, branch };
  } catch {
    return { ok: false, reason: "not_a_git_repo" };
  }
}

export type RunBranchCheckInput = {
  projectRoot: string;
  citdp?: Record<string, unknown>;
  tracker?: Record<string, unknown>;
};

/** Standalone branch hygiene check — exit 0 match/skip, 1 mismatch, 2 not git. */
export function runBranchCheck(input: RunBranchCheckInput): BranchCheckResult {
  const projectRoot = path.resolve(input.projectRoot);
  if (branchCheckOptOut(projectRoot, input.citdp)) {
    return { ok: true, exit_code: 0, skipped: true, reasons: ["branch_check_skipped"] };
  }

  const expected = resolveExpectedBranch(input.citdp, input.tracker);
  const currentResult = gitCurrentBranch(projectRoot);
  if (!currentResult.ok) {
    return {
      ok: false,
      exit_code: 2,
      reasons: [currentResult.reason],
    };
  }

  if (!expected) {
    return {
      ok: true,
      exit_code: 0,
      current: currentResult.branch,
      reasons: ["no_expected_branch"],
    };
  }

  const match = currentResult.branch === expected;
  return {
    ok: match,
    exit_code: match ? 0 : 1,
    current: currentResult.branch,
    expected,
    reasons: match ? [] : [`branch_mismatch:${currentResult.branch}!=${expected}`],
  };
}
