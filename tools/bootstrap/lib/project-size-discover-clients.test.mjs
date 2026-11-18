/**
 * [REQ-WF_TRIAL_SUMMARIES_PUBLISH] SC-WF-PSP-07
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import { describe, it } from "node:test";

import { discoverClients } from "./project-size-discover-clients.mjs";

describe("project-size-discover-clients unlimited", () => {
  it("SC-WF-PSP-07 limit 0 returns all eligible candidates", async () => {
    const parent = await fs.promises.mkdtemp(path.join(os.tmpdir(), "discover-unlim-"));
    const reqYaml = path.join("tied-project", "requirements.yaml");
    for (let i = 0; i < 12; i++) {
      const name = `179500000${i}-wf-agentstream-wf-01-cursor-test`;
      const root = path.join(parent, name);
      await mkdir(path.join(root, "tied-project"), { recursive: true });
      await writeFile(path.join(root, reqYaml), "requirements: {}\n", "utf8");
    }

    const capped = await discoverClients({
      parentDir: parent,
      pattern: "wf-agentstream",
      limit: 5,
    });
    assert.equal(capped.targets.length, 5);

    const all = await discoverClients({
      parentDir: parent,
      pattern: "wf-agentstream",
      limit: 0,
    });
    assert.equal(all.targets.length, 12);
  });
});