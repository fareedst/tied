/**
 * [REQ-TIED_PROJECT_SIZE_PROOF_FACET_INFERENCE] [IMPL-TIED_PROJECT_SIZE_PROOF_FACET_INFERENCE]
 * Structural heuristics for binding-like tests (v1: static import graph from test source).
 */

const IMPORT_FROM_RE = /\bfrom\s+["'](\.\.?\/[^"']+)["']/g;
const IMPORT_SIDE_RE = /\bimport\s+["'](\.\.?\/[^"']+)["']/g;
const SUBPROCESS_RE = /node:child_process|spawnSync|execSync|execFileSync/;

export type TestFileInference = {
  binding_inferred: boolean;
  uses_subprocess: boolean;
  imported_impl_basenames: string[];
};

function basenameNoExt(importPath: string): string {
  const base = importPath.replace(/\\/g, "/").split("/").pop() ?? importPath;
  return base.replace(/\.(mjs|cjs|js|ts|tsx)$/, "");
}

function collectRelativeImports(source: string): string[] {
  const paths: string[] = [];
  for (const re of [IMPORT_FROM_RE, IMPORT_SIDE_RE]) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(source)) !== null) {
      paths.push(m[1]);
    }
  }
  return paths;
}

/** PRE: test file source text. POST: binding_inferred when ≥2 distinct non-test implementation basenames imported. */
export function analyzeTestFileInference(source: string): TestFileInference {
  const relImports = collectRelativeImports(source);
  const implNames = new Set<string>();
  for (const p of relImports) {
    const lower = p.toLowerCase();
    if (lower.includes(".test.") || lower.endsWith(".test")) continue;
    const name = basenameNoExt(p);
    if (name) implNames.add(name);
  }
  const imported_impl_basenames = [...implNames].sort();
  return {
    binding_inferred: imported_impl_basenames.length >= 2,
    uses_subprocess: SUBPROCESS_RE.test(source),
    imported_impl_basenames,
  };
}
