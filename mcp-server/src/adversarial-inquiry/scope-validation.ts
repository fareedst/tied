import { scanProcedureBlocks, type ProcedureRange } from "../analysis/pseudocode-shared.js";
import type { BlockIdentity, ObligationGraphInput } from "./types.js";

export type ScopeValidationErrorCode =
  | "STALE_BLOCK_NAME"
  | "UNKNOWN_PROCEDURE"
  | "INVALID_SCOPE"
  | "MISSING_BLOCK";

export type ScopeValidationError = {
  code: ScopeValidationErrorCode;
  message: string;
  availableProcedures?: string[];
};

export type ParsedScopeEntry = {
  raw: string;
  procedureName: string;
  implToken?: string;
  phaseTag?: "closeout";
};

// [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
// How: discover sidecar procedures with the shared PSA scanProcedureBlocks primitive instead of first ## heading heuristics.
export function discoverSidecarProcedures(pseudocode: string): ProcedureRange[] {
  return scanProcedureBlocks(pseudocode.split(/\r?\n/u));
}

// [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
// How: parse optional #closeout phase tag suffixes on procedure or block scope entries.
export function parseScopeEntry(entry: string): ParsedScopeEntry {
  const raw = entry.trim();
  if (!raw) return { raw, procedureName: "" };
  const parts = raw.split("#");
  if (parts.length >= 3 && parts[parts.length - 1] === "closeout") {
    return {
      raw,
      implToken: parts[0],
      procedureName: parts[parts.length - 2],
      phaseTag: "closeout",
    };
  }
  const closeoutMatch = raw.match(/^(.+)#closeout$/u);
  if (closeoutMatch) {
    return { raw, procedureName: closeoutMatch[1].trim(), phaseTag: "closeout" };
  }
  return { raw, procedureName: raw };
}

function availableProcedureNames(procedures: readonly ProcedureRange[]): string[] {
  return [...new Set(procedures.map((procedure) => procedure.name))].sort();
}

// [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
// How: fail fast when caller-supplied procedure names are absent from the live sidecar.
export function validateProcedureNames(
  entries: readonly string[],
  procedures: readonly ProcedureRange[],
  implToken: string,
): { ok: true; resolved: string[] } | { ok: false; error: ScopeValidationError } {
  const available = availableProcedureNames(procedures);
  const availableSet = new Set(available);
  const resolved: string[] = [];
  const seen = new Set<string>();
  for (const entry of entries) {
    const { procedureName } = parseScopeEntry(entry);
    if (!procedureName) {
      return {
        ok: false,
        error: {
          code: "UNKNOWN_PROCEDURE",
          message: "Scope entry is empty.",
          availableProcedures: available,
        },
      };
    }
    if (!availableSet.has(procedureName)) {
      return {
        ok: false,
        error: {
          code: "STALE_BLOCK_NAME",
          message: `Procedure ${procedureName} is not declared in ${implToken} sidecar; available: ${available.join(", ") || "(none)"}.`,
          availableProcedures: available,
        },
      };
    }
    if (!seen.has(procedureName)) {
      resolved.push(procedureName);
      seen.add(procedureName);
    }
  }
  return { ok: true, resolved };
}

export function extractProcedureSemanticContent(
  pseudocode: string,
  blockName: string,
  procedures: readonly ProcedureRange[],
): string {
  const range = procedures.find((procedure) => procedure.name === blockName);
  if (!range) return pseudocode.trim();
  const lines = pseudocode.split(/\r?\n/u);
  return lines.slice(range.start, range.end).join("\n").trim();
}

// [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
// How: match Mode A scope entries against resolved block identities, honoring #closeout tag aliases.
export function scopeEntryMatchesBlock(entry: string, block: BlockIdentity): boolean {
  if (entry === block.id) return true;
  const parsed = parseScopeEntry(entry);
  const implToken = parsed.implToken ?? block.id.split("#")[0] ?? "";
  if (parsed.phaseTag === "closeout") {
    return block.name === parsed.procedureName
      && block.id.startsWith(`${implToken}#${parsed.procedureName}#`);
  }
  if (entry === block.name) return true;
  if (block.id.startsWith(`${entry}#`)) return true;
  const segments = entry.split("#");
  if (segments.length >= 2 && segments[0] === implToken && segments[1] === block.name) {
    return true;
  }
  return false;
}

export function inferScopeMode(scope: readonly string[]): "block" | "criterion" | "mixed" {
  if (scope.length === 0) return "block";
  const criterionEntries = scope.filter((entry) => entry.startsWith("REQ-"));
  if (criterionEntries.length === scope.length) return "criterion";
  const blockEntries = scope.filter((entry) => !entry.startsWith("REQ-"));
  if (blockEntries.length === scope.length) return "block";
  return "mixed";
}

// [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
// How: reject Mode A scope IDs that do not resolve to a supplied implementation block identity.
export function validateModeAInquiryScope(
  scope: readonly string[],
  graph: ObligationGraphInput,
): { ok: true } | { ok: false; error: ScopeValidationError } {
  if (scope.length === 0) {
    return {
      ok: false,
      error: { code: "INVALID_SCOPE", message: "Mode A scope must include at least one block identity." },
    };
  }
  const blocks = graph.implementationBlocks.map((item) => item.identity);
  const unmatched: string[] = [];
  for (const entry of scope) {
    if (!blocks.some((block) => scopeEntryMatchesBlock(entry, block))) {
      unmatched.push(entry);
    }
  }
  if (unmatched.length > 0) {
    const known = blocks.map((block) => block.id).sort().join(", ");
    return {
      ok: false,
      error: {
        code: "INVALID_SCOPE",
        message: `Scope entries do not match implementation blocks: ${unmatched.join(", ")}; known blocks: ${known || "(none)"}.`,
      },
    };
  }
  return { ok: true };
}

export function resolveModeBBlockNames(input: {
  implToken: string;
  procedures: readonly ProcedureRange[];
  explicitBlockName?: string;
  blockScope?: readonly string[];
}): { ok: true; names: string[]; primary: string } | { ok: false; error: ScopeValidationError } {
  if (input.procedures.length === 0) {
    return {
      ok: false,
      error: {
        code: "MISSING_BLOCK",
        message: `Implementation ${input.implToken} sidecar declares no procedure/function/block headings.`,
      },
    };
  }
  if (input.blockScope && input.blockScope.length > 0) {
    const validated = validateProcedureNames(input.blockScope, input.procedures, input.implToken);
    if (!validated.ok) return validated;
    const primaryEntry = parseScopeEntry(input.blockScope[0]).procedureName;
    const primary = input.explicitBlockName && validated.resolved.includes(input.explicitBlockName)
      ? input.explicitBlockName
      : primaryEntry;
    return { ok: true, names: validated.resolved, primary };
  }
  if (input.explicitBlockName) {
    const validated = validateProcedureNames([input.explicitBlockName], input.procedures, input.implToken);
    if (!validated.ok) return validated;
    return { ok: true, names: validated.resolved, primary: validated.resolved[0] };
  }
  const names = availableProcedureNames(input.procedures);
  return { ok: true, names, primary: names[0] };
}
