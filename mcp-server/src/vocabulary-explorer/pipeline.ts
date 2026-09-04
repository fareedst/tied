/**
 * [IMPL-VOCABULARY_ANALYSIS] [ARCH-VOCABULARY_EXPLORER] [REQ-VOCABULARY_EXPLORER]
 * End-to-end vocabulary explorer pipeline (read-only).
 */

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import {
  collectScopedSourceFiles,
  loadAnalysisConfig,
  resolveClientProjectRootFromCwd,
  resolveScopedRoots,
  type ScopedAnalysisArgs,
} from "../analysis/scoped-analysis.js";
import { getClientProjectRoot } from "../yaml-loader.js";
import { analyzeSourceTerms, type TermAnalysisPolicy } from "./term-analysis.js";
import { loadTiedRecordCatalog } from "./tied-records.js";
import { projectVocabularyExplorerV1, type VocabularyExplorerV1Envelope } from "./view-model.js";
import { renderVocabularyExplorerHtml } from "./html-renderer.js";

export type VocabularyExplorerOptions = {
  config_path?: string;
  roots?: string[];
  min_frequency?: number;
  max_terms?: number;
  include_extensions?: string[];
  identifier_mode?: "ast" | "lexical";
  generated_at?: string;
};

export type VocabularyExplorerResult = {
  ok: boolean;
  envelope?: VocabularyExplorerV1Envelope;
  html?: string;
  error?: string;
};

const DEFAULT_CONFIG_PATH = ".tiedanalysis.yaml";

function loadTraceabilityGapConfig(configPath: string): TermAnalysisPolicy["traceability_gap"] {
  try {
    const raw = fs.readFileSync(configPath, "utf8");
    const parsed = yaml.load(raw) as { traceability_gap?: TermAnalysisPolicy["traceability_gap"] };
    return parsed?.traceability_gap;
  } catch {
    return undefined;
  }
}

function isBinaryLike(buf: Buffer): boolean {
  for (let i = 0; i < Math.min(buf.length, 4000); i++) {
    if (buf[i] === 0) return true;
  }
  return false;
}

/**
 * [IMPL-VOCABULARY_ANALYSIS] [ARCH-VOCABULARY_EXPLORER] [REQ-VOCABULARY_EXPLORER]
 * How: walk, analyze, load TIED records, project v1, optionally render HTML.
 */
export function runVocabularyExplorer(
  options: VocabularyExplorerOptions = {},
): VocabularyExplorerResult {
  const projectRoot = resolveClientProjectRootFromCwd(process.cwd());
  const configPath = options.config_path ?? DEFAULT_CONFIG_PATH;
  const configPathAbs = path.isAbsolute(configPath)
    ? configPath
    : path.resolve(projectRoot, configPath);

  const args: ScopedAnalysisArgs = {
    config_path: configPath,
    project_root: projectRoot,
    roots: options.roots,
    include_extensions: options.include_extensions,
  };

  const walk = collectScopedSourceFiles(args);
  if (!walk.ok) return { ok: false, error: walk.error ?? "walk failed" };

  const include_extensions =
    options.include_extensions ??
    loadAnalysisConfig(configPathAbs).token_scan?.include_extensions ?? [
      ".ts",
      ".tsx",
      ".js",
      ".mjs",
      ".rb",
      ".md",
      ".yaml",
      ".yml",
      ".json",
    ];

  const policy: TermAnalysisPolicy = {
    min_frequency: options.min_frequency ?? 2,
    max_terms: options.max_terms ?? 10_000,
    include_extensions,
    identifier_mode: options.identifier_mode ?? "ast",
    traceability_gap: loadTraceabilityGapConfig(configPathAbs),
  };

  const maxFileBytes = 250_000;
  const fileEntries: { relPosix: string; text: string }[] = [];

  for (const file of walk.files) {
    let st: fs.Stats;
    try {
      st = fs.statSync(file.absPath);
    } catch {
      continue;
    }
    if (st.size > maxFileBytes) continue;
    let buf: Buffer;
    try {
      buf = fs.readFileSync(file.absPath);
    } catch {
      continue;
    }
    if (isBinaryLike(buf)) continue;
    fileEntries.push({ relPosix: file.relPosix, text: buf.toString("utf8") });
  }

  const sourceAnalysis = analyzeSourceTerms(fileEntries, policy);
  const tiedCatalog = loadTiedRecordCatalog();
  const clientRoot = getClientProjectRoot();
  const projectRootLabel = path.basename(clientRoot);

  const envelope = projectVocabularyExplorerV1({
    sourceAnalysis,
    tiedCatalog,
    walkSummary: walk.summary,
    filesScanned: walk.files.length,
    policy,
    projectRootLabel,
    generatedAt: options.generated_at,
  });

  const html = renderVocabularyExplorerHtml(envelope);
  return { ok: true, envelope, html };
}

export { resolveScopedRoots };
