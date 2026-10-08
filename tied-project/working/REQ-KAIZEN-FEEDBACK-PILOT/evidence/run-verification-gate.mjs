import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../../..");
const { allTools } = await import(path.join(root, "mcp-server/src/tools/index.ts"));

const RUN_ID = "kaizen-p7-verify-20261007";
const REQUEST = "REQ-KAIZEN-FEEDBACK-PILOT";

const citdpRaw = yaml.load(
  fs.readFileSync(path.join(here, "../CITDP-REQ-KAIZEN-FEEDBACK-PILOT.yaml"), "utf8"),
);
const citdp = citdpRaw["CITDP-REQ-KAIZEN-FEEDBACK-PILOT"];
citdp.completion_criteria = citdp.completion_criteria ?? {};
citdp.completion_criteria.activation = {
  run_id: RUN_ID,
  phase: "verification",
  request_token: REQUEST,
};

const inquiryPayload = JSON.parse(
  fs.readFileSync(path.join(here, "verification-inquiry-payload.json"), "utf8"),
);

const inquiryTool = allTools.find((t) => t.name === "tied_adversarial_inquiry_run");
const inquiryResult = await inquiryTool.handler({
  graph: inquiryPayload.graph,
  fidelity: inquiryPayload.fidelity,
  scope: inquiryPayload.scope,
  policy: "advisory",
  repository_root: root,
  request_token: REQUEST,
  run_id: RUN_ID,
  phase: "verification",
  project_root: root,
});
const inquiryBody = JSON.parse(inquiryResult.content[0].text);
fs.writeFileSync(path.join(here, "verification-inquiry-result.json"), JSON.stringify(inquiryBody, null, 2));

const activationTool = allTools.find((t) => t.name === "tied_checklist_activation_collect");
const actResult = await activationTool.handler({
  request_token: REQUEST,
  phase: "verification",
  run_id: RUN_ID,
  project_root: root,
});
const activation = JSON.parse(actResult.content[0].text);
fs.writeFileSync(path.join(here, "gate-activation-verification.json"), JSON.stringify(activation, null, 2));

const gateTool = allTools.find((t) => t.name === "tied_checklist_gate_validate");
const gateResult = await gateTool.handler({
  phase: "verification",
  citdp,
  tracker_path: "tied-project/working/REQ-KAIZEN-FEEDBACK-PILOT/checklist-tracker.yaml",
  project_root: root,
  activation,
  receipt_persistence: {
    request_token: REQUEST,
    gates_dir: "tied-project/working/REQ-KAIZEN-FEEDBACK-PILOT/gates",
    ledger_path: "tied-project/working/REQ-KAIZEN-FEEDBACK-PILOT/evidence/gate-ledger.jsonl",
    run_id: RUN_ID,
  },
});
const gateBody = JSON.parse(gateResult.content[0].text);
fs.writeFileSync(path.join(here, "verification-gate-result.json"), JSON.stringify(gateBody, null, 2));

if (!gateBody.allowed) {
  console.error(JSON.stringify({ allowed: false, errors: gateBody.errors }, null, 2));
  process.exit(1);
}

const verifyTool = allTools.find((t) => t.name === "tied_verify");
const verifyResult = await verifyTool.handler({
  passed_requirement_tokens: [REQUEST],
  passed_impl_tokens: ["IMPL-KAIZEN-FEEDBACK-PILOT"],
  checklist_gate: {
    phase: "verification",
    citdp,
    tracker_path: "tied-project/working/REQ-KAIZEN-FEEDBACK-PILOT/checklist-tracker.yaml",
    activation,
  },
  project_root: root,
  receipt_persistence: {
    request_token: REQUEST,
    gates_dir: "tied-project/working/REQ-KAIZEN-FEEDBACK-PILOT/gates",
    ledger_path: "tied-project/working/REQ-KAIZEN-FEEDBACK-PILOT/evidence/gate-ledger.jsonl",
    run_id: RUN_ID,
    gate_receipt_ref: gateBody.receipt_path,
    gate_receipt_hash: gateBody.receipt_hash,
  },
});
const verifyBody = JSON.parse(verifyResult.content[0].text);
fs.writeFileSync(path.join(here, "tied-verify-result.json"), JSON.stringify(verifyBody, null, 2));

console.log(
  JSON.stringify({
    gate_allowed: gateBody.allowed,
    verify_ok: verifyBody.ok,
    status_updates: verifyBody.updated ?? verifyBody.would_update,
  }),
);
