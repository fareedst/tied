import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../../..");
const { allTools } = await import(path.join(root, "mcp-server/src/tools/index.ts"));

const citdpRaw = yaml.load(
  fs.readFileSync(path.join(here, "../CITDP-REQ-KAIZEN-FEEDBACK-PILOT.yaml"), "utf8"),
);
const citdp = citdpRaw["CITDP-REQ-KAIZEN-FEEDBACK-PILOT"];

const activationTool = allTools.find((t) => t.name === "tied_checklist_activation_collect");
const actResult = await activationTool.handler({
  request_token: "REQ-KAIZEN-FEEDBACK-PILOT",
  phase: "pre_implementation",
  run_id: "kaizen-p7-preimpl-20261007",
  project_root: root,
});
const activation = JSON.parse(actResult.content[0].text);

const gateTool = allTools.find((t) => t.name === "tied_checklist_gate_validate");
const gateResult = await gateTool.handler({
  phase: "pre_implementation",
  citdp,
  tracker_path: "tied-project/working/REQ-KAIZEN-FEEDBACK-PILOT/checklist-tracker.yaml",
  project_root: root,
  activation,
  receipt_persistence: {
    request_token: "REQ-KAIZEN-FEEDBACK-PILOT",
    gates_dir: "tied-project/working/REQ-KAIZEN-FEEDBACK-PILOT/gates",
    ledger_path: "tied-project/working/REQ-KAIZEN-FEEDBACK-PILOT/evidence/gate-ledger.jsonl",
    run_id: "kaizen-p7-preimpl-20261007",
  },
});

const body = JSON.parse(gateResult.content[0].text);
const outPath = path.join(here, "pre-implementation-gate-result.json");
fs.writeFileSync(outPath, JSON.stringify(body, null, 2));
console.log(JSON.stringify({ ok: body.ok, allowed: body.allowed, gate_receipt: body.gate_receipt?.path }));
