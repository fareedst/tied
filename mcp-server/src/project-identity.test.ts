/**
 * Unit tests for shared project identity resolver.
 * - [IMPL-TIED_PROJECT_IDENTITY] [ARCH-TIED_PROJECT_IDENTITY] [REQ-MCP_USAGE_METRICS] [REQ-EVIDENCE_CHAIN_PROFILE]
 */

import assert from "node:assert/strict";
import crypto from "node:crypto";
import path from "node:path";
import { describe, it } from "node:test";
import {
  anonymizedProjectId,
  pathFallbackProjectId,
  resolveProjectIdentity,
} from "./project-identity.js";

function legacyPathHash(tiedBasePath: string): string {
  return crypto.createHash("sha256").update(path.resolve(tiedBasePath || "unknown")).digest("hex").slice(0, 16);
}

function hashConfigured(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex").slice(0, 16);
}

describe("resolveProjectIdentity [IMPL-TIED_PROJECT_IDENTITY]", () => {
  it("same configured ID across different paths yields identical project_id [REQ-MCP_USAGE_METRICS]", () => {
    const env = { TIED_MCP_PROJECT_ID: "my-stable-repo" };
    const first = resolveProjectIdentity("/tmp/repo-a/tied", env);
    const second = resolveProjectIdentity("/tmp/repo-b/tied", env);
    assert.equal(first.project_id, second.project_id);
    assert.equal(first.identity_source, "configured");
    assert.equal(second.identity_source, "configured");
    assert.equal(first.project_id, hashConfigured("my-stable-repo"));
    assert.notEqual(first.project_id, legacyPathHash("/tmp/repo-a/tied"));
  });

  it("distinct configured IDs yield distinct project_ids", () => {
    const alpha = resolveProjectIdentity("/tmp/tied", { TIED_MCP_PROJECT_ID: "alpha" });
    const beta = resolveProjectIdentity("/tmp/tied", { TIED_MCP_PROJECT_ID: "beta" });
    assert.notEqual(alpha.project_id, beta.project_id);
  });

  it("unset env uses path fallback matching legacy hash [REQ-EVIDENCE_CHAIN_PROFILE]", () => {
    const tiedPath = "/tmp/stdd-client/tied";
    const result = resolveProjectIdentity(tiedPath, {});
    assert.equal(result.identity_source, "path_fallback");
    assert.equal(result.project_id, legacyPathHash(tiedPath));
  });

  it("empty and whitespace-only env uses path fallback", () => {
    const tiedPath = "/tmp/stdd-client/tied";
    for (const raw of ["", "   ", "\t\n"]) {
      const result = resolveProjectIdentity(tiedPath, { TIED_MCP_PROJECT_ID: raw });
      assert.equal(result.identity_source, "path_fallback");
      assert.equal(result.project_id, legacyPathHash(tiedPath));
    }
  });

  it("trims configured ID before hashing", () => {
    const result = resolveProjectIdentity("/tmp/tied", { TIED_MCP_PROJECT_ID: "  stable-id  " });
    assert.equal(result.identity_source, "configured");
    assert.equal(result.project_id, hashConfigured("stable-id"));
  });

  it("rejects oversize configured ID with path fallback", () => {
    const tiedPath = "/tmp/tied";
    const oversize = "x".repeat(129);
    const result = resolveProjectIdentity(tiedPath, { TIED_MCP_PROJECT_ID: oversize });
    assert.equal(result.identity_source, "path_fallback");
    assert.equal(result.project_id, legacyPathHash(tiedPath));
  });

  it("rejects path separators and newlines in configured ID", () => {
    const tiedPath = "/tmp/tied";
    for (const invalid of ["foo/bar", "foo\\bar", "foo\nbar", "foo\rbar"]) {
      const result = resolveProjectIdentity(tiedPath, { TIED_MCP_PROJECT_ID: invalid });
      assert.equal(result.identity_source, "path_fallback", `expected fallback for ${JSON.stringify(invalid)}`);
      assert.equal(result.project_id, legacyPathHash(tiedPath));
    }
  });

  it("accepts configured ID at max length 128", () => {
    const value = "a".repeat(128);
    const result = resolveProjectIdentity("/tmp/tied", { TIED_MCP_PROJECT_ID: value });
    assert.equal(result.identity_source, "configured");
    assert.equal(result.project_id, hashConfigured(value));
  });

  it("never exposes raw configured string or path in project_id", () => {
    const configured = "secret-project-name";
    const tiedPath = "/very/secret/path/tied";
    const result = resolveProjectIdentity(tiedPath, { TIED_MCP_PROJECT_ID: configured });
    assert.equal(result.project_id.includes(configured), false);
    assert.equal(result.project_id.includes(tiedPath), false);
    assert.equal(result.project_id.length, 16);
  });
});

describe("anonymizedProjectId alias [IMPL-TIED_PROJECT_IDENTITY]", () => {
  it("returns project_id from resolver", () => {
    const tiedPath = "/tmp/tied";
    assert.equal(anonymizedProjectId(tiedPath), resolveProjectIdentity(tiedPath, {}).project_id);
  });
});

describe("pathFallbackProjectId [IMPL-TIED_PROJECT_IDENTITY]", () => {
  it("matches legacy path hash for unknown empty path", () => {
    assert.equal(pathFallbackProjectId(""), legacyPathHash(""));
  });
});
