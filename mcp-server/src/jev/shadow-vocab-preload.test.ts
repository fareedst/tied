/**
 * [REQ-TIED_JEV_DECISION_COPROCESSOR] W2 shadow vocab PRELOAD
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";
import { matchKeywordGlossaries } from "./keyword-preload.js";
import { parseRoutingTableMarkdown } from "./routing-table.js";
import {
  jevAnswersToGlossaryIds,
  shadowVocabPreloadFromRows,
  summarizeShadowAgreement,
  vocabShadowAgrees,
} from "./shadow-vocab-preload.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROUTING_PATH = path.join(__dirname, "../../../tied/vocab/routing.md");

describe("REQ-TIED_JEV_DECISION_COPROCESSOR W2 shadow routing", () => {
  const routingMd = fs.readFileSync(ROUTING_PATH, "utf8");
  const rows = parseRoutingTableMarkdown(routingMd);

  it("parseRoutingTableMarkdown loads client routing table", () => {
    assert.ok(rows.length > 10);
    assert.ok(rows.some((r) => r.file === "decision-copilot.md"));
  });

  it("matchKeywordGlossaries matches tied agentstream prompt", () => {
    const ids = matchKeywordGlossaries("fix tied agentstream MCP preflight", rows);
    assert.ok(ids.includes("agentstream"));
  });

  it("matchKeywordGlossaries matches adversarial inquiry terms", () => {
    const ids = matchKeywordGlossaries("run adversarial inquiry gate policy", rows);
    assert.ok(ids.includes("fidelity-research"));
  });

  it("jevAnswersToGlossaryIds merges choice and nouls", () => {
    const { glossaries, confidence } = jevAnswersToGlossaryIds(rows, {
      primary_glossary: {
        type: "choice",
        choice: "agentstream",
        confidence: 0.88,
      },
      "also_tied-yaml-mcp": { type: "noul", noul: 0.9 },
      also_agentstream: { type: "noul", noul: 0.2 },
    });
    assert.ok(glossaries.includes("agentstream"));
    assert.ok(glossaries.includes("tied-yaml-mcp"));
    assert.equal(confidence, 0.88);
  });

  it("shadowVocabPreloadFromRows skips Jev without credentials", async () => {
    const log = await shadowVocabPreloadFromRows(
      "tied agentstream batch",
      rows,
      { apiKey: undefined },
    );
    assert.equal(log.jev_skipped, true);
    assert.ok(log.keyword_glossaries.includes("agentstream"));
    assert.deepEqual(log.jev_glossaries, []);
    assert.equal(log.agrees, true);
  });

  it("shadowVocabPreloadFromRows records disagreement when Jev diverges", async () => {
    const fetchImpl = async () =>
      new Response(
        JSON.stringify({
          model: "jev-1.13.0",
          answers: {
            primary_glossary: {
              type: "choice",
              choice: "config-discovery",
              confidence: 0.7,
            },
          },
        }),
        { status: 200 },
      );

    const log = await shadowVocabPreloadFromRows("tied agentstream batch", rows, {
      apiKey: "test",
      fetchImpl,
    });
    assert.ok(log.jev_glossaries.includes("config-discovery"));
    assert.ok(log.keyword_glossaries.includes("agentstream"));
    assert.equal(log.agrees, false);
  });

  it("vocabShadowAgrees treats Jev subset of keyword matches as agreement", () => {
    assert.equal(vocabShadowAgrees(["a", "b"], ["a"]), true);
    assert.equal(vocabShadowAgrees(["a"], ["b"]), false);
  });

  it("summarizeShadowAgreement computes rate on invoked logs", () => {
    const summary = summarizeShadowAgreement([
      { agrees: true, jev_skipped: true } as never,
      {
        agrees: true,
        jev_skipped: false,
        jev_glossaries: ["a"],
      } as never,
      {
        agrees: false,
        jev_skipped: false,
        jev_glossaries: ["b"],
      } as never,
    ]);
    assert.equal(summary.jev_invoked, 2);
    assert.equal(summary.agreement_rate, 0.5);
  });
});
