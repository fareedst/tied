import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import {
  EVIDENCE_CHAIN_PROFILE_SCHEMA,
  emitManualProfileContract,
  generateEvidenceChainProfile,
  isForbiddenIntentPath,
  normalizeEvidenceChainProfile,
  type EvidenceChainProfile,
  type EvidenceChainProfileAdapters,
} from "./evidence-chain-profile.js";
import type { ProjectManifestResult } from "./manifest.js";

function derived(
  value: unknown,
  extras: Partial<{ source: string; method: string; denominator: number | string; proof_boundary: string }> = {},
) {
  return {
    value,
    source: extras.source ?? "unit",
    method: extras.method ?? "fixture",
    denominator: extras.denominator ?? 1,
    proof_boundary: extras.proof_boundary ?? "traceability_structure",
    status: "observed" as const,
  };
}

function validDraft(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    identity: {
      schema_version: EVIDENCE_CHAIN_PROFILE_SCHEMA,
      project_id: "abc123",
      generator: "mcp",
      generator_version: "1.0.0",
      observed_at: "2026-08-22T00:00:00.000Z",
      commit: "deadbeef",
      tied_methodology_version: "3.0.0",
      tied_base_path_confirmed: true,
    },
    scope: {
      roots_used: ["b", "a"],
      ignore_source: "default",
      config_hash: "cfg",
      languages: ["typescript"],
      file_counts: { source: 1 },
      active_populations: { requirements: 1, architecture: 0, implementation: 1 },
      excluded: ["fixtures"],
      unknown: [],
      not_measured: ["vocabulary_drift_automation"],
      not_applicable: [],
      profile_depth: "integrated",
    },
    evidence_chain: {
      structural: [derived({ ok: true }, { source: "tied_cycles" }), derived({ ok: true }, { source: "binding" })],
      graph: derived({ nodes: 2, edges: 1, cycles: 0 }),
      vocab_resolution: derived("presence_linkage_only"),
    },
    quality: {
      applicable_attributes: ["baseline-functional"],
      command_results: derived({ status: "not_measured" }, { proof_boundary: "executable_behavior" }),
      freshness: derived("2026-08-22", { proof_boundary: "human_decision" }),
      proof_boundary_partition: {
        traceability_structure: [],
        pseudo_code_structure: [],
        semantic_fidelity: [],
        executable_behavior: [],
        human_decision: [],
      },
    },
    change_fidelity: derived(
      { status: "not_measured", applicability: "not_applicable" },
      { proof_boundary: "semantic_fidelity", denominator: "not_applicable" },
    ),
    operational: { metrics_opt_in: false, project_id: "abc123" },
    ...overrides,
  };
}

function spyAdapters() {
  const calls = {
    fidelity: 0,
    binding: 0,
    spec: 0,
    structural: 0,
    append: 0,
    promote: 0,
  };
  const adapters: EvidenceChainProfileAdapters = {
    resolveManifest: (input): ProjectManifestResult => ({
      ok: true,
      manifest: {
        projectRoot: input.projectRoot,
        tiedBasePath: input.tiedBasePath,
        version: input.version,
        languages: [...input.languages],
        testClassifiers: [...input.testClassifiers],
        ignoreRules: [...input.ignoreRules],
      },
    }),
    runStructuralAnalysis: (input) => {
      calls.structural += 1;
      return {
        evidence: [
          {
            validator: "tied_validate_consistency",
            ok: true,
            snapshotId: input.snapshotId,
            proofBoundary: "traceability_structure",
          },
        ],
        proofBoundary: "traceability_structure",
      };
    },
    auditImplFidelity: () => {
      calls.fidelity += 1;
      return { inventory: [], findings: [], verdicts: {} };
    },
    analyzeBindingEvidence: () => {
      calls.binding += 1;
      return {
        kind: "composition-evidence",
        proofBoundary: "UI-free binding evidence only; not unit behavior proof.",
      };
    },
    analyzeSpecificationState: () => {
      calls.spec += 1;
      return { classification: "Unresolved" };
    },
    appendCandidateFinding: () => {
      calls.append += 1;
      return {};
    },
    promoteConfirmedCase: () => {
      calls.promote += 1;
      return {};
    },
  };
  return { adapters, calls };
}

describe("NORMALIZE_EVIDENCE_CHAIN_PROFILE [REQ-EVIDENCE_CHAIN_PROFILE]", () => {
  it("stable-sorts and preserves proof boundaries and N/A statuses", () => {
    // [IMPL-EVIDENCE_CHAIN_PROFILE] [ARCH-EVIDENCE_CHAIN_PROFILE] [REQ-EVIDENCE_CHAIN_PROFILE]
    // Compose depth-gated adapters into one read-only profile without first-slice side effects.
    const profile = normalizeEvidenceChainProfile(validDraft());
    assert.deepEqual(
      profile.evidence_chain.structural.map((row) => row.source),
      ["binding", "tied_cycles"],
    );
    assert.deepEqual(profile.scope.roots_used, ["a", "b"]);
    assert.equal(profile.scope.not_measured.includes("vocabulary_drift_automation"), true);
    assert.equal(profile.evidence_chain.graph.proof_boundary, "traceability_structure");
    assert.equal(profile.change_fidelity.status ?? "observed", "observed");
  });

  it("rejects maturity and score keys [REQ-EVIDENCE_CHAIN_PROFILE]", () => {
    const draft = validDraft({ maturity: 0.9 });
    assert.throws(() => normalizeEvidenceChainProfile(draft), /MalformedProfile/);
    const scored = validDraft({ identity: { ...(validDraft().identity as object), score: 12 } });
    assert.throws(() => normalizeEvidenceChainProfile(scored), /MalformedProfile/);
  });

  it("rejects derived fields without denominators [REQ-EVIDENCE_CHAIN_PROFILE]", () => {
    const draft = validDraft();
    (draft.evidence_chain as { graph: { denominator?: number } }).graph.denominator = 0;
    assert.throws(() => normalizeEvidenceChainProfile(draft), /denominator/);
  });

  it("rejects malformed objects [REQ-EVIDENCE_CHAIN_PROFILE]", () => {
    assert.throws(() => normalizeEvidenceChainProfile(null), /MalformedProfile/);
    assert.throws(() => normalizeEvidenceChainProfile({ identity: {} }), /MalformedProfile/);
  });
});

describe("EMIT_MANUAL_PROFILE_CONTRACT [REQ-EVIDENCE_CHAIN_PROFILE]", () => {
  it("accepts a schema-valid generator manual fixture", () => {
    const identity = {
      ...(validDraft().identity as object),
      generator: "manual",
    };
    const manual = validDraft({
      identity,
      assumptions: ["Inspected indexes by hand"],
      confidence: "medium",
      unsupported_checks: ["mcp_validators_not_run"],
    });
    const profile = emitManualProfileContract(manual);
    assert.equal(profile.identity.generator, "manual");
    assert.deepEqual(profile.assumptions, ["Inspected indexes by hand"]);
    assert.equal(profile.confidence, "medium");
  });

  it("rejects manual profiles missing Path B fields", () => {
    const identity = { ...(validDraft().identity as object), generator: "manual" };
    assert.throws(
      () => emitManualProfileContract(validDraft({ identity })),
      /assumptions/,
    );
  });
});

describe("GENERATE_EVIDENCE_CHAIN_PROFILE [REQ-EVIDENCE_CHAIN_PROFILE]", () => {
  const projectRoot = "/tmp/stdd-client";
  const tiedBasePath = "/tmp/stdd-client/tied";

  it("integrated depth never calls fidelity, binding, or spec adapters", () => {
    const { adapters, calls } = spyAdapters();
    const result = generateEvidenceChainProfile({
      project_root: projectRoot,
      tied_base_path: tiedBasePath,
      confirmed_tied_base_path: tiedBasePath,
      profile_depth: "integrated",
      observed_at: "2026-08-22T00:00:00.000Z",
      adapters,
    });
    assert.equal(result.ok, true);
    assert.equal(calls.fidelity, 0);
    assert.equal(calls.binding, 0);
    assert.equal(calls.spec, 0);
    assert.equal(calls.append, 0);
    assert.equal(calls.promote, 0);
    if (result.ok) {
      assert.equal(result.profile.identity.schema_version, EVIDENCE_CHAIN_PROFILE_SCHEMA);
      assert.equal(result.profile.change_fidelity.status, "not_measured");
    }
  });

  it("human_research without change_context succeeds and does not fail closed", () => {
    const { adapters, calls } = spyAdapters();
    const result = generateEvidenceChainProfile({
      project_root: projectRoot,
      tied_base_path: tiedBasePath,
      confirmed_tied_base_path: tiedBasePath,
      profile_depth: "human_research",
      observed_at: "2026-08-22T00:00:00.000Z",
      adapters,
    });
    assert.equal(result.ok, true);
    assert.equal(calls.fidelity, 1);
    assert.equal(calls.binding, 1);
    assert.equal(calls.spec, 0);
    assert.equal(calls.append, 0);
    assert.equal(calls.promote, 0);
    if (result.ok) {
      assert.equal(result.profile.change_fidelity.status, "not_measured");
      assert.deepEqual(result.profile.change_fidelity.value, {
        status: "not_measured",
        applicability: "not_applicable",
      });
    }
  });

  it("fails closed on wrong TIED base path before collection", () => {
    const { adapters, calls } = spyAdapters();
    const result = generateEvidenceChainProfile({
      project_root: projectRoot,
      tied_base_path: "/other/repo/tied",
      confirmed_tied_base_path: tiedBasePath,
      profile_depth: "integrated",
      adapters,
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.error, "WrongTiedBasePath");
      assert.equal(result.stage, "manifest");
    }
    assert.equal(calls.structural, 0);
    assert.equal(calls.fidelity, 0);
  });

  it("rejects writes into project intent YAML", () => {
    const { adapters } = spyAdapters();
    const writes: string[] = [];
    const result = generateEvidenceChainProfile({
      project_root: projectRoot,
      tied_base_path: tiedBasePath,
      confirmed_tied_base_path: tiedBasePath,
      profile_depth: "integrated",
      output_mode: "file",
      output_path: path.join(tiedBasePath, "requirements.yaml"),
      adapters,
      writeFile: (filePath) => {
        writes.push(filePath);
      },
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.error, "ForbiddenOutputPath");
    assert.deepEqual(writes, []);
    assert.equal(isForbiddenIntentPath(path.join(tiedBasePath, "requirements/REQ-X.yaml"), projectRoot), true);
  });

  it("is deterministic across reruns [REQ-EVIDENCE_CHAIN_PROFILE]", () => {
    const first = generateEvidenceChainProfile({
      project_root: projectRoot,
      tied_base_path: tiedBasePath,
      confirmed_tied_base_path: tiedBasePath,
      profile_depth: "integrated",
      observed_at: "2026-08-22T00:00:00.000Z",
      run_metadata: { run_id: "run-1", commit: "abc" },
      adapters: spyAdapters().adapters,
    });
    const second = generateEvidenceChainProfile({
      project_root: projectRoot,
      tied_base_path: tiedBasePath,
      confirmed_tied_base_path: tiedBasePath,
      profile_depth: "integrated",
      observed_at: "2026-08-22T00:00:00.000Z",
      run_metadata: { run_id: "run-1", commit: "abc" },
      adapters: spyAdapters().adapters,
    });
    assert.equal(first.ok && second.ok, true);
    if (first.ok && second.ok) {
      assert.deepEqual(first.profile, second.profile);
    }
  });
});

describe("manual fixture shape [REQ-EVIDENCE_CHAIN_PROFILE]", () => {
  it("validates the checked-in Path B example fixture", () => {
    const fixturePath = path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "../../../working/evidence-chain/example-profile.json",
    );
    const fixture = JSON.parse(fs.readFileSync(fixturePath, "utf8")) as unknown;
    const profile = emitManualProfileContract(fixture);
    assert.equal(profile.identity.generator, "manual");
    assert.equal(profile.identity.schema_version, EVIDENCE_CHAIN_PROFILE_SCHEMA);
  });

  it("matches EvidenceChainProfile after normalize", () => {
    const profile: EvidenceChainProfile = emitManualProfileContract({
      ...validDraft(),
      identity: { ...(validDraft().identity as object), generator: "manual" },
      assumptions: ["No MCP available"],
      confidence: "low",
      unsupported_checks: ["mcp_validators_not_run", "fidelity_audit"],
    });
    assert.equal(profile.identity.schema_version, EVIDENCE_CHAIN_PROFILE_SCHEMA);
    assert.ok(profile.unsupported_checks?.includes("mcp_validators_not_run"));
  });
});
