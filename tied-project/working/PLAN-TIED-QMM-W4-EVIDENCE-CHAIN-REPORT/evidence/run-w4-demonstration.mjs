/**
 * W4 demonstration matrix: deterministic v1/v2 cohort readouts from working fixtures.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import crypto from "node:crypto";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../../..");
const fixtureRoot = path.join(root, "tied-project/working/evidence-chain");
const outDir = path.join(here, "demonstrations");
fs.mkdirSync(outDir, { recursive: true });

const mcpRoot = path.join(root, "mcp-server");
const tsxImport = path.join(mcpRoot, "node_modules/tsx/dist/esm/index.mjs");
const cliEntry = path.join(mcpRoot, "src/cli/evidence-chain-report.ts");

function sha256File(filePath) {
  const h = crypto.createHash("sha256");
  h.update(fs.readFileSync(filePath));
  return h.digest("hex");
}

function runReport(label, manifestRel, reportVersion) {
  const manifest = path.join(fixtureRoot, manifestRel);
  const yamlOut = path.join(outDir, `${label}.yaml`);
  const mdOut = path.join(outDir, `${label}.md`);
  const args = [
    "--import",
    tsxImport,
    cliEntry,
    "--inputs",
    manifest,
    "--yaml-out",
    yamlOut,
    "--markdown-out",
    mdOut,
  ];
  if (reportVersion) {
    args.push("--report-version", reportVersion);
  }
  const result = spawnSync("node", args, { cwd: mcpRoot, encoding: "utf8" });
  const yamlText = fs.existsSync(yamlOut) ? fs.readFileSync(yamlOut, "utf8") : "";
  const hasAbsolute =
    /\/Users\//.test(yamlText) ||
    (yamlText.includes("profile_path:") && yamlText.includes("/"));
  return {
    label,
    exit_code: result.status ?? 1,
    yaml_sha256: fs.existsSync(yamlOut) ? sha256File(yamlOut) : null,
    markdown_sha256: fs.existsSync(mdOut) ? sha256File(mdOut) : null,
    operator_local_no_absolute_paths: !hasAbsolute,
    stderr: (result.stderr || "").trim().slice(0, 500),
  };
}

const runs = [
  runReport("w4-v1-mixed-cohorts", "example-report-inputs.yaml", "v1"),
  runReport("w4-v2-denominator-subcohorts", "report-inputs-v2-golden.yaml", "v2"),
];

const summaryPath = path.join(outDir, "demonstration-summary.json");
fs.writeFileSync(summaryPath, JSON.stringify({ generated_at: new Date().toISOString(), runs }, null, 2));

const failed = runs.filter((r) => r.exit_code !== 0 || !r.operator_local_no_absolute_paths);
console.log(JSON.stringify({ runs, summaryPath, failed: failed.length }, null, 2));
process.exit(failed.length ? 1 : 0);
