#!/usr/bin/env node
import fs from "node:fs";
import yaml from "js-yaml";

const REQ = "REQ-TIED_SPONSOR_AGENT_RELATIONSHIP";
const trackerPath = new URL("../agent-req-implementation-checklist.yaml", import.meta.url);
const tracker = yaml.load(fs.readFileSync(trackerPath, "utf8"));

const completed = [
  "session-bootstrap",
  "translate-sponsor-intent",
  "change-definition",
  "impact-discovery",
  "risk-assessment",
  "test-strategy",
  "author-requirement",
  "author-architecture",
  "catalog-pseudocode-contracts",
  "resolve-pseudocode",
  "apply-token-comments",
  "flag-insufficient-specs",
  "flag-contradictory-specs",
  "persist-implementation-records",
  "gate-pseudocode-validation",
  "sub-adversarial-inquiry-pass",
  "unit-test-red",
  "unit-test-green",
  "three-way-alignment-unit",
  "composition-integration",
  "persist-citdp-record",
  "sync-tied-stack",
];

const notApplicable = {
  "end-to-end-ui": "No UI surface for methodology vocabulary and gate diagnostics.",
  "sub-residuality-analysis-pass": "No stateful/data-integrity assurance profile for this change.",
  "sub-bbce-advisory-verification-pass": "BBCE not requested in CITDP.",
  "sub-shared-code-change-justification-pass": "No shared-code BBCE justification required.",
};

tracker.execution_evidence.completed = completed;
tracker.execution_evidence.impl_inventory = ["IMPL-TIED_SPONSOR_AGENT_RELATIONSHIP"];
tracker.execution_evidence.operator_evidence = {
  ...tracker.execution_evidence.operator_evidence,
  status: "recorded",
};

const evidenceFor = (slug) => {
  if (slug === "sub-adversarial-inquiry-pass") {
    return [
      {
        kind: "file_path",
        path: `working/${REQ}/adversarial-inquiry/phase-pre_implementation/obligation-report.json`,
      },
    ];
  }
  if (slug === "persist-citdp-record") {
    return [{ kind: "file_path", path: `working/${REQ}/CITDP-${REQ}.yaml` }];
  }
  if (slug === "composition-integration") {
    return [
      { kind: "file_path", path: "mcp-server/src/e2e/sponsor-agent-relationship-contract.test.ts" },
      { kind: "file_path", path: "mcp-server/src/e2e/new-tied-client.test.ts" },
    ];
  }
  return [{ kind: "file_path", path: `working/${REQ}/PLAN.md` }];
};

for (const step of tracker.steps ?? []) {
  const slug = step.slug;
  if (!slug) continue;
  step.tracking ??= {};
  if (notApplicable[slug]) {
    step.tracking.status = "not_applicable";
    step.tracking.rationale = notApplicable[slug];
    step.tracking.evidence_refs = [{ kind: "file_path", path: `working/${REQ}/PLAN.md` }];
    continue;
  }
  if (completed.includes(slug)) {
    step.tracking.status = "completed";
    step.tracking.evidence_refs = evidenceFor(slug);
  }
}

fs.writeFileSync(trackerPath, yaml.dump(tracker, { lineWidth: 120, noRefs: true }));
console.log("patched tracker", trackerPath.pathname);
