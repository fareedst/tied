/**
 * [REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY] [IMPL-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY]
 * W1 unit tests: config, slug derivation, extract, deterministic prechecks, pre-gate disposition.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";

import { INTEGRATED_REQUIRED_SLUGS } from "../checklist-validator.js";
import {
  applySufficiencyThresholds,
  buildEvidenceSufficiencyQuestions,
  derivePreGateTargetSlugs,
  emitPreGateDisposition,
  evaluatePreGateTargetSlug,
  extractGateEvidenceState,
  resolveChecklistEvidenceSufficiencyConfig,
  runChecklistEvidenceSufficiencyPreGate,
  runDeterministicEvidencePrechecks,
  runJevEvidenceSufficiencyFanout,
  SCORE_EVIDENCE_COMPLETENESS_CRITERIA,
  SUBSTANTIVE_NOUL_REJECT_BELOW,
} from "./checklist-evidence-sufficiency.js";
import type { JevDecideResult, JevQuestions } from "./types.js";

function mkProject(jevYaml?: string): string {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "jev-evidence-suff-"));
  if (jevYaml !== undefined) {
    fs.writeFileSync(path.join(root, ".tied-yaml.yaml"), jevYaml, "utf8");
  }
  return root;
}

describe("W1 checklist evidence sufficiency T-CFG", () => {
  it("default-off when env and manifest unset", () => {
    const root = mkProject();
    const cfg = resolveChecklistEvidenceSufficiencyConfig(root, {});
    assert.equal(cfg.enabled, false);
    assert.equal(cfg.enabled_source, "default_off");
  });

  it("env true enables; env false overrides manifest true", () => {
    const root = mkProject("jev:\n  checklist_evidence_sufficiency: true\n");
    assert.equal(
      resolveChecklistEvidenceSufficiencyConfig(root, { TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY: "false" }).enabled,
      false,
    );
    assert.equal(
      resolveChecklistEvidenceSufficiencyConfig(root, { TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY: "1" }).enabled,
      true,
    );
    assert.equal(
      resolveChecklistEvidenceSufficiencyConfig(root, { TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY: "1" }).enabled_source,
      "env",
    );
  });

  it("manifest true only; invalid manifest value diagnostic and off", () => {
    const root = mkProject("jev:\n  checklist_evidence_sufficiency: yes\n");
    const cfg = resolveChecklistEvidenceSufficiencyConfig(root, {});
    assert.equal(cfg.enabled, false);
    assert.ok(cfg.diagnostics.includes("invalid_checklist_evidence_sufficiency_flag"));
  });
});

describe("W1 DERIVE_PRE_GATE_TARGET_SLUGS", () => {
  it("matches integrated pre_implementation slugs union required_step_slugs", () => {
    const slugs = derivePreGateTargetSlugs({
      depthTier: "integrated",
      phase: "pre_implementation",
      requiredStepSlugs: ["traceable-commit"],
    });
    assert.deepEqual(
      slugs.sort(),
      [...INTEGRATED_REQUIRED_SLUGS.pre_implementation, "traceable-commit"].sort(),
    );
  });

  it("reads depth from CITDP risk_analysis.adversarial_inquiry", () => {
    const slugs = derivePreGateTargetSlugs({
      citdp: {
        risk_analysis: {
          adversarial_inquiry: { depth_tier: "integrated" },
        },
      },
      phase: "verification",
    });
    assert.ok(slugs.includes("verification-gate"));
  });
});

describe("W1 EXTRACT_GATE_EVIDENCE_STATE", () => {
  it("collects evidence_refs and caps excerpt", () => {
    const tracker = {
      steps: [
        {
          slug: "unit-test-green",
          title: "Unit tests green",
          disposition: "completed",
          evidence_refs: ["working/REQ-X/evidence/out.txt", "bun test passed"],
          required_tokens: ["[REQ-FOO]"],
        },
      ],
    };
    const state = extractGateEvidenceState({
      tracker,
      slug: "unit-test-green",
      maxExcerptChars: 40,
    });
    assert.ok(state);
    assert.equal(state!.slug, "unit-test-green");
    assert.equal(state!.evidence_excerpt.length, 40);
    assert.deepEqual(state!.required_tokens, ["[REQ-FOO]"]);
    assert.match(state!.criterion_text, /Unit tests green/);
  });

  it("finds sub_procedures step by slug", () => {
    const tracker = {
      steps: [],
      sub_procedures: [
        {
          slug: "sub-adversarial-inquiry-pass",
          tracking: { evidence_refs: ["working/REQ/adversarial-inquiry/phase-pre_implementation/gate-result.json"] },
        },
      ],
    };
    const state = extractGateEvidenceState({ tracker, slug: "sub-adversarial-inquiry-pass" });
    assert.ok(state?.evidence_excerpt.includes("gate-result.json"));
  });
});

describe("W1 RUN_DETERMINISTIC_EVIDENCE_PRECHECKS", () => {
  it("skips when feature disabled", () => {
    const r = runDeterministicEvidencePrechecks({
      featureEnabled: false,
      evidenceExcerpt: "",
      requiredTokens: ["[REQ-X]"],
    });
    assert.equal(r.ok, true);
  });

  it("rejects blank evidence when enabled", () => {
    const r = runDeterministicEvidencePrechecks({
      featureEnabled: true,
      evidenceExcerpt: "   ",
    });
    assert.equal(r.ok, false);
    assert.ok(r.remediation_hints.includes("command_output"));
  });

  it("rejects missing required token literals when enabled", () => {
    const r = runDeterministicEvidencePrechecks({
      featureEnabled: true,
      evidenceExcerpt: "bun test passed with no token cite",
      requiredTokens: ["[REQ-TIED_JEV_CHECKLIST_EVIDENCE_SUFFICIENCY]"],
    });
    assert.equal(r.ok, false);
    assert.ok(r.reasons.some((x) => x.startsWith("missing_required_token:")));
    assert.ok(r.remediation_hints.includes("token_citations"));
  });
});

describe("W1 EMIT_PRE_GATE_DISPOSITION", () => {
  it("never includes gate_receipt and never sets allowed true", () => {
    const body = emitPreGateDisposition({
      phase: "verification",
      failedSlugs: ["traceable-commit"],
      reasons: ["empty_evidence_excerpt"],
      remediation_hints: ["command_output"],
    });
    assert.equal(body.ok, false);
    assert.equal(body.pre_gate, "jev_evidence_sufficiency");
    assert.equal(body.allowed, false);
    assert.equal(body.blocking, true);
    assert.deepEqual(body.failed_step_slugs, ["traceable-commit"]);
    assert.ok(!("gate_receipt" in body));
    assert.ok(body.user_message.includes("superficial"));
  });
});

function mockDecideFromAnswers(
  answers: Record<string, { type: string; noul?: number; score?: number }>,
): (state: Record<string, unknown>, questions: JevQuestions) => Promise<JevDecideResult> {
  return async () => ({
    ok: true,
    response: {
      model: "jev-mock",
      answers: answers as Extract<JevDecideResult, { ok: true }>["response"]["answers"],
    },
  });
}

const substantiveTrackerStep = {
  slug: "traceable-commit",
  title: "Traceable commit",
  disposition: "completed",
  evidence_refs: ["bun test mcp-server/src/jev/checklist-evidence-sufficiency.test.ts — 11 pass"],
};

describe("W2 APPLY_SUFFICIENCY_THRESHOLDS", () => {
  it("rejects substantive noul 0.599 and passes 0.600", () => {
    const fail = applySufficiencyThresholds({
      answers: { substantive_noul: SUBSTANTIVE_NOUL_REJECT_BELOW - 0.001 },
      tokenQuestionRequired: false,
      stepSlug: "traceable-commit",
    });
    assert.equal(fail.pass, false);
    assert.ok(fail.reasons.some((r) => r.includes("noul_evidence_substantive")));

    const pass = applySufficiencyThresholds({
      answers: { substantive_noul: SUBSTANTIVE_NOUL_REJECT_BELOW },
      tokenQuestionRequired: false,
      stepSlug: "traceable-commit",
    });
    assert.equal(pass.pass, true);
  });

  it("rejects score 2 and passes score 3", () => {
    const fail = applySufficiencyThresholds({
      answers: { completeness_score: 2 },
      tokenQuestionRequired: false,
      stepSlug: "unit-test-green",
    });
    assert.equal(fail.pass, false);
    assert.ok(fail.remediation_hints.includes("command_output"));

    const pass = applySufficiencyThresholds({
      answers: { completeness_score: 3 },
      tokenQuestionRequired: false,
      stepSlug: "unit-test-green",
    });
    assert.equal(pass.pass, true);
  });

  it("applies token noul only when token question required", () => {
    const withToken = applySufficiencyThresholds({
      answers: { token_noul: 0.59, substantive_noul: 0.9, completeness_score: 4 },
      tokenQuestionRequired: true,
      stepSlug: "x",
    });
    assert.equal(withToken.pass, false);
    assert.ok(withToken.remediation_hints.includes("token_citations"));

    const withoutToken = applySufficiencyThresholds({
      answers: { token_noul: 0.1, substantive_noul: 0.9, completeness_score: 4 },
      tokenQuestionRequired: false,
      stepSlug: "x",
    });
    assert.equal(withoutToken.pass, true);
  });
});

describe("W2 RUN_JEV_EVIDENCE_SUFFICIENCY_FANOUT", () => {
  it("builds three questions with five score criteria when tokens required", () => {
    const q = buildEvidenceSufficiencyQuestions(true);
    assert.ok(q.noul_evidence_substantive);
    assert.ok(q.noul_tokens_present);
    assert.equal(q.score_evidence_completeness.type, "score");
    if (q.score_evidence_completeness.type === "score") {
      assert.equal(q.score_evidence_completeness.criteria.length, 5);
      assert.deepEqual(q.score_evidence_completeness.criteria, [...SCORE_EVIDENCE_COMPLETENESS_CRITERIA]);
    }
  });

  it("omits token noul question when no required tokens", () => {
    const q = buildEvidenceSufficiencyQuestions(false);
    assert.equal(q.noul_tokens_present, undefined);
  });

  it("fail-open on no_credentials skip", async () => {
    const state = extractGateEvidenceState({
      tracker: { steps: [substantiveTrackerStep] },
      slug: "traceable-commit",
    })!;
    const fanout = await runJevEvidenceSufficiencyFanout({
      gatePhase: "verification",
      evidenceState: state,
      decideFn: async () => ({ ok: false, skipped: true, reason: "no_credentials" }),
    });
    assert.equal(fanout.jev_skipped, true);
    assert.equal(fanout.jev_skip_reason, "no_credentials");
  });

  it("fail-open on HTTP error", async () => {
    const state = extractGateEvidenceState({
      tracker: { steps: [substantiveTrackerStep] },
      slug: "traceable-commit",
    })!;
    const fanout = await runJevEvidenceSufficiencyFanout({
      gatePhase: "verification",
      evidenceState: state,
      decideFn: async () => ({ ok: false, skipped: false, error: "upstream", status: 503 }),
    });
    assert.equal(fanout.jev_skipped, true);
    assert.equal(fanout.jev_skip_reason, "http_error");
  });
});

describe("W2 pre-gate orchestration", () => {
  it("evaluatePreGateTargetSlug fail-open when Jev skips", async () => {
    const r = await evaluatePreGateTargetSlug({
      featureEnabled: true,
      phase: "verification",
      tracker: { steps: [substantiveTrackerStep] },
      slug: "traceable-commit",
      decideFn: async () => ({ ok: false, skipped: true, reason: "no_credentials" }),
    });
    assert.equal(r.ok, true);
    if (r.ok) assert.equal(r.jev_fail_open, true);
  });

  it("evaluatePreGateTargetSlug rejects when mocked Jev below substantive threshold", async () => {
    const r = await evaluatePreGateTargetSlug({
      featureEnabled: true,
      phase: "verification",
      tracker: { steps: [substantiveTrackerStep] },
      slug: "traceable-commit",
      decideFn: mockDecideFromAnswers({
        noul_evidence_substantive: { type: "noul", noul: 0.599 },
        score_evidence_completeness: { type: "score", score: 4 },
      }),
    });
    assert.equal(r.ok, false);
  });

  it("runChecklistEvidenceSufficiencyPreGate passes when feature off", async () => {
    const root = mkProject();
    const r = await runChecklistEvidenceSufficiencyPreGate({
      projectRoot: root,
      phase: "verification",
      tracker: { steps: [substantiveTrackerStep] },
      env: {},
    });
    assert.equal(r.ok, true);
  });
});

describe("W2 SC-DECIDE-TRACE", () => {
  it("appends JSONL with request state questions response and context_meta.gate_phase", async () => {
    const traceDir = fs.mkdtempSync(path.join(os.tmpdir(), "jev-trace-"));
    const tracePath = path.join(traceDir, "trace.jsonl");
    const canary = "jv_live_CANARY_SECRET_DO_NOT_COMMIT";
    const state = extractGateEvidenceState({
      tracker: {
        steps: [
          {
            ...substantiveTrackerStep,
            evidence_refs: [`bun test ok ${canary}`],
          },
        ],
      },
      slug: "traceable-commit",
    })!;

    await runJevEvidenceSufficiencyFanout({
      gatePhase: "verification",
      evidenceState: state,
      jevConfig: {
        traceEnv: {
          JEV_DECIDE_TRACE: "1",
          JEV_DECIDE_TRACE_PATH: tracePath,
          TIED_BASE_PATH: path.join(traceDir, "tied"),
        },
      },
      decideFn: mockDecideFromAnswers({
        noul_evidence_substantive: { type: "noul", noul: 0.95 },
        score_evidence_completeness: { type: "score", score: 5 },
      }),
    });

    const lines = fs.readFileSync(tracePath, "utf8").trim().split("\n");
    assert.ok(lines.length >= 1);
    const record = JSON.parse(lines[lines.length - 1]!) as {
      schema: string;
      request: { state: unknown; questions: unknown };
      response: unknown;
      context_meta: { gate_phase?: string };
    };
    assert.equal(record.schema, "system-one-decide-trace.v1");
    assert.ok(record.request.state);
    assert.ok(record.request.questions);
    assert.ok(record.response);
    assert.equal(record.context_meta.gate_phase, "verification");
    const serialized = JSON.stringify(record);
    assert.ok(!serialized.includes(canary));
    assert.ok(serialized.includes("[REDACTED]") || !serialized.includes("jv_live_CANARY"));
  });
});
