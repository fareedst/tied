#!/usr/bin/env node
/**
 * [REQ-TIED_HARNESS_LANGSMITH_COMPOSE] [IMPL-TIED_HARNESS_LANGSMITH_COMPOSE]
 * Optional client-side LangSmith run export — not TIED core; operator supplies API key.
 */
import fs from "node:fs/promises";
import path from "node:path";

const DEFAULT_API_HOST = "https://api.smith.langchain.com";

export function missingApiKeyMessage() {
  return "DIAGNOSTIC: LANGSMITH_EXPORT missing LANGSMITH_API_KEY (set env or use --api-key-env)";
}

/**
 * @param {string[]} argv
 */
export function parseExportCli(argv) {
  /** @type {{ outDir?: string; runIds: string[]; apiKey?: string; apiHost: string }} */
  const result = { runIds: [], apiHost: DEFAULT_API_HOST };
  let apiKeyEnv = "LANGSMITH_API_KEY";
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--out") {
      result.outDir = argv[++i];
    } else if (arg === "--run-id") {
      result.runIds.push(argv[++i]);
    } else if (arg === "--api-key-env") {
      apiKeyEnv = argv[++i];
    } else if (arg === "--api-host") {
      result.apiHost = argv[++i];
    } else if (arg === "--help" || arg === "-h") {
      result.help = true;
    }
  }
  if (!result.help && process.env[apiKeyEnv]) {
    result.apiKey = process.env[apiKeyEnv];
  }
  return result;
}

/**
 * @param {string} apiHost
 * @param {string} apiKey
 * @param {string} runId
 */
export async function fetchLangSmithRun(apiHost, apiKey, runId) {
  const url = `${apiHost.replace(/\/$/, "")}/api/v1/runs/${encodeURIComponent(runId)}`;
  const response = await fetch(url, {
    headers: {
      "x-api-key": apiKey,
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`DIAGNOSTIC: LANGSMITH_EXPORT HTTP ${response.status} for run ${runId}: ${body.slice(0, 200)}`);
  }
  return response.json();
}

/**
 * @param {{ outDir: string; runIds: string[]; apiKey: string; apiHost: string }} opts
 */
export async function exportRunsToDirectory(opts) {
  await fs.mkdir(opts.outDir, { recursive: true });
  const manifest = {
    schema_version: "langsmith-export-manifest.v1",
    exported_at: new Date().toISOString(),
    run_ids: opts.runIds,
    files: [],
  };
  for (const runId of opts.runIds) {
    const run = await fetchLangSmithRun(opts.apiHost, opts.apiKey, runId);
    const fileName = `run-${runId}.json`;
    const filePath = path.join(opts.outDir, fileName);
    await fs.writeFile(filePath, `${JSON.stringify(run, null, 2)}\n`, "utf8");
    manifest.files.push({ run_id: runId, path: fileName });
  }
  await fs.writeFile(
    path.join(opts.outDir, "manifest.v1.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8"
  );
  return manifest;
}

function printHelp() {
  console.log(`Usage: export-langsmith-traces.mjs --out <dir> --run-id <uuid> [--run-id <uuid> ...]
  --api-key-env LANGSMITH_API_KEY   Env var name (default LANGSMITH_API_KEY)
  --api-host URL                    Default ${DEFAULT_API_HOST}

Writes run JSON and manifest.v1.json under --out for HTOL compose (@harness-trace-review / @harness-trace-analyzer).
Not TIED core; requires operator network egress and LangSmith credentials.`);
}

async function main() {
  const parsed = parseExportCli(process.argv.slice(2));
  if (parsed.help) {
    printHelp();
    process.exit(0);
  }
  if (!parsed.outDir || parsed.runIds.length === 0) {
    console.error("DIAGNOSTIC: LANGSMITH_EXPORT requires --out and at least one --run-id");
    printHelp();
    process.exit(2);
  }
  if (!parsed.apiKey) {
    console.error(missingApiKeyMessage());
    process.exit(2);
  }
  const manifest = await exportRunsToDirectory({
    outDir: parsed.outDir,
    runIds: parsed.runIds,
    apiKey: parsed.apiKey,
    apiHost: parsed.apiHost,
  });
  console.log(`TRACE: exported ${manifest.files.length} run(s) to ${parsed.outDir}`);
}

const isMain = import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith("export-langsmith-traces.mjs");
if (isMain) {
  main().catch((err) => {
    console.error(String(err));
    process.exit(1);
  });
}
