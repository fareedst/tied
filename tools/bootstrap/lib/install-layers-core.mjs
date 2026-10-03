/**
 * [IMPL-TIED_LAYERED_CLIENT_INSTALL] [ARCH-TIED_LAYERED_CLIENT_INSTALL] [REQ-TIED_LAYERED_CLIENT_INSTALL]
 * How: Orchestrates capability-layer install (db, mcp, skills, methodology).
 */
import { manifestPaths } from "./constants.mjs";
import { sayErr, sayOk } from "./console.mjs";
import { applyClientToolUseBootstrapOptions, profileHasToolUse } from "./client-tool-use-bootstrap.mjs";
import { installDbLayer } from "./layers/db.mjs";
import { installMcpLayer } from "./layers/mcp.mjs";
import { installSkillsLinked, installSkillsFull } from "./layers/skills-linked.mjs";
import { installMethodologyLinked, installMethodologyFull } from "./layers/methodology.mjs";
import { writeInstallManifest, readInstallManifest } from "./layers/install-manifest.mjs";
import { checkStoreReachable, resolveStoreRoot } from "./layers/store.mjs";
import { runPostInstallVerification, runDoctor } from "./layers/verify-store.mjs";
import fs from "node:fs";
import path from "node:path";
import { guardSelfInstall } from "./layout.mjs";
import { resolveProjectConfigPath } from "./project-config.mjs";

const ALL_LAYERS = ["db", "mcp", "skills", "methodology"];

/**
 * @param {string} projectRoot
 * @param {object} options
 */
export function installTiedLayers(projectRoot, options = {}) {
  if (!fs.existsSync(projectRoot) || !fs.statSync(projectRoot).isDirectory()) {
    throw new Error("UNWRITABLE_DESTINATION");
  }

  const storeRoot = resolveStoreRoot({ store: options.store, env: options.env });
  if (options.allowSelfInstall !== true) {
    guardSelfInstall(projectRoot, storeRoot, { allow: false });
  }
  checkStoreReachable(storeRoot);

  const mode = options.mode ?? "linked";
  const harness = options.harness ?? "both";
  const methodologyBundle = options.methodologyBundle ?? "live";
  const layers = options.layers ?? ALL_LAYERS;

  if (options.doctor === true) {
    return runDoctor(projectRoot, { storeRoot, methodologyBundle });
  }

  if (options.layersOnly) {
    // used by tests
  }

  const paths = manifestPaths();
  paths.tiedRepoRoot = storeRoot;
  const projectConfigPreExisting = resolveProjectConfigPath(projectRoot) !== null;

  if (layers.includes("db")) {
    installDbLayer(projectRoot, { storeRoot });
  }
  if (layers.includes("mcp")) {
    installMcpLayer(projectRoot, {
      storeRoot,
      harness,
      mode,
      methodologyBundle,
      env: options.env,
      claudeHarnessLabel: options.claudeHarnessLabel,
    });
  }
  if (layers.includes("skills")) {
    if (mode === "linked") {
      installSkillsLinked(projectRoot, { storeRoot, harness, env: options.env });
    } else {
      installSkillsFull(projectRoot, paths, { storeRoot, harness, env: options.env });
    }
  }
  if (layers.includes("methodology")) {
    if (mode === "linked") {
      installMethodologyLinked(projectRoot, { storeRoot, methodologyBundle });
    } else {
      installMethodologyFull(projectRoot, {
        storeRoot,
        methodologyReadonly: options.methodologyReadonly === true,
        installMethodologyHook: options.installMethodologyHook === true,
        platform: options.platform,
      });
    }
  }

  const toolUseProfile = options.toolUseProfile;
  if (toolUseProfile && profileHasToolUse(toolUseProfile)) {
    applyClientToolUseBootstrapOptions(projectRoot, toolUseProfile, {
      tiedRepoRoot: storeRoot,
      projectConfigPreExisting,
    });
  }

  if (options.skipVerify !== true) {
    runPostInstallVerification(projectRoot, {
      storeRoot,
      mode,
      methodologyBundle,
      skipParityGate: options.skipParityGate,
      parityGateReportOnly: options.parityGateReportOnly,
      parityReport: options.parityReport,
    });
  }

  const manifest = writeInstallManifest(projectRoot, {
    store: storeRoot,
    layers,
    mode,
    harness,
    methodology_bundle: methodologyBundle,
    tool_profile: toolUseProfile ?? null,
    tied_version: readTiedVersionFromAgents(projectRoot, storeRoot),
  });

  sayOk(`Layered TIED install complete (${mode}, layers=${layers.join(",")}).`);
  return { projectRoot, storeRoot, manifest };
}

/**
 * @param {string} projectRoot
 * @param {string} storeRoot
 */
function readTiedVersionFromAgents(projectRoot, storeRoot) {
  for (const root of [projectRoot, storeRoot]) {
    const agents = path.join(root, "AGENTS.md");
    if (!fs.existsSync(agents)) continue;
    const text = fs.readFileSync(agents, "utf8");
    const match = text.match(/TIED Methodology Version\*\*:\s*([0-9.]+)/);
    if (match) return match[1];
  }
  return "unknown";
}

/**
 * @param {string} projectRoot
 * @param {object} options
 */
export function refreshInstallFromManifest(projectRoot, options = {}) {
  const prior = readInstallManifest(projectRoot);
  if (!prior) {
    sayErr("No tied-bundle/install.json (or legacy install manifest) — run a full install first.");
    throw new Error("INSTALL_MANIFEST_MISSING");
  }
  return installTiedLayers(projectRoot, {
    ...options,
    store: options.store ?? prior.store,
    mode: options.mode ?? prior.mode,
    harness: options.harness ?? prior.harness,
    methodologyBundle: options.methodologyBundle ?? prior.methodology_bundle,
    layers: options.layers ?? prior.layers ?? ALL_LAYERS,
    refresh: true,
  });
}
