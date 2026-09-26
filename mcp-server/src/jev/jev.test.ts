/**
 * [REQ-TIED_JEV_DECISION_COPROCESSOR] [IMPL-TIED_JEV_DECISION_COPROCESSOR]
 */

import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { jevDecide, redactString, resolveJevConfig } from "./index.js";

describe("REQ-TIED_JEV_DECISION_COPROCESSOR jev client", () => {
  it("jevDecide skips when no credentials", async () => {
    const result = await jevDecide("hello", {
      urgent: { type: "noul", instructions: "Is this urgent?" },
    }, { apiKey: undefined });
    assert.equal(result.ok, false);
    if (!result.ok && result.skipped) {
      assert.equal(result.reason, "no_credentials");
    }
  });

  it("redactString masks jv_live keys", () => {
    const out = redactString("key jv_live_secret123 here");
    assert.ok(!out.includes("jv_live_secret123"));
    assert.ok(out.includes("[REDACTED]"));
  });

  it("jevDecide posts to /v1/decide with bearer auth", async () => {
    const calls: RequestInit[] = [];
    const fetchImpl = async (input: RequestInfo | URL, init?: RequestInit) => {
      calls.push(init ?? {});
      return new Response(
        JSON.stringify({
          model: "jev-1.13.0",
          answers: { urgent: { type: "noul", noul: 0.9 } },
          usage: { input_tokens: 10, cost_usd: 0.00001 },
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    };

    const result = await jevDecide(
      "deploy failed",
      { urgent: { type: "noul", instructions: "Urgent?" } },
      {
        apiKey: "jv_live_test",
        apiBase: "https://example.test/api",
        fetchImpl,
      },
    );

    assert.equal(result.ok, true);
    if (result.ok) {
      const urgent = result.response.answers.urgent;
      assert.equal(urgent.type, "noul");
      if (urgent.type === "noul") {
        assert.equal(urgent.noul, 0.9);
      }
    }
    const headers = calls[0]?.headers as Record<string, string>;
    assert.equal(headers.Authorization, "Bearer jv_live_test");
  });

  it("jevDecide retries once on 502", async () => {
    let n = 0;
    const fetchImpl = async () => {
      n += 1;
      if (n === 1) {
        return new Response("bad gateway", { status: 502 });
      }
      return new Response(
        JSON.stringify({
          model: "jev-1.13.0",
          answers: { ok: { type: "noul", noul: 1 } },
        }),
        { status: 200 },
      );
    };

    const result = await jevDecide(
      "x",
      { ok: { type: "noul", instructions: "?" } },
      { apiKey: "k", fetchImpl },
    );
    assert.equal(n, 2);
    assert.equal(result.ok, true);
  });

  it("resolveJevConfig reads env defaults", () => {
    const cfg = resolveJevConfig({
      JEV_API_KEY: "a",
      JEV_MODEL: "jev-1.13.0",
    });
    assert.equal(cfg.apiKey, "a");
    assert.equal(cfg.model, "jev-1.13.0");
  });
});
