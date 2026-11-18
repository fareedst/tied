/**
 * [REQ-WF_TRIAL_SUMMARIES_PUBLISH] SC-WF-PSP-04
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { mkdir, cp } from "node:fs/promises";
import { describe, it } from "node:test";

import { syncMasterRowsFromCatalogLinks } from "./wf-trial-registry-author.mjs";
import { parseMasterRow } from "./wf-trial-registry-refresh.mjs";

const FIXTURE = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "../fixtures/wf-trial-summaries-publish",
);

describe("wf-trial-registry-author", () => {
  it("SC-WF-PSP-04 append-only sync inserts missing catalog href", async () => {
    const storeRoot = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "wf-registry-author-"),
    );
    const ahe = path.join(storeRoot, "docs/agent-harness-evaluation");
    await mkdir(path.join(ahe, "catalogs"), { recursive: true });
    await mkdir(path.join(ahe, "readouts"), { recursive: true });
    await cp(
      path.join(FIXTURE, "catalog-snippet.md"),
      path.join(ahe, "catalogs/catalog-traditional-workflow-trial-prompts.md"),
    );
    await cp(
      path.join(FIXTURE, "readout-stub-wf03-grok47low.md"),
      path.join(
        ahe,
        "readouts/trial-readout-PROMPT-WF-03-grok47low-1795023644-wf-agentstream-wf-03-cursor-grok47low.md",
      ),
    );

    const registryMd = await fs.promises.readFile(
      path.join(FIXTURE, "registry-fragment.md"),
      "utf8",
    );
    const out = syncMasterRowsFromCatalogLinks(storeRoot, registryMd);

    assert.equal(out.insertedCount, 1);
    assert.ok(
      out.insertedReadouts.some((r) => r.includes("1795023644")),
    );

    const rows = out.markdown
      .split("\n")
      .map((l) => parseMasterRow(l))
      .filter(Boolean);
    assert.equal(rows.length, 2);
    assert.ok(
      rows.some(
        (r) => r.clientId === "1794000001" && r.readout.includes("1794000001"),
      ),
    );
    assert.ok(
      rows.some(
        (r) => r.clientId === "1795023644" && r.readout.includes("1795023644"),
      ),
    );
  });
});