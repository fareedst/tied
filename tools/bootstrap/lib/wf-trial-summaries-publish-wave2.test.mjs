/**
 * [REQ-WF_TRIAL_SUMMARIES_PUBLISH] SC-WF-PSP-07 SC-WF-PSP-08
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import { TIED_REPO_ROOT } from "./constants.mjs";
import { refreshTraditionalWorkflowTrialRunsRegistry } from "./wf-trial-registry-refresh.mjs";

describe("wf-trial-summaries-publish wave 2", () => {
  it("SC-WF-PSP-07 publish spawn includes unlimited size batch flag", () => {
    const src = fs.readFileSync(
      path.join(TIED_REPO_ROOT, "tools/bootstrap/lib/wf-trial-summaries-publish.mjs"),
      "utf8",
    );
    assert.match(src, /--limit[\s\S]*"0"/);
  });

  it("SC-WF-PSP-08 dry registry sync includes 1795023644", () => {
    const { markdown, registrySync } = refreshTraditionalWorkflowTrialRunsRegistry(
      TIED_REPO_ROOT,
      { write: false },
    );
    assert.ok(
      registrySync.insertedReadouts?.includes(
        "trial-readout-PROMPT-WF-03-grok47low-1795023644-wf-agentstream-wf-03-cursor-grok47low.md",
      ) ||
        markdown.includes("1795023644"),
    );
    assert.match(markdown, /1795023644/);
  });
});