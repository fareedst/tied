// [IMPL-TIED_SPONSOR_AGENT_RELATIONSHIP] [REQ-TIED_SPONSOR_AGENT_RELATIONSHIP]
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

const RELATIONSHIP_SLUG_MARKERS: Array<{ slug: string; markers: string[] }> = [
  { slug: "translate-sponsor-intent", markers: ["RESOLVE charter", "delegated work envelope"] },
  { slug: "risk-assessment", markers: ["reversible choice", "costly choice", "consequence ladder"] },
  { slug: "flag-contradictory-specs", markers: ["sponsor-vs-TIED disagreement"] },
  { slug: "sub-leap-micro-cycle", markers: ["delegated work envelope"] },
  { slug: "persist-citdp-record", markers: ["hinge field"] },
];

describe("AUDIT_RELATIONSHIP_LAYER_CONTRACT checklist parity [REQ-TIED_SPONSOR_AGENT_RELATIONSHIP]", () => {
  it("YAML tasks and MD sections share relationship markers per slug", () => {
    const doc = loadChecklistYaml(CHECKLIST_YAML);
    const markdown = fs.readFileSync(CHECKLIST_MD, "utf8");
    for (const { slug, markers } of RELATIONSHIP_SLUG_MARKERS) {
      const yamlTasks = yamlTasksForSlug(doc, slug).join("\n");
      const mdSection = extractMarkdownSection(markdown, slug);
      for (const marker of markers) {
        assert.ok(
          containsMarker(yamlTasks, marker) || yamlTasks.toLowerCase().includes(marker.toLowerCase()),
          `YAML ${slug} missing marker ${marker}`,
        );
        assert.ok(
          containsMarker(mdSection, marker),
          `Markdown ${slug} missing marker ${marker}`,
        );
      }
    }
  });
});
