/**
 * [REQ-PSEUDOCODE_CONSTRAINT_LANGUAGE] Labeled constraint fixture manifest (mirrors corpus test table).
 */
import { join } from "node:path";
import { MCP_SERVER_ROOT } from "./constants.ts";

export const GATING_CONSTRAINT_CODES = [
  "REFINEMENT_VIOLATION",
  "CONSTRAINT_UNSUPPORTED_SYNTAX",
  "SUMMARY_CONFLICT",
  "MUTATION_VIOLATION",
  "ALIAS_VIOLATION",
] as const;

export type LabeledFixtureEntry = {
  id: string;
  file: string;
  positiveControl?: boolean;
};

/** Positive-control subset used for OD-P2-4 FP rate (denominator = positiveControl fixtures). */
export const CONSTRAINT_POSITIVE_CONTROLS: LabeledFixtureEntry[] = [
  { id: "cl-01", file: "corpus-cl-01-v2-header-refinement.pseudocode.md", positiveControl: true },
  { id: "cl-02", file: "corpus-cl-02-v2-summary-decl.pseudocode.md", positiveControl: true },
  { id: "cl-03", file: "corpus-cl-03-v2-alias-policy.pseudocode.md", positiveControl: true },
  { id: "cl-04", file: "corpus-cl-04-v2-immutable-data.pseudocode.md", positiveControl: true },
  { id: "cl-05", file: "corpus-cl-05-v1-compat-no-header.pseudocode.md", positiveControl: true },
  { id: "cl-06", file: "corpus-cl-06-v2-mixed-v1-constructs.pseudocode.md", positiveControl: true },
  { id: "cl-07", file: "corpus-cl-07-refinement-quantifier-pos.pseudocode.md", positiveControl: true },
  { id: "cl-09", file: "corpus-cl-09-refinement-bounds.pseudocode.md", positiveControl: true },
  { id: "cl-10", file: "corpus-cl-10-field-refinement.pseudocode.md", positiveControl: true },
  { id: "cl-11", file: "corpus-cl-11-pre-post-entailment.pseudocode.md", positiveControl: true },
  { id: "cl-13", file: "corpus-cl-13-interproc-summary-pos.pseudocode.md", positiveControl: true },
  { id: "cl-18", file: "corpus-cl-18-mutation-pass.pseudocode.md", positiveControl: true },
  { id: "cl-24", file: "corpus-cl-24-positive-refinement-chain-pass.pseudocode.md", positiveControl: true },
  { id: "cl-25", file: "corpus-cl-25-positive-bounds-window-pass.pseudocode.md", positiveControl: true },
  { id: "cl-26", file: "corpus-cl-26-positive-interproc-chain-pass.pseudocode.md", positiveControl: true },
  { id: "cl-27", file: "corpus-cl-27-positive-immutable-read-pass.pseudocode.md", positiveControl: true },
  { id: "cl-28", file: "corpus-cl-28-positive-alias-compliant-pass.pseudocode.md", positiveControl: true },
  { id: "cl-35", file: "corpus-cl-35-positive-list-length-pass.pseudocode.md", positiveControl: true },
  { id: "cl-36", file: "corpus-cl-36-positive-record-field-pass.pseudocode.md", positiveControl: true },
  { id: "cl-37", file: "corpus-cl-37-positive-pre-entailment-pass.pseudocode.md", positiveControl: true },
  { id: "cl-38", file: "corpus-cl-38-positive-guarded-null-pass.pseudocode.md", positiveControl: true },
  { id: "cl-39", file: "corpus-cl-39-positive-summary-call-pass.pseudocode.md", positiveControl: true },
  { id: "cl-40", file: "corpus-cl-40-positive-v1-no-constraint-diagnostics.pseudocode.md", positiveControl: true },
];

export const CONSTRAINT_FIXTURE_DIR = join(
  MCP_SERVER_ROOT,
  "src/analysis/fixtures/constraint-language",
);
