/**
 * [REQ-TIED_EXTERNAL_SERVICE_COMPARISON] SC-ESC-NO-SOURCE-COPY — article capture stub policy.
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const comparisonsDir = path.join(repoRoot, "docs", "comparisons");

const STUB_MARKER =
  /Why this file has no article body|does not reproduce the article body|full article text is \*\*not\*\* stored/i;

/** Article captures that must be stub-only (not repo summaries or sponsor curriculum). */
const ARTICLE_CAPTURE_STUB_REQUIRED = [
  "langchain-improving-deep-agents-harness-engineering.md",
  "traefik-harness-engineering-vs-platform-engineering.md",
  "netflix-ontology-driven-observability.md",
  "cursor-continually-improving-agent-harness.md",
  "google-agent-skills-ship-like-products.md",
  "anthropic-llm-formal-verification-appendix.md",
  "persante-sdd-skills.md",
  "langwatch-rebuilding-langwatch-in-51-days.md",
  "alibaba-open-code-review.md",
  "open-specter-legal-workspace.md",
  "onono-foundation-progressive-ai.md",
  "onono-essence-of-understanding-and-language.md",
  "onono-core-manifesto-autonomous-subject.md",
  "onono-mind-ontology-beyond-ai-memory.md",
  "onono-beyond-the-model-continual-learning.md",
  "onono-scientific-foundations-digital-mind.md",
  "onono-world-models-time-journalistic-research.md",
  "hackernoon-observability-contract-ci.md",
  "afurmanov-harness-profiler.md",
  "langchain-goal-engineering.md",
  "open-governance-cannot-sense.md",
  "veronika-heimsbakk-on-ai-generated-ontologies.md",
  "andras-ludanyi-illusion-of-measurement-judgment-cooperation.md",
  "arun-srinivasan-every-map-has-a-projection.md",
];

const EXEMPT_LINE_BUDGET = new Set([
  "software-engineering-degree.md",
  "system-one-jev-taxonomy-and-opportunities.md",
  "jev-for-tied-improvement.md",
  "onono-research-capture-index.md",
  "open-ontologies-repository.md",
  "morluto-rea-reverse-engineering.md",
  "ndtp-ai-ontology-extension.md",
  "apache-ossie.md",
  "nvidia-auto-ontology.md",
]);

const MAX_STUB_LINES = 130;

describe("comparison capture stub policy [REQ-TIED_EXTERNAL_SERVICE_COMPARISON]", () => {
  for (const name of ARTICLE_CAPTURE_STUB_REQUIRED) {
    it(`${name} has stub marker and stays within line budget`, () => {
      const filePath = path.join(comparisonsDir, name);
      assert.ok(fs.existsSync(filePath), `missing capture: ${filePath}`);
      const text = fs.readFileSync(filePath, "utf8");
      const lines = text.split("\n").length;
      assert.match(
        text,
        STUB_MARKER,
        `${name} must include stub policy marker`,
      );
      assert.ok(
        lines <= MAX_STUB_LINES,
        `${name} exceeds ${MAX_STUB_LINES} lines (${lines}); trim reproduced body`,
      );
      assert.ok(
        !/\bLocal extract\b/i.test(text),
        `${name} must not reference in-repo extract sidecars`,
      );
    });
  }

  it("exempt captures are not subject to stub line budget", () => {
    for (const name of EXEMPT_LINE_BUDGET) {
      const filePath = path.join(comparisonsDir, name);
      if (!fs.existsSync(filePath)) {
        continue;
      }
      assert.ok(EXEMPT_LINE_BUDGET.has(name));
    }
  });
});