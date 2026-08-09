import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { resolveProjectManifest } from "./manifest.js";

describe("PROJECT_MANIFEST REQ-TIED_FIDELITY_RESEARCH", () => {
  // [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
  // Resolves one project boundary and prevents cross-project TIED access.
  it("accepts an absolute project root and matching tied base path", () => {
    const result = resolveProjectManifest({
      projectRoot: "/tmp/research-project",
      tiedBasePath: "/tmp/research-project/tied",
      version: "3.0.0",
      languages: ["typescript"],
      testClassifiers: ["node:test"],
      ignoreRules: ["tied/methodology/**"],
    });

    assert.deepEqual(result, {
      ok: true,
      manifest: {
        projectRoot: "/tmp/research-project",
        tiedBasePath: "/tmp/research-project/tied",
        version: "3.0.0",
        languages: ["typescript"],
        testClassifiers: ["node:test"],
        ignoreRules: ["tied/methodology/**"],
      },
    });
  });

  it("rejects a TIED base path outside the project root", () => {
    const result = resolveProjectManifest({
      projectRoot: "/tmp/research-project",
      tiedBasePath: "/tmp/other-project/tied",
      version: "3.0.0",
      languages: ["typescript"],
      testClassifiers: ["node:test"],
      ignoreRules: [],
    });

    assert.deepEqual(result, {
      ok: false,
      error: "WrongTiedBasePath",
    });
  });
});
