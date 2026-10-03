/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] Unit tests — fleet inventory merge + classify.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  aggregateMigrationState,
  classifySidecarText,
  emptySidecarCounts,
  mergeScanIntoClientRow,
  resolveAggregateMigrationState,
  sidecarCountsAllConstraintEnforcedV2,
} from "./fleet-inventory-merge.ts";

test("classifySidecarText legacy without v2 header", () => {
  assert.equal(classifySidecarText("# no grammar\nprocedure FOO\n"), "legacy-v1");
});

test("classifySidecarText header-only-v2", () => {
  const text = "Grammar-Version: v2\nprocedure BAR\n";
  assert.equal(classifySidecarText(text), "header-only-v2");
});

test("classifySidecarText constraint-ready with refinement", () => {
  const text = "Grammar-Version: v2\n@refines Something\n";
  assert.equal(classifySidecarText(text), "constraint-ready-v2");
});

test("classifySidecarText constraint-ready with Layer B procedure Contract", () => {
  const text = `Grammar-Version: v2
procedure BAZ:
  Contract:
    PRE: x
    POST:
      - success => y
    EFFECTS: pure
`;
  assert.equal(classifySidecarText(text), "constraint-ready-v2");
});

test("mergeScanIntoClientRow updates counts and aggregate", () => {
  const row = {
    client_id: "stdd",
    sidecar_counts_by_state: emptySidecarCounts(),
    aggregate_migration_state: "legacy-v1" as const,
    updated_at: "2020-01-01T00:00:00Z",
  };
  const scan = {
    client_id: "stdd",
    scanned: 3,
    counts: {
      ...emptySidecarCounts(),
      "header-only-v2": 2,
      "legacy-v1": 1,
    },
  };
  const merged = mergeScanIntoClientRow(row, scan);
  assert.equal(merged.sidecar_counts_by_state["header-only-v2"], 2);
  assert.equal(merged.aggregate_migration_state, aggregateMigrationState(scan.counts));
  assert.notEqual(merged.updated_at, row.updated_at);
});

test("aggregateMigrationState picks highest present state", () => {
  const counts = { ...emptySidecarCounts(), "constraint-ready-v2": 5, "legacy-v1": 1 };
  assert.equal(aggregateMigrationState(counts), "constraint-ready-v2");
});

test("classifySidecarText constraint-enforced with INPUT where refinement", () => {
  const text = `Grammar-Version: v2
procedure FOO:
  Contract:
    INPUT: items: list of int where length(items) > 0
    PRE: true
    POST: true
    EFFECTS: pure
`;
  assert.equal(classifySidecarText(text), "constraint-enforced-v2");
});

test("aggregateMigrationState prefers constraint-enforced over ready", () => {
  const counts = {
    ...emptySidecarCounts(),
    "constraint-ready-v2": 5,
    "constraint-enforced-v2": 1,
  };
  assert.equal(aggregateMigrationState(counts), "constraint-enforced-v2");
});

test("resolveAggregateMigrationState promotes enrolled all-enforced to fleet-migrated-client", () => {
  const scan = {
    client_id: "stdd",
    scanned: 93,
    counts: { ...emptySidecarCounts(), "constraint-enforced-v2": 93 },
  };
  assert.equal(
    resolveAggregateMigrationState(scan, { phase_4_enrollment: "enrolled_phase_4" }),
    "fleet-migrated-client",
  );
});

test("resolveAggregateMigrationState keeps constraint-enforced-v2 when not enrolled", () => {
  const scan = {
    client_id: "stdd",
    scanned: 93,
    counts: { ...emptySidecarCounts(), "constraint-enforced-v2": 93 },
  };
  assert.equal(resolveAggregateMigrationState(scan, {}), "constraint-enforced-v2");
  assert.equal(
    resolveAggregateMigrationState(scan, { phase_4_enrollment: "not_enrolled_phase_4" }),
    "constraint-enforced-v2",
  );
});

test("resolveAggregateMigrationState mixed enforced+ready stays constraint-enforced-v2 when enrolled", () => {
  const scan = {
    client_id: "stdd",
    scanned: 10,
    counts: {
      ...emptySidecarCounts(),
      "constraint-enforced-v2": 9,
      "constraint-ready-v2": 1,
    },
  };
  assert.equal(
    resolveAggregateMigrationState(scan, { phase_4_enrollment: "enrolled_phase_4" }),
    "constraint-enforced-v2",
  );
  assert.equal(sidecarCountsAllConstraintEnforcedV2(scan.counts, scan.scanned), false);
});

test("mergeScanIntoClientRow sets fleet-migrated-client for enrolled stdd all-enforced scan", () => {
  const row = {
    client_id: "stdd",
    sidecar_counts_by_state: emptySidecarCounts(),
    aggregate_migration_state: "constraint-enforced-v2",
    phase_4_enrollment: "enrolled_phase_4",
    updated_at: "2020-01-01T00:00:00Z",
  };
  const scan = {
    client_id: "stdd",
    scanned: 2,
    counts: { ...emptySidecarCounts(), "constraint-enforced-v2": 2 },
  };
  const merged = mergeScanIntoClientRow(row, scan);
  assert.equal(merged.aggregate_migration_state, "fleet-migrated-client");
});
