import assert from "node:assert/strict";
import { describe, it } from "node:test";
import path from "node:path";

import { readMethodologySurfaceChangeClass } from "./change-class.js";
import { validateMethodologySurfaceExperimentGate } from "./gate.js";
import { validateChecklistGate } from "../checklist-validator.js";

const projectRoot = path.resolve(import.meta.dirname, "../../../");
const tiedBase = path.join(projectRoot, "tied-project");

// [REQ-METHODOLOGY-SURFACE-EXPERIMENT-GATE]
describe("methodology surface change class", () => {
  it("treats absent class as legacy none", () => {
    const read = readMethodologySurfaceChangeClass({ change_definition: {} });
    assert.equal(read.kind, "absent");
  });

  it("rejects unknown enum without path inference", () => {
    const read = readMethodologySurfaceChangeClass({
      change_definition: { methodology_surface_change_class: "inferred_from_path" },
    });
    assert.equal(read.kind, "unknown");
  });
});

describe("validateMethodologySurfaceExperimentGate", () => {
  it("allows pre_implementation when class absent", () => {
    const result = validateMethodologySurfaceExperimentGate({
      phase: "pre_implementation",
      citdp: { change_definition: {} },
      basePath: tiedBase,
    });
    assert.equal(result.ok, true);
  });

  it("allows pre_implementation when class none", () => {
    const result = validateMethodologySurfaceExperimentGate({
      phase: "pre_implementation",
      citdp: { change_definition: { methodology_surface_change_class: "none" } },
      basePath: tiedBase,
    });
    assert.equal(result.ok, true);
  });

  it("blocks when class non-none without link", () => {
    const result = validateMethodologySurfaceExperimentGate({
      phase: "pre_implementation",
      citdp: {
        change_definition: { methodology_surface_change_class: "checklist_step" },
      },
      basePath: tiedBase,
    });
    assert.equal(result.ok, false);
    assert.ok(result.diagnostics.includes("methodology_surface_experiment_gate_blocked:missing_link"));
  });

  it("blocks when experiment missing from store", () => {
    const result = validateMethodologySurfaceExperimentGate({
      phase: "pre_implementation",
      citdp: {
        change_definition: {
          methodology_surface_change_class: "checklist_step",
          methodology_surface_experiment_link: {
            experiment_id: "mle-nonexistent-gate-fixture",
            production_system_surface: "checklist_step",
          },
        },
      },
      basePath: tiedBase,
    });
    assert.equal(result.ok, false);
    assert.ok(
      result.diagnostics.some((d) => d.startsWith("methodology_experiment_not_found:")),
    );
  });

  it("allows linked demo experiment for checklist_step class", () => {
    const result = validateMethodologySurfaceExperimentGate({
      phase: "pre_implementation",
      citdp: {
        change_definition: {
          methodology_surface_change_class: "checklist_step",
          methodology_surface_experiment_link: {
            experiment_id: "mle-demo-20261010-001",
            production_system_surface: "checklist_step",
          },
        },
      },
      basePath: tiedBase,
    });
    assert.equal(result.ok, true);
  });

  it("no-ops at verification phase", () => {
    const result = validateMethodologySurfaceExperimentGate({
      phase: "verification",
      citdp: {
        change_definition: { methodology_surface_change_class: "checklist_step" },
      },
      basePath: tiedBase,
    });
    assert.equal(result.ok, true);
  });
});

describe("checklist composition order", () => {
  it("blocks pre_implementation on missing link before W2 pairing runs", () => {
    const result = validateChecklistGate({
      phase: "pre_implementation",
      tracker: { steps: [{ slug: "session-bootstrap", disposition: "completed" }] },
      citdp: {
        record_identity: { depth_tier: "integrated", gate_policy: "per_citdp" },
        change_definition: { methodology_surface_change_class: "checklist_step" },
        risk_analysis: {
          adversarial_inquiry: {
            depth_tier: "integrated",
            counterexamples: ["missing link reaches RED"],
            falsification_questions: ["Does gate block?"],
            disconfirming_observations: ["gate blocks"],
            evidence_references: ["gate.test.ts"],
          },
        },
      },
      evidence: { methodologySurfaceExperimentBasePath: tiedBase },
    });
    assert.equal(result.allowed, false);
    assert.ok(
      result.diagnostics.some((d) =>
        d.includes("methodology_surface_experiment_gate_blocked:missing_link"),
      ),
    );
  });
});
