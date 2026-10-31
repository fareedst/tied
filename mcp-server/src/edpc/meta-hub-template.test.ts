// [IMPL-TIED_EDPC_META_HUB_METHODOLOGY] [REQ-TIED_EDPC_META_HUB_ENGAGEMENT]
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
const REPO_ROOT = path.resolve(import.meta.dirname, "../../..");

const TEMPLATE_REL =
  "tied-bundle/templates/edpc-meta-hub-engagement-charter.v1.example.yaml";
const GUIDE_REL = "tied-bundle/docs/edpc-meta-hub-engagement.md";
const EDPC_MAIN_REL = "tied-bundle/docs/EDPC_Methodology_and_Workflows.md";

describe("EDPC meta-hub methodology surface [REQ-TIED_EDPC_META_HUB_ENGAGEMENT]", () => {
  it("charter template requires meta_hub hub_path and tied-project in bounded_path", () => {
    const raw = fs.readFileSync(path.join(REPO_ROOT, TEMPLATE_REL), "utf8");
    assert.match(raw, /schema_version:\s*["']?engagement-charter\.v1/);
    assert.match(raw, /engagement_pattern:\s*["']?meta_hub/);
    assert.match(raw, /hub_path:\s*["']?tied-project\/?["']?/);
    assert.match(raw, /bounded_path:.*tied-project/);
    assert.match(raw, /workflows_planned:/);
  });

  it("methodology guide and EDPC main doc pointer exist", () => {
    const guide = fs.readFileSync(path.join(REPO_ROOT, GUIDE_REL), "utf8");
    assert.ok(guide.includes("PROC-EDPC_COMPREHENSION"));
    assert.ok(guide.includes("engagement_pattern: meta_hub"));
    const main = fs.readFileSync(path.join(REPO_ROOT, EDPC_MAIN_REL), "utf8");
    assert.ok(main.includes("edpc-meta-hub-engagement.md"));
  });
});
