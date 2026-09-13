/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] Unit tests — external client scan helpers.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import {
  buildInventoryDiffV1,
  countsFromRows,
  implTokenFromSidecarFilename,
  renderWaveSidecarListYaml,
  splitSidecarBatches,
  type ExternalSidecarRow,
} from "./external-client-scan.ts";

test("implTokenFromSidecarFilename strips suffix", () => {
  assert.equal(
    implTokenFromSidecarFilename("IMPL-FOO_BAR-pseudocode.md"),
    "IMPL-FOO_BAR",
  );
});

test("splitSidecarBatches respects max_sidecars", () => {
  const items = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
  const batches = splitSidecarBatches(items, 10);
  assert.equal(batches.length, 2);
  assert.equal(batches[0].length, 10);
  assert.equal(batches[1].length, 1);
});

test("buildInventoryDiffV1 stable hash for same rows", () => {
  const rows: ExternalSidecarRow[] = [
    {
      file: "IMPL-A-pseudocode.md",
      impl_token: "IMPL-A",
      sidecar_path: "/tmp/IMPL-A-pseudocode.md",
      classification: "header-only-v2",
    },
  ];
  const a = buildInventoryDiffV1("1789177584", "/tmp/client", rows);
  const b = buildInventoryDiffV1("1789177584", "/tmp/client", rows);
  assert.equal(a.dry_run_content_hash, b.dry_run_content_hash);
  assert.equal(countsFromRows(rows)["header-only-v2"], 1);
});

test("renderWaveSidecarListYaml uses absolute sidecar paths", () => {
  const yaml = renderWaveSidecarListYaml({
    client_id: "1789177584",
    methodology_pin: "48d1fbb+",
    wave_id: "W-ext-1789177584-1",
    sidecars: [
      {
        impl_token: "IMPL-X",
        sidecar_path: "/Users/test/1789177584/tied/implementation-decisions/IMPL-X-pseudocode.md",
      },
    ],
  });
  assert.match(yaml, /sidecar_path: \/Users\/test/);
  assert.match(yaml, /impl_token: IMPL-X/);
});
