/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] Layer B + Tier-3 detection for constraint-ready-v2 inventory.
 */

/** Same Tier-3 heuristic as pilot inventory (OD-P3-5) and grand plan annotation profile. */
export const TIER3_CONSTRAINT_MARKERS = /refinement|@refines|alias mut/i;

export function hasGrammarV2Header(text: string): boolean {
  return /Grammar-Version:\s*v2/i.test(text);
}

export function hasTier3ConstraintMarkers(text: string): boolean {
  return TIER3_CONSTRAINT_MARKERS.test(text);
}

export type ProcedureBlock = {
  name: string;
  startLine: number;
  body: string;
};

/** Split sidecar into procedure blocks (line-based, grammar v2 `procedure NAME:`). */
export function parseProcedureBlocks(text: string): ProcedureBlock[] {
  const lines = text.split("\n");
  const blocks: ProcedureBlock[] = [];
  let current: ProcedureBlock | undefined;
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const m = /^procedure\s+([^\n:]+)\s*:/.exec(line);
    if (m) {
      if (current) blocks.push(current);
      current = { name: m[1].trim(), startLine: i, body: "" };
      continue;
    }
    if (current) {
      current.body += `${line}\n`;
    }
  }
  if (current) blocks.push(current);
  return blocks;
}

/** Contract block on an active procedure includes PRE, POST, and EFFECTS. */
export function procedureBodyHasLayerBContract(body: string): boolean {
  if (!/^\s*Contract:/m.test(body)) return false;
  return /\bPRE\s*:/i.test(body) && /\bPOST\s*:/i.test(body) && /\bEFFECTS\s*:/i.test(body);
}

export function sidecarHasProcedureLayerBContract(text: string): boolean {
  const blocks = parseProcedureBlocks(text);
  if (blocks.length === 0) return false;
  return blocks.some((b) => procedureBodyHasLayerBContract(b.body));
}

/**
 * Legacy v2 contract floor: ≥3 of `# PRE:`, `# POST:`, `# EFFECTS:` comment markers,
 * or a `Contract:` section with PRE+POST+EFFECTS anywhere in the file (post v2 header).
 */
export function sidecarHasLegacyCommentContractFloor(text: string): boolean {
  let markerHits = 0;
  if (/#\s*PRE\s*:/i.test(text)) markerHits += 1;
  if (/#\s*POST\s*:/i.test(text)) markerHits += 1;
  if (/#\s*EFFECTS\s*:/i.test(text)) markerHits += 1;
  if (markerHits >= 3) return true;
  if (/Contract:[\s\S]*?\bPRE\s*:[\s\S]*?\bPOST\s*:[\s\S]*?\bEFFECTS\s*:/i.test(text)) {
    return true;
  }
  return false;
}

export function sidecarMeetsConstraintReadyV2Floor(text: string): boolean {
  if (!hasGrammarV2Header(text)) return false;
  if (hasTier3ConstraintMarkers(text)) return true;
  if (sidecarHasProcedureLayerBContract(text)) return true;
  if (sidecarHasLegacyCommentContractFloor(text)) return true;
  return false;
}

/** Sync heuristic aligned with parser INPUT/OUTPUT `where` refinements (G3 enforced inventory). */
export function sidecarHasContractRefinementClause(text: string): boolean {
  return /^\s*(INPUT|OUTPUT|DATA):[^\n]*\bwhere\b/im.test(text);
}

export function sidecarMeetsConstraintEnforcedV2Floor(text: string): boolean {
  if (!hasGrammarV2Header(text)) return false;
  return sidecarHasContractRefinementClause(text);
}
