// [IMPL-TIED_ADVERSARIAL_INQUIRY_CHECKLIST] [ARCH-TIED_ADVERSARIAL_INQUIRY] [REQ-TIED_ADVERSARIAL_INQUIRY]
// How: F4/B14 — adversarial task bullets in canonical checklist YAML and Markdown share marker parity per Part B0 + B slugs.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import yaml from "js-yaml";

const REPO_ROOT = path.resolve(import.meta.dirname, "../../..");
const CHECKLIST_YAML = path.join(
  REPO_ROOT,
  "tied/docs/agent-req-implementation-checklist.yaml",
);
const CHECKLIST_MD = path.join(
  REPO_ROOT,
  "tied/docs/agent-req-implementation-checklist.md",
);

type ChecklistDoc = {
  steps?: Array<{ slug?: string; tasks?: string[] }>;
};

/** Part B0 + B slug coverage — mirrors tools/agentstream/checklist/checklist_test.go table. */
const ADVERSARIAL_SLUG_MARKERS: Array<{ slug: string; markers: string[] }> = [
  { slug: "translate-sponsor-intent", markers: ["anti-example"] },
  { slug: "impact-discovery", markers: ["obligation inventory"] },
  { slug: "risk-assessment", markers: ["adversarial depth tier"] },
  { slug: "test-strategy", markers: ["independent oracle", "argv-only"] },
  { slug: "composition-integration", markers: ["binding-local adversarial case", "controlled_composition_fault"] },
  { slug: "verification-gate", markers: ["fidelity matrix", "command provenance", "validatestricteligibility"] },
  { slug: "session-bootstrap", markers: ["fidelity-research.md"] },
  { slug: "change-definition", markers: ["falsification"] },
  { slug: "author-requirement", markers: ["counterexample"] },
  { slug: "author-architecture", markers: ["invalid-state"] },
  { slug: "catalog-pseudocode-contracts", markers: ["failure modes", "termination"] },
  { slug: "flag-insufficient-specs", markers: ["finding ledger"] },
  { slug: "flag-contradictory-specs", markers: ["contradiction", "finding ledger"] },
  { slug: "gate-pseudocode-validation", markers: ["sub-adversarial-inquiry-pass"] },
  { slug: "unit-test-red", markers: ["expected failure reason"] },
  { slug: "unit-test-green", markers: ["bidirectional"] },
  { slug: "three-way-alignment-unit", markers: ["bidirectional"] },
  { slug: "traceable-commit", markers: ["evidence provenance", "open finding"] },
  { slug: "persist-citdp-record", markers: ["calibrate_pilot"] },
];

function loadChecklistYaml(): ChecklistDoc {
  return yaml.load(fs.readFileSync(CHECKLIST_YAML, "utf8")) as ChecklistDoc;
}

function yamlTasksForSlug(doc: ChecklistDoc, slug: string): string[] {
  const step = doc.steps?.find((entry) => entry.slug === slug);
  assert.ok(step, `YAML missing step slug ${slug}`);
  return step?.tasks ?? [];
}

function extractMarkdownSection(markdown: string, slug: string): string {
  const patterns = [
    new RegExp(`^## ${slug} \\(${slug}\\):`, "m"),
    new RegExp(`^### ${slug} \\(${slug}\\):`, "m"),
  ];
  let match: RegExpExecArray | null = null;
  for (const pattern of patterns) {
    match = pattern.exec(markdown);
    if (match) {
      break;
    }
  }
  assert.ok(match, `Markdown missing section header for ${slug}`);
  const start = match.index;
  const headerLineEnd = markdown.indexOf("\n", start);
  const bodyStart = headerLineEnd === -1 ? markdown.length : headerLineEnd + 1;
  const rest = markdown.slice(bodyStart);
  const nextSection = rest.search(/^#{2,3} /m);
  const end = nextSection === -1 ? markdown.length : bodyStart + nextSection;
  return markdown.slice(start, end);
}

function containsMarker(haystack: string, marker: string): boolean {
  return haystack.toLowerCase().includes(marker.toLowerCase());
}

function adversarialYamlTasks(tasks: string[], markers: string[]): string[] {
  return tasks.filter((task) => markers.some((marker) => containsMarker(task, marker)));
}

describe("CHECKLIST_YAML_MD_PARITY [REQ-TIED_ADVERSARIAL_INQUIRY]", () => {
  const doc = loadChecklistYaml();
  const markdown = fs.readFileSync(CHECKLIST_MD, "utf8");

  for (const { slug, markers } of ADVERSARIAL_SLUG_MARKERS) {
    it(`Part B0/B slug ${slug} keeps adversarial marker parity between YAML tasks and Markdown mirror`, () => {
      const yamlTasks = yamlTasksForSlug(doc, slug);
      const yamlBody = yamlTasks.join("\n").toLowerCase();
      const mdSection = extractMarkdownSection(markdown, slug).toLowerCase();
      const adversarialTasks = adversarialYamlTasks(yamlTasks, markers);

      assert.ok(
        adversarialTasks.length > 0,
        `${slug}: expected at least one YAML task containing adversarial markers ${markers.join(", ")}`,
      );

      for (const marker of markers) {
        assert.ok(
          containsMarker(yamlBody, marker),
          `${slug}: YAML tasks missing marker ${marker}`,
        );
        assert.ok(
          containsMarker(mdSection, marker),
          `${slug}: Markdown section missing marker ${marker}`,
        );
      }
    });
  }
});
