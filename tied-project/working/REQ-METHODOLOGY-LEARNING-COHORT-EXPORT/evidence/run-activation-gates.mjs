/**
 * Integrated adversarial activation + checklist gates for REQ-METHODOLOGY-LEARNING-COHORT-EXPORT.
 * Usage: node --import tsx evidence/run-activation-gates.mjs [pre_implementation|verification|both]
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const reqDir = path.dirname(here);
const root = path.resolve(reqDir, "../../..");

const REQUEST = "REQ-METHODOLOGY-LEARNING-COHORT-EXPORT";
const RUN_IDS = {
  pre_implementation: "mlce-preimpl-20261010",
  verification: "mlce-verify-20261010",
  close_out: "mlce-closeout-20261010",
};

const phaseArg = process.argv[2] ?? "both";
const phases =
  phaseArg === "both"
    ? ["pre_implementation", "verification"]
    : [phaseArg];

const { allTools } = await import(path.join(root, "mcp-server/src/tools/index.ts"));

function tool(name) {
  const found = allTools.find((t) => t.name === name);
  if (!found) throw new Error(`missing tool ${name}`);
  return found.handler;
}

const citdpRaw = yaml.load(
  fs.readFileSync(
    path.join(root, "tied-project/citdp/CITDP-REQ-METHODOLOGY-LEARNING-COHORT-EXPORT.yaml"),
    "utf8",
  ),
);
const citdp = citdpRaw["CITDP-REQ-METHODOLOGY-LEARNING-COHORT-EXPORT"];

const inquiryPayload = JSON.parse(
  fs.readFileSync(path.join(here, "pre-implementation-inquiry-payload.json"), "utf8"),
);

const inquiryTool = tool("tied_adversarial_inquiry_run");
const activationTool = tool("tied_checklist_activation_collect");
const gateTool = tool("tied_checklist_gate_validate");
const verifyTool = tool("tied_verify");

const summary = {};

for (const phase of phases) {
  const runId = RUN_IDS[phase];
  citdp.completion_criteria = citdp.completion_criteria ?? {};
  citdp.completion_criteria.activation = {
    run_id: runId,
    phase,
    request_token: REQUEST,
  };

  const inquiryResult = await inquiryTool({
    graph: inquiryPayload.graph,
    fidelity: inquiryPayload.fidelity,
    scope: inquiryPayload.scope,
    policy: "advisory",
    repository_root: root,
    request_token: REQUEST,
    run_id: runId,
    phase,
    project_root: root,
  });
  const inquiryBody = JSON.parse(inquiryResult.content[0].text);
  fs.writeFileSync(
    path.join(here, `${phase}-inquiry-result.json`),
    JSON.stringify(inquiryBody, null, 2),
  );

  const actResult = await activationTool({
    request_token: REQUEST,
    phase,
    run_id: runId,
    project_root: root,
  });
  const activation = JSON.parse(actResult.content[0].text);
  fs.writeFileSync(
    path.join(here, `gate-activation-${phase}.json`),
    JSON.stringify(activation, null, 2),
  );

  if (!activation.ok) {
    summary[phase] = { allowed: false, step: "activation_collect", diagnostics: activation.diagnostics };
    continue;
  }

  const gateResult = await gateTool({
    phase,
    citdp,
    tracker_path:
      "tied-project/working/REQ-METHODOLOGY-LEARNING-COHORT-EXPORT/checklist-tracker.yaml",
    project_root: root,
    activation,
    receipt_persistence: {
      request_token: REQUEST,
      gates_dir: "tied-project/working/REQ-METHODOLOGY-LEARNING-COHORT-EXPORT/gates",
      ledger_path:
        "tied-project/working/REQ-METHODOLOGY-LEARNING-COHORT-EXPORT/evidence/gate-ledger.jsonl",
      run_id: runId,
    },
  });
  const gateBody = JSON.parse(gateResult.content[0].text);
  fs.writeFileSync(
    path.join(here, `${phase}-gate-result.json`),
    JSON.stringify(gateBody, null, 2),
  );

  summary[phase] = {
    allowed: gateBody.allowed,
    receipt_path: gateBody.receipt_path,
    diagnostics: gateBody.diagnostics ?? gateBody.errors,
  };

  if (phase === "verification" && gateBody.allowed) {
    const verifyResult = await verifyTool({
      passed_requirement_tokens: [REQUEST],
      passed_impl_tokens: ["IMPL-METHODOLOGY-LEARNING-COHORT-EXPORT"],
      checklist_gate: {
        phase: "verification",
        citdp,
        tracker_path:
          "tied-project/working/REQ-METHODOLOGY-LEARNING-COHORT-EXPORT/checklist-tracker.yaml",
        activation,
      },
      project_root: root,
      receipt_persistence: {
        request_token: REQUEST,
        gates_dir: "tied-project/working/REQ-METHODOLOGY-LEARNING-COHORT-EXPORT/gates",
        ledger_path:
          "tied-project/working/REQ-METHODOLOGY-LEARNING-COHORT-EXPORT/evidence/gate-ledger.jsonl",
        run_id: runId,
        gate_receipt_ref: gateBody.receipt_path,
        gate_receipt_hash: gateBody.receipt_hash,
      },
    });
    const verifyBody = JSON.parse(verifyResult.content[0].text);
    fs.writeFileSync(path.join(here, "tied-verify-result.json"), JSON.stringify(verifyBody, null, 2));
    summary.verification_verify = {
      ok: verifyBody.ok ?? verifyBody.success,
      updated: verifyBody.updated ?? verifyBody.would_update,
    };
  }
}

console.log(JSON.stringify(summary, null, 2));
if (Object.values(summary).some((s) => s && s.allowed === false)) {
  process.exit(1);
}
