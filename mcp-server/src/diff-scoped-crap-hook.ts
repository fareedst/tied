/**
 * [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION]
 * How: OPTIONAL_DIFF_SCOPED_CRAP_HOOK — compose after successful quality manifest when CITDP diff_scoped_crap is true.
 */

import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

import type { PlumbDiffImpactPreviewSelection } from "./analysis/plumb-diff-impact-preview.js";
import { loadCitdpBodyFromFile } from "./dae/yaml-load.js";
import {
  resolveCrapThreshold,
  writeDiffScopedCrapReport,
  type DiffScopedCrapReport,
} from "./diff-scoped-crap.js";

export type DiffScopedCrapHookContext = {
  request_token: string;
  project_root: string;
  citdp_path?: string;
  diff_paths?: string[];
  coverage_by_path?: Record<string, number>;
  diff_selection?: PlumbDiffImpactPreviewSelection;
};

export type DiffScopedCrapHookOutcome = {
  skipped: boolean;
  reason?: string;
  report_path?: string;
  ok?: boolean;
  action?: DiffScopedCrapReport["action"];
  error?: string;
};

function gitNameOnly(args: { staged: boolean; cwd: string }): string[] {
  try {
    const diffArgs = args.staged
      ? ["diff", "--cached", "--name-only", "--diff-filter=ACMRTUB", "--no-renames"]
      : ["diff", "--name-only", "--diff-filter=ACMRTUB", "--no-renames"];
    const raw = execFileSync("git", diffArgs, {
      cwd: args.cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return raw
      .split(/\r?\n/)
      .map((s) => s.trim())
      .filter(Boolean)
      .sort();
  } catch {
    return [];
  }
}

/** [IMPL-TIED_DAE_INCORPORATION] — How: list changed paths from git for diff-scoped change-risk report input. */
export function listGitDiffPathsInRepo(
  projectRoot: string,
  selection: PlumbDiffImpactPreviewSelection = "both",
): string[] {
  const root = path.resolve(projectRoot);
  const stagedHit = selection === "staged" || selection === "both";
  const unstagedHit = selection === "unstaged" || selection === "both";
  const staged = stagedHit ? gitNameOnly({ staged: true, cwd: root }) : [];
  const unstaged = unstagedHit ? gitNameOnly({ staged: false, cwd: root }) : [];
  return Array.from(new Set([...staged, ...unstaged])).sort();
}

function defaultCitdpPath(projectRoot: string, requestToken: string): string {
  return path.join(projectRoot, "tied", "citdp", `CITDP-${requestToken}.yaml`);
}

function readCitdpForHook(ctx: DiffScopedCrapHookContext): Record<string, unknown> | null {
  const citdpPath = ctx.citdp_path ?? defaultCitdpPath(ctx.project_root, ctx.request_token);
  if (!fs.existsSync(citdpPath)) {
    return null;
  }
  try {
    return loadCitdpBodyFromFile(path.resolve(citdpPath));
  } catch {
    return null;
  }
}

/**
 * [IMPL-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION]
 * How: verification-gate sub-step after manifest — default off via CITDP diff_scoped_crap false.
 */
export function runOptionalDiffScopedCrapAfterManifest(
  ctx: DiffScopedCrapHookContext,
): DiffScopedCrapHookOutcome {
  const citdp = readCitdpForHook(ctx);
  if (!citdp || citdp.diff_scoped_crap !== true) {
    return { skipped: true, reason: "diff_scoped_crap_disabled" };
  }

  const selection = ctx.diff_selection ?? "both";
  const diffPaths =
    ctx.diff_paths && ctx.diff_paths.length > 0
      ? [...ctx.diff_paths].sort()
      : listGitDiffPathsInRepo(ctx.project_root, selection);

  const threshold = resolveCrapThreshold(citdp, ctx.project_root);
  const crapBlock = citdp.crap_block !== false;

  const writeResult = writeDiffScopedCrapReport({
    request_token: ctx.request_token,
    project_root: path.resolve(ctx.project_root),
    diff_paths: diffPaths,
    coverage_by_path: ctx.coverage_by_path ?? {},
    threshold,
    enabled: true,
    diff_scoped_crap: true,
    crap_block: crapBlock,
    hook_slug: "verification-gate",
  });

  if (writeResult.error) {
    return {
      skipped: false,
      ok: false,
      error: writeResult.error,
      action: writeResult.report.action,
    };
  }

  if (writeResult.report.action === "skipped") {
    return { skipped: true, reason: "report_skipped", action: writeResult.report.action };
  }

  return {
    skipped: false,
    ok: writeResult.ok,
    report_path: writeResult.report_path,
    action: writeResult.report.action,
  };
}
