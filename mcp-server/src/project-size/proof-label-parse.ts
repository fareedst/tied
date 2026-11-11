/**
 * [REQ-TIED_PROJECT_SIZE_PROOF_PATH_SEMANTICS] [IMPL-TIED_PROJECT_SIZE_PROOF_PATH_SEMANTICS]
 * Lexer for PROOF_LABEL / PROOF_KIND headers (L1 contract only — snapshot applies in L2+).
 */

const PROOF_LABEL_RE = /^\s*\/\/\s*PROOF_LABEL:\s*([a-z][a-z0-9_.]*)\s*$/im;
const PROOF_KIND_RE =
  /^\s*\/\/\s*PROOF_KIND:\s*(unit|composition|binding-inventory|e2e)\s*$/im;

export type ParsedProofHeaders = {
  proof_label: string | null;
  proof_kind: "unit" | "composition" | "binding-inventory" | "e2e" | null;
};

export function parseProofHeadersFromSource(source: string): ParsedProofHeaders {
  const labelMatch = PROOF_LABEL_RE.exec(source);
  const kindMatch = PROOF_KIND_RE.exec(source);
  return {
    proof_label: labelMatch?.[1] ?? null,
    proof_kind: (kindMatch?.[1] as ParsedProofHeaders["proof_kind"]) ?? null,
  };
}
