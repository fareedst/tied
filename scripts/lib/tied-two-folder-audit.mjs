/**
 * [IMPL-TIED_TWO_FOLDER_LAYOUT] [REQ-TIED_NEW_CLIENT_ADHERENCE] [REQ-TIED_TWO_FOLDER_LAYOUT]
 * G4 two-folder layout invariant checks (git check-ignore + config paths).
 */
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { detectLegacyLayout, resolveTiedLayout, PROJECT_DIR_NAME, BUNDLE_DIR_NAME } from "../../tools/bootstrap/lib/layout.mjs";
import { isUndividedWorkingLayout } from "../../tools/bootstrap/lib/working-root.mjs";

function isGitRepository(clientRoot) {
  return fs.existsSync(path.join(clientRoot, ".git"));
}

/**
 * @param {string} clientRoot
 * @param {string} rel
 */
function gitCheckIgnore(clientRoot, rel) {
  try {
    const out = execFileSync("git", ["check-ignore", "-v", rel], {
      cwd: clientRoot,
      encoding: "utf8",
      stdio: "pipe",
    });
    return { ignored: true, detail: out.trim() };
  } catch {
    return { ignored: false };
  }
}

/**
 * When bootstrap skips `git init`, verify managed .gitignore patterns instead of `git check-ignore`.
 * @param {string} clientRoot
 * @param {string} relPath posix relative path
 */
function gitignoreDeclaresIgnored(clientRoot, relPath) {
  const gitignorePath = path.join(clientRoot, ".gitignore");
  if (!fs.existsSync(gitignorePath)) {
    return { ignored: false, detail: "no .gitignore" };
  }
  const normalized = relPath.replace(/\\/g, "/").replace(/\/$/, "");
  const dirPattern = `${normalized}/`;
  const lines = fs.readFileSync(gitignorePath, "utf8").split("\n");
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith("#")) continue;
    if (line === dirPattern || line === normalized || line === `${normalized}/**`) {
      return { ignored: true, detail: `gitignore:${line} (no git repo)` };
    }
  }
  return { ignored: false, detail: `${relPath} not listed in .gitignore` };
}

/**
 * @param {string} clientRoot
 * @param {string} rel
 */
function pathIgnoredByPolicy(clientRoot, rel) {
  if (isGitRepository(clientRoot)) {
    return gitCheckIgnore(clientRoot, rel);
  }
  return gitignoreDeclaresIgnored(clientRoot, rel);
}

/**
 * @param {string} clientRoot
 */
export function runTwoFolderLayoutAudit(clientRoot) {
  const root = path.resolve(clientRoot);
  const layout = resolveTiedLayout(root);
  /** @type {{ id: string, ok: boolean, detail?: string }[]} */
  const checks = [];

  const legacyTopTied = path.join(root, "tied");
  checks.push({
    id: "SC-TFL-NO-LEGACY-TIED-DIR",
    ok: !fs.existsSync(legacyTopTied),
    detail: fs.existsSync(legacyTopTied) ? "top-level tied/ still present" : undefined,
  });

  const legacy = detectLegacyLayout(root);
  checks.push({
    id: "SC-TFL-LEGACY-MARKERS",
    ok: !legacy.detected,
    detail: legacy.detected ? legacy.paths.join(", ") : undefined,
  });

  checks.push({
    id: "SC-TFL-PROJECT-CONFIG",
    ok: fs.existsSync(layout.projectConfigPath),
    detail: layout.projectConfigPath,
  });

  const legacyYaml = path.join(root, ".tied-yaml.yaml");
  checks.push({
    id: "SC-TFL-NO-ROOT-TIED-YAML",
    ok: !fs.existsSync(legacyYaml),
  });

  const bundleIgnore = pathIgnoredByPolicy(root, BUNDLE_DIR_NAME);
  checks.push({
    id: "SC-TFL-BUNDLE-GITIGNORE",
    ok: bundleIgnore.ignored === true,
    detail: bundleIgnore.ignored ? bundleIgnore.detail : `${BUNDLE_DIR_NAME}/ not gitignored`,
  });

  const projectDirRel = PROJECT_DIR_NAME;
  const projectIgnore = isGitRepository(root)
    ? gitCheckIgnore(root, path.join(projectDirRel, "requirements.yaml"))
    : {
        ignored: gitignoreDeclaresIgnored(root, projectDirRel).ignored,
        detail: "gitignore-only (no git repo)",
      };
  checks.push({
    id: "SC-TFL-PROJECT-NOT-IGNORED",
    ok:
      projectIgnore.ignored === false ||
      (!isGitRepository(root) &&
        fs.existsSync(path.join(layout.tiedDir, "requirements.yaml")) &&
        !gitignoreDeclaresIgnored(root, projectDirRel).ignored),
    detail: projectIgnore.ignored ? "tied-project traceability is gitignored" : undefined,
  });

  const rootWorking = path.join(root, "working");
  const committedWorking = layout.workingCommittedRoot;
  if (!isUndividedWorkingLayout(root) && fs.existsSync(committedWorking) && fs.existsSync(rootWorking)) {
    checks.push({
      id: "SC-TFL-NO-ROOT-WORKING",
      ok: true,
      detail: "repo-root working/ present alongside tied-project/working/ (layout hygiene warning)",
    });
  }

  const installJson = layout.installConfigPath;
  if (fs.existsSync(installJson)) {
    try {
      const raw = JSON.parse(fs.readFileSync(installJson, "utf8"));
      checks.push({
        id: "SC-TFL-INSTALL-CONFIG-SCHEMA",
        ok: raw.schema === "tied-install.v2" || raw.schema === "tied-install.v1",
      });
    } catch {
      checks.push({ id: "SC-TFL-INSTALL-CONFIG-SCHEMA", ok: false, detail: "invalid JSON" });
    }
  }

  const ok = checks.every((c) => c.ok);
  return { ok, checks };
}
