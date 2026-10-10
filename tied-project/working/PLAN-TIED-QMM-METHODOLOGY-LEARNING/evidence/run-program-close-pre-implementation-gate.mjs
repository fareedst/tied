import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../../..");
const { allTools } = await import(path.join(root, "mcp-server/src/tools/index.ts"));

const citdpRaw = yaml.load(
  fs.readFileSync(
    path.join(root, "tied-project/citdp/CITDP-PLAN-TIED-QMM-PROGRAM-CLOSE.yaml"),
    "utf8",
  ),
);
const citdp = citdpRaw["CITDP-PLAN-TIED-QMM-PROGRAM-CLOSE"];

const gateTool = allTools.find((t) => t.name === "tied_checklist_gate_validate");
const gateResult = await gateTool.handler({
  phase: "pre_implementation",
  citdp,
  tracker_path:
    "tied-project/working/PLAN-TIED-QMM-METHODOLOGY-LEARNING/program-close-checklist-tracker.yaml",
  project_root: root,
});

const body = JSON.parse(gateResult.content[0].text);
const recorded = {
  allowed: body.allowed ?? body.decision?.allowed ?? false,
  ok: body.ok ?? false,
  blocking: body.blocking ?? false,
  depth: citdp.record_identity?.depth_tier ?? "minimal",
  phase: "pre_implementation",
  diagnostics: body.diagnostics ?? body.errors ?? [],
  recorded_at: new Date().toISOString(),
  request_token: "PLAN-TIED-QMM-PROGRAM-CLOSE",
  interpretation:
    "Program-close documentation pass; minimal advisory gate must allow doc/orchestrator work before commit 1.",
};
const outPath = path.join(here, "pre_implementation-gate-result-program-close.json");
fs.writeFileSync(outPath, JSON.stringify(recorded, null, 2));
console.log(JSON.stringify(recorded, null, 2));
