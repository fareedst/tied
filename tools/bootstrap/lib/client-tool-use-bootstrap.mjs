/**
 * [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
 * PARSE_BOOTSTRAP_TOOL_FLAGS + APPLY_CLIENT_TOOL_USE_PROFILE
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { copyFileWithAttributes } from "./copy-managed.mjs";
import { loadManifest } from "./constants.mjs";
import { sayOk } from "./console.mjs";

const TOOL_ENV_MAP = {
  fullTools: "TIED_BOOTSTRAP_FULL_TOOLS",
  jev: "TIED_BOOTSTRAP_WITH_JEV",
  dae: "TIED_BOOTSTRAP_WITH_DAE",
  bbce: "TIED_BOOTSTRAP_WITH_BBCE",
  forceToolConfig: "TIED_BOOTSTRAP_FORCE_TOOL_CONFIG",
};

function envTruthy(env, key) {
  const raw = env?.[key];
  if (raw == null || String(raw).trim() === "") return false;
  const v = String(raw).trim().toLowerCase();
  return v === "1" || v === "true" || v === "yes";
}

function emptyProfile() {
  return {
    jev: false,
    dae: false,
    bbce: false,
    fullTools: false,
    forceToolConfig: false,
  };
}

/**
 * @param {string[]} argv
 * @param {NodeJS.ProcessEnv} [env]
 * @returns {{ profile: ReturnType<typeof emptyProfile>, argv: string[] }}
 */
function profileFromEnv(env) {
  const profile = emptyProfile();
  profile.jev = envTruthy(env, TOOL_ENV_MAP.jev);
  profile.dae = envTruthy(env, TOOL_ENV_MAP.dae);
  profile.bbce = envTruthy(env, TOOL_ENV_MAP.bbce);
  profile.fullTools = envTruthy(env, TOOL_ENV_MAP.fullTools);
  profile.forceToolConfig = envTruthy(env, TOOL_ENV_MAP.forceToolConfig);
  if (profile.fullTools) {
    profile.jev = true;
    profile.dae = true;
    profile.bbce = true;
  }
  return profile;
}

export function parseBootstrapToolFlags(argv, env = process.env) {
  const profile = emptyProfile();
  let cliActive = false;

  const args = [...argv];
  const remaining = [];
  while (args.length > 0) {
    const flag = args[0];
    if (flag === "--full-tools") {
      cliActive = true;
      profile.fullTools = true;
      args.shift();
      continue;
    }
    if (flag === "--with-jev") {
      cliActive = true;
      profile.jev = true;
      args.shift();
      continue;
    }
    if (flag === "--with-dae") {
      cliActive = true;
      profile.dae = true;
      args.shift();
      continue;
    }
    if (flag === "--with-bbce") {
      cliActive = true;
      profile.bbce = true;
      args.shift();
      continue;
    }
    if (flag === "--force-tool-config") {
      cliActive = true;
      profile.forceToolConfig = true;
      args.shift();
      continue;
    }
    if (flag === "--tools") {
      cliActive = true;
      args.shift();
      const list = (args.shift() ?? "")
        .split(",")
        .map((s) => s.trim().toLowerCase())
        .filter(Boolean);
      for (const name of list) {
        if (name === "jev") profile.jev = true;
        else if (name === "dae") profile.dae = true;
        else if (name === "bbce") profile.bbce = true;
      }
      continue;
    }
    if (flag.startsWith("-")) {
      remaining.push(flag);
      args.shift();
      continue;
    }
    remaining.push(flag);
    args.shift();
  }

  let resolved = cliActive ? profile : profileFromEnv(env);
  if (cliActive && !profile.forceToolConfig) {
    resolved.forceToolConfig = profileFromEnv(env).forceToolConfig;
  }
  if (cliActive && profile.forceToolConfig) {
    resolved.forceToolConfig = true;
  }
  if (resolved.fullTools) {
    resolved.jev = true;
    resolved.dae = true;
    resolved.bbce = true;
  }

  return { profile: resolved, argv: remaining };
}

export function profileHasToolUse(profile) {
  return profile.jev || profile.dae || profile.bbce || profile.forceToolConfig;
}

/**
 * @param {ReturnType<typeof emptyProfile>} profile
 * @returns {string[]}
 */
export function bootstrapToolFlagsToArgv(profile) {
  const out = [];
  if (profile.fullTools) {
    out.push("--full-tools");
    return out;
  }
  if (profile.jev) out.push("--with-jev");
  if (profile.dae) out.push("--with-dae");
  if (profile.bbce) out.push("--with-bbce");
  if (profile.forceToolConfig) out.push("--force-tool-config");
  return out;
}

function mergeToolKeysIntoYamlDoc(doc, profile) {
  const next = doc && typeof doc === "object" && !Array.isArray(doc) ? { ...doc } : {};
  if (profile.jev) {
    next.jev = { ...(next.jev && typeof next.jev === "object" ? next.jev : {}), plan_skills: true };
  }
  if (profile.dae) {
    next.dae = { ...(next.dae && typeof next.dae === "object" ? next.dae : {}), crap_threshold: 30 };
    delete next.dae.branch_check;
    delete next.dae.agentstream_gate_check;
  }
  if (next.scalar_style == null) {
    next.scalar_style = "unwrapped";
  }
  return next;
}

function shouldMutateTiedYaml(profile, tiedYamlPreExisting) {
  if (!profile.jev && !profile.dae) return false;
  if (!tiedYamlPreExisting) return true;
  return profile.forceToolConfig === true;
}

/**
 * @param {string} projectRoot
 * @param {ReturnType<typeof emptyProfile>} profile
 * @param {{ tiedRepoRoot: string, tiedYamlPreExisting?: boolean }} context
 */
export function applyClientToolUseBootstrapOptions(projectRoot, profile, context) {
  if (!profile || !profileHasToolUse(profile)) {
    return { yamlUpdated: false, analysisFilesCopied: 0 };
  }

  const tiedRepoRoot = context.tiedRepoRoot;
  const tiedYamlPath = path.join(projectRoot, ".tied-yaml.yaml");
  const tiedYamlPreExisting = context.tiedYamlPreExisting === true;
  let yamlUpdated = false;

  if (shouldMutateTiedYaml(profile, tiedYamlPreExisting) && fs.existsSync(tiedYamlPath)) {
    const raw = fs.readFileSync(tiedYamlPath, "utf8");
    const doc = yaml.load(raw) ?? {};
    const merged = mergeToolKeysIntoYamlDoc(doc, profile);
    fs.writeFileSync(tiedYamlPath, yaml.dump(merged, { lineWidth: -1, noRefs: true }), "utf8");
    yamlUpdated = true;
    sayOk(`Applied tool-use profile to ${tiedYamlPath}.`);
  }

  let analysisFilesCopied = 0;
  if (profile.bbce) {
    const manifest = loadManifest();
    const starterPaths = manifest.ANALYSIS_STARTER_FILES ?? [];
    const templatesAnalysis = path.join(tiedRepoRoot, "templates", "tied", "analysis");
    for (const rel of starterPaths) {
      const src = path.join(templatesAnalysis, rel);
      const dest = path.join(projectRoot, "tied", "analysis", rel);
      if (!fs.existsSync(src)) {
        throw new Error(`MISSING_ANALYSIS_STARTER: ${src}`);
      }
      if (fs.existsSync(dest)) {
        continue;
      }
      fs.mkdirSync(path.dirname(dest), { recursive: true });
      copyFileWithAttributes(src, dest);
      analysisFilesCopied += 1;
    }
    if (analysisFilesCopied > 0) {
      sayOk(`Copied ${analysisFilesCopied} BBCE analysis starter file(s) into tied/analysis/.`);
    }
  }

  return { yamlUpdated, analysisFilesCopied };
}
