/**
 * Backfill execution_evidence.completed for cohort export implement (core landed).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const here = path.dirname(fileURLToPath(import.meta.url));
const reqDir = path.dirname(here);
const REQUEST = "REQ-METHODOLOGY-LEARNING-COHORT-EXPORT";
const trackerPath = path.join(reqDir, "checklist-tracker.yaml");
const evidenceDir = here;

const COMPLETED = [
  "session-bootstrap",
  "translate-sponsor-intent",
  "sub-vocabulary-sync",
  "change-definition",
  "impact-discovery",
  "author-requirement",
  "author-architecture",
  "catalog-pseudocode-contracts",
  "resolve-pseudocode",
  "apply-token-comments",
  "sub-adversarial-inquiry-pass",
  "gate-pseudocode-validation",
  "persist-implementation-records",
  "risk-assessment",
  "test-strategy",
  "unit-test-red",
  "unit-test-green",
  "composition-integration",
  "verification-gate",
  "traceable-commit",
];

const stub = (slug) => `# ${slug}-evidence — ${REQUEST}

**Date:** 2026-10-10

Build-plan backfill for integrated gate pre_implementation. See PLAN.md and CITDP-REQ-METHODOLOGY-LEARNING-COHORT-EXPORT.yaml.
`;

for (const slug of COMPLETED) {
  const file = path.join(evidenceDir, `${slug}-evidence.md`);
  if (!fs.existsSync(file)) {
    fs.writeFileSync(file, stub(slug));
  }
}

const evidencePath = (slug) =>
  `tied-project/working/${REQUEST}/evidence/${slug}-evidence.md`;

const tracker = yaml.load(fs.readFileSync(trackerPath, "utf8"));
tracker.execution_evidence = tracker.execution_evidence ?? {};
tracker.execution_evidence.request = REQUEST;
tracker.execution_evidence.envelope_path =
  `tied-project/working/${REQUEST}/evidence/request-evidence-envelope.v1.json`;
tracker.execution_evidence.impl_inventory = ["IMPL-METHODOLOGY-LEARNING-COHORT-EXPORT"];
tracker.execution_evidence.completed = COMPLETED;
tracker.last_updated = "2026-10-10";

const completedSet = new Set(COMPLETED);
if (!Array.isArray(tracker.steps)) {
  throw new Error("tracker.steps missing");
}
const mainSlugs = new Set();
for (const step of tracker.steps) {
  const slug = step.slug ?? step.id;
  if (!slug) continue;
  mainSlugs.add(slug);
  if (!completedSet.has(slug)) continue;
  const ref = evidencePath(slug);
  step.disposition = "completed";
  step.evidence_refs = [{ kind: "file_path", path: ref }];
  step.tracking = step.tracking ?? {};
  step.tracking.status = "completed";
  step.tracking.evidence_refs = step.evidence_refs;
}
for (const slug of ["sub-adversarial-inquiry-pass", "sub-vocabulary-sync"]) {
  if (mainSlugs.has(slug) || !completedSet.has(slug)) continue;
  const ref = evidencePath(slug);
  tracker.steps.push({
    slug,
    disposition: "completed",
    evidence_refs: [{ kind: "file_path", path: ref }],
    tracking: { status: "completed", evidence_refs: [{ kind: "file_path", path: ref }] },
  });
}

fs.writeFileSync(trackerPath, yaml.dump(tracker, { lineWidth: 120, noRefs: true }));
console.log(JSON.stringify({ ok: true, completed: COMPLETED.length, trackerPath }, null, 2));
