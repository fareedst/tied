/**
 * [IMPL-TIED_GIT_HYGIENE] [ARCH-TIED_GIT_HYGIENE_SAFETY] [REQ-TIED_GIT_HYGIENE]
 * How: preview-first porcelain classification; guarded untracked delete; optional gitignore merge.
 */

import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";

export type GitHygieneContextMode = "checklist" | "plan_close_out" | "agent_preview";

export type GitHygieneInput = {
  project_root: string;
  context_mode?: GitHygieneContextMode;
  apply?: boolean;
  allowed_paths?: string[];
  write_gitignore?: boolean;
};

export type GitHygienePreview = {
  context_mode: GitHygieneContextMode;
  untracked: string[];
  tracked_dirty: string[];
  suggested_gitignore_sample?: string;
};

export type GitHygieneResult = {
  ok: boolean;
  mode: "preview" | "apply";
  preview?: GitHygienePreview;
  deleted?: string[];
  skipped?: string[];
  error?: string;
  diagnostics: string[];
};

function gitPorcelain(projectRoot: string): string[] {
  try {
    const out = execFileSync("git", ["status", "--porcelain"], {
      cwd: projectRoot,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    });
    return out.split("\n").filter(Boolean);
  } catch {
    return [];
  }
}

export function classifyGitPorcelain(projectRoot: string): {
  untracked: string[];
  tracked_dirty: string[];
} {
  const untracked: string[] = [];
  const tracked_dirty: string[] = [];
  for (const line of gitPorcelain(projectRoot)) {
    const code = line.slice(0, 2);
    const file = line.slice(3).trim();
    if (!file) continue;
    if (code === "??" || code.startsWith("?")) {
      untracked.push(file);
    } else {
      tracked_dirty.push(file);
    }
  }
  return { untracked, tracked_dirty };
}

async function loadWorkingGitignoreModule(projectRoot: string) {
  const modPath = path.join(projectRoot, "tools/bootstrap/lib/working-gitignore.mjs");
  return import(pathToFileURL(modPath).href) as Promise<{
    mergeLocalWorkingGitignoreBlock: (content: string, options?: object) => string;
  }>;
}

export async function previewGitHygiene(
  input: GitHygieneInput,
): Promise<GitHygienePreview> {
  const context_mode = input.context_mode ?? "agent_preview";
  const { untracked, tracked_dirty } = classifyGitPorcelain(input.project_root);
  let suggested_gitignore_sample: string | undefined;
  try {
    const mod = await loadWorkingGitignoreModule(input.project_root);
    const gitignorePath = path.join(input.project_root, ".gitignore");
    const existing = fs.existsSync(gitignorePath)
      ? fs.readFileSync(gitignorePath, "utf8")
      : "";
    suggested_gitignore_sample = mod.mergeLocalWorkingGitignoreBlock(existing, {
      profile: "store",
    });
  } catch {
    suggested_gitignore_sample = undefined;
  }
  return {
    context_mode,
    untracked,
    tracked_dirty,
    suggested_gitignore_sample,
  };
}

function normalizePaths(paths: string[]): string[] {
  return [...paths].map((p) => p.trim()).filter(Boolean).sort();
}

export async function runGitHygiene(input: GitHygieneInput): Promise<GitHygieneResult> {
  const diagnostics: string[] = [];
  const preview = await previewGitHygiene(input);

  if (!input.apply) {
    return {
      ok: true,
      mode: "preview",
      preview,
      diagnostics,
    };
  }

  if (!input.allowed_paths?.length) {
    return {
      ok: false,
      mode: "apply",
      error: "allowlist_mismatch",
      diagnostics: ["apply_requires_allowed_paths"],
      preview,
    };
  }

  const allowed = normalizePaths(input.allowed_paths);
  const untrackedSet = new Set(preview.untracked);
  const trackedSet = new Set(preview.tracked_dirty);

  for (const p of allowed) {
    if (trackedSet.has(p)) {
      return {
        ok: false,
        mode: "apply",
        error: "tracked_deletion_rejected",
        diagnostics: [`tracked_path:${p}`],
        preview,
      };
    }
    if (!untrackedSet.has(p)) {
      return {
        ok: false,
        mode: "apply",
        error: "allowlist_mismatch",
        diagnostics: [`not_untracked:${p}`],
        preview,
      };
    }
  }

  const untrackedSorted = normalizePaths(preview.untracked);
  if (allowed.join("\0") !== untrackedSorted.join("\0")) {
    return {
      ok: false,
      mode: "apply",
      error: "allowlist_mismatch",
      diagnostics: ["allowed_paths_must_match_untracked_exactly"],
      preview,
    };
  }

  const deleted: string[] = [];
  const skipped: string[] = [];
  for (const rel of allowed) {
    const abs = path.join(input.project_root, rel);
    if (!fs.existsSync(abs)) {
      skipped.push(rel);
      continue;
    }
    fs.rmSync(abs, { recursive: true, force: true });
    deleted.push(rel);
  }

  if (input.write_gitignore && preview.suggested_gitignore_sample) {
    const gitignorePath = path.join(input.project_root, ".gitignore");
    fs.writeFileSync(gitignorePath, preview.suggested_gitignore_sample, "utf8");
    diagnostics.push("gitignore_updated");
  }

  return {
    ok: true,
    mode: "apply",
    preview,
    deleted,
    skipped,
    diagnostics,
  };
}
