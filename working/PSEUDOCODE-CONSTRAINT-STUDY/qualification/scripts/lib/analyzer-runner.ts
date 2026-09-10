import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { MCP_SERVER_ROOT } from "./constants.ts";
import type { ManifestEntry } from "./manifest.ts";

export type AnalyzerSweepOptions = {
  gate_mode: boolean;
  typed_flow?: boolean;
  typed_gate_errors?: boolean;
};

export type SweepResult = {
  entry_id: string;
  ok: boolean;
  stage?: "input" | "parse";
  error?: string;
  report_path: string;
  snapshot_path: string;
};

async function loadAnalyzer() {
  const analyzerPath = join(
    MCP_SERVER_ROOT,
    "dist/analysis/pseudocode-analyzer.js",
  );
  const reportPath = join(
    MCP_SERVER_ROOT,
    "dist/analysis/pseudocode-analyze-report.js",
  );
  const [{ analyzeEssencePseudocode }, { serializeAnalysisReport }] =
    await Promise.all([import(analyzerPath), import(reportPath)]);
  return { analyzeEssencePseudocode, serializeAnalysisReport };
}

export async function analyzeSidecarEntry(
  entry: ManifestEntry,
  options: AnalyzerSweepOptions,
): Promise<{ reportJson: string; report: Record<string, unknown> }> {
  const { analyzeEssencePseudocode, serializeAnalysisReport } =
    await loadAnalyzer();
  const pseudocode = await readFile(entry.sidecar_path, "utf8");

  const input: Record<string, unknown> = {
    token: entry.token,
    pseudocode,
    gate_mode: options.gate_mode,
  };
  if (options.typed_flow === true) {
    input.typed_flow = true;
  }
  if (options.typed_gate_errors === true) {
    input.typed_gate_errors = true;
  }

  const report = analyzeEssencePseudocode(
    input as Parameters<typeof analyzeEssencePseudocode>[0],
  );
  return {
    report: report as Record<string, unknown>,
    reportJson: serializeAnalysisReport(
      report as Parameters<typeof serializeAnalysisReport>[0],
    ),
  };
}
