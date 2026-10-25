// [IMPL-TIED_SPONSOR_TWO_LANE_DELIVERY] [REQ-TIED_SPONSOR_TWO_LANE_DELIVERY] — How: SC-TLD-003 checklist MD/YAML parity (T-TLD-04).
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import {
  containsMarker,
  extractMarkdownSection,
  loadChecklistYaml,
  yamlTasksForSlug,
} from "./checklist-parity-helpers.js";

const REPO_ROOT = path.resolve(import.meta.dirname, "../../..");
const CHECKLIST_YAML = path.join(REPO_ROOT, "tied-bundle/docs/agent-req-implementation-checklist.yaml");
const CHECKLIST_MD = path.join(REPO_ROOT, "tied-bundle/docs/agent-req-implementation-checklist.md");

const TWO_LANE_SLUG_MARKERS: Array<{ slug: string; markers: string[] }> = [
  { slug: "translate-sponsor-intent", markers: ["charter lane"] },
  { slug: "change-definition", markers: ["selection lane", "selection_evidence"] },
  { slug: "risk-assessment", markers: ["sponsor_charter_backlog"] },
  { slug: "verification-gate", markers: ["selection_evidence"] },
  { slug: "sync-tied-stack", markers: ["mid-lane deferral"] },
];

describe("sponsor two-lane checklist parity [REQ-TIED_SPONSOR_TWO_LANE_DELIVERY] SC-TLD-003", () => {
  it("YAML tasks and MD sections share two-lane markers per slug", () => {
    const doc = loadChecklistYaml(CHECKLIST_YAML);
    const markdown = fs.readFileSync(CHECKLIST_MD, "utf8");
    for (const { slug, markers } of TWO_LANE_SLUG_MARKERS) {
      const yamlTasks = yamlTasksForSlug(doc, slug).join("\n");
      const mdSection = extractMarkdownSection(markdown, slug);
      for (const marker of markers) {
        assert.ok(
          containsMarker(yamlTasks, marker) || yamlTasks.toLowerCase().includes(marker.toLowerCase()),
          `YAML ${slug} missing marker ${marker}`,
        );
        assert.ok(containsMarker(mdSection, marker), `Markdown ${slug} missing marker ${marker}`);
      }
    }
  });
});
