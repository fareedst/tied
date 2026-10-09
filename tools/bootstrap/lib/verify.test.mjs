/**
 * [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, it } from "node:test";
import yaml from "js-yaml";

import {
  verifyMethodologyPseudocodeTokenRefs,
  verifyVocabularyOwnershipMethodology,
} from "./verify.mjs";

describe("verifyVocabularyOwnershipMethodology [REQ-TIED_VOCABULARY_OWNERSHIP]", () => {
  it("throws VOCABULARY_OWNERSHIP_GATE_FAILED when a manifest artifact is missing", () => {
    const tiedDir = fs.mkdtempSync(path.join(os.tmpdir(), "bootstrap-vocab-verify-"));
    const methodologyDir = path.join(tiedDir, "methodology");
    fs.mkdirSync(path.join(methodologyDir, "requirements"), { recursive: true });
    fs.mkdirSync(path.join(methodologyDir, "architecture-decisions"), { recursive: true });
    fs.mkdirSync(path.join(methodologyDir, "implementation-decisions"), { recursive: true });
    fs.writeFileSync(
      path.join(methodologyDir, "requirements", "REQ-TIED_VOCABULARY_OWNERSHIP.yaml"),
      "REQ-TIED_VOCABULARY_OWNERSHIP:\n  name: stub\n",
      "utf8",
    );

    assert.throws(
      () => verifyVocabularyOwnershipMethodology(tiedDir),
      /VOCABULARY_OWNERSHIP_GATE_FAILED/,
    );
  });
});

describe("verifyMethodologyPseudocodeTokenRefs [REQ-TIED_SETUP]", () => {
  it("fails deterministically when a sidecar references a missing ARCH token", () => {
    const tiedDir = fs.mkdtempSync(path.join(os.tmpdir(), "bootstrap-verify-"));
    const implDir = path.join(tiedDir, "methodology", "implementation-decisions");
    fs.mkdirSync(implDir, { recursive: true });
    fs.writeFileSync(
      path.join(tiedDir, "methodology", "architecture-decisions.yaml"),
      yaml.dump({ "ARCH-TIED_STRUCTURE": { detail_file: "architecture-decisions/ARCH-TIED_STRUCTURE.yaml" } }),
      "utf8",
    );
    fs.writeFileSync(path.join(tiedDir, "methodology", "requirements.yaml"), yaml.dump({}), "utf8");
    fs.writeFileSync(path.join(tiedDir, "methodology", "implementation-decisions.yaml"), yaml.dump({}), "utf8");
    fs.writeFileSync(
      path.join(implDir, "IMPL-TIED_FILES-pseudocode.md"),
      "# [IMPL-TIED_FILES] [ARCH-MISSING_BOOTSTRAP_TOKEN] [REQ-TIED_SETUP]\n",
      "utf8",
    );

    assert.throws(
      () => verifyMethodologyPseudocodeTokenRefs(tiedDir),
      /METHODOLOGY_PSEUDOCODE_TOKEN_GATE_FAILED/,
    );
  });

  it("passes when referenced methodology tokens exist in indexes", () => {
    const tiedDir = fs.mkdtempSync(path.join(os.tmpdir(), "bootstrap-verify-"));
    const implDir = path.join(tiedDir, "methodology", "implementation-decisions");
    fs.mkdirSync(implDir, { recursive: true });
    fs.writeFileSync(
      path.join(tiedDir, "methodology", "architecture-decisions.yaml"),
      yaml.dump({
        "ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM": {
          detail_file: "architecture-decisions/ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM.yaml",
        },
      }),
      "utf8",
    );
    fs.writeFileSync(
      path.join(tiedDir, "methodology", "requirements.yaml"),
      yaml.dump({ "REQ-TIED_SETUP": { detail_file: "requirements/REQ-TIED_SETUP.yaml" } }),
      "utf8",
    );
    fs.writeFileSync(
      path.join(tiedDir, "methodology", "implementation-decisions.yaml"),
      yaml.dump({ "IMPL-TIED_FILES": { detail_file: "implementation-decisions/IMPL-TIED_FILES.yaml" } }),
      "utf8",
    );
    fs.writeFileSync(
      path.join(implDir, "IMPL-TIED_FILES-pseudocode.md"),
      "# [IMPL-TIED_FILES] [ARCH-TIED_BOOTSTRAP_CROSS_PLATFORM] [REQ-TIED_SETUP]\n",
      "utf8",
    );

    verifyMethodologyPseudocodeTokenRefs(tiedDir);
  });
});
