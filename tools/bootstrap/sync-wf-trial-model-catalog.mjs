#!/usr/bin/env node
/**
 * [REQ-WF_TRIAL_MODEL_CATALOG_RESOLVE] Regenerate docs/demos/wf-trial-model-catalog.yaml
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";
import {
  buildCatalogDocument,
  defaultWfTrialModelCatalogPath,
  deriveCursorModelConfig,
  parseAgentModelsStdout,
  parseClaudeModelsJson,
} from "./lib/wf-trial-model-catalog.mjs";
import {
  defaultWfTrialModelSpecRegistryPath,
  loadWfTrialModelSpecRegistry,
} from "./lib/wf-trial-model-spec.mjs";

const REPO_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..");
const DEFAULT_ALIASES = {
  claude: {
    "haiku-5-5": "claude-haiku-5-5",
    haiku55: "claude-haiku-5-5",
    "sonnet-5-5": "claude-sonnet-5-5",
    sonnet55: "claude-sonnet-5-5",
    "sonnet-4-6": "claude-sonnet-4-6",
    sonnet46: "claude-sonnet-4-6",
    "opus-5-5": "claude-opus-5-5",
    "fable-5-2": "claude-fable-5-2",
    "fable-5-1": "claude-fable-5-1",
    "fable-5": "claude-fable-5",
  },
};

function usage() {
  process.stderr.write(`usage: sync-wf-trial-model-catalog.mjs [--write|--check] [--claude-json path] [--agent-models-cmd cmd]\n`);
}

function parseArgs(argv) {
  let mode = "write";
  let claudeJson = path.join(REPO_ROOT, "tools/bootstrap/testdata/wf-trial-claude-models.v1.json");
  let agentModelsCmd = "agent models";
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--check") {
      mode = "check";
    } else if (a === "--write") {
      mode = "write";
    } else if (a === "--claude-json") {
      claudeJson = argv[++i];
    } else if (a === "--agent-models-cmd") {
      agentModelsCmd = argv[++i];
    } else if (a === "--help" || a === "-h") {
      usage();
      process.exit(0);
    }
  }
  return { mode, claudeJson, agentModelsCmd };
}

function loadMatrixSpecs() {
  const regPath = defaultWfTrialModelSpecRegistryPath(REPO_ROOT);
  return loadWfTrialModelSpecRegistry(regPath);
}

function buildDesiredCatalog({ claudeJson, agentModelsCmd }) {
  const matrix = loadMatrixSpecs();
  const agent = spawnSync("bash", ["-c", agentModelsCmd], {
    cwd: REPO_ROOT,
    encoding: "utf8",
  });
  if (agent.status !== 0) {
    throw new Error(`agent models failed: ${agent.stderr || agent.stdout}`);
  }
  const slugs = parseAgentModelsStdout(agent.stdout);
  const cursor = slugs.map((slug) => ({
    slug,
    model_config: deriveCursorModelConfig(slug, matrix),
  }));
  const raw = fs.readFileSync(claudeJson, "utf8");
  const claudeIds = parseClaudeModelsJson(JSON.parse(raw));
  return buildCatalogDocument(cursor, claudeIds, DEFAULT_ALIASES);
}

function stableYaml(doc) {
  return `${yaml.dump(doc, { lineWidth: 120, sortKeys: false, noRefs: true })}`;
}

function main() {
  const { mode, claudeJson, agentModelsCmd } = parseArgs(process.argv.slice(2));
  const outPath = defaultWfTrialModelCatalogPath(REPO_ROOT);
  const desired = buildDesiredCatalog({ claudeJson, agentModelsCmd });
  const desiredText = stableYaml(desired);
  if (mode === "check") {
    if (!fs.existsSync(outPath)) {
      process.stderr.write(`ERROR: missing catalog ${outPath}\n`);
      process.exit(1);
    }
    const current = fs.readFileSync(outPath, "utf8");
    const currentDoc = yaml.load(current);
    const desiredDoc = yaml.load(desiredText);
    const same =
      JSON.stringify({ ...currentDoc, generated_at: null }) ===
      JSON.stringify({ ...desiredDoc, generated_at: null });
    if (!same) {
      process.stderr.write("ERROR: wf-trial-model-catalog.yaml is out of date (run sync without --check)\n");
      process.exit(1);
    }
    process.stdout.write("ok-catalog-check\n");
    process.exit(0);
  }
  fs.writeFileSync(outPath, desiredText, "utf8");
  process.stdout.write(`wrote ${outPath} (${desired.cursor.length} cursor, ${desired.claude.length} claude)\n`);
}

try {
  main();
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e);
  process.stderr.write(`ERROR: ${msg}\n`);
  process.exit(1);
}
