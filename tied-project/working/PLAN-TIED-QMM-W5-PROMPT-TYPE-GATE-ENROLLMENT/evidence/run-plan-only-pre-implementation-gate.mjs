import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../../..");
const { allTools } = await import(path.join(root, "mcp-server/src/tools/index.ts"));

const citdpRaw = yaml.load(
  fs.readFileSync(
    path.join(
      root,
      "tied-project/citdp/CITDP-PLAN-TIED-QMM-W5-PROMPT-TYPE-GATE-ENROLLMENT.yaml",
    ),
    "utf8",
  ),
);
const citdp = citdpRaw["CITDP-PLAN-TIED-QMM-W5-PROMPT-TYPE-GATE-ENROLLMENT"];

const gateTool = allTools.find((t) => t.name === "tied_checklist_gate_validate");
const gateResult = await gateTool.handler({
  phase: "pre_implementation",
  citdp,
  tracker_path:
    "tied-project/working/PLAN-TIED-QMM-W5-PROMPT-TYPE-GATE-ENROLLMENT/checklist-tracker.yaml",
  project_root: root,
});

const body = JSON.parse(gateResult.content[0].text);
const recorded = {
  allowed: body.allowed ?? body.decision?.allowed ?? false,
  ok: body.ok ?? false,
  blocking: body.blocking ?? true,
  depth: citdp.record_identity?.depth_tier ?? "minimal",
  phase: "pre_implementation",
  diagnostics: body.diagnostics ?? body.errors ?? [],
  recorded_at: "2026-10-10T13:55:00-07:00",
  request_token: "PLAN-TIED-QMM-W5-PROMPT-TYPE-GATE-ENROLLMENT",
  interpretation:
    "Plan-only documentation pass; gate blocks RED/implement progression (expected). Not a blocker for doc-only close-out.",
};
const outPath = path.join(here, "pre_implementation-gate-result.json");
fs.writeFileSync(outPath, JSON.stringify(recorded, null, 2));
console.log(JSON.stringify(recorded, null, 2));
