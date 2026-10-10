/**
 * W5 enrollment + pairing demonstration matrix (operator_local fixtures).
 * Run from mcp-server: node --import tsx ../tied-project/working/PLAN-TIED-QMM-W5-PROMPT-TYPE-GATE-ENROLLMENT/evidence/run-w5-demonstration.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import yaml from "js-yaml";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "../../../..");
const demoDir = path.join(here, "demonstrations");
const fixturePath = path.join(demoDir, "w5-enrollment-surfaces.yaml");

const { validateProductionSystemEnrollmentObject } = await import(
  path.join(root, "mcp-server/src/methodology-production-system-enrollment/validate.ts")
);
const { pairConformanceEffectiveness } = await import(
  path.join(root, "mcp-server/src/methodology-conformance-effectiveness-pairing/pair.ts")
);
const { METHODOLOGY_LEARNING_EXPERIMENT_SCHEMA_VERSION } = await import(
  path.join(root, "mcp-server/src/methodology-learning-experiment/constants.ts")
);

const matrix = yaml.load(fs.readFileSync(fixturePath, "utf8"));
const runs = [];

function buildRecord(caseRow) {
  return {
    schema_version: METHODOLOGY_LEARNING_EXPERIMENT_SCHEMA_VERSION,
    experiment_id: caseRow.experiment_id,
    production_system_surface: caseRow.production_system_surface,
    surface_ref: caseRow.surface_ref,
    methodology_hypothesis: `W5 demo ${caseRow.id}`,
    proof_boundary: matrix.proof_boundary ?? "Enrollment validator reports only",
    privacy_tier: matrix.privacy_tier ?? "operator_local",
  };
}

function pairingScenario(caseRow) {
  if (caseRow.id === "w5-demo-prompt-type") {
    return {
      label: "enrollment_only_paired",
      input: { experiment_proof_boundary: matrix.proof_boundary },
      expected_disposition: "paired",
    };
  }
  if (caseRow.id === "w5-demo-assurance") {
    return {
      label: "effectiveness_not_measured_documented",
      input: {
        conformance_evidence_refs: [{ kind: "file_path", path: "working/demo/conformance-ref.json" }],
        methodology_outcome_observation: { value: "not_measured" },
        process_grade_gap_documented: true,
        experiment_proof_boundary: matrix.proof_boundary,
      },
      expected_disposition: "effectiveness_not_measured",
    };
  }
  return {
    label: "paired_with_inconclusive_outcome",
    input: {
      conformance_evidence_refs: [{ kind: "gate_receipt", path: "working/demo/gate-receipt.json" }],
      methodology_outcome_observation: { value: "inconclusive" },
      experiment_proof_boundary: matrix.proof_boundary,
    },
    expected_disposition: "paired",
  };
}

for (const caseRow of matrix.cases ?? []) {
  const record = buildRecord(caseRow);
  const enrollment = validateProductionSystemEnrollmentObject(record);
  const pairingSpec = pairingScenario(caseRow);
  const pairing = pairConformanceEffectiveness(pairingSpec.input);

  const md = `# ${caseRow.id} — W5 enrollment demo

**Surface:** \`${caseRow.production_system_surface}\`
**surface_ref:** \`${caseRow.surface_ref}\`

## Enrollment

- ok: ${enrollment.ok}
- disposition: ${enrollment.enrollment_disposition}

## Pairing (${pairingSpec.label})

- ok: ${pairing.ok}
- disposition: ${pairing.disposition} (expected ${pairingSpec.expected_disposition})

${matrix.proof_boundary ?? ""}
`;

  const yamlOut = path.join(demoDir, `${caseRow.id}.yaml`);
  const mdOut = path.join(demoDir, `${caseRow.id}.md`);
  fs.writeFileSync(
    yamlOut,
    yaml.dump(
      {
        case_id: caseRow.id,
        enrollment,
        pairing_scenario: pairingSpec.label,
        pairing,
      },
      { lineWidth: 100, noRefs: true },
    ),
  );
  fs.writeFileSync(mdOut, md);

  const yamlText = fs.readFileSync(yamlOut, "utf8");
  const hasAbsolute = /\/Users\//.test(yamlText) || /\/home\//.test(yamlText);

  runs.push({
    id: caseRow.id,
    enrollment_ok: enrollment.ok,
    enrollment_disposition: enrollment.enrollment_disposition,
    pairing_ok: pairing.ok,
    pairing_disposition: pairing.disposition,
    pairing_expected: pairingSpec.expected_disposition,
    pairing_match: pairing.disposition === pairingSpec.expected_disposition,
    operator_local_no_absolute_paths: !hasAbsolute,
  });
}

const summary = {
  schema_version: "w5-enrollment-demonstration-summary.v1",
  generated_at: new Date().toISOString(),
  privacy_tier: matrix.privacy_tier,
  proof_boundary: matrix.proof_boundary,
  fixture: "w5-enrollment-surfaces.yaml",
  cases_passed: runs.filter(
    (r) =>
      r.enrollment_ok
      && r.pairing_match
      && r.operator_local_no_absolute_paths,
  ).length,
  runs,
};

const summaryPath = path.join(demoDir, "demonstration-summary.json");
fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
console.log(JSON.stringify({ summaryPath, runs }, null, 2));
const failed = runs.filter(
  (r) => !r.enrollment_ok || !r.pairing_match || !r.operator_local_no_absolute_paths,
);
process.exit(failed.length ? 1 : 0);
