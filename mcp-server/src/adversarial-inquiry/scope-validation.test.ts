// [IMPL-TIED_ADVERSARIAL_INQUIRY] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveBlockIdentity } from "./core.js";
import {
  discoverSidecarProcedures,
  parseScopeEntry,
  resolveModeBBlockNames,
  scopeEntryMatchesBlock,
  validateModeAInquiryScope,
  validateProcedureNames,
} from "./scope-validation.js";
import type { ObligationGraphInput } from "./types.js";

describe("scope-validation [REQ-TIED_ADVERSARIAL_INQUIRY]", () => {
  const sidecar = `# [IMPL-DEMO] [ARCH-DEMO] [REQ-DEMO]

## OPEN_TCC_READONLY
procedure OPEN_TCC_READONLY(): # [IMPL-DEMO]
1. Open readonly database handle.

procedure MERGE_RESULTS(): # [IMPL-DEMO]
1. Merge query results.
`;

  it("discovers procedures via scanProcedureBlocks instead of first ## heading", () => {
    const procedures = discoverSidecarProcedures(sidecar);
    assert.deepEqual(procedures.map((procedure) => procedure.name), [
      "OPEN_TCC_READONLY",
      "MERGE_RESULTS",
    ]);
  });

  it("parses #closeout tag suffix on scope entries", () => {
    assert.deepEqual(parseScopeEntry("OPEN_TCC_READONLY#closeout"), {
      raw: "OPEN_TCC_READONLY#closeout",
      procedureName: "OPEN_TCC_READONLY",
      phaseTag: "closeout",
    });
    assert.deepEqual(parseScopeEntry("IMPL-DEMO#OPEN_TCC_READONLY#closeout"), {
      raw: "IMPL-DEMO#OPEN_TCC_READONLY#closeout",
      implToken: "IMPL-DEMO",
      procedureName: "OPEN_TCC_READONLY",
      phaseTag: "closeout",
    });
  });

  it("rejects stale block_name with available procedure diagnostic", () => {
    const procedures = discoverSidecarProcedures(sidecar);
    const result = validateProcedureNames(["READ_TCC"], procedures, "IMPL-TCC_DB_READER");
    assert.equal(result.ok, false);
    if (result.ok) return;
    assert.equal(result.error.code, "STALE_BLOCK_NAME");
    assert.match(result.error.message, /READ_TCC/);
    assert.match(result.error.message, /OPEN_TCC_READONLY/);
    assert.match(result.error.message, /MERGE_RESULTS/);
  });

  it("resolves multi-block close_out scope with #closeout tags", () => {
    const procedures = discoverSidecarProcedures(sidecar);
    const resolved = resolveModeBBlockNames({
      implToken: "IMPL-TCC_DB_READER",
      procedures,
      blockScope: ["OPEN_TCC_READONLY#closeout", "MERGE_RESULTS#closeout"],
    });
    assert.equal(resolved.ok, true);
    if (!resolved.ok) return;
    assert.deepEqual(resolved.names, ["OPEN_TCC_READONLY", "MERGE_RESULTS"]);
    assert.equal(resolved.primary, "OPEN_TCC_READONLY");
  });

  it("validates Mode A block-scoped entries including #closeout aliases", () => {
    const block = resolveBlockIdentity({
      implementationToken: "IMPL-DEMO",
      blockName: "OPEN_TCC_READONLY",
      semanticContent: "open readonly handle",
      sourceRevision: "rev-1",
    });
    const graph: ObligationGraphInput = {
      projectId: "project",
      criteria: [],
      architectureConstraints: [{ id: "constraint-1", implementationBlockIds: [block.id] }],
      implementationBlocks: [{ identity: block }],
      evidenceLoci: [],
    };
    const valid = validateModeAInquiryScope([`${block.id.split("#")[0]}#OPEN_TCC_READONLY#closeout`], graph);
    assert.equal(valid.ok, true);
    const invalid = validateModeAInquiryScope(["IMPL-DEMO#READ_TCC#closeout"], graph);
    assert.equal(invalid.ok, false);
    if (invalid.ok) return;
    assert.equal(invalid.error.code, "INVALID_SCOPE");
  });

  it("matches #closeout aliases against resolved block identities", () => {
    const block = resolveBlockIdentity({
      implementationToken: "IMPL-DEMO",
      blockName: "OPEN_TCC_READONLY",
      semanticContent: "open readonly handle",
      sourceRevision: "rev-1",
    });
    assert.equal(scopeEntryMatchesBlock("IMPL-DEMO#OPEN_TCC_READONLY#closeout", block), true);
    assert.equal(scopeEntryMatchesBlock("IMPL-DEMO#READ_TCC#closeout", block), false);
  });
});
