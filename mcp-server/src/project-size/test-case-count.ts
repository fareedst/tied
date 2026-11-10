/**
 * [IMPL-TIED_PROJECT_SIZE_PROOF_FACET_TEST_CASES] [ARCH-TIED_PROJECT_SIZE_PROOF_FACET_TEST_CASES]
 * [REQ-TIED_PROJECT_SIZE_PROOF_FACET_TEST_CASES] [REQ-TIED_PROJECT_SIZE_LAYERS]
 */

const TEST_CASE_INVOCATION =
  /\b(?:it|test)(?:\.(?:only|skip|todo))?\s*\(/g;

/** Strip comments and naive string literals so regex does not count false positives. */
export function stripForTestCaseScan(source: string): string {
  let out = source.replace(/\r\n/g, "\n");
  out = out.replace(/\/\*[\s\S]*?\*\//g, " ");
  out = out.replace(/(^|[^:])\/\/.*$/gm, "$1 ");
  out = out.replace(/`(?:\\.|[^`\\])*`/g, " ");
  out = out.replace(/'(?:\\.|[^'\\])*'/g, " ");
  out = out.replace(/"(?:\\.|[^"\\])*"/g, " ");
  return out;
}

/** Count node:test-style it/test invocations in source text. */
export function countTestCasesInSource(source: string): number {
  const stripped = stripForTestCaseScan(source);
  const matches = stripped.match(TEST_CASE_INVOCATION);
  return matches ? matches.length : 0;
}
