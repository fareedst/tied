/**
 * [REQ-PSEUDOCODE_CONSTRAINT_V2_FLEET_MIGRATION] Unit tests — stdd wave plan exclusion + chunking.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  assignStddWaveNumbers,
  buildStddWavePlan,
  compareStddSidecarsDependencyFirst,
  dependencyTierForImplToken,
  filterAndOrderStddSidecars,
  type StddSidecarCandidate,
} from "./stdd-wave-plan.ts";

test("dependencyTierForImplToken orders platform before features", () => {
  assert.ok(
    dependencyTierForImplToken("IMPL-QUALITY_FOO") <
      dependencyTierForImplToken("IMPL-FEAT_BAR"),
  );
  assert.ok(
    dependencyTierForImplToken("IMPL-TIED_FOO") <
      dependencyTierForImplToken("IMPL-GOAGENT_BAR"),
  );
});

test("filterAndOrderStddSidecars excludes wave tokens and sorts tiers", () => {
  const rows: StddSidecarCandidate[] = [
    {
      impl_token: "IMPL-FEAT_Z",
      sidecar_path: "tied/implementation-decisions/IMPL-FEAT_Z-pseudocode.md",
      classification: "header-only-v2",
      dependency_tier: 50,
    },
    {
      impl_token: "IMPL-QUALITY_A",
      sidecar_path: "tied/implementation-decisions/IMPL-QUALITY_A-pseudocode.md",
      classification: "header-only-v2",
      dependency_tier: 20,
    },
  ];
  const ordered = filterAndOrderStddSidecars(rows, new Set(["IMPL-FEAT_Z"]));
  assert.equal(ordered.length, 1);
  assert.equal(ordered[0].impl_token, "IMPL-QUALITY_A");
  assert.ok(
    compareStddSidecarsDependencyFirst(
      { ...rows[1] },
      { ...rows[0] },
    ) < 0,
  );
});

test("assignStddWaveNumbers chunks at max 10 per wave", () => {
  const ordered: StddSidecarCandidate[] = Array.from({ length: 23 }, (_, i) => ({
    impl_token: `IMPL-FEAT_${i}`,
    sidecar_path: `tied/implementation-decisions/IMPL-FEAT_${i}-pseudocode.md`,
    classification: "header-only-v2" as const,
    dependency_tier: 50,
  }));
  const waves = assignStddWaveNumbers(ordered, {
    firstWaveNumber: 3,
    lastWaveNumber: 10,
    maxSidecarsPerWave: 10,
  });
  assert.equal(waves.length, 8);
  assert.equal(waves[0].sidecars.length, 10);
  assert.equal(waves[1].sidecars.length, 10);
  assert.equal(waves[2].sidecars.length, 3);
  assert.equal(waves[3].sidecars.length, 0);
});

test("buildStddWavePlan excludes wave 1 and wave 2 tokens", async () => {
  const plan = await buildStddWavePlan();
  assert.equal(plan.excluded_count, 20);
  assert.equal(plan.remaining_count, 73);
  const tokens = new Set(
    plan.waves.flatMap((w) => w.sidecars.map((s) => s.impl_token)),
  );
  assert.equal(tokens.size, 73);
  assert.ok(!tokens.has("IMPL-PSEUDOCODE_FLEET_MIGRATION_ORCHESTRATION"));
  assert.ok(!tokens.has("IMPL-PSEUDOCODE_MIGRATION_TOOLING"));
  const populated = plan.waves.filter((w) => w.sidecars.length > 0);
  assert.equal(populated.length, 8);
  assert.equal(plan.waves[7].wave_id, "W-stdd-10");
  assert.equal(plan.waves[7].sidecars.length, 3);
});
