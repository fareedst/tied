/**
 * Scoped analysis walker with gitignore-style ignore patterns.
 *
 * Goal: run token discovery / gap analysis / impact preview over explicit roots,
 * excluding ignored paths from the filesystem walk.
 */

import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import ignore from "ignore";
import {
  getBasePath,
  listTokens,
  getDecisionsForRequirement,
  getRequirementsForDecision,
  listRequirementTokensForTraceability,
  listImplementationTokensForTraceability,
  isMethodologyOnlyIndexToken,
} from "../yaml-loader.js";
import {
  buildTraceabilityGapReport,
  type PerFileTokens,
  type TraceabilityGapProjectConfig,
  type TraceabilityGapReportResult,
} from "./traceability-gap.js";

export type { TraceabilityGapReportResult };

export type ScopedAnalysisMode =
  | "walk_summary"
  | "token_scan"
  | "gap_report"
  | "impact_preview"
  | "traceability_gap_report";

export type RootKind = "project_root" | "TIED_BASE_PATH";

export type AnalysisConfig = {
  roots?: string[];
  default_roots?: RootKind[];
  ignore_file?: string;
  ignore_inline?: string[];
  follow_symlinks?: boolean;
  token_scan?: {
    include_extensions?: string[];
    max_file_bytes?: number;
    max_files?: number;
  };
  /** Per-project traceability dimensions ([3] gap report); used when mode is traceability_gap_report. */
  traceability_gap?: TraceabilityGapProjectConfig & {
    /**
     * When true (default), methodology-only REQ/IMPL records are not evaluated for gaps;
     * they appear under traceability_gap_report.methodology_only.* .
     */
    exclude_methodology_only_records?: boolean;
  };
};

export type ScopedAnalysisArgs = {
  mode?: ScopedAnalysisMode;
  /**
   * Optional explicit roots. If provided but empty (`[]`), we fall back to defaults.
   * Paths may be absolute or cwd-relative (relative to the MCP server process cwd).
   */
  roots?: string[];
  /**
   * Optional project config file (cwd-relative unless absolute).
   * Default: `.tiedanalysis.yaml`
   */
  config_path?: string;
  /**
   * Optional ignore file (cwd-relative unless absolute).
   * Default: `.tiedignore`
   */
  ignore_file?: string;
  /** Inline ignore patterns appended to file patterns (gitignore-style). */
  ignore_patterns?: string[];
  /** Symlink policy: if false, symlinked files/dirs are skipped. */
  follow_symlinks?: boolean;
  /** Token scan: restrict to extensions. */
  include_extensions?: string[];
  /** Token scan: max bytes per file. */
  max_file_bytes?: number;
  /** Token scan: max number of files read/scanned. */
  max_files?: number;
  /**
   * When mode is traceability_gap_report, overrides `.tiedanalysis.yaml` traceability_gap.strict
   * for exit_policy / suggested_exit_code (e.g. CLI --strict).
   */
  traceability_strict?: boolean;
  /**
   * Optional explicit requirement tokens to evaluate (traceability_gap_report only).
   * When provided and non-empty, only these tokens are checked for dimensions like
   * req_without_test / req_without_implementation.
   */
  traceability_requirement_tokens?: string[];
  /**
   * Optional explicit implementation tokens to evaluate (traceability_gap_report only).
   * When provided and non-empty, only these tokens are checked for dimensions like
   * impl_without_test.
   */
  traceability_implementation_tokens?: string[];
};

export type RunSummary = {
  roots_used: string[];
  default_roots_used: string[];
  ignore_source: { type: "file" | "inline" | "file_and_inline"; path?: string };
  skipped_paths_count: number;
  followed_symlinks: boolean;
};

export type TokenScanResult = {
  discovered_tokens: { REQ: string[]; ARCH: string[]; IMPL: string[] };
  occurrences: {
    [token: string]: {
      req?: boolean;
      arch?: boolean;
      impl?: boolean;
      files: string[];
    };
  };
};

export type GapReportResult = {
  missing_tokens: string[];
  missing_count: number;
};

export type ImpactPreviewResult = {
  discovered_tokens: { REQ: string[]; ARCH: string[]; IMPL: string[] };
  impacted_requirements: string[];
  impacted_architecture: string[];
  impacted_implementation: string[];
  decisions_by_requirement: {
    [requirement_token: string]: { architecture: string[]; implementation: string[] };
  };
};

export type ScopedAnalysisResult = {
  ok: boolean;
  summary: RunSummary;
  scanned_files?: number;
  files_scanned?: string[];
  token_scan?: TokenScanResult;
  gap_report?: GapReportResult;
  traceability_gap_report?: TraceabilityGapReportResult;
  impact_preview?: ImpactPreviewResult;
  error?: string;
};

const DEFAULT_CONFIG_PATH = ".tiedanalysis.yaml";
const DEFAULT_IGNORE_FILE = ".tiedignore";

function toPosix(p: string): string {
  return p.split(path.sep).join("/");
}

function normalizeDirRel(relPath: string): string {
  if (relPath.endsWith("/")) return relPath;
  return `${relPath}/`;
}

function pickDefaultRootsFromKinds(kinds: RootKind[], projectRoot: string): string[] {
  const out: string[] = [];
  for (const k of kinds) {
    if (k === "project_root") out.push(projectRoot);
    if (k === "TIED_BASE_PATH") out.push(getBasePath());
  }
  return out;
}

function resolveAbsolutePath(p: string, projectRoot: string): string {
  if (path.isAbsolute(p)) return p;
  return path.resolve(projectRoot, p);
}

function loadConfig(configPathAbs: string): AnalysisConfig {
  if (!fs.existsSync(configPathAbs)) return {};
  try {
    const raw = fs.readFileSync(configPathAbs, "utf8");
    const parsed = yaml.load(raw) as unknown;
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) return parsed as AnalysisConfig;
  } catch {
    // ignore invalid config
  }
  return {};
}

function readIgnoreFilePatterns(ignoreFileAbs: string): string[] {
  if (!fs.existsSync(ignoreFileAbs)) return [];
  try {
    const raw = fs.readFileSync(ignoreFileAbs, "utf8");
    const lines = raw.split(/\r?\n/);
    const out: string[] = [];
    for (const line of lines) {
      const s = line.trim();
      if (!s) continue;
      if (s.startsWith("#")) continue;
      out.push(s);
    }
    return out;
  } catch {
    return [];
  }
}

function buildIgnoreFilter(patterns: string[]): ReturnType<typeof ignore> {
  const ig = ignore();
  if (patterns.length > 0) ig.add(patterns);
  return ig;
}

function extractTokenSet(text: string): {
  REQ: string[];
  ARCH: string[];
  IMPL: string[];
} {
  const req = new Set<string>();
  const arch = new Set<string>();
  const impl = new Set<string>();
  const re = /\[(REQ-[A-Z0-9_-]+|ARCH-[A-Z0-9_-]+|IMPL-[A-Z0-9_-]+)\]/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text)) !== null) {
    const t = m[1];
    if (t.startsWith("REQ-")) req.add(t);
    else if (t.startsWith("ARCH-")) arch.add(t);
    else if (t.startsWith("IMPL-")) impl.add(t);
  }
  return { REQ: [...req], ARCH: [...arch], IMPL: [...impl] };
}

function isBinaryLike(buf: Buffer): boolean {
  // Heuristic: NUL bytes usually indicate binary data.
  // If you have a specific binary format to treat differently, add it here.
  for (let i = 0; i < Math.min(buf.length, 4000); i++) {
    if (buf[i] === 0) return true;
  }
  return false;
}

export function resolveScopedRoots(args: ScopedAnalysisArgs, config: AnalysisConfig, projectRoot: string) {
  const defaultKinds: RootKind[] =
    config.default_roots && config.default_roots.length > 0 ? config.default_roots : ["project_root"];
  const default_roots_used = pickDefaultRootsFromKinds(defaultKinds, projectRoot);

  const explicitRoots = args.roots && args.roots.length > 0 ? args.roots : undefined;
  const configRoots = config.roots && config.roots.length > 0 ? config.roots : undefined;

  const effective = explicitRoots ?? configRoots ?? [];
  const effectiveResolved =
    effective.length > 0 ? effective.map((r) => resolveAbsolutePath(r, projectRoot)) : default_roots_used;

  return { roots_used: effectiveResolved, default_roots_used };
}

function resolveIncludeExtensions(args: ScopedAnalysisArgs, config: AnalysisConfig): string[] {
  const fromArgs = args.include_extensions;
  if (fromArgs && fromArgs.length > 0) return fromArgs;
  const fromConfig = config.token_scan?.include_extensions;
  if (fromConfig && fromConfig.length > 0) return fromConfig;
  return [".ts", ".tsx", ".js", ".jsx", ".rb", ".md", ".yaml", ".yml", ".json"];
}

function resolveMaxFileBytes(args: ScopedAnalysisArgs, config: AnalysisConfig): number {
  const fromArgs = args.max_file_bytes;
  if (typeof fromArgs === "number" && fromArgs > 0) return fromArgs;
  const fromConfig = config.token_scan?.max_file_bytes;
  if (typeof fromConfig === "number" && fromConfig > 0) return fromConfig;
  return 250_000;
}

function resolveMaxFiles(args: ScopedAnalysisArgs, config: AnalysisConfig): number {
  const fromArgs = args.max_files;
  if (typeof fromArgs === "number" && fromArgs > 0) return fromArgs;
  const fromConfig = config.token_scan?.max_files;
  if (typeof fromConfig === "number" && fromConfig > 0) return fromConfig;
  return 5_000;
}

function shouldIgnore(
  ig: ReturnType<typeof buildIgnoreFilter>,
  relPathPosix: string,
  isDir: boolean
): boolean {
  if (!relPathPosix) return false;
  if (ig.ignores(relPathPosix)) return true;
  if (isDir) {
    const withSlash = normalizeDirRel(relPathPosix);
    if (ig.ignores(withSlash)) return true;
  }
  return false;
}

type WalkWalkFilesResult = {
  skipped_paths_count: number;
  scanned_files: string[];
};

function walkFilesUnderRoots(params: {
  rootsAbs: string[];
  projectRootAbs: string;
  ig: ReturnType<typeof buildIgnoreFilter>;
  followSymlinks: boolean;
  includeExtensions: string[];
  maxFiles: number;
}): WalkWalkFilesResult {
  const { rootsAbs, projectRootAbs, ig, followSymlinks, includeExtensions, maxFiles } = params;

  const scannedFiles: string[] = [];
  let scannedCount = 0;
  let skippedPaths = 0;

  const visitedRoots = new Set<string>();
  let reachedMaxFiles = false;

  for (const rootAbs of rootsAbs) {
    const resolvedRoot = fs.existsSync(rootAbs) ? rootAbs : rootAbs;
    const rootKey = path.resolve(resolvedRoot);
    if (visitedRoots.has(rootKey)) continue;
    visitedRoots.add(rootKey);

    // Root symlink policy: if the root itself is a symlink, treat it like a symlinked entry.
    try {
      const st = fs.lstatSync(rootAbs);
      if (st.isSymbolicLink() && !followSymlinks) {
        skippedPaths++;
        continue;
      }
    } catch {
      // If lstat fails, skip and continue (handled below via readdir catch).
    }

    // Root ignore policy: if the root directory is ignored, don't traverse it.
    const rootRel = toPosix(path.relative(projectRootAbs, rootAbs));
    if (shouldIgnore(ig, rootRel, true)) {
      skippedPaths++;
      continue;
    }

    const stack: Array<{ dirAbs: string }> = [{ dirAbs: rootAbs }];
    while (stack.length > 0) {
      if (reachedMaxFiles) break;
      const { dirAbs } = stack.pop()!;
      let entries: fs.Dirent[];
      try {
        entries = fs.readdirSync(dirAbs, { withFileTypes: true });
      } catch {
        continue;
      }

      for (const ent of entries) {
        const abs = path.join(dirAbs, ent.name);
        const rel = toPosix(path.relative(projectRootAbs, abs));
        const isDir = ent.isDirectory();
        const isSymlink = ent.isSymbolicLink();

        if (isSymlink && !followSymlinks) {
          skippedPaths++;
          continue;
        }

        const ignored = shouldIgnore(ig, rel, isDir || ent.isSymbolicLink());
        if (ignored) {
          skippedPaths++;
          continue;
        }

        if (ent.isDirectory()) {
          stack.push({ dirAbs: abs });
        } else if (ent.isFile()) {
          const ext = path.extname(ent.name).toLowerCase();
          if (!includeExtensions.includes(ext)) continue;
          scannedCount++;
          if (scannedCount >= maxFiles) reachedMaxFiles = true;
          scannedFiles.push(abs);
        } else {
          // Ignore special files (sockets, devices, FIFOs).
          skippedPaths++;
        }
      }
    }
  }

  return { skipped_paths_count: skippedPaths, scanned_files: scannedFiles };
}

export function runScopedAnalysis(args: ScopedAnalysisArgs): ScopedAnalysisResult {
  const mode: ScopedAnalysisMode = args.mode ?? "token_scan";
  const projectRoot = process.cwd();

  const configPath = args.config_path ?? DEFAULT_CONFIG_PATH;
  const configPathAbs = resolveAbsolutePath(configPath, projectRoot);
  const config = loadConfig(configPathAbs);

  const followSymlinks =
    typeof args.follow_symlinks === "boolean" ? args.follow_symlinks : config.follow_symlinks ?? false;

  const { roots_used, default_roots_used } = resolveScopedRoots(args, config, projectRoot);

  const ignoreFile = args.ignore_file ?? config.ignore_file ?? DEFAULT_IGNORE_FILE;
  const ignoreFileAbs = resolveAbsolutePath(ignoreFile, projectRoot);

  const filePatterns = readIgnoreFilePatterns(ignoreFileAbs);
  const inlinePatterns = [
    ...(config.ignore_inline ?? []),
    ...(args.ignore_patterns ?? []),
  ];

  // Minimal built-in ignores to avoid pathological walks.
  const builtInInline = ["node_modules/", ".git/", "dist/"];

  const effectivePatterns = [...filePatterns, ...inlinePatterns, ...builtInInline];

  const ig = buildIgnoreFilter(effectivePatterns);

  const includeExtensions = resolveIncludeExtensions(args, config);
  const maxFileBytes = resolveMaxFileBytes(args, config);
  const maxFiles = resolveMaxFiles(args, config);

  const walk = walkFilesUnderRoots({
    rootsAbs: roots_used,
    projectRootAbs: projectRoot,
    ig,
    followSymlinks,
    includeExtensions,
    maxFiles,
  });

  const ignoreSource =
    filePatterns.length > 0 && inlinePatterns.length > 0
      ? { type: "file_and_inline" as const, path: ignoreFileAbs }
      : filePatterns.length > 0
        ? { type: "file" as const, path: ignoreFileAbs }
        : { type: "inline" as const, path: undefined };

  const summary: RunSummary = {
    roots_used,
    default_roots_used,
    ignore_source: ignoreSource,
    skipped_paths_count: walk.skipped_paths_count,
    followed_symlinks: followSymlinks,
  };

  if (mode === "walk_summary") {
    return {
      ok: true,
      summary,
      scanned_files: walk.scanned_files.length,
      files_scanned: walk.scanned_files.map((p) => path.relative(projectRoot, p)),
    };
  }

  const occurrences: TokenScanResult["occurrences"] = {};
  const allTokens: TokenScanResult["discovered_tokens"] = {
    REQ: [],
    ARCH: [],
    IMPL: [],
  };
  const tokenSets = {
    REQ: new Set<string>(),
    ARCH: new Set<string>(),
    IMPL: new Set<string>(),
  };

  const collectPerFile = mode === "traceability_gap_report";
  const perFile: PerFileTokens[] = [];

  const scannedFilesRel = walk.scanned_files.map((p) => path.relative(projectRoot, p));
  for (const absFile of walk.scanned_files) {
    const rel = path.relative(projectRoot, absFile);
    let st: fs.Stats;
    try {
      st = fs.statSync(absFile);
    } catch {
      continue;
    }
    if (st.size > maxFileBytes) continue;

    let buf: Buffer;
    try {
      buf = fs.readFileSync(absFile);
    } catch {
      continue;
    }
    if (isBinaryLike(buf)) continue;

    const text = buf.toString("utf8");
    const tokenSetsFound = extractTokenSet(text);

    if (collectPerFile) {
      perFile.push({ relPosix: toPosix(rel), tokens: tokenSetsFound });
    }

    for (const token of tokenSetsFound.REQ) {
      tokenSets.REQ.add(token);
      if (!occurrences[token]) occurrences[token] = { files: [] };
      occurrences[token].req = true;
      if (!occurrences[token].files.includes(rel)) occurrences[token].files.push(rel);
    }
    for (const token of tokenSetsFound.ARCH) {
      tokenSets.ARCH.add(token);
      if (!occurrences[token]) occurrences[token] = { files: [] };
      occurrences[token].arch = true;
      if (!occurrences[token].files.includes(rel)) occurrences[token].files.push(rel);
    }
    for (const token of tokenSetsFound.IMPL) {
      tokenSets.IMPL.add(token);
      if (!occurrences[token]) occurrences[token] = { files: [] };
      occurrences[token].impl = true;
      if (!occurrences[token].files.includes(rel)) occurrences[token].files.push(rel);
    }
  }

  allTokens.REQ = [...tokenSets.REQ].sort();
  allTokens.ARCH = [...tokenSets.ARCH].sort();
  allTokens.IMPL = [...tokenSets.IMPL].sort();

  const tokenScan: TokenScanResult = {
    discovered_tokens: allTokens,
    occurrences,
  };

  if (mode === "token_scan") {
    return {
      ok: true,
      summary,
      scanned_files: scannedFilesRel.length,
      files_scanned: scannedFilesRel,
      token_scan: tokenScan,
    };
  }

  if (mode === "impact_preview") {
    const discoveredReq = [...tokenSets.REQ];
    const discoveredArch = [...tokenSets.ARCH];
    const discoveredImpl = [...tokenSets.IMPL];

    const impactedRequirements = new Set<string>(discoveredReq);
    const impactedArchitecture = new Set<string>(discoveredArch);
    const impactedImplementation = new Set<string>(discoveredImpl);

    const decisionsByRequirement: ImpactPreviewResult["decisions_by_requirement"] = {};

    // For each discovered requirement, include the decisions that reference it.
    for (const reqToken of discoveredReq) {
      const decisions = getDecisionsForRequirement(reqToken);
      const archTokens = Object.keys(decisions.architecture ?? {});
      const implTokens = Object.keys(decisions.implementation ?? {});
      for (const t of archTokens) impactedArchitecture.add(t);
      for (const t of implTokens) impactedImplementation.add(t);
      impactedRequirements.add(reqToken);
      decisionsByRequirement[reqToken] = {
        architecture: archTokens.sort(),
        implementation: implTokens.sort(),
      };
    }

    // Also include requirements implied by discovered ARCH/IMPL tokens.
    for (const decisionToken of discoveredArch) {
      const reqs = getRequirementsForDecision(decisionToken);
      for (const t of reqs.requirementTokens) impactedRequirements.add(t);
    }
    for (const decisionToken of discoveredImpl) {
      const reqs = getRequirementsForDecision(decisionToken);
      for (const t of reqs.requirementTokens) impactedRequirements.add(t);
    }

    return {
      ok: true,
      summary,
      scanned_files: scannedFilesRel.length,
      files_scanned: scannedFilesRel,
      token_scan: tokenScan,
      impact_preview: {
        discovered_tokens: allTokens,
        impacted_requirements: [...impactedRequirements].sort(),
        impacted_architecture: [...impactedArchitecture].sort(),
        impacted_implementation: [...impactedImplementation].sort(),
        decisions_by_requirement: decisionsByRequirement,
      },
    };
  }

  if (mode === "traceability_gap_report") {
    const semanticTokenKeys = listTokens("semantic-tokens");
    const semanticSet = new Set<string>(semanticTokenKeys);
    const discoveredAll = [...tokenSets.REQ, ...tokenSets.ARCH, ...tokenSets.IMPL];

    const excludeMeth = config.traceability_gap?.exclude_methodology_only_records !== false;

    const defaultReqList = listRequirementTokensForTraceability(excludeMeth);
    const defaultImplList = listImplementationTokensForTraceability(excludeMeth);

    const defaultMethodologyOnlyReq = excludeMeth
      ? listTokens("requirements").filter(
          (t) => t.startsWith("REQ-") && isMethodologyOnlyIndexToken("requirements", t)
        )
      : [];
    const defaultMethodologyOnlyImpl = excludeMeth
      ? listTokens("implementation").filter(
          (t) => t.startsWith("IMPL-") && isMethodologyOnlyIndexToken("implementation", t)
        )
      : [];

    let reqList = defaultReqList;
    let implList = defaultImplList;
    let methodologyOnlyReq = defaultMethodologyOnlyReq;
    let methodologyOnlyImpl = defaultMethodologyOnlyImpl;

    // Gate mode: evaluate only explicitly provided token subsets (including an empty set).
    // This avoids falling back to "evaluate all tokens" when the diff introduces none.
    if (args.traceability_requirement_tokens !== undefined) {
      const providedReq = args.traceability_requirement_tokens.filter((t) => t.startsWith("REQ-"));
      if (excludeMeth) {
        methodologyOnlyReq = providedReq.filter((t) => isMethodologyOnlyIndexToken("requirements", t));
        reqList = providedReq.filter((t) => !isMethodologyOnlyIndexToken("requirements", t));
      } else {
        methodologyOnlyReq = [];
        reqList = providedReq;
      }
    }

    if (args.traceability_implementation_tokens !== undefined) {
      const providedImpl = args.traceability_implementation_tokens.filter((t) => t.startsWith("IMPL-"));
      if (excludeMeth) {
        methodologyOnlyImpl = providedImpl.filter((t) => isMethodologyOnlyIndexToken("implementation", t));
        implList = providedImpl.filter((t) => !isMethodologyOnlyIndexToken("implementation", t));
      } else {
        methodologyOnlyImpl = [];
        implList = providedImpl;
      }
    }

    reqList = Array.from(new Set(reqList)).sort();
    implList = Array.from(new Set(implList)).sort();
    methodologyOnlyReq = Array.from(new Set(methodologyOnlyReq)).sort();
    methodologyOnlyImpl = Array.from(new Set(methodologyOnlyImpl)).sort();

    const strictFlag =
      args.traceability_strict !== undefined
        ? args.traceability_strict
        : config.traceability_gap?.strict === true;

    const traceabilityGapMerged: TraceabilityGapProjectConfig = {
      dimensions: config.traceability_gap?.dimensions,
      test_file: config.traceability_gap?.test_file,
      methodology_path_markers: config.traceability_gap?.methodology_path_markers,
      strict: strictFlag,
    };

    const traceability_gap_report = buildTraceabilityGapReport({
      projectRoot,
      perFile,
      projectConfig: traceabilityGapMerged,
      requirementTokens: reqList,
      implementationTokens: implList,
      semanticTokenSet: semanticSet,
      discoveredTokensFlat: discoveredAll,
      methodology_only_requirements: methodologyOnlyReq,
      methodology_only_implementation: methodologyOnlyImpl,
    });

    return {
      ok: true,
      summary,
      scanned_files: scannedFilesRel.length,
      files_scanned: scannedFilesRel,
      token_scan: tokenScan,
      traceability_gap_report,
    };
  }

  // gap_report
  const semanticTokenKeys = listTokens("semantic-tokens");
  const semanticSet = new Set<string>(semanticTokenKeys);
  const discoveredAll = [...tokenSets.REQ, ...tokenSets.ARCH, ...tokenSets.IMPL];
  const missing = discoveredAll.filter((t) => !semanticSet.has(t)).sort();

  const gapReport: GapReportResult = {
    missing_tokens: missing,
    missing_count: missing.length,
  };

  return {
    ok: true,
    summary,
    scanned_files: scannedFilesRel.length,
    files_scanned: scannedFilesRel,
    token_scan: tokenScan,
    gap_report: gapReport,
  };
}

