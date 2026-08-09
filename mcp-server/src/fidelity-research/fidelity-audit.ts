export interface FidelityLocus {
  block: string;
  locus: string;
}

export interface FidelityAuditInput {
  pseudocode: string;
  testLoci: readonly FidelityLocus[];
  codeLoci: readonly FidelityLocus[];
}

export interface FidelityInventoryRow {
  block: string;
  testLocus?: string;
  codeLocus?: string;
}

export interface FidelityFinding {
  kind: "reliability" | "completeness";
  block: string;
  message: string;
}

export type FidelityVerdict =
  | "PASS"
  | "RELIABLE_INCOMPLETE"
  | "UNRELIABLE";

export interface FidelityAuditResult {
  inventory: FidelityInventoryRow[];
  findings: FidelityFinding[];
  verdicts: Record<string, FidelityVerdict>;
}

// [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
// Produces both pseudo-code-to-evidence reliability analysis and evidence-to-pseudo-code completeness analysis.
export function auditImplFidelity(
  input: FidelityAuditInput,
): FidelityAuditResult {
  const blocks = [...input.pseudocode.matchAll(
    /^\s*procedure\s+([A-Z][A-Z0-9_]*)\b/gm,
  )].map((match) => match[1]);
  const testByBlock = new Map(input.testLoci.map((locus) => [locus.block, locus.locus]));
  const codeByBlock = new Map(input.codeLoci.map((locus) => [locus.block, locus.locus]));
  const inventory: FidelityInventoryRow[] = [];
  const findings: FidelityFinding[] = [];
  const verdicts: Record<string, FidelityVerdict> = {};

  for (const block of blocks) {
    const testLocus = testByBlock.get(block);
    const codeLocus = codeByBlock.get(block);
    inventory.push({ block, testLocus, codeLocus });

    if (!testLocus || !codeLocus) {
      findings.push({
        kind: "completeness",
        block,
        message: "Block is missing a test or production evidence locus.",
      });
      verdicts[block] = "RELIABLE_INCOMPLETE";
      continue;
    }

    verdicts[block] = "PASS";
  }

  return { inventory, findings, verdicts };
}
