/**
 * [REQ-AGENT_HARNESS_EVALUATION_DOCS] Agentstream glossary AHE config link contract (T-AHE-VOCAB-02).
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it } from "node:test";

import {
  AHE_MODEL_CATALOG_REL,
  AHE_MODEL_SPECS_REL,
  AHE_ROOT_REL,
} from "./agent-harness-eval-docs-paths.mjs";

const AHE_FOUR_PHASE_REL = `${AHE_ROOT_REL}/config/traditional-four-phase-agentstream.yaml`;

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const agentstreamPath = path.join(repoRoot, "tied-project", "vocab", "agentstream.md");
const vocabDir = path.dirname(agentstreamPath);

/** Moved WF config files — must not appear under docs/demos in agentstream.md links. */
const STALE_DEMOS_CONFIG =
  /docs\/demos\/(?:traditional-four-phase-agentstream|wf-trial-model-catalog|wf-trial-model-specs)\.yaml/;

/**
 * @param {string} text
 * @returns {string[]}
 */
function markdownLinkTargets(text) {
  const targets = [];
  const re = /\]\(([^)]+)\)/g;
  let match;
  while ((match = re.exec(text)) !== null) {
    targets.push(match[1]);
  }
  return targets;
}

describe("agentstream AHE config vocab links [REQ-AGENT_HARNESS_EVALUATION_DOCS]", () => {
  it("T-AHE-VOCAB-02: no markdown links to moved config under docs/demos", () => {
    const text = fs.readFileSync(agentstreamPath, "utf8");
    for (const target of markdownLinkTargets(text)) {
      assert.doesNotMatch(
        target,
        STALE_DEMOS_CONFIG,
        `stale demos link in agentstream.md: ${target}`,
      );
    }
  });

  it("T-AHE-VOCAB-02b: agentstream records AHE config paths and yaml links resolve on disk", () => {
    const text = fs.readFileSync(agentstreamPath, "utf8");
    for (const rel of [AHE_FOUR_PHASE_REL, AHE_MODEL_CATALOG_REL, AHE_MODEL_SPECS_REL]) {
      assert.match(text, new RegExp(rel.replace(/\//g, "\\/")), `missing prose path ${rel}`);
    }

    const yamlLinks = markdownLinkTargets(text).filter(
      (t) =>
        t.endsWith(".yaml") &&
        (t.includes("traditional-four-phase-agentstream") || t.includes("wf-trial-model-catalog")),
    );
    assert.ok(yamlLinks.length >= 2, `expected >=2 config yaml links, got ${yamlLinks.join(", ")}`);

    for (const rel of yamlLinks) {
      const abs = path.normalize(path.join(vocabDir, rel));
      assert.ok(fs.existsSync(abs), `missing link target ${rel} -> ${abs}`);
      assert.match(rel, /agent-harness-evaluation\/config\//);
    }
  });
});