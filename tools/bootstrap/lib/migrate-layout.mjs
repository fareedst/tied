/**
 * [IMPL-TIED_TWO_FOLDER_LAYOUT] [ARCH-TIED_TWO_FOLDER_LAYOUT] [REQ-TIED_TWO_FOLDER_LAYOUT]
 * How: MIGRATE_LAYOUT — idempotent brownfield hard cut to tied-project + tied-bundle.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import {
  BUNDLE_DIR_NAME,
  LEGACY_PROJECT_DIR_NAME,
  PROJECT_DIR_NAME,
  detectLegacyLayout,
} from "./layout.mjs";
import {
  classifyWorkingRelativePath,
  isUndividedWorkingLayout,
} from "./working-root.mjs";
import { loadProjectConfig, writeProjectConfig } from "./project-config.mjs";
import { writeGitignoreBlock } from "./layers/gitignore-block.mjs";
import { installTiedLayers } from "./install-layers-core.mjs";

/**
 * @param {string} cwd
 */
function isGitCheckout(cwd) {
  const r = spawnSync("git", ["rev-parse", "--show-toplevel"], {
    cwd,
    encoding: "utf8",
    stdio: "pipe",
  });
  return r.status === 0;
}

/**
 * @param {string} projectRoot
 * @param {string} fromRel
 * @param {string} toRel
 * @param {{ dryRun?: boolean, useGit?: boolean }} opts
 */
function movePath(projectRoot, fromRel, toRel, opts = {}) {
  const from = path.join(projectRoot, fromRel);
  const to = path.join(projectRoot, toRel);
  if (!fs.existsSync(from)) {
    return { moved: false };
  }
  if (fs.existsSync(to)) {
    return { moved: false, reason: "target_exists" };
  }
  if (opts.dryRun) {
    return { moved: false, planned: `mv ${fromRel} ${toRel}` };
  }
  fs.mkdirSync(path.dirname(to), { recursive: true });
  if (opts.useGit && isGitCheckout(projectRoot)) {
    const r = spawnSync("git", ["mv", fromRel, toRel], {
      cwd: projectRoot,
      stdio: "pipe",
      encoding: "utf8",
    });
    if (r.status === 0) {
      return { moved: true, via: "git" };
    }
  }
  fs.renameSync(from, to);
  return { moved: true, via: "fs" };
}

/**
 * @param {string} projectRoot
 * @param {string} rel
 * @param {{ dryRun?: boolean, useGit?: boolean }} opts
 */
function removePath(projectRoot, rel, opts = {}) {
  const abs = path.join(projectRoot, rel);
  if (!fs.existsSync(abs)) {
    return;
  }
  if (opts.dryRun) {
    return;
  }
  if (opts.useGit && isGitCheckout(projectRoot)) {
    spawnSync("git", ["rm", "-rf", rel], { cwd: projectRoot, stdio: "pipe" });
    if (!fs.existsSync(abs)) {
      return;
    }
  }
  fs.rmSync(abs, { recursive: true, force: true });
}

/**
 * Split per-REQ artifacts from tied-project/working into local bundle root.
 * @param {string} projectRoot
 * @param {{ dryRun?: boolean }} opts
 */
function splitLocalWorkingEvidence(projectRoot, opts = {}) {
  const committedRoot = path.join(projectRoot, PROJECT_DIR_NAME, "working");
  if (!fs.existsSync(committedRoot)) {
    return;
  }
  const localRoot = path.join(projectRoot, BUNDLE_DIR_NAME, "working");
  for (const req of fs.readdirSync(committedRoot)) {
    if (!req.startsWith("REQ-")) continue;
    const reqDir = path.join(committedRoot, req);
    if (!fs.statSync(reqDir).isDirectory()) continue;
    for (const entry of fs.readdirSync(reqDir)) {
      const kind = classifyWorkingRelativePath(`${entry}/`);
      if (kind !== "local") continue;
      const fromRel = path.join(PROJECT_DIR_NAME, "working", req, entry);
      const toRel = path.join(BUNDLE_DIR_NAME, "working", req, entry);
      movePath(projectRoot, fromRel, toRel, opts);
    }
  }
  if (!opts.dryRun && fs.existsSync(localRoot)) {
    fs.mkdirSync(localRoot, { recursive: true });
  }
}

/**
 * TIED source repo: git mv methodology corpus into committed tied-bundle/ (plan §7).
 * @param {string} projectRoot
 * @param {{ dryRun?: boolean, useGit?: boolean }} opts
 * @returns {string[]}
 */
function migrateStoreCorpus(projectRoot, opts = {}) {
  /** @type {string[]} */
  const steps = [];
  const docsFrom = path.join(LEGACY_PROJECT_DIR_NAME, "docs");
  const docsTo = path.join(BUNDLE_DIR_NAME, "docs");
  if (fs.existsSync(path.join(projectRoot, docsFrom))) {
    const r = movePath(projectRoot, docsFrom, docsTo, opts);
    if (r.planned) steps.push(r.planned);
    else if (r.moved) steps.push("git mv tied/docs → tied-bundle/docs");
  }
  for (const f of [
    "requirements.yaml",
    "architecture-decisions.yaml",
    "implementation-decisions.yaml",
    "semantic-tokens.yaml",
  ]) {
    const from = path.join("templates", f);
    const to = path.join(BUNDLE_DIR_NAME, f);
    if (fs.existsSync(path.join(projectRoot, from))) {
      const r = movePath(projectRoot, from, to, opts);
      if (r.moved || r.planned) steps.push(`${from} → ${to}`);
    }
  }
  for (const sub of ["requirements", "architecture-decisions", "implementation-decisions"]) {
    const from = path.join("templates", sub);
    const to = path.join(BUNDLE_DIR_NAME, sub);
    if (fs.existsSync(path.join(projectRoot, from))) {
      const r = movePath(projectRoot, from, to, opts);
      if (r.moved || r.planned) steps.push(`${from} → ${to}`);
    }
  }
  fs.mkdirSync(path.join(projectRoot, BUNDLE_DIR_NAME, "templates"), { recursive: true });
  for (const f of [
    "impl-essence-pseudocode-template.md",
    "agent-req-checklist-feat-spawned-phase5.v1.yaml",
    "processes.md",
  ]) {
    const from = path.join("templates", f);
    const to = path.join(BUNDLE_DIR_NAME, "templates", f);
    if (fs.existsSync(path.join(projectRoot, from))) {
      movePath(projectRoot, from, to, opts);
    }
  }
  const tplTied = path.join("templates", "tied");
  if (fs.existsSync(path.join(projectRoot, tplTied))) {
    movePath(projectRoot, tplTied, path.join(BUNDLE_DIR_NAME, "templates", "tied"), opts);
  }
  const claudeTpl = path.join("tools", "bootstrap", "templates", "CLAUDE.md.template");
  if (fs.existsSync(path.join(projectRoot, claudeTpl))) {
    movePath(
      projectRoot,
      claudeTpl,
      path.join(BUNDLE_DIR_NAME, "templates", "CLAUDE.md.template"),
      opts,
    );
  }
  if (fs.existsSync(path.join(projectRoot, "templates"))) {
    removePath(projectRoot, "templates", opts);
  }
  return steps;
}

/**
 * @param {string} projectRoot
 * @param {{ dryRun?: boolean, useGit?: boolean }} opts
 */
function migrateProjectConfig(projectRoot, opts = {}) {
  const legacyPath = path.join(projectRoot, ".tied-yaml.yaml");
  const configPath = path.join(projectRoot, PROJECT_DIR_NAME, "config.yaml");
  if (fs.existsSync(configPath)) {
    return;
  }
  if (!fs.existsSync(legacyPath)) {
    return;
  }
  if (opts.dryRun) {
    return;
  }
  const loaded = loadProjectConfig(projectRoot);
  if (loaded?.record) {
    writeProjectConfig(projectRoot, loaded.record);
    removePath(projectRoot, ".tied-yaml.yaml", opts);
  }
}

/**
 * @param {string} projectRoot
 * @param {{
 *   store?: boolean,
 *   dryRun?: boolean,
 *   storeRoot?: string,
 *   skipInstall?: boolean,
 *   skipGitignore?: boolean,
 * }} options
 */
export function migrateLayout(projectRoot, options = {}) {
  const root = path.resolve(projectRoot);
  const store = options.store === true;
  const dryRun = options.dryRun === true;
  const storeRoot = options.storeRoot ?? root;
  const useGit = !dryRun && isGitCheckout(root);

  const legacy = detectLegacyLayout(root);
  const modernProjectDir = path.join(root, PROJECT_DIR_NAME);
  const storeCorpusReady = fs.existsSync(
    path.join(root, BUNDLE_DIR_NAME, "requirements.yaml"),
  );
  if (!legacy.detected && fs.existsSync(modernProjectDir)) {
    if (!store || storeCorpusReady) {
      return { ok: true, action: "noop", reason: "already_migrated" };
    }
  }

  if (store && dryRun) {
    /** @type {string[]} */
    const planned_commands = [
      `# Store layout migration (REQ-TIED_TWO_FOLDER_LAYOUT p6) — review before running`,
      `git mv ${LEGACY_PROJECT_DIR_NAME}/docs ${BUNDLE_DIR_NAME}/docs`,
      `git mv templates/*.yaml templates/{requirements,architecture-decisions,implementation-decisions} ${BUNDLE_DIR_NAME}/`,
      `git mv templates/{impl-essence-pseudocode-template.md,agent-req-checklist-feat-spawned-phase5.v1.yaml,processes.md,tied} ${BUNDLE_DIR_NAME}/templates/`,
      `git mv ${LEGACY_PROJECT_DIR_NAME} ${PROJECT_DIR_NAME}  # if not already renamed`,
      `git mv working ${PROJECT_DIR_NAME}/working  # split local evidence → ${BUNDLE_DIR_NAME}/working`,
      `git rm -r ${PROJECT_DIR_NAME}/methodology .tied-yaml.yaml templates || true`,
      `# rewrite live surfaces; MCP TIED_BASE_PATH → tied-project (store mode)`,
    ];
    return { ok: true, action: "dry_run_store", planned_commands };
  }

  if (dryRun && !store) {
    return {
      ok: true,
      action: "dry_run",
      legacy_paths: legacy.detected ? legacy.paths : [],
    };
  }

  /** @type {string[]} */
  const steps = [];

  if (fs.existsSync(path.join(root, LEGACY_PROJECT_DIR_NAME))) {
    const r = movePath(root, LEGACY_PROJECT_DIR_NAME, PROJECT_DIR_NAME, { dryRun, useGit });
    if (r.planned) steps.push(r.planned);
    else if (r.moved) steps.push(`renamed ${LEGACY_PROJECT_DIR_NAME} → ${PROJECT_DIR_NAME}`);
  }

  if (fs.existsSync(path.join(root, "working")) && isUndividedWorkingLayout(root)) {
    const r = movePath(root, "working", path.join(PROJECT_DIR_NAME, "working"), {
      dryRun,
      useGit,
    });
    if (r.planned) steps.push(r.planned);
    else if (r.moved) steps.push("moved root working/ → tied-project/working/");
  }

  splitLocalWorkingEvidence(root, { dryRun, useGit });

  for (const rel of ["methodology", "docs"]) {
    const from = path.join(PROJECT_DIR_NAME, rel);
    if (fs.existsSync(path.join(root, from))) {
      removePath(root, from, { dryRun, useGit });
      steps.push(`removed legacy ${from} (bundle install replaces)`);
    }
  }

  removePath(root, path.join(PROJECT_DIR_NAME, ".tied-install.json"), { dryRun, useGit });
  removePath(root, path.join(PROJECT_DIR_NAME, ".linked-methodology-view"), { dryRun, useGit });
  removePath(root, "templates", { dryRun, useGit });
  removePath(root, ".tied", { dryRun, useGit });

  migrateProjectConfig(root, { dryRun, useGit });

  if (!options.skipGitignore && !dryRun) {
    writeGitignoreBlock(root);
    steps.push("gitignore managed block");
  }

  fs.mkdirSync(path.join(root, BUNDLE_DIR_NAME), { recursive: true });

  if (!options.skipInstall && !dryRun) {
    installTiedLayers(root, {
      store: storeRoot,
      mode: "linked",
      layers: ["db", "mcp", "skills", "methodology"],
      harness: "both",
      skipVerify: true,
      allowSelfInstall: true,
    });
    steps.push("tied-install linked refresh");
  }

  const after = detectLegacyLayout(root);
  if (after.detected) {
    return {
      ok: false,
      action: "partial",
      code: after.code,
      hint: after.hint,
      paths: after.paths,
      steps,
    };
  }

  return { ok: true, action: steps.length ? "migrated" : "noop", steps };
}
