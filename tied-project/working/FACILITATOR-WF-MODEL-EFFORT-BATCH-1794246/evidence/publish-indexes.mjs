#!/usr/bin/env node
/**
 * Append catalog + README rows; extend runs registry for model-effort batch.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  meanCompactGrades,
  parseSessionGradingTable,
} from "../../../../tools/bootstrap/lib/read-trial-readout-session-grading.mjs";

const STORE = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const DEMOS = path.join(STORE, "docs/demos");
const rows = JSON.parse(
  fs.readFileSync(
    path.join(
      STORE,
      "tied-project/working/FACILITATOR-WF-MODEL-EFFORT-BATCH-1794246/evidence/catalog-rows.json",
    ),
    "utf8",
  ),
);

function catalogModelLabel(r, ro) {
  const mc = ro.match(/\*\*Model config\*\* \| `([^`]+)`/);
  const effort = ro.match(/effort \*\*(\w+)\*\*/);
  const harness = r.dirname.includes("-claude-") ? "Claude" : "Cursor";
  let base = mc?.[1] ?? "composer-2.5";
  if (base === "composer.2.5" || base === "composer-2.5") base = "Composer 2.5";
  if (base === "luna-low") base = "GPT-5.6 Luna low";
  if (base === "haiku-5-5") base = "Claude Haiku 5.5";
  const eff = effort?.[1];
  return eff
    ? `${harness} agentstream / ${base} (effort **${eff}**)`
    : `${harness} agentstream / ${base}`;
}

function passesFromReadout(ro) {
  const m = ro.match(/facilitator \*\*`(\d+)`\*\* green tests/);
  return m ? m[1] : "?";
}

function shaFromReadout(ro) {
  const m = ro.match(/\*\*Git:\*\* \*\*`([0-9a-f]+)`\*\*/) || ro.match(/HEAD \*\*`([0-9a-f]+)`\*\*/);
  return m ? m[1] : "?";
}

function ecFromReadout(ro) {
  const m = ro.match(/\*\*Exit code\*\* \| \*\*`(\d+)`\*\*/);
  return m ? m[1] : "?";
}

const catalogLines = [];
const readmeLines = [];
const registryRows = [];

for (const r of rows) {
  const ro = fs.readFileSync(path.join(DEMOS, r.fname), "utf8");
  const { rows: gradeRows } = parseSessionGradingTable(ro);
  const compact = meanCompactGrades(
    gradeRows.map((g) => g.band).join("/"),
  ).display;
  const harness = r.dirname.includes("-claude-") ? "claude" : "cursor";
  const passes = passesFromReadout(ro);
  const sha = shaFromReadout(ro);
  const ec = ecFromReadout(ro);
  const wfNum = r.wf_num.padStart(2, "0");
  const modelLabel = catalogModelLabel(r, ro);
  const tag = `\`${r.dirname}\` (\`HARNESS=${harness}\`; **wf-trial-ts-node-test-v1**; session **4.2.1**; **REQ-WF_TRIAL_MODEL_EFFORT**)`;
  const readLabel = harness === "claude" ? "Claude readout" : "Cursor readout";
  const exitNote =
    ec === "2"
      ? "**workflow complete (exit 2 postamble)**"
      : passes === "0"
        ? "**split signal**"
        : "**workflow complete**";
  const summary = `(${exitNote} — orchestrator **\`exit_code: ${ec}\`**; **\`${sha}\`**; **${passes}/${passes}** tests)`;
  catalogLines.push(
    `| PROMPT-WF-${wfNum} | ${modelLabel} | ${tag} | [${readLabel}](${r.fname}) ${summary} |`,
  );

  const slug = ro.match(/\*\*Model slug\*\* \| `([^`]+)`/)?.[1] ?? "";
  readmeLines.push(
    `| [PROMPT-WF-${wfNum} @ ${r.dirname.split("-")[0]}](${r.fname}) | [PROMPT-WF-${wfNum}](catalog-traditional-workflow-trial-prompts.md#prompt-wf-${wfNum}) | \`${modelLabel.replace(/ agentstream.*/, "")}\` / \`${slug}\` | \`/Users/fareed/Documents/dev/test/${r.dirname}\` |`,
  );

  const slugKey =
    slug.includes("luna") && ro.includes("effort **medium**")
      ? "`gpt-5.6-luna-low-fast`"
      : slug.includes("composer")
        ? "`composer-2.5-fast`"
        : slug.includes("haiku")
          ? "`claude-haiku-5-5`"
          : `\`${slug}\``;

  registryRows.push({
    wf: wfNum,
    id: r.dirname.split("-")[0],
    harness,
    slug: slugKey.replace(/`/g, ""),
    ec,
    sec: (() => {
      const man = JSON.parse(
        fs.readFileSync(
          path.join(
            process.env.HOME,
            "Documents/dev/test",
            r.dirname,
            "tied-project/working/wf-trial-orchestrator-run/evidence/wf-trial-orchestrator-run.v1.json",
          ),
          "utf8",
        ),
      );
      if (!man.started_at || !man.finished_at) return "—";
      const a = Date.parse(man.started_at);
      const b = Date.parse(man.finished_at);
      return String(Math.round((b - a) / 1000));
    })(),
    grades: compact,
    fname: r.fname,
  });
}

// Catalog (skip if batch already present)
const catPath = path.join(DEMOS, "catalog-traditional-workflow-trial-prompts.md");
let cat = fs.readFileSync(catPath, "utf8");
const marker = "\nMaintained by **`@record-wf-trial`**.";
if (!cat.includes(marker)) throw new Error("catalog marker missing");
if (!cat.includes("1794263616-wf-agentstream-wf-03-cursor-composer25medium")) {
  cat = cat.replace(marker, `\n${catalogLines.join("\n")}${marker}`);
  fs.writeFileSync(catPath, cat);
}

// README — append before closing of workflow table (find last PROMPT-WF line block)
const readmePath = path.join(DEMOS, "README.md");
let readme = fs.readFileSync(readmePath, "utf8");
const anchor = "| [PROMPT-WF-08 Luna low agentstream @ 1794231848]";
const idx = readme.indexOf(anchor);
if (idx < 0) throw new Error("README anchor missing");
const lineEnd = readme.indexOf("\n", idx);
readme =
  readme.slice(0, lineEnd + 1) +
  readmeLines.join("\n") +
  "\n" +
  readme.slice(lineEnd + 1);
fs.writeFileSync(readmePath, readme);

// Registry — append rows before footnotes
const regPath = path.join(DEMOS, "traditional-workflow-trial-runs-registry.md");
let reg = fs.readFileSync(regPath, "utf8");
if (reg.includes("| 1794263616 |")) {
  console.log("registry already contains batch; skipping registry append");
}
const foot = "\n---\n\n## Footnotes";
// Latest for cell: max client_id within (WF, harness, model slug family)
const latestByKey = new Map();
for (const r of registryRows) {
  const key = `${r.wf}|${r.harness}|${r.slug}`;
  const prev = latestByKey.get(key);
  if (!prev || Number(r.id) > Number(prev.id)) latestByKey.set(key, r);
}

const insert = registryRows
  .map((r) => {
    const key = `${r.wf}|${r.harness}|${r.slug}`;
    const latest = latestByKey.get(key)?.id === r.id ? "yes" : "no";
    return `| ${r.wf} | ${r.id} | ${r.harness} | ${r.slug} | ${r.ec} | ${r.sec} | ${r.grades} | ${latest} | [readout](${r.fname}) |`;
  })
  .join("\n");
if (!reg.includes("| 1794263616 |")) {
  reg = reg.replace(foot, `\n${insert}${foot}`);
  const rowCount = (reg.match(/^\| 0[1-8] \|/gm) || []).length;
  reg = reg.replace(/\*\*Rows\*\* \| \*\*\d+\*\*/, `**Rows** | **${rowCount}**`);
  fs.writeFileSync(regPath, reg);
}

console.log("published", catalogLines.length, "catalog rows,", registryRows.length, "registry rows");
