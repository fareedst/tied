/**
 * [REQ-PSEUDOCODE_MIGRATION_TOOLING] Unit tests — constraint-ready-v2 classification floor.
 */
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { test } from "node:test";
import { REPO_ROOT } from "./constants.ts";
import {
  parseProcedureBlocks,
  procedureBodyHasLayerBContract,
  sidecarHasLegacyCommentContractFloor,
  sidecarHasProcedureLayerBContract,
  sidecarMeetsConstraintReadyV2Floor,
} from "./constraint-ready-classify.ts";
import { classifySidecarText } from "./fleet-inventory-merge.ts";

test("procedureBodyHasLayerBContract requires Contract with PRE POST EFFECTS", () => {
  const ok = `  Contract:
    INPUT: x
    PRE: true
    POST:
      - success => y
    EFFECTS: pure
`;
  assert.equal(procedureBodyHasLayerBContract(ok), true);
  assert.equal(procedureBodyHasLayerBContract("  # comment only\n"), false);
});

test("classifySidecarText constraint-ready via procedure Contract rows", () => {
  const text = `Grammar-Version: v2
procedure FOO:
  Contract:
    INPUT: x
    PRE: p
    POST:
      - success => ok
    EFFECTS: pure
`;
  assert.equal(classifySidecarText(text), "constraint-ready-v2");
});

test("classifySidecarText header-only when v2 without contract floor", () => {
  const text = "Grammar-Version: v2\nprocedure BAR:\n  RETURN\n";
  assert.equal(classifySidecarText(text), "header-only-v2");
});

test("classifySidecarText constraint-ready with Tier-3 refinement", () => {
  assert.equal(
    classifySidecarText("Grammar-Version: v2\n@refines Other\n"),
    "constraint-ready-v2",
  );
});

test("sidecarHasLegacyCommentContractFloor needs three hash markers or Contract section", () => {
  const two = "Grammar-Version: v2\n# PRE: a\n# POST: b\n";
  assert.equal(sidecarHasLegacyCommentContractFloor(two), false);
  const three = `${two}# EFFECTS: c\n`;
  assert.equal(sidecarHasLegacyCommentContractFloor(three), true);
});

test("live IMPL-TIED_FILES sidecar is constraint-ready-v2 under new classifier", async () => {
  const path = join(
    REPO_ROOT,
    "tied/implementation-decisions/IMPL-TIED_FILES-pseudocode.md",
  );
  const text = await readFile(path, "utf8");
  assert.equal(sidecarMeetsConstraintReadyV2Floor(text), true);
  const state = classifySidecarText(text);
  assert.ok(
    state === "constraint-ready-v2" || state === "constraint-enforced-v2",
    `expected constraint-ready or enforced, got ${state}`,
  );
  assert.ok(sidecarHasProcedureLayerBContract(text));
});

test("live IMPL-MCP_LEAP sidecar meets constraint-ready procedure Contract floor", async () => {
  const path = join(
    REPO_ROOT,
    "tied/implementation-decisions/IMPL-MCP_LEAP_PROPOSAL_QUEUE-pseudocode.md",
  );
  const text = await readFile(path, "utf8");
  assert.equal(sidecarMeetsConstraintReadyV2Floor(text), true);
  const state = classifySidecarText(text);
  assert.ok(
    state === "constraint-ready-v2" || state === "constraint-enforced-v2",
    `expected constraint-ready or enforced, got ${state}`,
  );
  assert.ok(parseProcedureBlocks(text).length > 0);
  assert.ok(sidecarHasProcedureLayerBContract(text));
});

test("live IMPL-MCP_FEEDBACK sidecar meets constraint-ready procedure Contract floor", async () => {
  const path = join(
    REPO_ROOT,
    "tied/implementation-decisions/IMPL-MCP_FEEDBACK_TOOLS-pseudocode.md",
  );
  const text = await readFile(path, "utf8");
  assert.equal(sidecarMeetsConstraintReadyV2Floor(text), true);
  const state = classifySidecarText(text);
  assert.ok(
    state === "constraint-ready-v2" || state === "constraint-enforced-v2",
    `expected constraint-ready or enforced, got ${state}`,
  );
  assert.ok(sidecarHasProcedureLayerBContract(text));
});
