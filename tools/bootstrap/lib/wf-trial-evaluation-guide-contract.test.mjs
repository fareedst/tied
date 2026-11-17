/**
 * [REQ-WF_TRIAL_EVALUATION_GUIDE] [IMPL-WF_TRIAL_EVALUATION_GUIDE]
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import {
  AHE_WORKFLOW_TRIALS_GUIDE_REL,
  resolveAhePaths,
} from "./agent-harness-eval-docs-paths.mjs";
import { TIED_REPO_ROOT } from "./constants.mjs";

const REQUIRED_H2 = [
  "Overview",
  "What a workflow trial is and is not",
  "How a run is conducted",
  "What facilitators analyze",
  "How grading works",
  "Cohort summaries available now",
  "End-to-end flow",
  "How to explore this corpus",
  "Reddit post skeleton",
];

const LINK_ALLOWLIST = [
  "docs/agent-harness-evaluation/catalogs/catalog-traditional-workflow-trial-prompts.md",
  "docs/agent-harness-evaluation/registries/traditional-workflow-trial-runs-registry.md",
  "docs/agent-harness-evaluation/cohort/comparison-table.md",
  "docs/agent-harness-evaluation/readouts/trial-readout-PROMPT-WF-09-claudehaiku55low-1794880253-wf-agentstream-wf-09-claude-claudehaiku55low.md",
  "tools/bundled-record-wf-trial-skill/reference.md",
];

/** @param {string} body */
function extractMarkdownLinks(body) {
  const links = [];
  const re = /\]\(([^)#]+)(?:#[^)]+)?\)/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    const href = m[1].trim();
    if (!href.startsWith("http")) links.push(href.replace(/^\.\.\//, "").replace(/^\.\//, ""));
  }
  return links;
}

describe("workflow trials evaluation guide [REQ-WF_TRIAL_EVALUATION_GUIDE]", () => {
  const guidePath = path.join(TIED_REPO_ROOT, AHE_WORKFLOW_TRIALS_GUIDE_REL);
  const ahe = resolveAhePaths(TIED_REPO_ROOT);

  it("SC-WF-EG-01 guide exists at AHE_WORKFLOW_TRIALS_GUIDE_REL", () => {
    assert.equal(
      AHE_WORKFLOW_TRIALS_GUIDE_REL,
      "docs/agent-harness-evaluation/workflow-trials-guide.md",
    );
    assert.ok(fs.existsSync(guidePath), guidePath);
    assert.equal(ahe.workflowTrialsGuide, guidePath);
  });

  it("SC-WF-EG-02 required H2 sections present", () => {
    const body = fs.readFileSync(guidePath, "utf8");
    for (const title of REQUIRED_H2) {
      assert.match(body, new RegExp(`^## ${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "m"));
    }
  });

  it("SC-WF-EG-03 guardrails and HMEP boundary", () => {
    const body = fs.readFileSync(guidePath, "utf8");
    assert.match(body, /not a leaderboard|not leaderboard/i);
    assert.match(body, /maturity_score/i);
    assert.match(body, /forbidden|do not/i);
    assert.match(body, /HMEP|harness-eval/i);
    assert.match(body, /session grading|@record-wf-trial/i);
  });

  it("SC-WF-EG-04 allowlisted internal links resolve", () => {
    const body = fs.readFileSync(guidePath, "utf8");
    const found = extractMarkdownLinks(body);
    for (const rel of LINK_ALLOWLIST) {
      const normalized = rel.replace(/^\.\.\/\.\.\//, "").replace(/^\.\.\//, "");
      const abs = path.join(TIED_REPO_ROOT, normalized);
      assert.ok(fs.existsSync(abs), `allowlist target missing: ${normalized}`);
      const hit = found.some((l) => l.endsWith(path.basename(normalized)) || l.includes(normalized));
      assert.ok(hit, `guide should link to ${normalized}`);
    }
  });

  it("SC-WF-EG-05 AHE README links workflow-trials-guide", () => {
    const readme = fs.readFileSync(ahe.readme, "utf8");
    assert.match(readme, /workflow-trials-guide\.md/);
  });
});