#!/usr/bin/env node
/**
 * [REQ-REQUEST_EVIDENCE_ENVELOPE] [REQ-TIED_CHECKLIST_GATE_ENFORCEMENT]
 * W7-D2: batch backfill request-evidence-envelope.v1.json for tracker-only /dev/test clients.
 * Wraps request_evidence_envelope_backfill without mutating inner producer artifacts.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const BACKFILL_CLI = path.join(REPO_ROOT, "mcp-server/dist/cli/request-evidence-envelope-backfill.js");

function usage() {
  console.log(`Usage: node scripts/backfill-client-envelopes.mjs [options]

Options:
  --help                     Show this help
  --dry-run                  List targets only; do not invoke backfill
  --project-root PATH        Single client project root (repeatable)
  --request-token TOKEN      REQ token paired with --project-root
  --corpus PATH              YAML with rows containing project_root + request_token
  --dev-test-root PATH       Scan timestamp dirs under PATH for trackers (default: ~/Documents/dev/test)
  --json-out PATH            Write batch summary JSON
  --continue-on-error        Keep processing after a failed row

Each successful backfill writes working/{REQ}/evidence/request-evidence-envelope.v1.json only.
Inner producer artifacts (manifest, profile, inquiry packs) are never mutated.
`);
}

function parseArgs(argv) {
  const out = {
    dryRun: false,
    continueOnError: false,
    pairs: [],
    corpus: "",
    devTestRoot: path.join(process.env.HOME ?? "", "Documents/dev/test"),
    jsonOut: "",
    help: false,
  };
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === "--help" || arg === "-h") out.help = true;
    else if (arg === "--dry-run") out.dryRun = true;
    else if (arg === "--continue-on-error") out.continueOnError = true;
    else if (arg === "--corpus") out.corpus = argv[++i] ?? "";
    else if (arg === "--dev-test-root") out.devTestRoot = path.resolve(argv[++i] ?? "");
    else if (arg === "--json-out") out.jsonOut = argv[++i] ?? "";
    else if (arg === "--project-root") {
      out._pendingRoot = path.resolve(argv[++i] ?? "");
    } else if (arg === "--request-token") {
      const requestToken = argv[++i] ?? "";
      if (!out._pendingRoot) throw new Error("--request-token requires preceding --project-root");
      out.pairs.push({ projectRoot: out._pendingRoot, requestToken });
      out._pendingRoot = "";
    } else throw new Error(`Unknown argument: ${arg}`);
  }
  return out;
}

async function loadCorpusPairsAsync(corpusPath) {
  const text = fs.readFileSync(corpusPath, "utf8");
  const yaml = await import(path.join(REPO_ROOT, "mcp-server/node_modules/js-yaml/index.js"));
  const doc = yaml.load(text);
  const rows = doc?.projects ?? doc?.rows ?? [];
  return rows
    .filter((row) => row.project_root && row.request_token)
    .map((row) => ({
      projectRoot: path.resolve(String(row.project_root)),
      requestToken: String(row.request_token),
      clientAlias: row.client_alias ? String(row.client_alias) : path.basename(String(row.project_root)),
    }));
}

function discoverDevTestPairs(devTestRoot) {
  const pairs = [];
  if (!fs.existsSync(devTestRoot)) return pairs;
  for (const name of fs.readdirSync(devTestRoot)) {
    if (!/^178/u.test(name)) continue;
    const clientRoot = path.join(devTestRoot, name);
    const working = path.join(clientRoot, "working");
    if (!fs.existsSync(working)) continue;
    for (const reqDir of fs.readdirSync(working)) {
      const reqPath = path.join(working, reqDir);
      if (!fs.statSync(reqPath).isDirectory()) continue;
      const trackerGlob = fs.readdirSync(reqPath).filter((f) =>
        f.startsWith("agent-req-implementation-checklist") && f.endsWith(".yaml"),
      );
      if (trackerGlob.length === 0) continue;
      pairs.push({
        projectRoot: clientRoot,
        requestToken: reqDir,
        clientAlias: name,
      });
    }
  }
  return pairs;
}

function envelopeExists(projectRoot, requestToken) {
  return fs.existsSync(
    path.join(projectRoot, "working", requestToken, "evidence", "request-evidence-envelope.v1.json"),
  );
}

function runBackfill(projectRoot, requestToken) {
  if (!fs.existsSync(BACKFILL_CLI)) {
    throw new Error(`Backfill CLI missing at ${BACKFILL_CLI}; run npm run build --prefix mcp-server`);
  }
  const result = spawnSync(
    process.execPath,
    [BACKFILL_CLI, "--project-root", projectRoot, "--request-token", requestToken],
    { encoding: "utf8", cwd: REPO_ROOT },
  );
  let payload = {};
  try {
    payload = JSON.parse(result.stdout.trim().split("\n").find((line) => line.startsWith("{")) ?? "{}");
  } catch {
    payload = { ok: false, raw_stdout: result.stdout, raw_stderr: result.stderr };
  }
  return {
    ok: result.status === 0 && payload.ok !== false,
    exitCode: result.status ?? 1,
    payload,
    stderr: result.stderr,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    usage();
    return 0;
  }

  let targets = [...args.pairs.map((p) => ({ ...p, clientAlias: path.basename(p.projectRoot) }))];
  if (args.corpus) {
    targets = targets.concat(await loadCorpusPairsAsync(path.resolve(args.corpus)));
  }
  if (targets.length === 0) {
    targets = discoverDevTestPairs(args.devTestRoot);
  }

  const seen = new Set();
  targets = targets.filter((row) => {
    const key = `${row.projectRoot}:${row.requestToken}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  const summary = {
    schema_version: "backfill-client-envelopes-summary.v1",
    generated_at: new Date().toISOString(),
    dry_run: args.dryRun,
    rows: [],
  };

  let failures = 0;
  for (const row of targets) {
    const hadEnvelope = envelopeExists(row.projectRoot, row.requestToken);
    const entry = {
      client_alias: row.clientAlias,
      project_root: row.projectRoot,
      request_token: row.requestToken,
      had_envelope_before: hadEnvelope,
      action: hadEnvelope ? "skipped_existing" : args.dryRun ? "would_backfill" : "backfill",
      ok: true,
    };
    if (hadEnvelope) {
      summary.rows.push(entry);
      continue;
    }
    if (args.dryRun) {
      summary.rows.push(entry);
      continue;
    }
    const result = runBackfill(row.projectRoot, row.requestToken);
    entry.ok = result.ok;
    entry.exit_code = result.exitCode;
    entry.envelope_path = result.payload?.envelope_path ?? null;
    entry.not_applicable_receipt_path = result.payload?.not_applicable_receipt_path ?? null;
    if (!result.ok) {
      entry.error = result.payload?.error ?? result.stderr?.trim() ?? "backfill_failed";
      failures += 1;
      summary.rows.push(entry);
      if (!args.continueOnError) break;
      continue;
    }
    entry.had_envelope_after = envelopeExists(row.projectRoot, row.requestToken);
    summary.rows.push(entry);
    process.stderr.write(
      `DEBUG: [W7-D2] backfilled ${row.clientAlias}/${row.requestToken} -> ${entry.envelope_path}\n`,
    );
  }

  const text = `${JSON.stringify(summary, null, 2)}\n`;
  process.stdout.write(text);
  if (args.jsonOut) {
    fs.mkdirSync(path.dirname(path.resolve(args.jsonOut)), { recursive: true });
    fs.writeFileSync(path.resolve(args.jsonOut), text);
  }
  return failures > 0 ? 1 : 0;
}

main()
  .then((code) => {
    process.exitCode = code;
  })
  .catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  });
