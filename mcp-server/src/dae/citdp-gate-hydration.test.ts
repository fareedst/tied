import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { validateChecklistGate } from "../checklist-validator.js";
import { adversarialSection } from "../citdp-adversarial-shape.js";
import { loadCitdpBodyFromFile, loadTrackerFromFile } from "./yaml-load.js";
import {
  gateReasonsFromValidateResult,
  hydrateCitdpForChecklistGate,
} from "./citdp-gate-hydration.js";
import { runGateCheckComposition } from "./gate-check-composition.js";
import type { GateValidateFn } from "./gate-check-composition.js";

// [REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION] SC-CGH-01..05

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const fixtureDir = path.join(
  repoRoot,
  "tied-project/working/REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION/fixtures",
);
const productCitdpPath = path.join(fixtureDir, "product-citdp-1794984015.yaml");
const disposableTrackerPath = path.join(fixtureDir, "disposable-tracker-1794984015.yaml");

describe("hydrateCitdpForChecklistGate [REQ-WF_TRIAL_PRODUCT_CITDP_GATE_HYDRATION]", () => {
  it("SC-CGH-01 synthesizes risk_analysis.adversarial_inquiry for 4015 product citdp", () => {
    if (!fs.existsSync(productCitdpPath)) {
      console.log("skip: product citdp fixture missing");
      return;
    }
    const body = loadCitdpBodyFromFile(productCitdpPath);
    const tracker = fs.existsSync(disposableTrackerPath)
      ? loadTrackerFromFile(disposableTrackerPath)
      : undefined;
    assert.equal(adversarialSection(body), undefined);
    const hydrated = hydrateCitdpForChecklistGate(body, tracker);
    const section = adversarialSection(hydrated);
    assert.ok(section);
    assert.equal(section.depth_tier, "minimal");
    assert.equal(section.gate_policy, "advisory");
    assert.equal(adversarialSection(body), undefined, "source document unchanged");
  });

  it("SC-CGH-03 no-op when adversarial_inquiry already present", () => {
    const citdp = {
      risk_analysis: {
        adversarial_inquiry: {
          depth_tier: "minimal",
          gate_policy: "advisory",
          counterexamples: ["a"],
        },
      },
    };
    const hydrated = hydrateCitdpForChecklistGate(citdp);
    assert.deepEqual(adversarialSection(hydrated), adversarialSection(citdp));
    assert.deepEqual(
      (hydrated.risk_analysis as Record<string, unknown>).adversarial_inquiry,
      citdp.risk_analysis.adversarial_inquiry,
    );
  });

  it("SC-CGH-04 does not synthesize for profile_depth integrated without adversarial", () => {
    const citdp = { profile_depth: "integrated", gate_policy: "advisory" };
    const hydrated = hydrateCitdpForChecklistGate(citdp);
    assert.equal(adversarialSection(hydrated), undefined);
    const gate = validateChecklistGate({
      phase: "verification",
      tracker: { steps: [] },
      citdp: hydrated,
    });
    assert.equal(gate.allowed, false);
    assert.ok(gate.diagnostics.includes("malformed_citdp:adversarial_inquiry"));
  });
});

describe("validateChecklistGate with hydration [SC-CGH-01 SC-CGH-02]", () => {
  it("verification allows minimal disposable product citdp after hydration", () => {
    if (!fs.existsSync(productCitdpPath) || !fs.existsSync(disposableTrackerPath)) {
      return;
    }
    const body = loadCitdpBodyFromFile(productCitdpPath);
    const tracker = loadTrackerFromFile(disposableTrackerPath);
    const hydrated = hydrateCitdpForChecklistGate(body, tracker);
    const gate = validateChecklistGate({
      phase: "verification",
      tracker,
      citdp: hydrated,
    });
    assert.ok(
      !gate.diagnostics.includes("malformed_citdp:adversarial_inquiry"),
      `unexpected malformed: ${gate.diagnostics.join(",")}`,
    );
    assert.ok(
      !gate.diagnostics.some((d) => d.startsWith("missing_counterexamples")),
      `list waiver expected: ${gate.diagnostics.join(",")}`,
    );
  });

  it("close_out adversarial lists waived with minimal tracker stub", () => {
    if (!fs.existsSync(productCitdpPath) || !fs.existsSync(disposableTrackerPath)) {
      return;
    }
    const body = loadCitdpBodyFromFile(productCitdpPath);
    const tracker = loadTrackerFromFile(disposableTrackerPath);
    const hydrated = hydrateCitdpForChecklistGate(body, tracker);
    const gate = validateChecklistGate({
      phase: "close_out",
      tracker,
      citdp: hydrated,
    });
    assert.ok(!gate.diagnostics.includes("malformed_citdp:adversarial_inquiry"));
    const listMissing = gate.diagnostics.filter((d) => d.startsWith("missing_") && d.includes("counter"));
    assert.equal(listMissing.length, 0, gate.diagnostics.join(","));
  });
});

describe("gateReasonsFromValidateResult [SC-CGH-05]", () => {
  it("prefers diagnostics over gate_blocked", () => {
    const reasons = gateReasonsFromValidateResult({
      allowed: false,
      diagnostics: ["malformed_citdp:adversarial_inquiry"],
    });
    assert.deepEqual(reasons, ["malformed_citdp:adversarial_inquiry"]);
  });
});

describe("runGateCheckComposition hydration [SC-CGH-05]", () => {
  it("maps gate diagnostics into summary reasons", async () => {
    if (!fs.existsSync(productCitdpPath) || !fs.existsSync(disposableTrackerPath)) {
      return;
    }
    const callGateValidate: GateValidateFn = async () => ({
      allowed: false,
      diagnostics: ["malformed_citdp:adversarial_inquiry"],
    });
    const summary = await runGateCheckComposition({
      requestToken: "REQ-SEMVER_COMPARATOR",
      phase: "verification",
      trackerPath: disposableTrackerPath,
      citdpPath: productCitdpPath,
      projectRoot: repoRoot,
      callGateValidate,
    });
    assert.equal(summary.allowed, false);
    assert.ok(summary.reasons.includes("malformed_citdp:adversarial_inquiry"));
    assert.ok(!summary.reasons.every((r) => r === "gate_blocked"));
  });

  it("passes hydrated citdp to gate validate (no malformed from missing section)", async () => {
    if (!fs.existsSync(productCitdpPath) || !fs.existsSync(disposableTrackerPath)) {
      return;
    }
    let seenCitdp: Record<string, unknown> | undefined;
    const callGateValidate: GateValidateFn = async (args) => {
      seenCitdp = args.citdp;
      return { allowed: true };
    };
    await runGateCheckComposition({
      requestToken: "REQ-SEMVER_COMPARATOR",
      phase: "verification",
      trackerPath: disposableTrackerPath,
      citdpPath: productCitdpPath,
      projectRoot: repoRoot,
      callGateValidate,
    });
    assert.ok(seenCitdp);
    assert.ok(adversarialSection(seenCitdp));
  });
});