/**
 * [REQ-PSEUDOCODE_VALIDATE_PATH_INPUT] [IMPL-PSEUDOCODE_VALIDATE_PATH_INPUT] [ARCH-PSEUDOCODE_INPUT_RESOLUTION]
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import { resolveEssencePseudocodeSource } from "./resolve-essence-pseudocode-source.js";

const VALID_PSEUDO = `# [IMPL-FIXTURE]\nprocedure RUN:\n  Contract:\n    INPUT: x\n    OUTPUT: y\n    PRE: x\n    POST: y\n    EFFECTS: pure\n  RETURN y`;

function tmpBase(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "pseudo-resolve-"));
}

function writeSidecar(base: string, token: string, body: string): string {
  const dir = path.join(base, "implementation-decisions");
  fs.mkdirSync(dir, { recursive: true });
  const rel = `implementation-decisions/${token}-pseudocode.md`;
  fs.writeFileSync(path.join(base, rel), body, "utf8");
  return rel;
}

describe("resolveEssencePseudocodeSource [REQ-PSEUDOCODE_VALIDATE_PATH_INPUT]", () => {
  it("R1 sponsor exact pseudocode_path + token when file exists", () => {
    const base = tmpBase();
    try {
      const rel = writeSidecar(base, "IMPL-TIED_HTOL_PILOT_COHORT_RUNBOOK", VALID_PSEUDO);
      const result = resolveEssencePseudocodeSource(base, {
        token: "IMPL-TIED_HTOL_PILOT_COHORT_RUNBOOK",
        pseudocode_path: rel,
      });
      assert.equal(result.ok, true);
      if (result.ok) {
        assert.equal(result.sourceKind, "path");
        assert.match(result.content, /IMPL-FIXTURE/);
      }
    } finally {
      fs.rmSync(base, { recursive: true, force: true });
    }
  });

  it("R2 essence_pseudocode_path only", () => {
    const base = tmpBase();
    try {
      const rel = writeSidecar(base, "IMPL-FIXTURE", VALID_PSEUDO);
      const result = resolveEssencePseudocodeSource(base, {
        token: "IMPL-FIXTURE",
        essence_pseudocode_path: rel,
      });
      assert.equal(result.ok, true);
      if (result.ok) assert.equal(result.sourceKind, "path");
    } finally {
      fs.rmSync(base, { recursive: true, force: true });
    }
  });

  it("R3 token-only IMPL default sidecar", () => {
    const base = tmpBase();
    try {
      writeSidecar(base, "IMPL-FIXTURE", VALID_PSEUDO);
      const result = resolveEssencePseudocodeSource(base, { token: "IMPL-FIXTURE" });
      assert.equal(result.ok, true);
      if (result.ok) assert.equal(result.sourceKind, "default_sidecar");
    } finally {
      fs.rmSync(base, { recursive: true, force: true });
    }
  });

  it("R4 inline pseudocode only", () => {
    const base = tmpBase();
    try {
      const result = resolveEssencePseudocodeSource(base, {
        token: "IMPL-FIXTURE",
        pseudocode: VALID_PSEUDO,
      });
      assert.equal(result.ok, true);
      if (result.ok) assert.equal(result.sourceKind, "inline");
    } finally {
      fs.rmSync(base, { recursive: true, force: true });
    }
  });

  it("R5 inline plus path is AMBIGUOUS_INPUT", () => {
    const base = tmpBase();
    try {
      const rel = writeSidecar(base, "IMPL-FIXTURE", VALID_PSEUDO);
      const result = resolveEssencePseudocodeSource(base, {
        token: "IMPL-FIXTURE",
        pseudocode: VALID_PSEUDO,
        pseudocode_path: rel,
      });
      assert.equal(result.ok, false);
      if (!result.ok) assert.equal(result.error, "AMBIGUOUS_INPUT");
    } finally {
      fs.rmSync(base, { recursive: true, force: true });
    }
  });

  it("R6 both path keys is AMBIGUOUS_INPUT", () => {
    const base = tmpBase();
    try {
      const rel = writeSidecar(base, "IMPL-FIXTURE", VALID_PSEUDO);
      const result = resolveEssencePseudocodeSource(base, {
        token: "IMPL-FIXTURE",
        pseudocode_path: rel,
        essence_pseudocode_path: rel,
      });
      assert.equal(result.ok, false);
      if (!result.ok) assert.equal(result.error, "AMBIGUOUS_INPUT");
    } finally {
      fs.rmSync(base, { recursive: true, force: true });
    }
  });

  it("R7 path escape outside base", () => {
    const base = tmpBase();
    const outside = fs.mkdtempSync(path.join(os.tmpdir(), "pseudo-out-"));
    const escapeFile = path.join(outside, "escape.md");
    fs.writeFileSync(escapeFile, VALID_PSEUDO, "utf8");
    try {
      const result = resolveEssencePseudocodeSource(base, {
        token: "IMPL-FIXTURE",
        essence_pseudocode_path: escapeFile,
      });
      assert.equal(result.ok, false);
      if (!result.ok) assert.equal(result.error, "PATH_NOT_UNDER_TIED_BASE");
    } finally {
      fs.rmSync(base, { recursive: true, force: true });
      fs.rmSync(outside, { recursive: true, force: true });
    }
  });

  it("R8 missing file returns read error", () => {
    const base = tmpBase();
    try {
      const result = resolveEssencePseudocodeSource(base, {
        token: "IMPL-FIXTURE",
        pseudocode_path: "implementation-decisions/missing.md",
      });
      assert.equal(result.ok, false);
      if (!result.ok) assert.match(result.error, /not found/);
    } finally {
      fs.rmSync(base, { recursive: true, force: true });
    }
  });

  it("R9 non-IMPL token only yields MISSING_INPUT", () => {
    const base = tmpBase();
    try {
      const result = resolveEssencePseudocodeSource(base, { token: "REQ-FOO" });
      assert.equal(result.ok, false);
      if (!result.ok) assert.equal(result.error, "MISSING_INPUT");
    } finally {
      fs.rmSync(base, { recursive: true, force: true });
    }
  });

  it("R10 IMPL token without default file returns not-found", () => {
    const base = tmpBase();
    try {
      const result = resolveEssencePseudocodeSource(base, { token: "IMPL-FIXTURE" });
      assert.equal(result.ok, false);
      if (!result.ok) assert.match(result.error, /not found/);
    } finally {
      fs.rmSync(base, { recursive: true, force: true });
    }
  });

  it("R11 hyphenated IMPL default sidecar", () => {
    const base = tmpBase();
    try {
      writeSidecar(base, "IMPL-ATDD-E2E-AGENT_STREAM", VALID_PSEUDO);
      const result = resolveEssencePseudocodeSource(base, { token: "IMPL-ATDD-E2E-AGENT_STREAM" });
      assert.equal(result.ok, true);
      if (result.ok) assert.equal(result.sourceKind, "default_sidecar");
    } finally {
      fs.rmSync(base, { recursive: true, force: true });
    }
  });
});
