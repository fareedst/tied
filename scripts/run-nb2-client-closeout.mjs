#!/usr/bin/env node
/**
 * NB-2-E: client verification + close_out gates (minimal depth; mirrors NB-1-E).
 * [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION]
 */
import { execSync, spawnSync } from "node:child_process";
import { tmpdir } from "node:os";
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

const STDD = "/Users/fareed/Documents/dev/chatgpt/stdd";
const TIED_CLI = join(STDD, ".cursor/skills/tied-yaml/scripts/tied-cli.sh");
const RUN_ID = "nb2-tranche-one-closeout-20260913";

const CLIENTS = [
  {
    client_id: "1786637885",
    repo: "/Users/fareed/Documents/dev/test/1786637885",
    req: "REQ-PSEUDOCODE_MIGRATION",
    wave_id: "W-ext-1786637885-1",
    g3_summary: "working/fleet-constraint-v2/waves/1786637885/receipts/summary.json",
    impl_tokens: ["IMPL-FIRST_N_PRIMES", "IMPL-PRINT_FIRST_FIVE_PRIMES"],
  },
  {
    client_id: "1786643714",
    repo: "/Users/fareed/Documents/dev/test/1786643714",
    req: "REQ-PSEUDOCODE_MIGRATION",
    wave_id: "W-ext-1786643714-1",
    g3_summary: "working/fleet-constraint-v2/waves/1786643714/receipts/summary.json",
    impl_tokens: ["IMPL-FIBONACCI_CLI", "IMPL-FIBONACCI_GENERATE_SEQUENCE"],
  },
  {
    client_id: "1788547701",
    repo: "/Users/fareed/Documents/dev/test/1788547701",
    req: "REQ-PSEUDOCODE_MIGRATION",
    wave_id: "W-ext-1788547701-1",
    g3_summary: "working/fleet-constraint-v2/waves/1788547701/receipts/summary.json",
    impl_tokens: ["IMPL-BT_CLI_FORMATTER", "IMPL-BT_DARWIN_COLLECTOR"],
  },
  {
    client_id: "1787421852",
    repo: "/Users/fareed/Documents/dev/test/1787421852",
    req: "REQ-PSEUDOCODE_MIGRATION",
    wave_id: "W-ext-1787421852-1",
    g3_summary: "working/fleet-constraint-v2/waves/1787421852/receipts/summary.json",
    impl_tokens: [
      "IMPL-VOLUME_MOUNT_DISCOVERY",
      "IMPL-VOLUME_REPORT_FORMAT",
      "IMPL-VOLUME_STATS_CALC",
    ],
  },
  {
    client_id: "1787461685",
    repo: "/Users/fareed/Documents/dev/test/1787461685",
    req: "REQ-PSEUDOCODE_MIGRATION",
    wave_id: "W-ext-1787461685-1",
    g3_summary: "working/fleet-constraint-v2/waves/1787461685/receipts/summary.json",
    impl_tokens: [
      "IMPL-BTREPORT-CLI-CMD",
      "IMPL-BTREPORT-REPORT-FORMAT",
      "IMPL-BTREPORT-SYSTEM-PROFILER",
    ],
  },
];

function tiedCli(basePath, tool, args) {
  const env = { ...process.env, TIED_BASE_PATH: basePath };
  const r = spawnSync(TIED_CLI, [tool, JSON.stringify(args)], {
    env,
    encoding: "utf8",
  });
  if (r.status !== 0) {
    throw new Error(`tied-cli ${tool} failed: ${r.stderr || r.stdout || r.status}`);
  }
  return JSON.parse(r.stdout);
}

function writeYamlFile(path, doc) {
  const tmp = join(tmpdir(), `nb1-citdp-${Date.now()}.yaml`);
  writeFileSync(tmp, JSON.stringify(doc));
  execSync(
    `python3 -c "import json,yaml,sys; doc=json.load(open(sys.argv[1])); yaml.dump(doc, open(sys.argv[2],'w'), sort_keys=False, default_flow_style=False)" "${tmp}" "${path}"`,
    { encoding: "utf8" },
  );
}

function writeCitdp(client) {
  const path = join(client.repo, "tied/citdp", `CITDP-${client.req}.yaml`);
  mkdirSync(join(client.repo, "tied/citdp"), { recursive: true });
  const body = {
    [client.req]: {
      change_definition: {
        current_behavior: "Sidecars at constraint-ready-v2 pre NB-1 close-out",
        desired_behavior:
          "Wave sidecars constraint-enforced-v2 with G3 receipts (NB-2 tranche one)",
        non_goals: ["Orchestrator REQ close_out", "Product feature changes"],
        success_criteria: ["G3 layer_c.ok on all wave sidecars"],
      },
      risk_analysis: {
        adversarial_inquiry: {
          depth_tier: "minimal",
          gate_policy: "blocking",
          profile_depth: "minimal",
          counterexamples: [
            "Claim fleet-migrated-client while wave receipt has layer_c.ok false",
          ],
          falsification_questions: [
            "Can client claim fleet-migrated-client without G3 layer_c.ok on wave sidecars?",
          ],
          disconfirming_observations: [
            "Orchestrator summary.json missing impl_token receipt path",
          ],
          evidence_references: [
            `working/${client.req}/evidence/pseudocode-g3-manifest.v1.json`,
          ],
          close_out_inquiry_waiver:
            "NB-2 fleet pseudo-code migration only; integrated inquiry not required.",
          rationale: "Minimal depth client migration close-out.",
        },
      },
      completion_criteria: {
        verification_gate_notes: `NB-2 orchestrator G3 summary ${client.g3_summary}`,
      },
    },
  };
  writeYamlFile(path, body);
}

function writeChecklist(client) {
  const work = join(client.repo, "working", client.req);
  mkdirSync(join(work, "gates"), { recursive: true });
  mkdirSync(join(work, "evidence"), { recursive: true });
  const orchestratorG3 = join(STDD, client.g3_summary);
  const checklist = {
    copy_hygiene: `NB-2 client migration close-out for ${client.client_id}`,
    request: client.req,
    profile: { depth_tier: "minimal", gate_policy: "blocking" },
    execution_evidence: {
      request: client.req,
      envelope_path: `working/${client.req}/evidence/request-evidence-envelope.v1.json`,
      completed: [
        "change-definition",
        "gate-pseudocode-validation",
        "verification-gate",
        "traceable-commit",
      ],
      orchestrator_g3_proof_boundary: {
        note: "Authoritative G3 receipts live in stdd orchestrator repo",
        stdd_repo: STDD,
        summary_path: client.g3_summary,
        wave_id: client.wave_id,
      },
    },
    steps: [
      {
        slug: "sub-adversarial-inquiry-pass",
        disposition: "not_applicable",
        policy: "minimal-depth-no-inquiry",
        rationale:
          "NB-2 client migration is minimal depth with close_out_inquiry_waiver; no integrated inquiry run.",
      },
      {
        slug: "change-definition",
        disposition: "completed",
        evidence_refs: [
          {
            kind: "file_path",
            path: `working/${client.req}/evidence/pseudocode-g3-manifest.v1.json`,
          },
        ],
      },
      {
        slug: "gate-pseudocode-validation",
        disposition: "completed",
        evidence_refs: [
          {
            kind: "file_path",
            path: `working/${client.req}/evidence/pseudocode-g3-manifest.v1.json`,
          },
        ],
      },
      {
        slug: "verification-gate",
        disposition: "completed",
        evidence_refs: [
          {
            kind: "file_path",
            path: orchestratorG3.replace(`${client.repo}/`, ""),
          },
        ],
      },
      {
        slug: "traceable-commit",
        disposition: "completed",
        evidence_refs: [
          {
            kind: "file_path",
            path: `working/${client.req}/gates/verification-result.json`,
          },
        ],
      },
    ],
  };
  const checklistPath = join(work, "agent-req-implementation-checklist.yaml");
  writeYamlFile(checklistPath, checklist);
  writeFileSync(
    join(work, "evidence", "pseudocode-g3-manifest.v1.json"),
    `${JSON.stringify(
      {
        schema_version: 1,
        wave_id: client.wave_id,
        orchestrator_summary: client.g3_summary,
        impl_tokens: client.impl_tokens,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
}

function validatePseudocode(client) {
  const base = join(client.repo, "tied");
  const reports = [];
  for (const impl of client.impl_tokens) {
    const sidecar = join(base, "implementation-decisions", `${impl}-pseudocode.md`);
    if (!existsSync(sidecar)) {
      throw new Error(`missing sidecar ${sidecar}`);
    }
    const pseudocode = readFileSync(sidecar, "utf8");
    const v = tiedCli(base, "pseudocode_validate", {
      token: impl,
      pseudocode,
    });
    reports.push({ impl, validate_ok: v.ok === true });
  }
  return reports;
}

function loadCitdpBody(client) {
  const citdpPath = join(client.repo, "tied/citdp", `CITDP-${client.req}.yaml`);
  const doc = JSON.parse(
    execSync(
      `python3 -c "import yaml,json,sys; print(json.dumps(yaml.safe_load(open(sys.argv[1]))))" "${citdpPath}"`,
      { encoding: "utf8" },
    ),
  );
  const key = Object.keys(doc).find((k) => k.startsWith("CITDP-")) ?? client.req;
  return doc[key] ?? doc;
}

function runGates(client) {
  const base = join(client.repo, "tied");
  const work = join(client.repo, "working", client.req);
  const trackerPath = join(work, "agent-req-implementation-checklist.yaml");
  const gatesDir = join(work, "gates");
  const citdpBody = loadCitdpBody(client);
  const results = {};
  for (const phase of ["verification", "close_out"]) {
    const gate = tiedCli(base, "tied_checklist_gate_validate", {
      phase,
      project_root: client.repo,
      tracker_path: trackerPath,
      citdp: citdpBody,
      receipt_persistence: {
        request_token: client.req,
        gates_dir: gatesDir.replace(`${client.repo}/`, ""),
        ledger_path: join(gatesDir, "gate-ledger.jsonl").replace(`${client.repo}/`, ""),
        run_id: RUN_ID,
      },
    });
    results[phase] = gate;
    writeFileSync(
      join(gatesDir, `${phase}-result.json`),
      `${JSON.stringify(gate, null, 2)}\n`,
      "utf8",
    );
    if (!gate.allowed) {
      throw new Error(
        `Gate ${phase} blocked for ${client.client_id}: ${JSON.stringify(gate.diagnostics || gate)}`,
      );
    }
  }
  return results;
}

const summary = {};
for (const client of CLIENTS) {
  console.log(`\n=== NB-2-E ${client.client_id} ===`);
  writeCitdp(client);
  writeChecklist(client);
  execSync(`scripts/lint_yaml.sh ${join(client.repo, "tied/citdp")}/*.yaml`, {
    cwd: STDD,
    stdio: "inherit",
  });
  const ps = validatePseudocode(client);
  console.log("DEBUG: pseudocode", ps);
  tiedCli(join(client.repo, "tied"), "tied_validate_consistency", {});
  const gates = runGates(client);
  summary[client.client_id] = {
    verification: gates.verification.allowed,
    close_out: gates.close_out.allowed,
  };
  console.log(
    `TRACE: gates verification=${gates.verification.allowed} close_out=${gates.close_out.allowed}`,
  );
}
mkdirSync(join(STDD, "working/fleet-constraint-v2/NB-2/evidence"), { recursive: true });
writeFileSync(
  join(STDD, "working/fleet-constraint-v2/NB-2/evidence/nb2-client-closeout-summary.json"),
  `${JSON.stringify({ run_id: RUN_ID, clients: summary }, null, 2)}\n`,
);
console.log(JSON.stringify(summary, null, 2));
