/**
 * Slice 0: structural adversarial inquiry + pre_implementation gate for REQ-TIED_BOUNDED_COMPOSITION.
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const reqDir = path.dirname(here);
const root = path.resolve(reqDir, "../../..");
const REQUEST = "REQ-TIED_BOUNDED_COMPOSITION";
const RUN_ID = "bc-preimpl-20261018";

const { allTools } = await import(path.join(root, "mcp-server/src/tools/index.ts"));

function tool(name) {
  const found = allTools.find((t) => t.name === name);
  if (!found) throw new Error(`missing tool ${name}`);
  return found.handler;
}

const citdpRaw = yaml.load(
  fs.readFileSync(path.join(reqDir, "CITDP-REQ-TIED_BOUNDED_COMPOSITION.yaml"), "utf8"),
);
const citdp = citdpRaw[`CITDP-${REQUEST}`];
citdp.completion_criteria = citdp.completion_criteria ?? {};
citdp.completion_criteria.activation = { run_id: RUN_ID, phase: "pre_implementation", request_token: REQUEST };

const inquiryPayload = JSON.parse(
  fs.readFileSync(path.join(here, "pre-implementation-inquiry-payload.json"), "utf8"),
);

const inquiryTool = tool("tied_adversarial_inquiry_run");
const activationTool = tool("tied_checklist_activation_collect");
const gateTool = tool("tied_checklist_gate_validate");

const phase = "pre_implementation";

const inquiryResult = await inquiryTool({
  graph: inquiryPayload.graph,
  fidelity: inquiryPayload.fidelity,
  scope: inquiryPayload.scope,
  policy: "advisory",
  repository_root: root,
  request_token: REQUEST,
  run_id: RUN_ID,
  phase,
  project_root: root,
});
const inquiryBody = JSON.parse(inquiryResult.content[0].text);
fs.writeFileSync(path.join(here, "pre_implementation-inquiry-result.json"), JSON.stringify(inquiryBody, null, 2));

const actResult = await activationTool({
  request_token: REQUEST,
  phase,
  run_id: RUN_ID,
  project_root: root,
});
const actBody = JSON.parse(actResult.content[0].text);
fs.writeFileSync(path.join(here, "gate-activation-pre_implementation.json"), JSON.stringify(actBody, null, 2));

const trackerPath = path.join(reqDir, "checklist-tracker.yaml");
const tracker = yaml.load(fs.readFileSync(trackerPath, "utf8"));

const gateResult = await gateTool({
  phase,
  citdp,
  tracker_path: trackerPath,
  project_root: root,
  activation: actBody.activation ?? actBody,
  receipt_persistence: {
    request_token: REQUEST,
    gates_dir: "tied-project/working/REQ-TIED_BOUNDED_COMPOSITION/gates",
    ledger_path: "tied-project/working/REQ-TIED_BOUNDED_COMPOSITION/gate-ledger.jsonl",
    run_id: RUN_ID,
  },
});
const gateBody = JSON.parse(gateResult.content[0].text);
fs.writeFileSync(path.join(here, "pre_implementation-gate-result-slice0.json"), JSON.stringify(gateBody, null, 2));
console.log(JSON.stringify({ allowed: gateBody.allowed, phase, run_id: RUN_ID }, null, 2));
