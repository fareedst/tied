/**
 * [IMPL-TIED_DAE_INCORPORATION] [ARCH-TIED_DAE_INCORPORATION] [REQ-TIED_DAE_INCORPORATION]
 * How: W2d diff-scoped CRAP report composing path list + coverage map (test_adequacy metadata style only).
 */

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";

export type DiffScopedCrapInput = {
  request_token: string;
  project_root: string;
  diff_paths: string[];
  coverage_by_path: Record<string, number>;
  complexity_by_path?: Record<string, number>;
  threshold: number;
  enabled: boolean;
  diff_scoped_crap?: boolean;
  crap_block?: boolean;
  hook_slug: "verification-gate" | "traceable-commit";
  timestamp?: string;
};

export type DiffScopedCrapFileRow = {
  path: string;
  complexity: number;
  coverage_percent: number;
  crap_score: number;
  above_threshold: boolean;
};

export type DiffScopedCrapReport = {
  schema_version: "diff-scoped-crap.v1";
  request_token: string;
  hook_slug: DiffScopedCrapInput["hook_slug"];
  threshold: number;
  enabled: boolean;
  crap_block: boolean;
  generated_at: string;
  files: DiffScopedCrapFileRow[];
  max_crap_score: number;
  action: "skipped" | "pass" | "warn" | "fail";
  proof_boundary: string;
};

function crapScore(complexity: number, coveragePercent: number): number {
  const uncovered = 1 - Math.min(100, Math.max(0, coveragePercent)) / 100;
  return complexity * uncovered * uncovered + complexity;
}

export function buildDiffScopedCrapReport(input: DiffScopedCrapInput): DiffScopedCrapReport {
  const enabled = input.enabled && input.diff_scoped_crap !== false;
  const timestamp = input.timestamp ?? new Date().toISOString().replace(/[:.]/g, "-");
  const crapBlock = input.crap_block !== false;

  if (!enabled) {
    return {
      schema_version: "diff-scoped-crap.v1",
      request_token: input.request_token,
      hook_slug: input.hook_slug,
      threshold: input.threshold,
      enabled: false,
      crap_block: crapBlock,
      generated_at: timestamp,
      files: [],
      max_crap_score: 0,
      action: "skipped",
      proof_boundary:
        "Diff-scoped change-risk report uses supplied coverage map metadata only; does not invoke test_adequacy_validate or run tests.",
    };
  }

  const files: DiffScopedCrapFileRow[] = input.diff_paths.map((filePath) => {
    const complexity = input.complexity_by_path?.[filePath] ?? 1;
    const coveragePercent = input.coverage_by_path[filePath] ?? 0;
    const score = crapScore(complexity, coveragePercent);
    return {
      path: filePath,
      complexity,
      coverage_percent: coveragePercent,
      crap_score: score,
      above_threshold: score > input.threshold,
    };
  });

  const maxScore = files.reduce((max, row) => Math.max(max, row.crap_score), 0);
  const anyAbove = files.some((row) => row.above_threshold);

  let action: DiffScopedCrapReport["action"] = "pass";
  if (anyAbove) {
    if (input.hook_slug === "verification-gate" && crapBlock) {
      action = "fail";
    } else {
      action = "warn";
    }
  }

  return {
    schema_version: "diff-scoped-crap.v1",
    request_token: input.request_token,
    hook_slug: input.hook_slug,
    threshold: input.threshold,
    enabled: true,
    crap_block: crapBlock,
    generated_at: timestamp,
    files,
    max_crap_score: maxScore,
    action,
    proof_boundary:
      "Diff-scoped change-risk report uses supplied coverage map metadata only; does not invoke test_adequacy_validate or run tests.",
  };
}

export function resolveCrapThreshold(
  citdp?: Record<string, unknown>,
  projectRoot?: string,
): number {
  const fromCitdp = citdp?.crap_threshold;
  if (typeof fromCitdp === "number" && Number.isFinite(fromCitdp)) {
    return fromCitdp;
  }
  if (projectRoot) {
    try {
      const configPath = path.join(projectRoot, ".tied-yaml.yaml");
      if (fs.existsSync(configPath)) {
        const parsed = yaml.load(fs.readFileSync(configPath, "utf8"));
        if (
          typeof parsed === "object"
          && parsed !== null
          && !Array.isArray(parsed)
          && typeof (parsed as Record<string, unknown>).dae === "object"
        ) {
          const dae = (parsed as Record<string, unknown>).dae as Record<string, unknown>;
          const t = dae.crap_threshold;
          if (typeof t === "number" && Number.isFinite(t)) {
            return t;
          }
        }
      }
    } catch {
      // fall through
    }
  }
  return 30;
}

export function writeDiffScopedCrapReport(
  input: DiffScopedCrapInput,
): { ok: boolean; report: DiffScopedCrapReport; report_path?: string; error?: string } {
  const report = buildDiffScopedCrapReport(input);
  if (report.action === "skipped") {
    return { ok: true, report };
  }

  const evidenceDir = path.join(
    input.project_root,
    "working",
    input.request_token,
    "evidence",
  );
  try {
    fs.mkdirSync(evidenceDir, { recursive: true });
    const reportPath = path.join(
      evidenceDir,
      `diff-scoped-crap-${report.generated_at}.json`,
    );
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
    const ok = report.action !== "fail";
    return { ok, report, report_path: reportPath };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return { ok: false, report, error: msg };
  }
}
