/**
 * [REQ-WF_TRIAL_SUMMARIES_PUBLISH] SC-WF-PSP-04 SC-WF-PSP-05
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import { TIED_REPO_ROOT } from "./constants.mjs";
import { extractCatalogReadoutLinks } from "./wf-trial-catalog-readout-links.mjs";
import {
  parseMasterRow,
  recomputeLatestForCell,
} from "./wf-trial-registry-refresh.mjs";
import { scrapeReadoutForRegistryRow } from "./wf-trial-readout-registry-fields.mjs";
import { meanCompactGrades, normalizeBand, parseSessionGradingTable } from "./read-trial-readout-session-grading.mjs";

describe("wf-trial-registry-refresh", () => {
  it("SC-WF-PSP-05 meanCompactGrades matches readout session grading", () => {
    const sample = path.join(
      TIED_REPO_ROOT,
      "docs/agent-harness-evaluation/readouts/trial-readout-PROMPT-WF-01-claudeopus55low-1794587975-wf-agentstream-wf-01-claude-claudeopus55low.md",
    );
    const md = fs.readFileSync(sample, "utf8");
    const fields = scrapeReadoutForRegistryRow(
      md,
      path.basename(sample),
    );
    const { rows } = parseSessionGradingTable(md);
    const compact = rows.map((r) => normalizeBand(r.band)).join("/");
    const { display } = meanCompactGrades(compact);
    assert.equal(fields.gradesDisplay, display);
    assert.match(fields.gradesDisplay, /^\d+\.\d+ ·/);
  });

  it("SC-WF-PSP-04 catalog extractor finds trial-readout links", () => {
    const catalog = fs.readFileSync(
      path.join(TIED_REPO_ROOT, "docs/agent-harness-evaluation/catalogs/catalog-traditional-workflow-trial-prompts.md"),
      "utf8",
    );
    const links = extractCatalogReadoutLinks(catalog);
    assert.ok(links.length > 50);
    assert.ok(links.some((l) => l.href.includes("trial-readout-PROMPT-WF-01")));
  });

  it("recomputeLatestForCell picks max client id", () => {
    const a = parseMasterRow(
      "| 01 | 100 | cursor | `x` | 0 | 10 | 1.0 · A/A/A/A/A/A/A | no | [readout](a.md) |",
    );
    const b = parseMasterRow(
      "| 01 | 200 | cursor | `x` | 0 | 10 | 1.0 · A/A/A/A/A/A/A | no | [readout](b.md) |",
    );
    assert.ok(a && b);
    recomputeLatestForCell([a, b]);
    assert.equal(a.latest, "no");
    assert.equal(b.latest, "yes");
  });
});
