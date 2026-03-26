/**
 * Plumb-style traceability dimensions: REQ↔tests, REQ↔production markers, IMPL↔tests.
 * Uses scoped walk results + TIED indexes ([PROC-TIED_METHODOLOGY_READONLY] for methodology-only labeling).
 */

import path from "node:path";
import { getDetailPath } from "../detail-loader.js";

export type TraceabilityGapDimensionsConfig = {
  /** REQ index entries with no [REQ-*] occurrence in classified test files under the walk. */
  req_without_test?: boolean;
  /** REQ index entries with no [REQ-*] occurrence in classified production files under the walk. */
  req_without_implementation?: boolean;
  /** IMPL index entries with no [IMPL-*] occurrence in classified test files (block-level pseudocode mapping is out of scope). */
  impl_without_test?: boolean;
};

export type TraceabilityGapTestFileConfig = {
  /** If any of these substrings appears in the posix path, treat as test. */
  path_contains?: string[];
  /** Basename must end with one of these suffixes to be test (e.g. ".test.ts"). */
  basename_suffixes?: string[];
};

export type TraceabilityGapProjectConfig = {
  dimensions?: TraceabilityGapDimensionsConfig;
  test_file?: TraceabilityGapTestFileConfig;
  /**
   * Path substrings (posix) that mark methodology content; excluded from "production"
   * implementation classification ([PROC-TIED_METHODOLOGY_READONLY]).
   */
  methodology_path_markers?: string[];
  /**
   * When true, report metadata sets would_fail_strict / suggested_exit_code for CI
   * (non-zero if any counted gap exists).
   */
  strict?: boolean;
};

export type TraceabilityGapEntry = {
  token: string;
  definition_refs: string[];
};

export type TraceabilityGapDimensionResult = {
  enabled: boolean;
  gaps: TraceabilityGapEntry[];
  count: number;
};

export type TraceabilityGapReportResult = {
  registry_gaps: {
    missing_tokens: string[];
    missing_count: number;
  };
  dimensions: {
    req_without_test: TraceabilityGapDimensionResult;
    req_without_implementation: TraceabilityGapDimensionResult;
    impl_without_test: TraceabilityGapDimensionResult;
  };
  methodology_only: {
    requirements_excluded: string[];
    implementation_excluded: string[];
  };
  exit_policy: {
    strict: boolean;
    would_fail_strict: boolean;
    /** 1 when strict and any dimension count > 0; 0 otherwise. */
    suggested_exit_code: 0 | 1;
  };
};

const DEFAULT_TEST: Required<TraceabilityGapTestFileConfig> = {
  path_contains: ["__tests__", "/tests/", "/test/", "/spec/"],
  basename_suffixes: [
    ".test.ts",
    ".test.tsx",
    ".test.js",
    ".test.jsx",
    ".test.mjs",
    ".test.cjs",
    ".spec.ts",
    ".spec.tsx",
    ".spec.js",
    ".spec.jsx",
    "_test.ts",
    "_test.tsx",
    "_test.py",
  ],
};

const DEFAULT_METHODOLOGY_MARKERS = ["tied/methodology/"];

export function mergeTestFileConfig(
  cfg: TraceabilityGapTestFileConfig | undefined
): Required<TraceabilityGapTestFileConfig> {
  return {
    path_contains: [...(cfg?.path_contains ?? DEFAULT_TEST.path_contains)],
    basename_suffixes: [...(cfg?.basename_suffixes ?? DEFAULT_TEST.basename_suffixes)],
  };
}

export function isTestFilePath(relPosix: string, cfg: Required<TraceabilityGapTestFileConfig>): boolean {
  for (const s of cfg.path_contains) {
    if (relPosix.includes(s)) return true;
  }
  const base = path.posix.basename(relPosix);
  for (const suf of cfg.basename_suffixes) {
    if (base.endsWith(suf)) return true;
  }
  return false;
}

export function isMethodologyContentPath(
  relPosix: string,
  markers?: string[]
): boolean {
  const m = markers && markers.length > 0 ? markers : DEFAULT_METHODOLOGY_MARKERS;
  return m.some((mk) => relPosix.includes(mk));
}

function definitionRefsForToken(token: string, projectRoot: string): string[] {
  const abs = getDetailPath(token);
  if (!abs) {
    if (token.startsWith("REQ-")) return [`tied/requirements/${token}.yaml`];
    if (token.startsWith("IMPL-")) return [`tied/implementation-decisions/${token}.yaml`];
    return [];
  }
  const rel = path.relative(projectRoot, abs);
  return [rel.split(path.sep).join("/")];
}

export type PerFileTokens = {
  relPosix: string;
  tokens: { REQ: string[]; ARCH: string[]; IMPL: string[] };
};

export function buildTraceabilityGapReport(params: {
  projectRoot: string;
  perFile: PerFileTokens[];
  projectConfig: TraceabilityGapProjectConfig;
  /** REQ tokens to evaluate (already filtered for methodology-only exclusion when applicable). */
  requirementTokens: string[];
  /** IMPL tokens to evaluate when impl_without_test is enabled. */
  implementationTokens: string[];
  semanticTokenSet: Set<string>;
  discoveredTokensFlat: string[];
  /** REQ tokens omitted from gap checks (methodology-only); for reporting [PROC-TIED_METHODOLOGY_READONLY]. */
  methodology_only_requirements: string[];
  /** IMPL tokens omitted from gap checks (methodology-only). */
  methodology_only_implementation: string[];
}): TraceabilityGapReportResult {
  const {
    projectRoot,
    perFile,
    projectConfig,
    requirementTokens,
    implementationTokens,
    semanticTokenSet,
    discoveredTokensFlat,
    methodology_only_requirements,
    methodology_only_implementation,
  } = params;

  const testCfg = mergeTestFileConfig(projectConfig.test_file);
  const methMarkers = projectConfig.methodology_path_markers;

  const dim = projectConfig.dimensions ?? {};
  const reqNoTest = dim.req_without_test !== false;
  const reqNoImpl = dim.req_without_implementation !== false;
  const implNoTest = dim.impl_without_test === true;

  const reqInTests = new Set<string>();
  const reqInProd = new Set<string>();
  const implInTests = new Set<string>();

  for (const row of perFile) {
    const isTest = isTestFilePath(row.relPosix, testCfg);
    const isMeth = isMethodologyContentPath(row.relPosix, methMarkers);
    if (isTest) {
      for (const t of row.tokens.REQ) reqInTests.add(t);
      for (const t of row.tokens.IMPL) implInTests.add(t);
    } else if (!isMeth) {
      for (const t of row.tokens.REQ) reqInProd.add(t);
    }
  }

  const missingRegistry = discoveredTokensFlat.filter((t) => !semanticTokenSet.has(t)).sort();

  const reqProjectList = requirementTokens;
  const implProjectList = implementationTokens;

  const gapsReqTest: TraceabilityGapEntry[] = [];
  const gapsReqImpl: TraceabilityGapEntry[] = [];
  const gapsImplTest: TraceabilityGapEntry[] = [];

  for (const token of reqProjectList) {
    if (reqNoTest && !reqInTests.has(token)) {
      gapsReqTest.push({ token, definition_refs: definitionRefsForToken(token, projectRoot) });
    }
    if (reqNoImpl && !reqInProd.has(token)) {
      gapsReqImpl.push({ token, definition_refs: definitionRefsForToken(token, projectRoot) });
    }
  }

  for (const token of implProjectList) {
    if (implNoTest && !implInTests.has(token)) {
      gapsImplTest.push({ token, definition_refs: definitionRefsForToken(token, projectRoot) });
    }
  }

  const strict = projectConfig.strict === true;
  const counted =
    (reqNoTest ? gapsReqTest.length : 0) +
    (reqNoImpl ? gapsReqImpl.length : 0) +
    (implNoTest ? gapsImplTest.length : 0);
  const wouldFail = counted > 0;
  const suggested_exit_code: 0 | 1 = strict && wouldFail ? 1 : 0;

  return {
    registry_gaps: {
      missing_tokens: missingRegistry,
      missing_count: missingRegistry.length,
    },
    dimensions: {
      req_without_test: {
        enabled: reqNoTest,
        gaps: gapsReqTest,
        count: gapsReqTest.length,
      },
      req_without_implementation: {
        enabled: reqNoImpl,
        gaps: gapsReqImpl,
        count: gapsReqImpl.length,
      },
      impl_without_test: {
        enabled: implNoTest,
        gaps: gapsImplTest,
        count: gapsImplTest.length,
      },
    },
    methodology_only: {
      requirements_excluded: [...methodology_only_requirements].sort(),
      implementation_excluded: [...methodology_only_implementation].sort(),
    },
    exit_policy: {
      strict,
      would_fail_strict: strict && wouldFail,
      suggested_exit_code,
    },
  };
}
