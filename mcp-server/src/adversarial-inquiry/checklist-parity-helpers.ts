// [IMPL-TIED_SPONSOR_AGENT_RELATIONSHIP] [REQ-TIED_SPONSOR_AGENT_RELATIONSHIP]
import assert from "node:assert/strict";
import fs from "node:fs";
import yaml from "js-yaml";

export type ChecklistStep = { slug?: string; tasks?: string[] };

export type ChecklistDoc = {
  steps?: ChecklistStep[];
  sub_procedures?: ChecklistStep[];
};

export function loadChecklistYaml(checklistYamlPath: string): ChecklistDoc {
  return yaml.load(fs.readFileSync(checklistYamlPath, "utf8")) as ChecklistDoc;
}

export function yamlTasksForSlug(doc: ChecklistDoc, slug: string): string[] {
  const pools = [...(doc.steps ?? []), ...(doc.sub_procedures ?? [])];
  const step = pools.find((entry) => entry.slug === slug);
  assert.ok(step, `YAML missing step slug ${slug}`);
  return step?.tasks ?? [];
}

export function extractMarkdownSection(markdown: string, slug: string): string {
  const patterns = [
    new RegExp(`^## ${slug} \\([^)]+\\):`, "m"),
    new RegExp(`^### ${slug} \\([^)]+\\):`, "m"),
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

export function containsMarker(haystack: string, marker: string): boolean {
  return haystack.toLowerCase().includes(marker.toLowerCase());
}
