/**
 * [REQ-MCP_HTTPS_REMOTE_ACCESS] [IMPL-MCP_HTTP_SERVER]
 */
import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  bearerTokensMatch,
  parseBearerToken,
  resolveHttpBearerRequirement,
} from "./mcp-http-auth.js";

describe("mcp-http-auth [REQ-MCP_HTTPS_REMOTE_ACCESS]", () => {
  it("parseBearerToken extracts token", () => {
    assert.equal(parseBearerToken("Bearer secret"), "secret");
    assert.equal(parseBearerToken("Bearer "), null);
    assert.equal(parseBearerToken(undefined), null);
  });

  it("bearerTokensMatch is constant-time length safe", () => {
    assert.equal(bearerTokensMatch("abc", "abc"), true);
    assert.equal(bearerTokensMatch("abc", "abd"), false);
    assert.equal(bearerTokensMatch("abc", "ab"), false);
  });

  it("resolveHttpBearerRequirement: loopback allows missing token", () => {
    const r = resolveHttpBearerRequirement("127.0.0.1", {});
    assert.equal(r.required, false);
    assert.equal(r.token, null);
  });

  it("resolveHttpBearerRequirement: 0.0.0.0 requires token", () => {
    const r = resolveHttpBearerRequirement("0.0.0.0", {});
    assert.equal(r.required, true);
    assert.equal(r.token, null);
    const ok = resolveHttpBearerRequirement("0.0.0.0", {
      TIED_MCP_HTTP_BEARER_TOKEN: "t",
    });
    assert.equal(ok.required, true);
    assert.equal(ok.token, "t");
  });
});
