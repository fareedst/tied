/**
 * [IMPL-TIED_METHODOLOGY_CLIENT_BOUNDARY] [ARCH-TIED_METHODOLOGY_CLIENT_BOUNDARY] [REQ-TIED_METHODOLOGY_CLIENT_BOUNDARY]
 * How: Phase A mechanical enforcement — opt-in Unix read-only tree and client git hook template.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sayOk, sayWarn } from "./console.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const HOOK_TEMPLATE_NAME = "pre-commit-methodology-guard.sh";
const CLIENT_HOOKS_DIR = ".githooks";
const INSTALLED_HOOK_NAME = "pre-commit";

/** @param {string} stagedPath */
export function isStagedMethodologyPath(stagedPath) {
  const normalized = stagedPath.replace(/\\/g, "/").replace(/^\.\//, "");
  return normalized === "tied/methodology"
    || normalized.startsWith("tied/methodology/");
}

/**
 * @param {readonly string[]} stagedPaths
 * @returns {string[]} blocked paths
 */
export function findStagedMethodologyPaths(stagedPaths) {
  const blocked = [];
  for (const raw of stagedPaths) {
    if (typeof raw !== "string" || !raw.trim()) continue;
    if (isStagedMethodologyPath(raw.trim())) blocked.push(raw.trim());
  }
  return blocked;
}

/**
 * @param {string} platform
 * @returns {"Unix"|"Windows"|"other"}
 */
export function classifyPlatform(platform = process.platform) {
  if (platform === "win32") return "Windows";
  if (platform === "darwin" || platform === "linux" || platform === "freebsd" || platform === "openbsd") {
    return "Unix";
  }
  return "other";
}

/**
 * @param {string} methodologyDir absolute tied/methodology path
 */
function chmodTreeReadOnly(methodologyDir) {
  if (!fs.existsSync(methodologyDir)) return;
  const stat = fs.statSync(methodologyDir);
  if (stat.isDirectory()) {
    fs.chmodSync(methodologyDir, 0o555);
    for (const name of fs.readdirSync(methodologyDir)) {
      chmodTreeReadOnly(path.join(methodologyDir, name));
    }
    return;
  }
  fs.chmodSync(methodologyDir, 0o444);
}

/**
 * @param {string} clientProjectRoot
 * @param {{ methodologyReadonly?: boolean, platform?: string }} options
 */
export function applyMethodologyReadonlyBootstrapFlag(clientProjectRoot, options = {}) {
  const flag = options.methodologyReadonly === true;
  const platformKind = classifyPlatform(options.platform);
  if (!flag) {
    return { applied: false, platform: platformKind };
  }
  if (platformKind !== "Unix") {
    sayWarn(
      "methodology-readonly skipped: Unix-only chmod; use git hook and CI guard (see client-development-index.md § methodology-boundary-ci-guard)."
    );
    return { applied: false, platform: platformKind };
  }
  const methodologyDir = path.join(clientProjectRoot, "tied", "methodology");
  if (!fs.existsSync(methodologyDir)) {
    throw new Error("MISSING_METHODOLOGY_TREE");
  }
  chmodTreeReadOnly(methodologyDir);
  sayOk(`Applied read-only permissions under ${methodologyDir} (--methodology-readonly).`);
  return { applied: true, platform: platformKind };
}

function hookTemplateSourcePath() {
  return path.join(__dirname, "..", "templates", HOOK_TEMPLATE_NAME);
}

/**
 * @param {string} clientProjectRoot
 * @param {{ installHook?: boolean }} options
 */
export function installClientHookTemplate(clientProjectRoot, options = {}) {
  if (options.installHook !== true) {
    return { installed: false, hook_path: null };
  }
  const src = hookTemplateSourcePath();
  if (!fs.existsSync(src)) {
    throw new Error("HookInstallFailed:missing_template");
  }
  const hooksDir = path.join(clientProjectRoot, CLIENT_HOOKS_DIR);
  fs.mkdirSync(hooksDir, { recursive: true });
  const dest = path.join(hooksDir, INSTALLED_HOOK_NAME);
  fs.copyFileSync(src, dest);
  try {
    fs.chmodSync(dest, 0o755);
  } catch {
    /* Windows or FS without chmod */
  }
  const readme = path.join(hooksDir, "README-methodology-boundary.txt");
  fs.writeFileSync(
    readme,
    [
      "TIED methodology boundary hook (Phase A)",
      "",
      "Enable: git config core.hooksPath .githooks",
      "Re-run copy_files.sh with --install-methodology-hook to refresh the template.",
      "Policy: [PROC-TIED_METHODOLOGY_READONLY]; MCP loaders remain authoritative for writes.",
      "",
    ].join("\n"),
    "utf8",
  );
  sayOk(`Installed ${dest}; enable with: git config core.hooksPath ${CLIENT_HOOKS_DIR}`);
  return { installed: true, hook_path: dest };
}

/**
 * @param {string} clientProjectRoot
 * @param {{ methodologyReadonly?: boolean, installMethodologyHook?: boolean, platform?: string }} options
 */
export function applyMethodologyClientBoundary(clientProjectRoot, options = {}) {
  const readonly = applyMethodologyReadonlyBootstrapFlag(clientProjectRoot, {
    methodologyReadonly: options.methodologyReadonly,
    platform: options.platform,
  });
  const hook = installClientHookTemplate(clientProjectRoot, {
    installHook: options.installMethodologyHook,
  });
  return { readonly, hook };
}
