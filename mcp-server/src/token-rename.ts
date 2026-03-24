/**
 * Rename a single semantic token across the TIED tree: YAML indexes, detail files, and file names.
 * Uses exact string replacement; validates and pretty-prints YAML with yq when available (one yq -i -P per file).
 */

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { getBasePath, getRecord, loadIndex, getWritableIndexPath, type IndexName } from "./yaml-loader.js";
import { getDetailPath } from "./detail-loader.js";

const INDEX_FILES: IndexName[] = [
  "semantic-tokens",
  "requirements",
  "architecture",
  "implementation",
];

const DETAIL_SUBDIRS = ["requirements", "architecture-decisions", "implementation-decisions"] as const;

function getTokenPrefix(token: string): string | null {
  if (token.startsWith("REQ-")) return "REQ-";
  if (token.startsWith("ARCH-")) return "ARCH-";
  if (token.startsWith("IMPL-")) return "IMPL-";
  if (token.startsWith("PROC-")) return "PROC-";
  return null;
}

function getIndexForToken(token: string): IndexName | null {
  const prefix = getTokenPrefix(token);
  if (prefix === "REQ-") return "requirements";
  if (prefix === "ARCH-") return "architecture";
  if (prefix === "IMPL-") return "implementation";
  return null;
}

export interface RenameTokenResult {
  ok: boolean;
  files_modified?: string[];
  file_renamed?: string;
  errors?: string[];
  dry_run?: boolean;
}

/**
 * Collect all YAML file paths under base that may contain token references.
 * For PROC tokens, only semantic-tokens.yaml (and optionally processes.md) is relevant.
 */
function collectYamlPaths(base: string, tokenIndex: IndexName | null): string[] {
  const paths: string[] = [];

  for (const idx of INDEX_FILES) {
    const p = getWritableIndexPath(idx);
    if (fs.existsSync(p)) paths.push(p);
  }

  if (fs.existsSync(path.join(base, "feedback.yaml"))) {
    paths.push(path.join(base, "feedback.yaml"));
  }

  if (tokenIndex !== null) {
    for (const subdir of DETAIL_SUBDIRS) {
      const dir = path.join(base, subdir);
      if (fs.existsSync(dir)) {
        const names = fs.readdirSync(dir);
        for (const n of names) {
          if (n.endsWith(".yaml") || n.endsWith(".md")) {
            paths.push(path.join(dir, n));
          }
        }
      }
    }
  }

  return paths;
}

function runYqPrettyPrint(filePath: string): { ok: boolean; error?: string } {
  const result = spawnSync("yq", ["-i", "-P", filePath], { encoding: "utf8" });
  if (result.status !== 0) {
    const stderr = result.stderr?.trim() || result.error?.message || String(result.status);
    return { ok: false, error: stderr };
  }
  return { ok: true };
}

/**
 * Rename a single semantic token across the TIED tree.
 * Replaces exact string old_token with new_token in all YAML (and optionally processes.md).
 * Renames the detail file for REQ/ARCH/IMPL when it exists.
 * Runs yq -i -P on each modified YAML file when yq is available (one path per process; multi-arg yq -i merges documents).
 */
export function renameSemanticToken(
  oldToken: string,
  newToken: string,
  options: { dryRun?: boolean; includeMarkdown?: boolean } = {}
): RenameTokenResult {
  const { dryRun = false, includeMarkdown = false } = options;
  const errors: string[] = [];
  const filesModified: string[] = [];

  const base = getBasePath();

  const oldPrefix = getTokenPrefix(oldToken);
  const newPrefix = getTokenPrefix(newToken);
  if (!oldPrefix || !newPrefix) {
    return { ok: false, errors: [`Invalid old_token or new_token: must be REQ-*, ARCH-*, IMPL-*, or PROC-*`] };
  }
  if (oldPrefix !== newPrefix) {
    return { ok: false, errors: [`Token prefix must match: ${oldToken} and ${newToken} have different prefixes`] };
  }

  const semTokens = loadIndex("semantic-tokens");
  if (!semTokens || !(oldToken in semTokens)) {
    return { ok: false, errors: [`old_token not found in semantic-tokens: ${oldToken}`] };
  }
  if (newToken in semTokens) {
    return { ok: false, errors: [`new_token already exists in semantic-tokens: ${newToken}`] };
  }

  const tokenIndex = getIndexForToken(oldToken);
  if (tokenIndex !== null) {
    const idxData = loadIndex(tokenIndex);
    if (idxData && newToken in idxData) {
      return { ok: false, errors: [`new_token already exists in ${tokenIndex}: ${newToken}`] };
    }
  }

  const yamlPaths = collectYamlPaths(base, tokenIndex);

  for (const filePath of yamlPaths) {
    if (!fs.existsSync(filePath)) continue;
    const content = fs.readFileSync(filePath, "utf8");
    if (!content.includes(oldToken)) continue;
    const newContent = content.split(oldToken).join(newToken);
    if (newContent === content) continue;
    if (dryRun) {
      filesModified.push(filePath);
      continue;
    }
    try {
      fs.writeFileSync(filePath, newContent, "utf8");
      filesModified.push(filePath);
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      errors.push(`Failed to write ${filePath}: ${message}`);
    }
  }

  if (includeMarkdown) {
    const processesPath = path.join(base, "processes.md");
    if (fs.existsSync(processesPath)) {
      const content = fs.readFileSync(processesPath, "utf8");
      if (content.includes(oldToken)) {
        const newContent = content.split(oldToken).join(newToken);
        if (dryRun) {
          filesModified.push(processesPath);
        } else {
          try {
            fs.writeFileSync(processesPath, newContent, "utf8");
            filesModified.push(processesPath);
          } catch (e) {
            const message = e instanceof Error ? e.message : String(e);
            errors.push(`Failed to write ${processesPath}: ${message}`);
          }
        }
      }
    }
  }

  let fileRenamed: string | undefined;
  if (tokenIndex !== null && dryRun) {
    const detailPath = getDetailPath(oldToken);
    if (detailPath && fs.existsSync(detailPath)) {
      const ext = path.extname(detailPath);
      const dir = path.dirname(detailPath);
      fileRenamed = path.join(dir, `${newToken}${ext}`);
    }
  }

  if (!dryRun && filesModified.length > 0) {
    for (const filePath of filesModified) {
      if (filePath.endsWith(".yaml")) {
        runYqPrettyPrint(filePath);
      }
    }
  }

  if (tokenIndex !== null && !dryRun) {
    const detailPath = getDetailPath(oldToken);
    if (detailPath && fs.existsSync(detailPath)) {
      const ext = path.extname(detailPath);
      const dir = path.dirname(detailPath);
      const newDetailPath = path.join(dir, `${newToken}${ext}`);
      if (detailPath !== newDetailPath) {
        try {
          fs.renameSync(detailPath, newDetailPath);
          fileRenamed = newDetailPath;
        } catch (e) {
          const message = e instanceof Error ? e.message : String(e);
          errors.push(`Failed to rename detail file ${detailPath} -> ${newDetailPath}: ${message}`);
        }
      }
    }
  }

  return {
    ok: errors.length === 0,
    files_modified: filesModified.length > 0 ? filesModified : undefined,
    file_renamed: fileRenamed,
    errors: errors.length > 0 ? errors : undefined,
    dry_run: dryRun,
  };
}
