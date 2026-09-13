/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] Unit tests — generalized wave sidecar list reader.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  fleetWaveEntryToManifestEntry,
  readStddWave1,
  readWaveSidecarList,
} from "./pilot-wave.ts";

test("readStddWave1 returns 10 pilot sidecars", async () => {
  const wave = await readStddWave1();
  assert.equal(wave.sidecars.length, 10);
  assert.equal(wave.wave_id, "stdd-wave-1");
});

test("readWaveSidecarList parses wave-1 yaml metadata", async () => {
  const wave = await readWaveSidecarList(
    "working/fleet-constraint-v2/pilots/stdd/wave-1-sidecars.yaml",
  );
  assert.equal(wave.client_id, "stdd");
  assert.equal(wave.wave_id, "stdd-wave-1");
  assert.equal(wave.sidecars.length, 10);
  assert.match(wave.sidecars[0].sidecar_path, /tied\/implementation-decisions\//);
});

test("readWaveSidecarList parses W-stdd-2 sidecar list", async () => {
  const wave = await readWaveSidecarList(
    "working/fleet-constraint-v2/waves/stdd/wave-2-sidecars.yaml",
  );
  assert.equal(wave.wave_id, "W-stdd-2");
  assert.equal(wave.sidecars.length, 10);
});

test("fleetWaveEntryToManifestEntry preserves absolute external paths", () => {
  const abs =
    "/Users/fareed/Documents/dev/test/1789177584/tied/implementation-decisions/IMPL-X-pseudocode.md";
  const entry = fleetWaveEntryToManifestEntry(
    { impl_token: "IMPL-X", sidecar_path: abs },
    "1789177584",
    "W-ext-1789177584-1",
  );
  assert.equal(entry.sidecar_path, abs);
});
