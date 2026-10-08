import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../../..");
const { allTools } = await import(path.join(root, "mcp-server/dist/tools/index.js"));

const RUN_ID = "kaizen-kmcp-preimpl-20261007";
const REQUEST = "REQ-KAIZEN-FEEDBACK-MCP-WIRING";

const pseudoPath = path.join(
  root,
  "tied-project/implementation-decisions/IMPL-KAIZEN-FEEDBACK-MCP-WIRING-pseudocode.md",
);
const pseudocode = fs.readFileSync(pseudoPath, "utf8");

const pseudoTool = allTools.find((t) => t.name === "pseudocode_validate");
const pseudoResult = await pseudoTool.handler({
  token: "IMPL-KAIZEN-FEEDBACK-MCP-WIRING",
  pseudocode,
  require_contracts: true,
  gate_mode: true,
});
const pseudoBody = JSON.parse(pseudoResult.content[0].text);
fs.writeFileSync(path.join(here, "pseudocode-validate-result.json"), JSON.stringify(pseudoBody, null, 2));

const inquiryPayload = JSON.parse(fs.readFileSync(path.join(here, "pre-inquiry-payload.json"), "utf8"));

const inquiryTool = allTools.find((t) => t.name === "tied_adversarial_inquiry_run");
const inquiryResult = await inquiryTool.handler({
  graph: inquiryPayload.graph,
  fidelity: inquiryPayload.fidelity,
  scope: inquiryPayload.scope,
  policy: "advisory",
  repository_root: root,
  request_token: REQUEST,
  run_id: RUN_ID,
  phase: "pre_implementation",
  project_root: root,
});
const inquiryBody = JSON.parse(inquiryResult.content[0].text);
fs.writeFileSync(path.join(here, "pre-inquiry-result.json"), JSON.stringify(inquiryBody, null, 2));

const citdpRaw = yaml.load(
  fs.readFileSync(path.join(here, "../CITDP-REQ-KAIZEN-FEEDBACK-MCP-WIRING.yaml"), "utf8"),
);
const citdp = citdpRaw["CITDP-REQ-KAIZEN-FEEDBACK-MCP-WIRING"];

const activationTool = allTools.find((t) => t.name === "tied_checklist_activation_collect");
const actResult = await activationTool.handler({
  request_token: REQUEST,
  phase: "pre_implementation",
  run_id: RUN_ID,
  project_root: root,
});
const activation = JSON.parse(actResult.content[0].text);
fs.writeFileSync(path.join(here, "gate-activation-pre_implementation.json"), JSON.stringify(activation, null, 2));

const gateTool = allTools.find((t) => t.name === "tied_checklist_gate_validate");
const gateResult = await gateTool.handler({
  phase: "pre_implementation",
  citdp,
  tracker_path: "tied-project/working/REQ-KAIZEN-FEEDBACK-MCP-WIRING/checklist-tracker.yaml",
  project_root: root,
  activation,
  receipt_persistence: {
    request_token: REQUEST,
    gates_dir: "tied-project/working/REQ-KAIZEN-FEEDBACK-MCP-WIRING/gates",
    ledger_path: "tied-project/working/REQ-KAIZEN-FEEDBACK-MCP-WIRING/evidence/gate-ledger.jsonl",
    run_id: RUN_ID,
  },
});
const gateBody = JSON.parse(gateResult.content[0].text);
fs.writeFileSync(path.join(here, "pre-implementation-gate-result.json"), JSON.stringify(gateBody, null, 2));

console.log(
  JSON.stringify({
    pseudocode_ok: pseudoBody.ok,
    inquiry_ok: inquiryBody.ok,
    gate_allowed: gateBody.allowed,
  }),
);
if (!pseudoBody.ok || !gateBody.allowed) process.exit(1);
