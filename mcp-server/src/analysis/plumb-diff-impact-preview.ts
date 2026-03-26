/**
 * Deterministic git-diff impact preview.
 *
 * Goal: produce a Plumb-style (diff-driven) report without any LLM/network calls.
 * - Input: staged/unstaged selection and/or explicit file paths.
 * - Core logic: deterministic token extraction from git patch lines (+ / -).
 * - Output: human summary + machine-readable, versioned JSON validated by Zod.
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { z } from "zod";

import {
  getDecisionsForRequirement,
  getRequirementsForDecision,
  getRecord,
  listTokens,
  type IndexName,
  clearBasePathCache,
} from "../yaml-loader.js";
import { getDetailPath } from "../detail-loader.js";

const TOKEN_REGEX = /\[(REQ-[A-Z0-9_-]+|ARCH-[A-Z0-9_-]+|IMPL-[A-Z0-9_-]+)\]/g;

function extractTokensFromLine(line: string): string[] {
  const out: string[] = [];
  const re = new RegExp(TOKEN_REGEX.source, "g");
  let m: RegExpExecArray | null;
  while ((m = re.exec(line)) !== null) out.push(m[1]);
  return out;
}

function classifyToken(token: string): "REQ" | "ARCH" | "IMPL" | "UNKNOWN" {
  if (token.startsWith("REQ-")) return "REQ";
  if (token.startsWith("ARCH-")) return "ARCH";
  if (token.startsWith("IMPL-")) return "IMPL";
  return "UNKNOWN";
}

function gitTopLevel(projectCwd: string): string {
  try {
    const raw = execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd: projectCwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return raw.trim();
  } catch {
    // Deterministic fallback: treat cwd as root.
    return projectCwd;
  }
}

function gitNameOnly(args: { staged: boolean; cwd: string }): string[] {
  const diffArgs = args.staged
    ? ["diff", "--cached", "--name-only", "--diff-filter=ACMRTUB", "--no-renames"]
    : ["diff", "--name-only", "--diff-filter=ACMRTUB", "--no-renames"];
  const raw = execFileSync("git", diffArgs, {
    cwd: args.cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
  return raw
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .sort();
}

function gitPatchForFile(args: { staged: boolean; cwd: string; fileRel: string }): string {
  const baseArgs = args.staged
    ? ["diff", "--cached", "--no-color", "--unified=3", "--", args.fileRel]
    : ["diff", "--no-color", "--unified=3", "--", args.fileRel];
  return execFileSync("git", baseArgs, {
    cwd: args.cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
}

function isBinaryDiffPatch(patch: string): boolean {
  // git emits these markers for binary diffs.
  return patch.includes("GIT binary patch") || patch.includes("Binary files");
}

function gitRelativePath(projectRootAbs: string, filePath: string): string | null {
  const abs = path.isAbsolute(filePath) ? filePath : path.resolve(process.cwd(), filePath);
  const rel = path.relative(projectRootAbs, abs);
  if (rel.startsWith("..") || path.isAbsolute(rel)) return null;
  return rel.split(path.sep).join("/");
}

export type PlumbDiffImpactPreviewSelection = "staged" | "unstaged" | "both";

export type PlumbDiffImpactPreviewArgs = {
  selection?: PlumbDiffImpactPreviewSelection;
  /**
   * Optional explicit path list. If provided, token scanning is restricted to these files
   * (order 1 exclusion: files outside this set are not scanned).
   *
   * Paths can be cwd-relative or absolute.
   */
  paths?: string[];
  /**
   * Include tokens found on removed (-) diff lines.
   * Default: true.
   */
  include_removed?: boolean;
  /**
   * Max candidate files scanned (deterministic truncation).
   * Default: 200.
   */
  max_files?: number;
  /**
   * Max patch bytes per file before truncating token extraction for that file.
   * Default: 250000.
   */
  max_patch_bytes?: number;
  /**
   * Max total patch bytes scanned across all files.
   * Default: 2000000.
   */
  max_total_patch_bytes?: number;
};

export type PlumbDiffImpactPreviewReport = z.infer<typeof PlumbDiffImpactPreviewReportSchema>;

export const IMPACT_PREVIEW_SCHEMA_VERSION = "impact-preview.v1";

export const PlumbDiffImpactPreviewReportSchema = z.object({
  schema_version: z.literal(IMPACT_PREVIEW_SCHEMA_VERSION),
  generated_at: z.string(),
  input: z.object({
    selection: z.enum(["staged", "unstaged", "both"]),
    paths: z.array(z.string()).optional(),
    include_removed: z.boolean(),
    max_files: z.number(),
    max_patch_bytes: z.number(),
    max_total_patch_bytes: z.number(),
  }),
  truncation: z
    .object({
      files_truncated: z.boolean(),
      files_truncated_at: z.number(),
      total_patch_bytes_truncated: z.boolean(),
      truncation_notice: z.string().optional(),
    })
    .optional(),
  touched_files: z
    .array(
      z.object({
        path: z.string(),
        selection_hit: z.array(z.enum(["staged", "unstaged"])),
        binary_diff_skipped: z.boolean(),
        patch_truncated: z.boolean(),
      })
    )
    .min(0),
  tokens_detected: z.object({
    added: z.object({
      REQ: z.array(z.string()),
      ARCH: z.array(z.string()),
      IMPL: z.array(z.string()),
    }),
    removed: z.object({
      REQ: z.array(z.string()),
      ARCH: z.array(z.string()),
      IMPL: z.array(z.string()),
    }),
    all: z.object({
      REQ: z.array(z.string()),
      ARCH: z.array(z.string()),
      IMPL: z.array(z.string()),
    }),
  }),
  token_references_detected: z.array(
    z.object({
      token: z.string(),
      type: z.enum(["REQ", "ARCH", "IMPL"]),
      direction: z.enum(["added", "removed", "added_and_removed"]),
      files: z.array(z.string()),
    })
  ),
  implicated: z.object({
    impacted_requirements: z.array(z.string()),
    impacted_architecture: z.array(z.string()),
    impacted_implementation: z.array(z.string()),
    decisions_by_requirement: z.record(
      z.string(),
      z.object({
        architecture: z.array(z.string()),
        implementation: z.array(z.string()),
      })
    ),
  }),
  token_registry_checks: z.object({
    semantic_tokens_missing: z.array(z.string()),
    missing_index_records: z.object({
      REQ: z.array(z.string()),
      ARCH: z.array(z.string()),
      IMPL: z.array(z.string()),
    }),
    missing_detail_files: z.object({
      REQ: z.array(z.string()),
      ARCH: z.array(z.string()),
      IMPL: z.array(z.string()),
    }),
  }),
  suggested_detail_files_to_open: z.array(
    z.object({
      token: z.string(),
      type: z.enum(["REQ", "ARCH", "IMPL"]),
      detail_path: z.string(),
      exists: z.boolean(),
      rationale: z.string(),
    })
  ),
  leap_actions_checklist: z.array(
    z.object({
      id: z.string(),
      action: z.string(),
      non_authoritative: z.literal(true),
      trigger: z.string(),
    })
  ),
  human_readable_summary: z.string(),
});

export function runPlumbDiffImpactPreview(args: PlumbDiffImpactPreviewArgs): PlumbDiffImpactPreviewReport {
  // Keep base_path deterministic within a single report build.
  clearBasePathCache();

  const projectCwd = process.cwd();
  const projectRootAbs = gitTopLevel(projectCwd);
  const selection: PlumbDiffImpactPreviewSelection = args.selection ?? "both";
  const includeRemoved = args.include_removed ?? true;
  const maxFiles = args.max_files ?? 200;
  const maxPatchBytes = args.max_patch_bytes ?? 250_000;
  const maxTotalPatchBytes = args.max_total_patch_bytes ?? 2_000_000;

  const stagedHit = selection === "staged" || selection === "both";
  const unstagedHit = selection === "unstaged" || selection === "both";

  const stagedFiles = stagedHit ? gitNameOnly({ staged: true, cwd: projectRootAbs }) : [];
  const unstagedFiles = unstagedHit ? gitNameOnly({ staged: false, cwd: projectRootAbs }) : [];

  const stagedSet = new Set(stagedFiles);
  const unstagedSet = new Set(unstagedFiles);
  const allDiffFiles = Array.from(new Set([...stagedFiles, ...unstagedFiles])).sort();

  // Path list restriction (order 1 exclusion).
  let explicitRelPaths: string[] | null = null;
  if (args.paths && args.paths.length > 0) {
    explicitRelPaths = args.paths
      .map((p) => gitRelativePath(projectRootAbs, p))
      .filter((p): p is string => p !== null);
  }

  const candidateFiles = explicitRelPaths
    ? explicitRelPaths
    : allDiffFiles;

  const filesTruncated = candidateFiles.length > maxFiles;
  const truncatedCandidateFiles = filesTruncated ? candidateFiles.slice(0, maxFiles) : candidateFiles;

  const touchedFiles: PlumbDiffImpactPreviewReport["touched_files"] = [];

  const addedByType: Record<"REQ" | "ARCH" | "IMPL", Set<string>> = {
    REQ: new Set(),
    ARCH: new Set(),
    IMPL: new Set(),
  };
  const removedByType: Record<"REQ" | "ARCH" | "IMPL", Set<string>> = {
    REQ: new Set(),
    ARCH: new Set(),
    IMPL: new Set(),
  };

  const tokenFiles: Record<
    string,
    { type: "REQ" | "ARCH" | "IMPL"; added: Set<string>; removed: Set<string> }
  > = {};

  const semanticTokens = new Set<string>(listTokens("semantic-tokens"));

  // Deterministic byte accounting for truncation notice.
  let totalPatchBytes = 0;
  let totalPatchTruncated = false;

  for (const fileRel of truncatedCandidateFiles) {
    if (totalPatchTruncated) break;

    const selectionHit: Array<"staged" | "unstaged"> = [];
    if (stagedSet.has(fileRel)) selectionHit.push("staged");
    if (unstagedSet.has(fileRel)) selectionHit.push("unstaged");
    // When paths are provided explicitly, it is valid to have selection_hit empty.
    // In that case, we still include the file in `touched_files` but extract no tokens
    // (since no staged/unstaged diff hunks exist for it).

    let binarySkipped = false;
    let patchTruncated = false;

    // Scan patches:
    // - for "added" tokens: parse '+' lines from both staged/unstaged patches.
    // - for "removed" tokens: parse '-' lines; depends on includeRemoved.
    // Note: token direction is derived from tokenFiles map below.
    // We must parse both '+' and '-' lines; simplest: parse whole patch twice with dir filter.
    // Determinism: parse the same patch output consistently.
    for (const mode of selectionHit) {
      const patch = gitPatchForFile({ staged: mode === "staged", cwd: projectRootAbs, fileRel });
      if (patch.trim().length === 0) continue;

      if (isBinaryDiffPatch(patch)) {
        binarySkipped = true;
        continue;
      }

      const bytes = Buffer.byteLength(patch, "utf8");
      totalPatchBytes += bytes;
      if (bytes > maxPatchBytes) patchTruncated = true;
      if (totalPatchBytes > maxTotalPatchBytes) totalPatchTruncated = true;

      const maybeTruncatedPatch = bytes > maxPatchBytes ? patch.slice(0, maxPatchBytes) : patch;

      // Added lines:
      {
        const lines = maybeTruncatedPatch.split(/\r?\n/);
        for (const line of lines) {
          if (!line.startsWith("+") || line.startsWith("+++")) continue;
          const tokens = extractTokensFromLine(line.slice(1));
          for (const token of tokens) {
            const t = classifyToken(token);
            if (t === "UNKNOWN") continue;
            addedByType[t].add(token);
            if (!tokenFiles[token]) tokenFiles[token] = { type: t, added: new Set(), removed: new Set() };
            tokenFiles[token].added.add(fileRel);
          }
        }
      }

      if (includeRemoved) {
        // Removed lines:
        const lines = maybeTruncatedPatch.split(/\r?\n/);
        for (const line of lines) {
          if (!line.startsWith("-") || line.startsWith("---")) continue;
          const tokens = extractTokensFromLine(line.slice(1));
          for (const token of tokens) {
            const t = classifyToken(token);
            if (t === "UNKNOWN") continue;
            removedByType[t].add(token);
            if (!tokenFiles[token]) tokenFiles[token] = { type: t, added: new Set(), removed: new Set() };
            tokenFiles[token].removed.add(fileRel);
          }
        }
      }

      if (totalPatchTruncated) break;
    }

    touchedFiles.push({
      path: fileRel,
      selection_hit: selectionHit,
      binary_diff_skipped: binarySkipped,
      patch_truncated: patchTruncated,
    });
  }

  const added = {
    REQ: [...addedByType.REQ].sort(),
    ARCH: [...addedByType.ARCH].sort(),
    IMPL: [...addedByType.IMPL].sort(),
  };
  const removed = {
    REQ: [...removedByType.REQ].sort(),
    ARCH: [...removedByType.ARCH].sort(),
    IMPL: [...removedByType.IMPL].sort(),
  };
  const all = {
    REQ: Array.from(new Set([...addedByType.REQ, ...removedByType.REQ])).sort(),
    ARCH: Array.from(new Set([...addedByType.ARCH, ...removedByType.ARCH])).sort(),
    IMPL: Array.from(new Set([...addedByType.IMPL, ...removedByType.IMPL])).sort(),
  };

  const discoveredReq = all.REQ;
  const discoveredArch = all.ARCH;
  const discoveredImpl = all.IMPL;

  const impactedRequirements = new Set<string>(discoveredReq);
  const impactedArchitecture = new Set<string>(discoveredArch);
  const impactedImplementation = new Set<string>(discoveredImpl);

  const decisionsByRequirement: PlumbDiffImpactPreviewReport["implicated"]["decisions_by_requirement"] = {};

  for (const reqToken of discoveredReq) {
    const decisions = getDecisionsForRequirement(reqToken);
    const archTokens = Object.keys(decisions.architecture ?? {});
    const implTokens = Object.keys(decisions.implementation ?? {});
    for (const t of archTokens) impactedArchitecture.add(t);
    for (const t of implTokens) impactedImplementation.add(t);
    decisionsByRequirement[reqToken] = {
      architecture: archTokens.sort(),
      implementation: implTokens.sort(),
    };
  }

  // Expand via discovered ARCH/IMPL tokens: include referenced requirements.
  for (const decisionToken of discoveredArch) {
    const reqs = getRequirementsForDecision(decisionToken);
    for (const t of reqs.requirementTokens) impactedRequirements.add(t);
  }
  for (const decisionToken of discoveredImpl) {
    const reqs = getRequirementsForDecision(decisionToken);
    for (const t of reqs.requirementTokens) impactedRequirements.add(t);
  }

  const allImpactedTokens = new Set([...impactedRequirements, ...impactedArchitecture, ...impactedImplementation]);

  const missing_index_records: PlumbDiffImpactPreviewReport["token_registry_checks"]["missing_index_records"] = {
    REQ: [],
    ARCH: [],
    IMPL: [],
  };
  const missing_detail_files: PlumbDiffImpactPreviewReport["token_registry_checks"]["missing_detail_files"] = {
    REQ: [],
    ARCH: [],
    IMPL: [],
  };

  const semanticTokensMissing: string[] = [];

  const suggestedDetailFilesToOpen: PlumbDiffImpactPreviewReport["suggested_detail_files_to_open"] = [];

  // Base path relative presentation:
  const tiedBasePathAbs = process.env.TIED_BASE_PATH ?? path.resolve(projectRootAbs, "tied");
  void tiedBasePathAbs;

  for (const token of Array.from(allImpactedTokens).sort()) {
    const tType = classifyToken(token);
    if (tType === "UNKNOWN") continue;

    if (!semanticTokens.has(token)) semanticTokensMissing.push(token);

    const indexName: IndexName = tType === "REQ" ? "requirements" : tType === "ARCH" ? "architecture" : "implementation";
    const indexRecord = getRecord(indexName, token);
    if (!indexRecord) missing_index_records[tType].push(token);

    const detailPathAbsMaybe = getDetailPath(token);
    const detailPathAbs = detailPathAbsMaybe ?? path.join(projectRootAbs, "tied", tType === "REQ"
      ? "requirements"
      : tType === "ARCH"
        ? "architecture-decisions"
        : "implementation-decisions", `${token}.yaml`);
    const exists = fs.existsSync(detailPathAbs);

    if (!exists) missing_detail_files[tType].push(token);

    const detailPathRel = path.relative(projectRootAbs, detailPathAbs).split(path.sep).join("/");
    const rationaleParts: string[] = [];
    if (!semanticTokens.has(token)) rationaleParts.push("Token not found in `tied/semantic-tokens.yaml` (may be newly introduced).");
    if (!indexRecord) rationaleParts.push("Missing index record in the matching `tied/{requirements|architecture|implementation}.yaml`.");
    if (!exists) rationaleParts.push("Suggested detail file does not exist yet; add it to complete traceability.");
    if (rationaleParts.length === 0) rationaleParts.push("Traceability chain appears present for this token (suggested for review).");

    suggestedDetailFilesToOpen.push({
      token,
      type: tType,
      detail_path: detailPathRel,
      exists,
      rationale: rationaleParts.join(" "),
    });
  }

  const tokenReferencesDetected: PlumbDiffImpactPreviewReport["token_references_detected"] = Object.entries(tokenFiles)
    .map(([token, entry]) => {
      const direction: "added" | "removed" | "added_and_removed" =
        entry.added.size > 0 && entry.removed.size > 0
          ? "added_and_removed"
          : entry.added.size > 0
            ? "added"
            : "removed";
      return {
        token,
        type: entry.type,
        direction,
        files: Array.from(new Set([...entry.added, ...entry.removed])).sort(),
      };
    })
    .sort((a, b) => a.token.localeCompare(b.token));

  // Heuristic, non-authoritative LEAP hints.
  const leap_actions_checklist: PlumbDiffImpactPreviewReport["leap_actions_checklist"] = [];
  const addAction = (id: string, action: string, trigger: string) => {
    leap_actions_checklist.push({ id, action, non_authoritative: true, trigger });
  };

  if (semanticTokensMissing.length > 0) {
    addAction(
      "LEAP-ADD-MISSING-TOKENS",
      "For any unregistered `[REQ-*]/[ARCH-*]/[IMPL-*]` tokens, consider creating/recording them in TIED (index + detail) so traceability is complete.",
      `Unregistered tokens detected in diff: ${semanticTokensMissing.slice(0, 5).join(", ")}${semanticTokensMissing.length > 5 ? "…" : ""}`
    );
  }
  const missingIndexAny =
    missing_index_records.REQ.length + missing_index_records.ARCH.length + missing_index_records.IMPL.length > 0;
  if (missingIndexAny) {
    addAction(
      "LEAP-FIX-INDEX-LINKAGE",
      "Open the relevant TIED index YAML and ensure each discovered token has a record (including `detail_file`) so ARCH/IMPL trace to REQ.",
      "Missing index records detected for one or more tokens."
    );
  }
  const missingDetailAny =
    missing_detail_files.REQ.length + missing_detail_files.ARCH.length + missing_detail_files.IMPL.length > 0;
  if (missingDetailAny) {
    addAction(
      "LEAP-FIX-DETAIL-FILES",
      "Open the suggested detail YAML files and ensure the token's traceability fields (and IMPL `essence_pseudocode` token comments) are present.",
      "Missing token detail files detected."
    );
  }
  if (all.REQ.length > 0) {
    addAction(
      "LEAP-VALIDATE-CONSISTENCY",
      "After aligning documentation and (if needed) code/tests, run `tied_validate_consistency` to confirm REQ→ARCH→IMPL→tests/code traceability.",
      "Diff includes REQ tokens."
    );
  }
  if (all.IMPL.length > 0) {
    addAction(
      "LEAP-CHECK-IMPL-PSEUDOCODE",
      "If IMPL detail files or pseudo-code are implicated, ensure every IMPL `essence_pseudocode` block includes `[REQ-*]/[ARCH-*]/[IMPL-*]` token comments per `[PROC-IMPL_PSEUDOCODE_TOKENS]`, then adjust tests/code via TDD.",
      "Diff includes IMPL tokens."
    );
  }
  if (leap_actions_checklist.length === 0) {
    addAction(
      "LEAP-RECHECK-TOKEN-AUDIT",
      "Even if no linkage issues are detected, perform a token audit on edited files to ensure annotations remain consistent.",
      "No registry/index/detail gaps detected for impacted tokens."
    );
  }

  const human_readable_summary = [
    `Plumb diff impact preview (${selection})`,
    `Touched files: ${touchedFiles.length}${filesTruncated ? ` (truncated to first ${maxFiles})` : ""}`,
    `Tokens added: REQ=${added.REQ.length}, ARCH=${added.ARCH.length}, IMPL=${added.IMPL.length}`,
    `Tokens removed: REQ=${removed.REQ.length}, ARCH=${removed.ARCH.length}, IMPL=${removed.IMPL.length}`,
    `Implicated requirements: ${impactedRequirements.size}, architecture: ${impactedArchitecture.size}, implementation: ${impactedImplementation.size}`,
    semanticTokensMissing.length > 0
      ? `Unregistered semantic tokens: ${semanticTokensMissing.slice(0, 10).join(", ")}${semanticTokensMissing.length > 10 ? "…" : ""}`
      : "Unregistered semantic tokens: none detected",
    missing_index_records.REQ.length + missing_index_records.ARCH.length + missing_index_records.IMPL.length > 0
      ? "Missing index records: yes (see JSON)"
      : "Missing index records: none detected",
    missing_detail_files.REQ.length + missing_detail_files.ARCH.length + missing_detail_files.IMPL.length > 0
      ? "Missing detail files: yes (see JSON)"
      : "Missing detail files: none detected",
    "LEAP hints are non-authoritative heuristics (not an automatic fix).",
  ].join("\n");

  const reportBase: Omit<PlumbDiffImpactPreviewReport, "human_readable_summary"> = {
    schema_version: IMPACT_PREVIEW_SCHEMA_VERSION,
    generated_at: new Date().toISOString(),
    input: {
      selection,
      paths: explicitRelPaths ?? undefined,
      include_removed: includeRemoved,
      max_files: maxFiles,
      max_patch_bytes: maxPatchBytes,
      max_total_patch_bytes: maxTotalPatchBytes,
    },
    truncation:
      filesTruncated || totalPatchTruncated
        ? {
            files_truncated: filesTruncated,
            files_truncated_at: maxFiles,
            total_patch_bytes_truncated: totalPatchTruncated,
            truncation_notice:
              filesTruncated || totalPatchTruncated
                ? "Truncation applied for determinism and performance; results are best-effort."
                : undefined,
          }
        : undefined,
    touched_files: touchedFiles.map((t) => ({
      ...t,
      selection_hit: t.selection_hit as Array<"staged" | "unstaged">,
    })),
    tokens_detected: {
      added,
      removed,
      all,
    },
    token_references_detected: tokenReferencesDetected,
    implicated: {
      impacted_requirements: [...impactedRequirements].sort(),
      impacted_architecture: [...impactedArchitecture].sort(),
      impacted_implementation: [...impactedImplementation].sort(),
      decisions_by_requirement: decisionsByRequirement,
    },
    token_registry_checks: {
      semantic_tokens_missing: semanticTokensMissing.sort(),
      missing_index_records: {
        REQ: missing_index_records.REQ.sort(),
        ARCH: missing_index_records.ARCH.sort(),
        IMPL: missing_index_records.IMPL.sort(),
      },
      missing_detail_files: {
        REQ: missing_detail_files.REQ.sort(),
        ARCH: missing_detail_files.ARCH.sort(),
        IMPL: missing_detail_files.IMPL.sort(),
      },
    },
    suggested_detail_files_to_open: suggestedDetailFilesToOpen,
    leap_actions_checklist,
  };

  const report = PlumbDiffImpactPreviewReportSchema.parse({
    ...reportBase,
    human_readable_summary,
  });

  return report;
}

