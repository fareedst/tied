import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { snapshotChange } from "./snapshot.js";

describe("SNAPSHOT_CHANGE REQ-TIED_FIDELITY_RESEARCH", () => {
  // [IMPL-TIED_FIDELITY_RESEARCH] [ARCH-TIED_FIDELITY_RESEARCH] [REQ-TIED_FIDELITY_RESEARCH]
  // Captures immutable evidence and preserves the audited project read-only boundary.
  it("captures revision, hashes, and bounded artifacts", () => {
    const result = snapshotChange({
      manifest: {
        projectRoot: "/tmp/research-project",
        tiedBasePath: "/tmp/research-project/tied",
      },
      changeId: "change-1",
      priorRevision: "abc123",
      currentRevision: "def456",
      artifacts: [
        { path: "src/example.ts", kind: "code", content: "return 1;" },
        { path: "tests/example.test.ts", kind: "test", content: "assert(1);" },
      ],
    });

    assert.equal(result.ok, true);
    if (!result.ok) return;
    assert.equal(result.snapshot.changeId, "change-1");
    assert.equal(result.snapshot.priorRevision, "abc123");
    assert.equal(result.snapshot.currentRevision, "def456");
    assert.equal(result.snapshot.artifacts.length, 2);
    assert.match(result.snapshot.artifacts[0].sha256, /^[0-9a-f]{64}$/);
  });

  it("rejects an empty artifact set", () => {
    const result = snapshotChange({
      manifest: {
        projectRoot: "/tmp/research-project",
        tiedBasePath: "/tmp/research-project/tied",
      },
      changeId: "change-1",
      priorRevision: "abc123",
      currentRevision: "def456",
      artifacts: [],
    });

    assert.deepEqual(result, { ok: false, error: "MissingArtifact" });
  });
});
