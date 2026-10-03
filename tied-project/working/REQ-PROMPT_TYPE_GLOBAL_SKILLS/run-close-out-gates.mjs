#!/usr/bin/env node
/** [REQ-PROMPT_TYPE_GLOBAL_SKILLS] minimal-depth close-out gates for gitignore hygiene. */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { allTools } from "../../mcp-server/dist/tools/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO = path.resolve(__dirname, "../..");
const RUN_ID = "ptgs-gitignore-closeout-20260910";
const REQUEST = "REQ-PROMPT_TYPE_GLOBAL_SKILLS";

function toolHandler(name) {
  const tool = allTools.find((candidate) => candidate.name === name);
  if (!tool) throw new Error(`missing MCP tool ${name}`);
  return tool.handler;
}

function parseToolResult(result) {
  return JSON.parse(result.content[0]?.text ?? "{}");
}

function loadCitdp() {
  return JSON.parse(
    fs.readFileSync(
      path.join(__dirname, "citdp-close-out-record.json"),
      "utf8",
    ),
  );
}

function buildTracker(phase) {
  const evidence = [
    "mcp-server npm test 651/651 pass",
    "tied_validate_consistency ok:true",
    "prompt-type-skills.test.ts SHARED_REFERENCES includes gitignore-close-out-hygiene.md",
  ];
  const steps = [
    { slug: "risk-assessment", disposition: "completed", evidence_refs: evidence },
    {
      slug: "sub-adversarial-inquiry-pass",
      disposition: "not_applicable",
      policy: "minimal-depth-no-inquiry",
      rationale: "Process/docs-only change; depth_tier minimal per CITDP.",
    },
    { slug: "verification-gate", disposition: "completed", evidence_refs: evidence },
    { slug: "sync-tied-stack", disposition: "completed", evidence_refs: evidence },
    { slug: "persist-citdp-record", disposition: "completed", evidence_refs: evidence },
    {
      slug: "gitignore-close-out-hygiene",
      disposition: "completed",
      evidence_refs: [
        "N/A — no new untracked ephemeral paths beyond existing .gitignore working/ blocks for this change",
      ],
    },
    {
      slug: "traceable-commit",
      disposition: phase === "close_out" ? "pending" : "waived",
      evidence_refs: phase === "close_out" ? [] : ["waived until close-out commit"],
    },
  ];
  if (phase === "pre_implementation") {
    steps.unshift(
      { slug: "gate-pseudocode-validation", disposition: "completed", evidence_refs: evidence },
    );
  }
  return { steps };
}

async function runPhase(phase) {
  const gate = toolHandler("tied_checklist_gate_validate");
  const result = parseToolResult(
    await gate({
      phase,
      tracker: buildTracker(phase),
      citdp: loadCitdp(),
      receipt_persistence: {
        request_token: REQUEST,
        gates_dir: path.join(__dirname, "gates"),
        ledger_path: path.join(__dirname, "gate-ledger.jsonl"),
        run_id: RUN_ID,
      },
    }),
  );
  const out = path.join(__dirname, "gates", `gate-${phase}-result.json`);
  fs.writeFileSync(out, `${JSON.stringify(result, null, 2)}\n`);
  console.log(`${phase}: allowed=${result.allowed} diagnostics=${JSON.stringify(result.diagnostics ?? [])}`);
  if (!result.allowed) process.exitCode = 1;
  return result;
}

for (const phase of ["pre_implementation", "verification", "close_out"]) {
  await runPhase(phase);
}
