/**
 * [IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [ARCH-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP] [REQ-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP]
 * How: Detect and normalize external-only and inter-procedure block-leads using pseudocode-shared scan bounds.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import {
  isBlockLeadCommentLine,
  scanProcedureBlocks,
} from "../../mcp-server/dist/analysis/pseudocode-shared.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const REPO_ROOT = path.resolve(__dirname, "..", "..");
export const DEFAULT_SIDECAR_ROOT = path.join(REPO_ROOT, "tied", "implementation-decisions");

export const WAVE_B1_TOKENS = [
  "IMPL-TIED_CHECKLIST_GATE_ENFORCEMENT",
  "IMPL-REQUEST_EVIDENCE_ENVELOPE",
  "IMPL-QUALITY_PSEUDOCODE_VALIDATOR",
  "IMPL-QUALITY_EVIDENCE_COMMAND_RUNNER",
  "IMPL-QUALITY_BINDING_INVENTORY",
];

export const WAVE_B2_TOKENS = [
  "IMPL-PSEUDOCODE_ANALYSIS_ENGINE",
  "IMPL-PSEUDOCODE_SHARED_PRIMITIVES",
  "IMPL-PSEUDOCODE_CONSTRAINT_LANGUAGE",
  "IMPL-PSEUDOCODE_TYPED_FLOW",
  "IMPL-PSEUDOCODE_GRAMMAR_V2_DEFAULT",
  "IMPL-TIED_YAML_CANONICALIZER",
  "IMPL-TIED_YAML_STYLE_RESOLVER",
  "IMPL-TIED_FILES",
  "IMPL-MCP_LEAP_PROPOSAL_QUEUE",
  "IMPL-MCP_FEEDBACK_TOOLS",
  "IMPL-MCP_USAGE_METRICS",
  "IMPL-GOAGENT-PIPELINE",
  "IMPL-GOAGENT-EXECUTOR",
  "IMPL-GOAGENT-CHECKLIST",
  "IMPL-GOAGENT-FEATURESPEC",
  "IMPL-GOAGENT-NON-COMPACT-HTML-FORMAT",
  "IMPL-TIED_ADVERSARIAL_INQUIRY",
  "IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST",
  "IMPL-TIED_CLAIMS_EVIDENCE_REVIEW",
  "IMPL-EVIDENCE_CHAIN_PROFILE",
  "IMPL-EVIDENCE_CHAIN_REPORT",
  "IMPL-PROMPT_TYPE_GLOBAL_SKILLS",
  "IMPL-PROMPT_TYPE_SUBAGENT",
  "IMPL-VOCABULARY_ANALYSIS",
  "IMPL-FEAT_ORCHESTRATION_MCP",
];

export const WAVE_B3_EXCLUDE_TOKENS = new Set([
  ...WAVE_B1_TOKENS,
  ...WAVE_B2_TOKENS,
  "IMPL-PSEUDOCODE_SIDECAR_BLOCK_LEAD_SWEEP",
]);

const WAVE_TOKEN_LISTS = {
  B1: WAVE_B1_TOKENS,
  B2: WAVE_B2_TOKENS,
};

/**
 * @param {string} implToken
 * @returns {string}
 */
export function sidecarPathForToken(implToken, root = DEFAULT_SIDECAR_ROOT) {
  return path.join(root, `${implToken}-pseudocode.md`);
}

/**
 * @param {string} filePath
 * @returns {string}
 */
export function implTokenFromSidecarPath(filePath) {
  const base = path.basename(filePath);
  const match = base.match(/^(IMPL-[A-Za-z0-9_-]+)-pseudocode\.md$/);
  if (!match) {
    throw new Error(`Invalid sidecar path: ${filePath}`);
  }
  return match[1];
}

/**
 * @param {readonly string[]} lines
 * @param {number} procStart
 * @returns {number}
 */
export function findContractLineIndex(lines, procStart) {
  for (let index = procStart + 1; index < lines.length; index += 1) {
    if (/^\s*Contract\s*:/i.test(lines[index] ?? "")) {
      return index;
    }
    if (/^\s*(procedure|function|block)\s+[A-Z][A-Z0-9_]*\b/i.test(lines[index] ?? "")) {
      break;
    }
  }
  return -1;
}

/**
 * @param {readonly string[]} lines
 * @param {import("../../mcp-server/dist/analysis/pseudocode-shared.js").ProcedureRange} proc
 * @param {number} [nextStart]
 */
export function procedureBodyLines(lines, proc, nextStart = proc.end) {
  return lines.slice(proc.start + 1, nextStart);
}

/**
 * @param {readonly string[]} lines
 * @param {import("../../mcp-server/dist/analysis/pseudocode-shared.js").ProcedureRange} proc
 * @param {string} leadLine
 * @param {number} [nextStart]
 */
export function hasMatchingInternalLead(lines, proc, leadLine, nextStart = proc.end) {
  return procedureBodyLines(lines, proc, nextStart).some(
    (line) => line.trim() === leadLine.trim(),
  );
}

/**
 * @param {readonly string[]} lines
 * @returns {{ external_only: object[], inter_procedure: object[], procedures: import("../../mcp-server/dist/analysis/pseudocode-shared.js").ProcedureRange[] }}
 */
export function scanBlockLeadPlacementFromLines(lines) {
  const procedures = scanProcedureBlocks(lines);
  /** @type {object[]} */
  const external_only = [];
  /** @type {object[]} */
  const inter_procedure = [];

  for (let index = 0; index < procedures.length; index += 1) {
    const proc = procedures[index];
    if (proc.tokenScanStart < proc.start) {
      for (let lineIndex = proc.tokenScanStart; lineIndex < proc.start; lineIndex += 1) {
        external_only.push({
          line_index: lineIndex,
          line: lines[lineIndex],
          procedure: proc.name,
          kind: "external_only",
        });
      }
    }
    if (proc.tokenScanEnd < proc.end) {
      for (let lineIndex = proc.tokenScanEnd; lineIndex < proc.end; lineIndex += 1) {
        if (!isBlockLeadCommentLine(lines[lineIndex] ?? "")) continue;
        inter_procedure.push({
          line_index: lineIndex,
          line: lines[lineIndex],
          from_procedure: proc.name,
          to_procedure: procedures[index + 1]?.name ?? null,
          kind: "inter_procedure",
        });
      }
    }
  }

  return { external_only, inter_procedure, procedures };
}

/**
 * @param {string} content
 */
export function scanBlockLeadPlacement(content) {
  const lines = content.split("\n");
  return scanBlockLeadPlacementFromLines(lines);
}

/**
 * @param {string} content
 * @returns {string}
 */
export function normalizeSidecarBlockLeads(content) {
  const lines = content.split("\n");
  const { procedures } = scanBlockLeadPlacementFromLines(lines);
  /** @type {Map<number, { afterIndex: number, line: string, insert: boolean }>} */
  const moves = new Map();

  /**
   * @param {number} lineIndex
   * @param {number} afterIndex
   * @param {string} line
   * @param {import("../../mcp-server/dist/analysis/pseudocode-shared.js").ProcedureRange} targetProc
   */
  function queueMove(lineIndex, afterIndex, line, targetProc) {
    if (moves.has(lineIndex)) return;
    const insert = !hasMatchingInternalLead(lines, targetProc, line);
    moves.set(lineIndex, { afterIndex, line, insert });
  }

  for (let index = 0; index < procedures.length; index += 1) {
    const proc = procedures[index];
    if (proc.tokenScanStart < proc.start) {
      for (let lineIndex = proc.tokenScanStart; lineIndex < proc.start; lineIndex += 1) {
        queueMove(lineIndex, proc.start, lines[lineIndex], proc);
      }
    }

    if (proc.tokenScanEnd < proc.end) {
      const nextProc = procedures[index + 1];
      if (!nextProc) {
        throw new Error("NextProcedureMissing");
      }
      for (let lineIndex = proc.tokenScanEnd; lineIndex < proc.end; lineIndex += 1) {
        if (!isBlockLeadCommentLine(lines[lineIndex] ?? "")) continue;
        queueMove(lineIndex, nextProc.start, lines[lineIndex], nextProc);
      }
    }
  }

  /** @type {Map<number, string[]>} */
  const insertAfter = new Map();
  for (const [lineIndex, move] of [...moves.entries()].sort(
    (left, right) => left[0] - right[0],
  )) {
    if (move.insert) {
      const existing = insertAfter.get(move.afterIndex) ?? [];
      existing.push(move.line);
      insertAfter.set(move.afterIndex, existing);
    }
    void lineIndex;
  }

  /** @type {string[]} */
  const result = [];
  for (let index = 0; index < lines.length; index += 1) {
    if (moves.has(index)) continue;
    result.push(lines[index]);
    if (insertAfter.has(index)) {
      result.push(...insertAfter.get(index));
    }
  }
  return result.join("\n");
}

/**
 * @param {string} root
 * @param {"B1"|"B2"|"B3"|null} wave
 * @param {string[]} explicitFiles
 */
export function resolveSidecarFiles(root, wave, explicitFiles = []) {
  if (explicitFiles.length > 0) {
    return explicitFiles.map((filePath) => path.resolve(filePath));
  }
  if (wave === "B3") {
    return fs
      .readdirSync(root)
      .filter((name) => name.endsWith("-pseudocode.md"))
      .map((name) => name.replace(/-pseudocode\.md$/, ""))
      .filter((token) => !WAVE_B3_EXCLUDE_TOKENS.has(token))
      .sort((left, right) => left.localeCompare(right))
      .map((token) => sidecarPathForToken(token, root));
  }
  if (wave && WAVE_TOKEN_LISTS[wave]) {
    return WAVE_TOKEN_LISTS[wave].map((token) => sidecarPathForToken(token, root));
  }
  return fs
    .readdirSync(root)
    .filter((name) => name.endsWith("-pseudocode.md"))
    .sort((left, right) => left.localeCompare(right))
    .map((name) => path.join(root, name));
}

/**
 * @param {string[]} filePaths
 */
export function buildInventory(filePaths) {
  /** @type {Record<string, object>} */
  const files = {};
  let totalExternal = 0;
  let totalInter = 0;

  for (const filePath of filePaths) {
    const content = fs.readFileSync(filePath, "utf8");
    const placement = scanBlockLeadPlacement(content);
    files[filePath] = {
      impl_token: implTokenFromSidecarPath(filePath),
      external_only: placement.external_only,
      inter_procedure: placement.inter_procedure,
      external_only_count: placement.external_only.length,
      inter_procedure_count: placement.inter_procedure.length,
    };
    totalExternal += placement.external_only.length;
    totalInter += placement.inter_procedure.length;
  }

  return {
    schema_version: "block-lead-inventory.v1",
    generated_at: new Date().toISOString(),
    file_count: filePaths.length,
    totals: {
      external_only: totalExternal,
      inter_procedure: totalInter,
    },
    files,
    ok: totalExternal === 0 && totalInter === 0,
  };
}

/**
 * @param {string[]} filePaths
 * @param {{ dryRun?: boolean, write?: boolean }} [options]
 */
export function applyNormalization(filePaths, options = {}) {
  const dryRun = options.dryRun === true;
  const write = options.write === true;
  /** @type {Record<string, object>} */
  const results = {};

  for (const filePath of filePaths) {
    const before = fs.readFileSync(filePath, "utf8");
    const beforePlacement = scanBlockLeadPlacement(before);
    if (beforePlacement.external_only.length === 0 && beforePlacement.inter_procedure.length === 0) {
      results[filePath] = { changed: false };
      continue;
    }
    const after = normalizeSidecarBlockLeads(before);
    const afterPlacement = scanBlockLeadPlacement(after);
    const changed = after !== before;
    results[filePath] = {
      changed,
      before: beforePlacement,
      after: afterPlacement,
      diff_lines: changed ? summarizeDiff(before, after) : [],
    };
    if (write && changed && !dryRun) {
      fs.writeFileSync(filePath, after, "utf8");
    }
  }

  return results;
}

/**
 * @param {string} before
 * @param {string} after
 */
function summarizeDiff(before, after) {
  const beforeLines = before.split("\n");
  const afterLines = after.split("\n");
  /** @type {string[]} */
  const diff = [];
  const max = Math.max(beforeLines.length, afterLines.length);
  for (let index = 0; index < max; index += 1) {
    const left = beforeLines[index];
    const right = afterLines[index];
    if (left !== right) {
      diff.push(`@@ line ${index + 1}`);
      if (left !== undefined) diff.push(`- ${left}`);
      if (right !== undefined) diff.push(`+ ${right}`);
    }
  }
  return diff.slice(0, 40);
}
