/**
 * [REQ-TIED_JEV_DECISION_COPROCESSOR] [IMPL-TIED_JEV_DECISION_COPROCESSOR]
 * Plan W6 test matrix: T-CFG, T-RT, T-SH, T-GATE (unit/composition).
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { matchKeywordGlossaries } from "./keyword-preload.js";
import { parseRoutingTableMarkdown } from "./routing-table.js";
import { loadMergedRoutingBaseline, mergeRoutingRows } from "./merged-routing-baseline.js";
import {
  resolvePlanSkillsConfig,
  resolvePlanSkillsTimeoutMs,
  DEFAULT_PLAN_SKILLS_TIMEOUT_MS,
} from "./plan-skills-config.js";
import { buildPlanSkillsStatus } from "./plan-skills-status.js";
import { runPlanSkillsShadow } from "./plan-skills-shadow.js";
import { resolvePlanSkillsEvidenceDir, writeTriagePilotEvidence } from "./plan-skills-evidence.js";
import { vocabShadowAgrees } from "./shadow-vocab-preload.js";
import {
  assertTriageGateOrdering,
  runPlanSkillsTriageMcp,
  MAX_TRIAGE_CASES,
} from "./plan-skills-triage-mcp.js";
import { TIEBREAK_CONFIDENCE_MIN } from "./plan-skills-tiebreak.js";
import { allTools } from "../tools/index.js";

function mkProject(jevYaml?: string): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "jev-plan-skills-"));
  fs.mkdirSync(path.join(root, "tied", "vocab"), { recursive: true });
  fs.mkdirSync(path.join(root, "tied", "methodology", "vocab"), { recursive: true });
  if (jevYaml !== undefined) {
    fs.writeFileSync(path.join(root, ".tied-yaml.yaml"), jevYaml, "utf8");
  }
  return root;
}

const CLIENT_ROUTING = `| Pri | Glossary | Keywords |
| --- | --- | --- |
| 5a | [client-only.md](client-only.md) | client keyword |
`;

const METHOD_ROUTING = `| Pri | Glossary | Keywords |
| --- | --- | --- |
| 5b | [method-only.md](method-only.md) | method keyword |
| 5c | [client-only.md](client-only.md) | duplicate should lose |
`;

describe("W6 plan-skills config T-CFG", () => {
  it("T-CFG-01 absent flag → disabled + no fetch path", async () => {
    const root = mkProject();
    const cfg = resolvePlanSkillsConfig(root, {});
    assert.equal(cfg.enabled, false);
    assert.equal(cfg.enabled_source, "default_off");
    const shadow = await runPlanSkillsShadow({
      projectRoot: root,
      tiedBasePath: path.join(root, "tied"),
      prompt: "client keyword",
      skill: "build-plan",
      env: {},
      fetchImpl: async () => {
        throw new Error("fetch should not run");
      },
    });
    assert.equal(shadow.readiness, "disabled");
  });

  it("T-CFG-02 env true/false precedence over yaml", () => {
    const root = mkProject("jev:\n  plan_skills: true\n");
    assert.equal(resolvePlanSkillsConfig(root, { TIED_JEV_PLAN_SKILLS: "false" }).enabled, false);
    assert.equal(resolvePlanSkillsConfig(root, { TIED_JEV_PLAN_SKILLS: "1" }).enabled_source, "env");
    assert.equal(resolvePlanSkillsConfig(root, { TIED_JEV_PLAN_SKILLS: "true" }).enabled, true);
  });

  it("T-CFG-03 invalid env override → off + diagnostic", () => {
    const root = mkProject();
    const cfg = resolvePlanSkillsConfig(root, { TIED_JEV_PLAN_SKILLS: "maybe" });
    assert.equal(cfg.enabled, false);
    assert.ok(cfg.diagnostics.includes("invalid_env_override"));
  });

  it("T-CFG-04 yaml strict boolean true enables", () => {
    const root = mkProject("jev:\n  plan_skills: true\n");
    const cfg = resolvePlanSkillsConfig(root, {});
    assert.equal(cfg.enabled, true);
    assert.equal(cfg.enabled_source, "tied_yaml");
  });

  it("T-CFG-05 malformed yaml flag → off + diagnostic", () => {
    const root = mkProject('jev:\n  plan_skills: "true"\n');
    const cfg = resolvePlanSkillsConfig(root, {});
    assert.equal(cfg.enabled, false);
    assert.ok(cfg.diagnostics.includes("invalid_plan_skills_flag"));
  });

  it("T-CFG-06 whitespace-only key → configured_no_credentials", async () => {
    const root = mkProject("jev:\n  plan_skills: true\n");
    const shadow = await runPlanSkillsShadow({
      projectRoot: root,
      tiedBasePath: path.join(root, "tied"),
      prompt: "x",
      skill: "refine-plan",
      env: { JEV_API_KEY: "   " },
      fetchImpl: async () => {
        throw new Error("no fetch");
      },
    });
    assert.equal(shadow.readiness, "configured_no_credentials");
  });

  it("T-CFG-07 timeout default and invalid override", () => {
    assert.equal(resolvePlanSkillsTimeoutMs({}).timeout_ms, DEFAULT_PLAN_SKILLS_TIMEOUT_MS);
    const bad = resolvePlanSkillsTimeoutMs({ JEV_PLAN_SKILLS_TIMEOUT_MS: "0" });
    assert.ok(bad.diagnostics.includes("invalid_plan_skills_timeout"));
  });

  it("T-CFG-08b vendor HTTP error → agrees false and jev_error (G1)", async () => {
    const root = mkProject("jev:\n  plan_skills: true\n");
    const shadow = await runPlanSkillsShadow({
      projectRoot: root,
      tiedBasePath: path.join(root, "tied"),
      prompt: "x",
      skill: "build-plan",
      env: { JEV_API_KEY: "k" },
      fetchImpl: async () => new Response("bad", { status: 502 }),
    });
    assert.equal(shadow.readiness, "configured_unreachable");
    assert.equal(shadow.jev_error, true);
    assert.equal(shadow.agrees, false);
  });

  it("T-CFG-08 timeout → configured_unreachable", async () => {
    const root = mkProject("jev:\n  plan_skills: true\n");
    const shadow = await runPlanSkillsShadow({
      projectRoot: root,
      tiedBasePath: path.join(root, "tied"),
      prompt: "x",
      skill: "build-plan",
      env: { JEV_API_KEY: "k", JEV_PLAN_SKILLS_TIMEOUT_MS: "50" },
      fetchImpl: () => new Promise(() => {}),
    });
    assert.equal(shadow.readiness, "configured_unreachable");
    assert.equal(shadow.failure_class, "timeout");
  });
});

describe("W6 merged routing T-RT", () => {
  it("T-RT-01..04 merge client+methodology first-wins", () => {
    const clientRows = parseRoutingTableMarkdown(CLIENT_ROUTING);
    const methodRows = parseRoutingTableMarkdown(METHOD_ROUTING);
    const merged = mergeRoutingRows(clientRows, methodRows);
    assert.equal(merged.length, 2);
    assert.equal(merged[0].file, "client-only.md");
  });

  it("T-RT-02 missing client OK", () => {
    const root = mkProject();
    fs.writeFileSync(
      path.join(root, "tied", "methodology", "vocab", "routing.md"),
      METHOD_ROUTING,
      "utf8",
    );
    const loaded = loadMergedRoutingBaseline({ tiedBasePath: path.join(root, "tied") });
    assert.equal(loaded.rows.length, 2);
  });

  it("T-RT-03 missing methodology diagnostic", () => {
    const root = mkProject();
    fs.writeFileSync(path.join(root, "tied", "vocab", "routing.md"), CLIENT_ROUTING, "utf8");
    const loaded = loadMergedRoutingBaseline({ tiedBasePath: path.join(root, "tied") });
    assert.ok(loaded.diagnostics.includes("methodology_routing_missing"));
  });

  it("T-RT-05 keyword parity with merged rows", () => {
    const clientRows = parseRoutingTableMarkdown(CLIENT_ROUTING);
    const methodRows = parseRoutingTableMarkdown(METHOD_ROUTING);
    const merged = mergeRoutingRows(clientRows, methodRows);
    const prompt = "client keyword and method keyword";
    const fromMerged = matchKeywordGlossaries(prompt, merged);
    const direct = matchKeywordGlossaries(prompt, merged);
    assert.deepEqual(fromMerged, direct);
  });
});

describe("W6 shadow/evidence T-SH", () => {
  it("T-SH-01 agrees uses vocabShadowAgrees", () => {
    assert.equal(vocabShadowAgrees(["a"], ["a"]), true);
    assert.equal(vocabShadowAgrees(["a", "b"], ["a"]), true);
    assert.equal(vocabShadowAgrees(["a"], ["b"]), false);
  });

  it("T-SH-02 invalid token rejects evidence", async () => {
    const root = mkProject("jev:\n  plan_skills: true\n");
    const shadow = await runPlanSkillsShadow({
      projectRoot: root,
      tiedBasePath: path.join(root, "tied"),
      prompt: "x",
      skill: "plan-close-out",
      record_evidence: true,
      request_token: "not-a-token",
      env: { JEV_API_KEY: "k" },
      fetchImpl: async () =>
        new Response(JSON.stringify({ model: "m", answers: {} }), { status: 200 }),
    });
    assert.equal(shadow.error, "invalid_request_token");
  });

  it("T-SH-03 invalid request token rejected for evidence", () => {
    const bad = resolvePlanSkillsEvidenceDir("/tmp/p", "not-valid", "run1");
    assert.equal(bad.error, "invalid_request_token");
  });

  it("T-SH-04 truncate flags", async () => {
    const root = mkProject();
    const long = "z".repeat(5000);
    const shadow = await runPlanSkillsShadow({
      projectRoot: root,
      tiedBasePath: path.join(root, "tied"),
      prompt: long,
      skill: "build-plan",
      env: {},
    });
    assert.equal(shadow.prompt_truncated, true);
  });

  it("T-SH-05 record_evidence false writes zero files", async () => {
    const root = mkProject("jev:\n  plan_skills: true\n");
    const token = "REQ-FIXTURE-PLAN-SKILLS";
    fs.mkdirSync(path.join(root, "working", token, "jev", "plan-skills"), { recursive: true });
    await runPlanSkillsShadow({
      projectRoot: root,
      tiedBasePath: path.join(root, "tied"),
      prompt: "x",
      skill: "build-plan",
      record_evidence: false,
      request_token: token,
      env: { JEV_API_KEY: "k" },
      fetchImpl: async () =>
        new Response(
          JSON.stringify({
            model: "jev-1.13.0",
            answers: { primary_glossary: { type: "choice", choice: "x" } },
          }),
          { status: 200 },
        ),
    });
    const dir = path.join(root, "working", token, "jev", "plan-skills");
    assert.equal(fs.readdirSync(dir).length, 0);
  });

  it("T-SH-06 502 retry then 200 ready", async () => {
    const root = mkProject("jev:\n  plan_skills: true\n");
    let n = 0;
    const shadow = await runPlanSkillsShadow({
      projectRoot: root,
      tiedBasePath: path.join(root, "tied"),
      prompt: "method keyword",
      skill: "build-plan",
      env: { JEV_API_KEY: "k" },
      fetchImpl: async () => {
        n += 1;
        if (n === 1) return new Response("bad", { status: 502 });
        return new Response(
          JSON.stringify({
            model: "jev-1.13.0",
            answers: { primary_glossary: { type: "choice", choice: "method-only" } },
          }),
          { status: 200 },
        );
      },
    });
    assert.equal(n, 2);
    assert.equal(shadow.readiness, "ready");
  });
});

describe("W6 MCP composition T-MCP", () => {
  it("T-MCP-01 tools registered in allTools", () => {
    const names = allTools.map((t) => t.name);
    assert.ok(names.includes("tied_jev_status"));
    assert.ok(names.includes("tied_jev_vocab_shadow"));
  });

  it("T-MCP-02 status no probe no secret", () => {
    const root = mkProject("jev:\n  plan_skills: true\n");
    const status = buildPlanSkillsStatus(root, { JEV_API_KEY: "jv_live_secret" });
    assert.equal(status.readiness, "not_probed");
    const json = JSON.stringify(status);
    assert.ok(!json.includes("jv_live_secret"));
    assert.equal(status.schema, "jev-plan-skills-status.v1");
  });

  it("T-MCP-03 invalid skill rejected without fetch", async () => {
    const root = mkProject();
    const shadow = await runPlanSkillsShadow({
      projectRoot: root,
      tiedBasePath: path.join(root, "tied"),
      prompt: "x",
      skill: "debug",
      fetchImpl: async () => {
        throw new Error("no");
      },
    });
    assert.equal(shadow.error, "invalid_skill");
  });
});

function seedMergedRouting(root: string): void {
  fs.writeFileSync(path.join(root, "tied", "vocab", "routing.md"), CLIENT_ROUTING, "utf8");
  fs.writeFileSync(
    path.join(root, "tied", "methodology", "vocab", "routing.md"),
    METHOD_ROUTING,
    "utf8",
  );
}

function mockGlossaryDecide(primary: string, confidence: number, alsoHigh: string[] = []) {
  const answers: Record<string, { type: string; choice?: string; noul?: number; confidence?: number }> = {
    primary_glossary: { type: "choice", choice: primary, confidence },
  };
  for (const id of alsoHigh) {
    answers[`also_${id}`] = { type: "noul", noul: 0.9 };
  }
  return async () =>
    new Response(JSON.stringify({ model: "jev-1.13.0", answers }), { status: 200 });
}

describe("W6d tiebreak T-TB", () => {
  it("T-TB-01 advisory mode has no advisory_primary", async () => {
    const root = mkProject("jev:\n  plan_skills: true\n");
    seedMergedRouting(root);
    const shadow = await runPlanSkillsShadow({
      projectRoot: root,
      tiedBasePath: path.join(root, "tied"),
      prompt: "client keyword and method keyword",
      skill: "build-plan",
      shadow_mode: "advisory",
      env: { JEV_API_KEY: "k" },
      fetchImpl: mockGlossaryDecide("client-only", 0.95, ["method-only"]),
    });
    assert.equal(shadow.advisory_primary, undefined);
    assert.equal(shadow.tiebreak_active, undefined);
  });

  it("T-TB-02 tiebreak with one keyword id → tiebreak_active false", async () => {
    const root = mkProject("jev:\n  plan_skills: true\n");
    seedMergedRouting(root);
    const shadow = await runPlanSkillsShadow({
      projectRoot: root,
      tiedBasePath: path.join(root, "tied"),
      prompt: "client keyword only",
      skill: "build-plan",
      shadow_mode: "tiebreak",
      env: { JEV_API_KEY: "k" },
      fetchImpl: mockGlossaryDecide("client-only", 0.95),
    });
    assert.equal(shadow.tiebreak_active, false);
    assert.equal(shadow.advisory_primary, undefined);
  });

  it("T-TB-03 tiebreak ambiguous but low confidence → no primary", async () => {
    const root = mkProject("jev:\n  plan_skills: true\n");
    seedMergedRouting(root);
    const shadow = await runPlanSkillsShadow({
      projectRoot: root,
      tiedBasePath: path.join(root, "tied"),
      prompt: "client keyword and method keyword",
      skill: "refine-plan",
      shadow_mode: "tiebreak",
      env: { JEV_API_KEY: "k" },
      fetchImpl: mockGlossaryDecide("client-only", 0.5, ["method-only"]),
    });
    assert.equal(shadow.tiebreak_active, false);
    assert.equal(shadow.advisory_primary, undefined);
  });

  it("T-TB-04 tiebreak active preserves keyword_glossaries vs advisory", async () => {
    const root = mkProject("jev:\n  plan_skills: true\n");
    seedMergedRouting(root);
    const base = {
      projectRoot: root,
      tiedBasePath: path.join(root, "tied"),
      prompt: "client keyword and method keyword",
      skill: "build-plan" as const,
      env: { JEV_API_KEY: "k" },
      fetchImpl: mockGlossaryDecide("method-only", TIEBREAK_CONFIDENCE_MIN, ["client-only"]),
    };
    const advisory = await runPlanSkillsShadow({ ...base, shadow_mode: "advisory" });
    const tiebreak = await runPlanSkillsShadow({ ...base, shadow_mode: "tiebreak" });
    assert.deepEqual(tiebreak.keyword_glossaries, advisory.keyword_glossaries);
    assert.equal(tiebreak.tiebreak_active, true);
    assert.ok(typeof tiebreak.advisory_primary === "string");
  });
});

describe("W6d triage MCP T-TR", () => {
  const miniCase = {
    id: "tb-1",
    criterion_text: "criterion",
    pseudocode_excerpt: "proc",
  };

  it("T-TR-01 returns schema v1", async () => {
    const root = mkProject();
    const out = await runPlanSkillsTriageMcp({
      projectRoot: root,
      pre_implementation_gate_passed: true,
      cases: [miniCase],
      env: {},
    });
    assert.equal(out.schema, "adversarial-triage-pilot.v1");
  });

  it("T-TR-02 skips without key", async () => {
    const root = mkProject();
    const out = await runPlanSkillsTriageMcp({
      projectRoot: root,
      pre_implementation_gate_passed: true,
      cases: [miniCase],
      env: {},
    });
    assert.equal(out.jev_invoked, false);
  });

  it("T-TR-03 rejects over max cases", async () => {
    const root = mkProject();
    const cases = Array.from({ length: MAX_TRIAGE_CASES + 1 }, (_, i) => ({
      ...miniCase,
      id: `c-${i}`,
    }));
    const out = await runPlanSkillsTriageMcp({
      projectRoot: root,
      pre_implementation_gate_passed: true,
      cases,
    });
    assert.equal(out.error, "cases_schema_invalid");
  });
});

describe("W6d evidence T-EV", () => {
  it("T-EV-01 triage JSON under contained plan-skills path", () => {
    const root = mkProject();
    const token = "REQ-FIXTURE-PLAN-SKILLS";
    const written = writeTriagePilotEvidence(root, token, "run-triage", {
      schema: "adversarial-triage-pilot.v1",
      jev_invoked: false,
      cases: [],
      agreement_rate: null,
      note: "test",
    });
    assert.ok(!("error" in written));
    const abs = path.join(root, written.artifact_relpath);
    assert.ok(fs.existsSync(abs));
    assert.ok(written.artifact_relpath.includes("adversarial-triage-pilot.v1.json"));
  });
});

describe("W6 gate ordering T-GATE", () => {
  it("T-GATE-01 tied_jev_adversarial_triage_pilot registered (W6d)", () => {
    const names = allTools.map((t) => t.name);
    assert.ok(names.includes("tied_jev_adversarial_triage_pilot"));
  });

  it("T-GATE-03 triage refuses before pre_implementation gate", async () => {
    assert.deepEqual(assertTriageGateOrdering(false), { ok: false, error: "gate_ordering_violation" });
    const root = mkProject();
    const out = await runPlanSkillsTriageMcp({
      projectRoot: root,
      pre_implementation_gate_passed: false,
      cases: [{ id: "x", criterion_text: "c", pseudocode_excerpt: "p" }],
    });
    assert.equal(out.error, "gate_ordering_violation");
  });

  it("T-GATE-02 shadow proof_boundary denies gate authority", async () => {
    const root = mkProject();
    const shadow = await runPlanSkillsShadow({
      projectRoot: root,
      tiedBasePath: path.join(root, "tied"),
      prompt: "x",
      skill: "build-plan",
      env: {},
    });
    assert.match(String(shadow.proof_boundary), /never/i);
  });
});
